"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";


// =========================================================
// SORTABLE ITEM
// =========================================================

function SortableItem({ item, children }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners })}
    </div>
  );
}


// =========================================================
// TYPES
// =========================================================

type SourceItem = {
  key: string;
  name: string;
  type: string;
  courseId?: string;
};

type DemoTab = {
  id: string;
  tab_key: string;
  tab_name: string;
  tab_type: string;
  sort_order: number;
  is_active: boolean;
};


// =========================================================
// COMPONENT
// =========================================================

export default function DemoMaster() {

  const [courses, setCourses] = useState<any[]>([]);
  const [demoTabs, setDemoTabs] = useState<DemoTab[]>([]);

  const [selectedItem, setSelectedItem] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);


  // =======================================================
  // EXISTING MASTER ITEMS
  // =======================================================

  const masterItems: SourceItem[] = [
    {
      key: "board",
      name: "Board",
      type: "board",
    },
    {
      key: "images",
      name: "Images",
      type: "images",
    },
    {
      key: "videos",
      name: "Videos",
      type: "videos",
    },
    {
      key: "grammar_tables",
      name: "Grammar Tables",
      type: "grammar_tables",
    },
    {
      key: "image_topics",
      name: "Image Topics",
      type: "image_topics",
    },
    {
      key: "reaction_memes",
      name: "Reaction Memes",
      type: "reaction_memes",
    },
  ];


  // =======================================================
  // FETCH COURSES
  // =======================================================

  const fetchCourses = async () => {

    const { data, error } = await supabase
      .from("english_courses")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Courses fetch failed:", error);
      alert("Courses fetch failed: " + error.message);
      return;
    }

    setCourses(data || []);
  };


  // =======================================================
  // FETCH DEMO TABS
  // =======================================================

  const fetchDemoTabs = async () => {

    const { data, error } = await supabase
      .from("demo_tabs")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error("Demo tabs fetch failed:", error);
      alert("Demo tabs fetch failed: " + error.message);
      return;
    }

    setDemoTabs(data || []);
  };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchCourses();
    fetchDemoTabs();
  }, []);


  // =======================================================
  // DROPDOWN OPTIONS
  // =======================================================

  const dropdownItems = useMemo(() => {

    const items: SourceItem[] = [...masterItems];

    courses.forEach((course) => {

      items.push({
        key: `course:${course.id}`,
        name: course.name,
        type: "course",
        courseId: course.id,
      });

    });

    return items;

  }, [courses]);


  // =======================================================
  // ADD TAB
  // =======================================================

  const addTab = async () => {

    if (!selectedItem) return;

    const source = dropdownItems.find(
      item => item.key === selectedItem
    );

    if (!source) return;


    // Already added?
    const alreadyExists = demoTabs.some(
      tab => tab.tab_key === source.key
    );

    if (alreadyExists) {
      alert("This item is already added.");
      return;
    }


    setLoading(true);


    const maxOrder =
      demoTabs.length > 0
        ? Math.max(
            ...demoTabs.map(
              tab => Number(tab.sort_order) || 0
            )
          )
        : 0;


    const { data, error } = await supabase
      .from("demo_tabs")
      .insert([
        {
          tab_key: source.key,
          tab_name: source.name,
          tab_type: source.type,
          sort_order: maxOrder + 1,
          is_active: true,
        },
      ])
      .select()
      .single();


    if (error) {

      console.error("Demo tab add failed:", error);

      alert(
        "Demo tab add failed: " + error.message
      );

      setLoading(false);
      return;
    }


    if (data) {

      setDemoTabs(prev => [
        ...prev,
        data,
      ]);

    }


    setSelectedItem("");
    setLoading(false);
  };


  // =======================================================
  // DELETE TAB
  // =======================================================

  const deleteTab = async (id: string) => {

    const confirmed = window.confirm(
      "Delete this Demo Tab?"
    );

    if (!confirmed) return;


    const { error } = await supabase
      .from("demo_tabs")
      .delete()
      .eq("id", id);


    if (error) {

      alert(
        "Delete failed: " + error.message
      );

      return;
    }


    setDemoTabs(prev =>
      prev.filter(tab => tab.id !== id)
    );

  };


  // =======================================================
  // TOGGLE ACTIVE
  // =======================================================

  const toggleActive = async (
    id: string,
    currentValue: boolean
  ) => {

    const { error } = await supabase
      .from("demo_tabs")
      .update({
        is_active: !currentValue,
      })
      .eq("id", id);


    if (error) {

      alert(
        "Status update failed: " +
        error.message
      );

      return;
    }


    setDemoTabs(prev =>
      prev.map(tab =>
        tab.id === id
          ? {
              ...tab,
              is_active: !currentValue,
            }
          : tab
      )
    );

  };


  // =======================================================
  // DRAG & DROP
  // =======================================================

  const handleDragEnd = (event: any) => {

    const {
      active,
      over,
    } = event;


    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }


    const oldIndex = demoTabs.findIndex(
      tab => tab.id === active.id
    );

    const newIndex = demoTabs.findIndex(
      tab => tab.id === over.id
    );


    setDemoTabs(
      arrayMove(
        demoTabs,
        oldIndex,
        newIndex
      )
    );

  };


  // =======================================================
  // SAVE ORDER
  // =======================================================

  const saveOrder = async () => {

    setSavingOrder(true);


    for (
      let i = 0;
      i < demoTabs.length;
      i++
    ) {

      await supabase
        .from("demo_tabs")
        .update({
          sort_order: i + 1,
        })
        .eq(
          "id",
          demoTabs[i].id
        );

    }


    setDemoTabs(prev =>
      prev.map((tab, index) => ({
        ...tab,
        sort_order: index + 1,
      }))
    );


    setSavingOrder(false);

  };


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="h-full overflow-hidden">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="sticky top-0 bg-white z-20 p-3 border-b flex flex-wrap gap-2 items-center">

        <select
          value={selectedItem}
          onChange={(e) =>
            setSelectedItem(e.target.value)
          }
          className="border px-3 py-2 rounded min-w-[280px]"
        >

          <option value="">
            Select Demo Tab
          </option>


          {/* EXISTING FEATURES */}

          <optgroup label="Existing Features">

            {masterItems.map(item => (

              <option
                key={item.key}
                value={item.key}
              >
                {item.name}
              </option>

            ))}

          </optgroup>


          {/* EXISTING COURSES */}

          <optgroup label="Courses">

            {courses.map(course => (

              <option
                key={course.id}
                value={`course:${course.id}`}
              >
                {course.name}
              </option>

            ))}

          </optgroup>

        </select>


        <button
          onClick={addTab}
          disabled={
            !selectedItem ||
            loading
          }
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-40"
        >
          {loading ? "Adding..." : "Add"}
        </button>


        <button
          onClick={saveOrder}
          disabled={savingOrder}
          className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-40"
        >
          {savingOrder
            ? "Saving..."
            : "Save Order"}
        </button>

      </div>


      {/* =================================================
          INFO
      ================================================= */}

      <div className="px-3 pt-3 text-sm text-gray-500">

        Select existing features or courses and add
        them to the Demo.

      </div>


      {/* =================================================
          LIST
      ================================================= */}

      <div className="p-3 overflow-y-auto h-[calc(100vh-150px)]">

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >

          <SortableContext
            items={demoTabs.map(
              tab => tab.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >

            <div className="space-y-2">

              {demoTabs.map(
                (tab, index) => (

                  <SortableItem
                    key={tab.id}
                    item={tab}
                  >

                    {({
                      attributes,
                      listeners,
                    }: any) => (

                      <div className="flex items-center gap-3 border p-3 rounded-lg bg-white shadow-sm">

                        {/* DRAG */}

                        <div
                          {...attributes}
                          {...listeners}
                          className="cursor-move text-gray-500 px-1"
                          title="Drag"
                        >
                          ☰
                        </div>


                        {/* ORDER */}

                        <div className="w-8 text-gray-500">
                          {index + 1}
                        </div>


                        {/* NAME */}

                        <div className="flex-1">

                          <div className="font-medium">
                            {tab.tab_name}
                          </div>

                          <div className="text-xs text-gray-400">
                            {tab.tab_type}
                          </div>

                        </div>


                        {/* ACTIVE */}

                        <button
                          onClick={() =>
                            toggleActive(
                              tab.id,
                              tab.is_active
                            )
                          }
                          className={
                            tab.is_active
                              ? "bg-green-600 text-white px-3 py-1 rounded"
                              : "bg-gray-300 text-gray-700 px-3 py-1 rounded"
                          }
                        >
                          {tab.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>


                        {/* DELETE */}

                        <button
                          onClick={() =>
                            deleteTab(tab.id)
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>

                      </div>

                    )}

                  </SortableItem>

                )
              )}

            </div>

          </SortableContext>

        </DndContext>

      </div>

    </div>

  );

}
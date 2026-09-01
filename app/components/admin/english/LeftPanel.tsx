"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeftPanel({
  courses,
  days,
  topics,
  selectedCourse,
  selectedDays,
  selectedTopics,
  setSelectedCourse,
  setSelectedDays,
  setSelectedTopics,
  selectedGrammarTableId,
  setSelectedGrammarTableId,
  selectedImageId,
  setSelectedImageId,
  refreshData
}: any) {

  const [menu, setMenu] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTopicData, setSelectedTopicData] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [showGrammarTables, setShowGrammarTables] = useState(false);

  const [grammarTopics, setGrammarTopics] =
    useState<any[]>([]);
  const [expandedGrammarTopics, setExpandedGrammarTopics] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [showImages, setShowImages] = useState(false);

  const [imageTopics, setImageTopics] =
    useState<any[]>([]);

  const [expandedImageTopics, setExpandedImageTopics] =
    useState<string[]>([]);


  // =========================================================
  // LOAD IMAGE TOPICS + IMAGES
  // =========================================================

  const fetchImageTopics = async () => {

    const { data: topicsData, error: topicsError } =
      await supabase
        .from("image_topics")
        .select("*")
        .order("sort_order", {
          ascending: true
        })
        .order("created_at", {
          ascending: true
        });

    if (topicsError) {

      console.error(
        "IMAGE TOPICS ERROR:",
        topicsError.message
      );

      return;

    }


    const { data: imagesData, error: imagesError } =
      await supabase
        .from("images")
        .select(
          "id, name, topic_id, file_path, sort_order, created_at"
        )
        .order("sort_order", {
          ascending: true
        })
        .order("created_at", {
          ascending: true
        });


    if (imagesError) {

      console.error(
        "IMAGES ERROR:",
        imagesError.message
      );

      return;

    }


    const finalTopics =
      (topicsData || []).map(
        (topic: any) => ({

          ...topic,

          images: (imagesData || [])
            .filter(
              (image: any) =>
                image.topic_id === topic.id
            )
            .sort(
              (a: any, b: any) => {

                if (
                  (a.sort_order ?? 0) !==
                  (b.sort_order ?? 0)
                ) {

                  return (
                    (a.sort_order ?? 0) -
                    (b.sort_order ?? 0)
                  );

                }

                return (
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
                );

              }
            )

        })
      );


    setImageTopics(finalTopics);

  };
  // =========================================================
  // TOGGLE IMAGE TOPIC
  // =========================================================

  const toggleImageTopic = (id: string) => {
    setExpandedImageTopics(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };
  // =========================================================
  // AUTO SCROLL TO SELECTED IMAGE
  // =========================================================

  useEffect(() => {

    if (!selectedImageId) return;

    const timer = setTimeout(() => {

      const element = document.getElementById(
        `image-item-${selectedImageId}`
      );

      if (!element) return;

      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

    return () => clearTimeout(timer);

  }, [selectedImageId]);
  const toggleGrammarTopic = (id: string) => {

    setExpandedGrammarTopics(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );

  };


  const toggleDay = (id: string) => {

  const dayTopicIds = topics
    .filter(
      (topic: any) => topic.day_id === id
    )
    .map(
      (topic: any) => topic.id
    );

  const allTopicsSelected =
    dayTopicIds.length > 0 &&
    dayTopicIds.every(
      (topicId: string) =>
        selectedTopics.includes(topicId)
    );

  // Day checked / all topics selected
  // → सब uncheck करें
  if (allTopicsSelected) {

    setSelectedDays((prev: string[]) =>
      prev.filter(
        (dayId: string) => dayId !== id
      )
    );

    setSelectedTopics((prev: string[]) =>
      prev.filter(
        (topicId: string) =>
          !dayTopicIds.includes(topicId)
      )
    );

    return;
  }

  // Day unchecked / सभी topics select करें
  setSelectedDays((prev: string[]) => [
    ...new Set([
      ...prev,
      id
    ])
  ]);

  setSelectedTopics((prev: string[]) => [
    ...new Set([
      ...prev,
      ...dayTopicIds
    ])
  ]);
};
  const toggleTopic = (id: string) => {
    setSelectedTopics((prev: string[]) => {

      if (prev.includes(id)) {
        return prev.filter(
          (topicId: string) => topicId !== id
        );
      }

      return [...prev, id];
    });
  };

  // 🔥 RIGHT CLICK
  const handleRightClick = (e: any, topic: any) => {
    e.preventDefault();
    setMenu({
      x: e.clientX,
      y: e.clientY,
      topic
    });
  };

  // 🔥 EDIT CLICK
  const handleEdit = async () => {

    const topic = menu.topic;
    setSelectedTopicData(topic);
    setShowPopup(true);

    const { data } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("topic_id", topic.id)
      .order("order_no");

    if (data) {
      const text = data
        .map((d: any) => `${d.hindi} - ${d.english}`)
        .join("\n");

      setEditText(text);
    }

    setMenu(null);
  };
  const fetchGrammarTopics = async () => {

    const { data: topicsData, error: topicsError } =
      await supabase
        .from("grammar_topics")
        .select("*")
        .order("sort_order", { ascending: true });

    if (topicsError) {
      console.error(
        "GRAMMAR TOPICS ERROR:",
        topicsError.message
      );
      return;
    }

    const { data: tablesData, error: tablesError } =
      await supabase
        .from("grammar_tables")
        .select("id, name, topic_id, created_at")
        .order("created_at", { ascending: true });

    if (tablesError) {
      console.error(
        "GRAMMAR TABLES ERROR:",
        tablesError.message
      );
      return;
    }

    if (topicsData) {

      const sortedTopics = [...topicsData]
        .sort((a, b) => {

          const numA = parseInt(
            a.name?.match(/\d+/)?.[0] || "9999"
          );

          const numB = parseInt(
            b.name?.match(/\d+/)?.[0] || "9999"
          );

          return numA - numB;

        })
        .map((topic: any) => ({

          ...topic,

          grammar_tables: (tablesData || [])
            .filter(
              (table: any) =>
                table.topic_id === topic.id
            )

        }));

      setGrammarTopics(sortedTopics);

    }

  };
  const handleGrammarTableEdit = () => {

    const table = menu?.grammarTable;

    if (!table) return;

    window.location.href =
      `/admin/masters?editTable=${table.id}`;

    setMenu(null);
  };
  // 🔥 SAVE
  const handleSave = async () => {

    const lines = editText.split("\n").map(l => l.trim()).filter(l => l);

    await supabase
      .from("vocabulary")
      .delete()
      .eq("topic_id", selectedTopicData.id);

    const newData = lines.map((line, i) => {
      const parts = line.split("-");

      return {
        topic_id: selectedTopicData.id,
        hindi: parts[0]?.trim() || "",
        english: parts.slice(1).join("-").trim() || "",
        order_no: i + 1
      };
    });

    await supabase
      .from("vocabulary")
      .insert(newData);

    setShowPopup(false);
    if (refreshData) {
      await refreshData();
    }
  };

  // 🔥 CLOSE MENU
  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);
  useEffect(() => {

    fetchGrammarTopics();

  }, []);
  useEffect(() => {

    fetchImageTopics();

  }, []);
  useEffect(() => {

    const handleKey = (e: KeyboardEvent) => {

      // ESC → Cancel
      if (e.key === "Escape") {
        setShowPopup(false);
      }

      // Ctrl + S → Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (showPopup) {
          handleSave();
        }
      }

    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };

  }, [showPopup, editText]);
  return (

    <div className="w-[270px] bg-white border-r flex flex-col relative">

      {/* COURSE SELECT */}
      {/* =======================
    IMAGES
======================= */}

      <div
        className={`flex flex-col min-h-0 ${showImages ? "h-1/3" : "shrink-0"
          }`}
      >

        <button
          onClick={() =>
            setShowImages(prev => !prev)
          }
          className="w-full flex justify-between items-center px-3 py-1.5 bg-blue-100 text-[13px] font-semibold"
        >

          <span>Images</span>

          <span>
            {showImages ? "−" : "+"}
          </span>

        </button>


        {showImages && (

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-3">

            <div className="flex flex-col">

              {imageTopics.map((topic: any) => (

                <div
                  key={topic.id}
                  className="w-full shrink-0 mb-1"
                >

                  {/* IMAGE TOPIC */}
                  <div
                    onClick={() => toggleImageTopic(topic.id)}
                    className="w-full flex justify-between items-center py-1 text-[13px] cursor-pointer"
                  >

                    <span className="truncate">
                      {topic.name}
                    </span>

                    <span className="shrink-0 ml-2">
                      {expandedImageTopics.includes(topic.id)
                        ? "−"
                        : "+"
                      }
                    </span>

                  </div>

                  {/* IMAGES */}
                  {expandedImageTopics.includes(topic.id) && (

                    <div className="ml-4 mt-0.5 flex flex-col gap-0">

                      {topic.images?.map((image: any) => (

                        <label
                          key={image.id}
                          id={`image-item-${image.id}`}
                          className={`flex items-center gap-2 w-full text-[13px] cursor-pointer px-1 py-1 rounded ${selectedImageId === image.id
                            ? "bg-blue-100 text-blue-700 font-semibold"
                            : "hover:bg-gray-100"
                            }`}
                        >

                          <input
                            type="radio"
                            className="w-3.5 h-3.5 shrink-0"
                            name="selectedImage"
                            value={image.id}
                            checked={selectedImageId === image.id}
                            onChange={() =>
                              setSelectedImageId(image.id)
                            }
                          />

                          <span className="truncate min-w-0">
                            {image.name}
                          </span>

                        </label>

                      ))}

                    </div>

                  )}

                </div>

              ))}

            </div>

          </div>

        )}

      </div>
      {/* =======================
    GRAMMAR TABLES
======================= */}

      <div
        className={`flex flex-col min-h-0 ${showGrammarTables ? "h-1/3" : "shrink-0"
          }`}
      >

        <button
          onClick={() => setShowGrammarTables(prev => !prev)}
          className="w-full flex justify-between items-center px-3 py-1.5 bg-amber-100 text-[13px] font-semibold"
        >
          <span>Grammar Tables</span>

          <span>
            {showGrammarTables ? "−" : "+"}
          </span>
        </button>
        {showGrammarTables && (

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-3">

            {grammarTopics.map((topic: any) => (

              <div key={topic.id} className="mb-1">

                <div
                  onClick={() => toggleGrammarTopic(topic.id)}
                  className="w-full flex justify-between items-center py-1 text-[13px] cursor-pointer"
                >
                  <>
                    <span>{topic.name}</span>

                    <span>
                      {expandedGrammarTopics.includes(topic.id) ? "−" : "+"}
                    </span>
                  </>
                </div>

                {expandedGrammarTopics.includes(topic.id) && (

                  <div className="ml-4 mt-1 space-y-1">

                    {topic.grammar_tables?.map((table: any) => (

                      <label
                        key={table.id}
                        onContextMenu={(e) => {
                          e.preventDefault();

                          setMenu({
                            x: e.clientX,
                            y: e.clientY,
                            grammarTable: table
                          });
                        }}
                        className="flex items-center gap-2 text-[13px]"
                      >
                        <input
                          type="radio"
                          className="w-3.5 h-3.5"
                          name="grammarTable"
                          value={table.id}
                          checked={selectedGrammarTableId === table.id}
                          onChange={() => setSelectedGrammarTableId(table.id)}
                        />

                        <span>{table.name}</span>

                      </label>

                    ))}

                  </div>

                )}

              </div>

            ))}

          </div>

        )}


      </div>
      <div className="p-3 shrink-0 bg-white">

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border px-2 py-1.5 rounded w-full text-[13px]"
        >
          <option value="">Select Course</option>

          {courses.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      {/* DAYS + TOPICS */}
      {selectedCourse && (
        <>
          {/* DAYS + TOPICS */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-3">

            <div className="flex flex-col">

              {days.map((d: any) => {

                const dayTopics = topics.filter(
                  (t: any) => t.day_id === d.id
                );

                const dayTopicIds = dayTopics.map(
                  (topic: any) => topic.id
                );

                const isSelected =
                  dayTopicIds.length > 0 &&
                  dayTopicIds.every(
                    (topicId: string) =>
                      selectedTopics.includes(topicId)
                  );
                const isDayExpanded =
                  expandedDays.includes(d.id);
                const hasTopics = dayTopics.length > 0;

                return (
                  <div
                    key={d.id}
                    className="flex flex-col w-full"
                  >

                    {/* DAY ROW */}
                    <div
                      className={`flex shrink-0 items-center justify-between w-full py-1 px-1 text-[13px] cursor-pointer hover:bg-gray-100 ${isSelected
                        ? "text-blue-700"
                        : "text-gray-800"
                        }`}
                      onClick={() => {
                        if (hasTopics) {
                          setExpandedDays((prev: string[]) =>
                            prev.includes(d.id)
                              ? prev.filter(dayId => dayId !== d.id)
                              : [...prev, d.id]
                          );
                        }
                      }}
                    >


                      <div className="flex items-center gap-2 min-w-0">

                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 shrink-0"
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleDay(d.id)}
                        />

                        <span className="truncate">
                          {String(d.day_number).padStart(2, "0")}
                          {d.title ? ` · ${d.title}` : ""}
                        </span>

                      </div>

                      {hasTopics && (
                        <span className="font-bold text-[13px] shrink-0">
                          {isSelected ? "−" : "+"}
                        </span>
                      )}
                    </div>

                    {/* TOPICS */}
                    {isDayExpanded && hasTopics && (

                      <div className="flex flex-col ml-4 gap-1 pb-1">

                        {dayTopics.map((t: any) => {

                          const count =
                            t.vocabulary?.[0]?.count || 0;

                          const isTopicSelected =
                            selectedTopics.includes(t.id);

                          return (
                            <label
                              key={t.id}
                              onContextMenu={(e) =>
                                handleRightClick(e, t)
                              }
                              className={`flex shrink-0 items-center justify-between w-full px-2 py-1 rounded text-[13px] cursor-pointer ${isTopicSelected
                                ? "bg-green-600 text-white"
                                : "bg-gray-100"
                                }`}
                            >

                              <div className="flex items-center gap-2 min-w-0">

                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 shrink-0"
                                  checked={isTopicSelected}
                                  onChange={() =>
                                    toggleTopic(t.id)
                                  }
                                />

                                <span className="truncate">
                                  {t.topic_name}
                                </span>

                              </div>

                              {count > 0 && (
                                <span className="text-xs shrink-0 ml-2">
                                  ({count})
                                </span>
                              )}

                            </label>
                          );

                        })}

                      </div>

                    )}

                  </div>
                );

              })}

            </div>

          </div>
        </>
      )}

      {/* RIGHT CLICK MENU */}

      {/* RIGHT CLICK MENU */}
      {menu && (
        <div
          className="fixed bg-white border shadow rounded text-sm z-50"
          style={{ top: menu.y, left: menu.x }}
        >
          <div
            onClick={
              menu.grammarTable
                ? handleGrammarTableEdit
                : handleEdit
            }
            className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          >
            Edit
          </div>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">

          <div
            className="bg-white rounded shadow-xl flex flex-col"
            style={{ width: "80vw", height: "80vh", maxWidth: "1200px" }}
          >

            {/* HEADER */}
            <div className="p-4 border-b text-lg font-bold">
              Edit: {selectedTopicData?.topic_name}
            </div>

            {/* BODY */}
            <div style={{ flex: 1, padding: "10px" }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: "18px",
                  lineHeight: "1.6",
                  padding: "10px",
                  border: "1px solid #ccc",
                  resize: "none"
                }}
              />
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-2 p-3 border-t">
              <button
                onClick={() => setShowPopup(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
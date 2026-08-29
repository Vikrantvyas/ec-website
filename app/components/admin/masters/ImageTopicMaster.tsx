"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function ImageTopicMaster({
  onOpenImages
}: {
  onOpenImages: (topicId: string) => void;
}) {

  const [topics, setTopics] = useState<any[]>([]);

  const [topicName, setTopicName] = useState("");

  const [sortOrder, setSortOrder] = useState("");

  const [editingTopicId, setEditingTopicId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);


  // =========================================================
  // LOAD TOPICS
  // =========================================================

  const loadTopics = async () => {

    const { data, error } = await supabase
      .from("image_topics")
      .select("*")
      .order("sort_order", {
        ascending: true
      })
      .order("created_at", {
        ascending: true
      });

    if (error) {

      console.error(
        "IMAGE TOPICS LOAD ERROR:",
        error
      );

      return;

    }

    setTopics(data || []);

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadTopics();

  }, []);


  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {

    setTopicName("");

    setSortOrder("");

    setEditingTopicId(null);

  };


  // =========================================================
  // SAVE / UPDATE TOPIC
  // =========================================================

  const handleSave = async () => {

    const name = topicName.trim();

    if (!name) {

      alert("Please enter Image Topic name.");

      return;

    }

    setLoading(true);


    const finalSortOrder =
      sortOrder.trim() === ""
        ? topics.length + 1
        : Number(sortOrder);


    if (
      sortOrder.trim() !== "" &&
      (
        Number.isNaN(finalSortOrder) ||
        finalSortOrder < 0
      )
    ) {

      alert("Please enter a valid Sort Order.");

      setLoading(false);

      return;

    }


    // =======================================================
    // UPDATE
    // =======================================================

    if (editingTopicId) {

      const { error } = await supabase
        .from("image_topics")
        .update({
          name,
          sort_order: finalSortOrder
        })
        .eq("id", editingTopicId);


      if (error) {

        console.error(
          "IMAGE TOPIC UPDATE ERROR:",
          error
        );

        alert(
          error.message ||
          "Unable to update Image Topic."
        );

        setLoading(false);

        return;

      }


      clearForm();

      await loadTopics();

      setLoading(false);

      return;

    }


    // =======================================================
    // INSERT
    // =======================================================

    const { error } = await supabase
      .from("image_topics")
      .insert({
        name,
        sort_order: finalSortOrder
      });


    if (error) {

      console.error(
        "IMAGE TOPIC INSERT ERROR:",
        error
      );

      alert(
        error.message ||
        "Unable to save Image Topic."
      );

      setLoading(false);

      return;

    }


    clearForm();

    await loadTopics();

    setLoading(false);

  };
  // =========================================================
  // BULK ADD TOPICS
  // =========================================================

  const handleBulkSave = async () => {
    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (lines.length === 0) {
      alert("Please enter at least one Image Topic.");
      return;
    }

    setLoading(true);

    try {
      // Current maximum sort order
      const maxSortOrder =
        topics.length > 0
          ? Math.max(
              ...topics.map((topic: any) =>
                Number(topic.sort_order) || 0
              )
            )
          : 0;

      const insertData = lines.map((name, index) => ({
        name,
        sort_order: maxSortOrder + index + 1
      }));

      const { error } = await supabase
        .from("image_topics")
        .insert(insertData);

      if (error) {
        console.error(
          "BULK IMAGE TOPIC INSERT ERROR:",
          error
        );

        alert(
          error.message ||
          "Unable to save Image Topics."
        );

        return;
      }

      alert(
        `${lines.length} Image Topic(s) saved successfully.`
      );

      setBulkText("");
      setShowBulk(false);

      await loadTopics();

    } catch (error: any) {

      console.error(
        "BULK IMAGE TOPIC ERROR:",
        error
      );

      alert(
        error?.message ||
        "Unable to save Image Topics."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EDIT TOPIC
  // =========================================================

  const handleEdit = (topic: any) => {

    setEditingTopicId(topic.id);

    setTopicName(topic.name || "");

    setSortOrder(
      topic.sort_order !== null &&
        topic.sort_order !== undefined
        ? String(topic.sort_order)
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  // =========================================================
  // DELETE TOPIC
  // =========================================================

  const handleDelete = async (topic: any) => {

    const confirmed = window.confirm(
      `Delete Image Topic "${topic.name}"?`
    );

    if (!confirmed) return;


    const { error } = await supabase
      .from("image_topics")
      .delete()
      .eq("id", topic.id);


    if (error) {

      console.error(
        "IMAGE TOPIC DELETE ERROR:",
        error
      );

      alert(
        error.message ||
        "Unable to delete Image Topic."
      );

      return;

    }


    if (editingTopicId === topic.id) {

      clearForm();

    }


    await loadTopics();

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="w-full">

      {/* =====================================================
          TITLE
      ====================================================== */}

      <h2 className="text-2xl font-bold text-[#06204a] mb-6">
        Image Topic Master
      </h2>
      {/* =====================================================
          BULK ADD
      ====================================================== */}

      <div className="mb-4 flex justify-end">

        <button
          type="button"
          onClick={() => setShowBulk(!showBulk)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showBulk
            ? "Single Topic"
            : "Bulk Add Topics"}
        </button>

      </div>

      {showBulk && (
        <div className="mb-6 border border-blue-200 rounded-lg p-4 bg-blue-50">

          <label className="block text-sm font-medium mb-1">
            Enter Topics
          </label>

          <textarea
            value={bulkText}
            onChange={(e) =>
              setBulkText(e.target.value)
            }
            placeholder={`Enter one topic per line

Example:
Common Professions
Family Members
Animals
Fruits
Vegetables`}
            rows={8}
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          />

          <div className="mt-3 flex gap-2">

            <button
              type="button"
              onClick={handleBulkSave}
              disabled={loading}
              className="bg-green-600 text-white px-5 py-2 rounded disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Add Topics"}
            </button>

            <button
              type="button"
              onClick={() => {
                setBulkText("");
                setShowBulk(false);
              }}
              className="bg-gray-500 text-white px-5 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="grid md:grid-cols-[1fr_180px_auto_auto] gap-3 items-end">

        {/* TOPIC NAME */}

        <div>

          <label className="block text-sm mb-1">
            Image Topic
          </label>

          <input
            type="text"
            value={topicName}
            onChange={(e) =>
              setTopicName(e.target.value)
            }
            placeholder="Enter Image Topic"
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          />

        </div>


        {/* SORT ORDER */}

        <div>

          <label className="block text-sm mb-1">
            Sort Order
          </label>

          <input
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value)
            }
            placeholder="Auto"
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          />

        </div>


        {/* SAVE / UPDATE */}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-5 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : editingTopicId
              ? "Update Topic"
              : "Save Topic"}
        </button>


        {/* CANCEL */}

        {editingTopicId && (

          <button
            type="button"
            onClick={clearForm}
            className="bg-gray-500 text-white px-5 py-2 rounded"
          >
            Cancel
          </button>

        )}

      </div>


      {/* =====================================================
          SAVED TOPICS
      ====================================================== */}

      {topics.length > 0 && (

        <div className="mt-8">

          <h3 className="text-xl font-bold text-[#06204a] mb-3">
            Saved Image Topics ({topics.length})
          </h3>


          <div className="overflow-x-auto">

            <table className="w-full border-collapse border border-gray-300">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    #
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Topic Name
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Sort Order
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {topics.map(
                  (topic: any, index: number) => (

                    <tr
                      key={topic.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="border border-gray-300 px-3 py-2">
                        {index + 1}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">
                        {topic.name}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">
                        {topic.sort_order}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenImages(topic.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(topic)
                            }
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(topic)
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

}
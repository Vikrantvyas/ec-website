"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function ImageMaster() {

  const [topics, setTopics] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  const [selectedTopicId, setSelectedTopicId] =
    useState("");

  const [imageName, setImageName] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [editingImageId, setEditingImageId] =
    useState<string | null>(null);

  const [editingFilePath, setEditingFilePath] =
    useState("");

  const [loading, setLoading] =
    useState(false);


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
  // LOAD IMAGES
  // =========================================================

  const loadImages = async () => {

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("sort_order", {
        ascending: true
      })
      .order("created_at", {
        ascending: true
      });

    if (error) {

      console.error(
        "IMAGES LOAD ERROR:",
        error
      );

      return;

    }

    setImages(data || []);

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadTopics();
    loadImages();

  }, []);


  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {

    setSelectedTopicId("");

    setImageName("");

    setSortOrder("");

    setSelectedFile(null);

    setPreviewUrl("");

    setEditingImageId(null);

    setEditingFilePath("");

  };


  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      e.target.files?.[0] || null;

    setSelectedFile(file);

    if (previewUrl) {

      URL.revokeObjectURL(previewUrl);

    }

    if (file) {

      setPreviewUrl(
        URL.createObjectURL(file)
      );

    } else {

      setPreviewUrl("");

    }

  };


  // =========================================================
  // GET PUBLIC IMAGE URL
  // =========================================================

  const getImageUrl = (
    filePath: string
  ) => {

    const { data } =
      supabase.storage
        .from("images")
        .getPublicUrl(filePath);

    return data.publicUrl;

  };


  // =========================================================
  // SAVE / UPDATE IMAGE
  // =========================================================

  const handleSave = async () => {

    const name = imageName.trim();

    if (!selectedTopicId) {

      alert("Please select Image Topic.");

      return;

    }

    if (!name) {

      alert("Please enter Image Name.");

      return;

    }

    if (
      sortOrder.trim() !== "" &&
      (
        Number.isNaN(Number(sortOrder)) ||
        Number(sortOrder) < 0
      )
    ) {

      alert("Please enter a valid Sort Order.");

      return;

    }

    // New image में file जरूरी है
    if (!editingImageId && !selectedFile) {

      alert("Please select an image.");

      return;

    }

    setLoading(true);


    const finalSortOrder =
      sortOrder.trim() === ""
        ? (
            images.filter(
              (img: any) =>
                img.topic_id === selectedTopicId
            ).length + 1
          )
        : Number(sortOrder);


    try {

      // =====================================================
      // UPDATE EXISTING IMAGE
      // =====================================================

      if (editingImageId) {

        let finalFilePath =
          editingFilePath;

        let newUploadedFilePath = "";


        // ---------------------------------------------------
        // अगर नई file चुनी गई है तो पहले Storage में upload
        // ---------------------------------------------------

        if (selectedFile) {

          const safeFileName =
            selectedFile.name
              .replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
              );

          const newFilePath =
            `${selectedTopicId}/${crypto.randomUUID()}-${safeFileName}`;

          const { error: uploadError } =
            await supabase.storage
              .from("images")
              .upload(
                newFilePath,
                selectedFile,
                {
                  cacheControl: "3600",
                  upsert: false,
                  contentType:
                    selectedFile.type
                }
              );

          if (uploadError) {

            throw uploadError;

          }

          finalFilePath =
            newFilePath;

          newUploadedFilePath =
            newFilePath;

        }


        // ---------------------------------------------------
        // Database update
        // ---------------------------------------------------

        const { error: updateError } =
          await supabase
            .from("images")
            .update({
              topic_id: selectedTopicId,
              name,
              file_path: finalFilePath,
              sort_order: finalSortOrder
            })
            .eq(
              "id",
              editingImageId
            );


        if (updateError) {

          // नया file upload हो चुका था तो rollback
          if (newUploadedFilePath) {

            await supabase.storage
              .from("images")
              .remove([
                newUploadedFilePath
              ]);

          }

          throw updateError;

        }


        // ---------------------------------------------------
        // पुरानी file delete करें
        // ---------------------------------------------------

        if (
          selectedFile &&
          editingFilePath &&
          editingFilePath !== finalFilePath
        ) {

          await supabase.storage
            .from("images")
            .remove([
              editingFilePath
            ]);

        }


        alert("Image updated successfully.");

        clearForm();

        await loadImages();

        setLoading(false);

        return;

      }


      // =====================================================
      // INSERT NEW IMAGE
      // =====================================================

      const safeFileName =
        selectedFile!.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

      const filePath =
        `${selectedTopicId}/${crypto.randomUUID()}-${safeFileName}`;


      // -----------------------------------------------------
      // Upload to Storage
      // -----------------------------------------------------

      const { error: uploadError } =
        await supabase.storage
          .from("images")
          .upload(
            filePath,
            selectedFile!,
            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                selectedFile!.type
            }
          );


      if (uploadError) {

        throw uploadError;

      }


      // -----------------------------------------------------
      // Save record in Database
      // -----------------------------------------------------

      const { error: insertError } =
        await supabase
          .from("images")
          .insert({
            topic_id: selectedTopicId,
            name,
            file_path: filePath,
            sort_order: finalSortOrder
          });


      if (insertError) {

        // Database insert fail हुआ तो uploaded file हटाएँ
        await supabase.storage
          .from("images")
          .remove([
            filePath
          ]);

        throw insertError;

      }


      alert("Image saved successfully.");

      clearForm();

      await loadImages();

    } catch (error: any) {

      console.error(
        "IMAGE SAVE ERROR:",
        error
      );

      alert(
        error?.message ||
        "Unable to save image."
      );

    }


    setLoading(false);

  };


  // =========================================================
  // EDIT IMAGE
  // =========================================================

  const handleEdit = (
    image: any
  ) => {

    setEditingImageId(
      image.id
    );

    setSelectedTopicId(
      image.topic_id
    );

    setImageName(
      image.name || ""
    );

    setSortOrder(
      image.sort_order !== null &&
      image.sort_order !== undefined
        ? String(image.sort_order)
        : ""
    );

    setEditingFilePath(
      image.file_path || ""
    );

    setSelectedFile(null);

    setPreviewUrl(
      image.file_path
        ? getImageUrl(
            image.file_path
          )
        : ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  // =========================================================
  // DELETE IMAGE
  // =========================================================

  const handleDelete = async (
    image: any
  ) => {

    const confirmed =
      window.confirm(
        `Delete image "${image.name}"?`
      );

    if (!confirmed) return;


    setLoading(true);


    try {

      // -----------------------------------------------------
      // Delete database record
      // -----------------------------------------------------

      const { error: deleteError } =
        await supabase
          .from("images")
          .delete()
          .eq(
            "id",
            image.id
          );


      if (deleteError) {

        throw deleteError;

      }


      // -----------------------------------------------------
      // Delete actual Storage file
      // -----------------------------------------------------

      if (image.file_path) {

        const { error: storageError } =
          await supabase.storage
            .from("images")
            .remove([
              image.file_path
            ]);

        if (storageError) {

          console.error(
            "STORAGE DELETE ERROR:",
            storageError
          );

        }

      }


      if (
        editingImageId ===
        image.id
      ) {

        clearForm();

      }


      await loadImages();

    } catch (error: any) {

      console.error(
        "IMAGE DELETE ERROR:",
        error
      );

      alert(
        error?.message ||
        "Unable to delete image."
      );

    }


    setLoading(false);

  };


  // =========================================================
  // GET TOPIC NAME
  // =========================================================

  const getTopicName = (
    topicId: string
  ) => {

    const topic =
      topics.find(
        (t: any) =>
          t.id === topicId
      );

    return topic?.name || "";

  };


  // =========================================================
  // SORT IMAGES
  // =========================================================

  const sortedImages =
    [...images].sort(
      (a: any, b: any) => {

        const topicA =
          topics.find(
            (t: any) =>
              t.id === a.topic_id
          );

        const topicB =
          topics.find(
            (t: any) =>
              t.id === b.topic_id
          );


        const topicOrderA =
          topicA?.sort_order ??
          999999;

        const topicOrderB =
          topicB?.sort_order ??
          999999;


        if (
          topicOrderA !==
          topicOrderB
        ) {

          return (
            topicOrderA -
            topicOrderB
          );

        }


        if (
          a.topic_id ===
          b.topic_id
        ) {

          return (
            (a.sort_order ?? 0) -
            (b.sort_order ?? 0)
          );

        }


        return (
          new Date(
            a.created_at
          ).getTime() -
          new Date(
            b.created_at
          ).getTime()
        );

      }
    );


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="w-full">

      {/* =====================================================
          TITLE
      ====================================================== */}

      <h2 className="text-2xl font-bold text-[#06204a] mb-6">
        Image Master
      </h2>


      {/* =====================================================
          FORM
      ====================================================== */}

      <div className="grid md:grid-cols-[1fr_1fr_180px] gap-4">

        {/* IMAGE TOPIC */}

        <div>

          <label className="block text-sm mb-1">
            Image Topic
          </label>

          <select
            value={selectedTopicId}
            onChange={(e) =>
              setSelectedTopicId(
                e.target.value
              )
            }
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          >

            <option value="">
              Select Image Topic
            </option>

            {topics.map(
              (topic: any) => (

                <option
                  key={topic.id}
                  value={topic.id}
                >
                  {topic.name}
                </option>

              )
            )}

          </select>

        </div>


        {/* IMAGE NAME */}

        <div>

          <label className="block text-sm mb-1">
            Image Name
          </label>

          <input
            type="text"
            value={imageName}
            onChange={(e) =>
              setImageName(
                e.target.value
              )
            }
            placeholder="Enter Image Name"
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
              setSortOrder(
                e.target.value
              )
            }
            placeholder="Auto"
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          />

        </div>

      </div>


      {/* =====================================================
          FILE UPLOAD
      ====================================================== */}

      <div className="mt-4">

        <label className="block text-sm mb-1">
          Image File
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full border border-gray-300 rounded px-3 py-2"
        />

        {editingImageId && (
          <p className="text-xs text-gray-500 mt-1">
            Leave file empty to keep the existing image.
          </p>
        )}

      </div>


      {/* =====================================================
          PREVIEW
      ====================================================== */}

      {previewUrl && (

        <div className="mt-4">

          <p className="text-sm mb-2 font-semibold">
            Preview
          </p>

          <div className="w-48 h-32 border border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center">

            <img
              src={previewUrl}
              alt={imageName || "Preview"}
              className="max-w-full max-h-full object-contain"
            />

          </div>

        </div>

      )}


      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex gap-2 mt-5">

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-5 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : editingImageId
            ? "Update Image"
            : "Save Image"}
        </button>


        {editingImageId && (

          <button
            type="button"
            onClick={clearForm}
            disabled={loading}
            className="bg-gray-500 text-white px-5 py-2 rounded disabled:opacity-50"
          >
            Cancel
          </button>

        )}

      </div>


      {/* =====================================================
          SAVED IMAGES
      ====================================================== */}

      {images.length > 0 && (

        <div className="mt-8">

          <h3 className="text-xl font-bold text-[#06204a] mb-3">
            Saved Images ({images.length})
          </h3>


          <div className="overflow-x-auto">

            <table className="w-full border-collapse border border-gray-300">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    #
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Topic
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Image Name
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Preview
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

                {sortedImages.map(
                  (
                    image: any,
                    index: number
                  ) => (

                    <tr
                      key={image.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="border border-gray-300 px-3 py-2">
                        {index + 1}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">
                        {getTopicName(
                          image.topic_id
                        )}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">
                        {image.name}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">

                        <div className="w-24 h-16 border border-gray-200 rounded overflow-hidden bg-gray-50 flex items-center justify-center">

                          <img
                            src={getImageUrl(
                              image.file_path
                            )}
                            alt={image.name}
                            className="max-w-full max-h-full object-contain"
                          />

                        </div>

                      </td>


                      <td className="border border-gray-300 px-3 py-2">
                        {image.sort_order}
                      </td>


                      <td className="border border-gray-300 px-3 py-2">

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                image
                              )
                            }
                            disabled={loading}
                            className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                image
                              )
                            }
                            disabled={loading}
                            className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
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
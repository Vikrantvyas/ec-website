"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function ImageMaster({
  initialTopicId = ""
}: {
  initialTopicId?: string;
}) {

  const [topics, setTopics] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  const [selectedTopicId, setSelectedTopicId] =
    useState("");

  const [imageName, setImageName] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("");

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

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
  useEffect(() => {
    if (
      initialTopicId &&
      topics.some((topic: any) => topic.id === initialTopicId)
    ) {
      setSelectedTopicId(initialTopicId);
    }
  }, [initialTopicId, topics]);

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {

    setSelectedTopicId("");

    setImageName("");

    setSortOrder("");

    setSelectedFiles([]);

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

    const files = Array.from(e.target.files || []);

    setSelectedFiles(files);
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

  // =========================================================
// SAVE / UPDATE IMAGE
// =========================================================

const handleSave = async () => {

  if (!selectedTopicId) {

    alert("Please select Image Topic.");

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

  // =========================================================
  // UPDATE EXISTING IMAGE
  // =========================================================

  if (editingImageId) {

    if (selectedFiles.length > 1) {

      alert("While editing, please select only one image.");

      return;

    }

    setLoading(true);

    try {

      let finalFilePath = editingFilePath;
      let newUploadedFilePath = "";

      // -------------------------------------------------------
      // अगर नई file चुनी गई है
      // -------------------------------------------------------

      if (selectedFiles.length === 1) {

        const file = selectedFiles[0];

        const safeFileName = file.name
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
              file,
              {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
              }
            );

        if (uploadError) {

          throw uploadError;

        }

        finalFilePath = newFilePath;
        newUploadedFilePath = newFilePath;

      }

      // -------------------------------------------------------
      // Image Name
      // -------------------------------------------------------

      let finalName = imageName.trim();

      if (!finalName) {

        if (selectedFiles.length === 1) {

          finalName =
            selectedFiles[0].name
              .replace(/\.[^/.]+$/, "");

        } else {

          const oldImage =
            images.find(
              (img: any) =>
                img.id === editingImageId
            );

          finalName =
            oldImage?.name || "Image";

        }

      }

      // -------------------------------------------------------
      // Database update
      // -------------------------------------------------------

      const finalSortOrder =
        sortOrder.trim() === ""
          ? (
              images.find(
                (img: any) =>
                  img.id === editingImageId
              )?.sort_order ?? 1
            )
          : Number(sortOrder);

      const { error: updateError } =
        await supabase
          .from("images")
          .update({
            topic_id: selectedTopicId,
            name: finalName,
            file_path: finalFilePath,
            sort_order: finalSortOrder
          })
          .eq(
            "id",
            editingImageId
          );

      // -------------------------------------------------------
      // Database update fail → new uploaded file rollback
      // -------------------------------------------------------

      if (updateError) {

        if (newUploadedFilePath) {

          await supabase.storage
            .from("images")
            .remove([
              newUploadedFilePath
            ]);

        }

        throw updateError;

      }

      // -------------------------------------------------------
      // पुरानी file delete करें
      // -------------------------------------------------------

      if (
        selectedFiles.length === 1 &&
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

    } catch (error: any) {

      console.error(
        "IMAGE UPDATE ERROR:",
        error
      );

      alert(
        error?.message ||
        "Unable to update image."
      );

    }

    setLoading(false);

    return;

  }

  // =========================================================
  // NEW IMAGE - BULK UPLOAD
  // =========================================================

  if (selectedFiles.length === 0) {

    alert("Please select at least one image.");

    return;

  }

  setLoading(true);

  const uploadedFilePaths: string[] = [];
  const insertedRows: any[] = [];

  try {

    // -------------------------------------------------------
    // Starting Sort Order
    // -------------------------------------------------------

    let nextSortOrder =
      sortOrder.trim() === ""
        ? (
            images.filter(
              (img: any) =>
                img.topic_id === selectedTopicId
            ).length + 1
          )
        : Number(sortOrder);

    // -------------------------------------------------------
    // Upload every selected image
    // -------------------------------------------------------

    for (const file of selectedFiles) {

      const safeFileName =
        file.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

      const filePath =
        `${selectedTopicId}/${crypto.randomUUID()}-${safeFileName}`;

      // -----------------------------------------------
      // Upload to Supabase Storage
      // -----------------------------------------------

      const { error: uploadError } =
        await supabase.storage
          .from("images")
          .upload(
            filePath,
            file,
            {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type
            }
          );

      if (uploadError) {

        throw uploadError;

      }

      uploadedFilePaths.push(filePath);

      // -----------------------------------------------
      // Automatic Image Name
      // -----------------------------------------------

      let finalName = "";

      /*
       * अगर केवल एक image है और user ने manually
       * Image Name दिया है, तो वही name इस्तेमाल होगा।
       *
       * Bulk upload में हर image का अपना filename
       * automatic name बनेगा।
       */

      if (
        selectedFiles.length === 1 &&
        imageName.trim()
      ) {

        finalName = imageName.trim();

      } else {

        finalName =
          file.name
            .replace(/\.[^/.]+$/, "");

      }

      insertedRows.push({

        topic_id: selectedTopicId,

        name: finalName,

        file_path: filePath,

        sort_order: nextSortOrder

      });

      nextSortOrder++;

    }

    // -------------------------------------------------------
    // Insert all records into Database
    // -------------------------------------------------------

    const { error: insertError } =
      await supabase
        .from("images")
        .insert(insertedRows);

    // -------------------------------------------------------
    // Database failed → delete uploaded files
    // -------------------------------------------------------

    if (insertError) {

      await supabase.storage
        .from("images")
        .remove(uploadedFilePaths);

      throw insertError;

    }

    // -------------------------------------------------------
    // Success
    // -------------------------------------------------------

    alert(
      selectedFiles.length === 1
        ? "Image saved successfully."
        : `${selectedFiles.length} images saved successfully.`
    );

    clearForm();

    await loadImages();

  } catch (error: any) {

    console.error(
      "IMAGE BULK SAVE ERROR:",
      error
    );

    // -------------------------------------------------------
    // Safety rollback
    // -------------------------------------------------------

    if (uploadedFilePaths.length > 0) {

      await supabase.storage
        .from("images")
        .remove(uploadedFilePaths);

    }

    alert(
      error?.message ||
      "Unable to save images."
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

    setSelectedFiles([]);

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
          multiple
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
                            onClick={() => handleEdit(image)}
                            disabled={loading}
                            className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(image)}
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

      )
      }

    </div >

  );

}
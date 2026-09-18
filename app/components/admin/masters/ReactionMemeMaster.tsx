"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type MemeType = "image" | "video" | "audio";

export default function ReactionMemeMaster() {
  const [memes, setMemes] = useState<any[]>([]);

  const [memeType, setMemeType] =
    useState<MemeType>("image");

  const [name, setName] = useState("");

  const [mediaFile, setMediaFile] =
    useState<File | null>(null);

  const [thumbnailFile, setThumbnailFile] =
    useState<File | null>(null);

  const [mediaPreview, setMediaPreview] =
    useState("");

  const [thumbnailPreview, setThumbnailPreview] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingMediaPath, setEditingMediaPath] =
    useState("");

  const [editingThumbnailPath, setEditingThumbnailPath] =
    useState("");

  const [editingOriginalType, setEditingOriginalType] =
    useState<MemeType | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  const [mediaInputKey, setMediaInputKey] =
    useState(0);

  const [thumbnailInputKey, setThumbnailInputKey] =
    useState(0);

  // =========================================================
  // LOAD MEMES
  // =========================================================

  const loadMemes = async () => {
    const { data, error } = await supabase
      .from("reaction_memes")
      .select("*")
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "REACTION MEMES LOAD ERROR:",
        error
      );
      return;
    }

    setMemes(data || []);
  };

  useEffect(() => {
    loadMemes();
  }, []);

  // =========================================================
  // PUBLIC URL
  // =========================================================

  const getPublicUrl = (filePath: string) => {
    if (!filePath) return "";

    const { data } =
      supabase.storage
        .from("memes")
        .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setMemeType("image");
    setName("");

    setMediaFile(null);
    setThumbnailFile(null);

    setMediaPreview("");
    setThumbnailPreview("");

    setEditingId(null);
    setEditingMediaPath("");
    setEditingThumbnailPath("");
    setEditingOriginalType(null);

    setDraggedId(null);

    setMediaInputKey((prev) => prev + 1);
    setThumbnailInputKey((prev) => prev + 1);
  };

  // =========================================================
  // FILE PREVIEW
  // =========================================================

  const createPreviewUrl = (file: File | null) => {
    if (!file) return "";

    return URL.createObjectURL(file);
  };

  const handleMediaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    setMediaFile(file);

    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    if (file) {
      setMediaPreview(
        createPreviewUrl(file)
      );
    } else {
      setMediaPreview("");
    }
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0] || null;

    setThumbnailFile(file);

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    if (file) {
      setThumbnailPreview(
        createPreviewUrl(file)
      );
    } else {
      setThumbnailPreview("");
    }
  };

  // =========================================================
  // TYPE CHANGE
  // =========================================================

  const handleTypeChange = (
    type: MemeType
  ) => {
    setMemeType(type);

    setMediaFile(null);

    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }

    setMediaPreview("");

    // Clear actual browser file selection
    setMediaInputKey((prev) => prev + 1);
  };

  // =========================================================
  // UPLOAD FILE
  // =========================================================

  const uploadFile = async (
    file: File,
    folder: string
  ) => {
    const safeFileName =
      file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

    const filePath =
      `${folder}/${crypto.randomUUID()}-${safeFileName}`;

    const { error } =
      await supabase.storage
        .from("memes")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

    if (error) {
      throw error;
    }

    return filePath;
  };

  // =========================================================
  // DELETE STORAGE FILE
  // =========================================================

  const deleteStorageFile = async (
    filePath: string
  ) => {
    if (!filePath) return;

    const { error } =
      await supabase.storage
        .from("memes")
        .remove([filePath]);

    if (error) {
      console.error(
        "STORAGE DELETE ERROR:",
        error
      );
    }
  };

  // =========================================================
  // GET MEDIA PATH
  // =========================================================

  const getMediaPath = (
    meme: any,
    type: MemeType
  ) => {
    if (type === "image") {
      return meme.image_path || "";
    }

    if (type === "video") {
      return meme.video_path || "";
    }

    return meme.sound_path || "";
  };

  // =========================================================
  // SAVE / UPDATE
  // =========================================================

  const handleSave = async () => {
    const finalName = name.trim();

    if (!finalName) {
      alert("Please enter Meme Name.");
      return;
    }

    // New record always needs media
    if (!editingId && !mediaFile) {
      alert("Please select Media File.");
      return;
    }

    // Existing record: if type has changed,
    // new media must be selected.
    if (
      editingId &&
      editingOriginalType &&
      editingOriginalType !== memeType &&
      !mediaFile
    ) {
      alert(
        "Please select new Media File for the changed Meme Type."
      );
      return;
    }

    setLoading(true);

    const uploadedFiles: string[] = [];

    try {
      // =====================================================
      // UPDATE EXISTING MEME
      // =====================================================

      if (editingId) {
        let finalMediaPath =
          editingMediaPath;

        let finalThumbnailPath =
          editingThumbnailPath || null;

        // ---------------------------------------------------
        // NEW MEDIA
        // ---------------------------------------------------

        if (mediaFile) {
          const folder =
            memeType === "image"
              ? "images"
              : memeType === "video"
                ? "videos"
                : "sounds";

          finalMediaPath =
            await uploadFile(
              mediaFile,
              folder
            );

          uploadedFiles.push(
            finalMediaPath
          );
        }

        // ---------------------------------------------------
        // NEW THUMBNAIL
        // ---------------------------------------------------

        if (thumbnailFile) {
          finalThumbnailPath =
            await uploadFile(
              thumbnailFile,
              "thumbnails"
            );

          uploadedFiles.push(
            finalThumbnailPath
          );
        }

        // ---------------------------------------------------
        // DATABASE UPDATE
        // ---------------------------------------------------

        const updatePayload: any = {
          name: finalName,
          media_type: memeType,
          image_path:
            memeType === "image"
              ? finalMediaPath
              : null,
          video_path:
            memeType === "video"
              ? finalMediaPath
              : null,
          sound_path:
            memeType === "audio"
              ? finalMediaPath
              : null,
          thumbnail_path:
            finalThumbnailPath,
        };

        const { error } =
          await supabase
            .from("reaction_memes")
            .update(updatePayload)
            .eq(
              "id",
              editingId
            );

        if (error) {
          throw error;
        }

        // ---------------------------------------------------
        // DELETE OLD MEDIA
        // ---------------------------------------------------

        if (
          mediaFile &&
          editingMediaPath &&
          editingMediaPath !==
            finalMediaPath
        ) {
          await deleteStorageFile(
            editingMediaPath
          );
        }

        // ---------------------------------------------------
        // DELETE OLD THUMBNAIL
        // ---------------------------------------------------

        if (
          thumbnailFile &&
          editingThumbnailPath &&
          editingThumbnailPath !==
            finalThumbnailPath
        ) {
          await deleteStorageFile(
            editingThumbnailPath
          );
        }

        alert(
          "Meme updated successfully."
        );

        clearForm();
        await loadMemes();

        return;
      }

      // =====================================================
      // NEW MEME
      // =====================================================

      const folder =
        memeType === "image"
          ? "images"
          : memeType === "video"
            ? "videos"
            : "sounds";

      // -----------------------------------------------------
      // MEDIA
      // -----------------------------------------------------

      const mediaPath =
        await uploadFile(
          mediaFile!,
          folder
        );

      uploadedFiles.push(
        mediaPath
      );

      // -----------------------------------------------------
      // THUMBNAIL OPTIONAL
      // -----------------------------------------------------

      let thumbnailPath:
        | string
        | null = null;

      if (thumbnailFile) {
        thumbnailPath =
          await uploadFile(
            thumbnailFile,
            "thumbnails"
          );

        uploadedFiles.push(
          thumbnailPath
        );
      }

      // -----------------------------------------------------
      // AUTOMATIC ORDER
      // -----------------------------------------------------

      const nextOrder =
        memes.length + 1;

      // -----------------------------------------------------
      // DATABASE INSERT
      // -----------------------------------------------------

      const insertPayload: any = {
        name: finalName,
        media_type: memeType,

        image_path:
          memeType === "image"
            ? mediaPath
            : null,

        video_path:
          memeType === "video"
            ? mediaPath
            : null,

        sound_path:
          memeType === "audio"
            ? mediaPath
            : null,

        thumbnail_path:
          thumbnailPath,

        sort_order:
          nextOrder,
      };

      const { error } =
        await supabase
          .from("reaction_memes")
          .insert(
            insertPayload
          );

      if (error) {
        throw error;
      }

      alert(
        "Meme saved successfully."
      );

      clearForm();
      await loadMemes();

    } catch (error: any) {
      console.error(
        "REACTION MEME SAVE ERROR:",
        error
      );

      // Rollback newly uploaded files
      if (
        uploadedFiles.length > 0
      ) {
        await supabase.storage
          .from("memes")
          .remove(
            uploadedFiles
          );
      }

      alert(
        error?.message ||
        "Unable to save meme."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (
    meme: any
  ) => {
    const type: MemeType =
      meme.media_type === "video"
        ? "video"
        : meme.media_type === "audio"
          ? "audio"
          : "image";

    const mediaPath =
      getMediaPath(
        meme,
        type
      );

    setEditingId(
      String(meme.id)
    );

    setMemeType(type);

    setEditingOriginalType(type);

    setName(
      meme.name || ""
    );

    setEditingMediaPath(
      mediaPath
    );

    setEditingThumbnailPath(
      meme.thumbnail_path || ""
    );

    setMediaFile(null);
    setThumbnailFile(null);

    if (mediaPreview) {
      URL.revokeObjectURL(
        mediaPreview
      );
    }

    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setMediaPreview(
      mediaPath
        ? getPublicUrl(
            mediaPath
          )
        : ""
    );

    setThumbnailPreview(
      meme.thumbnail_path
        ? getPublicUrl(
            meme.thumbnail_path
          )
        : ""
    );

    setMediaInputKey(
      (prev) => prev + 1
    );

    setThumbnailInputKey(
      (prev) => prev + 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    meme: any
  ) => {
    const confirmed =
      window.confirm(
        `Delete meme "${meme.name}"?`
      );

    if (!confirmed) return;

    setLoading(true);

    try {
      const { error } =
        await supabase
          .from("reaction_memes")
          .delete()
          .eq(
            "id",
            meme.id
          );

      if (error) {
        throw error;
      }

      // -----------------------------------------------------
      // DELETE IMAGE
      // -----------------------------------------------------

      if (meme.image_path) {
        await deleteStorageFile(
          meme.image_path
        );
      }

      // -----------------------------------------------------
      // DELETE VIDEO
      // -----------------------------------------------------

      if (meme.video_path) {
        await deleteStorageFile(
          meme.video_path
        );
      }

      // -----------------------------------------------------
      // DELETE AUDIO
      // -----------------------------------------------------

      if (meme.sound_path) {
        await deleteStorageFile(
          meme.sound_path
        );
      }

      // -----------------------------------------------------
      // DELETE THUMBNAIL
      // -----------------------------------------------------

      if (meme.thumbnail_path) {
        await deleteStorageFile(
          meme.thumbnail_path
        );
      }

      if (
        editingId ===
        String(meme.id)
      ) {
        clearForm();
      }

      alert(
        "Meme deleted successfully."
      );

      await loadMemes();

    } catch (error: any) {
      console.error(
        "REACTION MEME DELETE ERROR:",
        error
      );

      alert(
        error?.message ||
        "Unable to delete meme."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DRAG START
  // =========================================================

  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    id: string
  ) => {
    setDraggedId(id);

    e.dataTransfer.effectAllowed =
      "move";

    e.dataTransfer.setData(
      "text/plain",
      id
    );
  };

  // =========================================================
  // DRAG OVER
  // =========================================================

  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>
  ) => {
    e.preventDefault();

    e.dataTransfer.dropEffect =
      "move";
  };

  // =========================================================
  // DROP / SAVE NEW ORDER
  // =========================================================

  const handleDrop = async (
    e: React.DragEvent<HTMLTableRowElement>,
    targetId: string
  ) => {
    e.preventDefault();

    const sourceId =
      e.dataTransfer.getData(
        "text/plain"
      ) || draggedId;

    if (
      !sourceId ||
      sourceId === targetId
    ) {
      setDraggedId(null);
      return;
    }

    const oldList = [...memes];

    const sourceIndex =
      oldList.findIndex(
        (item) =>
          String(item.id) ===
          String(sourceId)
      );

    const targetIndex =
      oldList.findIndex(
        (item) =>
          String(item.id) ===
          String(targetId)
      );

    if (
      sourceIndex === -1 ||
      targetIndex === -1
    ) {
      setDraggedId(null);
      return;
    }

    const newList = [
      ...oldList,
    ];

    const [
      movedItem
    ] = newList.splice(
      sourceIndex,
      1
    );

    newList.splice(
      targetIndex,
      0,
      movedItem
    );

    const reorderedList =
      newList.map(
        (
          item,
          index
        ) => ({
          ...item,
          sort_order:
            index + 1,
        })
      );

    // Update UI immediately
    setMemes(
      reorderedList
    );

    setDraggedId(null);

    try {
      const updates =
        reorderedList.map(
          (item) =>
            supabase
              .from("reaction_memes")
              .update({
                sort_order:
                  item.sort_order,
              })
              .eq(
                "id",
                item.id
              )
        );

      const results =
        await Promise.all(
          updates
        );

      const failed =
        results.find(
          (result) =>
            result.error
        );

      if (failed?.error) {
        throw failed.error;
      }

    } catch (error: any) {
      console.error(
        "DRAG ORDER SAVE ERROR:",
        error
      );

      alert(
        error?.message ||
        "Unable to save new order."
      );

      setMemes(
        oldList
      );
    }
  };

  // =========================================================
  // DRAG END
  // =========================================================

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // =========================================================
  // MEDIA PREVIEW
  // =========================================================

  const renderMediaPreview = (
    type: MemeType,
    url: string,
    className = "w-48 h-28"
  ) => {
    if (!url) return null;

    if (type === "video") {
      return (
        <video
          src={url}
          controls
          className={`${className} object-contain bg-black rounded`}
        />
      );
    }

    if (type === "audio") {
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-100 rounded border`}
        >
          <audio
            src={url}
            controls
            className="w-[90%]"
          />
        </div>
      );
    }

    return (
      <img
        src={url}
        alt="Meme"
        className={`${className} object-contain bg-gray-50 rounded`}
      />
    );
  };

  // =========================================================
  // CURRENT PREVIEW
  // =========================================================

  const currentPreviewUrl =
    mediaPreview ||
    (
      editingId &&
      editingMediaPath
        ? getPublicUrl(
            editingMediaPath
          )
        : ""
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full">

      <h2 className="text-2xl font-bold text-[#06204a] mb-6">
        Reaction Meme Master
      </h2>

      {/* ===================================================
          FORM
      ==================================================== */}

      <div className="grid md:grid-cols-[180px_1fr_250px_250px_auto] gap-3 items-end">

        {/* MEME TYPE */}

        <div>
          <label className="block text-sm mb-1">
            Meme Type
          </label>

          <select
            value={memeType}
            onChange={(e) =>
              handleTypeChange(
                e.target.value as MemeType
              )
            }
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
          >
            <option value="image">
              Image
            </option>

            <option value="video">
              Video
            </option>

            <option value="audio">
              Audio
            </option>
          </select>
        </div>

        {/* MEME NAME */}

        <div>
          <label className="block text-sm mb-1">
            Meme Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Enter Meme Name"
            className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          />
        </div>

        {/* MEDIA FILE */}

        <div>
          <label className="block text-sm mb-1">
            {memeType === "image"
              ? "Image File"
              : memeType === "video"
                ? "Video File"
                : "Audio File"}
          </label>

          <input
            key={mediaInputKey}
            type="file"
            accept={
              memeType === "image"
                ? "image/*"
                : memeType === "video"
                  ? "video/*"
                  : "audio/*"
            }
            onChange={
              handleMediaChange
            }
            className="block w-full border border-gray-300 rounded px-2 py-2"
          />
        </div>

        {/* THUMBNAIL */}

        <div>
          <label className="block text-sm mb-1">
            Thumbnail Image
            <span className="text-gray-500 ml-1">
              (Optional)
            </span>
          </label>

          <input
            key={thumbnailInputKey}
            type="file"
            accept="image/*"
            onChange={
              handleThumbnailChange
            }
            className="block w-full border border-gray-300 rounded px-2 py-2"
          />
        </div>

        {/* SAVE */}

        <button
          type="button"
          onClick={
            handleSave
          }
          disabled={
            loading
          }
          className="bg-green-600 text-white px-5 py-2 rounded disabled:opacity-50 h-[38px]"
        >
          {loading
            ? "Saving..."
            : editingId
              ? "Update"
              : "Save"}
        </button>

      </div>

      {/* ===================================================
          CANCEL EDIT
      ==================================================== */}

      {editingId && (
        <div className="mt-3">

          <button
            type="button"
            onClick={
              clearForm
            }
            className="bg-gray-200 px-4 py-1.5 rounded text-sm"
          >
            Cancel
          </button>

        </div>
      )}

      {/* ===================================================
          SELECTED MEDIA PREVIEW
      ==================================================== */}

      {currentPreviewUrl && (
        <div className="mt-5">

          <p className="text-sm mb-2 font-semibold">
            Preview
          </p>

          {renderMediaPreview(
            memeType,
            currentPreviewUrl
          )}

          {thumbnailPreview && (
            <div className="mt-3">

              <p className="text-sm mb-2 font-semibold">
                Thumbnail Preview
              </p>

              <img
                src={
                  thumbnailPreview
                }
                alt="Thumbnail"
                className="w-32 h-20 object-contain border rounded bg-gray-50"
              />

            </div>
          )}

        </div>
      )}

      {/* ===================================================
          SAVED MEMES
      ==================================================== */}

      <div className="mt-8">

        <h3 className="text-xl font-bold text-[#06204a] mb-3">
          Saved Memes ({memes.length})
        </h3>

        {memes.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full border-collapse border border-gray-300">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    #
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Type
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Meme Name
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Thumbnail
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Preview
                  </th>

                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {memes.map(
                  (
                    meme: any,
                    index: number
                  ) => {

                    const type: MemeType =
                      meme.media_type ===
                      "video"
                        ? "video"
                        : meme.media_type ===
                          "audio"
                          ? "audio"
                          : "image";

                    const mediaPath =
                      getMediaPath(
                        meme,
                        type
                      );

                    const mediaUrl =
                      mediaPath
                        ? getPublicUrl(
                            mediaPath
                          )
                        : "";

                    const thumbnailUrl =
                      meme.thumbnail_path
                        ? getPublicUrl(
                            meme.thumbnail_path
                          )
                        : "";

                    return (
                      <tr
                        key={meme.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(
                            e,
                            String(
                              meme.id
                            )
                          )
                        }
                        onDragOver={
                          handleDragOver
                        }
                        onDrop={(e) =>
                          handleDrop(
                            e,
                            String(
                              meme.id
                            )
                          )
                        }
                        onDragEnd={
                          handleDragEnd
                        }
                        className={`hover:bg-gray-50 cursor-move ${
                          draggedId ===
                          String(
                            meme.id
                          )
                            ? "opacity-40"
                            : ""
                        }`}
                      >

                        {/* NUMBER */}

                        <td className="border border-gray-300 px-3 py-2">

                          <div className="flex items-center gap-2">

                            <span className="text-gray-400 text-lg">
                              ⋮⋮
                            </span>

                            <span>
                              {index + 1}
                            </span>

                          </div>

                        </td>

                        {/* TYPE */}

                        <td className="border border-gray-300 px-3 py-2">

                          <span className="font-medium">
                            {type ===
                            "image"
                              ? "Image"
                              : type ===
                                "video"
                                ? "Video"
                                : "Audio"}
                          </span>

                        </td>

                        {/* NAME */}

                        <td className="border border-gray-300 px-3 py-2">
                          {meme.name}
                        </td>

                        {/* THUMBNAIL */}

                        <td className="border border-gray-300 px-3 py-2">

                          {thumbnailUrl ? (

                            <img
                              src={
                                thumbnailUrl
                              }
                              alt={
                                meme.name
                              }
                              className="w-24 h-16 object-contain border rounded bg-gray-50"
                            />

                          ) : (

                            <span className="text-gray-400 text-xs">
                              No Thumbnail
                            </span>

                          )}

                        </td>

                        {/* PREVIEW */}

                        <td className="border border-gray-300 px-3 py-2">

                          {mediaUrl ? (
                            renderMediaPreview(
                              type,
                              mediaUrl,
                              "w-32 h-20"
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">
                              No Preview
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="border border-gray-300 px-3 py-2">

                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  meme
                                )
                              }
                              disabled={
                                loading
                              }
                              className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  meme
                                )
                              }
                              disabled={
                                loading
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="border border-gray-300 rounded p-5 text-gray-500">
            No memes saved yet.
          </div>

        )}

      </div>

    </div>
  );
}
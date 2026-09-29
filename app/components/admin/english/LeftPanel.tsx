"use client";

import { useState, useEffect, useRef } from "react";
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
  refreshData,
  refreshTopicCount
}: any) {

  const [menu, setMenu] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTopicData, setSelectedTopicData] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [selectedAddVideoTopicId, setSelectedAddVideoTopicId] = useState("");
  const [addVideoName, setAddVideoName] = useState("");
  const [addVideoUrl, setAddVideoUrl] = useState("");
  const [savingAddVideo, setSavingAddVideo] = useState(false);
  const [showAddVideoTopicModal, setShowAddVideoTopicModal] = useState(false);
  const [addVideoTopicName, setAddVideoTopicName] = useState("");
  const [savingAddVideoTopic, setSavingAddVideoTopic] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [selectedAddImageTopicId, setSelectedAddImageTopicId] = useState("");
  const [addImageName, setAddImageName] = useState("");
  const [selectedAddImageFile, setSelectedAddImageFile] = useState<File | null>(null);
  const [savingAddImage, setSavingAddImage] = useState(false);

  const [showAddImageTopicModal, setShowAddImageTopicModal] = useState(false);
  const [addImageTopicName, setAddImageTopicName] = useState("");
  const [savingAddImageTopic, setSavingAddImageTopic] = useState(false);
  const handleContextMenu = (
    e: React.MouseEvent,
    type: string,
    item: any
  ) => {
    e.preventDefault();

    setMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      item,
      topic: type === "topic" ? item : undefined,
      grammarTable: type === "grammarTable" ? item : undefined
    });
  };
  const handleGrammarTableEdit = () => {

    const table = menu?.grammarTable;

    if (!table) return;

    window.location.href =
      `/admin/masters?editTable=${table.id}`;

    setMenu(null);
  };
  const [showGrammarTables, setShowGrammarTables] = useState(false);

  const [grammarTopics, setGrammarTopics] =
    useState<any[]>([]);
  const [expandedGrammarTopics, setExpandedGrammarTopics] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const daysContainerRef = useRef<HTMLDivElement>(null);
  const [showImages, setShowImages] = useState(false);
  const [imageMediaType, setImageMediaType] =
    useState<"images" | "videos">("images");

  const [imageTopics, setImageTopics] =
    useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [expandedImageTopics, setExpandedImageTopics] =
    useState<string[]>([]);
  const refreshDaysAndTopics = async () => {
    const { data: daysData, error: daysError } = await supabase
      .from("days")
      .select("*")
      .eq("course_id", selectedCourse)
      .order("day_number", { ascending: true });

    if (daysError) {
      alert(daysError.message);
      return;
    }

    const dayIds = (daysData || []).map((d: any) => d.id);

    let topicsData: any[] = [];

    if (dayIds.length > 0) {
      const { data, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .in("day_id", dayIds)
        .order("order_no", { ascending: true });

      if (topicsError) {
        alert(topicsError.message);
        return;
      }

      topicsData = data || [];
    }

    // Parent component ki existing state ko update karna hoga
    // isliye refreshData ko call karenge.
    if (refreshData) {
      await refreshData();
    }
  };

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
    const { data: videosData, error: videosError } =
      await supabase
        .from("videos")
        .select(
          "id, name, topic_id, source_type, video_url, file_path, sort_order, created_at"
        )
        .order("sort_order", {
          ascending: true
        })
        .order("created_at", {
          ascending: true
        });

    if (videosError) {
      console.error(
        "VIDEOS ERROR:",
        videosError.message
      );
      return;
    }

    setVideos(videosData || []);

    const finalTopics =
      (topicsData || []).map(
        (topic: any) => ({

          ...topic,
          videos: (videosData || []).filter(
            (video: any) =>
              video.topic_id === topic.id
          ),
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
  useEffect(() => {
    if (!selectedCourse || expandedDays.length === 0) return;

    const lastExpandedDayId =
      expandedDays[expandedDays.length - 1];

    const timer = setTimeout(() => {
      const element = document.getElementById(
        `day-item-${lastExpandedDayId}`
      );

      if (!element) return;

      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [expandedDays, selectedCourse]);
  useEffect(() => {
    if (expandedGrammarTopics.length === 0) return;

    const lastExpandedGrammarTopicId =
      expandedGrammarTopics[expandedGrammarTopics.length - 1];

    const timer = setTimeout(() => {
      const element = document.getElementById(
        `grammar-topic-${lastExpandedGrammarTopicId}`
      );

      if (!element) return;

      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [expandedGrammarTopics]);
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
  const handleRename = async () => {
    if (!menu?.item) return;

    const item = menu.item;

    let currentName = "";

    if (menu.type === "topic") {
      currentName = item.topic_name || "";
    } else {
      currentName = item.name || item.title || "";
    }

    const newName = window.prompt("Enter new name:", currentName);

    if (newName === null) return;

    const name = newName.trim();

    if (!name || name === currentName) {
      setMenu(null);
      return;
    }

    let table = "";
    let column = "name";

    switch (menu.type) {
      case "topic":
        table = "topics";
        column = "topic_name";
        break;

      case "day":
        table = "days";
        column = "title";
        break;

      case "imageTopic":
      case "videoTopic":
        table = "image_topics";
        break;

      case "image":
        table = "images";
        break;

      case "video":
        table = "videos";
        break;

      case "grammarTopic":
        table = "grammar_topics";
        break;

      case "grammarTable":
        table = "grammar_tables";
        break;
    }

    if (!table) return;

    const { error } = await supabase
      .from(table)
      .update({ [column]: name })
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    setMenu(null);

    if (
      menu.type === "imageTopic" ||
      menu.type === "videoTopic" ||
      menu.type === "image" ||
      menu.type === "video"
    ) {
      await fetchImageTopics();
    }

    if (
      menu.type === "grammarTopic" ||
      menu.type === "grammarTable"
    ) {
      await fetchGrammarTopics();
    }

    if (refreshData) {
      await refreshData();
    }
  };

  const handleDelete = async () => {
    if (!menu?.item) return;

    const item = menu.item;

    const itemName =
      item.topic_name ||
      item.name ||
      item.title ||
      "this item";

    const confirmed = window.confirm(
      `Delete "${itemName}"?`
    );

    if (!confirmed) return;

    let table = "";

    switch (menu.type) {
      case "topic":
        table = "topics";
        break;

      case "day":
        table = "days";
        break;

      case "imageTopic":
      case "videoTopic":
        table = "image_topics";
        break;

      case "image":
        table = "images";
        break;

      case "video":
        table = "videos";
        break;

      case "grammarTopic":
        table = "grammar_topics";
        break;

      case "grammarTable":
        table = "grammar_tables";
        break;
    }

    if (!table) return;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    setMenu(null);

    if (
      menu.type === "imageTopic" ||
      menu.type === "videoTopic" ||
      menu.type === "image" ||
      menu.type === "video"
    ) {
      await fetchImageTopics();
    }

    if (
      menu.type === "grammarTopic" ||
      menu.type === "grammarTable"
    ) {
      await fetchGrammarTopics();
    }

    if (refreshData) {
      await refreshData();
    }
  };
  const handleAddNewDay = async () => {
    if (!menu?.item) return;

    const day = menu.item;

    const newDayName = window.prompt(
      "Enter new day name:"
    );

    if (newDayName === null) return;

    const title = newDayName.trim();

    if (!title) return;

    const { data: existingDays, error: fetchError } =
      await supabase
        .from("days")
        .select("day_number")
        .eq("course_id", day.course_id);

    if (fetchError) {
      alert(fetchError.message);
      return;
    }

    const maxDayNumber =
      existingDays?.length > 0
        ? Math.max(
          ...existingDays.map(
            (d: any) => Number(d.day_number) || 0
          )
        )
        : 0;

    const { error } = await supabase
      .from("days")
      .insert({
        course_id: day.course_id,
        day_number: maxDayNumber + 1,
        title
      });

    if (error) {
      alert(error.message);
      return;
    }

    setMenu(null);

    if (refreshData) {
      await refreshData();
    }
  };
  const handleAddNewTopic = async () => {
    if (!menu?.item) return;

    const day = menu.item;

    const newTopicName = window.prompt(
      "Enter new topic name:"
    );

    if (newTopicName === null) return;

    const topicName = newTopicName.trim();

    if (!topicName) return;

    const { data: existingTopics, error: fetchError } =
      await supabase
        .from("topics")
        .select("order_no")
        .eq("day_id", day.id);

    if (fetchError) {
      alert(fetchError.message);
      return;
    }

    const maxOrder =
      existingTopics?.length > 0
        ? Math.max(
          ...existingTopics.map(
            (t: any) => Number(t.order_no) || 0
          )
        )
        : 0;

    const { error } = await supabase
      .from("topics")
      .insert({
        day_id: day.id,
        topic_name: topicName,
        order_no: maxOrder + 1
      });

    if (error) {
      alert(error.message);
      return;
    }

    setMenu(null);

    if (refreshData) {
      await refreshData();
    }
  };
  const handleAddNewImage = () => {
    if (!menu?.item) return;

    setSelectedAddImageTopicId(menu.item.id);
    setAddImageName("");
    setSelectedAddImageFile(null);
    setShowAddImageModal(true);
    setMenu(null);
  };
  const handleSaveNewImage = async () => {
    const topicId = selectedAddImageTopicId;

    if (!topicId) {
      alert("Image topic not found.");
      return;
    }

    if (!selectedAddImageFile) {
      alert("Please select an image.");
      return;
    }

    const file = selectedAddImageFile;
    const imageName = addImageName.trim() || file.name.replace(/\.[^/.]+$/, "");

    setSavingAddImage(true);

    const { data: existingImages, error: fetchError } =
      await supabase
        .from("images")
        .select("sort_order")
        .eq("topic_id", topicId);

    if (fetchError) {
      alert(fetchError.message);
      setSavingAddImage(false);
      return;
    }

    const maxSortOrder =
      existingImages?.length > 0
        ? Math.max(
          ...existingImages.map(
            (image: any) => Number(image.sort_order) || 0
          )
        )
        : 0;

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${topicId}/${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setSavingAddImage(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("images")
      .insert({
        topic_id: topicId,
        name: imageName,
        file_path: filePath,
        sort_order: maxSortOrder + 1
      });

    if (insertError) {
      await supabase.storage
        .from("images")
        .remove([filePath]);

      alert(insertError.message);
      setSavingAddImage(false);
      return;
    }

    setShowAddImageModal(false);
    setSelectedAddImageTopicId("");
    setAddImageName("");
    setSelectedAddImageFile(null);
    setSavingAddImage(false);

    await fetchImageTopics();

    if (refreshData) {
      await refreshData();
    }

    if (refreshTopicCount) {
      await refreshTopicCount(topicId);
    }
  };
  const handleAddNewVideo = () => {
    if (!menu?.item) return;

    setSelectedAddVideoTopicId(menu.item.id);
    setAddVideoName("");
    setAddVideoUrl("");
    setShowAddVideoModal(true);
    setMenu(null);
  };
  const handleAddNewVideoTopic = () => {
    setAddVideoTopicName("");
    setShowAddVideoTopicModal(true);
    setMenu(null);
  };
  const handleSaveNewImageTopic = async () => {
    const name = addImageTopicName.trim();

    if (!name) {
      alert("Please enter image topic name.");
      return;
    }

    setSavingAddImageTopic(true);

    const { data: existingTopics, error: fetchError } =
      await supabase
        .from("image_topics")
        .select("sort_order")
        .eq("media_type", "image");

    if (fetchError) {
      alert(fetchError.message);
      setSavingAddImageTopic(false);
      return;
    }

    const maxSortOrder =
      existingTopics?.length > 0
        ? Math.max(
          ...existingTopics.map(
            (topic: any) => Number(topic.sort_order) || 0
          )
        )
        : 0;

    const { error } = await supabase
      .from("image_topics")
      .insert({
        name,
        media_type: "image",
        sort_order: maxSortOrder + 1
      });

    if (error) {
      alert(error.message);
      setSavingAddImageTopic(false);
      return;
    }

    setShowAddImageTopicModal(false);
    setAddImageTopicName("");
    setSavingAddImageTopic(false);

    await fetchImageTopics();
  };
  const handleSaveNewVideoTopic = async () => {
    const name = addVideoTopicName.trim();

    if (!name) {
      alert("Please enter video topic name.");
      return;
    }

    setSavingAddVideoTopic(true);

    const { data: existingTopics, error: fetchError } =
      await supabase
        .from("image_topics")
        .select("sort_order")
        .eq("media_type", "video");

    if (fetchError) {
      alert(fetchError.message);
      setSavingAddVideoTopic(false);
      return;
    }

    const maxSortOrder =
      existingTopics?.length > 0
        ? Math.max(
          ...existingTopics.map(
            (topic: any) => Number(topic.sort_order) || 0
          )
        )
        : 0;

    const { error } = await supabase
      .from("image_topics")
      .insert({
        name,
        media_type: "video",
        sort_order: maxSortOrder + 1
      });

    if (error) {
      alert(error.message);
      setSavingAddVideoTopic(false);
      return;
    }

    setShowAddVideoTopicModal(false);
    setAddVideoTopicName("");
    setSavingAddVideoTopic(false);

    await fetchImageTopics();
  };
  const handleSaveNewVideo = async () => {
    const topicId = selectedAddVideoTopicId;

    if (!topicId) {
      alert("Video topic not found.");
      return;
    }

    const name = addVideoName.trim();
    const videoUrl = addVideoUrl.trim();

    if (!name) {
      alert("Please enter video name.");
      return;
    }

    if (!videoUrl) {
      alert("Please enter video URL / path.");
      return;
    }

    setSavingAddVideo(true);

    const { data: existingVideos, error: fetchError } =
      await supabase
        .from("videos")
        .select("sort_order")
        .eq("topic_id", topicId);

    if (fetchError) {
      alert(fetchError.message);
      setSavingAddVideo(false);
      return;
    }

    const maxSortOrder =
      existingVideos?.length > 0
        ? Math.max(
          ...existingVideos.map(
            (v: any) => Number(v.sort_order) || 0
          )
        )
        : 0;

    const { error } = await supabase
      .from("videos")
      .insert({
        topic_id: topicId,
        name,
        source_type: "youtube",
        video_url: videoUrl,
        file_path: null,
        sort_order: maxSortOrder + 1
      });

    if (error) {
      alert(error.message);
      setSavingAddVideo(false);
      return;
    }

    setShowAddVideoModal(false);
    setSelectedAddVideoTopicId("");
    setAddVideoName("");
    setAddVideoUrl("");
    setSavingAddVideo(false);

    await fetchImageTopics();

    if (refreshData) {
      await refreshData();
    }

    if (refreshTopicCount) {
      await refreshTopicCount(topicId);
    }
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
        .select("id, name, topic_id, order_no")
        .order("order_no", { ascending: true });

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

    if (refreshTopicCount) {
      await refreshTopicCount(selectedTopicData.id);
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
  const filteredImageTopics =
    imageTopics.filter((topic: any) => {
      if (imageMediaType === "images") {
        return topic.media_type === "image";
      }

      return topic.media_type === "video";
    });
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

        <div
          onClick={() => setShowImages(prev => !prev)}
          className="w-full flex justify-between items-center px-3 py-1.5 bg-blue-100 text-[13px] font-semibold cursor-pointer"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowImages(true);
                setImageMediaType("images");
              }}
              className={`px-2 py-0.5 rounded ${imageMediaType === "images"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
                }`}
            >
              Images
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowImages(true);
                setImageMediaType("videos");
              }}
              className={`px-2 py-0.5 rounded ${imageMediaType === "videos"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600"
                }`}
            >
              Videos
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowImages(prev => !prev);
            }}
            className="ml-2 px-2 py-0.5"
          >
            {showImages ? "−" : "+"}
          </button>
        </div>


        {showImages && (

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-3">

            <div className="flex flex-col">

              {filteredImageTopics.map((topic: any) => (

                <div
                  key={topic.id}
                  className="w-full shrink-0 mb-1"
                >

                  {/* IMAGE / VIDEO TOPIC */}
                  <div
                    onContextMenu={(e) =>
                      handleContextMenu(
                        e,
                        imageMediaType === "videos" ? "videoTopic" : "imageTopic",
                        topic
                      )
                    }
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

                      {imageMediaType === "images" &&
                        topic.images?.map((image: any) => (

                          <label
                            key={image.id}
                            id={`image-item-${image.id}`}
                            onContextMenu={(e) =>
                              handleContextMenu(e, "image", image)
                            }
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
                      {imageMediaType === "videos" &&
                        topic.videos?.map((video: any) => (
                          <label
                            key={video.id}
                            id={`image-item-${video.id}`}
                            onContextMenu={(e) =>
                              handleContextMenu(e, "video", video)
                            }
                            className={`flex items-center gap-2 w-full text-[13px] cursor-pointer px-1 py-1 rounded ${selectedImageId === video.id
                              ? "bg-blue-100 text-blue-700 font-semibold"
                              : "hover:bg-gray-100"
                              }`}
                          >

                            <input
                              type="radio"
                              className="w-3.5 h-3.5 shrink-0"
                              name="selectedImage"
                              value={video.id}
                              checked={selectedImageId === video.id}
                              onChange={() =>
                                setSelectedImageId(video.id)
                              }
                            />

                            <span className="truncate min-w-0">
                              {video.name}
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
          className="w-full flex justify-between items-center px-3 py-1.5 bg-amber-100 text-[13px] font-semibold cursor-pointer"
        >
          <span>Grammar Tables</span>

          <span>
            {showGrammarTables ? "−" : "+"}
          </span>
        </button>
        {showGrammarTables && (

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-3">
            <div className="flex flex-col gap-2">
              {grammarTopics.map((topic: any) => (

                <div
                  key={topic.id}
                  id={`grammar-topic-${topic.id}`}
                  className="w-full shrink-0"
                >

                  <div
                    onClick={() => toggleGrammarTopic(topic.id)}
                    className="w-full flex justify-between items-center py-1 text-[13px] cursor-pointer"
                  >
                    <span>{topic.name}</span>

                    <span>
                      {expandedGrammarTopics.includes(topic.id) ? "−" : "+"}
                    </span>
                  </div>

                  {expandedGrammarTopics.includes(topic.id) && (

                    <div className="ml-4 mt-1 flex flex-col gap-1">

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
                          className="flex items-center gap-2 text-[13px] leading-5 min-h-[24px] h-6 shrink-0"
                        >

                          <input
                            type="radio"
                            className="w-3.5 h-3.5"
                            name="grammarTable"
                            value={table.id}
                            checked={selectedGrammarTableId === table.id}
                            onChange={() => setSelectedGrammarTableId(table.id)}
                          />

                          <span className="truncate min-w-0">
                            {table.name}
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

      <div className="p-3 shrink-0 bg-white">

        <select
          value={selectedCourse}
          onChange={(e) => {
            const courseId = e.target.value;

            setSelectedCourse(courseId);
            setExpandedDays([]);
            setSelectedDays([]);
            setSelectedTopics([]);
          }}
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
          <div
            ref={daysContainerRef}
            className="flex-1 min-h-0 overflow-y-auto px-3 pt-1 pb-3"
          >

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
                    id={`day-item-${d.id}`}
                    className="flex flex-col w-full"
                  >

                    {/* DAY ROW */}
                    <div
                      className={`sticky top-0 z-10 flex shrink-0 items-center justify-between w-full py-1 px-1 text-[13px] cursor-pointer bg-white hover:bg-gray-100 ${isSelected
                        ? "text-blue-700"
                        : "text-gray-800"
                        }`}
                      onContextMenu={(e) =>
                        handleContextMenu(e, "day", d)
                      }
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
                            t.sentence_count !== undefined
                              ? t.sentence_count
                              : t.vocabulary?.[0]?.count || 0;

                          const isTopicSelected =
                            selectedTopics.includes(t.id);

                          return (
                            <label
                              key={t.id}
                              onContextMenu={(e) =>
                                handleContextMenu(e, "topic", t)
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
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => toggleTopic(t.id)}
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
          className="fixed bg-white border shadow rounded text-sm z-50 min-w-[120px]"
          style={{ top: menu.y, left: menu.x }}
        >
          {(menu.type === "topic" || menu.grammarTable) && (
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
          )}
          {menu.type === "day" && (
            <div
              onClick={handleAddNewDay}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
            >
              Add new day
            </div>
          )}

          {menu.type === "videoTopic" && (
            <div
              onClick={handleAddNewVideoTopic}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
            >
              Add new video topic
            </div>
          )}
          {menu.type === "imageTopic" && (
            <>
              <div
                onClick={() => {
                  setAddImageTopicName("");
                  setShowAddImageTopicModal(true);
                  setMenu(null);
                }}
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
              >
                Add new image topic
              </div>

              <div
                onClick={handleAddNewImage}
                className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
              >
                Add new image
              </div>
            </>
          )}
          {menu.type === "videoTopic" && (
            <div
              onClick={handleAddNewVideo}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
            >
              Add new video
            </div>
          )}
          {menu.type === "day" && (
            <div
              onClick={handleAddNewTopic}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
            >
              Add new topic
            </div>
          )}
          <div
            onClick={handleRename}
            className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          >
            Rename
          </div>

          <div
            onClick={handleDelete}
            className="px-3 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
          >
            Delete
          </div>
        </div>
      )
      }

      {/* POPUP */}
      {
        showPopup && (
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
        )
      }
      {
        showAddVideoModal && (
          <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-[420px] max-w-[90vw]">

              <div className="px-4 py-3 border-b text-base font-semibold">
                Add New Video
              </div>

              <div className="p-4 space-y-3">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Video Name
                  </label>

                  <input
                    type="text"
                    value={addVideoName}
                    onChange={(e) =>
                      setAddVideoName(e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Enter video name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Video URL / Path
                  </label>

                  <input
                    type="text"
                    value={addVideoUrl}
                    onChange={(e) =>
                      setAddVideoUrl(e.target.value)
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Paste video URL"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 px-4 py-3 border-t">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoModal(false);
                    setSelectedAddVideoTopicId("");
                    setAddVideoName("");
                    setAddVideoUrl("");
                  }}
                  className="px-3 py-1.5 border rounded text-sm"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveNewVideo}
                  disabled={savingAddVideo}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {savingAddVideo ? "Saving..." : "OK"}
                </button>

              </div>

            </div>
          </div>
        )
      }
      {
        showAddVideoTopicModal && (
          <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-[400px] max-w-[90vw]">

              <div className="px-4 py-3 border-b text-base font-semibold">
                Add New Video Topic
              </div>

              <div className="p-4">
                <label className="block text-sm font-medium mb-1">
                  Video Topic Name
                </label>

                <input
                  type="text"
                  value={addVideoTopicName}
                  onChange={(e) =>
                    setAddVideoTopicName(e.target.value)
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter video topic name"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 px-4 py-3 border-t">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddVideoTopicModal(false);
                    setAddVideoTopicName("");
                  }}
                  className="px-3 py-1.5 border rounded text-sm"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveNewVideoTopic}
                  disabled={savingAddVideoTopic}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {savingAddVideoTopic ? "Saving..." : "OK"}
                </button>

              </div>

            </div>
          </div>
        )
      }
      {
        showAddImageModal && (
          <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-[420px] max-w-[90vw]">

              <div className="px-4 py-3 border-b text-base font-semibold">
                Add New Image
              </div>

              <div className="p-4 space-y-3">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image Name
                  </label>

                  <input
                    type="text"
                    value={addImageName}
                    onChange={(e) => setAddImageName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Enter image name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedAddImageFile(e.target.files?.[0] || null)
                    }
                    className="w-full text-sm cursor-pointer"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 px-4 py-3 border-t">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddImageModal(false);
                    setSelectedAddImageTopicId("");
                    setAddImageName("");
                    setSelectedAddImageFile(null);
                  }}
                  className="px-3 py-1.5 border rounded text-sm"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveNewImage}
                  disabled={savingAddImage}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {savingAddImage ? "Saving..." : "OK"}
                </button>

              </div>

            </div>
          </div>
        )
      }
      {showAddImageTopicModal && (
  <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-xl w-[400px] max-w-[90vw]">

      <div className="px-4 py-3 border-b text-base font-semibold">
        Add New Image Topic
      </div>

      <div className="p-4">
        <label className="block text-sm font-medium mb-1">
          Image Topic Name
        </label>

        <input
          type="text"
          value={addImageTopicName}
          onChange={(e) => setAddImageTopicName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Enter image topic name"
          autoFocus
        />
      </div>

      <div className="flex justify-end gap-2 px-4 py-3 border-t">

        <button
          type="button"
          onClick={() => {
            setShowAddImageTopicModal(false);
            setAddImageTopicName("");
          }}
          className="px-3 py-1.5 border rounded text-sm"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveNewImageTopic}
          disabled={savingAddImageTopic}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
        >
          {savingAddImageTopic ? "Saving..." : "OK"}
        </button>

      </div>

    </div>
  </div>
)}
    </div >
  );
}
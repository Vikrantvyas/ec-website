"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import WhiteBoard from "./WhiteBoard";
import CoursePlayer from "./CoursePlayer";
import ScoreCard from "./ScoreCard";
import GrammarBoard from "./GrammarBoard";
import ImageBoard from "./ImageBoard";
export default function MainBoard({
  isGrammar,
  showGrammar,
  sentences,
  visible,
  leftCol,
  rightCol,
  highlightIndex,
  setHighlightIndex,
  showBoard,
  showScore,
  showLeft,
  scrollRef,
  vocabRef,
  randomMode,
  showAll,
  currentIndex,

  // 🔥 NEW PROPS
  selectedDays,
  selectedTopics,
  setSelectedTopics,
  topics,
  layout,
  days,
  currentTime,
  selectedGrammarTableId,
  setSelectedGrammarTableId,
  selectedImageId,
  setSelectedImageId,
  showImages,
}: any) {


  const [panelOrder, setPanelOrder] = useState<string[]>([]);
  const [imageList, setImageList] = useState<any[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const fetchSelectedMedia = async () => {

      if (!selectedImageId) {
        setSelectedImage(null);
        return;
      }

      const { data: imageData } = await supabase
        .from("images")
        .select("id, name, topic_id, file_path, sort_order, created_at")
        .eq("id", selectedImageId)
        .single();

      if (imageData) {
        setSelectedImage({
          ...imageData,
          media_type: "image"
        });
        return;
      }

      const { data: videoData, error: videoError } = await supabase
        .from("videos")
        .select(
          "id, name, topic_id, source_type, video_url, file_path, sort_order, created_at"
        )
        .eq("id", selectedImageId)
        .single();

      if (videoError || !videoData) {
        console.error("SELECTED MEDIA ERROR:", videoError);
        setSelectedImage(null);
        return;
      }

      setSelectedImage({
        ...videoData,
        media_type: "video"
      });
    };

    fetchSelectedMedia();
  }, [selectedImageId]);
  useEffect(() => {
  const loadMedia = async () => {

    if (!selectedImageId) {
      setImageList([]);
      setImageIndex(0);
      return;
    }

    // IMAGE check
    const { data: imageData } = await supabase
      .from("images")
      .select("id, name, topic_id, file_path, sort_order, created_at")
      .eq("id", selectedImageId)
      .single();

    // VIDEO check
    let selectedMedia: any = imageData
      ? {
          ...imageData,
          media_type: "image"
        }
      : null;

    if (!selectedMedia) {
      const { data: videoData, error: videoError } =
        await supabase
          .from("videos")
          .select(
            "id, name, topic_id, source_type, video_url, file_path, sort_order, created_at"
          )
          .eq("id", selectedImageId)
          .single();

      if (videoError || !videoData) {
        console.error("Selected media load error:", videoError);
        return;
      }

      selectedMedia = {
        ...videoData,
        media_type: "video"
      };
    }

    // Same topic ke images
    const { data: images, error: imagesError } =
      await supabase
        .from("images")
        .select("id, name, topic_id, file_path, sort_order, created_at")
        .eq("topic_id", selectedMedia.topic_id);

    if (imagesError) {
      console.error("Image list load error:", imagesError);
      return;
    }

    // Same topic ke videos
    const { data: videos, error: videosError } =
      await supabase
        .from("videos")
        .select(
          "id, name, topic_id, source_type, video_url, file_path, sort_order, created_at"
        )
        .eq("topic_id", selectedMedia.topic_id);

    if (videosError) {
      console.error("Video list load error:", videosError);
      return;
    }

    const mediaList = [
      ...(images || []).map((image: any) => ({
        ...image,
        media_type: "image"
      })),
      ...(videos || []).map((video: any) => ({
        ...video,
        media_type: "video"
      }))
    ].sort((a: any, b: any) => {

      if ((a.sort_order ?? 0) !== (b.sort_order ?? 0)) {
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }

      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

    setImageList(mediaList);

    const index = mediaList.findIndex(
      (media: any) => media.id === selectedImageId
    );

    setImageIndex(index >= 0 ? index : 0);
  };

  loadMedia();
}, [selectedImageId]);
  const activePanels = [
    showLeft && "left",
    showGrammar && "grammar",
    showBoard && "board",
    showImages && "images",
    showScore && "score"
  ].filter(Boolean) as string[];

  useEffect(() => {
    setPanelOrder(prev => {
      const stillActive = prev.filter(panel =>
        activePanels.includes(panel)
      );

      const newlyActive = activePanels.filter(panel =>
        !prev.includes(panel)
      );

      return [...stillActive, ...newlyActive];
    });
  }, [showLeft, showGrammar, showBoard, showImages, showScore]);

  const isVertical = layout === "vertical";

  const widthClass = isVertical
    ? "w-full"
    : activePanels.length === 1
      ? "w-full"
      : activePanels.length === 2
        ? "w-1/2"
        : activePanels.length === 3
          ? "w-1/3"
          : "w-1/4";

  const handleCorrect = () => {
    vocabRef?.current?.markCorrect();
  };

  const handlePass = () => {
    vocabRef?.current?.markWrong();
  };

  const handleReset = () => {
    vocabRef?.current?.reset();
  };

  // 🔹 GROUPING LOGIC

  const handleImageNext = () => {

    if (!imageList.length) return;

    const newIndex = Math.min(
      imageList.length - 1,
      imageIndex + 1
    );

    const newImage = imageList[newIndex];

    if (!newImage) return;

    setImageIndex(newIndex);
    setSelectedImage(newImage);
    setSelectedImageId(newImage.id);

  };

  const renderPanel = (panel: string) => {

    if (panel === "left" && showLeft) {
      return (
        <div
          key="left"
          className={`${isVertical && showGrammar ? "w-full h-[30%]" : widthClass
            } flex flex-col border-l`}
        >

          <div className="bg-blue-200 font-bold px-3 py-2 text-xs border-b flex items-center">

            <span className="bg-yellow-300 px-2 rounded">
              Day {selectedDays?.map((id: any) => {
                const d = days?.find((x: any) => x.id === id);
                return d?.day_number;
              }).join(", ")}
            </span>

            <span className="bg-green-300 px-2 rounded font-normal">
              {selectedTopics?.length > 0
                ? selectedTopics.map((id: any) => {
                  const t = topics?.find((x: any) => x.id === id);
                  return t?.topic_name;
                }).join(", ")
                : "All Topics"}
            </span>

            <div className="ml-auto text-blue-800 font-bold whitespace-nowrap">
              {currentTime}
            </div>

          </div>

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-hidden text-xs"
          >

            <div className="text-xs h-full min-h-0">
              {showAll && selectedTopics?.length > 0 && (
                <div className="flex items-center justify-center gap-3 py-1 border-b bg-white">

                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg"
                    onClick={() => {

                      const currentIndex = topics.findIndex(
                        (topic: any) => topic.id === selectedTopics[0]
                      );

                      if (currentIndex <= 0) return;

                      setSelectedTopics([
                        topics[currentIndex - 1].id
                      ]);
                    }}
                  >
                    ←
                  </button>

                  <span className="text-xs font-medium text-gray-600">
                    Topic
                  </span>

                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-lg"
                    onClick={() => {

                      const currentIndex = topics.findIndex(
                        (topic: any) => topic.id === selectedTopics[0]
                      );

                      if (
                        currentIndex < 0 ||
                        currentIndex >= topics.length - 1
                      ) return;

                      setSelectedTopics([
                        topics[currentIndex + 1].id
                      ]);
                    }}
                  >
                    →
                  </button>

                </div>
              )}
              <CoursePlayer
                ref={vocabRef}
                data={sentences}
                random={randomMode}
                showAll={showAll}
                compact={true}
                highlightIndex={highlightIndex}
                setHighlightIndex={setHighlightIndex}
              />
            </div>

          </div>

        </div>
      );
    }

    if (panel === "grammar" && showGrammar) {
      return (
        <div
          key="grammar"
          className={`${isVertical && showLeft ? "w-full h-[70%]" : widthClass
            } ${isVertical ? "border-t" : "border-l"} flex`}
        >
          <GrammarBoard
            selectedGrammarTableId={selectedGrammarTableId}
            onTableChange={setSelectedGrammarTableId}
          />
        </div>
      );
    }
    if (panel === "images" && showImages) {
      return (
        <div
          key="images"
          className={`${widthClass} ${isVertical ? "border-t" : "border-l"
            } flex`}
        >
          {selectedImage ? (
            <ImageBoard
              images={imageList}
              currentIndex={imageIndex}

              onPrevious={() => {

                const newIndex =
                  Math.max(0, imageIndex - 1);

                const newImage =
                  imageList[newIndex];

                if (!newImage) return;

                setImageIndex(newIndex);

                setSelectedImage(
                  newImage
                );

                setSelectedImageId(
                  newImage.id
                );

              }}

              onNext={() => {

                const newIndex =
                  Math.min(
                    imageList.length - 1,
                    imageIndex + 1
                  );

                const newImage =
                  imageList[newIndex];

                if (!newImage) return;

                setImageIndex(newIndex);

                setSelectedImage(
                  newImage
                );

                setSelectedImageId(
                  newImage.id
                );

              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Select an image
            </div>
          )}
        </div>
      );
    }
    if (panel === "board" && showBoard) {
      return (
        <div
          key="board"
          className={`${widthClass} ${isVertical ? "border-t" : "border-l"
            } flex`}
        >
          <WhiteBoard />
        </div>
      );
    }

    if (panel === "score" && showScore) {
      return (
        <div
          key="score"
          className={`${widthClass} ${isVertical ? "border-t" : "border-l"} flex`}
        >
          <ScoreCard
            onCorrect={handleCorrect}
            onPass={handlePass}
            onReset={handleReset}
            imageMode={showImages && !!selectedImage}
            onImageNext={handleImageNext}
          />
        </div>
      );
    }

    return null;
  };
  return (
    <>
      <div
        className={`flex flex-1 overflow-hidden ${isVertical ? "flex-col" : "flex-row"
          }`}
      >
        {panelOrder.map(renderPanel)}
      </div>
    </>
  );
}


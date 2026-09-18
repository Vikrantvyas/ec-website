"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, useRef } from "react";
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
  isConversation,
  conversationImageUrl,
  conversationMobileImageUrl,
  isImageExplanation,
  studentMode,
  selectedReactionMeme,
}: any) {


  const [panelOrder, setPanelOrder] = useState<string[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightPaths, setHighlightPaths] = useState<string[]>([]);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsHighlighting(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsHighlighting(false);
        isDrawingRef.current = false;
        currentPathRef.current = "";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleHighlightStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHighlighting) return;

    isDrawingRef.current = true;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPathRef.current = `M ${x} ${y}`;
  };

  const handleHighlightMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHighlighting || !isDrawingRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPathRef.current += ` L ${x} ${y}`;

    setHighlightPaths(prev => {
      const paths = [...prev];
      paths[paths.length - 1] = currentPathRef.current;
      return paths;
    });
  };

  const handleHighlightEnd = () => {
    isDrawingRef.current = false;
    currentPathRef.current = "";
  };
  const [imageList, setImageList] = useState<any[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showReactionMeme, setShowReactionMeme] = useState(false);
  const reactionVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (
      showReactionMeme &&
      selectedReactionMeme?.media_type === "video" &&
      reactionVideoRef.current
    ) {
      const video = reactionVideoRef.current;

      video.currentTime = 0;
      video.muted = true;

      video.play().catch((error) => {
        console.log("Reaction video autoplay error:", error);
      });
    }
  }, [showReactionMeme, selectedReactionMeme]);
  useEffect(() => {
    if (!selectedReactionMeme?.mediaUrl) {
      setShowReactionMeme(false);
      return;
    }

    setShowReactionMeme(true);

    if (selectedReactionMeme.media_type === "image") {
      const timer = setTimeout(() => {
        setShowReactionMeme(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [selectedReactionMeme]);

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
            } flex flex-col ${studentMode ? "" : "border-l"}`}
        >

          {!isConversation && !isImageExplanation && (
            <div className="bg-blue-200 font-bold px-3 py-2 text-xs border-b flex items-center">

              {!studentMode && (
                <span className="bg-yellow-300 px-2 rounded">
                  Day {selectedDays?.map((id: any) => {
                    const d = days?.find((x: any) => x.id === id);
                    return d?.day_number;
                  }).join(", ")}
                </span>
              )}

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
          )}

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-hidden text-xs"
          >

            <div className="text-xs h-full min-h-0">

              <CoursePlayer
                ref={vocabRef}
                data={sentences}
                random={randomMode}
                showAll={showAll}
                compact={true}
                highlightIndex={highlightIndex}
                setHighlightIndex={setHighlightIndex}
                isConversation={isConversation}
                conversationImageUrl={conversationImageUrl}
                conversationMobileImageUrl={conversationMobileImageUrl}
                isImageExplanation={isImageExplanation}
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
            } flex relative`}
          onMouseDown={handleHighlightStart}
          onMouseMove={handleHighlightMove}
          onMouseUp={handleHighlightEnd}
          onMouseLeave={handleHighlightEnd}
        >
          <WhiteBoard />

          {isHighlighting && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-50"
            >
              {highlightPaths.map((path, index) => (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke="red"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
              ))}
            </svg>
          )}
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
        className={`relative flex flex-1 overflow-hidden ${isVertical ? "flex-col" : "flex-row"
          }`}
      >
        {panelOrder.map(renderPanel)}

        {showReactionMeme && selectedReactionMeme?.mediaUrl && (
          <div className="absolute top-0 left-0 right-0 bottom-0 z-[9990] pointer-events-none flex items-center justify-center">
            {selectedReactionMeme.media_type === "image" && (
              <img
                src={selectedReactionMeme.mediaUrl}
                alt={selectedReactionMeme.name}
                className="w-1/2 h-1/2 object-contain pointer-events-auto"
              />
            )}

            {selectedReactionMeme.media_type === "video" && (
              <video
    src={selectedReactionMeme.mediaUrl}
    controls
    autoPlay
    playsInline
                onEnded={() => setShowReactionMeme(false)}
                className="w-1/2 h-1/2 object-contain pointer-events-auto"
              />
            )}

            {selectedReactionMeme.media_type === "audio" && (
              <div className="w-[500px] p-6 bg-white flex flex-col items-center gap-4 pointer-events-auto">
                <div className="text-3xl">🔊</div>

                <div className="font-semibold text-lg text-center">
                  {selectedReactionMeme.name}
                </div>

                <audio
                  src={selectedReactionMeme.mediaUrl}
                  controls
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

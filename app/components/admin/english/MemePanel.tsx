"use client";

import { useEffect, useState } from "react";
import { Film, Image as ImageIcon, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type MemeType = "image" | "video" | "audio";

type ReactionMeme = {
    id: string;
    name: string;
    media_type: MemeType;
    image_path: string | null;
    video_path: string | null;
    sound_path: string | null;
    thumbnail_path: string | null;
    sort_order: number | null;
};

export default function MemePanel({
    onSelectMeme,
}: {
    onSelectMeme: (meme: any) => void;
}) {
    const [memes, setMemes] = useState<ReactionMeme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemes();
    }, []);

    const fetchMemes = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("reaction_memes")
            .select(
                "id, name, media_type, image_path, video_path, sound_path, thumbnail_path, sort_order"
            )
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Reaction memes load error:", error);
            setMemes([]);
            setLoading(false);
            return;
        }

        setMemes((data || []) as ReactionMeme[]);
        setLoading(false);
    };

    const getMediaPath = (meme: ReactionMeme) => {
        if (meme.media_type === "image") {
            return meme.image_path || "";
        }

        if (meme.media_type === "video") {
            return meme.video_path || "";
        }

        return meme.sound_path || "";
    };

    const getPublicUrl = (path: string) => {
        if (!path) return "";

        // Already a complete URL
        if (
            path.startsWith("http://") ||
            path.startsWith("https://")
        ) {
            return path;
        }

        // Avoid memes/memes/... if bucket name is included
        const cleanPath = path.startsWith("memes/")
            ? path.substring("memes/".length)
            : path;

        const { data } = supabase.storage
            .from("memes")
            .getPublicUrl(cleanPath);

        return data.publicUrl;
    };

    const renderPreview = (meme: ReactionMeme) => {
        const mediaPath = getMediaPath(meme);
        const mediaUrl = getPublicUrl(mediaPath);

        if (!mediaUrl) {
            return (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Preview
                </div>
            );
        }

        if (meme.media_type === "image") {
            return (
                <img
                    src={mediaUrl}
                    alt={meme.name}
                    className="w-full h-full object-contain"
                />
            );
        }

        if (meme.media_type === "video") {
    const thumbnailUrl = getPublicUrl(meme.thumbnail_path || "");

    if (thumbnailUrl) {
        return (
            <img
                src={thumbnailUrl}
                alt={meme.name}
                className="w-full h-full object-contain"
            />
        );
    }

    return (
        <video
            src={mediaUrl}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-contain pointer-events-none"
        />
    );
}

        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-1">
                <div className="text-2xl">🔊</div>

                <audio
                    src={mediaUrl}
                    controls
                    preload="metadata"
                    className="w-full h-8"
                />
            </div>
        );
    };

    return (
        <div
            className="
                w-[180px]
                h-full
                shrink-0
                bg-white
                border
                shadow
                flex
                flex-col
                overflow-hidden
            "
        >
           

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        Loading...
                    </div>
                ) : memes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        No Reaction Memes
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-1">
                        {memes.map((meme) => (
                            <div
                                key={meme.id}
                                className="overflow-hidden"
                            >
                                <div
                                    className="relative h-[95px] bg-gray-50 cursor-pointer hover:ring-2 hover:ring-blue-400"
                                    title={meme.name}
                                    onClick={() => {
                                        const mediaPath = getMediaPath(meme);
                                        const mediaUrl = getPublicUrl(mediaPath);

                                        if (!mediaUrl) return;

                                        onSelectMeme({
                                            ...meme,
                                            mediaUrl,
                                            toggle: true,
                                        });
                                    }}
                                >
                                    {renderPreview(meme)}

                                    <div
                                        className={`
    absolute
    bottom-1
    right-1
    w-6
    h-6
    rounded-full
    text-white
    flex
    items-center
    justify-center
    shadow
    ${
        meme.media_type === "video"
            ? "bg-red-600"
            : meme.media_type === "image"
                ? "bg-blue-600"
                : "bg-green-600"
    }
`}
                                    >
                                        {meme.media_type === "video" && (
                                            <Film size={14} strokeWidth={2.5} />
                                        )}

                                        {meme.media_type === "image" && (
                                            <ImageIcon size={14} strokeWidth={2.5} />
                                        )}

                                        {meme.media_type === "audio" && (
                                            <Volume2 size={14} strokeWidth={2.5} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
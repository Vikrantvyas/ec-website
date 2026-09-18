"use client";

import { useEffect, useState } from "react";
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
            return (
                <video
                    src={mediaUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
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
                h-[12cm]
                shrink-0
                bg-white
                border
                shadow
                flex
                flex-col
                overflow-hidden
            "
        >
            {/* Header */}
            <div className="px-3 py-2 border-b bg-gray-50">
                <div className="font-semibold text-sm">
                    Reaction Memes
                </div>
            </div>

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
                    <div className="grid grid-cols-2 gap-1">
                        {memes.map((meme) => (
                            <div
    key={meme.id}
    className="
        border
        rounded
        overflow-hidden
        bg-white
    "
>
    <div className="h-[65px] bg-gray-50 pointer-events-none">
        {renderPreview(meme)}
    </div>

    <div
        className="
            px-1
            py-1
            text-[10px]
            font-medium
            text-center
            truncate
        "
        title={meme.name}
    >
        {meme.name}
    </div>

    <button
        type="button"
        onClick={() => {
            const mediaPath = getMediaPath(meme);
            const mediaUrl = getPublicUrl(mediaPath);

            if (!mediaUrl) return;

            onSelectMeme({
                ...meme,
                mediaUrl,
            });
        }}
        className="
            w-full
            py-1
            text-[10px]
            font-semibold
            bg-blue-50
            text-blue-700
            hover:bg-blue-100
            border-t
        "
    >
        ▶ Show
    </button>
</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
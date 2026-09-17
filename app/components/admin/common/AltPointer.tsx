"use client";

import { useEffect, useState } from "react";

type Position = {
    x: number;
    y: number;
};

export default function AltPointer() {
    const [active, setActive] = useState(false);

    const [position, setPosition] = useState<Position>({
        x: 0,
        y: 0,
    });

    const [pinnedArrows, setPinnedArrows] = useState<Position[]>(
        []
    );

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Alt") {
                e.preventDefault();
                setActive(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt") {
                e.preventDefault();
                setActive(false);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            const clickX = e.clientX;
            const clickY = e.clientY;

            // -----------------------------------------
            // Ctrl + Right Click → Remove ALL arrows
            // -----------------------------------------

            if (e.ctrlKey) {
                e.preventDefault();
                setPinnedArrows([]);
                setActive(false);
                return;
            }

            // -----------------------------------------
            // Alt + Right Click → Add new arrow
            // -----------------------------------------

            if (active) {
                e.preventDefault();

                setPinnedArrows((prev) => [
                    ...prev,
                    {
                        x: clickX,
                        y: clickY,
                    },
                ]);

                return;
            }

            // -----------------------------------------
            // Right Click on existing arrow → Remove it
            // -----------------------------------------

            const arrowIndex = pinnedArrows.findIndex(
                (arrow) => {
                    const distance = Math.sqrt(
                        Math.pow(arrow.x - clickX, 2) +
                            Math.pow(arrow.y - clickY, 2)
                    );

                    return distance <= 50;
                }
            );

            if (arrowIndex !== -1) {
                e.preventDefault();

                setPinnedArrows((prev) =>
                    prev.filter(
                        (_, index) => index !== arrowIndex
                    )
                );
            }
        };

        const handleBlur = () => {
            setActive(false);
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        window.addEventListener(
            "keydown",
            handleKeyDown,
            true
        );

        window.addEventListener(
            "keyup",
            handleKeyUp,
            true
        );

        window.addEventListener(
            "contextmenu",
            handleContextMenu,
            true
        );

        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            window.removeEventListener(
                "keydown",
                handleKeyDown,
                true
            );

            window.removeEventListener(
                "keyup",
                handleKeyUp,
                true
            );

            window.removeEventListener(
                "contextmenu",
                handleContextMenu,
                true
            );

            window.removeEventListener("blur", handleBlur);

            document.body.style.cursor = "";
        };
    }, [active, pinnedArrows]);

    // -----------------------------------------
    // Hide Normal Cursor
    // -----------------------------------------

    useEffect(() => {
        document.body.style.cursor = active
            ? "none"
            : "";

        return () => {
            document.body.style.cursor = "";
        };
    }, [active]);

    // -----------------------------------------
    // Arrow Component
    // -----------------------------------------

    const Arrow = () => (
        <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
        >
            {/* White outer stroke */}

            <path
                d="M50 8 C50 30, 50 52, 50 76"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
            />

            <path
                d="M50 76 L34 58 M50 76 L66 58"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Red arrow */}

            <path
                d="M50 8 C50 30, 50 52, 50 76"
                stroke="red"
                strokeWidth="6"
                strokeLinecap="round"
            />

            <path
                d="M50 76 L34 58 M50 76 L66 58"
                stroke="red"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    if (!active && pinnedArrows.length === 0) {
        return null;
    }

    return (
        <>
            <style jsx>{`
                @keyframes altPointerMove {
                    from {
                        transform: translateY(-6px);
                    }

                    to {
                        transform: translateY(6px);
                    }
                }
            `}</style>

            {/* ----------------------------------------- */}
            {/* Pinned Arrows */}
            {/* ----------------------------------------- */}

            {pinnedArrows.map((arrow, index) => (
                <div
                    key={index}
                    className="fixed z-[99998] pointer-events-none"
                    style={{
                        left: arrow.x - 50,
                        top: arrow.y - 50,
                        animation:
                            "altPointerMove 0.8s ease-in-out infinite alternate",
                    }}
                >
                    <Arrow />
                </div>
            ))}

            {/* ----------------------------------------- */}
            {/* Current Moving Arrow */}
            {/* ----------------------------------------- */}

            {active && (
                <div
                    className="fixed z-[99999] pointer-events-none"
                    style={{
                        left: position.x - 50,
                        top: position.y - 50,
                        animation:
                            "altPointerMove 0.8s ease-in-out infinite alternate",
                    }}
                >
                    <Arrow />
                </div>
            )}
        </>
    );
}
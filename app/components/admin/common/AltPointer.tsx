"use client";

import { useEffect, useState } from "react";

type Direction = "up" | "down" | "right" | "left";
type PointerMode = "arrow" | "dot";

type Position = {
    x: number;
    y: number;
    direction: Direction;
};

type PinnedPointer = Position & {
    mode: PointerMode;
};

export default function AltPointer() {
    const [active, setActive] = useState(false);

    const [pointerMode, setPointerMode] =
        useState<PointerMode>("arrow");

    const [position, setPosition] = useState<Position>({
        x: 0,
        y: 0,
        direction: "down",
    });

    const [pinnedPointers, setPinnedPointers] =
        useState<PinnedPointer[]>([]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition((prev) => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
            }));
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // -----------------------------------------
            // Alt + Ctrl → Blue Dot Mode
            // -----------------------------------------

            if (e.altKey && e.ctrlKey) {
                e.preventDefault();

                setActive(true);
                setPointerMode("dot");

                return;
            }

            // -----------------------------------------
            // Alt + Arrow Keys → Arrow Mode
            // -----------------------------------------

            if (e.altKey) {
                let direction: Direction | null = null;

                if (e.key === "ArrowUp") {
                    direction = "up";
                }

                if (e.key === "ArrowRight") {
                    direction = "right";
                }

                if (e.key === "ArrowLeft") {
                    direction = "left";
                }

                if (e.key === "ArrowDown") {
                    direction = "down";
                }

                if (direction) {
                    e.preventDefault();

                    setActive(true);
                    setPointerMode("arrow");

                    setPosition((prev) => ({
                        ...prev,
                        direction,
                    }));

                    return;
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // -----------------------------------------
            // Release Alt → Hide Moving Pointer
            // -----------------------------------------

            if (e.key === "Alt") {
                e.preventDefault();
                setActive(false);
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            const clickX = e.clientX;
            const clickY = e.clientY;

            // -----------------------------------------
            // Alt + Right Click → Pin Current Pointer
            // -----------------------------------------

            if (active) {
                e.preventDefault();

                setPinnedPointers((prev) => [
                    ...prev,
                    {
                        x: clickX,
                        y: clickY,
                        direction: position.direction,
                        mode: pointerMode,
                    },
                ]);

                return;
            }

            // -----------------------------------------
            // Ctrl + Right Click → Remove ALL
            // -----------------------------------------

            if (e.ctrlKey) {
                e.preventDefault();

                setPinnedPointers([]);
                setActive(false);

                return;
            }

            // -----------------------------------------
            // Right Click on Existing Pointer → Remove
            // -----------------------------------------

            const pointerIndex =
                pinnedPointers.findIndex((pointer) => {
                    const distance = Math.sqrt(
                        Math.pow(
                            pointer.x - clickX,
                            2
                        ) +
                        Math.pow(
                            pointer.y - clickY,
                            2
                        )
                    );

                    return distance <= 50;
                });

            if (pointerIndex !== -1) {
                e.preventDefault();

                setPinnedPointers((prev) =>
                    prev.filter(
                        (_, index) =>
                            index !== pointerIndex
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

        window.addEventListener(
            "blur",
            handleBlur
        );

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

            window.removeEventListener(
                "blur",
                handleBlur
            );

            document.body.style.cursor = "";
        };
    }, [
        active,
        pointerMode,
        position.direction,
        pinnedPointers,
    ]);

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
    // Blue Dot Component
    // -----------------------------------------

    const BlueDot = () => (
        <div className="relative w-[50px] h-[50px] flex items-center justify-center">
            <div className="absolute w-[46px] h-[46px] rounded-full bg-blue-400/25 animate-ping" />

            <div className="absolute w-[30px] h-[30px] rounded-full bg-blue-500/25" />

            <div className="relative w-[18px] h-[18px] rounded-full bg-blue-600 border-[3px] border-white shadow-lg" />
        </div>
    );

    // -----------------------------------------
    // Arrow Component
    // -----------------------------------------

    const Arrow = ({
        direction,
    }: {
        direction: Direction;
    }) => (
        <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            style={{
                transform:
                    direction === "right"
                        ? "rotate(-90deg)"
                        : direction === "left"
                            ? "rotate(90deg)"
                            : direction === "up"
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
            }}
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

    if (
        !active &&
        pinnedPointers.length === 0
    ) {
        return null;
    }

    return (
        <>
            <style jsx>{`
                @keyframes altPointerVertical {
                    from {
                        transform: translateY(-6px);
                    }

                    to {
                        transform: translateY(6px);
                    }
                }

                @keyframes altPointerHorizontal {
                    from {
                        transform: translateX(-6px);
                    }

                    to {
                        transform: translateX(6px);
                    }
                }
            `}</style>

            {/* ----------------------------------------- */}
            {/* Pinned Pointers */}
            {/* ----------------------------------------- */}

            {pinnedPointers.map(
                (pointer, index) => (
                    <div
                        key={index}
                        className="fixed z-[99998] pointer-events-none"
                        style={{
                            left:
                                pointer.x -
                                (pointer.mode === "dot"
                                    ? 25
                                    : 50),

                            top:
                                pointer.y -
                                (pointer.mode === "dot"
                                    ? 25
                                    : 50),

                            animation:
                                pointer.mode === "arrow"
                                    ? pointer.direction === "left" ||
                                      pointer.direction === "right"
                                        ? "altPointerHorizontal 0.8s ease-in-out infinite alternate"
                                        : "altPointerVertical 0.8s ease-in-out infinite alternate"
                                    : undefined,
                        }}
                    >
                        {pointer.mode === "dot" ? (
                            <BlueDot />
                        ) : (
                            <Arrow
                                direction={
                                    pointer.direction
                                }
                            />
                        )}
                    </div>
                )
            )}

            {/* ----------------------------------------- */}
            {/* Current Moving Pointer */}
            {/* ----------------------------------------- */}

            {active && (
                <div
                    className="fixed z-[99999] pointer-events-none"
                    style={{
                        left:
                            position.x -
                            (pointerMode === "dot"
                                ? 25
                                : 50),

                        top:
                            position.y -
                            (pointerMode === "dot"
                                ? 25
                                : 50),

                        animation:
                            pointerMode === "arrow"
                                ? position.direction === "left" ||
                                  position.direction === "right"
                                    ? "altPointerHorizontal 0.8s ease-in-out infinite alternate"
                                    : "altPointerVertical 0.8s ease-in-out infinite alternate"
                                : undefined,
                    }}
                >
                    {pointerMode === "dot" ? (
                        <BlueDot />
                    ) : (
                        <Arrow
                            direction={
                                position.direction
                            }
                        />
                    )}
                </div>
            )}
        </>
    );
}
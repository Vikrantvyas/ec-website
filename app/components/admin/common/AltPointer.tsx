"use client";

import { useEffect, useState } from "react";

export default function AltPointer() {
    const [active, setActive] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

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

        const handleBlur = () => {
            setActive(false);
        };

        window.addEventListener("mousemove", handleMouseMove);

        window.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("keyup", handleKeyUp, true);

        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);

            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("keyup", handleKeyUp, true);

            window.removeEventListener("blur", handleBlur);

            document.body.style.cursor = "";
        };
    }, []);

    useEffect(() => {
        document.body.style.cursor = active ? "none" : "";

        return () => {
            document.body.style.cursor = "";
        };
    }, [active]);

    if (!active) return null;

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

            <div
                className="fixed z-[99999] pointer-events-none"
                style={{
                    left: position.x - 50,
                    top: position.y - 50,
                    animation:
                        "altPointerMove 0.8s ease-in-out infinite alternate",
                }}
            >
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
            </div>
        </>
    );
}
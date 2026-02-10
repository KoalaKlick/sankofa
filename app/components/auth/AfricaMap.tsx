"use client";

import { useEffect, useState, useMemo, memo } from "react";
import { africaPaths, type CountryPath } from "../../auth/africa-paths";

// Pan-African inspired color palette
const PAN_AFRICAN_COLORS = [
    "#E31B23", "#FCD116", "#009739", "#000000",
    "#CE1126", "#007A3D", "#F0E130", "#C8102E", "#006B3F"
] as const;

interface AfricaMapProps {
    readonly images: readonly string[];
    readonly interval?: number;
    readonly showHoverColor?: boolean;
    readonly showTransitionColor?: boolean;
    readonly staggerDelay?: number;
}

// Static country path - no animation library needed
const CountryPathComponent = memo(function CountryPathComponent({
    country,
    color,
    revealDelay,
    currentImageIdx,
    isRevealed,
    showColorPulse,
    showHoverColor,
}: {
    country: CountryPath;
    color: string;
    revealDelay: number;
    currentImageIdx: number;
    isRevealed: boolean;
    showColorPulse: boolean;
    showHoverColor: boolean;
}) {
    return (
        <g className="country-group">
            {/* Main image layer */}
            <path
                d={country.d}
                fill={`url(#map-image-${currentImageIdx})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.6"
                style={{
                    opacity: isRevealed ? 1 : 0,
                    transition: `opacity 0.3s ease-out ${revealDelay}s`,
                }}
            />

            {/* Color pulse layer - CSS animation */}
            {showColorPulse && (
                <path
                    d={country.d}
                    fill={color}
                    className="animate-pulse-fade"
                    style={{
                        animationDelay: `${revealDelay}s`,
                    }}
                />
            )}

            {/* Hover layer */}
            {showHoverColor && (
                <path
                    d={country.d}
                    fill={color}
                    className="cursor-pointer transition-opacity duration-150 opacity-0 hover:opacity-85"
                    style={{ pointerEvents: "all" }}
                />
            )}
        </g>
    );
});

export default function AfricaMap({
    images,
    interval = 10000,
    showHoverColor = true,
    showTransitionColor = true,
    staggerDelay = 0.02,
}: AfricaMapProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [showInitialPulse, setShowInitialPulse] = useState(true);

    // Stable randomized reveal order - computed once
    const revealOrder = useMemo(() => {
        const indices = africaPaths.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }, []);

    // Colors per country
    const colorMap = useMemo(
        () => africaPaths.map((_, i) => PAN_AFRICAN_COLORS[i % PAN_AFRICAN_COLORS.length]),
        []
    );

    // Trigger reveal on mount
    useEffect(() => {
        // Small delay to ensure CSS is ready
        const revealTimer = requestAnimationFrame(() => setIsRevealed(true));
        
        // Hide pulse after animation completes
        const pulseTimer = setTimeout(() => {
            setShowInitialPulse(false);
        }, africaPaths.length * staggerDelay * 1000 + 600);

        return () => {
            cancelAnimationFrame(revealTimer);
            clearTimeout(pulseTimer);
        };
    }, [staggerDelay]);

    // Image cycling
    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, [images.length, interval]);

    // Calculate delay for each country
    const getRevealDelay = (originalIndex: number) => {
        return revealOrder.indexOf(originalIndex) * staggerDelay;
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* CSS for pulse animation */}
            <style>{`
                @keyframes pulse-fade {
                    0% { opacity: 0; }
                    40% { opacity: 0.85; }
                    100% { opacity: 0; }
                }
                .animate-pulse-fade {
                    animation: pulse-fade 0.4s ease-out forwards;
                    will-change: opacity;
                }
            `}</style>

            <svg
                viewBox="0 0 1000 1001"
                className="absolute inset-0 w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                aria-labelledby="africa-map-title"
            >
                <title id="africa-map-title">Africa Map</title>
                <defs>
                    {images.map((img, idx) => (
                        <pattern
                            key={img}
                            id={`map-image-${idx}`}
                            patternUnits="userSpaceOnUse"
                            width="1000"
                            height="1001"
                        >
                            <image
                                href={img}
                                width="1000"
                                height="1001"
                                preserveAspectRatio="xMidYMid slice"
                            />
                        </pattern>
                    ))}

                    <filter id="sepia-overlay">
                        <feColorMatrix
                            type="matrix"
                            values="0.393 0.769 0.189 0 0
                                    0.349 0.686 0.168 0 0
                                    0.272 0.534 0.131 0 0
                                    0 0 0 1 0"
                        />
                    </filter>
                </defs>

                {/* Sepia background */}
                <image
                    href={images[currentIdx]}
                    width="1000"
                    height="1001"
                    preserveAspectRatio="xMidYMid slice"
                    filter="url(#sepia-overlay)"
                    opacity="0.4"
                    className="transition-opacity duration-500"
                />

                {/* Country paths */}
                <g id="africa-countries">
                    {africaPaths.map((country, idx) => (
                        <CountryPathComponent
                            key={country.id}
                            country={country}
                            color={colorMap[idx]}
                            revealDelay={getRevealDelay(idx)}
                            currentImageIdx={currentIdx}
                            isRevealed={isRevealed}
                            showColorPulse={showInitialPulse || showTransitionColor}
                            showHoverColor={showHoverColor}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}

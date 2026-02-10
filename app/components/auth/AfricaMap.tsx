"use client";

import { motion } from "motion/react";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { africaPaths, type CountryPath } from "../../auth/africa-paths";

// Pan-African inspired color palette
const PAN_AFRICAN_COLORS = [
    "#E31B23", // Red
    "#FCD116", // Gold/Yellow
    "#009739", // Green
    "#000000", // Black
    "#CE1126", // Deep Red
    "#007A3D", // Dark Green
    "#F0E130", // Bright Yellow
    "#C8102E", // Crimson
    "#006B3F", // Forest Green
] as const;

interface AfricaMapProps {
    readonly images: readonly string[];
    readonly interval?: number;
    readonly showHoverColor?: boolean;
    readonly showTransitionColor?: boolean;
    readonly staggerDelay?: number;
}

// Memoized country path component to prevent unnecessary re-renders
const CountryPathGroup = memo(function CountryPathGroup({
    country,
    color,
    revealDelay,
    currentImageIdx,
    prevImageIdx,
    isInitialLoad,
    showHoverColor,
    showTransitionColor,
    transitionKey,
}: {
    country: CountryPath;
    color: string;
    revealDelay: number;
    currentImageIdx: number;
    prevImageIdx: number | null;
    isInitialLoad: boolean;
    showHoverColor: boolean;
    showTransitionColor: boolean;
    transitionKey: number;
}) {
    return (
        <g>
            {/* Base layer: Previous image stays visible until new one reveals */}
            {prevImageIdx !== null && (
                <path
                    d={country.d}
                    fill={`url(#map-image-${prevImageIdx})`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                />
            )}

            {/* Reveal layer: New image fades in on top, country by country */}
            <motion.path
                key={`reveal-${country.id}-${transitionKey}`}
                d={country.d}
                fill={`url(#map-image-${currentImageIdx})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    delay: revealDelay,
                    duration: 0.25,
                    ease: "easeOut"
                }}
            />

            {/* Color pulse: On initial load AND on image transitions (when enabled) */}
            {(isInitialLoad || showTransitionColor) && (
                <motion.path
                    key={`pulse-${country.id}-${transitionKey}`}
                    d={country.d}
                    fill={color}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, isInitialLoad ? 0.9 : 0.6, 0] }}
                    transition={{
                        duration: isInitialLoad ? 0.4 : 0.3,
                        times: [0, 0.4, 1],
                        delay: revealDelay,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                />
            )}

            {/* Hover interaction layer */}
            {showHoverColor && (
                <motion.path
                    d={country.d}
                    fill={color}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.85 }}
                    transition={{ duration: 0.15 }}
                    className="cursor-pointer"
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
    staggerDelay = 0.025,
}: AfricaMapProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [prevIdx, setPrevIdx] = useState<number | null>(null);
    const [hasAnimatedOnce, setHasAnimatedOnce] = useState(false);
    const [transitionKey, setTransitionKey] = useState(0);

    // Stable randomized reveal order - computed once on mount
    const revealOrder = useMemo(() => {
        const indices = africaPaths.map((_, i) => i);
        // Fisher-Yates shuffle for better randomization
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }, []);

    // Pre-compute color assignments
    const colorMap = useMemo(
        () => africaPaths.map((_, i) => PAN_AFRICAN_COLORS[i % PAN_AFRICAN_COLORS.length]),
        []
    );

    // Image cycling with previous tracking
    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setPrevIdx(currentIdx);
            setCurrentIdx((prev) => (prev + 1) % images.length);
            setTransitionKey((prev) => prev + 1);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval, currentIdx]);

    // Track when initial animation completes
    useEffect(() => {
        if (!hasAnimatedOnce) {
            const totalDuration = africaPaths.length * staggerDelay * 1000 + 500;
            const timer = setTimeout(() => setHasAnimatedOnce(true), totalDuration);
            return () => clearTimeout(timer);
        }
    }, [hasAnimatedOnce, staggerDelay]);

    // Calculate reveal delay for each country
    const getRevealDelay = useCallback(
        (originalIndex: number) => {
            const orderIndex = revealOrder.indexOf(originalIndex);
            return orderIndex * staggerDelay;
        },
        [revealOrder, staggerDelay]
    );

    return (
        <div className="relative w-full h-full overflow-hidden">
            <svg
                viewBox="0 0 1000 1001"
                className="absolute inset-0 w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
                aria-labelledby="africa-map-title"
            >
                <title id="africa-map-title">Africa Map</title>
                <defs>
                    {/* Image patterns for clip-path fills */}
                    {images.map((img) => (
                        <pattern
                            key={`pattern-${img}`}
                            id={`map-image-${images.indexOf(img)}`}
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

                    {/* Sepia filter for background */}
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

                {/* Background sepia layer */}
                <image
                    href={images[currentIdx]}
                    width="1000"
                    height="1001"
                    preserveAspectRatio="xMidYMid slice"
                    filter="url(#sepia-overlay)"
                    opacity="0.4"
                />

                {/* Country paths with staggered reveal animation */}
                <g id="africa-countries">
                    {africaPaths.map((country, idx) => (
                        <CountryPathGroup
                            key={country.id}
                            country={country}
                            color={colorMap[idx]}
                            revealDelay={getRevealDelay(idx)}
                            currentImageIdx={currentIdx}
                            prevImageIdx={prevIdx}
                            isInitialLoad={!hasAnimatedOnce}
                            showHoverColor={showHoverColor}
                            showTransitionColor={showTransitionColor}
                            transitionKey={transitionKey}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}

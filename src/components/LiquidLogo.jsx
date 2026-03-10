import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './LiquidLogo.css';

const LiquidLogo = ({ src, alt, className = '' }) => {
    const containerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for the mask position
    const smoothX = useSpring(mouseX, { damping: 25, stiffness: 200, mass: 0.5 });
    const smoothY = useSpring(mouseY, { damping: 25, stiffness: 200, mass: 0.5 });

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Calculate normalized position relative to the center
        // We want the mask to follow the cursor precisely
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <div
            className={`liquid-logo-container ${className}`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* SVG Filter Definition: Cyberpunk Holographic Distortion */}
            <svg width="0" height="0" className="liquid-svg-filter" aria-hidden="true">
                <filter id="liquid-distortion" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
                    {/* Noise Layer */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.02 0.05"
                        numOctaves="3"
                        result="noise"
                    >
                        {isHovered && (
                            <animate
                                attributeName="baseFrequency"
                                dur="4s"
                                values="0.02 0.05; 0.04 0.01; 0.02 0.05"
                                repeatCount="indefinite"
                            />
                        )}
                    </feTurbulence>

                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 3 -1" in="noise" result="coloredNoise" />

                    {/* Main Distortion (Warping) */}
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="coloredNoise"
                        scale={isHovered ? "28" : "0"}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="distortedSource"
                    >
                        <animate
                            attributeName="scale"
                            values={isHovered ? "0; 35; 28" : "28; 0"}
                            dur="0.4s"
                            fill="freeze"
                        />
                    </feDisplacementMap>

                    {/* Chromatic Aberration: Separating Custom RGB Layers */}
                    <feComponentTransfer in="distortedSource" result="redLayer">
                        <feFuncR type="linear" slope="1" />
                        <feFuncG type="linear" slope="0" />
                        <feFuncB type="linear" slope="0" />
                        <feFuncA type="linear" slope="1" />
                    </feComponentTransfer>

                    <feComponentTransfer in="distortedSource" result="greenLayer">
                        <feFuncR type="linear" slope="0" />
                        <feFuncG type="linear" slope="1" />
                        <feFuncB type="linear" slope="0" />
                        <feFuncA type="linear" slope="1" />
                    </feComponentTransfer>

                    <feComponentTransfer in="distortedSource" result="blueLayer">
                        <feFuncR type="linear" slope="0" />
                        <feFuncG type="linear" slope="0" />
                        <feFuncB type="linear" slope="1" />
                        <feFuncA type="linear" slope="1" />
                    </feComponentTransfer>

                    {/* Shifting Red and Blue channels for the glitch effect */}
                    <feOffset in="redLayer" dx={isHovered ? "5" : "0"} dy="0" result="redShift">
                        <animate attributeName="dx" values={isHovered ? "0; 9; 5" : "5; 0"} dur="0.3s" fill="freeze" />
                    </feOffset>

                    <feOffset in="blueLayer" dx={isHovered ? "-5" : "0"} dy="0" result="blueShift">
                        <animate attributeName="dx" values={isHovered ? "0; -9; -5" : "-5; 0"} dur="0.3s" fill="freeze" />
                    </feOffset>

                    {/* Blending the RGB channels back together */}
                    <feBlend mode="screen" in="redShift" in2="greenLayer" result="rg" />
                    <feBlend mode="screen" in="rg" in2="blueShift" result="finalHologram" />

                </filter>
            </svg>

            {/* Base Image (Static, normal logo) */}
            <img
                src={src}
                alt={alt}
                className="liquid-logo-base"
            />

            {/* Interactive Distorted Layer (Invisible until hovered over via CSS Mask) */}
            <motion.div
                className="liquid-logo-distorted-wrapper"
                style={{
                    opacity: isHovered ? 1 : 0,
                    maskImage: useTransform(
                        [smoothX, smoothY],
                        ([x, y]) => `radial-gradient(circle 120px at ${x}px ${y}px, black 0%, black 50%, transparent 100%)`
                    ),
                    WebkitMaskImage: useTransform(
                        [smoothX, smoothY],
                        ([x, y]) => `radial-gradient(circle 120px at ${x}px ${y}px, black 0%, black 50%, transparent 100%)`
                    ),
                }}
            >
                <img
                    src={src}
                    alt={`${alt} distorted preview`}
                    className="liquid-logo-distorted"
                />
            </motion.div>
        </div>
    );
};

export default LiquidLogo;

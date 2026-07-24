import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Mouse position
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth spring configuration
    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const updateMousePosition = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.closest('.cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer'
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [mouseX, mouseY]);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 bg-emerald-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovered ? 3 : 1,
                    opacity: isHovered ? 0.8 : 1,
                }}
                transition={{ type: 'tween', duration: 0.15 }}
            />
            {/* Outer ring for extra flair */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 border border-emerald-400 rounded-full pointer-events-none z-[9998] mix-blend-difference"
                style={{
                    x: useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.8 }),
                    y: useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.8 }),
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0 : 0.5,
                }}
                transition={{ type: 'tween', duration: 0.2 }}
            />
        </>
    );
};

export default CustomCursor;

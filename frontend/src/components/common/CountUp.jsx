import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

/**
 * Animated number component that counts up from 0 to value
 * @param {number} value - The end value to count to
 * @param {string} prefix - Optional prefix (e.g. "$")
 * @param {string} suffix - Optional suffix (e.g. "%")
 * @param {number} decimals - Number of decimal places
 * @param {number} duration - Animation duration in seconds
 */
const CountUp = ({ value, prefix = '', suffix = '', decimals = 0, duration = 2 }) => {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000,
    });
    const isInView = useInView(ref, { once: true, margin: "-10px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                // Determine locale based on prefix/currency logic if needed, defaulting to en-US
                // This handles comma separation for thousands
                const formatted = latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                ref.current.textContent = `${prefix}${formatted}${suffix}`;
            }
        });

        return () => springValue.destroy();
    }, [springValue, decimals, prefix, suffix]);

    return <span ref={ref} />;
};

export default CountUp;

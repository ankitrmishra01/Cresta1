import React, { useRef, useEffect, useState, useCallback } from 'react';
import createGlobe from 'cobe';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../../api';
import { useTheme } from '../../context/ThemeContext';

/* ─────────────────────────────────────────────────────────────────────
 * Exchanges
 * ──────────────────────────────────────────────────────────────────── */
const EXCHANGES = [
    {
        id: 'bse', name: 'BSE SENSEX', location: 'Dalal Street, Mumbai',
        lat: 18.9307, lng: 72.8334, region: 'India',
        fallback: { value: '78,205.98', change: '+639.82', percent: '+0.82%', positive: true },
        color: '#0891B2', flag: '🇮🇳',
    },
    {
        id: 'nse', name: 'NSE NIFTY 50', location: 'BKC, Mumbai',
        lat: 19.0654, lng: 72.8691, region: 'India',
        fallback: { value: '24,261.60', change: '+233.55', percent: '+0.97%', positive: true },
        color: '#0891B2', flag: '🇮🇳',
    },
    {
        id: 'lse', name: 'FTSE 100', location: 'Paternoster Sq, London',
        lat: 51.5144, lng: -0.0987, region: 'Europe',
        fallback: { value: '8,684.56', change: '+38.48', percent: '+0.45%', positive: true },
        color: '#7C3AED', flag: '🇬🇧',
    },
    {
        id: 'nyse', name: 'NYSE (DOW)', location: 'Wall Street, New York',
        lat: 40.7069, lng: -74.0089, region: 'North America',
        fallback: { value: '42,840.26', change: '+498.02', percent: '+1.18%', positive: true },
        color: '#2563EB', flag: '🇺🇸',
    },
    {
        id: 'b3', name: 'IBOVESPA', location: 'Rua XV, São Paulo',
        lat: -23.5505, lng: -46.6333, region: 'South America',
        fallback: { value: '131,902.31', change: '+1,204.56', percent: '+0.92%', positive: true },
        color: '#0D9488', flag: '🇧🇷',
    },
    {
        id: 'tse', name: 'NIKKEI 225', location: 'Nihonbashi, Tokyo',
        lat: 35.6817, lng: 139.7714, region: 'Asia',
        fallback: { value: '37,155.33', change: '+312.62', percent: '+0.85%', positive: true },
        color: '#DB2777', flag: '🇯🇵',
    },
    {
        id: 'asx', name: 'ASX 200', location: 'Bridge Street, Sydney',
        lat: -33.8688, lng: 151.2093, region: 'Oceania',
        fallback: { value: '8,115.20', change: '-22.40', percent: '-0.28%', positive: false },
        color: '#D97706', flag: '🇦🇺',
    },
];

/** One representative per region */
const REGION_REPS = [
    EXCHANGES[0], EXCHANGES[2], EXCHANGES[3],
    EXCHANGES[4], EXCHANGES[5], EXCHANGES[6],
];

/* ─────────────────────────────────────────────────────────────────────
 * Simple angular-distance detection (guaranteed correct)
 * ──────────────────────────────────────────────────────────────────── */
const normDeg = (d) => { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
const phiToFacingLng = (phi) => -phi * 180 / Math.PI;

const REGION_MAP = [
    { ex: REGION_REPS[2], start: 0.65, end: 2.47 }, // North America
    { ex: REGION_REPS[3], start: 2.47, end: 3.30 }, // South America
    { ex: REGION_REPS[5], start: 3.30, end: 3.75 }, // Australia (Oceania)
    { ex: REGION_REPS[4], start: 3.75, end: 4.42 }, // Japan (Asia)
    { ex: REGION_REPS[0], start: 4.42, end: 5.65 }, // India
    { ex: REGION_REPS[1], start: 5.65, end: 6.283 }, // Europe (Part 1)
    { ex: REGION_REPS[1], start: 0, end: 0.65 },    // Europe (Part 2)
];

const findActiveExchange = (phi) => {
    const p = ((phi % 6.283) + 6.283) % 6.283;
    const match = REGION_MAP.find(r => p >= r.start && p < r.end);
    return match ? match.ex : REGION_REPS[0];
};

/* ─────────────────────────────────────────────────────────────────────
 * 3D → 2D projection (self-calibrating sign)
 * ──────────────────────────────────────────────────────────────────── */
const GLOBE_THETA = 0.15;

const projectMarker = (lat, lng, phi) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const x = Math.cos(latRad) * Math.sin(lngRad);
    const y = -Math.sin(latRad);
    const z = Math.cos(latRad) * Math.cos(lngRad);

    const facingLng = phiToFacingLng(phi);
    const testLngRad = (facingLng * Math.PI) / 180;
    const cosA = Math.cos(phi), sinA = Math.sin(phi);
    const tzStd = -Math.sin(testLngRad) * sinA + Math.cos(testLngRad) * cosA;
    const usePhi = tzStd > 0 ? phi : -phi;

    const cp = Math.cos(usePhi), sp = Math.sin(usePhi);
    const x1 = x * cp + z * sp;
    const z1 = -x * sp + z * cp;
    const ct = Math.cos(GLOBE_THETA), st = Math.sin(GLOBE_THETA);
    const y2 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;

    return { x: x1, y: y2, z: z2, visible: z2 > 0.05 };
};

/* ─────────────────────────────────────────────────────────────────────
 * Theme-aware colour palettes
 * ──────────────────────────────────────────────────────────────────── */
const LIGHT_GLOBE = {
    dark: 0,
    diffuse: 3,
    mapSamples: 24000,
    mapBrightness: 1.8,
    baseColor: [0.88, 0.92, 0.96],       // soft blue-grey sphere
    markerColor: [0.03, 0.57, 0.70],     // teal markers (#0891B2ish)
    glowColor: [0.85, 0.90, 0.96],       // subtle cool glow
};
const DARK_GLOBE = {
    dark: 1,
    diffuse: 1.2,
    mapSamples: 24000,
    mapBrightness: 6,
    baseColor: [0.15, 0.18, 0.25],
    markerColor: [0.1, 0.8, 0.9],
    glowColor: [0.05, 0.15, 0.25],
};

/* ─────────────────────────────────────────────────────────────────────
 * Main Component
 * ──────────────────────────────────────────────────────────────────── */
const IndiaGlobe = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const phiRef = useRef(0);
    const lastPosUpdate = useRef(0);
    const globeRef = useRef(null);

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [activeExchange, setActiveExchange] = useState(EXCHANGES[0]);
    const [liveData, setLiveData] = useState({});
    const [markerPositions, setMarkerPositions] = useState({});

    /* ── Fetch live BSE / NSE ──────────────────────────────── */
    useEffect(() => {
        const fetchLive = async () => {
            try {
                const [sensexRes, niftyRes] = await Promise.all([
                    fetch(`${API_BASE}/sensex/`).then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch(`${API_BASE}/nifty/`).then(r => r.ok ? r.json() : null).catch(() => null),
                ]);
                const u = {};
                if (sensexRes) u.bse = { value: String(sensexRes.value || ''), change: String(sensexRes.change || ''), percent: String(sensexRes.percent || ''), positive: String(sensexRes.change || '').includes('+') };
                if (niftyRes) u.nse = { value: String(niftyRes.value || ''), change: String(niftyRes.change || ''), percent: String(niftyRes.percent || ''), positive: String(niftyRes.change || '').includes('+') };
                setLiveData(prev => ({ ...prev, ...u }));
            } catch { /* fallback */ }
        };
        fetchLive();
        const iv = setInterval(fetchLive, 60000);
        return () => clearInterval(iv);
    }, []);

    /* ── Globe + rotation (re-create on theme change) ──────── */
    useEffect(() => {
        if (!canvasRef.current) return;
        let width = 0;
        const onResize = () => { if (canvasRef.current) width = canvasRef.current.offsetWidth; };
        window.addEventListener('resize', onResize);
        onResize();

        const startPhi = -72.83 * Math.PI / 180;

        const markers = EXCHANGES.map(ex => ({
            location: [ex.lat, ex.lng],
            size: ex.region === 'India' ? 0.07 : 0.05,
        }));

        const palette = isDark ? DARK_GLOBE : LIGHT_GLOBE;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: startPhi,
            theta: GLOBE_THETA,
            ...palette,
            markers,
            onRender: (state) => {
                if (!pointerInteracting.current) {
                    phiRef.current += 0.002;
                }
                const phi = startPhi + phiRef.current + pointerInteractionMovement.current;
                state.phi = phi;
                state.width = width * 2;
                state.height = width * 2;

                const best = findActiveExchange(phiRef.current);
                setActiveExchange(prev => prev.id !== best.id ? best : prev);

                const now = performance.now();
                if (now - lastPosUpdate.current > 50) {
                    lastPosUpdate.current = now;
                    const r = width / 2, cx = width / 2, cy = width / 2;
                    const positions = {};
                    for (const ex of EXCHANGES) {
                        const p = projectMarker(ex.lat, ex.lng, phi);
                        positions[ex.id] = { x: cx + p.x * r * 0.92, y: cy + p.y * r * 0.92, visible: p.visible };
                    }
                    setMarkerPositions(positions);
                }
            },
        });
        globeRef.current = globe;

        setTimeout(() => { if (canvasRef.current) canvasRef.current.style.opacity = '1'; }, 100);
        return () => { globe.destroy(); window.removeEventListener('resize', onResize); };
    }, [isDark]);

    /* ── Derived ───────────────────────────────────────────── */
    const getData = (ex) => liveData[ex.id] || ex.fallback;
    const isIndia = activeExchange.region === 'India';
    const data = getData(activeExchange);
    const bseData = getData(EXCHANGES[0]);
    const nseData = getData(EXCHANGES[1]);


    /* ── Render ─────────────────────────────────────────────── */
    return (
        <div ref={containerRef} className="relative w-full h-[420px] md:h-[500px] flex items-center justify-center">
            {/* Globe */}
            <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px]">
                <canvas
                    ref={canvasRef}
                    onPointerDown={(e) => { pointerInteracting.current = e.clientX - pointerInteractionMovement.current; canvasRef.current.style.cursor = 'grabbing'; }}
                    onPointerUp={() => { pointerInteracting.current = null; canvasRef.current.style.cursor = 'grab'; }}
                    onPointerOut={() => { pointerInteracting.current = null; if (canvasRef.current) canvasRef.current.style.cursor = 'grab'; }}
                    onMouseMove={(e) => { if (pointerInteracting.current !== null) pointerInteractionMovement.current = (e.clientX - pointerInteracting.current) / 200; }}
                    onTouchMove={(e) => { if (pointerInteracting.current !== null && e.touches[0]) pointerInteractionMovement.current = (e.touches[0].clientX - pointerInteracting.current) / 200; }}
                    style={{ width: '100%', height: '100%', cursor: 'grab', contain: 'layout paint size', opacity: 0, transition: 'opacity 1s ease' }}
                />
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: isDark
                            ? 'radial-gradient(circle, transparent 55%, rgba(6,182,212,0.06) 70%, transparent 80%)'
                            : 'radial-gradient(circle, transparent 55%, rgba(8,145,178,0.08) 70%, transparent 80%)',
                    }}
                />
            </div>


            {/* Exchange cards */}
            <AnimatePresence mode="wait">
                {isIndia ? (
                    <React.Fragment key="india-pair">
                        <motion.div key="bse" data-card="bse"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.45 }}
                            className="absolute left-0 top-[18%] md:top-[15%] z-20"
                        >
                            <ExchangeCard exchange={EXCHANGES[0]} data={bseData} isDark={isDark} />
                        </motion.div>
                        <motion.div key="nse" data-card="nse"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.45, delay: 0.12 }}
                            className="absolute right-0 bottom-[18%] md:bottom-[15%] z-20"
                        >
                            <ExchangeCard exchange={EXCHANGES[1]} data={nseData} isDark={isDark} />
                        </motion.div>
                    </React.Fragment>
                ) : (
                    <motion.div key={activeExchange.id} data-card={activeExchange.id}
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        transition={{ duration: 0.4 }}
                        className="absolute right-0 top-[20%] md:top-[18%] z-20"
                    >
                        <ExchangeCard exchange={activeExchange} data={data} isDark={isDark} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom region label */}
            <AnimatePresence mode="wait">
                <motion.div key={isIndia ? 'india' : activeExchange.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
                    className="absolute bottom-0 md:bottom-2 left-1/2 -translate-x-1/2 z-20"
                >
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm border ${isDark
                            ? 'bg-gray-900/60 border-white/5'
                            : 'bg-white/70 border-gray-200/60 shadow-sm'
                        }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {isIndia ? "India's Financial Footprint" : `${activeExchange.region} · ${activeExchange.flag}`}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};




/* ─────────────────────────────────────────────────────────────────────
 * ExchangeCard — theme-aware glass card
 * ──────────────────────────────────────────────────────────────────── */
const ExchangeCard = ({ exchange, data, isDark }) => {
    const pos = data.positive;
    const sparkline = React.useMemo(() => {
        const seed = exchange.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return Array.from({ length: 16 }, (_, i) => {
            const base = 40 + ((seed * (i + 1) * 7) % 45);
            return Math.min(95, Math.max(20, base));
        });
    }, [exchange.id]);

    return (
        <div
            className={`backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl max-w-[210px] md:max-w-[230px] border ${isDark
                    ? 'bg-gray-900/80 border-white/10'
                    : 'bg-white/80 border-gray-200/60 shadow-lg'
                }`}
            style={{ borderColor: isDark ? `${exchange.color}33` : `${exchange.color}22` }}
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em]"
                    style={{ color: exchange.color }}
                >
                    {exchange.flag} {exchange.name}
                </span>
            </div>
            <div className={`text-xl md:text-2xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                {data.value}
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${pos ? 'text-emerald-500' : 'text-red-500'}`}>{data.change}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${pos ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-600'
                    }`}>
                    {data.percent}
                </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: exchange.color }} />
                <span className={`text-[8px] uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    {exchange.location}
                </span>
            </div>
            <div className="mt-2 h-5 flex items-end gap-[2px]">
                {sparkline.map((h, i) => (
                    <div key={i} className="w-[3px] rounded-full"
                        style={{
                            height: `${h}%`,
                            backgroundColor: pos
                                ? '#10B981'
                                : '#ef4444',
                            opacity: isDark ? 0.6 : 0.5
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default IndiaGlobe;

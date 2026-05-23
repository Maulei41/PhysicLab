import React, { useState, useEffect, useRef } from 'react';

// SVG 空間中加長型圓柱體的尺寸
const CYL_LEFT = 140;
const CYL_RIGHT = 260;
const CYL_BOTTOM = 420;
const CYL_TOP_MAX = 90;  // 最大體積 (5.0 m³) 時的活塞位置
const CYL_TOP_MIN = 370; // 最小體積 (1.0 m³) 時的活塞位置

export default function BoylesLaw() {
    // 模擬設定與常數
    const MIN_VOL = 1.0; // 立方公尺 (m³)
    const MAX_VOL = 5.0; // 立方公尺 (m³)
    const CONSTANT_K = 500; // P * V = 500 kPa*m³

    // React 狀態
    const [volume, setVolume] = useState(5.0); // 立方公尺 (m³)
    const [pressure, setPressure] = useState(100.0); // kPa
    const [isDragging, setIsDragging] = useState(false);
    const [history, setHistory] = useState([{ v: 5.0, p: 100.0 }]);
    const [showMolecules, setShowMolecules] = useState(true);

    // 專門用於驅動 60fps requestAnimationFrame 重新渲染的狀態
    const [, setTick] = useState(0);

    // 用於拖曳與迴圈同步的 Refs
    const volumeRef = useRef(5.0);
    const startDragY = useRef(0);
    const startVol = useRef(5.0);
    const lastSavedVolRef = useRef(5.0);

    // 分子動力論動畫的粒子狀態
    const particlesRef = useRef(
        Array.from({ length: 32 }, () => ({
            x: CYL_LEFT + 10 + Math.random() * (CYL_RIGHT - CYL_LEFT - 20),
            y: CYL_TOP_MAX + 20 + Math.random() * (CYL_BOTTOM - CYL_TOP_MAX - 30),
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
        }))
    );

    // 主迴圈：更新移動容器邊界內的粒子物理狀態
    useEffect(() => {
        let animationFrameId;

        const updateParticles = () => {
            const currentVol = volumeRef.current;
            // 計算目前活塞在 SVG 空間中的 Y 座標
            const pistonY = CYL_TOP_MIN - ((currentVol - MIN_VOL) / (MAX_VOL - MIN_VOL)) * (CYL_TOP_MIN - CYL_TOP_MAX);

            particlesRef.current = particlesRef.current.map(p => {
                let nx = p.x + p.vx;
                let ny = p.y + p.vy;
                let nvx = p.vx;
                let nvy = p.vy;

                // 與圓柱體左右壁的邊界碰撞
                if (nx - 4 < CYL_LEFT) {
                    nx = CYL_LEFT + 4;
                    nvx = -nvx;
                } else if (nx + 4 > CYL_RIGHT) {
                    nx = CYL_RIGHT - 4;
                    nvx = -nvx;
                }

                // 與圓柱體底部的邊界碰撞
                if (ny + 4 > CYL_BOTTOM) {
                    ny = CYL_BOTTOM - 4;
                    nvy = -nvy;
                }

                // 與移動活塞頂部的邊界碰撞
                if (ny - 4 < pistonY) {
                    ny = pistonY + 4;
                    nvy = -nvy;
                }

                return { x: nx, y: ny, vx: nvx, vy: nvy };
            });

            // 觸發保證的狀態更新以強制重新渲染 SVG 粒子
            if (showMolecules) {
                setTick(t => (t + 1) % 10000);
            }

            animationFrameId = requestAnimationFrame(updateParticles);
        };

        animationFrameId = requestAnimationFrame(updateParticles);
        return () => cancelAnimationFrame(animationFrameId);
    }, [showMolecules]);

    // 處理拖曳
    const handlePointerDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        startDragY.current = e.clientY;
        startVol.current = volume;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const dy = e.clientY - startDragY.current;

        // 將螢幕拖曳增量轉換為體積單位
        const svgElement = e.currentTarget.ownerSVGElement || e.currentTarget;
        const rect = svgElement.getBoundingClientRect();
        const svgScale = 500 / rect.height;
        const svgDy = dy * svgScale;

        // 向上拖曳 (dy 為負) 時體積增加，向下拖曳 (dy 為正) 時體積減少
        const volDelta = (svgDy / (CYL_TOP_MIN - CYL_TOP_MAX)) * (MAX_VOL - MIN_VOL);
        const nextVol = Math.max(MIN_VOL, Math.min(MAX_VOL, startVol.current - volDelta));

        volumeRef.current = nextVol;
        const calculatedP = CONSTANT_K / nextVol;

        setVolume(nextVol);
        setPressure(calculatedP);

        // 定期儲存歷史點以繪製圖表軌跡
        if (Math.abs(nextVol - lastSavedVolRef.current) > 0.1) {
            setHistory(prev => {
                const updated = [...prev, { v: nextVol, p: calculatedP }];
                return updated.sort((a, b) => a.v - b.v);
            });
            lastSavedVolRef.current = nextVol;
        }
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const setPresetVolume = (v) => {
        volumeRef.current = v;
        const calculatedP = CONSTANT_K / v;
        setVolume(v);
        setPressure(calculatedP);
        setHistory(prev => [...prev, { v, p: calculatedP }].sort((a, b) => a.v - b.v));
        lastSavedVolRef.current = v;
    };

    const handleReset = () => {
        volumeRef.current = 5.0;
        setVolume(5.0);
        setPressure(100.0);
        setHistory([{ v: 5.0, p: 100.0 }]);
        lastSavedVolRef.current = 5.0;
    };

    // --- 圖表排版設定 (雙圖表視窗) ---
    const graphWidth = 500;
    const graphHeight = 220;
    const margin = { top: 25, right: 35, bottom: 45, left: 70 };
    const plotWidth = graphWidth - margin.left - margin.right;
    const plotHeight = graphHeight - margin.top - margin.bottom;

    const maxPlotV = 6.0;    // 立方公尺 (m³)
    const maxPlotP = 600;    // kPa
    const maxPlotInvV = 1.2; // 1/m³ 最大值

    // 座標映射
    const mapX = (v) => margin.left + (v / maxPlotV) * plotWidth;
    const mapInvX = (invV) => margin.left + (invV / maxPlotInvV) * plotWidth;
    const mapY = (p) => margin.top + plotHeight - (p / maxPlotP) * plotHeight;

    // 產生完整理論雙曲線的座標 (P = 500 / V)
    const generateHyperbolaPoints = () => {
        const points = [];
        for (let v = 0.8; v <= 6.0; v += 0.1) {
            points.push(`${mapX(v)},${mapY(CONSTANT_K / v)}`);
        }
        return points.join(' ');
    };

    // 產生線性圖表的座標 (P = 500 * (1/V))
    const generateLinearPoints = () => {
        const points = [];
        for (let invV = 0.0; invV <= 1.2; invV += 0.1) {
            points.push(`${mapInvX(invV)},${mapY(CONSTANT_K * invV)}`);
        }
        return points.join(' ');
    };

    // 在 SVG 中計算活塞高度
    const pistonY = CYL_TOP_MIN - ((volume - MIN_VOL) / (MAX_VOL - MIN_VOL)) * (CYL_TOP_MIN - CYL_TOP_MAX);

    // 類比壓力指針角度計算 (-135度 到 +135度)
    const gaugeAngle = Math.max(-135, Math.min(135, ((pressure - 50) / 450) * 270 - 135));

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-800 flex flex-col">
            <header className="mb-6 pb-4 border-b border-slate-200">
                <h1 className="text-3xl font-bold text-slate-900">波以耳定律模擬器</h1>
                <p className="text-slate-600 mt-2 max-w-4xl">
                    探討在等溫下壓力與體積之間的關係 (P ∝ 1/V)。
                    <strong>向下拉動把手</strong>來壓縮氣體，並觀察將壓力對體積倒數 (1/V) 作圖時，雙曲線如何拉直成直線。
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 max-w-7xl mx-auto w-full">

                {/* 左側艙間：加長型儀器動畫 */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-slate-700">加長型氣室</h2>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
              等溫氣室
            </span>
                    </div>

                    <div className="relative w-full max-w-[400px] aspect-[4/5] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex justify-center items-end pb-4">
                        <div className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded text-xs text-center border border-slate-200 pointer-events-none z-10 shadow-sm">
                            💡 <strong>向下拉動把手</strong>來壓縮氣體。
                        </div>

                        <svg viewBox="0 0 400 500" className="w-full h-full select-none touch-none">

                            {/* 外側圓柱體玻璃輪廓 (加長型) */}
                            <path
                                d={`M ${CYL_LEFT - 8} 60 L ${CYL_LEFT - 8} ${CYL_BOTTOM + 8} L ${CYL_RIGHT + 8} ${CYL_BOTTOM + 8} L ${CYL_RIGHT + 8} 60`}
                                fill="none"
                                stroke="#64748b"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <rect x={CYL_LEFT} y="70" width={CYL_RIGHT - CYL_LEFT} height={CYL_BOTTOM - 70} fill="#f8fafc" />

                            {/* 代表體積的陰影氣室 */}
                            <rect
                                x={CYL_LEFT}
                                y={pistonY}
                                width={CYL_RIGHT - CYL_LEFT}
                                height={CYL_BOTTOM - pistonY}
                                fill="#38bdf8"
                                fillOpacity={0.15 + (1 - (volume / 5.0)) * 0.3} // 壓縮時顏色加深
                            />

                            {/* 氣體分子 / 粒子 (教學顏色指示器) */}
                            {showMolecules && particlesRef.current.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={p.x}
                                    cy={p.y}
                                    r="5.5"
                                    fill={volume < 1.8 ? '#ef4444' : volume < 3.2 ? '#f97316' : '#0ea5e9'}
                                    opacity="0.85"
                                />
                            ))}

                            {/* 活塞軸與把手組件 */}
                            <g
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp} // 安全機制：游標離開區域時停止拖曳
                                style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                            >
                                {/* 隱形的較大點擊區域，方便拖曳 */}
                                <rect x={CYL_LEFT - 20} y={pistonY - 95} width={CYL_RIGHT - CYL_LEFT + 40} height="120" fill="transparent" />

                                {/* 金屬活塞頭 (密封氣體) */}
                                <rect x={CYL_LEFT - 4} y={pistonY} width={CYL_RIGHT - CYL_LEFT + 8} height="16" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />

                                {/* 活塞軸 */}
                                <rect x="194" y={pistonY - 60} width="12" height="60" fill="#94a3b8" stroke="#475569" strokeWidth="2" />

                                {/* 把手握把 */}
                                <rect x="150" y={pistonY - 72} width="100" height="14" rx="4" fill="#1e293b" />
                                <rect x="144" y={pistonY - 78} width="112" height="6" rx="2" fill="#ef4444" />
                                <circle cx="200" cy={pistonY - 65} r="15" fill="#1e293b" opacity="0.1" />

                                {/* SVG 推動的手 / 手指指示器 */}
                                <g transform={`translate(200, ${pistonY - 82})`} opacity={isDragging ? 1 : 0.75} className="transition-opacity">
                                    {/* 手部基底/手掌輪廓 */}
                                    <path
                                        d="M -16 -35 L -16 -8 Q -16 6 -6 6 L 6 6 Q 16 6 16 -8 L 16 -35"
                                        fill="#fed7aa"
                                        stroke="#c2410c"
                                        strokeWidth="2.2"
                                    />
                                    {/* 按壓把手的食指 */}
                                    <path
                                        d="M -6 -8 L -6 12 C -6 18, 6 18, 6 12 L 6 -8"
                                        fill="#fed7aa"
                                        stroke="#c2410c"
                                        strokeWidth="2.2"
                                    />
                                    {/* 手指摺痕 */}
                                    <line x1="-16" y1="-18" x2="-6" y2="-18" stroke="#ea580c" strokeWidth="1.5" />
                                    <line x1="-16" y1="-10" x2="-6" y2="-10" stroke="#ea580c" strokeWidth="1.5" />
                                    <line x1="6" y1="-18" x2="16" y2="-18" stroke="#ea580c" strokeWidth="1.5" />
                                    <line x1="6" y1="-10" x2="16" y2="-10" stroke="#ea580c" strokeWidth="1.5" />

                                    {/* 拖曳動作指示器 */}
                                    {isDragging && (
                                        <>
                                            <path d="M -24 -25 L -24 -10 M -24 -10 L -28 -14 M -24 -10 L -20 -14" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M 24 -25 L 24 -10 M 24 -10 L 20 -14 M 24 -10 L 28 -14" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                        </>
                                    )}
                                </g>
                            </g>

                            {/* 圓柱體底座支架 */}
                            <rect x="110" y={CYL_BOTTOM + 8} width="180" height="15" rx="4" fill="#334155" />

                            {/* 連接到壓力感測器的側邊支架管道 (不阻擋容器) */}
                            <path
                                d={`M 140 395 L 85 395 Q 65 395 65 375`}
                                fill="none"
                                stroke="#475569"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />

                            {/* 重新定位的壓力刻度盤 (移至左下方不礙事處) */}
                            <g transform="translate(65, 310)">
                                <circle cx="0" cy="0" r="46" fill="#f8fafc" stroke="#334155" strokeWidth="4" />
                                <circle cx="0" cy="0" r="40" fill="white" />
                                {/* 儀表上的刻度 */}
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <line
                                        key={i}
                                        x1="0" y1="-30" x2="0" y2="-36"
                                        stroke="#475569" strokeWidth="2"
                                        transform={`rotate(${-135 + i * 45})`}
                                    />
                                ))}
                                {/* 彩色高壓危險指示器 */}
                                <path d="M 21.2 -21.2 A 30 30 0 0 1 28.2 10" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.3" />
                                {/* 指針 */}
                                <line
                                    x1="0" y1="0" x2="0" y2="-32"
                                    stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
                                    style={{ transform: `rotate(${gaugeAngle}deg)` }}
                                    className="transition-transform duration-100 ease-out"
                                />
                                <circle cx="0" cy="0" r="5" fill="#1e293b" />
                                <text x="0" y="22" textAnchor="middle" className="text-[10px] font-extrabold fill-slate-500">kPa</text>
                            </g>
                        </svg>
                    </div>

                    {/* 電子儀表板讀數 */}
                    <div className="mt-4 w-full max-w-[400px] grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col items-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">氣室體積</span>
                            <span className="text-2xl font-mono font-bold text-sky-600 mt-1">
                {volume.toFixed(2)} m³
              </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col items-center">
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">感測器壓力</span>
                            <span className="text-2xl font-mono font-bold text-emerald-600 mt-1">
                {pressure.toFixed(1)} kPa
              </span>
                        </div>
                    </div>

                    {/* 互動控制項 */}
                    <div className="mt-4 flex flex-wrap gap-2 w-full max-w-[400px] justify-center">
                        <button
                            onClick={() => setPresetVolume(5.0)}
                            className="py-1.5 px-3 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            最大 (5.0 m³)
                        </button>
                        <button
                            onClick={() => setPresetVolume(2.5)}
                            className="py-1.5 px-3 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            中等 (2.5 m³)
                        </button>
                        <button
                            onClick={() => setPresetVolume(1.0)}
                            className="py-1.5 px-3 rounded text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 transition border border-red-200"
                        >
                            最小 (1.0 m³)
                        </button>
                        <button
                            onClick={() => setShowMolecules(!showMolecules)}
                            className={`py-1.5 px-3 rounded text-xs font-semibold transition ${showMolecules ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-600'}`}
                        >
                            {showMolecules ? '隱藏粒子' : '顯示粒子'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="py-1.5 px-3 rounded text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
                        >
                            重設
                        </button>
                    </div>
                </div>

                {/* 右側艙間：雙重即時圖表 */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between gap-6">

                    {/* 圖表 1：壓力對體積 */}
                    <div className="flex-1 flex flex-col items-center">
                        <h3 className="text-sm font-bold text-slate-700 mb-2 w-full text-left border-l-4 border-sky-500 pl-2">
                            1. 壓力與體積關係圖 (P-V 曲線)
                        </h3>
                        <div className="w-full aspect-[5/2.2] relative flex justify-center items-center">
                            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
                                {/* 網格線 */}
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <g key={`grid-x-${i}`}>
                                        <line x1={mapX(i)} y1={margin.top} x2={mapX(i)} y2={graphHeight - margin.bottom} stroke="#f1f5f9" strokeWidth="1.5" />
                                        <text x={mapX(i)} y={graphHeight - margin.bottom + 14} textAnchor="middle" className="text-[9px] font-mono fill-slate-400">{i}</text>
                                    </g>
                                ))}
                                {[0, 200, 400, 600].map((p) => (
                                    <g key={`grid-y-${p}`}>
                                        <line x1={margin.left} y1={mapY(p)} x2={graphWidth - margin.right} y2={mapY(p)} stroke="#f1f5f9" strokeWidth="1.5" />
                                        <text x={margin.left - 8} y={mapY(p) + 4} textAnchor="end" className="text-[9px] font-mono fill-slate-400">{p}</text>
                                    </g>
                                ))}

                                {/* 軸線 */}
                                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={graphWidth - margin.right} y2={graphHeight - margin.bottom} stroke="#475569" strokeWidth="1.5" />
                                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={margin.left} y2={margin.top} stroke="#475569" strokeWidth="1.5" />

                                {/* 軸標籤 */}
                                <text x={margin.left + plotWidth / 2} y={graphHeight - 4} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">體積, V (m³)</text>
                                <text transform={`translate(${margin.left - 42}, ${margin.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">壓力, P (kPa)</text>

                                {/* 理論雙曲線 */}
                                <path d={`M ${generateHyperbolaPoints()}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />

                                {/* 圖表軌跡 */}
                                {history.length > 1 && (
                                    <polyline points={history.map(pt => `${mapX(pt.v)},${mapY(pt.p)}`).join(' ')} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                )}

                                {/* 操作標記 */}
                                <circle cx={mapX(volume)} cy={mapY(pressure)} r="5.5" fill="#ef4444" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                    </div>

                    {/* 圖表 2：壓力對體積倒數 */}
                    <div className="flex-1 flex flex-col items-center">
                        <h3 className="text-sm font-bold text-slate-700 mb-2 w-full text-left border-l-4 border-emerald-500 pl-2">
                            2. 壓力與體積倒數關係圖 (P 對 1/V 的線性關係)
                        </h3>
                        <div className="w-full aspect-[5/2.2] relative flex justify-center items-center">
                            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
                                {/* 網格線 */}
                                {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((invV) => (
                                    <g key={`grid-invx-${invV}`}>
                                        <line x1={mapInvX(invV)} y1={margin.top} x2={mapInvX(invV)} y2={graphHeight - margin.bottom} stroke="#f1f5f9" strokeWidth="1.5" />
                                        <text x={mapInvX(invV)} y={graphHeight - margin.bottom + 14} textAnchor="middle" className="text-[9px] font-mono fill-slate-400">{invV.toFixed(1)}</text>
                                    </g>
                                ))}
                                {[0, 200, 400, 600].map((p) => (
                                    <g key={`grid-invy-${p}`}>
                                        <line x1={margin.left} y1={mapY(p)} x2={graphWidth - margin.right} y2={mapY(p)} stroke="#f1f5f9" strokeWidth="1.5" />
                                        <text x={margin.left - 8} y={mapY(p) + 4} textAnchor="end" className="text-[9px] font-mono fill-slate-400">{p}</text>
                                    </g>
                                ))}

                                {/* 軸線 */}
                                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={graphWidth - margin.right} y2={graphHeight - margin.bottom} stroke="#475569" strokeWidth="1.5" />
                                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={margin.left} y2={margin.top} stroke="#475569" strokeWidth="1.5" />

                                {/* 軸標籤 */}
                                <text x={margin.left + plotWidth / 2} y={graphHeight - 4} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">體積倒數, 1/V (1/m³)</text>
                                <text transform={`translate(${margin.left - 42}, ${margin.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">壓力, P (kPa)</text>

                                {/* 通過原點的理論直線 */}
                                <path d={`M ${generateLinearPoints()}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />

                                {/* 圖表軌跡 */}
                                {history.length > 1 && (
                                    <polyline points={history.map(pt => `${mapInvX(1/pt.v)},${mapY(pt.p)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                )}

                                {/* 操作標記 */}
                                <circle cx={mapInvX(1 / volume)} cy={mapY(pressure)} r="5.5" fill="#ef4444" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-800 leading-relaxed shadow-sm">
                        🎓 <strong>教學提示：</strong> 圖 1 中的關係是一條曲線 (反比例雙曲線)，而在圖 2 中將壓力對 1/體積作圖，會得到一條<strong>通過原點的完美直線</strong>。這完美地證明了壓力與 1/V 成正比！
                    </div>
                </div>

            </div>
        </div>
    );
}
import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

// 常數設定
const MIN_TEMP = 100; // K
const MAX_TEMP = 600; // K
const BASE_TEMP = 300; // 室溫 (K)
const CONSTANT_K = 100 / 300; // P = k * T -> 300K 時為 100 kPa

export default function GayLussacLaw() {
  // React 狀態
  const [temperature, setTemperature] = useState(BASE_TEMP);
  const [pressure, setPressure] = useState(BASE_TEMP * CONSTANT_K);
  const [flaskPos, setFlaskPos] = useState({ x: 200, y: 150 });
  const [isDragging, setIsDragging] = useState(false);

  // 用於動畫與物理迴圈的 Refs
  const tempRef = useRef(BASE_TEMP);
  const targetTempRef = useRef(BASE_TEMP);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const flaskStartPos = useRef({ x: 0, y: 0 });

  // 粒子狀態 (產生 40 個相同顏色的粒子)
  const particlesRef = useRef(
    Array.from({ length: 40 }, () => ({
      x: (Math.random() - 0.5) * 80, // 相對於容器中心的 X
      y: (Math.random() - 0.5) * 120, // 相對於容器中心的 Y
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    }))
  );

  // 判定目前所在區域並設定目標溫度
  useEffect(() => {
    let target = BASE_TEMP; // 預設室溫 (空氣中)
    if (flaskPos.y > 220) { // 如果容器被拉到下方水浴區
      if (flaskPos.x < 200) {
        target = 150; // 左側冷水浴
      } else {
        target = 500; // 右側熱水浴
      }
    }
    targetTempRef.current = target;
  }, [flaskPos]);

  // 主要物理動畫迴圈
  useEffect(() => {
    let animationFrameId;

    const updatePhysics = () => {
      let currentTemp = tempRef.current;
      const targetTemp = targetTempRef.current;

      // 模擬熱傳導 (平滑升溫/降溫)
      if (Math.abs(targetTemp - currentTemp) > 0.5) {
        currentTemp += (targetTemp - currentTemp) * 0.02;
      } else {
        currentTemp = targetTemp;
      }
      tempRef.current = currentTemp;

      // 粒子動能與溫度的平方根成正比
      const speedMultiplier = Math.max(0.2, Math.sqrt(currentTemp / BASE_TEMP));

      particlesRef.current = particlesRef.current.map(p => {
        let nx = p.x + p.vx * speedMultiplier;
        let ny = p.y + p.vy * speedMultiplier;
        let nvx = p.vx;
        let nvy = p.vy;

        // 容器內部邊界碰撞 (相對於容器中心)
        const boundX = 42; // 半寬
        const boundY = 62; // 半高

        if (nx < -boundX) {
          nx = -boundX;
          nvx = -nvx;
        } else if (nx > boundX) {
          nx = boundX;
          nvx = -nvx;
        }

        if (ny < -boundY) {
          ny = -boundY;
          nvy = -nvy;
        } else if (ny > boundY) {
          ny = boundY;
          nvy = -nvy;
        }

        return { x: nx, y: ny, vx: nvx, vy: nvy };
      });

      // 更新狀態以觸發 React 重新渲染
      setTemperature(currentTemp);
      setPressure(currentTemp * CONSTANT_K);

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 拖曳處理邏輯
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    flaskStartPos.current = flaskPos;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    const svgElement = e.currentTarget.ownerSVGElement || e.currentTarget;
    const rect = svgElement.getBoundingClientRect();
    const svgScaleX = 400 / rect.width; // viewBox width
    const svgScaleY = 500 / rect.height; // viewBox height

    const svgDx = dx * svgScaleX;
    const svgDy = dy * svgScaleY;

    let nx = flaskStartPos.current.x + svgDx;
    let ny = flaskStartPos.current.y + svgDy;

    // 限制容器在畫面範圍內
    nx = Math.max(50, Math.min(350, nx));
    ny = Math.max(120, Math.min(400, ny));

    setFlaskPos({ x: nx, y: ny });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- 圖表設定 ---
  const graphWidth = 500;
  const graphHeight = 320; // 縮小單一圖表高度以容納兩個圖表
  const margin = { top: 30, right: 30, bottom: 50, left: 70 };
  const plotWidth = graphWidth - margin.left - margin.right;
  const plotHeight = graphHeight - margin.top - margin.bottom;

  const maxPlotT = 600; // K
  const maxPlotP = 200; // kPa

  const mapX = (t) => margin.left + (t / maxPlotT) * plotWidth;
  const mapY = (p) => margin.top + plotHeight - (p / maxPlotP) * plotHeight;

  // 攝氏溫度圖表設定 (-300 °C 到 400 °C)
  const minPlotTc = -300;
  const maxPlotTc = 400;
  const spanPlotTc = maxPlotTc - minPlotTc;
  const mapXc = (tc) => margin.left + ((tc - minPlotTc) / spanPlotTc) * plotWidth;

  // 儀表板指針角度計算 (-135度 到 +135度)
  const gaugeAngle = Math.max(-135, Math.min(135, (pressure / 200) * 270 - 135));

  // 計算溫度計內部的紅色水銀柱高度
  const thermometerHeight = ((temperature - 100) / 500) * 90;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', p: { xs: 1, md: 1.5 }, fontFamily: '"Inter","Roboto",sans-serif', color: '#1e293b', display: 'flex', flexDirection: 'column' }}>
      <Box component="header" sx={{ mb: 3, pb: 1, borderBottom: 1, borderColor: '#e2e8f0' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>給呂薩克定律模擬器 (Gay-Lussac's Law)</Typography>
        <Typography sx={{ color: '#475569', mt: 1 }}>
          探討在等容（固定體積）下，<strong>壓力</strong>與<strong>溫度</strong>的關係 (P ∝ T)。<br/>
          請將中間的氣體容器<strong>拖曳</strong>至「冷水浴」或「熱水浴」中，觀察溫度變化如何影響內部粒子的運動速度與壓力。
        </Typography>
      </Box>

      {/* 透過 lg:flex-row-reverse 讓先出現的裝置靠右，後出現的圖表靠左 */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row-reverse' }, gap: 3, flex: 1 }}>
        
        {/* 右側：實驗裝置 (透過 flex-row-reverse 排版至右側) */}
        <Paper sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid', borderColor: '#e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>互動式實驗槽</Typography>
            <Box component="span" sx={{ fontSize: '0.75rem', bgcolor: '#f3e8ff', color: '#6b21a8', px: 1.25, py: 0.5, borderRadius: '9999px', fontWeight: 600 }}>
              等容 (體積固定)
            </Box>
          </Box>

          <Box sx={{ position: 'relative', width: '100%', maxWidth: '400px', aspectRatio: '4/5', bgcolor: '#f1f5f9', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            
            <svg viewBox="0 0 400 500" style={{ width: '100%', height: '100%', userSelect: 'none', touchAction: 'none' }}>
              
              {/* 背景提示文字 */}
              <text x="200" y="200" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">室溫區 (300 K)</text>

              {/* 左側：冷水浴 */}
              <rect x="10" y="280" width="185" height="210" fill="#bae6fd" rx="10" />
              <g opacity="0.5">
                <rect x="40" y="320" width="30" height="30" fill="#eff6ff" rx="4" transform="rotate(15 55 335)" />
                <rect x="120" y="380" width="25" height="25" fill="#eff6ff" rx="4" transform="rotate(-10 132 392)" />
                <rect x="60" y="420" width="35" height="35" fill="#eff6ff" rx="4" transform="rotate(5 77 437)" />
              </g>
              <text x="102" y="470" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#0284c7">❄️ 冷水浴 (150 K)</text>

              {/* 右側：熱水浴 */}
              <rect x="205" y="280" width="185" height="210" fill="#fed7aa" rx="10" />
              <g stroke="#ea580c" strokeWidth="3" fill="none" opacity="0.4">
                <path d="M 240 450 Q 250 410 240 370 T 240 310" />
                <path d="M 300 460 Q 315 410 300 360 T 300 320" />
                <path d="M 360 450 Q 350 410 360 370 T 360 310" />
              </g>
              <text x="297" y="470" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#c2410c">🔥 熱水浴 (500 K)</text>

              {/* 連接儀表板與容器的軟管 (使用貝茲曲線動態計算) */}
              <path 
                d={`M 70 110 C 70 200, ${flaskPos.x} 150, ${flaskPos.x} ${flaskPos.y - 100}`} 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="4" 
                strokeLinecap="round"
              />

              {/* 左上角：固定的壓力錶 */}
              <g transform="translate(70, 70)">
                <circle cx="0" cy="0" r="46" fill="#f8fafc" stroke="#334155" strokeWidth="4" />
                <circle cx="0" cy="0" r="40" fill="white" />
                {/* 刻度 */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <line 
                    key={i} 
                    x1="0" y1="-30" x2="0" y2="-36" 
                    stroke="#475569" strokeWidth="2" 
                    transform={`rotate(${-135 + i * 45})`} 
                  />
                ))}
                {/* 移動的指針 */}
                <line 
                  x1="0" y1="0" x2="0" y2="-32" 
                  stroke="#ef4444" strokeWidth="3" strokeLinecap="round"
                  style={{ transform: `rotate(${gaugeAngle}deg)` }}
                />
                <circle cx="0" cy="0" r="5" fill="#1e293b" />
                <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="800" fill="#64748b">kPa</text>
              </g>

              {/* === 可拖曳的氣體容器 === */}
              <g 
                transform={`translate(${flaskPos.x}, ${flaskPos.y})`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* 隱藏的加大感應區 */}
                <rect x="-80" y="-120" width="160" height="200" fill="transparent" />

                {/* 容器主體 */}
                <rect x="-50" y="-70" width="100" height="140" fill="#f8fafc" stroke="#475569" strokeWidth="8" rx="10" />
                
                {/* 容器瓶頸與閥門 */}
                <rect x="-15" y="-100" width="30" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="8" />
                <rect x="-25" y="-110" width="50" height="15" fill="#334155" rx="3" />

                {/* 提示拖曳的手指圖示 */}
                {!isDragging && flaskPos.x === 200 && flaskPos.y === 150 && (
                  <g transform="translate(0, -145)" style={{ animation: 'bounce 1s infinite', pointerEvents: 'none' }}>
                    <path d="M 0 0 L 10 -15 L -10 -15 Z" fill="#64748b" />
                    <rect x="-4" y="-30" width="8" height="16" fill="#64748b" />
                    <text x="0" y="-35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">拖曳我</text>
                  </g>
                )}

                {/* 粒子 (統一顏色) */}
                {particlesRef.current.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="#3b82f6" 
                    opacity="0.9" 
                  />
                ))}

                {/* 附著在容器上的溫度計 */}
                <g transform="translate(55, -45)">
                  <rect x="0" y="0" width="12" height="100" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                  {/* 動態紅色水銀柱 */}
                  <rect 
                    x="3" 
                    y={90 - thermometerHeight} 
                    width="6" 
                    height={thermometerHeight + 5} 
                    fill="#ef4444" 
                    rx="3" 
                  />
                  <circle cx="6" cy="92" r="10" fill="#ef4444" />
                  {/* 刻度 */}
                  <line x1="12" y1="10" x2="16" y2="10" stroke="#64748b" strokeWidth="2" />
                  <line x1="12" y1="50" x2="16" y2="50" stroke="#64748b" strokeWidth="2" />
                  <line x1="12" y1="90" x2="16" y2="90" stroke="#64748b" strokeWidth="2" />
                </g>
              </g>
            </svg>
          </Box>

          {/* 數據儀表板 */}
          <Grid container spacing={2} sx={{ mt: 2, maxWidth: '400px', width: '100%' }}>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>系統溫度 (T)</Typography>
                <Typography variant="h5" sx={{ fontFamily: '"Fira Code","Consolas",monospace', fontWeight: 700, color: '#ea580c', mt: 0.5 }}>
                  {temperature.toFixed(0)} K
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5 }}>
                  ({(temperature - 273.15).toFixed(1)} °C)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>內部壓力 (P)</Typography>
                <Typography variant="h5" sx={{ fontFamily: '"Fira Code","Consolas",monospace', fontWeight: 700, color: '#059669', mt: 0.5 }}>
                  {pressure.toFixed(1)} kPa
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 左側：雙圖表區 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* 上半部：攝氏溫度圖表 */}
          <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid', borderColor: '#e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, textAlign: { xs: 'center', lg: 'left' } }}>
              壓力與溫度關係圖 (攝氏 °C)
            </Typography>
            <Box sx={{ width: '100%', aspectRatio: '5/3.2', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                
                {/* 網格線 */}
                {[-300, -200, -100, 0, 100, 200, 300, 400].map((tc) => (
                  <g key={`grid-x-c-${tc}`}>
                    <line 
                      x1={mapXc(tc)} y1={margin.top} 
                      x2={mapXc(tc)} y2={graphHeight - margin.bottom} 
                      stroke={tc === 0 ? "#cbd5e1" : "#f1f5f9"} strokeWidth={tc === 0 ? "2" : "1.5"} 
                    />
                    <text x={mapXc(tc)} y={graphHeight - margin.bottom + 16} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#94a3b8">
                      {tc}
                    </text>
                  </g>
                ))}
                {[0, 50, 100, 150, 200].map((p) => (
                  <g key={`grid-y-c-${p}`}>
                    <line 
                      x1={margin.left} y1={mapY(p)} 
                      x2={graphWidth - margin.right} y2={mapY(p)} 
                      stroke="#f1f5f9" strokeWidth="1.5" 
                    />
                    <text x={margin.left - 8} y={mapY(p) + 4} textAnchor="end" fontSize="10" fontFamily="monospace" fill="#94a3b8">
                      {p}
                    </text>
                  </g>
                ))}

                {/* 坐標軸 */}
                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={graphWidth - margin.right} y2={graphHeight - margin.bottom} stroke="#475569" strokeWidth="1.5" />
                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={margin.left} y2={margin.top} stroke="#475569" strokeWidth="1.5" />

                {/* 坐標軸標籤 */}
                <text x={margin.left + plotWidth / 2} y={graphHeight - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">
                  溫度, T (°C)
                </text>
                <text transform={`translate(${margin.left - 45}, ${margin.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">
                  壓力, P (kPa)
                </text>

                {/* 理論線性虛線 (指向絕對零度 -273.15) */}
                <line 
                  x1={mapXc(-273.15)} y1={mapY(0)} 
                  x2={mapXc(400)} y2={mapY((400 + 273.15) * CONSTANT_K)} 
                  stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" 
                />
                <text x={mapXc(-273.15)} y={mapY(0) - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">
                  -273.15°C
                </text>
                <circle cx={mapXc(-273.15)} cy={mapY(0)} r="4" fill="#3b82f6" />

                {/* 實際運作軌跡 (P = k * T) */}
                <line 
                  x1={mapXc(150 - 273.15)} y1={mapY(150 * CONSTANT_K)} 
                  x2={mapXc(500 - 273.15)} y2={mapY(500 * CONSTANT_K)} 
                  stroke="#ea580c" strokeWidth="3" opacity="0.3" strokeLinecap="round"
                />

                {/* 當前狀態點 */}
                <circle cx={mapXc(temperature - 273.15)} cy={mapY(pressure)} r="6" fill="#ef4444" stroke="white" strokeWidth="2"  />
                
                {/* 當前數據提示框 */}
                <g transform={`translate(${Math.max(margin.left + 52, Math.min(graphWidth - margin.right - 52, mapXc(temperature - 273.15)))}, ${mapY(pressure) - 30})`}>
                  <rect x="-52" y="0" width="105" height="24" rx="4" fill="#0f172a" opacity="0.85" />
                  <text x="0" y="15" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="white">
                    {(temperature - 273.15).toFixed(1)} °C, {pressure.toFixed(0)} kPa
                  </text>
                </g>
              </svg>
            </Box>
          </Paper>

          {/* 下半部：克氏溫度圖表 */}
          <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid', borderColor: '#e2e8f0' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, textAlign: { xs: 'center', lg: 'left' } }}>
              壓力與溫度關係圖 (克氏 K)
            </Typography>
            <Box sx={{ width: '100%', aspectRatio: '5/3.2', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                
                {/* 網格線 */}
                {[0, 100, 200, 300, 400, 500, 600].map((t) => (
                  <g key={`grid-x-k-${t}`}>
                    <line 
                      x1={mapX(t)} y1={margin.top} 
                      x2={mapX(t)} y2={graphHeight - margin.bottom} 
                      stroke="#f1f5f9" strokeWidth="1.5" 
                    />
                    <text x={mapX(t)} y={graphHeight - margin.bottom + 16} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#94a3b8">
                      {t}
                    </text>
                  </g>
                ))}
                {[0, 50, 100, 150, 200].map((p) => (
                  <g key={`grid-y-k-${p}`}>
                    <line 
                      x1={margin.left} y1={mapY(p)} 
                      x2={graphWidth - margin.right} y2={mapY(p)} 
                      stroke="#f1f5f9" strokeWidth="1.5" 
                    />
                    <text x={margin.left - 8} y={mapY(p) + 4} textAnchor="end" fontSize="10" fontFamily="monospace" fill="#94a3b8">
                      {p}
                    </text>
                  </g>
                ))}

                {/* 坐標軸 */}
                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={graphWidth - margin.right} y2={graphHeight - margin.bottom} stroke="#475569" strokeWidth="1.5" />
                <line x1={margin.left} y1={graphHeight - margin.bottom} x2={margin.left} y2={margin.top} stroke="#475569" strokeWidth="1.5" />

                {/* 坐標軸標籤 */}
                <text x={margin.left + plotWidth / 2} y={graphHeight - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">
                  溫度, T (Kelvin)
                </text>
                <text transform={`translate(${margin.left - 45}, ${margin.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">
                  壓力, P (kPa)
                </text>

                {/* 理論線性虛線 (指向絕對零度 0K) */}
                <line 
                  x1={mapX(0)} y1={mapY(0)} 
                  x2={mapX(600)} y2={mapY(600 * CONSTANT_K)} 
                  stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" 
                />
                
                {/* 絕對零度標示 */}
                <text x={mapX(0)} y={mapY(0) - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">
                  0 K
                </text>
                <circle cx={mapX(0)} cy={mapY(0)} r="4" fill="#3b82f6" />

                {/* 實際運作軌跡 (P = k * T) */}
                <line 
                  x1={mapX(150)} y1={mapY(150 * CONSTANT_K)} 
                  x2={mapX(500)} y2={mapY(500 * CONSTANT_K)} 
                  stroke="#ea580c" strokeWidth="3" opacity="0.3" strokeLinecap="round"
                />

                {/* 當前狀態點 */}
                <circle cx={mapX(temperature)} cy={mapY(pressure)} r="6" fill="#ef4444" stroke="white" strokeWidth="2"  />
                
                {/* 當前數據提示框 */}
                <g transform={`translate(${Math.max(margin.left + 52, Math.min(graphWidth - margin.right - 52, mapX(temperature)))}, ${mapY(pressure) - 30})`}>
                  <rect x="-52" y="0" width="105" height="24" rx="4" fill="#0f172a" opacity="0.85" />
                  <text x="0" y="15" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="white">
                    {temperature.toFixed(0)} K, {pressure.toFixed(0)} kPa
                  </text>
                </g>
              </svg>
            </Box>
            
            {/* 說明文字整合到下方 */}
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: '#eff6ff', border: '1px solid', borderColor: '#dbeafe', fontSize: '0.75rem', color: '#334155', lineHeight: 1.625, boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a5f', mb: 0.5 }}>💡 物理觀察：</Typography>
              留意上方的攝氏圖表，壓力與溫度呈現線性關係，且延長線交於 <strong>-273.15 °C (絕對零度)</strong>。下方的克氏圖表則將原點設為絕對零度，因此圖線完美通過原點 (0, 0)，展現了壓力與絕對溫度成 <strong>正比 (P ∝ T)</strong> 的特性。
            </Box>
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}

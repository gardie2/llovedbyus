'use client';

import React, { useState, useRef } from 'react';

interface LayerItem {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export default function DesignLab() {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const newLayer: LayerItem = {
        id: `layer-${Date.now()}`,
        type: 'image',
        content: imageUrl,
        x: 180,
        y: 220,
        scale: 1,
        rotation: 0,
        opacity: 1,
        zIndex: layers.length + 1,
      };
      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSticker = (stickerSrc: string) => {
    const newLayer: LayerItem = {
      id: `layer-${Date.now()}`,
      type: 'image',
      content: stickerSrc,
      x: 180,
      y: 220,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: layers.length + 1,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleStart = (clientX: number, clientY: number, id: string, e?: React.SyntheticEvent) => {
    if (e && 'touches' in e && (e.touches as TouchList).length > 1) {
      return;
    }
    setSelectedLayerId(id);
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !selectedLayerId) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === selectedLayerId) {
          return { ...l, x: l.x + dx, y: l.y + dy };
        }
        return l;
      })
    );
    setDragStart({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const stickersList = [
    { id: 1, src: '/stiker-1.png' },
    { id: 2, src: '/stiker-2.png' },
    { id: 3, src: '/stiker-3.png' },
    { id: 4, src: '/stiker-4.png' },
    { id: 5, src: '/stiker-5.png' },
    { id: 6, src: '/stiker-6.png' },
    { id: 7, src: '/stiker-7.png' },
    { id: 8, src: '/stiker-8.png' },
    { id: 9, src: '/stiker-9.png' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center font-sans">
      {/* Header Judul */}
      <h1 className="text-xl md:text-3xl font-black italic tracking-wider mb-8 text-center bg-gradient-to-r from-white via-neutral-200 to-pink-400 bg-clip-text text-transparent">
        CUSTOMIZE CUSTOM PHONE CASE
      </h1>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KIRI: PREVIEW CASE */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[550px]">
          <div
            ref={containerRef}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleEnd}
            className="relative w-[340px] h-[480px] flex items-center justify-center overflow-hidden select-none touch-none"
          >
            {/* Background Mockup Case */}
            <img
              src="/mockup-case.png"
              alt="Mockup Case"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
            />

            {/* Layer Elemen Desain */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onMouseDown={(e) => handleStart(e.clientX, e.clientY, layer.id, e)}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                      handleStart(e.touches[0].clientX, e.touches[0].clientY, layer.id, e);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: `${layer.x}px`,
                    top: `${layer.y}px`,
                    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                    opacity: layer.opacity,
                    zIndex: layer.zIndex,
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                  className={`p-1 ${
                    selectedLayerId === layer.id ? 'ring-2 ring-pink-500 rounded' : ''
                  }`}
                >
                  <img
                    src={layer.content}
                    alt="Design Element"
                    className="max-w-[130px] max-h-[130px] object-contain pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KANAN: PANEL KONTROL ASLI */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Tombol Upload & Template */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex gap-4">
            <label className="flex-1 bg-pink-400 hover:bg-pink-500 text-black font-black py-3.5 px-6 rounded-xl text-center cursor-pointer transition-all shadow-lg text-sm tracking-wide">
              UPLOAD FOTO
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <button className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold py-3.5 px-6 rounded-xl text-center border border-neutral-700 transition-all text-sm tracking-wide">
              TEMPLATE
            </button>
          </div>

          {/* Upload Foto Utama */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase">
              UPLOAD FOTO UTAMA
            </h3>
            <p className="text-xs text-neutral-400">Choose File No file chosen</p>
          </div>

          {/* Tambah Stiker & Frame */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase">
              TAMBAH STIKER & FRAME
            </h3>
            <div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto pr-1">
              {stickersList.map((stiker) => (
                <button
                  key={stiker.id}
                  onClick={() => handleAddSticker(stiker.src)}
                  className="bg-neutral-950 border border-neutral-800 hover:border-pink-500 rounded-xl h-20 flex items-center justify-center relative transition-all group"
                >
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-neutral-500 group-hover:text-pink-400">
                    {stiker.id}
                  </span>
                  <span className="text-xs text-neutral-600">Stiker {stiker.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Catatan / Ukuran & Detail */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase">
              CATATAN / UKURAN & DETAIL
            </h3>
            <input
              type="text"
              placeholder="Contoh: iPhone 13 / Samsung S22"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
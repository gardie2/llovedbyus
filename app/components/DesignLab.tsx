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

interface DesignLabProps {
  productTitle?: string;
  onClose?: () => void;
}

export default function DesignLab({ productTitle, onClose }: DesignLabProps) {
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
        y: 240,
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
      y: 240,
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
    
    let scaleX = 1;
    let scaleY = 1;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      scaleX = 350 / rect.width;
      scaleY = 480 / rect.height;
    }

    const dx = (clientX - dragStart.x) * scaleX;
    const dy = (clientY - dragStart.y) * scaleY;

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

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let loadedCount = 0;
    const renderableLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    if (renderableLayers.length === 0) {
      alert('Belum ada desain untuk di-download!');
      return;
    }

    renderableLayers.forEach((layer) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = layer.content;
      img.onload = () => {
        ctx.save();
        ctx.translate(layer.x * 2.5, layer.y * 2.5);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.globalAlpha = layer.opacity;
        const w = img.width * layer.scale * 0.5;
        const h = img.height * layer.scale * 0.5;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();

        loadedCount++;
        if (loadedCount === renderableLayers.length) {
          const link = document.createElement('a');
          link.download = `custom-case-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
    });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Halo, saya ingin memesan custom case dengan catatan: ${noteInput || 'Tidak ada catatan'}`);
    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
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
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center font-sans relative">
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 border-b border-neutral-900 pb-3">
        <span className="text-xs md:text-sm font-black tracking-widest text-pink-400">
          + LLOVEDBYUS DESIGN STUDIO
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-800 transition-all"
          >
            ✕ TUTUP STUDIO
          </button>
        )}
      </div>

      <h1 className="text-xl md:text-3xl font-black italic tracking-wider mb-8 text-center bg-gradient-to-r from-white via-neutral-200 to-pink-400 bg-clip-text text-transparent">
        {productTitle || 'CUSTOMIZE CUSTOM PHONE CASE'}
      </h1>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
            <img
              src="/mockup-case.png"
              alt="Mockup Case"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
            />

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

        <div className="lg:col-span-7 flex flex-col gap-6">
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

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase">
              UPLOAD FOTO UTAMA
            </h3>
            <p className="text-xs text-neutral-400">Choose File No file chosen</p>
          </div>

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

          <button
            onClick={handleDownload}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-3.5 px-4 rounded-xl text-center border border-neutral-700 transition-all text-xs tracking-widest"
          >
            DOWNLOAD HASIL DESAIN (PNG)
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-black font-black py-4 px-4 rounded-xl text-center shadow-xl transition-all text-xs tracking-widest active:scale-95"
          >
            PESAN VIA WHATSAPP SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
}
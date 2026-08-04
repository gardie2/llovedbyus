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

type ProductType = 'case' | 'tshirt' | 'hoodie' | 'sweatshirt' | 'totebag';

interface DesignLabProps {
  productTitle?: string;
}

export default function DesignLab({ productTitle }: DesignLabProps) {
  const [product, setProduct] = useState<ProductType>('case');
  const [caseModel, setCaseModel] = useState<string>('iphone15pro');
  const [apparelColor, setApparelColor] = useState<string>('#ffffff');
  
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  
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
        x: 200,
        y: 250,
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

  const handleAddText = () => {
    if (!textInput.trim()) return;
    const newLayer: LayerItem = {
      id: `layer-${Date.now()}`,
      type: 'text',
      content: textInput,
      x: 200,
      y: 250,
      scale: 1,
      rotation: 0,
      opacity: 1,
      zIndex: layers.length + 1,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setTextInput('');
  };

  const updateSelectedLayer = (key: keyof LayerItem, value: any) => {
    if (!selectedLayerId) return;
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === selectedLayerId) {
          return { ...layer, [key]: value };
        }
        return layer;
      })
    );
  };

  const removeSelectedLayer = () => {
    if (!selectedLayerId) return;
    setLayers((prev) => prev.filter((l) => l.id !== selectedLayerId));
    setSelectedLayerId(null);
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
    if (!isDragging || !selectedLayerId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 500 / rect.height;

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
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let loadedCount = 0;
    const renderableLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    if (renderableLayers.length === 0) {
      alert('Belum ada desain untuk di-download!');
      return;
    }

    const scaleFactor = 3;

    renderableLayers.forEach((layer) => {
      if (layer.type === 'text') {
        ctx.save();
        ctx.translate(layer.x * scaleFactor, layer.y * scaleFactor);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.globalAlpha = layer.opacity;
        ctx.font = `bold ${32 * layer.scale * scaleFactor}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(layer.content, 0, 0);
        ctx.restore();

        loadedCount++;
        if (loadedCount === renderableLayers.length) {
          triggerDownload(canvas);
        }
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = layer.content;
        img.onload = () => {
          ctx.save();
          ctx.translate(layer.x * scaleFactor, layer.y * scaleFactor);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.globalAlpha = layer.opacity;
          
          const maxW = 150 * layer.scale * scaleFactor;
          const maxH = 150 * layer.scale * scaleFactor;
          let w = img.width;
          let h = img.height;
          const ratio = Math.min(maxW / w, maxH / h);
          w *= ratio;
          h *= ratio;

          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          ctx.restore();

          loadedCount++;
          if (loadedCount === renderableLayers.length) {
            triggerDownload(canvas);
          }
        };
      }
    });
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `design-${product}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            {productTitle || 'DESIGN LAB STUDIO'}
          </h1>
          <p className="text-xs md:text-sm text-neutral-400">
            Kreasikan custom case & apparel kamu secara langsung
          </p>
        </div>

        {/* Product Switcher */}
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          {(['case', 'tshirt', 'hoodie', 'sweatshirt', 'totebag'] as ProductType[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                setProduct(p);
                setSelectedLayerId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                product === p
                  ? 'bg-white text-black shadow-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* WORKSPACE PREVIEW */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[500px]">
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
            className="relative w-[350px] h-[450px] md:w-[400px] md:h-[500px] flex items-center justify-center overflow-hidden rounded-2xl select-none touch-none"
          >
            {/* Mockup Case Background Dipastikan Muncul Kembali */}
            {product === 'case' ? (
              <img
                src="/mockup-case.png"
                alt="Mockup Case Background"
                className="absolute inset-0 w-full h-full object-contain z-0"
              />
            ) : (
              <div
                className="absolute inset-0 w-full h-full rounded-xl transition-colors duration-300 z-0"
                style={{ backgroundColor: apparelColor }}
              />
            )}

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
                    zIndex: layer.zIndex + 10,
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                  className={`p-1 transition-shadow ${
                    selectedLayerId === layer.id
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black rounded'
                      : ''
                  }`}
                >
                  {layer.type === 'image' ? (
                    <img
                      src={layer.content}
                      alt="Layer"
                      className="max-w-[150px] max-h-[150px] object-contain pointer-events-none"
                    />
                  ) : (
                    <span className="text-xl font-bold whitespace-nowrap text-white pointer-events-none select-none">
                      {layer.content}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-500 mt-4 flex items-center gap-1.5">
            <svg className="w-4 h-4 fill-current text-neutral-500" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            Geser elemen menggunakan satu jari pada layar HP.
          </p>
        </div>

        {/* SIDEBAR TOOLS */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Opsi Produk ({product})
            </h3>

            {product === 'case' ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Pilih Tipe HP:</label>
                <select
                  value={caseModel}
                  onChange={(e) => setCaseModel(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:border-neutral-600 text-white"
                >
                  <option value="iphone15pro">iPhone 15 Pro / Pro Max</option>
                  <option value="iphone14pro">iPhone 14 Pro</option>
                  <option value="samsungS23">Samsung S23 Ultra</option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Warna Dasar Apparel:</label>
                <div className="flex gap-2">
                  {['#ffffff', '#171717', '#dc2626', '#2563eb', '#16a34a'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setApparelColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-8 h-8 rounded-full border-2 ${
                        apparelColor === color ? 'border-indigo-500 scale-110' : 'border-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Tambah Elemen Desain
            </h3>

            <div>
              <label className="flex items-center justify-center gap-2 w-full bg-neutral-950 border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-3 cursor-pointer transition-colors text-xs font-semibold">
                <svg className="w-4 h-4 stroke-indigo-400 fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span>Upload Gambar / Stiker</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik teks kustom..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neutral-600 text-white"
              />
              <button
                onClick={handleAddText}
                className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Tambah
              </button>
            </div>
          </div>

          {selectedLayer ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h3 className="text-sm font-bold text-indigo-400">Edit Layer Aktif</h3>
                <button
                  onClick={removeSelectedLayer}
                  className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Ukuran / Skala</span>
                  <span>{Math.round(selectedLayer.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={selectedLayer.scale}
                  onChange={(e) => updateSelectedLayer('scale', parseFloat(e.target.value))}
                  className="accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Rotasi</span>
                  <span>{selectedLayer.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedLayer.rotation}
                  onChange={(e) => updateSelectedLayer('rotation', parseInt(e.target.value, 10))}
                  className="accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Transparansi</span>
                  <span>{Math.round(selectedLayer.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedLayer.opacity}
                  onChange={(e) => updateSelectedLayer('opacity', parseFloat(e.target.value))}
                  className="accent-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center text-xs text-neutral-500">
              Pilih elemen di canvas untuk mengatur skala, rotasi, & transparansi melalui panel slider.
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
          >
            <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            <span>Download Desain (Transparan)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useRef } from 'react';
import { Upload, Trash2, Download, MessageCircle, Sparkles, Image as ImageIcon, FileText, X, RefreshCw, Plus } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

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
  frameId?: string;
}

interface FrameSlotState {
  frameInstanceId: string;
  elmId: number;
  slots: { [key: number]: string | null };
}

interface DesignLabProps {
  initialProduct?: string;
  productTitle?: string;
  onClose?: () => void;
}

const FRAME24_PIXELS = [
  { left: '28.2%', top: '7.9%', width: '43.4%', height: '24.4%' },
  { left: '28.2%', top: '37.2%', width: '43.4%', height: '24.4%' },
  { left: '28.2%', top: '66.5%', width: '43.4%', height: '24.4%' },
];

export default function DesignLab({ initialProduct = 'case', productTitle, onClose }: DesignLabProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'upload' | 'template'>('upload');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [currentUploadedImage, setCurrentUploadedImage] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);

  const [activeFrames, setActiveFrames] = useState<FrameSlotState[]>([]);
  const [uploadTarget, setUploadTarget] = useState<{ frameInstanceId: string; slotIdx: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartAngle, setTouchStartAngle] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);
  const [initialRotation, setInitialRotation] = useState<number>(0);

  const getBackgroundMockup = () => {
    if (activeTab === 'template' && selectedTemplateId !== null) {
      return `/template-${selectedTemplateId}.png`;
    }
    return '/mockup-case.png';
  };

  const currentMockup = {
    bg: getBackgroundMockup(),
    fg: '/mockup-case-transparent.png',
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;

      if (uploadTarget) {
        setActiveFrames((prev) =>
          prev.map((f) => {
            if (f.frameInstanceId === uploadTarget.frameInstanceId) {
              return {
                ...f,
                slots: { ...f.slots, [uploadTarget.slotIdx]: imageUrl },
              };
            }
            return f;
          })
        );
        setUploadTarget(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setOriginalImageUrl(imageUrl);
      setCurrentUploadedImage(imageUrl);

      const newLayer: LayerItem = {
        id: `layer-${Date.now()}`,
        type: 'image',
        content: imageUrl,
        x: 150,
        y: 220,
        scale: 0.6,
        rotation: 0,
        opacity: 1,
        zIndex: layers.length + 1,
      };
      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!currentUploadedImage) return;
    setIsRemovingBg(true);

    try {
      const blob = await removeBackground(currentUploadedImage);
      const url = URL.createObjectURL(blob);
      setCurrentUploadedImage(url);

      setLayers((prev) =>
        prev.map((l) => (l.content === originalImageUrl || l.content === currentUploadedImage ? { ...l, content: url } : l))
      );
    } catch (error) {
      console.error('Gagal menghapus background:', error);
      alert('Gagal memproses AI background removal.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleResetBackground = () => {
    if (!originalImageUrl) return;
    setCurrentUploadedImage(originalImageUrl);
    setLayers((prev) =>
      prev.map((l) => (l.content === currentUploadedImage ? { ...l, content: originalImageUrl } : l))
    );
  };

  const addStickerToCanvas = (src: string, id: number) => {
    const frameInstanceId = `frame-${Date.now()}`;
    const frameLayer: LayerItem = {
      id: frameInstanceId,
      type: 'image',
      content: src,
      x: 150,
      y: 220,
      scale: 0.85,
      rotation: 0,
      opacity: 1,
      zIndex: layers.length + 1,
    };

    let newLayers = [...layers, frameLayer];

    if (id === 24) {
      setActiveFrames((prev) => [
        ...prev,
        { frameInstanceId, elmId: 24, slots: { 0: null, 1: null, 2: null } },
      ]);
    } else if (id === 25) {
      setActiveFrames((prev) => [
        ...prev,
        { frameInstanceId, elmId: 25, slots: { 0: null } },
      ]);
    }

    setLayers(newLayers);
    setSelectedLayerId(frameInstanceId);
  };

  const removeLayerById = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayers((prev) => prev.filter((l) => l.id !== id && l.frameId !== id));
    setActiveFrames((prev) => prev.filter((f) => f.frameInstanceId !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
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
      scaleX = 300 / rect.width;
      scaleY = 440 / rect.height;
    }

    const dx = (clientX - dragStart.x) * scaleX;
    const dy = (clientY - dragStart.y) * scaleY;

    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === selectedLayerId || l.frameId === selectedLayerId) {
          return { ...l, x: l.x + dx, y: l.y + dy };
        }
        return l;
      })
    );
    setDragStart({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    setIsDragging(false);
    setTouchStartDist(null);
    setTouchStartAngle(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && selectedLayerId) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);

      if (touchStartDist === null || touchStartAngle === null) {
        setTouchStartDist(dist);
        setTouchStartAngle(angle);
        const activeLayer = layers.find((l) => l.id === selectedLayerId);
        if (activeLayer) {
          setInitialScale(activeLayer.scale);
          setInitialRotation(activeLayer.rotation);
        }
      } else {
        const scaleFactor = dist / touchStartDist;
        const angleDelta = angle - touchStartAngle;

        setLayers((prev) =>
          prev.map((l) => {
            if (l.id === selectedLayerId || l.frameId === selectedLayerId) {
              return {
                ...l,
                scale: Math.max(0.1, Math.min(4, initialScale * scaleFactor)),
                rotation: (initialRotation + angleDelta) % 360,
              };
            }
            return l;
          })
        );
      }
    } else if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!selectedLayerId) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === selectedLayerId || l.frameId === selectedLayerId) {
          return { ...l, scale: Math.max(0.1, Math.min(4, l.scale + delta)) };
        }
        return l;
      })
    );
  };

  const handleDownload = () => {
    const renderableLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    if (renderableLayers.length === 0 && activeFrames.length === 0) {
      alert('Belum ada foto atau stiker yang ditambahkan untuk di-download!');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 880;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allExportItems: { content: string; x: number; y: number; scale: number; rotation: number; opacity: number; zIndex: number; isCover?: boolean; width?: number; height?: number }[] = [];

    renderableLayers.forEach((l) => {
      const frameState = activeFrames.find((f) => f.frameInstanceId === l.id);
      if (frameState) {
        Object.entries(frameState.slots).forEach(([sIndexStr, imgUrl]) => {
          if (imgUrl) {
            const sIdx = Number(sIndexStr);
            let slotOffsetX = 0;
            let slotOffsetY = 0;
            let boxW = 86;
            let boxH = 86;

            if (frameState.elmId === 24) {
              if (sIdx === 0) {
                slotOffsetX = -1;
                slotOffsetY = -103;
                boxW = 84;
                boxH = 79;
              }
              if (sIdx === 1) {
                slotOffsetX = -1;
                slotOffsetY = -25;
                boxW = 84;
                boxH = 79;
              }
              if (sIdx === 2) {
                slotOffsetX = -1;
                slotOffsetY = 53;
                boxW = 84;
                boxH = 79;
              }
            } else if (frameState.elmId === 25) {
              slotOffsetY = -64;
              boxW = 104;
              boxH = 108;
            }

            allExportItems.push({
              content: imgUrl,
              x: l.x + slotOffsetX,
              y: l.y + slotOffsetY,
              scale: l.scale,
              rotation: l.rotation,
              opacity: 1,
              zIndex: l.zIndex - 0.1,
              isCover: true,
              width: boxW,
              height: boxH,
            });
          }
        });
      }
      allExportItems.push(l);
    });

    allExportItems.sort((a, b) => a.zIndex - b.zIndex);

    let loadedCount = 0;
    if (allExportItems.length === 0) return;

    allExportItems.forEach((item) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.content;
      img.onload = () => {
        ctx.save();
        ctx.translate(item.x * 2, item.y * 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.globalAlpha = item.opacity;

        if (item.isCover && item.width && item.height) {
          const targetW = item.width * 2 * item.scale;
          const targetH = item.height * 2 * item.scale;
          const imgAspect = img.width / img.height;
          const boxAspect = targetW / targetH;

          let renderW = targetW;
          let renderH = targetH;
          let offsetX = -targetW / 2;
          let offsetY = -targetH / 2;

          if (imgAspect > boxAspect) {
            renderW = targetH * imgAspect;
            offsetX = -renderW / 2;
          } else {
            renderH = targetW / imgAspect;
            offsetY = -targetH / 2;
          }

          ctx.beginPath();
          ctx.rect(-targetW / 2, -targetH / 2, targetW, targetH);
          ctx.clip();
          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        } else {
          const w = img.width * item.scale * 0.4;
          const h = img.height * item.scale * 0.4;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }

        ctx.restore();

        loadedCount++;
        if (loadedCount === allExportItems.length) {
          const link = document.createElement('a');
          link.download = `custom-design-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
    });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Halo, saya ingin memesan Custom Phone Case dengan catatan: ${noteInput || 'Tidak ada catatan'}`);
    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
  };

  const stickersList = Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    src: `/elm${i + 1}.png`,
  }));

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center font-sans relative selection:bg-pink-500 selection:text-black">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="w-full max-w-5xl flex justify-between items-center mb-6 border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          <span className="text-xs md:text-sm font-black tracking-widest text-pink-400">
            LLOVEDBYUS DESIGN STUDIO
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3.5 py-1.5 rounded-lg border border-neutral-800 transition-all flex items-center gap-1.5"
          >
            ✕ TUTUP STUDIO
          </button>
        )}
      </div>

      <h1 className="text-xl md:text-3xl font-black italic tracking-wider mb-8 text-center bg-gradient-to-r from-white via-neutral-200 to-pink-400 bg-clip-text text-transparent">
        {productTitle || 'Custom Phone Case'}
      </h1>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PREVIEW KIRI */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[550px] shadow-2xl">
          <div
            ref={containerRef}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onWheel={handleWheel}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handleStart(e.touches[0].clientX, e.touches[0].clientY, selectedLayerId || '', e);
              }
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
            className="relative w-[300px] h-[440px] flex items-center justify-center overflow-hidden select-none touch-none rounded-xl bg-neutral-900"
          >
            <img
              src={currentMockup.bg}
              alt="Mockup Background"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0"
            />

            <div className="absolute inset-0 z-10 flex items-center justify-center">
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const frameState = activeFrames.find((f) => f.frameInstanceId === layer.id);

                return (
                  <div
                    key={layer.id}
                    onMouseDown={(e) => handleStart(e.clientX, e.clientY, layer.id, e)}
                    style={{
                      position: 'absolute',
                      left: `${layer.x}px`,
                      top: `${layer.y}px`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                      opacity: layer.opacity,
                      zIndex: layer.zIndex,
                      cursor: isDragging ? 'grabbing' : 'grab',
                    }}
                    className="p-1 transition-all"
                  >
                    {frameState && (
                      <div className="absolute inset-0 pointer-events-auto z-0">
                        {frameState.elmId === 24 && (
                          <>
                            {/* Kotak Atas */}
                            <div 
                              className="absolute flex items-center justify-center overflow-hidden bg-neutral-900 rounded-[1px]"
                              style={{ top: FRAME24_PIXELS[0].top, left: FRAME24_PIXELS[0].left, width: FRAME24_PIXELS[0].width, height: FRAME24_PIXELS[0].height }}
                            >
                              {frameState.slots[0] ? (
                                <img src={frameState.slots[0]} alt="Slot 0" className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadTarget({ frameInstanceId: layer.id, slotIdx: 0 });
                                    fileInputRef.current?.click();
                                  }}
                                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-1 shadow transition-transform hover:scale-110 flex items-center justify-center z-10"
                                >
                                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                                </button>
                              )}
                            </div>
                            {/* Kotak Tengah */}
                            <div 
                              className="absolute flex items-center justify-center overflow-hidden bg-neutral-900 rounded-[1px]"
                              style={{ top: FRAME24_PIXELS[1].top, left: FRAME24_PIXELS[1].left, width: FRAME24_PIXELS[1].width, height: FRAME24_PIXELS[1].height }}
                            >
                              {frameState.slots[1] ? (
                                <img src={frameState.slots[1]} alt="Slot 1" className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadTarget({ frameInstanceId: layer.id, slotIdx: 1 });
                                    fileInputRef.current?.click();
                                  }}
                                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-1 shadow transition-transform hover:scale-110 flex items-center justify-center z-10"
                                >
                                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                                </button>
                              )}
                            </div>
                            {/* Kotak Bawah */}
                            <div 
                              className="absolute flex items-center justify-center overflow-hidden bg-neutral-900 rounded-[1px]"
                              style={{ top: FRAME24_PIXELS[2].top, left: FRAME24_PIXELS[2].left, width: FRAME24_PIXELS[2].width, height: FRAME24_PIXELS[2].height }}
                            >
                              {frameState.slots[2] ? (
                                <img src={frameState.slots[2]} alt="Slot 2" className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadTarget({ frameInstanceId: layer.id, slotIdx: 2 });
                                    fileInputRef.current?.click();
                                  }}
                                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-1 shadow transition-transform hover:scale-110 flex items-center justify-center z-10"
                                >
                                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                                </button>
                              )}
                            </div>
                          </>
                        )}

                        {frameState.elmId === 25 && (
                          <div className="absolute top-[6.2%] left-[10.2%] w-[79.5%] h-[42.6%] flex items-center justify-center overflow-hidden bg-neutral-900 rounded-[2px]">
                            {frameState.slots[0] ? (
                              <img src={frameState.slots[0]} alt="Slot 0" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadTarget({ frameInstanceId: layer.id, slotIdx: 0 });
                                  fileInputRef.current?.click();
                                }}
                                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-1 shadow transition-transform hover:scale-110 flex items-center justify-center z-10"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <img
                      src={layer.content}
                      alt="Design Element"
                      className="relative max-w-[150px] max-h-[150px] object-contain pointer-events-none drop-shadow-lg z-10"
                    />

                    {isSelected && (
                      <button
                        title="Hapus"
                        onClick={(e) => removeLayerById(layer.id, e)}
                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg z-30 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <img
              src={currentMockup.fg}
              alt="Mockup Foreground Transparent"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
            />
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex gap-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 font-black py-3.5 px-6 rounded-xl text-center transition-all shadow-lg text-sm tracking-wide flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-pink-400 text-black shadow-pink-500/20'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              UPLOAD FOTO
            </button>
            <button
              onClick={() => {
                setActiveTab('template');
                if (selectedTemplateId === null) setSelectedTemplateId(1);
              }}
              className={`flex-1 font-black py-3.5 px-6 rounded-xl text-center transition-all text-sm tracking-wide flex items-center justify-center gap-2 border ${
                activeTab === 'template'
                  ? 'bg-pink-400 text-black border-pink-400 shadow-lg'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              TEMPLATE
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-pink-400" /> UPLOAD FOTO UTAMA
              </h3>
              <label className="bg-neutral-950 border border-neutral-800 hover:border-pink-500 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group">
                <span className="text-xs text-neutral-400 group-hover:text-white">Choose File No file chosen</span>
                <span className="bg-neutral-900 text-neutral-300 text-xs px-4 py-2 rounded-lg font-bold group-hover:bg-pink-400 group-hover:text-black transition-colors">
                  Browse
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {currentUploadedImage && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isRemovingBg}
                    className="flex-1 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isRemovingBg ? 'AI Processing Background...' : 'Hapus Background AI Otomatis'}
                  </button>
                  <button
                    onClick={handleResetBackground}
                    title="Reset Background"
                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 p-2.5 rounded-xl transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" /> PILIH 4 TEMPLATE SIAP PAKAI
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedTemplateId(num)}
                    className={`bg-neutral-950 border rounded-xl h-24 flex flex-col items-center justify-center p-2 transition-all relative group ${
                      selectedTemplateId === num
                        ? 'border-pink-500 ring-2 ring-pink-500/50 bg-pink-500/10'
                        : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <img
                      src={`/template-${num}.png`}
                      alt={`Template ${num}`}
                      className="max-h-16 max-w-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black tracking-widest text-neutral-300 uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> TAMBAH STIKER & FRAME
            </h3>
            <div className="grid grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {stickersList.map((stiker) => (
                <button
                  key={stiker.id}
                  onClick={() => addStickerToCanvas(stiker.src, stiker.id)}
                  className="bg-neutral-950 border border-neutral-800 hover:border-pink-500 rounded-xl h-24 flex flex-col items-center justify-center relative transition-all group shadow-inner p-2"
                >
                  <img
                    src={stiker.src}
                    alt="Sticker Icon"
                    className="max-h-16 max-w-full object-contain pointer-events-none group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
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
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-black py-3.5 px-4 rounded-xl text-center border border-neutral-700 transition-all text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD HASIL DESAIN (PNG)
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-black font-black py-4 px-4 rounded-xl text-center shadow-xl transition-all text-xs tracking-widest active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            PESAN VIA WHATSAPP SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
}
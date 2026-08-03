"use client";
import { useState, useRef, useMemo } from "react";
import { removeBackground } from "@imgly/background-removal";

interface DesignLabProps {
  productTitle?: string;
}

export default function DesignLab({ productTitle = "Custom Phone Case" }: DesignLabProps) {
  const titleLower = productTitle.toLowerCase();
  const isPhoneCase = titleLower.includes("case");
  const isTshirt = titleLower.includes("t-shirt");

  const [activeTab, setActiveTab] = useState<"edit" | "template">("edit");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [tshirtStyle, setTshirtStyle] = useState<"white" | "black" | "croptop">("white");
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [phoneModel, setPhoneModel] = useState("");
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const [placedElements, setPlacedElements] = useState<Array<{ id: number; src: string; x: number; y: number; scale: number; rotation: number; flipX: boolean; flipY: boolean }>>([]);
  
  const [activeSelection, setActiveSelection] = useState<"photo" | number | null>("photo");

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isInteracting = useRef(false);
  const lastClientPos = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef(0);
  const initialScale = useRef(1);
  const initialTouchAngle = useRef(0);
  const initialElementRotation = useRef(0);
  
  const activeDraggingElementId = useRef<number | null>(null);
  const isDraggingPhoto = useRef(false);

  const { mockupBase, mockupTp } = useMemo(() => {
    if (isPhoneCase) {
      return {
        mockupBase: "/mockup-case.png",
        mockupTp: "/mockup-case-transparent.png"
      };
    } else if (isTshirt) {
      if (tshirtStyle === "black") {
        return { mockupBase: "/blackshirtmu.png", mockupTp: "/blackshirtmu-tp.png" };
      } else if (tshirtStyle === "croptop") {
        return { mockupBase: "/croptopmu.png", mockupTp: "/croptopmu-tp.png" };
      }
      return { mockupBase: "/t-shirtmu.png", mockupTp: "/t-shirtmu-tp.png" };
    } else if (titleLower.includes("hoodie")) {
      return { mockupBase: "/hoodiemu.png", mockupTp: "/hoodiemu-tp.png" };
    } else if (titleLower.includes("sweatshirt")) {
      return { mockupBase: "/sweatshirtmu.png", mockupTp: "/sweatshirtmu-tp.png" };
    } else if (titleLower.includes("tote")) {
      return { mockupBase: "/totebagmu.png", mockupTp: "/totebagmu-tp.png" };
    }
    return { mockupBase: "/mockup-case.png", mockupTp: "/mockup-case-transparent.png" };
  }, [isPhoneCase, isTshirt, tshirtStyle, titleLower]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setOriginalImage(url);
      setFileName(file.name);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setActiveSelection("photo");
    }
  };

  const handleRemoveBackground = async () => {
    if (!uploadedImage) return;
    try {
      setIsRemovingBg(true);
      const blob = await removeBackground(uploadedImage);
      const newUrl = URL.createObjectURL(blob);
      setUploadedImage(newUrl);
    } catch (error) {
      console.error("Gagal menghapus background:", error);
      alert("Gagal memproses background otomatis.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleResetBackground = () => {
    if (originalImage) {
      setUploadedImage(originalImage);
    }
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    setOriginalImage(null);
    setFileName("");
    if (activeSelection === "photo") {
      setActiveSelection(null);
    }
  };

  const handleRemoveElement = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setPlacedElements((prev) => prev.filter((el) => el.id !== id));
    if (activeSelection === id) {
      setActiveSelection(null);
    }
  };

  const handleAddElementToCase = (imageName: string) => {
    const newElement = {
      id: Date.now(),
      src: `/${imageName}`,
      x: 100,
      y: 140,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
    };
    setPlacedElements((prev) => [...prev, newElement]);
    setActiveSelection(newElement.id);
  };

  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const getTouchAngle = (t1: React.Touch, t2: React.Touch) => {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
  };

  const handleStart = (clientX: number, clientY: number, isPhoto: boolean, elementId?: number, e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (isPhoto && activeSelection !== "photo") return;
    if (elementId !== undefined && activeSelection !== elementId) return;

    isInteracting.current = true;
    lastClientPos.current = { x: clientX, y: clientY };

    if (isPhoto) {
      isDraggingPhoto.current = true;
      activeDraggingElementId.current = null;
    } else if (elementId !== undefined) {
      isDraggingPhoto.current = false;
      activeDraggingElementId.current = elementId;
    }

    if (e && 'touches' in e && e.touches.length === 2) {
      initialPinchDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
      initialTouchAngle.current = getTouchAngle(e.touches[0], e.touches[1]);
      
      if (typeof activeSelection === "number") {
        const activeEl = placedElements.find(el => el.id === activeSelection);
        if (activeEl) {
          initialScale.current = activeEl.scale;
          initialElementRotation.current = activeEl.rotation;
        }
      } else {
        initialScale.current = scale;
      }
    }
  };

  const handleMove = (clientX: number, clientY: number, e?: React.TouchEvent | React.MouseEvent) => {
    if (!isInteracting.current) return;
    if (e) e.preventDefault();

    if (e && 'touches' in e && e.touches.length === 2) {
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);
      
      if (initialPinchDistance.current > 0) {
        const factor = dist / initialPinchDistance.current;
        const angleDelta = currentAngle - initialTouchAngle.current;

        if (typeof activeSelection === "number") {
          setPlacedElements((prev) =>
            prev.map((el) => {
              if (el.id === activeSelection) {
                return { 
                  ...el, 
                  scale: Math.min(Math.max(0.3, initialScale.current * factor), 3.0),
                  rotation: Math.round(initialElementRotation.current + angleDelta)
                };
              }
              return el;
            })
          );
        } else if (activeSelection === "photo") {
          const newScale = Math.min(Math.max(0.5, initialScale.current * factor), 3.5);
          setScale(newScale);
        }
      }
      return;
    }

    const dx = clientX - lastClientPos.current.x;
    const dy = clientY - lastClientPos.current.y;

    if (activeDraggingElementId.current !== null) {
      const id = activeDraggingElementId.current;
      setPlacedElements((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
            };
          }
          return el;
        })
      );
      lastClientPos.current = { x: clientX, y: clientY };
    } else if (isDraggingPhoto.current && activeSelection === "photo") {
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      lastClientPos.current = { x: clientX, y: clientY };
    }
  };

  const handleEnd = () => {
    isInteracting.current = false;
    activeDraggingElementId.current = null;
    isDraggingPhoto.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    if (typeof activeSelection === "number") {
      setPlacedElements((prev) =>
        prev.map((el) => {
          if (el.id === activeSelection) {
            return { ...el, scale: Math.min(Math.max(0.3, el.scale + zoomFactor), 3.0) };
          }
          return el;
        })
      );
    } else if (activeSelection === "photo") {
      setScale((prev) => Math.min(Math.max(0.5, prev + zoomFactor), 3.5));
    }
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "62881025376311";
    const styleInfo = isTshirt ? ` (${tshirtStyle.toUpperCase()})` : "";
    const modeDesc = isPhoneCase ? (activeTab === "edit" ? "Custom Foto & Icons" : `Template ${selectedTemplate} + Icons`) : "Custom Foto & Icons";
    const message = `Halo, saya ingin memesan ${productTitle}${styleInfo}.%0A- Mode: ${modeDesc}%0A- Detail/Ukuran: ${phoneModel || "Termasuk Kustomisasi"}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div style={{ width: "100%", maxWidth: "850px", margin: "0 auto", padding: "20px 10px", color: "#f4f4f5", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "900", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "1px", margin: 0 }}>
          Customize <span style={{ background: "linear-gradient(to right, #f4f4f5, #f472b6, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{productTitle} {isTshirt ? `(${tshirtStyle})` : ""}</span>
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        
        <div style={{ width: "280px", backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", boxSizing: "border-box" }}>
          
          {/* CONTAINER UTAMA PREVIEW */}
          <div 
            style={{ 
              width: "256px", 
              height: "400px", 
              backgroundColor: "transparent", 
              borderRadius: "14px", 
              position: "relative", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              touchAction: "none" 
            }}
          >
            
            {/* LAYER 1: MOCKUP DASAR */}
            <img 
              src={mockupBase} 
              alt="Mockup Base" 
              style={{ 
                position: "absolute", 
                inset: 0, 
                width: "100%", 
                height: "100%", 
                objectFit: "contain", 
                zIndex: 10, 
                pointerEvents: "none",
                transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out"
              }}
            />

            {/* LAYER 2: AREA EDIT (Dinamis: Full untuk Case, Dibatasi untuk Kaos/Baju) */}
            <div 
              style={{
                position: "absolute",
                top: isPhoneCase ? "0px" : "85px",
                left: isPhoneCase ? "0px" : "55px",
                width: isPhoneCase ? "100%" : "146px",
                height: isPhoneCase ? "100%" : "235px",
                zIndex: 15,
                overflow: "hidden",
                borderRadius: isPhoneCase ? "14px" : "8px",
                touchAction: "none"
              }}
              onMouseMove={(e) => handleMove(e.clientX, e.clientY, e)}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchMove={(e) => { if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY, e); }}
              onTouchEnd={handleEnd}
              onTouchCancel={handleEnd}
              onWheel={handleWheel}
              onClick={() => {
                if (activeSelection === "photo" && !uploadedImage) setActiveSelection(null);
              }}
            >
              {(!isPhoneCase || activeTab === "edit") ? (
                <>
                  {uploadedImage && (
                    <div 
                      style={{ 
                        position: "absolute", 
                        inset: 0, 
                        cursor: "grab", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        touchAction: "none",
                        border: activeSelection === "photo" ? "1px dashed #f472b6" : "none" 
                      }}
                      onMouseDown={(e) => { 
                        e.stopPropagation();
                        setActiveSelection("photo"); 
                        handleStart(e.clientX, e.clientY, true, undefined, e); 
                      }}
                      onTouchStart={(e) => { 
                        if (e.touches[0]) { 
                          e.stopPropagation();
                          setActiveSelection("photo"); 
                          handleStart(e.touches[0].clientX, e.touches[0].clientY, true, undefined, e); 
                        } 
                      }}
                    >
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded Custom" 
                        style={{
                          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          pointerEvents: "none",
                          userSelect: "none"
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div 
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setActiveSelection(null)}
                >
                  <img 
                    src={`/template-${selectedTemplate}.png`} 
                    alt={`Template ${selectedTemplate}`} 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              )}

              {/* LAYER 3: IKON & ELEMEN DEKORASI */}
              {placedElements.map((el) => {
                const isActive = activeSelection === el.id;
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setActiveSelection(el.id);
                      handleStart(e.clientX, e.clientY, false, el.id, e);
                    }}
                    onTouchStart={(e) => {
                      if (e.touches[0]) {
                        e.stopPropagation();
                        setActiveSelection(el.id);
                        handleStart(e.touches[0].clientX, e.touches[0].clientY, false, el.id, e);
                      }
                    }}
                    style={{
                      position: "absolute",
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
                      zIndex: 25,
                      cursor: "grab",
                      padding: "4px",
                      border: isActive ? "1px dashed #f472b6" : "none",
                      touchAction: "none"
                    }}
                  >
                    <img 
                      src={el.src} 
                      alt="element icon" 
                      style={{ 
                        width: "55px", 
                        height: "55px", 
                        objectFit: "contain", 
                        pointerEvents: "none",
                        transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`
                      }} 
                    />

                    {isActive && (
                      <button
                        onClick={(e) => handleRemoveElement(el.id, e)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "#f472b6",
                          color: "#09090b",
                          border: "none",
                          fontSize: "10px",
                          fontWeight: "900",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 40,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.4)"
                        }}
                        title="Hapus"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

            </div>

            {/* LAYER 4: MOCKUP TRANSPARAN PENIMPA DI ATAS */}
            {mockupTp && (
              <img 
                src={mockupTp} 
                alt="Mockup Overlay" 
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 35, pointerEvents: "none" }}
              />
            )}

          </div>

        </div>

        <div style={{ flex: "1", minWidth: "280px", display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {isTshirt && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "8px" }}>
                Pilih Model & Warna Kaos
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                <button
                  onClick={() => setTshirtStyle("white")}
                  style={{
                    padding: "10px 4px",
                    borderRadius: "10px",
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: tshirtStyle === "white" ? "1px solid #f472b6" : "1px solid rgba(255,255,255,0.1)",
                    background: tshirtStyle === "white" ? "#f4f4f5" : "#18181b",
                    color: tshirtStyle === "white" ? "#09090b" : "#a1a1aa",
                    transition: "all 0.3s ease"
                  }}
                >
                  White
                </button>
                <button
                  onClick={() => setTshirtStyle("black")}
                  style={{
                    padding: "10px 4px",
                    borderRadius: "10px",
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: tshirtStyle === "black" ? "1px solid #f472b6" : "1px solid rgba(255,255,255,0.1)",
                    background: tshirtStyle === "black" ? "#27272a" : "#18181b",
                    color: tshirtStyle === "black" ? "#fff" : "#a1a1aa",
                    transition: "all 0.3s ease"
                  }}
                >
                  Black
                </button>
                <button
                  onClick={() => setTshirtStyle("croptop")}
                  style={{
                    padding: "10px 4px",
                    borderRadius: "10px",
                    fontSize: "9px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: tshirtStyle === "croptop" ? "1px solid #f472b6" : "1px solid rgba(255,255,255,0.1)",
                    background: tshirtStyle === "croptop" ? "#f472b6" : "#18181b",
                    color: tshirtStyle === "croptop" ? "#09090b" : "#a1a1aa",
                    transition: "all 0.3s ease"
                  }}
                >
                  Crop Top
                </button>
              </div>
            </div>
          )}

          {isPhoneCase && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", backgroundColor: "#18181b", padding: "5px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                onClick={() => setActiveTab("edit")}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: activeTab === "edit" ? "#f472b6" : "transparent",
                  color: activeTab === "edit" ? "#09090b" : "#a1a1aa",
                  transition: "all 0.2s"
                }}
              >
                Upload Foto
              </button>
              <button
                onClick={() => setActiveTab("template")}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: activeTab === "template" ? "#f472b6" : "transparent",
                  color: activeTab === "template" ? "#09090b" : "#a1a1aa",
                  transition: "all 0.2s"
                }}
              >
                Template
              </button>
            </div>
          )}

          {(!isPhoneCase || activeTab === "edit") && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase" }}>
                  Upload Foto Kamu
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ width: "100%", fontSize: "11px", color: "#a1a1aa" }}
                  />
                  {uploadedImage && (
                    <button
                      onClick={handleRemoveUploadedImage}
                      style={{
                        backgroundColor: "#27272a",
                        color: "#f472b6",
                        border: "1px solid rgba(244,114,182,0.3)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "900",
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                      title="Hapus foto yang di-upload"
                    >
                      ✕ Hapus Foto
                    </button>
                  )}
                </div>
                {fileName && (
                  <p style={{ fontSize: "10px", color: "#f472b6", fontWeight: "bold" }}>
                    Foto terpilih: {fileName}
                  </p>
                )}

                {uploadedImage && (
                  <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                    <button
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "10px",
                        fontSize: "9px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        backgroundColor: "#f472b6",
                        color: "#09090b",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      {isRemovingBg ? "Proses..." : "Hapus Background"}
                    </button>
                    <button
                      onClick={handleResetBackground}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        fontSize: "9px",
                        fontWeight: "bold",
                        backgroundColor: "#27272a",
                        color: "#a1a1aa",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Reset Background
                    </button>
                  </div>
                )}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "4px 0" }} />

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "8px" }}>
                  Tambah Icons & Elements (Klik untuk pasang)
                </label>
                <div style={{ maxHeight: "150px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {Array.from({ length: 21 }, (_, i) => i + 1).map((num) => {
                    const imageName = `elm${num}.png`;
                    return (
                      <div 
                        key={num}
                        onClick={() => handleAddElementToCase(imageName)}
                        style={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <img src={`/${imageName}`} alt={`icon ${num}`} style={{ width: "35px", height: "35px", objectFit: "contain" }} />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {isPhoneCase && activeTab === "template" && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
                  Pilih Template (1 - 4)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedTemplate(num)}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        fontSize: "10px",
                        fontWeight: "900",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        border: selectedTemplate === num ? "1px solid #f472b6" : "1px solid rgba(255,255,255,0.1)",
                        background: selectedTemplate === num ? "linear-gradient(to right, #f4f4f5, #f472b6)" : "#18181b",
                        color: selectedTemplate === num ? "#09090b" : "#a1a1aa"
                      }}
                    >
                      Template {num}
                    </button>
                  ))}
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "4px 0" }} />

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "8px" }}>
                  Tambah Icons ke Template (Klik untuk pasang)
                </label>
                <div style={{ maxHeight: "150px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {Array.from({ length: 21 }, (_, i) => i + 1).map((num) => {
                    const imageName = `elm${num}.png`;
                    return (
                      <div 
                        key={num}
                        onClick={() => handleAddElementToCase(imageName)}
                        style={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <img src={`/${imageName}`} alt={`icon ${num}`} style={{ width: "35px", height: "35px", objectFit: "contain" }} />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
              Catatan / Ukuran & Detail
            </label>
            <input 
              type="text" 
              placeholder={isPhoneCase ? "Contoh: iPhone 13 / Samsung S22" : "Contoh: Size L / Warna Hitam"}
              value={phoneModel}
              onChange={(e) => setPhoneModel(e.target.value)}
              style={{ width: "100%", backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px", fontSize: "11px", color: "#f4f4f5", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button 
            onClick={handleWhatsAppOrder}
            style={{ width: "100%", background: "linear-gradient(to right, #f4f4f5, #f472b6, #f4f4f5)", color: "#09090b", fontWeight: "900", padding: "14px", borderRadius: "14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(244,114,182,0.3)" }}
          >
            Pesan via WhatsApp Sekarang
          </button>

        </div>

      </div>
    </div>
  );
}

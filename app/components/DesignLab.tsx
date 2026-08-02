"use client";
import { useState, useRef } from "react";
import { removeBackground } from "@imgly/background-removal";

export default function DesignLab() {
  const [activeTab, setActiveTab] = useState<"edit" | "template">("edit");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [phoneModel, setPhoneModel] = useState("");
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const [subUploadTab, setSubUploadTab] = useState<"photo" | "icons">("photo");
  const [placedElements, setPlacedElements] = useState<Array<{ id: number; src: string; x: number; y: number; scale: number; rotation: number; flipX: boolean; flipY: boolean }>>([]);
  const [activeElementId, setActiveElementId] = useState<number | null>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const activeDraggingElementId = useRef<number | null>(null);
  const elementDragStart = useRef({ x: 0, y: 0 });

  const isRotating = useRef(false);
  const rotationCenter = useRef({ x: 0, y: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setOriginalImage(url);
      setFileName(file.name);
      setScale(1);
      setPosition({ x: 0, y: 0 });
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
  };

  const handleRemoveElement = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setPlacedElements((prev) => prev.filter((el) => el.id !== id));
    if (activeElementId === id) {
      setActiveElementId(null);
    }
  };

  const handleDuplicateElement = (el: { id: number; src: string; x: number; y: number; scale: number; rotation: number; flipX: boolean; flipY: boolean }, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const duplicated = {
      ...el,
      id: Date.now(),
      x: el.x + 15,
      y: el.y + 15,
    };
    setPlacedElements((prev) => [...prev, duplicated]);
    setActiveElementId(duplicated.id);
  };

  const handleFlipElement = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setPlacedElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, flipX: !el.flipX } : el))
    );
  };

  const handleRotateStart = (el: { id: number; x: number; y: number; rotation: number }, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isRotating.current = true;
    activeDraggingElementId.current = el.id;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    rotationCenter.current = {
      x: el.x + 25,
      y: el.y + 25
    };
  };

  const handleAddElementToCase = (imageName: string) => {
    const newElement = {
      id: Date.now(),
      src: `/${imageName}`,
      x: 55,
      y: 55,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
    };
    setPlacedElements((prev) => [...prev, newElement]);
    setActiveElementId(newElement.id);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (isDragging.current) {
      setPosition({
        x: clientX - dragStart.current.x,
        y: clientY - dragStart.current.y,
      });
    } else if (isRotating.current && activeDraggingElementId.current !== null) {
      const id = activeDraggingElementId.current;
      const dx = clientX - rotationCenter.current.x;
      const dy = clientY - rotationCenter.current.y;
      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI);
      
      setPlacedElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, rotation: Math.round(degrees) } : el))
      );
    } else if (activeDraggingElementId.current !== null) {
      const id = activeDraggingElementId.current;
      setPlacedElements((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              x: clientX - elementDragStart.current.x,
              y: clientY - elementDragStart.current.y,
            };
          }
          return el;
        })
      );
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    isRotating.current = false;
    activeDraggingElementId.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    if (activeElementId !== null) {
      setPlacedElements((prev) =>
        prev.map((el) => {
          if (el.id === activeElementId) {
            return { ...el, scale: Math.min(Math.max(0.3, el.scale + zoomFactor), 3.0) };
          }
          return el;
        })
      );
    } else {
      setScale((prev) => Math.min(Math.max(0.5, prev + zoomFactor), 3.5));
    }
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "62881025376311";
    const message = `Halo, saya ingin memesan Custom Phone Case.%0A- Mode: ${activeTab === "edit" ? "Custom Foto & Icons" : `Template ${selectedTemplate}`}%0A- Tipe HP: ${phoneModel || "Tidak diisi"}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div style={{ width: "100%", maxWidth: "850px", margin: "0 auto", padding: "20px 10px", color: "#f4f4f5", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "900", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "1px", margin: 0 }}>
          Customize <span style={{ background: "linear-gradient(to right, #f4f4f5, #f472b6, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Case</span>
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        
        <div style={{ width: "280px", backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", boxSizing: "border-box" }}>
          <span style={{ position: "absolute", top: "12px", left: "16px", fontSize: "9px", fontWeight: "bold", letterSpacing: "1px", color: "#71717a", textTransform: "uppercase" }}>
            {activeTab === "edit" ? "Live Editor" : `Template ${selectedTemplate}`}
          </span>
          
          <div 
            style={{ width: "170px", height: "340px", backgroundColor: "#09090b", borderRadius: "24px", border: "2px solid rgba(255,255,255,0.15)", position: "relative", margin: "20px 0 10px 0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
            onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={(e) => { if (e.touches[0]) handleDragMove(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={handleDragEnd}
            onTouchCancel={handleDragEnd}
            onWheel={handleWheel}
          >
            
            {activeTab === "edit" ? (
              <>
                {uploadedImage ? (
                  <div 
                    style={{ position: "absolute", inset: 0, zIndex: 20, overflow: "hidden", cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#18181b", touchAction: "none" }}
                    onMouseDown={(e) => { setActiveElementId(null); handleDragStart(e.clientX, e.clientY); }}
                    onTouchStart={(e) => { if (e.touches[0]) { setActiveElementId(null); handleDragStart(e.touches[0].clientX, e.touches[0].clientY); } }}
                  >
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded Custom" 
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        pointerEvents: "none",
                        userSelect: "none"
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveUploadedImage(); }}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.3)",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 40,
                        outline: "none"
                      }}
                      title="Hapus foto"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center", pointerEvents: "none" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", lineHeight: "1.5" }}>
                      Masukkan foto dan design
                    </span>
                  </div>
                )}

                {placedElements.map((el) => {
                  const isActive = activeElementId === el.id;
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setActiveElementId(el.id);
                        activeDraggingElementId.current = el.id;
                        elementDragStart.current = { x: e.clientX - el.x, y: e.clientY - el.y };
                      }}
                      onTouchStart={(e) => {
                        if (e.touches[0]) {
                          e.stopPropagation();
                          setActiveElementId(el.id);
                          activeDraggingElementId.current = el.id;
                          elementDragStart.current = { x: e.touches[0].clientX - el.x, y: e.touches[0].clientY - el.y };
                        }
                      }}
                      style={{
                        position: "absolute",
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
                        zIndex: 25,
                        cursor: "grab",
                        padding: "6px",
                        border: isActive ? "1px dashed #f472b6" : "none"
                      }}
                    >
                      <img 
                        src={el.src} 
                        alt="element icon" 
                        style={{ 
                          width: "50px", 
                          height: "50px", 
                          objectFit: "contain", 
                          pointerEvents: "none",
                          transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`
                        }} 
                      />

                      {isActive && (
                        <div style={{ position: "absolute", top: "-32px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "4px", backgroundColor: "#18181b", padding: "3px 6px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", zIndex: 40, whiteSpace: "nowrap" }}>
                          <div
                            onMouseDown={(e) => handleRotateStart(el, e)}
                            onTouchStart={(e) => handleRotateStart(el, e)}
                            style={{ background: "#3f3d56", color: "#fff", borderRadius: "4px", fontSize: "9px", cursor: "ew-resize", padding: "2px 5px", fontWeight: "bold", userSelect: "none" }}
                            title="Tekan dan geser untuk memutar"
                          >
                            🔄 Putar
                          </div>
                          <button
                            onClick={(e) => handleFlipElement(el.id, e)}
                            style={{ background: "transparent", color: "#fff", border: "none", fontSize: "10px", cursor: "pointer", padding: "2px 4px", fontWeight: "bold" }}
                            title="Balik Arah"
                          >
                            🔁
                          </button>
                          <button
                            onClick={(e) => handleDuplicateElement(el, e)}
                            style={{ background: "transparent", color: "#fff", border: "none", fontSize: "10px", cursor: "pointer", padding: "2px 4px", fontWeight: "bold" }}
                            title="Duplikat"
                          >
                            📋
                          </button>
                          <button
                            onClick={(e) => handleRemoveElement(el.id, e)}
                            style={{ background: "#f472b6", color: "#09090b", border: "none", width: "16px", height: "16px", borderRadius: "50%", fontSize: "10px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="Hapus"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <img 
                  src="/mockup-case-transparent.png" 
                  alt="Mockup Frame" 
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 30, pointerEvents: "none" }}
                />
              </>
            ) : (
              <img 
                src={`/template-${selectedTemplate}.png`} 
                alt={`Template ${selectedTemplate}`} 
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 20 }}
              />
            )}

          </div>
          
          <span style={{ fontSize: "10px", fontWeight: "900", color: "#f472b6", textTransform: "uppercase", letterSpacing: "1px", marginTop: "10px" }}>
            {activeTab === "edit" ? "Live Editor" : `Template ${selectedTemplate}`}
          </span>
        </div>

        <div style={{ flex: "1", minWidth: "280px", display: "flex", flexDirection: "column", gap: "14px" }}>
          
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

          {activeTab === "edit" && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", backgroundColor: "#18181b", padding: "4px", borderRadius: "10px" }}>
                <button
                  onClick={() => setSubUploadTab("photo")}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "9px",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: subUploadTab === "photo" ? "#3f3d56" : "transparent",
                    color: "#fff"
                  }}
                >
                  Foto Utama
                </button>
                <button
                  onClick={() => setSubUploadTab("icons")}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "9px",
                    fontWeight: "bold",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: subUploadTab === "icons" ? "#3f3d56" : "transparent",
                    color: "#fff"
                  }}
                >
                  Icons & Elements
                </button>
              </div>

              {subUploadTab === "photo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase" }}>
                    Upload Foto Kamu
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ width: "100%", fontSize: "11px", color: "#a1a1aa" }}
                  />
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
              )}

              {subUploadTab === "icons" && (
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "8px" }}>
                    Pilih Icons (Klik untuk tambah ke case)
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {Array.from({ length: 21 }, (_, i) => i + 1).map((num) => {
                      const imageName = `elm${num}.png`;
                      return (
                        <div 
                          key={num}
                          onClick={() => handleAddElementToCase(imageName)}
                          style={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <img src={`/${imageName}`} alt={`icon ${num}`} style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === "template" && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
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
          )}

          <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
            <label style={{ display: "block", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
              Catatan / Tipe HP
            </label>
            <input 
              type="text" 
              placeholder="Contoh: iPhone 13 / Samsung S22"
              value={phoneModel}
              onChange={(e) => setPhoneModel(e.target.value)}
              style={{ width: "100%", backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px", fontSize: "11px", color: "#f4f4f5", outline: "none", boxSizing: "border-box" }}
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

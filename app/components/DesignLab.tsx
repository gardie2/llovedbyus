"use client";

import { useState } from "react";

export default function DesignLab() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [phoneModel, setPhoneModel] = useState("");
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Support Touch untuk HP / iPad
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "62881025376311";
    const message = `Halo, saya ingin memesan Custom Phone Case.%0A- Template Pilihan: ${selectedTemplate}%0A- Tipe HP: ${phoneModel || "Tidak diisi"}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div style={{ width: "100%", maxWidth: "850px", margin: "0 auto", padding: "20px 10px", color: "#f4f4f5", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "900", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "1px", margin: 0 }}>
          Customize <span style={{ background: "linear-gradient(to right, #f4f4f5, #f472b6, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Case</span>
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        
        {/* SISI KIRI: PREVIEW HP */}
        <div style={{ width: "280px", backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", boxSizing: "border-box" }}>
          <span style={{ position: "absolute", top: "12px", left: "16px", fontSize: "9px", fontWeight: "bold", letterSpacing: "1px", color: "#71717a", textTransform: "uppercase" }}>
            Live Editor & Template {selectedTemplate}
          </span>
          
          <div style={{ width: "170px", height: "340px", backgroundColor: "#09090b", borderRadius: "24px", border: "2px solid rgba(255,255,255,0.15)", position: "relative", margin: "20px 0 10px 0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            
            {/* 1. LAYER BAWAH (z-10): Background Template Pilihan */}
            <img 
              key={selectedTemplate}
              src={`/template-${selectedTemplate}.png`} 
              alt="Template Background" 
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 10, pointerEvents: "none" }}
            />

            {/* 2. LAYER TENGAH (z-20): Foto Customer yang bisa di-zoom/geser kapan saja */}
            {uploadedImage ? (
              <div 
                style={{ position: "absolute", inset: 0, zIndex: 20, overflow: "hidden", cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#18181b" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  src={uploadedImage} 
                  alt="Uploaded Custom" 
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    userSelect: "none"
                  }}
                />
              </div>
            ) : (
              <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <img 
                  src="/hero-collage.png" 
                  alt="Hero Collage Default" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                />
              </div>
            )}

            {/* 3. LAYER ATAS (z-30): Mockup Frame Transparan */}
            <img 
              src="/mockup-case-transparent.png" 
              alt="Mockup Frame" 
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 30, pointerEvents: "none" }}
            />

          </div>

          {/* KONTROL ZOOM SELALU MUNCUL JIKA SUDAH UPLOAD FOTO */}
          {uploadedImage && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 10px", borderRadius: "10px", marginTop: "4px", width: "170px", boxSizing: "border-box" }}>
              <span style={{ fontSize: "9px", fontWeight: "bold", color: "#a1a1aa", textTransform: "uppercase" }}>Zoom Foto:</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button 
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                  style={{ backgroundColor: "#27272a", color: "#f4f4f5", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "900", border: "none", cursor: "pointer" }}
                >
                  -
                </button>
                <button 
                  onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
                  style={{ backgroundColor: "#27272a", color: "#f4f4f5", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "900", border: "none", cursor: "pointer" }}
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          <span style={{ fontSize: "10px", fontWeight: "900", color: "#f472b6", textTransform: "uppercase", letterSpacing: "1px", marginTop: "10px" }}>
            ✨ Geser & Zoom Kapan Saja
          </span>
        </div>

        {/* SISI KANAN: KONTROL PANEL (UPLOAD, TEMPLATE, & TIPE HP SEKALIGUS) */}
        <div style={{ flex: "1", minWidth: "280px", display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* UPLOAD FOTO */}
          <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px" }}>🖼️</span>
              1. Upload Foto Kamu
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              style={{ width: "100%", fontSize: "11px", color: "#a1a1aa" }}
            />
          </div>

          {/* PILIH TEMPLATE */}
          <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px" }}>✨</span>
              2. Pilih Template (1 - 4)
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

          {/* TIPE HP */}
          <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px" }}>📱</span>
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

          {/* TOMBOL PESAN */}
          <button 
            onClick={handleWhatsAppOrder}
            style={{ width: "100%", background: "linear-gradient(to right, #f4f4f5, #f472b6, #f4f4f5)", color: "#09090b", fontWeight: "900", padding: "14px", borderRadius: "14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(244,114,182,0.3)" }}
          >
            🚀 Pesan via WhatsApp Sekarang
          </button>

        </div>

      </div>
    </div>
  );
}

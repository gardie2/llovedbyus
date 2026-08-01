"use client";

import { useState } from "react";

export default function DesignLab() {
  const [activeTab, setActiveTab] = useState<"edit" | "template">("edit");
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
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

  // MOUSE & TOUCH EVENT UNTUK GESER FOTO PAKAI JARI
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "62881025376311";
    const message = `Halo, saya ingin memesan Custom Phone Case.%0A- Mode: ${activeTab === "edit" ? "Custom Posisi Foto" : `Template ${selectedTemplate}`}%0A- Tipe HP: ${phoneModel || "Tidak diisi"}`;
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
            {activeTab === "edit" ? "Live Editor" : `Template ${selectedTemplate}`}
          </span>
          
          <div style={{ width: "170px", height: "340px", backgroundColor: "#09090b", borderRadius: "24px", border: "2px solid rgba(255,255,255,0.15)", position: "relative", margin: "20px 0 10px 0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            
            {activeTab === "edit" ? (
              <>
                {/* 1. LAYER BAWAH (z-10): Background Template */}
                <img 
                  key={selectedTemplate}
                  src={`/template-${selectedTemplate}.png`} 
                  alt="Template Background" 
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 10, pointerEvents: "none" }}
                />

                {/* 2. LAYER TENGAH (z-20): Foto Customer yang bisa digeser & diedit kapan saja */}
                {uploadedImage ? (
                  <div 
                    style={{ position: "absolute", inset: 0, zIndex: 20, overflow: "hidden", cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#18181b", touchAction: "none" }}
                    onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                    onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={(e) => {
                      if (e.touches.length === 1) handleStart(e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    onTouchMove={(e) => {
                      if (e.touches.length === 1) handleMove(e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    onTouchEnd={handleEnd}
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
              </>
            ) : (
              <img 
                key={selectedTemplate}
                src={`/template-${selectedTemplate}.png`} 
                alt={`Template ${selectedTemplate}`} 
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 20 }}
              />
            )}

          </div>
          
          <span style={{ fontSize: "10px", fontWeight: "900", color: "#f472b6", textTransform: "uppercase", letterSpacing: "1px", marginTop: "10px" }}>
            {activeTab === "edit" ? "✨ Geser Foto Langsung" : `✨ Template ${selectedTemplate}`}
          </span>
        </div>

        {/* SISI KANAN: KONTROL PANEL */}
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
              1. Upload & Atur Foto 🖼️
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
              2. Pilih Template ✨
            </button>
          </div>

          {activeTab === "edit" && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px" }}>🎀</span>
                Upload Foto Kamu
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                style={{ width: "100%", fontSize: "11px", color: "#a1a1aa" }}
              />
            </div>
          )}

          {activeTab === "template" && (
            <div style={{ backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px" }}>🎀</span>
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
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", letterSpacing: "1px", color: "#d4d4d8", textTransform: "uppercase", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px" }}>🎀</span>
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
            🚀 Pesan via WhatsApp Sekarang
          </button>

        </div>

      </div>
    </div>
  );
}

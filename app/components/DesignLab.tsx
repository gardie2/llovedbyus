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
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isInteracting = useRef(false);
  const lastClientPos = useRef({ x: 0, y: 0 });
  const initialPinchDistance = useRef(0);
  const initialScale = useRef(1);

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

  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleStart = (clientX: number, clientY: number, e?: React.TouchEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    isInteracting.current = true;
    lastClientPos.current = { x: clientX, y: clientY };

    if (e && 'touches' in e && e.touches.length === 2) {
      initialPinchDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
      initialScale.current = scale;
    }
  };

  const handleMove = (clientX: number, clientY: number, e?: React.TouchEvent | React.MouseEvent) => {
    if (!isInteracting.current) return;
    if (e) e.preventDefault();

    if (e && 'touches' in e && e.touches.length === 2) {
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      if (initialPinchDistance.current > 0) {
        const factor = dist / initialPinchDistance.current;
        const newScale = Math.min(Math.max(0.5, initialScale.current * factor), 3.5);
        setScale(newScale);
      }
      return;
    }

    const dx = clientX - lastClientPos.current.x;
    const dy = clientY - lastClientPos.current.y;

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    lastClientPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isInteracting.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => Math.min(Math.max(0.5, prev + zoomFactor), 3.5));
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "62881025376311";
    const message = `Halo, saya ingin memesan Custom Phone Case.%0A- Mode: ${activeTab === "edit" ? "Custom Foto" : `Template ${selectedTemplate}`}%0A- Tipe HP: ${phoneModel || "Tidak diisi"}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "850px", margin: "0 auto", padding: "20px 10px", color: "#f4f4f5", fontFamily: "sans-serif", boxSizing: "border-box", overflow: "hidden" }}>
      
      {/* Background Web Melayang: Agak Buram, Tidak Berwarna (Grayscale), dan Transparan */}
      <div style={{
        position: "absolute",
        inset: "-50px",
        backgroundImage: "url('/background-web.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(25px) grayscale(100%) brightness(0.4)",
        opacity: 0.25,
        zIndex: -1,
        pointerEvents: "none"
      }} />

      <div style={{ textAlign: "center", marginBottom: "25px", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "26px", fontWeight: "900", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "1px", margin: 0 }}>
          Customize <span style={{ background: "linear-gradient(to right, #f4f4f5, #f472b6, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Case</span>
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        
        <div style={{ width: "280px", backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", boxSizing: "border-box" }}>
          <span style={{ position: "absolute", top: "12px", left: "16px", fontSize: "9px", fontWeight: "bold", letterSpacing: "1px", color: "#71717a", textTransform: "uppercase" }}>
            {activeTab === "edit" ? "Live Editor" : `Template ${selectedTemplate}`}
          </span>
          
          <div 
            style={{ width: "170px", height: "340px", backgroundColor: "#09090b", borderRadius: "24px", border: "2px solid rgba(255,255,255,0.15)", position: "relative", margin: "20px 0 10px 0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", touchAction: "none" }}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY, e)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={(e) => { if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY, e); }}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
            onWheel={handleWheel}
          >
            
            {activeTab === "edit" ? (
              <>
                {uploadedImage ? (
                  <div 
                    style={{ position: "absolute", inset: 0, zIndex: 20, overflow: "hidden", cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#18181b", touchAction: "none" }}
                    onMouseDown={(e) => handleStart(e.clientX, e.clientY, e)}
                    onTouchStart={(e) => { if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY, e); }}
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
                      Masukkan foto kamu
                    </span>
                  </div>
                )}

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

"use client";
import { useState, useRef, useEffect, useMemo } from "react";
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

  useEffect(() => {
    const handleGlobalMove = (clientX: number, clientY: number) => {
      if (!isInteracting.current) return;

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
      } else if (isDraggingPhoto.current) {
        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        lastClientPos.current = { x: clientX, y: clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => handleGlobalMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleGlobalMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onEnd = () => {
      isInteracting.current = false;
      activeDraggingElementId.current = null;
      isDraggingPhoto.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

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
      x: 70,
      y: 100,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
    };
    setPlacedElements((prev) => [...prev, newElement]);
    setActiveSelection(newElement.id);
  };

  const handleStartDragPhoto = (clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActiveSelection("photo");
    isInteracting.current = true;
    isDraggingPhoto.current = true;
    activeDraggingElementId.current = null;
    lastClientPos.current = { x: clientX, y: clientY };
  };

  const handleStartDragElement = (id: number, clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActiveSelection(id);
    isInteracting.current = true;
    isDraggingPhoto.current = false;
    activeDraggingElementId.current = id;
    lastClientPos.current = { x: clientX, y: clientY };
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

            {/* LAYER 2: MASKING CUTTING (Area ini memaksa semua isi didalamnya terpotong sesuai bentuk shape masking SVG atau CSS Clip Path) */}
            <div 
              style={{
                position: "absolute",
                top: isPhoneCase ? "36px" : "85px",
                left: isPhoneCase ? "52px" : "55px",
                width: isPhoneCase ? "152px" : "146px",
                height: isPhoneCase ? "328px" : "235px",
                zIndex: 15,
                // MENGGUNAKAN LEKUKAN CSS CLIP-PATH UNTUK CUTTING YANG RAPI (Sesuaikan radius % untuk melengkung)
                clipPath: isPhoneCase ? "inset(0px round 24px)" : "none", 
                overflow: "hidden",
                touchAction: "none"
              }}
              onWheel={handleWheel}
              onClick={() => {
                setActiveSelection(null);
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
                      onMouseDown={(e) => handleStartDragPhoto(e.clientX, e.clientY, e)}
                      onTouchStart={(e) => { if (e.touches[0]) handleStartDragPhoto(e.touches[0].clientX, e.touches[0].clientY, e); }}
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
                  onClick={(e) => { e.stopPropagation(); setActiveSelection(null); }}
                >
                  <img 
                    src={`/template-${selectedTemplate}.png`} 
                    alt={`Template ${selectedTemplate}`} 
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              )}

              {/* LAYER 3: IKON & ELEMEN DEKORASI (Elemen di sini akan ikut terpotong oleh clip-path parent-nya) */}
              {placedElements.map((el) => {
                const isActive = activeSelection === el.id;
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleStartDragElement(el.id, e.clientX, e.clientY, e)}
                    onTouchStart={(e) => {
                      if (e.touches[0]) handleStartDragElement(el.id, e.touches[0].clientX, e.touches[0].clientY, e);
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

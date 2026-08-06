"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { removeBackground } from "@imgly/background-removal";
import { toPng } from "html-to-image";

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
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [placedElements, setPlacedElements] = useState<Array<{ 
    id: number; 
    src: string; 
    x: number; 
    y: number; 
    scale: number; 
    rotation: number; 
    flipX: boolean; 
    flipY: boolean;
    slotImages?: { [key: number]: string }; 
    slotTransforms?: { [key: number]: { x: number; y: number; scale: number } };
  }>>([]);
  
  const [activeSelection, setActiveSelection] = useState<"photo" | number | null>("photo");

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  
  const isInteracting = useRef(false);
  const lastClientPos = useRef({ x: 0, y: 0 });
  
  const initialPinchDistance = useRef<number | null>(null);
  const initialScaleOnPinch = useRef(1);
  const initialTouchAngle = useRef<number | null>(null);
  const initialRotationOnTouch = useRef(0);
  
  const activeDraggingElementId = useRef<number | null>(null);
  const isDraggingPhoto = useRef(false);

  const activeSlotDrag = useRef<{ elementId: number; slotIndex: number } | null>(null);
  const slotLastPos = useRef({ x: 0, y: 0 });
  const mockupRef = useRef<HTMLDivElement>(null);
  const designAreaRef = useRef<HTMLDivElement>(null);

  const { mockupBase, mockupTp } = useMemo(() => {
    if (isPhoneCase) {
      return {
        mockupBase: "/mockups/mockup-case.png",
        mockupTp: "/mockups/mockup-case-transparent.png"
      };
    } else if (isTshirt) {
      if (tshirtStyle === "black") {
        return { mockupBase: "/mockups/blackshirtmu.png", mockupTp: "/mockups/blackshirtmu-tp.png" };
      } else if (tshirtStyle === "croptop") {
        return { mockupBase: "/mockups/croptopmu.png", mockupTp: "/mockups/croptopmu-tp.png" };
      }
      return { mockupBase: "/mockups/t-shirtmu.png", mockupTp: "/mockups/t-shirtmu-tp.png" };
    } else if (titleLower.includes("hoodie")) {
      return { mockupBase: "/mockups/hoodiemu.png", mockupTp: "/mockups/hoodiemu-tp.png" };
    } else if (titleLower.includes("sweatshirt")) {
      return { mockupBase: "/mockups/sweatshirtmu.png", mockupTp: "/mockups/sweatshirtmu-tp.png" };
    } else if (titleLower.includes("tote")) {
      return { mockupBase: "/mockups/totebagmu.png", mockupTp: "/mockups/totebagmu-tp.png" };
    }
    return { mockupBase: "/mockups/mockup-case.png", mockupTp: "/mockups/mockup-case-transparent.png" };
  }, [isPhoneCase, isTshirt, tshirtStyle, titleLower]);

  useEffect(() => {
    const handleGlobalMove = (clientX: number, clientY: number) => {
      if (!isInteracting.current) return;

      const dx = clientX - lastClientPos.current.x;
      const dy = clientY - lastClientPos.current.y;

      if (activeSlotDrag.current !== null) {
        const { elementId, slotIndex } = activeSlotDrag.current;
        const sDx = clientX - slotLastPos.current.x;
        const sDy = clientY - slotLastPos.current.y;

        setPlacedElements((prev) =>
          prev.map((el) => {
            if (el.id === elementId) {
              const currentT = el.slotTransforms?.[slotIndex] || { x: 0, y: 0, scale: 1 };
              return {
                ...el,
                slotTransforms: {
                  ...(el.slotTransforms || {}),
                  [slotIndex]: {
                    ...currentT,
                    x: currentT.x + sDx,
                    y: currentT.y + sDy,
                  },
                },
              };
            }
            return el;
          })
        );
        slotLastPos.current = { x: clientX, y: clientY };
      } else if (activeDraggingElementId.current !== null) {
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
      if (e.touches.length === 2) {
        const x1 = e.touches[0].clientX;
        const y1 = e.touches[0].clientY;
        const x2 = e.touches[1].clientX;
        const y2 = e.touches[1].clientY;

        const currentDist = Math.hypot(x1 - x2, y1 - y2);
        const currentAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        if (initialPinchDistance.current !== null && initialTouchAngle.current !== null) {
          const factor = currentDist / initialPinchDistance.current;
          const angleDelta = currentAngle - initialTouchAngle.current;

          if (activeSelection === "photo") {
            const newScale = Math.min(Math.max(0.3, initialScaleOnPinch.current * factor), 4.0);
            const newRot = initialRotationOnTouch.current + angleDelta;
            setScale(newScale);
            setRotation(newRot);
          } else if (typeof activeSelection === "number") {
            setPlacedElements((prev) =>
              prev.map((el) => {
                if (el.id === activeSelection) {
                  return {
                    ...el,
                    scale: Math.min(Math.max(0.3, initialScaleOnPinch.current * factor), 4.0),
                    rotation: initialRotationOnTouch.current + angleDelta,
                  };
                }
                return el;
              })
            );
          }
        }
        return;
      }

      if (e.touches[0]) handleGlobalMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onEnd = () => {
      isInteracting.current = false;
      activeDraggingElementId.current = null;
      isDraggingPhoto.current = false;
      activeSlotDrag.current = null;
      initialPinchDistance.current = null;
      initialTouchAngle.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [activeSelection]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setOriginalImage(url);
      setFileName(file.name);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
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
      src: `/elements/${imageName}`,
      x: 30,
      y: 30,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      slotImages: {},
      slotTransforms: {},
    };
    setPlacedElements((prev) => [...prev, newElement]);
    setActiveSelection(newElement.id);
  };

  const handleSlotImageUpload = (elementId: number, slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPlacedElements((prev) =>
        prev.map((el) => {
          if (el.id === elementId) {
            return {
              ...el,
              slotImages: {
                ...(el.slotImages || {}),
                [slotIndex]: url,
              },
              slotTransforms: {
                ...(el.slotTransforms || {}),
                [slotIndex]: { x: 0, y: 0, scale: 1 },
              },
            };
          }
          return el;
        })
      );
    }
  };

  const handleStartSlotDrag = (elementId: number, slotIndex: number, clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isInteracting.current = true;
    activeSlotDrag.current = { elementId, slotIndex };
    slotLastPos.current = { x: clientX, y: clientY };
  };

  const handleSlotWheel = (elementId: number, slotIndex: number, e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1;
    setPlacedElements((prev) =>
      prev.map((el) => {
        if (el.id === elementId) {
          const currentT = el.slotTransforms?.[slotIndex] || { x: 0, y: 0, scale: 1 };
          const newScale = Math.min(Math.max(0.3, currentT.scale + zoomFactor), 4.0);
          return {
            ...el,
            slotTransforms: {
              ...(el.slotTransforms || {}),
              [slotIndex]: { ...currentT, scale: newScale },
            },
          };
        }
        return el;
      })
    );
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

  const handleTouchStartContainer = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const x1 = e.touches[0].clientX;
      const y1 = e.touches[0].clientY;
      const x2 = e.touches[1].clientX;
      const y2 = e.touches[1].clientY;

      initialPinchDistance.current = Math.hypot(x1 - x2, y1 - y2);
      initialTouchAngle.current = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

      if (activeSelection === "photo") {
        initialScaleOnPinch.current = scale;
        initialRotationOnTouch.current = rotation;
      } else if (typeof activeSelection === "number") {
        const found = placedElements.find((el) => el.id === activeSelection);
        if (found) {
          initialScaleOnPinch.current = found.scale;
          initialRotationOnTouch.current = found.rotation;
        }
      }
    }
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

const handleDownloadDesign = async () => {
  if (!designAreaRef.current) return;

  try {
    setActiveSelection(null);
    setIsDownloading(true);

    const canvas = document.createElement("canvas");

    const EXPORT_WIDTH = isPhoneCase ? 174 : 146;
    const EXPORT_HEIGHT = isPhoneCase ? 346 : 235;
    const SCALE = 4;

    canvas.width = EXPORT_WIDTH * SCALE;
    canvas.height = EXPORT_HEIGHT * SCALE;

    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvas tidak tersedia");

function drawSlotImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frameX: number,
  frameY: number,
  frameW: number,
  frameH: number,
  transform: {
    x: number;
    y: number;
    scale: number;
  }
) {
  ctx.save();

  // clip area frame
  ctx.beginPath();
  if (frameW === 44 && frameH === 40) {
  ctx.ellipse(
    frameX + frameW / 2,
    frameY + frameH / 2,
    frameW / 2,
    frameH / 2,
    0,
    0,
    Math.PI * 2
  );
} else {
  ctx.rect(frameX, frameY, frameW, frameH);
}
  ctx.clip();

  // object-fit: cover
  const imgRatio = img.width / img.height;
  const frameRatio = frameW / frameH;

  let drawW: number;
  let drawH: number;

  if (imgRatio > frameRatio) {
    drawH = frameH;
    drawW = drawH * imgRatio;
  } else {
    drawW = frameW;
    drawH = drawW / imgRatio;
  }

  const centerX = frameX + frameW / 2;
  const centerY = frameY + frameH / 2;

  // sama seperti CSS transform-origin:center
  ctx.translate(centerX + transform.x, centerY + transform.y);
  ctx.scale(transform.scale, transform.scale);

  ctx.drawImage(
    img,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );

  ctx.restore();
}


    ctx.scale(SCALE, SCALE);

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    // Background transparan
    ctx.clearRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

    // =========================
    // FOTO UTAMA
    // =========================

    if (uploadedImage) {
      const img = await loadImage(uploadedImage);

      ctx.save();

      ctx.translate(
        EXPORT_WIDTH / 2 + position.x,
        EXPORT_HEIGHT / 2 + position.y
      );

      ctx.rotate((rotation * Math.PI) / 180);

      ctx.scale(scale, scale);

      const ratio = Math.max(
        EXPORT_WIDTH / img.width,
        EXPORT_HEIGHT / img.height
      );

      const drawWidth = img.width * ratio;
      const drawHeight = img.height * ratio;

      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();
    }

    // =========================
    // STICKER / FRAME
    // =========================

    for (const el of placedElements) {
      const img = await loadImage(el.src);

      const isElm24 = el.src.includes("elm24.png");
      const isElm25 = el.src.includes("elm25.png");
      const isElm32 = el.src.includes("elm32.png");

      const boxWidth = 100;
      const boxHeight = 100;
      console.log(el);
      ctx.save();

      ctx.translate(
        el.x + boxWidth / 2,
        el.y + boxHeight / 2
      );

      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.scale(
        el.scale * (el.flipX ? -1 : 1),
        el.scale * (el.flipY ? -1 : 1)
      );

      // ==========================
      // GAMBAR FOTO DI DALAM FRAME
      // ==========================

      if (isElm24) {
        for (const slotIdx of [1, 2, 3]) {
          const slotImg = el.slotImages?.[slotIdx];
          if (!slotImg) continue;

          const slotT = el.slotTransforms?.[slotIdx] || {
            x: 0,
            y: 0,
            scale: 1,
          };

          const sImg = await loadImage(slotImg);

          const frameX = -18;
const frameW = 36;
const frameH = 28;

const frameY =
  slotIdx === 1
    ? -48
    : slotIdx === 2
    ? -20
    : 8;

drawSlotImage(
  ctx,
  sImg,
  frameX,
  frameY,
  frameW,
  frameH,
  slotT
);
        }
      }

      if (isElm25) {
        const slotImg = el.slotImages?.[1];

        if (slotImg) {
          const slotT = el.slotTransforms?.[1] || {
            x: 0,
            y: 0,
            scale: 1,
          };

          const sImg = await loadImage(slotImg);

         drawSlotImage(
  ctx,
  sImg,
  -24,
  -45,
  48,
  42,
  slotT
);
        }
      }
if (isElm32) {
  const slotImg = el.slotImages?.[1];

  if (slotImg) {
    const slotT = el.slotTransforms?.[1] || {
      x: 0,
      y: 0,
      scale: 1,
    };

    const sImg = await loadImage(slotImg);

drawSlotImage(
  ctx,
  sImg,
  -23,
  -26,
  44,
  40,
  slotT
);
  }
}
      ctx.drawImage(
        img,
        -boxWidth / 2,
        -boxHeight / 2,
        boxWidth,
        boxHeight
      );

      ctx.restore();
    }

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Custom-Design-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan gambar desain.");
  } finally {
    setIsDownloading(false);
  }
};

  const handleWhatsAppOrder = () => {
    const phoneNumber = "62881025376311";
    const message = `Halo, saya ingin memesan Custom Phone Case. Berikut adalah desain saya:`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div style={{ width: "100%", maxWidth: "850px", margin: "0 auto", padding: "20px 10px", color: "#f4f4f5", fontFamily: "sans-serif", boxSizing: "border-box" }}>
      
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "900", textTransform: "uppercase", fontStyle: "italic", letterSpacing: "1px", margin: 0 }}>
          Design <span style={{ background: "linear-gradient(to right, #f4f4f5, #f472b6, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{productTitle} {isTshirt ? `(${tshirtStyle})` : ""}</span>
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        
        <div style={{ width: "280px", backgroundColor: "#121318", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)", boxSizing: "border-box" }}>
          
          <div 
            ref={mockupRef}
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
            
            {isPhoneCase && activeTab === "template" ? (
              <div 
                style={{ 
                  position: "absolute", 
                  inset: 0, 
                  width: "100%", 
                  height: "100%", 
                  zIndex: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img 
                  src={`/templates/template-${selectedTemplate}.png`}
                  alt={`Template ${selectedTemplate}`} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain",
                    borderRadius: "14px"
                  }} 
                />
              </div>
            ) : (
              <>
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
                    pointerEvents: "none" 
                  }}
                />

                <div 
                ref={designAreaRef}
                  style={{
                    position: "absolute",
                    top: isPhoneCase ? "27px" : "85px",
                    left: isPhoneCase ? "41px" : "55px",
                    width: isPhoneCase ? "174px" : "146px",
                    height: isPhoneCase ? "346px" : "235px",
                    zIndex: 15,
                    borderRadius: isPhoneCase ? "20px" : "6px",
                    overflow: "hidden",
                    touchAction: "none"
                  }}
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStartContainer}
                  onClick={() => {
                    setActiveSelection(null);
                  }}
                >
                  {uploadedImage && (
                    <div 
                      style={{ 
                        position: "absolute", 
                        inset: 0, 
                        cursor: "grab", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        touchAction: "none" 
                      }}
                      onMouseDown={(e) => handleStartDragPhoto(e.clientX, e.clientY, e)}
                      onTouchStart={(e) => { 
                        if (e.touches.length === 1 && e.touches[0]) {
                          handleStartDragPhoto(e.touches[0].clientX, e.touches[0].clientY, e);
                        }
                      }}
                    >
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded Custom" 
                        style={{
                          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                          userSelect: "none"
                        }}
                      />
                    </div>
                  )}

                  {placedElements.map((el) => {
                    const isActive = activeSelection === el.id;
                    const isElm24 = el.src.includes("elm24.png");
                    const isElm25 = el.src.includes("elm25.png");
                    const isElm32 = el.src.includes("elm32.png");

                    const boxWidth = "100px";
                    const boxHeight = "100px";

                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleStartDragElement(el.id, e.clientX, e.clientY, e)}
                        onTouchStart={(e) => {
                          if (e.touches.length === 1 && e.touches[0]) {
                            handleStartDragElement(el.id, e.touches[0].clientX, e.touches[0].clientY, e);
                          }
                        }}
                        style={{
                          position: "absolute",
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: boxWidth,
                          height: boxHeight,
                          transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
                          zIndex: 25,
                          cursor: "grab",
                          touchAction: "none"
                        }}
                      >
                        
                         {isElm24 && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 1,
      pointerEvents: "auto",
    }}
  >
    {(() => {
      const SLOT_STYLE = {
        1: {
          top: "2px",
          left: "32px",
          width: "36px",
          height: "28px",
        },
        2: {
          top: "29px",
          left: "32px",
          width: "36px",
          height: "28px",
        },
        3: {
          top: "57px",
          left: "32px",
          width: "36px",
          height: "28px",
        },
      };

      return [1, 2, 3].map((slotIdx) => {
        const slotImg = el.slotImages?.[slotIdx];
        const slotT = el.slotTransforms?.[slotIdx] || {
          x: 0,
          y: 0,
          scale: 1,
        };

        const style = SLOT_STYLE[slotIdx as 1 | 2 | 3];

        return (
          <div
            key={slotIdx}
            onWheel={(e) =>
              slotImg && handleSlotWheel(el.id, slotIdx, e)
            }
            onMouseDown={(e) =>
              slotImg &&
              handleStartSlotDrag(
                el.id,
                slotIdx,
                e.clientX,
                e.clientY,
                e
              )
            }
            onTouchStart={(e) => {
              if (
                slotImg &&
                e.touches.length === 1 &&
                e.touches[0]
              ) {
                handleStartSlotDrag(
                  el.id,
                  slotIdx,
                  e.touches[0].clientX,
                  e.touches[0].clientY,
                  e
                );
              }
            }}
            style={{
              position: "absolute",
              ...style,
              backgroundColor: "#18181b",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: slotImg ? "grab" : "default",
            }}
          >
            {slotImg ? (
              <img
                src={slotImg}
                alt={`slot ${slotIdx}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `translate(${slotT.x}px, ${slotT.y}px) scale(${slotT.scale})`,
                  pointerEvents: "none",
                }}
              />
            ) : (
              <label
                style={{
                  cursor: "pointer",
                  color: "#f472b6",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                +
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleSlotImageUpload(el.id, slotIdx, e)
                  }
                />
              </label>
            )}
          </div>
        );
      });
    })()}
  </div>

                        )}

                        {isElm25 && (
                          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "auto" }}>
                            {(() => {
                              const slotImg = el.slotImages?.[1];
                              const slotT = el.slotTransforms?.[1] || { x: 0, y: 0, scale: 1 };
                              return (
                                <div 
                                  onWheel={(e) => slotImg && handleSlotWheel(el.id, 1, e)}
                                  onMouseDown={(e) => slotImg && handleStartSlotDrag(el.id, 1, e.clientX, e.clientY, e)}
                                  onTouchStart={(e) => {
                                    if (slotImg && e.touches.length === 1 && e.touches[0]) {
                                      handleStartSlotDrag(el.id, 1, e.touches[0].clientX, e.touches[0].clientY, e);
                                    }
                                  }}
                                  style={{
position: "absolute",
top: "6px",
left: "26px",
width: "48px",
height: "42px",
backgroundColor: "#18181b",
overflow: "hidden",
display: "flex",
alignItems: "center",
justifyContent: "center",
cursor: slotImg ? "grab" : "default"
}}
                                >
                                  {slotImg ? (
                                    <img 
                                      src={slotImg} 
                                      alt="slot 1" 
                                      style={{ 
                                        width: "100%", 
                                        height: "100%", 
                                        objectFit: "cover",
                                        transform: `translate(${slotT.x}px, ${slotT.y}px) scale(${slotT.scale})`,
                                        pointerEvents: "none" 
                                      }} 
                                    />
                                  ) : (
                                    <label style={{ cursor: "pointer", color: "#f472b6", fontSize: "18px", fontWeight: "bold" }}>
                                      +
                                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleSlotImageUpload(el.id, 1, e)} />
                                    </label>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {isElm32 && (
  <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "auto" }}>
    {(() => {
      const slotImg = el.slotImages?.[1];
      const slotT = el.slotTransforms?.[1] || {
  x: 0,
  y: 0,
  scale: 1,
};

      return (
        <div
          onWheel={(e) => slotImg && handleSlotWheel(el.id, 1, e)}
          onMouseDown={(e) => slotImg && handleStartSlotDrag(el.id, 1, e.clientX, e.clientY, e)}
          onTouchStart={(e) => {
            if (slotImg && e.touches.length === 1 && e.touches[0]) {
              handleStartSlotDrag(el.id, 1, e.touches[0].clientX, e.touches[0].clientY, e);
            }
          }}
          style={{
  position: "absolute",
  top: "23px",
  left: "27px",
  width: "44px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#18181b",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: slotImg ? "grab" : "default",
          }}
        >
          {slotImg ? (
            <img
              src={slotImg}
              alt="slot 1"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `translate(${slotT.x}px, ${slotT.y}px) scale(${slotT.scale})`,
                pointerEvents: "none",
              }}
            />
          ) : (
            <label style={{ cursor: "pointer", color: "#f472b6", fontSize: "18px", fontWeight: "bold" }}>
              +
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleSlotImageUpload(el.id, 1, e)}
              />
            </label>
          )}
        </div>
      );
    })()}
  </div>
)}

                        <img 
                          src={el.src} 
                          alt="element frame" 
                          style={{ 
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%", 
                            height: "100%", 
                            objectFit: "contain", 
                            pointerEvents: "none",
                            transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`,
                            zIndex: 2
                          }} 
                        />

                        {isActive && (
                          <button
                            onClick={(e) => handleRemoveElement(el.id, e)}
                            className="remove-btn"
                            style={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              backgroundColor: "#f472b6",
                              color: "#09090b",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: "900",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 50,
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

                {mockupTp && (
                  <img 
                    src={mockupTp} 
                    alt="Mockup Overlay" 
                    style={{ 
                      position: "absolute", 
                      inset: 0, 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "contain", 
                      zIndex: 35, 
                      pointerEvents: "none" 
                    }}
                  />
                )}
              </>
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
                  Upload Foto Utama
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
                  TAMBAH STIKER & FRAME
                </label>
                <div style={{ maxHeight: "150px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {Array.from({ length: 55 }, (_, i) => i + 1).map((num) => {
                    const imageName = `elm${num}.png`;
                    return (
                      <div 
                        key={num}
                        onClick={() => handleAddElementToCase(imageName)}
                        style={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title={`Klik pasang ${imageName}`}
                      >
                        <span style={{ fontSize: "9px", color: "#f472b6", marginRight: "4px" }}>{num}</span>
                        <img src={`/elements/${imageName}`} alt={`icon ${num}`} style={{ width: "30px", height: "30px", objectFit: "contain" }} onError={(e)=>{(e.target as HTMLElement).style.display='none'}} />
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

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button 
              onClick={handleDownloadDesign}
              disabled={isDownloading}
              style={{ width: "100%", background: "#27272a", color: "#f4f4f5", fontWeight: "900", padding: "12px", borderRadius: "14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}
            >
              {isDownloading ? "Menyimpan Gambar..." : "Download Hasil Desain (PNG)"}
            </button>

            <button 
              onClick={handleWhatsAppOrder}
              style={{ width: "100%", background: "linear-gradient(to right, #f4f4f5, #f472b6, #f4f4f5)", color: "#09090b", fontWeight: "900", padding: "14px", borderRadius: "14px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(244,114,182,0.3)" }}
            >
              Pesan via WhatsApp Sekarang
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
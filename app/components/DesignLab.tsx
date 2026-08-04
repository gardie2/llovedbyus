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
      src: `/${imageName}`,
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

  const handleDownloadDesign = () => {
    if (!mockupRef.current) return;
    setActiveSelection(null);
    setIsDownloading(true);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsDownloading(false);
      alert("Canvas context tidak didukung");
      return;
    }

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
      });
    };

    loadImage(mockupBase)
      .then((baseImg) => {
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

        const drawUserImage = uploadedImage ? loadImage(uploadedImage) : Promise.resolve(null);
        return drawUserImage.catch(() => null).then((userImg) => {
          if (userImg) {
            ctx.save();
            const areaLeft = 512 * (41 / 256);
            const areaTop = 800 * (27 / 400);
            const areaWidth = 512 * (174 / 256);
            const areaHeight = 800 * (346 / 400);

            ctx.beginPath();
            ctx.rect(areaLeft, areaTop, areaWidth, areaHeight);
            ctx.clip();

            ctx.translate(areaLeft + areaWidth / 2 + position.x * (canvas.width / 256), areaTop + areaHeight / 2 + position.y * (canvas.height / 400));
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(scale, scale);
            ctx.drawImage(userImg, -areaWidth / 2, -areaHeight / 2, areaWidth, areaHeight);
            ctx.restore();
          }
          return userImg;
        });
      })
      .then(() => {
        const elementPromises = placedElements.map(async (el) => {
          const scaleX = canvas.width / 256;
          const scaleY = canvas.height / 400;
          
          const areaLeft = 512 * (41 / 256);
          const areaTop = 800 * (27 / 400);

          const renderX = areaLeft + (el.x * scaleX);
          const renderY = areaTop + (el.y * scaleY);

          const boxW = el.src.includes("elm24.png") ? 85 : el.src.includes("elm25.png") ? 110 : el.src.includes("elm32.png") ? 90 : 100;
          const boxH = el.src.includes("elm24.png") ? 210 : el.src.includes("elm25.png") ? 145 : el.src.includes("elm32.png") ? 125 : 100;

          if (el.slotImages) {
            for (const [slotIdxStr, slotImgUrl] of Object.entries(el.slotImages)) {
              const slotIdx = Number(slotIdxStr);
              try {
                const slotImg = await loadImage(slotImgUrl);
                const slotT = el.slotTransforms?.[slotIdx] || { x: 0, y: 0, scale: 1 };
                
                ctx.save();
                ctx.translate(renderX + (boxW * scaleX * el.scale) / 2, renderY + (boxH * scaleY * el.scale) / 2);
                ctx.rotate((el.rotation * Math.PI) / 180);
                ctx.scale(el.scale, el.scale);

                ctx.beginPath();
                if (el.src.includes("elm24.png")) {
                  const sH = (boxH * scaleY) / 3;
                  const sTop = (-boxH * scaleY / 2) + ((slotIdx - 1) * sH);
                  ctx.rect((-boxW * scaleX / 2) + (boxW * scaleX * 0.06), sTop + (sH * 0.03), boxW * scaleX * 0.88, sH * 0.94);
                } else if (el.src.includes("elm25.png")) {
                  ctx.rect((-boxW * scaleX / 2) + (boxW * scaleX * 0.14), (-boxH * scaleY / 2) + (boxH * scaleY * 0.02), boxW * scaleX * 0.72, boxH * scaleY * 0.46);
                } else if (el.src.includes("elm32.png")) {
                  ctx.arc(0, (-boxH * scaleY / 2) + ((boxH * scaleY) * 0.425), (boxW * scaleX) * 0.32, 0, Math.PI * 2);
                }
                ctx.clip();

                ctx.translate(slotT.x * scaleX, slotT.y * scaleY);
                ctx.scale(slotT.scale, slotT.scale);
                ctx.drawImage(slotImg, -(boxW * scaleX) / 2, -(boxH * scaleY) / 2, boxW * scaleX, boxH * scaleY);
                ctx.restore();
              } catch (e) {
                console.warn("Gagal memuat gambar slot:", e);
              }
            }
          }

          try {
            const elImg = await loadImage(el.src);
            ctx.save();
            ctx.translate(renderX + (boxW * scaleX * el.scale) / 2, renderY + (boxH * scaleY * el.scale) / 2);
            ctx.rotate((el.rotation * Math.PI) / 180);
            ctx.scale(el.scale, el.scale);
            if (el.flipX) ctx.scale(-1, 1);
            if (el.flipY) ctx.scale(1, -1);

            ctx.drawImage(elImg, -(boxW * scaleX) / 2, -(boxH * scaleY) / 2, boxW * scaleX, boxH * scaleY);
            ctx.restore();
          } catch (e) {
            console.warn("Gagal memuat elemen stiker:", e);
          }
        });

        return Promise.all(elementPromises);
      })
      .then(() => {
        const drawTp = mockupTp ? loadImage(mockupTp) : Promise.resolve(null);
        return drawTp.catch(() => null).then((tpImg) => {
          if (tpImg) {
            ctx.drawImage(tpImg, 0, 0, canvas.width, canvas.height);
          }
        });
      })
      .then(() => {
        canvas.toBlob((blob) => {
          if (!blob) {
            alert("Gagal merakit gambar.");
            setIsDownloading(false);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `Custom-Design-${Date.now()}.png`;

          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (isIOS) {
            window.open(blobUrl, "_blank");
          } else {
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          setIsDownloading(false);
        }, "image/png");
      })
      .catch((err) => {
        console.error("Gagal mendownload gambar:", err);
        alert("Gagal menyimpan gambar desain.");
        setIsDownloading(false);
      });
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
          Customize <span style={{ background: "linear-gradient(to right, #f4f4f5, #f472b6, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{productTitle} {isTshirt ? `(${tshirtStyle})` : ""}</span>
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
                  src={`/template-${selectedTemplate}.png`} 
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
                  style={{
                    position: "absolute",
                    top: isPhoneCase ? "27px" : "85px",
                    left: isPhoneCase ? "41px" : "55px",
                    width: isPhoneCase ? "174px" : "146px",
                    height: isPhoneCase ? "346px" : "235px",
                    zIndex: 15,
                    clipPath: isPhoneCase 
                      ? "path('M 15 0 L 158 0 C 166 0 174 8 174 16 L 174 330 C 174 338 166 346 158 346 L 15 346 C 7 346 0 338 0 330 L 0 16 C 0 8 7 0 15 0 Z')" 
                      : "inset(0px round 6px)",
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

                    const boxWidth = isElm24 ? "85px" : isElm25 ? "110px" : isElm32 ? "90px" : "100px";
                    const boxHeight = isElm24 ? "210px" : isElm25 ? "145px" : isElm32 ? "125px" : "100px";

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
                          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "auto" }}>
                            {[1, 2, 3].map((slotIdx) => {
                              const topPos = slotIdx === 1 ? "1%" : slotIdx === 2 ? "29.5%" : "58%";
                              const slotImg = el.slotImages?.[slotIdx];
                              const slotT = el.slotTransforms?.[slotIdx] || { x: 0, y: 0, scale: 1 };

                              return (
                                <div 
                                  key={slotIdx}
                                  onWheel={(e) => slotImg && handleSlotWheel(el.id, slotIdx, e)}
                                  onMouseDown={(e) => slotImg && handleStartSlotDrag(el.id, slotIdx, e.clientX, e.clientY, e)}
                                  onTouchStart={(e) => {
                                    if (slotImg && e.touches.length === 1 && e.touches[0]) {
                                      handleStartSlotDrag(el.id, slotIdx, e.touches[0].clientX, e.touches[0].clientY, e);
                                    }
                                  }}
                                  style={{ position: "absolute", top: topPos, left: "6%", right: "6%", height: "29.5%", backgroundColor: "#18181b", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: slotImg ? "grab" : "default" }}
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
                                        pointerEvents: "none" 
                                      }} 
                                    />
                                  ) : (
                                    <label style={{ cursor: "pointer", color: "#f472b6", fontSize: "16px", fontWeight: "bold" }}>
                                      +
                                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleSlotImageUpload(el.id, slotIdx, e)} />
                                    </label>
                                  )}
                                </div>
                              );
                            })}
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
                                  style={{ position: "absolute", top: "2%", left: "14%", right: "14%", height: "46%", backgroundColor: "#18181b", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: slotImg ? "grab" : "default" }}
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
                                  style={{ position: "absolute", top: "20%", left: "18%", right: "18%", height: "45%", backgroundColor: "#18181b", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: slotImg ? "grab" : "default" }}
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
                  {Array.from({ length: 35 }, (_, i) => i + 1).map((num) => {
                    const imageName = `elm${num}.png`;
                    return (
                      <div 
                        key={num}
                        onClick={() => handleAddElementToCase(imageName)}
                        style={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", textAlign: "center", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title={`Klik pasang ${imageName}`}
                      >
                        <span style={{ fontSize: "9px", color: "#f472b6", marginRight: "4px" }}>{num}</span>
                        <img src={`/${imageName}`} alt={`icon ${num}`} style={{ width: "30px", height: "30px", objectFit: "contain" }} onError={(e)=>{(e.target as HTMLElement).style.display='none'}} />
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
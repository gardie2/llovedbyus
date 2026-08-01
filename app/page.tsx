"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import DesignLab from "./components/DesignLab";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

export default function Home() {
  const [activeProduct, setActiveProduct] = useState<{
    id: number;
    name: string;
    desc: string;
    image: string;
  } | null>(null);

  const [showDesignLab, setShowDesignLab] = useState(false);

  const productList = [
    { 
      id: 1, 
      name: "Custom Phone Case", 
      desc: "Protection case with custom photo support.", 
      image: "/case.png" 
    },
    { 
      id: 2, 
      name: "Custom Sweatshirt", 
      desc: "Heavyweight cotton fleece material.", 
      image: "/sweatshirt.png" 
    },
    { 
      id: 3, 
      name: "Custom Hoodie", 
      desc: "Cozy fleece hoodie with custom print.", 
      image: "/hoodie.PNG" 
    },
    { 
      id: 4, 
      name: "Custom T-Shirt", 
      desc: "Boxy fit premium cotton material.", 
      image: "/t-shirt.png" 
    },
    { 
      id: 5, 
      name: "Custom Tote Bag", 
      desc: "Sturdy canvas material with custom print.", 
      image: "/totebag.png" 
    },
  ];

  const handleProductClick = (item: typeof productList[0]) => {
    if (item.id === 1) {
      setShowDesignLab(true);
    } else {
      setActiveProduct(item);
    }
  };

  const heroReveal = useScrollReveal();
  const productsReveal = useScrollReveal();
  const socialsReveal = useScrollReveal();

  return (
    <main className="bg-[#090a0d] text-zinc-100 min-h-screen selection:bg-pink-500 selection:text-white font-sans relative overflow-hidden">
      
      {/* GLOBAL CSS: CHROME, MARQUEE GLITCH, RANDOM ICON POSITIONS */}
      <style jsx global>{`
        .chrome-text {
          font-weight: 900;
          text-transform: uppercase;
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #e2e8f0 35%,
            #94a3b8 50%,
            #cbd5e1 55%,
            #475569 80%,
            #f8fafc 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.9)) 
                  drop-shadow(0 0 15px rgba(255,255,255,0.4))
                  drop-shadow(0 5px 10px rgba(0,0,0,0.6));
          letter-spacing: -0.02em;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes glitch {
          2%, 64% { transform: translate(2px, 0) skew(0deg); }
          4%, 60% { transform: translate(-2px, 0) skew(0deg); }
          62% { transform: translate(0, 0) skew(5deg); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 16s linear infinite;
        }
        .animate-glitch {
          animation: glitch 1s infinite;
        }
        .animate-flicker {
          animation: flicker 2s infinite;
        }
        @keyframes flicker {
          0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 1; }
          20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.3; }
        }
        /* Helper classes for random positioning */
        .icon-spot-1 { top: 10%; left: 5%; }
        .icon-spot-2 { top: 15%; right: 8%; }
        .icon-spot-3 { bottom: 20%; left: 15%; }
        .icon-spot-4 { bottom: 25%; right: 12%; }
        .icon-spot-5 { top: 40%; left: 2%; }
        .icon-spot-6 { top: 55%; right: 5%; }
        .icon-spot-7 { bottom: 50%; left: 18%; }
        .icon-spot-8 { bottom: 45%; right: 15%; }
        .icon-spot-9 { top: 70%; left: 8%; }
        .icon-spot-10 { bottom: 5%; left: 50%; }
        .icon-spot-11 { top: 80%; right: 20%; }
      `}</style>

      {/* RANDOM ICONS MENGAMBANG (Diambil dari icon1-icon11, total 11 icon) */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-40">
        {[...Array(11)].map((_, i) => {
          const iconIndex = i + 1;
          const src = iconIndex === 11 ? `/icon${iconIndex}.jpg` : `/icon${iconIndex}.png`;
          return (
            <div key={i} className={`absolute w-10 h-10 object-contain animate-pulse icon-spot-${iconIndex} hidden md:block`}>
              <img src={src} alt={`decor${iconIndex}`} className="w-full h-full" />
            </div>
          );
        })}
      </div>

      {/* NAVBAR */}
      <nav className="bg-[#0d0e12]/90 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col group">
            <div className="flex items-center gap-1 font-black text-2xl tracking-tighter uppercase italic">
              <span className="chrome-text">LL</span>
              <span className="chrome-text text-pink-300">OVEDBYUS</span>
            </div>
            <span className="text-[8px] font-bold tracking-[0.3em] text-zinc-400 -mt-1 uppercase">
              STORE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-zinc-400">
            <a href="#products" className="hover:text-pink-300 transition">Products</a>
            <a href="#socials" className="hover:text-pink-300 transition">Official Links</a>
            <a href="#" className="hover:text-pink-300 transition">About</a>
          </div>

          <button 
            onClick={() => setShowDesignLab(true)}
            className="bg-gradient-to-r from-zinc-200 via-pink-200 to-zinc-300 hover:from-white hover:to-pink-100 text-zinc-950 font-black px-6 py-2 rounded-full text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(244,114,182,0.3)] transition-all active:scale-95 z-20"
          >
            Start
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section 
        ref={heroReveal.ref}
        className={`relative py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-20 transition-all duration-1000 transform ${
          heroReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="space-y-6 relative">
          <span className="inline-block text-[11px] font-extrabold tracking-[0.3em] bg-gradient-to-r from-pink-300 via-zinc-200 to-pink-400 bg-clip-text text-transparent uppercase border border-pink-500/20 px-3 py-1 rounded-full bg-pink-500/5 animate-pulse">
            ✦ LLOVEDBYUS STUDIO
          </span>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] chrome-text italic">
            Create <br />
            Something <br />
            <span className="text-pink-300">That's Yours.</span>
          </h1>

          <p className="text-zinc-400 text-sm md:text-base max-w-md font-medium leading-relaxed">
            Design custom phone cases, sweatshirts, hoodies, t-shirts, tote bags, and more products the way you want.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={() => setShowDesignLab(true)}
              className="bg-gradient-to-r from-zinc-100 via-pink-200 to-zinc-200 hover:from-white hover:to-pink-100 text-zinc-950 font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(244,114,182,0.3)] transition-all active:scale-95"
            >
              Start Designing
            </button>
            <a href="#products" className="border border-zinc-700/80 hover:border-pink-400/50 text-zinc-300 font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest bg-zinc-900/50 hover:bg-zinc-800 transition active:scale-95 text-center">
              Explore Products
            </a>
          </div>
        </div>

        {/* KOLASE PRODUK DENGAN ICON 1 & 10 TERPISAH (ATAS KANAN, BAWAH KIRI) */}
        <div className="flex justify-center md:justify-end relative">
          {/* Icon Atas Kanan */}
          <div className="absolute -top-4 -right-4 w-12 h-12 animate-bounce pointer-events-none z-30 hidden sm:block rotate-12">
            <img src="/icon1.png" alt="decor" className="w-full h-full object-contain" />
          </div>
          {/* Icon Bawah Kiri */}
          <div className="absolute -bottom-6 -left-6 w-14 h-14 animate-pulse pointer-events-none z-30 hidden sm:block -rotate-12">
            <img src="/icon10.png" alt="decor" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
          </div>
          <div className="relative w-[320px] h-[520px] bg-zinc-900/40 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden border border-zinc-800/80 flex items-center justify-center p-2 group hover:border-pink-500/40 transition duration-500">
            <img 
              src="/hero-collage.png" 
              alt="LLOVEDBYUS Product Collage" 
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE SLOGAN (TEXT GLITCH & FLICKER) */}
      <div className="py-6 bg-zinc-950 border-y border-zinc-800/80 overflow-hidden relative z-20 flex whitespace-nowrap shadow-xl">
        <div className="animate-marquee flex items-center gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`flex items-center gap-8 text-xl md:text-3xl italic chrome-text ${i % 2 === 0 ? 'animate-glitch' : ''} ${i % 3 === 0 ? 'animate-flicker' : ''}`}>
              <span>DESIGN YOUR OWN STUFF</span>
              <span className="text-pink-400">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS PREVIEW GRID */}
      <section 
        id="products" 
        ref={productsReveal.ref}
        className={`py-20 px-6 max-w-7xl mx-auto relative z-20 transition-all duration-1000 transform ${
          productsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.25em] bg-gradient-to-r from-zinc-300 via-pink-300 to-zinc-400 bg-clip-text text-transparent uppercase">
            PRODUCTS
          </span>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider mt-1 italic chrome-text">
            Explore Our Products
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {productList.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleProductClick(item)}
              className="group bg-[#121318] border border-zinc-800 rounded-3xl p-5 cursor-pointer hover:border-pink-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,114,182,0.15)] flex flex-col items-center transform hover:-translate-y-1"
            >
              <div className="w-full aspect-[4/5] bg-zinc-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-zinc

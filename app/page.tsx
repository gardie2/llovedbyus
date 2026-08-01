"use client";

import Link from "next/link";
import { useState } from "react";
import DesignLab from "./components/DesignLab";

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
      image: "/hoodie.JPG" 
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

  return (
    <main className="bg-[#090a0d] text-zinc-100 min-h-screen selection:bg-pink-500 selection:text-white font-sans relative">
      
      {/* NAVBAR */}
      <nav className="bg-[#0d0e12]/90 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col group">
            <div className="flex items-center gap-1 font-black text-2xl tracking-tighter uppercase italic">
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                LL
              </span>
              <span className="bg-gradient-to-r from-pink-300 via-zinc-200 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(244,114,182,0.4)]">
                OVEDBYUS
              </span>
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
            className="bg-gradient-to-r from-zinc-200 via-pink-200 to-zinc-300 hover:from-white hover:to-pink-100 text-zinc-950 font-black px-6 py-2 rounded-full text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(244,114,182,0.3)] transition-all active:scale-95"
          >
            Start
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-block text-[11px] font-extrabold tracking-[0.3em] bg-gradient-to-r from-pink-300 via-zinc-200 to-pink-400 bg-clip-text text-transparent uppercase border border-pink-500/20 px-3 py-1 rounded-full bg-pink-500/5">
            ✦ LLOVEDBYUS STUDIO
          </span>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] italic">
            Create <br />
            Something <br />
            <span className="bg-gradient-to-r from-zinc-100 via-pink-200 via-50% to-zinc-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,114,182,0.35)]">
              That's Yours.
            </span>
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

        {/* KOLASE PRODUK */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[320px] h-[520px] bg-zinc-900/40 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden border border-zinc-800/80 flex items-center justify-center p-2">
            <img 
              src="/hero-collage.png" 
              alt="LLOVEDBYUS Product Collage" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW GRID */}
      <section id="products" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.25em] bg-gradient-to-r from-zinc-300 via-pink-300 to-zinc-400 bg-clip-text text-transparent uppercase">
            PRODUCTS
          </span>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider mt-1 text-zinc-100 italic">
            Explore Our <span className="bg-gradient-to-r from-zinc-100 via-pink-300 to-zinc-300 bg-clip-text text-transparent">Products</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {productList.map((item) => (
            <div 
              key={item.id}
              onClick={() => handleProductClick(item)}
              className="group bg-[#121318] border border-zinc-800 rounded-3xl p-5 cursor-pointer hover:border-pink-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,114,182,0.15)] flex flex-col items-center"
            >
              <div className="w-full aspect-[4/5] bg-zinc-950 rounded-2xl overflow-hidden relative flex items-center justify-center border border-zinc-800/60 mb-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200 group-hover:text-pink-300 transition text-center">{item.name}</h3>
              <p className="text-xs text-zinc-500 text-center mt-1">{item.desc}</p>
              
              {item.id === 1 ? (
                <span className="mt-3 text-[10px] font-extrabold bg-pink-500/10 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-pink-500 group-hover:text-zinc-950 transition">
                  Buka Studio Design ✦
                </span>
              ) : (
                <span className="mt-3 text-[10px] font-extrabold bg-zinc-900 text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest cursor-not-allowed">
                  Coming Soon ⏳
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION LINK RESMI */}
      <section id="socials" className="py-20 px-6 max-w-4xl mx-auto border-t border-zinc-800/85 text-center">
        <span className="text-xs font-bold tracking-[0.25em] bg-gradient-to-r from-zinc-300 via-pink-300 to-zinc-400 bg-clip-text text-transparent uppercase">
          CONNECT WITH US
        </span>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider mt-1 text-zinc-100 italic mb-10">
          Official <span className="bg-gradient-to-r from-zinc-100 via-pink-300 to-zinc-300 bg-clip-text text-transparent">Links</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Shopee Store */}
          <a 
            href="https://shopee.co.id/llovedbyus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-[#121318] border border-zinc-800 hover:border-pink-500/60 rounded-3xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,114,182,0.15)]"
          >
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 group-hover:scale-110 transition overflow-hidden p-2">
              <img src="/shopee.png" alt="Shopee Logo" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200 group-hover:text-pink-300 transition">Shopee Store</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Belanja via e-commerce</p>
          </a>

          {/* Instagram */}
          <a 
            href="https://instagram.com/prellovedbyus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-[#121318] border border-zinc-800 hover:border-pink-500/60 rounded-3xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,114,182,0.15)]"
          >
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 group-hover:scale-110 transition overflow-hidden p-2">
              <img src="/instagram.png" alt="Instagram Logo" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200 group-hover:text-pink-300 transition">Instagram</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Lihat katalog & testimoni</p>
          </a>

          {/* WhatsApp Admin */}
          <a 
            href="https://wa.me/62881025376311" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-[#121318] border border-zinc-800 hover:border-pink-500/60 rounded-3xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(244,114,182,0.15)]"
          >
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 group-hover:scale-110 transition overflow-hidden p-2">
              <img src="/whatsapp.png" alt="WhatsApp Logo" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wide text-zinc-200 group-hover:text-pink-300 transition">WhatsApp Admin</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Chat & konsultasi pesanan</p>
          </a>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-zinc-600 text-xs border-t border-zinc-900">
        <p>© 2026 LLOVEDBYUS. All Rights Reserved.</p>
      </footer>

      {/* MODAL ZOOM PRODUK LAIN */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#13141a] border border-zinc-700/80 rounded-3xl max-w-md w-full p-6 relative shadow-[0_0_50px_rgba(244,114,182,0.2)] flex flex-col items-center">
            
            <button 
              onClick={() => setActiveProduct(null)}
              className="absolute top-4 right-4 bg-zinc-800 hover:bg-pink-500 hover:text-zinc-950 text-zinc-300 w-8 h-8 rounded-full font-bold flex items-center justify-center transition"
            >
              ✕
            </button>

            <span className="text-[10px] font-extrabold tracking-[0.25em] text-pink-400 uppercase mb-2">PREVIEW</span>
            
            <div className="w-[220px] aspect-[1/2] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700/60 shadow-2xl my-3 relative flex items-center justify-center">
              <img 
                src={activeProduct.image} 
                alt={activeProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-100 mt-2">{activeProduct.name}</h3>
            <p className="text-xs text-zinc-400 text-center mt-1 mb-6 px-4">{activeProduct.desc}</p>

            <button 
              onClick={() => setActiveProduct(null)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 rounded-xl text-center text-xs uppercase tracking-widest transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL DESIGN LAB */}
      {showDesignLab && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-50 bg-[#0d0e12]/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
            <span className="text-xs font-black tracking-widest text-pink-400 uppercase">✦ LLOVEDBYUS DESIGN STUDIO</span>
            <button 
              onClick={() => setShowDesignLab(false)}
              className="bg-zinc-800 hover:bg-pink-500 hover:text-zinc-950 text-zinc-300 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition"
            >
              ✕ Tutup Studio
            </button>
          </div>
          <div className="p-4 md:p-8 flex-1">
            <DesignLab />
          </div>
        </div>
      )}

    </main>
  );
}

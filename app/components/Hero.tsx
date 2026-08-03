import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="bg-[#090a0d] text-zinc-100 min-h-screen selection:bg-pink-500 selection:text-white font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-[#0d0e12]/80 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO CHROME Y2K */}
          <Link href="/" className="flex flex-col group">
            <div className="flex items-center gap-1 font-black text-2xl tracking-tighter uppercase italic">
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                YOURS
              </span>
              <span className="bg-gradient-to-r from-pink-300 via-zinc-200 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(244,114,182,0.4)]">
                LAB
              </span>
            </div>
            <span className="text-[8px] font-bold tracking-[0.3em] text-zinc-400 -mt-1 uppercase">
              CREATE YOURS
            </span>
          </Link>

          {/* MENU NAVBAR */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-zinc-400">
            <Link href="#" className="hover:text-pink-300 transition">Products</Link>
            <Link href="#design-lab" className="hover:text-pink-300 transition">Design Lab</Link>
            <Link href="#" className="hover:text-pink-300 transition">AI Design</Link>
            <Link href="#" className="hover:text-pink-300 transition">About</Link>
          </div>

        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* KANAN/KIRI: TEKS UTAMA SLOGAN */}
        <div className="space-y-6">
          
          {/* BADGE SUB-TITLE Y2K */}
          <span className="inline-block text-[11px] font-extrabold tracking-[0.3em] bg-gradient-to-r from-pink-300 via-zinc-200 to-pink-400 bg-clip-text text-transparent uppercase border border-pink-500/20 px-3 py-1 rounded-full bg-pink-500/5">
            ✦ YOURSLAB Y2K STUDIO
          </span>

          {/* SLOGAN UTAMA CHROME GRADIENT */}
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] italic">
            Create <br />
            Something <br />
            <span className="bg-gradient-to-r from-zinc-100 via-pink-200 via-50% to-zinc-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,114,182,0.35)]">
              That's Yours.
            </span>
          </h1>

          <p className="text-zinc-400 text-sm md:text-base max-w-md font-medium leading-relaxed">
            Design phone cases, apparel, mugs, tote bags, and many more products exactly the way you want.
          </p>

          {/* SINGLE BUTTON CTA: PICK PRODUCT & DESIGN */}
          <div className="flex items-center gap-4 pt-2">
            <Link 
              href="#design-lab" 
              className="bg-gradient-to-r from-zinc-100 via-pink-200 to-zinc-200 hover:from-white hover:to-pink-100 text-zinc-950 font-black px-10 py-4 rounded-full text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(244,114,182,0.3)] transition-all active:scale-95 inline-block text-center"
            >
              Pick Product & Design
            </Link>
          </div>
        </div>

        {/* PREVIEW KANAN (PHONE MOCKUP GLASSMOPRHISM) */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[280px] h-[540px] bg-gradient-to-b from-zinc-800/40 via-pink-500/10 to-zinc-900/80 rounded-[44px] shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center p-4 border border-zinc-700/50 backdrop-blur-md overflow-hidden">
            
            {/* Inner Glow Chrome */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center z-10">
              <span className="text-xs font-black tracking-[0.25em] bg-gradient-to-r from-zinc-200 to-pink-300 bg-clip-text text-transparent uppercase">
                PHONE CASE
              </span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

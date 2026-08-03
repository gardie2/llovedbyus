import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#0d0e12]/80 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-50 py-4 px-6 w-full">
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

        {/* MENU NAVBAR (TANPA TOMBOL START) */}

        {/* MENU NAVBAR */}

        <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-zinc-400">
          <Link href="#" className="hover:text-pink-300 transition">Products</Link>
          <Link href="#design-lab" className="hover:text-pink-300 transition">Design Lab</Link>
          <Link href="#" className="hover:text-pink-300 transition">AI Design</Link>
          <Link href="#" className="hover:text-pink-300 transition">About</Link>
        </div>

      </div>
    </nav>
  );
}
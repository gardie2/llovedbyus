"use client";

export default function Footer() {
  return (
    <footer className="text-zinc-400 text-center py-10 border-t border-zinc-800/80 bg-[#09090b] font-sans">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* KONTROL / SOSIAL MEDIA CONNECT WITH US */}
        <div>
          <p className="text-xs font-black tracking-widest text-zinc-300 uppercase mb-4">
            Connect With Us
          </p>
          <div className="flex justify-center items-center gap-6">
            
            {/* Instagram */}
            <a 
              href="https://instagram.com/prellovedbyus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl hover:border-pink-500/50 transition-all hover:scale-110 flex items-center justify-center w-12 h-12 shadow-lg"
            >
              <img src="/instagram.png" alt="Instagram" className="w-6 h-6 object-contain" />
            </a>

            {/* Shopee */}
            <a 
              href="https://shopee.co.id/https://shopee.co.id/llovedbyus?categoryId=100013&entryPoint=ShopByPDP&itemId=57615256317" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl hover:border-pink-500/50 transition-all hover:scale-110 flex items-center justify-center w-12 h-12 shadow-lg"
            >
              <img src="/shopee.png" alt="Shopee" className="w-6 h-6 object-contain" />
            </a>

            {/* WhatsApp */}
            <a 
              href="https://wa.me/62881025376311" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl hover:border-pink-500/50 transition-all hover:scale-110 flex items-center justify-center w-12 h-12 shadow-lg"
            >
              <img src="/whatsapp.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
            </a>

          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="pt-4 border-t border-zinc-900">
          <p className="text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
            © 2026 YOURSLAB. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
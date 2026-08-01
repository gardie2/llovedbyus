export default function Products() {
  const categories = [
    {
      title: "Case Handphone",
      desc: "Desain casing HP sesuai gaya unikmu",
      image: "/case.jpg.png",
    },
    {
      title: "Baju / T-Shirt",
      desc: "Kaos custom bahan adem & nyaman",
      image: "/t-shirt.jpg.png",
    },
    {
      title: "Sweatshirt",
      desc: "Sweatshirt simpel & stylish",
      image: "/sweatshirt.jpg.png",
    },
    {
      title: "Hoodie",
      desc: "Hoodie hangat dengan desain idemu",
      image: "/hoodie.jpg.png",
    },
    {
      title: "Tote Bag",
      desc: "Tas kain kustom buat sehari-hari",
      image: "/totebag.jpg.png",
    },
  ];

  const features = [
    {
      icon: "🎨",
      title: "Bebas Berkreasi",
      desc: "Desain sesukamu dengan berbagai gambar/foto keren.",
    },
    {
      icon: "🛡️",
      title: "Kualitas Terjamin",
      desc: "Bahan pilihan, hasil cetak tajam, tahan lama & premium.",
    },
    {
      icon: "🚚",
      title: "Pengiriman Cepat",
      desc: "Diproses cepat dan dikirim aman ke seluruh Indonesia.",
    },
    {
      icon: "❤️",
      title: "Dibuat Untukmu",
      desc: "Setiap produk dibuat khusus satu per satu sesuai pesanan.",
    },
  ];

  const steps = [
    { step: "01", title: "Pilih Produk", desc: "Pilih produk yang ingin kamu desain." },
    { step: "02", title: "Desain Sesukamu", desc: "Gunakan foto atau desain idemu sendiri." },
    { step: "03", title: "Checkout", desc: "Review desainmu & selesaikan pembayaran." },
    { step: "04", title: "Kami Buat & Kirim", desc: "Kami cetak rapi & langsung dikirim ke kamu." },
  ];

  return (
    <section className="py-16 px-6 bg-white text-gray-900">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* SECTION 1: Kategori Produk dengan Gambar */}
        <div>
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-red-500 font-bold">
              DESIGN IT YOUR WAY
            </span>
            <h2 className="text-3xl font-extrabold mt-1">
              Pilih Produkmu{" "}
              <span className="text-red-500 italic font-serif font-normal">
                Design It Your Way
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((item, index) => (
              <div
                key={index}
                className="relative h-72 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer border border-gray-100"
              >
                {/* Foto Produk */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Overlay Gelap Halus di Atas Foto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-white drop-shadow">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-200 mt-1 drop-shadow">
                      {item.desc}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/90 text-gray-900 flex items-center justify-center font-bold shadow group-hover:bg-red-500 group-hover:text-white transition">
                    →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Keunggulan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-8 rounded-2xl border border-gray-100">
          {features.map((feat, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="text-3xl">{feat.icon}</div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{feat.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 3: Cara Kerja */}
        <div className="bg-zinc-900 text-white p-10 rounded-3xl">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-red-400 font-bold">
              HOW IT WORKS / CARA KERJANYA
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              From Idea to Real{" "}
              <span className="italic font-serif font-normal text-gray-300">
                In 4 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((st, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 font-bold mb-4">
                  {st.step}
                </div>
                <h4 className="font-bold text-base">{st.title}</h4>
                <p className="text-xs text-gray-400 mt-2">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
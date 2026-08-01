export default function WhatsAppButton() {
  const phoneNumber = "62881025376311";
  const message = encodeURIComponent(
    "Halo YOURSLAB! Saya mau tanya-tanya / pesan produk custom nih."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all z-50 hover:scale-105"
    >
      {/* Ikon Sederhana Chat/WA */}
      <span className="text-xl">💬</span>
      <span className="font-bold text-sm hidden sm:inline">Pesan via WA</span>
    </a>
  );
}
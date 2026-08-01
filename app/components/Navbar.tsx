export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            YOURS<span className="text-red-500">LAB</span>
          </h1>

          <p className="text-xs tracking-[0.35em] text-gray-400">
            CREATE YOURS
          </p>
        </div>

        <div className="hidden gap-10 font-medium lg:flex">
          <a href="#">Products</a>
          <a href="#">Design Lab</a>
          <a href="#">AI Design</a>
          <a href="#">About</a>
        </div>

        <button className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600">
          Start
        </button>
      </div>
    </nav>
  );
}
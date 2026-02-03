export default function DesktopHeader() {
  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        
        {/* Left: Brand */}
        <div className="font-bold text-lg">
          English Club
        </div>

        {/* Right: Desktop Menu (future ready) */}
        <nav className="flex items-center gap-6 text-sm">
          <a href="/" className="hover:text-blue-600">Home</a>
          <a href="#courses" className="hover:text-blue-600">Courses</a>
          <a href="#branches" className="hover:text-blue-600">Branches</a>
          <a href="#contact" className="hover:text-blue-600">Contact</a>

          <a
            href="#login"
            className="ml-2 px-4 py-1.5 border rounded-full hover:bg-gray-100"
          >
            Login
          </a>
        </nav>
      </div>
    </header>
  );
}

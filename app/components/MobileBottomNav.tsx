"use client";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex justify-around py-2 text-xs text-gray-700">
        
        {/* Home */}
        <a href="/" className="flex flex-col items-center">
          🏠
          <span>Home</span>
        </a>

        {/* Courses */}
        <a href="#courses" className="flex flex-col items-center">
          📚
          <span>Courses</span>
        </a>

        {/* Call */}
        <a href="tel:9713014234" className="flex flex-col items-center">
          📞
          <span>Call</span>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/919713014234"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center"
        >
          💬
          <span>WhatsApp</span>
        </a>

        {/* More */}
        <a href="#more" className="flex flex-col items-center">
          ⋯
          <span>More</span>
        </a>

      </div>
    </nav>
  );
}

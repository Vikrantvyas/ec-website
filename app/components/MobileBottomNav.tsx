"use client";

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex justify-around py-2 text-sm">
        <a href="/" className="flex flex-col items-center">
          🏠
          <span>Home</span>
        </a>

        <a href="#courses" className="flex flex-col items-center">
          📚
          <span>Courses</span>
        </a>

        <a href="#branches" className="flex flex-col items-center">
          📍
          <span>Branches</span>
        </a>

        <a href="tel:9713014234" className="flex flex-col items-center">
          📞
          <span>Call</span>
        </a>

        <a href="#more" className="flex flex-col items-center">
          ⋯
          <span>More</span>
        </a>
      </div>
    </nav>
  );
}

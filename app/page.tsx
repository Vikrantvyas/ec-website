import CoursesSection from "./components/CoursesSection";
import BranchesSection from "./components/BranchesSection";
import TrustSection from "./components/TrustSection";
import MapSection from "./components/MapSection";
import TestimonialsSection from "./components/TestimonialsSection";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      {/* ⭐ Google Reviews Trust Badge */}
      <section className="px-4 pt-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm">
            {/* Google Icon */}
            <span className="text-lg font-bold">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </span>

            {/* Rating */}
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                4.9 / 5 ⭐⭐⭐⭐⭐
              </p>
              <p className="text-gray-500">
                Google Reviews • Trusted by students in Indore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 Courses */}
      <CoursesSection />

      {/* 📍 Branches */}
      <BranchesSection />

      {/* 🧠 Trust & Proof */}
      <TrustSection />
      <MapSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </>
  );
}

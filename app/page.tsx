import CoursesSection from "./components/CoursesSection";
import HomeVideoSection from "./components/HomeVideoSection";
import HomeVideoReviewsSection from "./components/HomeVideoReviewsSection";
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
      <section className="px-4 pt-8">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div
            className="
              flex items-center gap-4
              bg-white border rounded-2xl
              px-5 py-4
              shadow-sm
              hover-lift
              animate-fadeUp
            "
          >
            {/* Google Logo Style Text */}
            <span className="text-xl font-bold leading-none">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </span>

            {/* Rating */}
            <div className="text-sm">
              <p className="font-semibold text-gray-800 flex items-center gap-1">
                4.9 / 5
                <span className="text-yellow-400">★★★★★</span>
              </p>
              <p className="text-gray-500">
                Google Reviews • Trusted by students in Indore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 Courses (Main Decision Area) */}
      <CoursesSection />

      {/* 🎥 How English Club Works (Intro Video) */}
      <HomeVideoSection />

      {/* 🎤 Real Student Short Video Reviews */}
      <HomeVideoReviewsSection />

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

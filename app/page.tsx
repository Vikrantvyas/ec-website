import HeroSection from "./components/HeroSection";
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
      <HeroSection />

      {/* 🎯 Decision first */}
      <CoursesSection />

      {/* 📍 Location next */}
      <BranchesSection />

      {/* 🧠 Trust & proof */}
      <TrustSection />
      <MapSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </>
  );
}

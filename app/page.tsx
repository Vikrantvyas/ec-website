import HeroSection from "./components/HeroSection";
import CoursesSection from "./components/CoursesSection";
import TrustSection from "./components/TrustSection"; // ✅ ADD THIS
import BranchesSection from "./components/BranchesSection";
import MapSection from "./components/MapSection";
import TestimonialsSection from "./components/TestimonialsSection";
import GallerySection from "./components/GallerySection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import StickyButtons from "./components/StickyButtons";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CoursesSection />

      {/* ✅ TRUST CARDS SECTION */}
      <TrustSection />

      <BranchesSection />
      <MapSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
      <StickyButtons />
    </>
  );
}

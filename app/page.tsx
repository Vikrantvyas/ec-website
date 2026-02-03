import MobileHeader from "./components/MobileHeader";
import MobileBottomNav from "./components/MobileBottomNav";

import HeroSection from "./components/HeroSection";
import CoursesSection from "./components/CoursesSection";
import TrustSection from "./components/TrustSection";
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
      {/* 📱 Mobile WhatsApp-style header */}
      <MobileHeader />

      <HeroSection />
      <CoursesSection />

      {/* 🔥 Trust / Impact cards */}
      <TrustSection />

      <BranchesSection />
      <MapSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />

      {/* 📱 Mobile bottom navigation */}
      <MobileBottomNav />

      {/* Existing floating buttons */}
      <StickyButtons />
    </>
  );
}

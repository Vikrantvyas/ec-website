import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
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
      {/* 📱 Mobile Header */}
      <MobileHeader />

      {/* 💻 Desktop Header */}
      <DesktopHeader />

      <HeroSection />
      <CoursesSection />
      <TrustSection />
      <BranchesSection />
      <MapSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />

      {/* 📱 Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* 💻 Desktop Floating Buttons */}
      <StickyButtons />
    </>
  );
}

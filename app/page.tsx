import HeroSection from "./components/HeroSection";
import CoursesSection from "./components/CoursesSection";
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

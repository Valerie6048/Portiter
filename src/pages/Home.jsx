import Header from '../components/Header';
import Hero from '../components/Hero';
import Experience from '../components/Experience';
import ProjectGrid from '../components/ProjectGrid';
import BundleSection from '../components/BundleSection';
import SkillsSection from '../components/SkillsSection';
import Education from '../components/Education';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Experience />
        <ProjectGrid />
        <BundleSection />
        <SkillsSection />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

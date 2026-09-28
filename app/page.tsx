import { Experience } from "@/components/Experience";
import { Preloader } from "@/components/Preloader";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { FilmStage } from "@/components/FilmStage";
import { Signature } from "@/components/sections/Signature";
import { ScentStory } from "@/components/sections/ScentStory";
import { FindYourScent } from "@/components/sections/FindYourScent";
import { TheBottle } from "@/components/sections/TheBottle";
import { FinalExperience } from "@/components/sections/FinalExperience";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <Experience>
      <Preloader />
      <Cursor />
      <Nav />

      <main id="top">
        {/* Sections 1–3 live inside the scroll-controlled walkthrough. */}
        <FilmStage />

        <Signature />
        <ScentStory />
        <FindYourScent />
        <TheBottle />
        <FinalExperience />
      </main>

      <Footer />
    </Experience>
  );
}

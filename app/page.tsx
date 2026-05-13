import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Services } from "@/components/sections/Services";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main className="relative z-10">
      <Hero />
      <Portfolio />
      <Services />
      <Contact />
    </main>
  );
}

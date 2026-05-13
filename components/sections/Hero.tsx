"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { CanvasSequence } from "@/components/canvas/CanvasSequence";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Users, DollarSign } from "lucide-react";

const STATS = [
  { icon: Users, value: "2.4M+", label: "Seguidores" },
  { icon: TrendingUp, value: "8.3%", label: "Conversão" },
  { icon: DollarSign, value: "R$1.2M", label: "Receita Gerada" },
];

export function Hero() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger-reveal each word of the headline
      gsap.from(".hero-word", {
        opacity: 0,
        y: 48,
        rotateX: -20,
        stagger: 0.06,
        duration: 0.9,
        ease: "power4.out",
        delay: 0.5,
      });

      gsap.from(".hero-sub", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        delay: 1.1,
      });

      gsap.from(".hero-stat", {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.6,
        ease: "power2.out",
        delay: 1.3,
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 16,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
        delay: 1.6,
      });

      gsap.from(".hero-scroll-indicator", {
        opacity: 0,
        duration: 0.8,
        delay: 2.2,
      });
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  const headline = ["Influência", "Digital.", "Resultados", "Reais."];

  return (
    <section id="hero">
      <CanvasSequence
        framesDir="/frames/mia/"
        frameCount={72}
        scrollHeight={300}
      >
        {/* Dark gradient overlays for readability */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,5,8,0.6) 0%, rgba(5,5,8,0.1) 40%, rgba(5,5,8,0.2) 70%, rgba(5,5,8,0.85) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 40%, rgba(5,5,8,0.4) 100%)",
            }}
          />
        </div>

        {/* Main overlay content */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
          style={{ perspective: "1200px" }}
        >
          {/* Stats row — top */}
          <div className="absolute top-24 left-0 right-0 flex justify-center gap-6 lg:gap-10 px-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="hero-stat flex flex-col items-center gap-1"
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} className="text-accent-glow" />
                  <span className="font-display font-bold text-lg lg:text-2xl text-white">
                    {value}
                  </span>
                </div>
                <span className="text-xs text-text-muted uppercase tracking-widest">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Headline */}
          <div className="text-center mb-6 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
            <h1 className="font-display font-black leading-none tracking-tight">
              {headline.map((word, wi) => (
                <span
                  key={wi}
                  className="hero-word inline-block mr-4 last:mr-0"
                  style={{
                    display: "inline-block",
                    fontSize: "clamp(3rem, 8vw, 7rem)",
                    lineHeight: 1.0,
                    background:
                      wi % 2 === 0
                        ? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                        : "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-sub font-sans text-text-muted text-base lg:text-lg max-w-lg text-center mb-10 leading-relaxed">
            Avatar digital de IA para TikTok Shop, Fanvue e automação B2B —
            conteúdo que converte 24/7 sem pausas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
            <Button
              variant="glow"
              size="xl"
              className="hero-cta"
              onClick={() =>
                document
                  .querySelector("#contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Activar Mia Park
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="hero-cta"
              onClick={() =>
                document
                  .querySelector("#portfolio")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Play size={16} className="text-accent-glow" />
              Ver Portfolio
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-xs text-text-muted uppercase tracking-[0.2em]">
            Scroll
          </span>
          <div className="relative h-8 w-px">
            <div
              className="absolute top-0 w-px bg-gradient-to-b from-accent-glow to-transparent"
              style={{ animation: "scan-line 1.6s ease-in-out infinite" }}
            />
            <div className="w-px h-full bg-white/10" />
          </div>
        </div>
      </CanvasSequence>
    </section>
  );
}

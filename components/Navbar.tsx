"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Serviços", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Sobre Mia", href: "#about" },
  { label: "Contato", href: "#contact" },
];

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: "top -60",
      onUpdate: (self) => {
        setScrolled(self.progress > 0);
      },
    });

    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".nav-item", {
        opacity: 0,
        y: -16,
        stagger: 0.07,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.2,
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-bg-deep/80 backdrop-blur-xl border-b border-glass-border"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <a
          href="/"
          className="nav-item flex items-center gap-2 select-none group"
        >
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inset-0 rounded-lg bg-accent-primary opacity-20 group-hover:opacity-40 transition-opacity" />
            <span className="relative font-display font-black text-sm text-white">M</span>
          </span>
          <span className="font-display font-bold text-lg tracking-tight">
            <span className="text-text-primary">M2</span>
            <span className="text-accent-glow">W</span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="nav-item">
              <button
                onClick={() => handleAnchorClick(link.href)}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors duration-200 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex nav-item">
          <Button
            variant="glow"
            size="sm"
            onClick={() => handleAnchorClick("#contact")}
          >
            Começar Agora
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden nav-item p-2 text-text-muted hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-bg-surface/95 backdrop-blur-xl border-b border-glass-border">
          <ul className="flex flex-col py-4 px-6 gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleAnchorClick(link.href)}
                  className="w-full text-left px-4 py-3 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li className="pt-2">
              <Button
                variant="glow"
                className="w-full"
                onClick={() => handleAnchorClick("#contact")}
              >
                Começar Agora
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, ShoppingCart, Play, Volume2, VolumeX } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  type: string;
  platform: "tiktok" | "fanvue" | "b2b";
  platformLabel: string;
  video: string;
  poster: string;
  views: string;
  likes: string;
  conversion?: string;
  duration: string;
  tall: boolean; // drives aspect ratio — tall = 9:16, wide = 4:5
}

const ITEMS: PortfolioItem[] = [
  {
    id: 1,
    title: "Hook Final — Botão Laranja",
    type: "TikTok Shop UGC",
    platform: "tiktok",
    platformLabel: "TikTok Shop",
    video: "/portfolio/escova-hook-final.mp4",
    poster: "/portfolio/thumb-hook-final.jpg",
    views: "4.2M",
    likes: "312K",
    conversion: "9.1%",
    duration: "0:15",
    tall: true,
  },
  {
    id: 2,
    title: "LTX Natural — Hook",
    type: "LTX-2.3 Generated",
    platform: "tiktok",
    platformLabel: "TikTok Shop",
    video: "/portfolio/escova-ltx-natural.mp4",
    poster: "/portfolio/thumb-ltx-natural.jpg",
    views: "1.8M",
    likes: "94K",
    conversion: "6.4%",
    duration: "0:15",
    tall: false,
  },
  {
    id: 3,
    title: "Seedance Remake",
    type: "Higgsfield Seedance",
    platform: "tiktok",
    platformLabel: "TikTok Shop",
    video: "/portfolio/escova-seedance.mp4",
    poster: "/portfolio/thumb-seedance.jpg",
    views: "2.6M",
    likes: "187K",
    conversion: "7.8%",
    duration: "0:16",
    tall: true,
  },
  {
    id: 4,
    title: "Short Hook v3",
    type: "Short-form UGC",
    platform: "tiktok",
    platformLabel: "TikTok",
    video: "/portfolio/escova-short-hook.mp4",
    poster: "/portfolio/thumb-short-hook.jpg",
    views: "6.1M",
    likes: "543K",
    conversion: "11.2%",
    duration: "0:09",
    tall: true,
  },
  {
    id: 5,
    title: "X3 IPX7 — Hook Original",
    type: "Product Launch",
    platform: "tiktok",
    platformLabel: "TikTok Shop",
    video: "/portfolio/x3-ipx7-hook.mp4",
    poster: "/portfolio/thumb-x3-ipx7-hook.jpg",
    views: "3.4M",
    likes: "241K",
    conversion: "8.9%",
    duration: "0:20",
    tall: false,
  },
  {
    id: 6,
    title: "Studio — Higgsfield",
    type: "Brand Content",
    platform: "b2b",
    platformLabel: "B2B Content",
    video: "/portfolio/hf-studio.mp4",
    poster: "/portfolio/thumb-hf-studio.jpg",
    views: "—",
    likes: "28K",
    duration: "0:05",
    tall: true,
  },
];

const platformVariantMap: Record<
  PortfolioItem["platform"],
  "tiktok" | "fanvue" | "b2b"
> = { tiktok: "tiktok", fanvue: "fanvue", b2b: "b2b" };

function VideoCard({ item }: { item: PortfolioItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted((m) => !m);
    }
  };

  return (
    <Card
      className="group overflow-hidden hover:border-accent-primary/40 hover:shadow-glow-sm transition-all duration-500 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video / Poster wrapper */}
      <div
        className={`relative w-full overflow-hidden bg-bg-surface ${
          item.tall ? "aspect-[9/16]" : "aspect-[4/5]"
        }`}
      >
        <video
          ref={videoRef}
          src={item.video}
          poster={item.poster}
          muted={muted}
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />

        {/* Dark gradient for metadata readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Platform badge top-left */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={platformVariantMap[item.platform]}>
            {item.platformLabel}
          </Badge>
        </div>

        {/* Duration badge top-right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80 font-mono">
            {item.duration}
          </span>
        </div>

        {/* Play indicator (shows when not hovered) */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
              <Play size={18} className="text-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Sound toggle — only visible on hover while playing */}
        {hovered && playing && (
          <button
            onClick={toggleMute}
            className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 transition-opacity"
          >
            {muted ? (
              <VolumeX size={13} className="text-white/80" />
            ) : (
              <Volume2 size={13} className="text-white" />
            )}
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="p-4">
        <div className="mb-2">
          <p className="font-display font-semibold text-sm text-text-primary leading-tight">
            {item.title}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{item.type}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-text-muted">
          {item.views !== "—" && (
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {item.views}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Heart size={11} />
            {item.likes}
          </span>
          {item.conversion && (
            <span className="flex items-center gap-1 text-accent-glow font-medium">
              <ShoppingCart size={11} />
              {item.conversion}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".portfolio-heading", {
        scrollTrigger: {
          trigger: ".portfolio-heading",
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".portfolio-card", {
        scrollTrigger: {
          trigger: ".portfolio-grid",
          start: "top 80%",
        },
        opacity: 0,
        y: 60,
        scale: 0.96,
        stagger: {
          each: 0.1,
          from: "start",
        },
        duration: 0.7,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="relative py-28 px-6 lg:px-8"
      style={{
        background: "linear-gradient(180deg, #050508 0%, #0a0a12 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20"
        style={{
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="portfolio-heading mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent-glow font-medium">
            Conteúdo Real — Produzido por IA
          </p>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-text-primary mb-5 tracking-tight">
            Portfolio Mia Park
          </h2>
          <p className="max-w-xl mx-auto text-text-muted text-lg leading-relaxed">
            Cada vídeo gerado com LTX-2.3 e Higgsfield. Passa o rato para ver.
          </p>
        </div>

        {/* Masonry grid */}
        <div className="portfolio-grid columns-2 lg:columns-3 gap-4 space-y-4">
          {ITEMS.map((item) => (
            <div key={item.id} className="portfolio-card break-inside-avoid">
              <VideoCard item={item} />
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-xs text-text-muted/60">
          Vídeos gerados com identidade digital Mia Park · LTX-2.3 · Higgsfield Seedance ·
          Produto: Escova Eléctrica X3 IPX7
        </p>
      </div>
    </section>
  );
}

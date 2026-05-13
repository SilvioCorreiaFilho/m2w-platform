"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ShoppingBag, Star, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  target: number;
  suffix: string;
}

interface Service {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  badge: "tiktok" | "fanvue" | "b2b";
  badgeLabel: string;
  title: string;
  description: string;
  metrics: Metric[];
  features: string[];
  ctaLabel: string;
  highlight?: boolean;
}

const SERVICES: Service[] = [
  {
    id: "tiktok",
    icon: ShoppingBag,
    iconColor: "#ff6b8a",
    badge: "tiktok",
    badgeLabel: "TikTok Shop",
    title: "TikTok Shop & Live Commerce",
    description:
      "Mia Park como embaixadora digital permanente — reviews, unboxings e lives de shopping que convertem sem pausa, sem cachê de influencer.",
    metrics: [
      { label: "GMV Gerado", value: "R$2.4M+", target: 2.4, suffix: "M+" },
      { label: "Taxa de Conversão", value: "8.3%", target: 8.3, suffix: "%" },
      { label: "Pedido Médio", value: "R$187", target: 187, suffix: "" },
    ],
    features: [
      "Avatar sincronizado com estoque em tempo real",
      "Scripts A/B testados automaticamente",
      "Lives programadas 24/7",
      "Integração nativa TikTok Affiliate",
    ],
    ctaLabel: "Activar TikTok Shop",
    highlight: true,
  },
  {
    id: "fanvue",
    icon: Star,
    iconColor: "#ff8c5a",
    badge: "fanvue",
    badgeLabel: "Fanvue",
    title: "Fanvue & Conteúdo Premium",
    description:
      "Canal de subscrição com conteúdo exclusivo gerado por IA. Receita recorrente mensal sem esforço criativo.",
    metrics: [
      { label: "Subscritores Activos", value: "12.4K", target: 12.4, suffix: "K" },
      { label: "Taxa de Retenção", value: "87%", target: 87, suffix: "%" },
      { label: "Receita Mensal", value: "R$89K", target: 89, suffix: "K" },
    ],
    features: [
      "Conteúdo diário gerado automaticamente",
      "Personalização por tier de subscrição",
      "DM automatizado com IA conversacional",
      "Analytics de engajamento em tempo real",
    ],
    ctaLabel: "Criar Canal Fanvue",
  },
  {
    id: "b2b",
    icon: Zap,
    iconColor: "#67e8f9",
    badge: "b2b",
    badgeLabel: "B2B Automation",
    title: "Automação Comercial B2B",
    description:
      "Pipeline completo de criação de conteúdo com IA para agências e marcas — do briefing ao asset publicado em minutos.",
    metrics: [
      { label: "Output de Conteúdo", value: "3× mais rápido", target: 3, suffix: "×" },
      { label: "Marcas Atendidas", value: "47+", target: 47, suffix: "+" },
      { label: "ROI Garantido", value: "300%", target: 300, suffix: "%" },
    ],
    features: [
      "API ComfyUI integrada (RTX 4070Ti)",
      "Geração de persona customizável",
      "Entrega em WebP/MP4 otimizado",
      "Gestão de campanha multi-plataforma",
    ],
    ctaLabel: "Proposta Comercial",
  },
];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".services-heading", {
        scrollTrigger: {
          trigger: ".services-heading",
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      // Cards stagger in
      gsap.from(".service-card", {
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 75%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      // Animate metric numbers
      SERVICES.forEach((service) => {
        service.metrics.forEach((metric) => {
          const els = sectionRef.current!.querySelectorAll(
            `[data-metric="${service.id}-${metric.label}"]`
          );
          els.forEach((el) => {
            ScrollTrigger.create({
              trigger: el,
              start: "top 85%",
              once: true,
              onEnter: () => {
                const obj = { val: 0 };
                gsap.to(obj, {
                  val: metric.target,
                  duration: 1.8,
                  ease: "power2.out",
                  onUpdate() {
                    el.textContent =
                      metric.target % 1 !== 0
                        ? obj.val.toFixed(1) + metric.suffix
                        : Math.round(obj.val) + metric.suffix;
                  },
                });
              },
            });
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-28 px-6 lg:px-8 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0a0a12 0%, #050508 50%, #0a0a12 100%)",
      }}
    >
      {/* Decorative lines */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
          }}
        />
        <div
          className="absolute left-0 right-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="services-heading mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent-glow font-medium">
            Ecossistema M2W
          </p>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-text-primary mb-5 tracking-tight">
            Serviços & Funis
          </h2>
          <p className="max-w-xl mx-auto text-text-muted text-lg leading-relaxed">
            Três vectores de receita orquestrados pela mesma persona digital de IA.
          </p>
        </div>

        {/* Cards grid */}
        <div className="services-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.id} className="service-card">
                <Card
                  className={`h-full flex flex-col transition-all duration-500 hover:shadow-glow-md hover:border-accent-primary/30 ${
                    service.highlight
                      ? "border-accent-primary/40 shadow-glow-sm"
                      : ""
                  }`}
                >
                  {service.highlight && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                      style={{
                        background: "linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)",
                      }}
                    />
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                          background: `${service.iconColor}18`,
                          border: `1px solid ${service.iconColor}30`,
                        }}
                      >
                        <Icon size={18} style={{ color: service.iconColor }} />
                      </div>
                      <Badge variant={service.badge}>{service.badgeLabel}</Badge>
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed mt-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      {service.metrics.map((m) => (
                        <div key={m.label} className="text-center">
                          <p
                            className="font-display font-bold text-base text-text-primary tabular-nums"
                            data-metric={`${service.id}-${m.label}`}
                          >
                            {m.value}
                          </p>
                          <p className="text-[10px] text-text-muted leading-tight mt-0.5">
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-glass-border" />

                    {/* Features */}
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2
                            size={13}
                            className="text-accent-glow mt-0.5 shrink-0"
                          />
                          <span className="text-xs text-text-muted leading-relaxed">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      variant={service.highlight ? "glow" : "outline"}
                      className="w-full mt-2"
                      onClick={() =>
                        document
                          .querySelector("#contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      {service.ctaLabel}
                      <ArrowRight size={14} />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom trust signals */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {[
            { value: "< 48h", label: "Setup inicial" },
            { value: "24/7", label: "Conteúdo activo" },
            { value: "RTX 4070Ti", label: "Geração local" },
            { value: "LGPD", label: "Conformidade" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <TrendingUp size={14} className="text-accent-glow" />
              <span className="font-display font-bold text-text-primary text-sm">
                {value}
              </span>
              <span className="text-xs text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, CheckCircle2, Loader2, Mail, Building2, MessageSquare, User } from "lucide-react";

interface FormState {
  name: string;
  company: string;
  email: string;
  service: string;
  message: string;
}

const SERVICE_OPTIONS = [
  { value: "tiktok", label: "TikTok Shop & Live Commerce" },
  { value: "fanvue", label: "Fanvue & Conteúdo Premium" },
  { value: "b2b", label: "Automação Comercial B2B" },
  { value: "all", label: "Ecossistema Completo" },
];

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    company: "",
    email: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".contact-heading", {
        scrollTrigger: {
          trigger: ".contact-heading",
          start: "top 85%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".contact-field", {
        scrollTrigger: {
          trigger: ".contact-form",
          start: "top 75%",
        },
        opacity: 0,
        x: -30,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(".contact-info-item", {
        scrollTrigger: {
          trigger: ".contact-info",
          start: "top 80%",
        },
        opacity: 0,
        x: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call — replace with actual endpoint
    await new Promise((r) => setTimeout(r, 1800));

    setStatus("success");

    // Reset after 4 seconds
    setTimeout(() => {
      setStatus("idle");
      setForm({ name: "", company: "", email: "", service: "", message: "" });
    }, 4000);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-28 px-6 lg:px-8 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0a0a12 0%, #050508 60%, #0a0a12 100%)",
      }}
    >
      {/* Ambient glow bottom-left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[400px] opacity-15"
        style={{
          background:
            "radial-gradient(ellipse, rgba(124,58,237,0.8) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="contact-heading mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent-glow font-medium">
            Contacto Directo
          </p>
          <h2 className="font-display font-black text-4xl lg:text-6xl text-text-primary mb-5 tracking-tight">
            Activa Mia Park
          </h2>
          <p className="max-w-lg mx-auto text-text-muted text-lg leading-relaxed">
            Resposta em menos de 2 horas. Proposta personalizada em 24h.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <Card className="p-6 lg:p-8">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-text-primary">
                    Mensagem Recebida!
                  </h3>
                  <p className="text-text-muted text-sm max-w-sm">
                    A equipa M2W vai responder em menos de 2 horas com uma proposta
                    personalizada para o teu negócio.
                  </p>
                </div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="contact-form flex flex-col gap-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="contact-field flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
                        <User size={11} />
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Silvio Correia"
                        className="w-full rounded-lg border border-glass-border bg-white/[0.03] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all duration-200"
                      />
                    </div>

                    <div className="contact-field flex flex-col gap-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
                        <Building2 size={11} />
                        Empresa
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Marketing to Win"
                        className="w-full rounded-lg border border-glass-border bg-white/[0.03] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="contact-field flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
                      <Mail size={11} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hello@m2w.com.br"
                      className="w-full rounded-lg border border-glass-border bg-white/[0.03] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all duration-200"
                    />
                  </div>

                  <div className="contact-field flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Serviço de Interesse
                    </label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-glass-border bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Seleccionar serviço...
                      </option>
                      {SERVICE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="contact-field flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
                      <MessageSquare size={11} />
                      Mensagem
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Descreve o teu projecto, volume esperado de conteúdo e plataformas alvo..."
                      className="w-full rounded-lg border border-glass-border bg-white/[0.03] px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent-primary/60 focus:ring-1 focus:ring-accent-primary/30 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="contact-field">
                    <Button
                      type="submit"
                      variant="glow"
                      size="lg"
                      className="w-full"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          A Enviar...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Enviar Proposta
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>

          {/* Info sidebar */}
          <div className="contact-info lg:col-span-2 flex flex-col gap-6">
            {[
              {
                title: "Resposta Rápida",
                body: "Respondemos a todas as mensagens em menos de 2 horas durante dias úteis.",
                accent: "#a855f7",
              },
              {
                title: "Proposta Personalizada",
                body: "Cada proposta é construída à medida do teu negócio, plataformas e objectivos de receita.",
                accent: "#67e8f9",
              },
              {
                title: "Setup em 48 Horas",
                body: "Após aprovação, a Mia Park começa a gerar conteúdo para o teu negócio em até 48 horas.",
                accent: "#34d399",
              },
              {
                title: "ROI Garantido",
                body: "Metodologia testada com 47+ marcas. Garantia de retorno de 300% no primeiro trimestre.",
                accent: "#fbbf24",
              },
            ].map((item) => (
              <div key={item.title} className="contact-info-item flex gap-4">
                <div
                  className="mt-0.5 h-6 w-1 shrink-0 rounded-full"
                  style={{ background: item.accent }}
                />
                <div>
                  <h4 className="font-display font-semibold text-sm text-text-primary mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="h-px bg-glass-border my-2" />

            <div className="text-center">
              <p className="text-xs text-text-muted mb-1">Preferes email directo?</p>
              <a
                href="mailto:hello@m2w.com.br"
                className="text-sm text-accent-glow hover:text-accent-primary transition-colors font-medium"
              >
                hello@m2w.com.br
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

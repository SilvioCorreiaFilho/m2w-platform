---
name: M2W AI Solutions
description: Influencers digitais de IA para TikTok Shop, ecommerce e marcas — landing cinemática de captação
colors:
  deep-render-black: "#06060e"
  studio-surface: "#0b0b18"
  monitor-surface-raised: "#0e0e1f"
  glass-veil: "#ffffff0a"
  glass-border: "#ffffff14"
  tela-violet: "#7c3aed"
  monitor-violet: "#8b5cf6"
  carnival-magenta: "#d946ef"
  algorithm-cyan: "#22d3ee"
  studio-light: "#f8fafc"
  off-air-muted: "#64748b"
  live-signal-green: "#22c55e"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.9rem, 6.8vw, 6.4rem)"
    fontWeight: 300
    lineHeight: 0.95
    letterSpacing: "-0.014em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 4.8vw, 4.2rem)"
    fontWeight: 300
    lineHeight: 0.96
    letterSpacing: "-0.005em"
  title:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.6rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.28em"
  caption:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.22em"
rounded:
  card: "16px"
  bento: "18px"
  chip: "10px"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.85rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  section: "6rem"
components:
  button-glow:
    backgroundColor: "{colors.tela-violet}"
    textColor: "{colors.studio-light}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 2rem"
  button-glow-hover:
    backgroundColor: "{colors.monitor-violet}"
    textColor: "{colors.studio-light}"
  button-outline:
    backgroundColor: "{colors.glass-veil}"
    textColor: "{colors.studio-light}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.875rem 2rem"
  button-outline-hover:
    backgroundColor: "#a855f70f"
    textColor: "{colors.monitor-violet}"
  cta-edit:
    backgroundColor: "transparent"
    textColor: "{colors.studio-light}"
    typography: "{typography.label}"
    rounded: "0"
    padding: "0 0 0.5rem 0"
  glass-card:
    backgroundColor: "{colors.glass-veil}"
    textColor: "{colors.studio-light}"
    rounded: "{rounded.card}"
    padding: "1.75rem"
  tech-chip:
    backgroundColor: "#a855f717"
    textColor: "{colors.monitor-violet}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0.38rem 0.85rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.off-air-muted}"
    typography: "{typography.body}"
    rounded: "0"
    padding: "0"
  nav-link-hover:
    textColor: "{colors.studio-light}"
---

# Design System: M2W AI Solutions

## 1. Overview

**Creative North Star: "Trailer de A24 vendendo IA"**

A landing M2W é uma peça cinematográfica de captação. Vídeo full-bleed sustenta o hero; sobre ele, tipografia editorial em Cormorant Garamond italic 300 desce sem pedir licença, como overlay de trailer. Metadados técnicos vivem em JetBrains Mono all-caps com tracking de 0.22–0.28em — assinatura de masthead de revista cruzada com cabeçalho de console. O fundo é noite profunda (`#06060e`), e violeta-magenta-ciano operam como luz de monitor refletida no escuro, nunca como decoração de fundo. A página não é institucional, não é tech-SaaS, não é portfólio passivo: é máquina de captação que se comporta como produto-arte.

Este sistema rejeita explicitamente o que PRODUCT.md marca como tóxico: agência digital BR genérica de Pinheiros (mockup de iPhone flutuante, hero "transformamos negócios"), AI-slop saturado (hero-metric template, grid de cards idênticos com ícone+heading), SaaS gringa cream-light, e qualquer urgência manufaturada. A urgência aqui vem da matemática (R$5k vs R$50k, 48h vs 6 semanas) e do peso visual do hero, não de pop-up nem countdown.

A escolha de Cormorant Garamond + DM Sans aparece em listas de "reflexo de IA" — aqui são identidade já comprometida, não greenfield. Variantes futuras na mesma página preservam; redesign greenfield (uma campanha nova, um spin-off) parte do zero e considera trocar.

**Key Characteristics:**
- Tela cinemática escura: `#06060e` como canvas, vídeo como protagonista
- Tipografia bipolar: serif italic 300 (emoção) + mono tracked all-caps (autoridade técnica)
- Acentos em gradiente violeta→magenta→ciano usados como **luz**, nunca como **fundo**
- Glass-and-glow como afordância de hover/destaque — não como wallpaper
- Composição editorial bottom-left, não centered-stack

## 2. Colors: A Paleta de Sala-Escura

A paleta vive numa sala de edição às 3h: pretos profundos absorvem o vídeo, violetas de monitor brilham nos acentos, magenta de luz de palco aparece em pontos cirúrgicos, ciano de preview-monitor sinaliza algoritmo. Verde aparece exclusivamente como pulso "LIVE" — semáfaro de transmissão, nada mais.

### Primary
- **Tela Violet** (`#7c3aed`): violeta forte usado em CTAs principais (`btn-glow`), highlights de "in-stage" cards, glow halo de hover.
- **Monitor Violet** (`#8b5cf6`): meio do gradiente principal e cor de hover/link. Reflexo de monitor — onde a cor "respira".

### Secondary
- **Carnival Magenta** (`#d946ef`): topo do gradiente. Ponto mais quente da paleta — usado em headlines com `grd-t`, em badges de plano premium, e no glow de elementos featured. Carrega o tom brasileiro (sem cair em verde-amarelo).
- **Algorithm Cyan** (`#22d3ee`): base fria do gradiente, usada em micro-acentos técnicos (stack-tags, sinais de processamento). Equilibra o magenta, evita que a paleta vire "totalmente quente".

### Tertiary
- **Live Signal Green** (`#22c55e`): exclusivo do indicador "LIVE" do masthead. Não usar em mais lugar nenhum. É semáfaro, não palette.

### Neutral
- **Deep Render Black** (`#06060e`): canvas absoluto. Body background, base do hero, fundo de seções. Tintado para `oklch(0% 0.005 270)` aproximado, nunca `#000` puro.
- **Studio Surface** (`#0b0b18`): primeira camada acima do canvas. Raramente usado isolado — aparece em transitions e fundos de seções escuras com gradiente.
- **Monitor Surface Raised** (`#0e0e1f`): segunda camada. Fundo de cards de portfólio (bento), placeholders.
- **Glass Veil** (`rgba(255,255,255,0.04)`): superfície de cards `.glass`. Permite o vídeo/canvas atrás passar por backdrop-blur.
- **Glass Border** (`rgba(255,255,255,0.08)`): única borda neutra do sistema. Usada em cards, divisores e nav scrolled state.
- **Studio Light** (`#f8fafc`): cor de texto principal. Não usar `#fff` puro — sempre tintado.
- **Off-Air Muted** (`#64748b`): texto secundário, captions, nav-links em estado default, valores antigos riscados.

### Named Rules

**The Color-as-Light Rule.** Violeta, magenta e ciano se comportam como **luz** sobre o escuro, nunca como **superfície**. Nada de bloco grande violeta como fundo de seção. Eles aparecem em: gradient text (com parcimônia, ver Don'ts), bordas glow de hover, halos de CTA, micro-pontos de detalhe. Se você está pintando uma área `>10%` da viewport com violeta sólido, parou de ser M2W.

**The Gradient Restraint Rule.** O gradient `#d946ef → #8b5cf6 → #22d3ee` é assinatura — mas só sobre `btn-glow`, em underlines de hover, e em `grd-t` para no máximo **uma headline curta por seção**. Múltiplas headlines em gradient na mesma fold = AI-slop. A regra dos absolute bans contra "gradient text" se aplica: trate como exceção honrada, não como hábito.

**The LIVE Green Rule.** `#22c55e` existe **apenas** no `mh-dot` do masthead e em qualquer outro indicador de transmissão real-time futuro. Nunca em CTAs, nunca em ícones de "sucesso", nunca em texto. É a única cor com escopo de uso de uma linha.

## 3. Typography

**Display Font:** Cormorant Garamond (fallback Georgia, serif)
**Body Font:** DM Sans (fallback system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (fallback monospace)

**Character:** Tensão deliberada entre serif italic 300 — vulnerável, emocional, quase cursiva — e mono uppercase track-heavy — autoridade técnica, console, broadcast. Display nunca aparece em weight 400+ ou roman. Mono nunca aparece sem tracking ≥0.2em e uppercase. Body em DM Sans é o trabalhador silencioso entre os dois.

### Hierarchy

- **Display** (Cormorant Garamond italic 300, `clamp(2.9rem, 6.8vw, 6.4rem)`, line-height 0.95, letter-spacing −0.014em): exclusivo do hero headline. Tight, italic, com `em` em white solid drop-shadow pesado pra legibilidade sobre vídeo.
- **Headline** (Cormorant Garamond italic 300, `clamp(2.5rem, 4.8vw, 4.2rem)`, line-height 0.96): títulos de seção (`.sec-ttl`). Também usado em portfolio bento (`.pb-name`, 2.15rem) e quotes de testimonial (`.tst-quote`, 1.35rem).
- **Title** (DM Sans 700, 1.15rem): título de service card, label de plano. Quando a hierarquia exige sans-serif por densidade de informação.
- **Body** (DM Sans 400, 1rem, line-height 1.85): copy descritivo, max-width ~520px no hero subtitle, ~65–75ch fora dele.
- **Label** (JetBrains Mono 500, 0.6rem, letter-spacing 0.28em, UPPERCASE): kickers acima de seções (`.lbl`), masthead, hero credits, nav-links de menu, CTA-edit, métricas em portfolio. **Esta é a voz "técnica" da marca.**
- **Caption** (JetBrains Mono 500, 0.5rem, letter-spacing 0.22em, UPPERCASE): legendas em portfólio (`.pb-tag`, `.pb-niche`, `.pb-stat-l`), tst-role. Menor escala possível — assinatura de metadata.

### Named Rules

**The Italic-300 Rule.** Cormorant Garamond **só** aparece em italic, weight 300 ou 400 italic. Roman e weights ≥500 estão fora do sistema. Italic é a voz emocional — se virar roman, perde identidade e cai no display-serif genérico.

**The Mono-Tracking Rule.** JetBrains Mono **sempre** com `letter-spacing ≥0.2em` e `text-transform: uppercase`. Mono em sentence case ou tight tracking lê como código fora de contexto — quebra o registro de "metadata broadcast" e cai no aesthetic-lane saturado de "tech-bro dev tools".

**The One Voice Per Block Rule.** Display (italic serif), Label (mono tracked) e Body (DM Sans) podem coexistir em um bloco — mas no máximo dois deles em uma linha visual. Três fontes empilhadas verticalmente = ruído. Padrão: Label-kicker no topo + Display headline + Body subtitle. Mono não aparece dentro de copy corrido.

## 4. Elevation

Sistema **camadas-luminosas, não sombras-pesadas**. Profundidade vem de três técnicas combinadas: backdrop-blur (glass), glow colorido (sombras radiais violeta vazadas) e tonal layering escuro (deep → surface → surface raised). Sombras pretas opacas tradicionais (`0 4px 8px rgba(0,0,0,0.1)`) **não existem aqui** — quebram a estética cinemática-luminosa.

Glass-and-glow é assinatura, **mas tratada com parcimônia** (decisão explícita): glass aparece onde precisa de legibilidade sobre vídeo ou em cards com hover-state; glow aparece em featured/hover/active, não como decoração de fundo.

### Shadow Vocabulary

- **Glow Small** (`box-shadow: 0 0 20px rgba(139,92,246,.22)`): halo sutil. Hover state de `.glass-h` cards, default de `.svc-card.hi`.
- **Glow Medium** (`box-shadow: 0 0 40px rgba(139,92,246,.32)`): destaque. Reservado para componentes featured.
- **Glow Large** (`box-shadow: 0 0 80px rgba(139,92,246,.42)`): hero-tier emphasis. Usado raramente.
- **CTA Glow** (`box-shadow: 0 0 30px rgba(168,85,247,.4)` → hover `0 0 50px rgba(168,85,247,.6)`): exclusivo de `.btn-glow`. Lê como halo de néon de palco.
- **Headline Shadow** (`text-shadow: 0 4px 28px rgba(0,0,0,.85), 0 1px 2px rgba(0,0,0,.7)`): legibilidade de texto sobre vídeo. Aplica em hero-hl, hero-sub, hero-live, masthead. **Não decorativo — funcional.**

### Named Rules

**The Glass-with-Purpose Rule.** `backdrop-filter: blur(20px) saturate(160%)` aplica-se a um card **somente** quando ele precisa coexistir sobre vídeo/imagem viva ou quando é uma superfície interativa com hover. Glass como wallpaper em seções com background sólido escuro = decorativo, fora do sistema.

**The Glow-as-State Rule.** Glow violeta aparece em três contextos: (1) default em CTAs primários, (2) hover em cards com `.glass-h`, (3) marcador de "featured" em planos/services com `.hi`. Glow em elemento estático sem função semântica = ruído.

**The No-Black-Shadow Rule.** Sombras pretas tradicionais (`rgba(0,0,0,n)` com blur < 20px e offset > 0) estão proibidas em surfaces. Único uso permitido: `text-shadow` funcional para legibilidade sobre vídeo no hero.

## 5. Components

### Buttons

#### Primary CTA (`.btn-glow`)
- **Shape:** pill total (radius 999px).
- **Color:** fundo gradient violeta→magenta→ciano (`var(--grd)`), texto `#fff`, glow violeta default e intenso no hover.
- **Padding:** 0.875rem 2rem. Font DM Sans 700 0.875rem.
- **Hover:** opacity 0.87, `translateY(-2px)`, glow box-shadow expande de 30px→50px.
- **Quando usar:** ação principal de conversão. Máximo um por fold.

#### Outline CTA (`.btn-out`)
- **Shape:** pill total (radius 999px).
- **Color:** fundo `rgba(255,255,255,.05)`, texto Studio Light, border `glass-border`.
- **Hover:** border vira `rgba(168,85,247,.5)`, texto vira Monitor Violet, fundo tinge violeta `0.06`.
- **Quando usar:** ação secundária ao lado de `.btn-glow`. Não usar isolado como CTA principal.

#### Editorial Link CTA (`.cta-edit`)
- **Shape:** sem radius, underline 1px na borda inferior.
- **Color:** texto Studio Light, mono uppercase tracked 0.22em, com `→` que translada 5px no hover.
- **Quando usar:** CTA de seção/portfolio quando o tom precisa ser editorial e quieto. Substitui pill CTA em sub-actions.

### Chips & Tags

#### Tech Chip (`.tech-chip`, `.p-chip`)
- **Style:** pill (radius 999px), fundo `rgba(168,85,247,.09)`, border `rgba(168,85,247,.25)`, texto Monitor Violet.
- **Typography:** DM Sans 600 0.62rem, letter-spacing 0.12em, uppercase.
- **Padding:** 0.38rem 0.85rem.
- **Quando usar:** marcação de stack técnica ("ComfyUI", "LTX-2.3"), chip de plano. Tinge violeta sem virar CTA.

### Cards / Containers

#### Glass Card (`.glass`, `.glass-h`)
- **Corner:** 16px (radius `--r`).
- **Background:** `glass-veil` (`rgba(255,255,255,0.04)`) com backdrop-filter `blur(20px) saturate(160%)`.
- **Border:** `glass-border` 1px.
- **Shadow Strategy:** none default; `.glass-h` ganha glow-small no hover + border vira `rgba(168,85,247,.35)`.
- **Internal Padding:** 1.75rem padrão, 2rem em service/pricing cards.
- **Quando usar:** containers que coexistem sobre vídeo/canvas vivo, ou que precisam de hover-state interativo.

#### Bento Portfolio Card (`.pb-card`)
- **Corner:** 18px (`rounded.bento`). Único radius diferente do sistema — assinatura da grid bento.
- **Background:** Monitor Surface Raised `#0e0e1f`, vídeo fill `object-fit: cover` como mídia.
- **Overlay stack:** halftone radial (4px grid, opacity 0.14, mix-blend multiply) + bottom-to-top dark gradient (`rgba(5,5,8,.97)` → transparent) + hover reveal pill em fundo `rgba(5,5,8,.18)`.
- **Info bottom:** mono tag kicker → Cormorant 2.15rem italic name → mono niche → stats bar com Cormorant numbers + mono labels.
- **Hover:** card translateY(-5px), border vira violeta-translúcido, vídeo escala 1.08 com `filter: brightness(1.05) saturate(1.1)`, pill branco aparece no centro com glow gradient atrás.

#### Plain Bordered Card (`.tst-card`)
- **Corner:** sem radius (square — assinatura editorial).
- **Background:** `rgba(255,255,255,.02)`, border `rgba(255,255,255,.1)`.
- **Hover:** border `rgba(255,255,255,.22)`, fundo `rgba(255,255,255,.04)`.
- **Quando usar:** testimonial cards e similar — tom mais editorial, sem glass.

### Inputs

(Não há um sistema canônico de inputs definido no index.html atual. CTAs externos via WhatsApp/email substituem formulários. Quando inputs forem necessários: assumir DM Sans 0.875rem, fundo `glass-veil`, border `glass-border` 1px, radius 12px, focus border vira `monitor-violet` com glow-small.)

### Navigation

- **Style:** fixed-top, `padding: 0.85rem 2.5rem` default, comprime para 0.6rem no scrolled state com fundo `rgba(5,5,8,.9)` + backdrop-blur 20px + border-bottom `glass-border`.
- **Logo:** PNG 68px height, com `drop-shadow(0 2px 12px rgba(0,0,0,.5))`. Hover: opacity 0.75.
- **Links:** DM Sans 500 0.8rem, default `off-air-muted`, hover `studio-light`. Gap 2rem. Hidden em ≤768px.

### Signature Components

#### Magazine Masthead (`.masthead`)
- Mono uppercase 0.58rem tracking 0.28em centered, com `.mh-dot` pulsando em Live Signal Green.
- Posiciona acima do hero como assinatura de revista cinemática. Marca da identidade — não substituir por nav padrão.

#### Hero Cinematic Vignette Stack (`.hero-cin`)
- Múltiplos overlays absolute-positioned sobre vídeo: tint (multiply), bottom dark gradient (95% → 0%), top dark gradient mais leve, left dark gradient (legibilidade do hero-panel), grain SVG (opacity 0.04, mix-blend overlay).
- Não decorativo — cada layer existe pra legibilidade ou mood específico.

#### Credits Marquee (`.hero-credits`)
- Strip horizontal de mono uppercase 0.55rem tracking 0.25em scrollando infinitamente (28s linear), com mask gradient nas bordas e pause no hover. Reforça assinatura de "trailer de cinema".

## 6. Do's and Don'ts

### Do:
- **Do** usar Cormorant Garamond **só** em italic weight 300 (ou 400 italic). Roman é regressão imediata.
- **Do** envolver headlines de hero sobre vídeo com `text-shadow: 0 4px 28px rgba(0,0,0,.85), 0 1px 2px rgba(0,0,0,.7)` — legibilidade não é opcional.
- **Do** tratar a paleta violeta-magenta-ciano como **luz refletida**, não superfície. Block de violeta `>10%` da viewport = parou de ser M2W.
- **Do** usar masthead mono uppercase tracked como assinatura de seção/página — só `.lbl` em DM Sans é aceitável como label alternativo.
- **Do** respeitar `prefers-reduced-motion: reduce` em todos os keyframes do hero (videoDrift, pls, credMarq) — desligar autoplay de vídeo, pausar marquee, remover scale animation. PRODUCT.md trata como requisito, não nice-to-have.
- **Do** preservar a composição editorial bottom-left no hero. Centered-stack com icon-title-subtitle é template SaaS.
- **Do** manter contraste WCAG AA mínimo em CTAs e copy sobre fundo escuro. Studio Light sobre Deep Render Black passa; cinza médio sobre `surface-raised` precisa ser checado.

### Don't:
- **Don't** expandir `grd-t` (gradient text) para mais de uma headline curta por seção. Múltiplas headlines em gradient = AI-slop SaaS. Os absolute bans contra "gradient text" se aplicam — trate como exceção honrada.
- **Don't** aplicar `.glass` como wallpaper em seções com fundo sólido escuro. Glass é afordância de legibilidade sobre mídia ou estado interativo. Glass decorativo é o glassmorphism banido.
- **Don't** introduzir sombras pretas tradicionais (`0 4px 8px rgba(0,0,0,0.1)`) em superfícies. Quebra a doutrina "camadas luminosas". Único uso permitido: text-shadow funcional sobre vídeo.
- **Don't** usar `#000` ou `#fff` puros. Sempre tintar para o sistema (Deep Render Black `#06060e`, Studio Light `#f8fafc`).
- **Don't** desenhar grids de cards idênticos com ícone+heading+texto. PRODUCT.md trata como anti-reference AI-slop. Quando precisar de listas, varie: bento grids assimétricas, cards com numeração editorial gigante (`.p-num` em gradient), comparison tables.
- **Don't** desenhar hero-metric template (número gigante + label + 3 stats). M2W usa `.hero-stats-row` com 3 valores em Cormorant italic stacked com label mono — esse é o padrão; não cair no template SaaS de "10x growth ↑ 87% conversion".
- **Don't** usar mockup de iPhone flutuante com sombra azul. PRODUCT.md anti-reference: agência BR genérica de Pinheiros.
- **Don't** introduzir bege/cream backgrounds ou serif neutra (Fraunces, Newsreader, Lora). PRODUCT.md anti-reference: SaaS gringa cream-light cliché. Nosso modo é dark cinematográfico, não Notion-template.
- **Don't** adicionar countdown timers de 24h ou "últimas N vagas" popups. PRODUCT.md anti-reference: urgência fake. A urgência aqui é matemática (R$ vs R$, dias vs semanas), não manipulação.
- **Don't** usar `border-left` ou `border-right` >1px como faixa colorida de destaque em cards/alerts. Absolute ban — refazer com border completa ou número em gradient (`.p-num`).
- **Don't** introduzir emojis decorativos em headlines ou CTAs. PRODUCT.md anti-reference: agência de criador PJ. Mono uppercase tracked é o tom técnico, não emoji.
- **Don't** usar mono em sentence case ou sem tracking. Quebra a Mono-Tracking Rule e cai no dev-bro saturado.

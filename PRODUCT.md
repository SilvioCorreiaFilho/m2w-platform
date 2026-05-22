# Product

## Register

brand

## Users

Dois tiers convivem na mesma landing, com expectativas e tickets distintos:

- **PME / empreendedor digital brasileiro** (R$1.990/mês): dono de loja TikTok Shop, infoprodutor, marca em crescimento testando IA pela primeira vez. Chega com curiosidade + ceticismo, precisa enxergar viabilidade (preço, prazo, exemplo concreto) antes de pedir contato.
- **Gerente de marketing de marca média/grande** (R$5k–12k/mês): avalia M2W contra agência tradicional ou contratação de micro-influencer humano. Chega comparando ROI, quer prova técnica, cases mensuráveis e contrato com garantia.

**Expansão**: a marca está se preparando para atender projetos de IA em LATAM, EUA e Europa. Hoje a landing principal é pt-BR, mas decisões estratégicas (copy, naming, estética) não devem trancar a identidade num molde BR-only — deve dar pra escalar pra EN/ES sem refazer a marca.

Contexto de entrada: maioria vem de tráfego pago (Meta/TikTok), busca orgânica por "influencer IA / AI influencer Brasil", ou indicação. Janela de atenção é 5s no hero; decisão de pedir contato acontece entre hero e prova social.

## Product Purpose

M2W AI Solutions vende **influencers digitais de IA** — avatares gerados por IA generativa (LTX-2.3, Higgsfield, ComfyUI) que produzem conteúdo de vídeo indistinguível de humano, escalam 24/7 e custam 90% menos que micro-influencer humano. Funil principal: landing → captura de lead (Brevo CRM) → call de qualificação → contrato com ROI garantido.

A landing existe pra **converter visitante em lead qualificado** com fricção mínima. Sucesso = volume de leads + taxa de qualificação (lead que vira reunião). Não é portfólio passivo, não é institucional — é máquina de captação que precisa parecer caro mas vender acessível.

Futuro próximo: área logada / dashboard pra clientes acompanharem produção, métricas e aprovações. Quando essa área existir, ela é product register (design serve ao workflow); a landing permanece brand register.

## Brand Personality

**Ousada, técnica, brasileira** — com ambição internacional.

- **Ousada**: confronta o status quo do marketing tradicional sem pedir desculpas. Não diz "transformamos seu negócio"; diz "90% mais barato em 48h, garantido em contrato".
- **Técnica**: domina a stack de IA generativa e mostra isso. Cita ComfyUI, LTX-2.3, Higgsfield por nome quando faz sentido. Não esconde a complexidade — ela é a prova.
- **Brasileira**: identidade BR vem da postura (direta, calorosa, irreverente quando cabe), não de clichês visuais (verde-amarelo, samba, "jeitinho"). Brasileira que conquista o mundo, não brasileira que copia gringo.

Tom: confiante, específica, cinematográfica. Sem hype vazio ("revolucionário", "disruptivo"), sem urgência manufaturada (countdown falso), sem hedge ("pode ajudar a", "talvez", "geralmente"). Números primeiro, adjetivo depois.

Emoção alvo nos primeiros 5 segundos: **"caramba, eu preciso disso AGORA"** — urgência que vem de matemática (economia, velocidade, ROI) e não de pressão artificial.

## Anti-references

Match-and-refuse. Se o design começar a se parecer com isto, refazer:

- **Agência digital BR genérica de Pinheiros/Vila Olímpia**: mockup de iPhone flutuante com sombra azul, hero "transformamos negócios em experiências digitais", grid de logos de cliente em cinza claro, ícones outline genéricos do Lucide sem personalidade.
- **AI-slop saturado**: gradiente roxo-azul-rosa de SaaS, hero-metric template (número gigante + label + 3 stats abaixo), grid de cards idênticos com ícone+título+texto, glassmorphism decorativo, "AI-powered" como adjetivo em todo título.
- **SaaS gringa cream-light cliché**: bege quente + serif neutra + ilustração isométrica de gente diversa apontando pra laptop. Atendimento bonito de Notion-template não vende IA agressivamente.
- **Urgência fake**: countdown timer de 24h que reseta, "últimas 3 vagas", popup de "alguém de SP acabou de comprar". M2W vende com matemática, não com manipulação barata.
- **Agência de criador de conteúdo PJ**: paleta neon + emoji em tudo + tom "fala galera". Provocação tem hora; landing comercial não é stories.

## Design Principles

1. **Cinematográfico, não decorativo.** Vídeo e motion são protagonistas (hero, transições entre seções), mas precisos como Apple keynote ou trailer A24 — não loops de stock footage. Cada movimento existe pra mostrar resultado ou conduzir o olho, nunca pra "ter animação".
2. **Prova técnica visível, sem feira de logos.** A stack (ComfyUI, LTX-2.3, Higgsfield, Worker Cloudflare, Brevo) é diferencial competitivo — exibida com confiança, não escondida atrás de "tecnologia proprietária". Mas integrada na copy, não como wall-of-logos passivo.
3. **Urgência por economia, não por desespero.** O "preciso agora" vem da conta (R$5k de IA vs R$50k de influencer humano + 48h vs 6 semanas), não de contador falso. Números reais, contratos reais, garantia em contrato — a urgência se sustenta porque a oferta se sustenta.
4. **Dois tiers, uma estética.** PME e enterprise leem a mesma página. Resolução: sofisticação visual constante (não dá pra "embaratecer" pra PME), mas a escada de oferta é clara (R$1.990 acessível na entrada, R$12.990 enterprise no topo), e cada tier tem CTA dedicado. Nunca fragmentar a marca em duas estéticas.
5. **BR confiante que escala pra LATAM/EUA/EU.** Identidade brasileira vem da postura (direta, calorosa, irreverente), não de elementos visuais que travariam tradução cultural. Estrutura, layout, paleta e sistema tipográfico devem aceitar copy EN/ES sem reformatar.

## Accessibility & Inclusion

- **Idioma**: pt-BR é o principal hoje; arquitetura deve aceitar EN/ES sem refazer (i18n-ready, não i18n-implementado-já).
- **Reduced-motion crítico**: hero usa vídeo + motion pesado. `prefers-reduced-motion: reduce` deve desligar autoplay de vídeo, parallax, transições agressivas — substituindo por estado estático equivalente (poster do vídeo, transições fade simples). Não é nice-to-have; é requisito.
- **Contraste WCAG AA mínimo** em texto sobre fundo escuro do hero e em CTAs principais. Não buscando AAA, mas zero falha óbvia.
- **Alt texts honestos** em portfólio e prova social (descrição do conteúdo, não keyword stuffing).
- **Telefone/WhatsApp clicáveis** em mobile (já está com `format-detection: no` no head — verificar se CTAs continuam tap-friendly).

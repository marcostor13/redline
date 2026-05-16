# Plan de Implementación — Redline Installers LLC

**Cliente:** Redline Installers LLC (Chicago, IL — servicio nacional)
**Tipo de proyecto:** Rediseño web + SEO + Lead Generation
**Idioma del sitio:** Inglés (US English)
**Mercado objetivo:** Warehouses, distribution centers, manufacturing — Illinois, Midwest y nacional
**Preparado por:** Ignia (Tecdidata SAC)

---

## 1. Lectura del briefing (lo que realmente está pidiendo)

El cliente está pidiendo tres cosas que conviene separar para no mezclarlas:

1. **Reposicionamiento de marca**: dejar de verse como "general contractor" y verse como *Warehouse & Material Handling Specialists*. Esto es un trabajo de **mensaje, no solo de diseño**.
2. **Sitio web nuevo** moderno, industrial, mobile-first, con páginas dedicadas por servicio.
3. **SEO + Lead Generation**: el sitio tiene que rankear para keywords específicos (Illinois, Midwest, nationwide) y generar cotizaciones.

El éxito del proyecto **no** se mide en que el sitio "se vea bonito". Se mide en:
- Posiciones en Google para las keywords listadas en el punto 7 del briefing.
- Cantidad de "Request a Quote" enviados por mes.
- Llamadas al 630-363-7251 desde el sitio (trackeables).

Todo el plan está construido alrededor de esas tres métricas.

---

## 2. Stack tecnológico recomendado

### Decisión principal: **Astro 5 + Tailwind CSS 4 + TypeScript**

**Por qué Astro y no otra cosa:**

| Necesidad del proyecto | Por qué Astro la resuelve mejor |
|---|---|
| **SEO técnico impecable** (Google ranking) | SSG por default → HTML estático puro, server-rendered, sin hidratación innecesaria. Lighthouse 95–100 sin esfuerzo. |
| **Performance en mobile** (clientes industriales abren desde el celular en el warehouse) | "Zero JS by default" — solo se hidrata lo que necesita JS (formulario). El resto es HTML/CSS plano. |
| **7 páginas de servicios + páginas estáticas** | Content collections de Astro permiten escribir cada servicio en `.mdx` con frontmatter (title, slug, schema). Escalable cuando agreguen más servicios. |
| **Que el cliente pueda editar texto sin desarrollador** (eventualmente) | Astro acepta cualquier headless CMS (Decap, Sanity, Sveltia) montado encima cuando se necesite. No hay que reescribir nada. |
| **Imágenes optimizadas (las fotos reales que enviará)** | `<Image />` de Astro hace AVIF/WebP, lazy-load, responsive `srcset` automáticamente. Sharp incluido. |
| **Sitemap.xml + robots.txt automáticos** | `@astrojs/sitemap` lo genera en build. Cero mantenimiento. |
| **Schema.org / JSON-LD para LocalBusiness** | Componente Astro que inyecta JSON-LD por página. Crítico para que Google muestre rich results. |

**Por qué NO Next.js / Nuxt / WordPress:**

- **Next.js**: overkill para un sitio de marketing de ~15 páginas. Hidrata React en todo, peor performance baseline, más bundle, más complejidad de deploy. Justificable si hubiera dashboard, auth, o portal de cliente. Acá no.
- **WordPress**: lo "fácil" se paga en velocidad (Core Web Vitals malos por default), seguridad (parches constantes), y costos de hosting decente. El cliente perdería el diferencial de SEO técnico que es justamente lo que está pidiendo.
- **HTML/CSS plano**: rompería el mantenimiento futuro (cada cambio = editar 7 archivos a mano).

### Stack completo

```
Frontend / SSG       Astro 5
Styling              Tailwind CSS 4 + clases industriales custom
Lenguaje             TypeScript (strict)
Componentes UI       Astro components nativos (.astro)
Islands interactivas Preact (más liviano que React) — solo para el form
Contenido            Content Collections (.mdx) para servicios + páginas
Imágenes             astro:assets + Sharp (AVIF/WebP automáticos)
Iconos               astro-icon + iconos de Lucide (set industrial limpio)
Tipografía           Inter (UI) + Bebas Neue o Oswald (titulares industriales)
Formulario           Astro form action → Resend API (o Formspree como fallback)
Email transaccional  Resend (3K emails/mes gratis, dominio propio)
Anti-spam            Cloudflare Turnstile (invisible, mejor que reCAPTCHA)
Analytics            Google Analytics 4 + Google Search Console
Call tracking        CallRail (opcional, fase 2) o número con UTM en tel:
Hosting              Cloudflare Pages (gratis, CDN global, edge) o Vercel
DNS                  Cloudflare (gestión + Turnstile + Email Routing)
Repositorio          GitHub (privado)
CI/CD                GitHub Actions → Cloudflare Pages (auto-deploy en push)
```

### Email profesional (responde a la pregunta del briefing punto 8)

**Sí, pueden tener `jk@redlineinstallers.com`.** Opciones por orden de costo:

1. **Cloudflare Email Routing** (gratis) — recibe correos en `jk@redlineinstallers.com` y los reenvía a un Gmail/Outlook personal. Para *enviar* desde esa dirección necesitan paso 2 o 3.
2. **Google Workspace** ($6 USD/usuario/mes) — recomendado. Gmail con dominio propio, calendario, Drive. Lo que esperaría una empresa B2B.
3. **Zoho Mail Lite** ($1 USD/usuario/mes) — alternativa más barata si están cuidando costos.

**Recomendación:** Google Workspace. El cliente B2B industrial espera ver `jk@redlineinstallers.com` en una firma con Gmail empresarial — da confianza.

---

## 3. Arquitectura del sitio

### Estructura de páginas

```
/                                    Homepage
/services/                           Hub de servicios (lista las 7)
  /services/pallet-rack-installation/
  /services/warehouse-relocation/
  /services/rack-repair-modifications/
  /services/mezzanine-installation/
  /services/conveyor-systems/
  /services/tear-down-reinstallation/
  /services/material-handling-systems/
/industries/                         Hub de industrias servidas
  /industries/warehousing/
  /industries/distribution-centers/
  /industries/manufacturing/
  /industries/logistics/
  /industries/industrial-storage/
  /industries/food-distribution/
/about/                              Historia + John Korabik + 34 años
/service-area/                       Illinois, Midwest, Nationwide (SEO local)
/contact/                            Form + dirección + teléfono + email
/quote/                              Formulario extendido "Request a Quote"
/privacy/                            Privacy policy
/terms/                              Terms of service
/sitemap.xml                         Auto-generado
/robots.txt                          Auto-generado
```

**Total: ~20 páginas indexables.** Cada página de servicio e industria es una landing optimizada para 1–2 keywords específicos.

### Estructura del repositorio

```
redline-installers/
├── src/
│   ├── pages/                       # Routing file-based de Astro
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── quote.astro
│   │   ├── service-area.astro
│   │   ├── services/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro         # Dinámico desde content collection
│   │   └── industries/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── content/
│   │   ├── services/                # .mdx, uno por servicio
│   │   └── industries/              # .mdx, uno por industria
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── ServiceCard.astro
│   │   ├── WhyChooseUs.astro
│   │   ├── CTASection.astro
│   │   ├── ContactForm.tsx          # Island Preact
│   │   ├── SEO.astro
│   │   └── JsonLd.astro             # Schema.org LocalBusiness
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── styles/
│   │   └── global.css
│   └── assets/
│       └── images/                  # Optimizadas por astro:assets
├── public/
│   ├── favicon.svg
│   ├── og-default.jpg
│   └── robots.txt
├── astro.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Sistema de diseño (industrial moderno)

### Paleta de colores

```css
/* Acero / industrial base */
--steel-950: #0A0E13   /* casi negro, fondos hero */
--steel-900: #11161D   /* fondos secundarios oscuros */
--steel-800: #1A2129
--steel-700: #2A323D   /* bordes oscuros */
--steel-500: #5C6773   /* texto secundario sobre claro */
--steel-300: #C2C8D0   /* dividers */
--steel-100: #ECEEF1   /* fondos claros */
--steel-50:  #F7F8F9   /* fondo page */

/* Rojo Redline — accent ÚNICO, no se abusa */
--redline-600: #C8102E   /* CTA principal, logo, accent */
--redline-700: #A00D24   /* hover */
--redline-100: #FDECEF   /* fondo de alertas/badges sutiles */

/* Neutros */
--white:   #FFFFFF
--ink:     #0A0E13       /* texto principal */
```

**Regla de oro:** rojo solo en CTAs primarios, número de teléfono, ícono del logo, y 1–2 accents por sección. Todo lo demás es escala de gris/acero. Esto es lo que da el look industrial sin caer en "general contractor genérico".

### Tipografía

- **Titulares**: `Oswald` (condensada, robusta, industrial) — H1, H2.
- **Cuerpo + UI**: `Inter` (clara, profesional) — todo lo demás.
- **Acento opcional**: `JetBrains Mono` para números (años de experiencia, teléfono).

Ambas en Google Fonts → self-hosted con `@fontsource` para no depender de Google y no afectar Core Web Vitals.

### Componentes clave

- **Hero homepage**: imagen de fondo de warehouse (B/N con tinte acero), título grande Oswald blanco, subtítulo Inter gris claro, dos botones — Request a Quote (rojo sólido) y Call Now `tel:` (outline blanco).
- **Service cards**: grid de 7, cada una con icono industrial outlined, título, descripción de 2 líneas, link "Learn more →".
- **"Why Choose Redline"**: 6 stats en grid con números grandes en rojo + texto.
- **"Industries Served"**: 6 cards con icono representativo de cada industria.
- **Footer industrial**: oscuro (`steel-950`), 4 columnas (servicios, industrias, contacto, legal), logo grande, social links si los tienen.

### Mobile-first

Tailwind breakpoints default. Probar específicamente en:
- 360px (Android base)
- 390px (iPhone 14/15)
- 768px (tablet)
- 1280px+ (desktop)

CTA "Call Now" debe ser un **sticky bottom bar en mobile** (botón fijo con teléfono) — los clientes industriales prefieren llamar antes que llenar formularios.

---

## 5. Plan de contenido por página

### 5.1 Homepage (`/`)

Estructura vertical:

1. **Hero**: H1 = *"Professional Warehouse & Pallet Rack Installation Specialists"*. Subtítulo del briefing. 2 CTAs.
2. **Trust bar**: "34+ Years Experience · Nationwide Service · Fully Insured · Safety-First Operations"
3. **Services preview**: grid de las 7 services con links a páginas dedicadas.
4. **Why Choose Redline Installers?**: los 6 bullets del briefing punto 5, como stats.
5. **Industries Served**: 6 cards.
6. **Service Area**: mapa simple de EE.UU. resaltando Illinois + Midwest + texto "Travel projects welcome — nationwide service available".
7. **CTA final**: bloque oscuro con "Ready to install? Request a free quote today." + form corto inline (name, email, phone, project type).
8. **Footer**.

### 5.2 Páginas de servicio (template)

Cada una de las 7 sigue la misma estructura para consistencia + SEO:

1. Hero con título del servicio + foto real de ese servicio.
2. Descripción larga (300–500 palabras, keywords integradas).
3. Sub-servicios / qué incluye (bullets).
4. "Industries we serve with this service" (cross-link a industries).
5. "Why Redline for [servicio]" (3 razones específicas).
6. CTA: Request a Quote / Call Now.
7. FAQ del servicio (3–5 preguntas → Schema.org FAQ → rich results en Google).

### 5.3 About (`/about`)

Texto basado en briefing punto 9:

- Hero: "34+ Years Building America's Warehouses"
- Sección John Korabik: founder, 35 años como installer, foto si tienen.
- Sección Company: cuándo se fundó Redline Installers LLC, qué los diferencia.
- Safety & Quality commitment.
- Crews & coverage.
- CTA final.

### 5.4 Contact (`/contact`)

- **Dirección única** (la nueva, briefing punto 8): 980 N Michigan Ave Ste 1090 PMB 357073, Chicago, IL 60611-4521.
- **NO incluir Bolingbrook** (el briefing es explícito).
- Teléfono clicable: `tel:+16303637251`
- Email: `jk@redlineinstallers.com`
- Contact form (name, company, email, phone, project type, message).
- Google Maps embed apuntando a la dirección de Chicago.
- Service hours.

### 5.5 Service Area (`/service-area`) — página SEO crítica

Esta página existe solo para SEO local + nacional:
- H1: *"Pallet Rack Installation & Warehouse Solutions — Illinois, Midwest & Nationwide"*
- Listar estados servidos con secciones por estado (al menos IL, IN, WI, MI, OH, IA, MO).
- Mención explícita: "Travel projects welcome across all 50 states."
- Schema.org `Service` con `areaServed` = US + estados.

---

## 6. SEO Strategy

### 6.1 Keywords objetivo (del briefing punto 7)

| Keyword | Página objetivo | Prioridad |
|---|---|---|
| pallet rack installation illinois | /services/pallet-rack-installation/ | Alta |
| warehouse installation company | / (homepage) | Alta |
| industrial shelving installers | /services/pallet-rack-installation/ | Media |
| material handling installation | /services/material-handling-systems/ | Alta |
| warehouse relocation services | /services/warehouse-relocation/ | Alta |
| rack repair specialists | /services/rack-repair-modifications/ | Alta |
| pallet rack installation midwest | /service-area/ | Alta |
| nationwide pallet rack installation | /service-area/ | Media |

### 6.2 SEO técnico (todo automatizado por Astro)

- ✅ HTML semántico (Astro fuerza buen markup).
- ✅ Meta tags por página (`<SEO />` component reutilizable: title, description, canonical, OG, Twitter card).
- ✅ Schema.org JSON-LD:
  - `LocalBusiness` con dirección, teléfono, horario, geo (homepage + contact).
  - `Service` en cada página de servicio (con `provider`, `areaServed`, `serviceType`).
  - `FAQPage` en cada servicio con FAQ.
  - `BreadcrumbList` en páginas internas.
- ✅ Sitemap.xml automático.
- ✅ Robots.txt con `Sitemap:` declarado.
- ✅ URLs limpias (kebab-case, sin query strings).
- ✅ Imágenes con `alt` descriptivo (foto warehouse → "Pallet rack installation in progress at Chicago distribution center").
- ✅ Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms — Astro lo da casi gratis.
- ✅ HTTPS forzado (Cloudflare).
- ✅ HSTS, security headers correctos.

### 6.3 SEO off-page (no es código, pero es parte del proyecto)

Estas son tareas que debe hacer el cliente o se le entregan como recomendación post-launch:

1. **Google Business Profile** (crítico): reclamar/crear ficha con dirección Chicago, teléfono, fotos, servicios, horario. Esto es lo que más mueve la aguja en SEO local.
2. **Bing Places for Business**: replicar.
3. **Citations industriales**: listings en directorios B2B (ThomasNet, MHEDA, Material Handling Network, BBB).
4. **Reviews en Google**: pedirle a clientes existentes 5–10 reviews iniciales.
5. **Backlinks**: contactos con proveedores de racks (Steel King, Interlake Mecalux, Ridg-U-Rak) para que los listen como installer.

Esto se documenta en un **SEO Playbook** aparte que se entrega como deliverable.

---

## 7. Formulario de contacto + Email

### Flujo técnico

```
Usuario llena form  →  Astro action (POST a /api/quote)
                  →  Validación server-side con Zod
                  →  Cloudflare Turnstile verifica no-bot
                  →  Resend API envía 2 emails:
                       1. → jk@redlineinstallers.com (notificación interna)
                       2. → cliente (auto-respuesta "we received your quote")
                  →  Guarda lead en Cloudflare KV o D1 (backup)
                  →  Redirect a /thank-you/
                  →  GA4 event: "quote_submitted"
                  →  (opcional) Notificación a WhatsApp/Slack vía webhook
```

### Campos del form (Request a Quote)

- Name * (text)
- Company * (text)
- Email * (email)
- Phone * (tel)
- Project location (city, state) (text)
- Project type * (select: Pallet Rack Install / Warehouse Relocation / Rack Repair / Mezzanine / Conveyor / Tear Down / Material Handling / Other)
- Project size (select: < 5,000 sq ft / 5K–25K / 25K–100K / 100K+)
- Timeline (select: ASAP / 1–3 months / 3–6 months / Planning phase)
- Tell us about your project * (textarea)
- [Cloudflare Turnstile widget]
- [Submit button]

### Form corto (homepage CTA inline)

Solo: Name, Email, Phone, Project type, Submit. Para reducir fricción.

---

## 8. Hosting, dominio, deployment

### Hosting: Cloudflare Pages

- **Costo:** gratis (tier free cubre 500 builds/mes, ancho de banda ilimitado).
- **Por qué:** CDN global edge, SSL automático, deploy en ~30 seg desde GitHub push, integra con Turnstile y Email Routing nativamente.
- **Alternativa:** Vercel free tier — igualmente bueno, pero Cloudflare es más generoso en BW.

### Dominio

Asumir que `redlineinstallers.com` ya existe. Si no:
- Registrarlo en Cloudflare Registrar (precio at-cost, sin markup).
- DNS en Cloudflare obligatorio para Turnstile + Email Routing.

### CI/CD

```
GitHub repo (main branch)
   ↓ push
GitHub Actions: lint + typecheck + build
   ↓ artifact
Cloudflare Pages: deploy automático
   ↓
https://redlineinstallers.com (preview en PRs)
```

---

## 9. Roadmap por fases

### Fase 0 — Discovery (3 días)

- Entrevista con cliente: confirmar voz/tono, recibir fotos reales (briefing punto 6), validar copy de servicios.
- Recibir logo en alta resolución (si no, rediseño express del logo dentro del scope).
- Acceso a dominio + Google Workspace + Cloudflare.
- Confirmar email a usar (`jk@redlineinstallers.com` o algo más genérico tipo `info@`).

### Fase 1 — Setup + Diseño base (5 días)

- Setup repo Astro + Tailwind + TS.
- Implementar BaseLayout, Header, Footer, sistema de diseño (colores, tipografía, componentes UI).
- Configurar dominio + Cloudflare Pages + GitHub Actions.
- Configurar Google Workspace + Cloudflare Email Routing.
- Schema.org base + SEO component.

**Entregable:** preview URL con homepage placeholder funcional, dominio apuntando, email funcionando.

### Fase 2 — Contenido + Páginas (7 días)

- Homepage completa con copy final + fotos optimizadas.
- 7 páginas de servicios (content collection + template).
- 6 páginas de industries.
- About, Service Area, Contact.
- Schema.org por página.
- Sitemap.xml + robots.txt.

**Entregable:** sitio completo navegable en staging.

### Fase 3 — Formulario + Integraciones (3 días)

- Formulario de Quote con validación + Turnstile + Resend.
- Auto-respuesta al cliente.
- GA4 + Search Console configurados, eventos de conversión.
- Página de Thank You + tracking de conversión.
- Sticky "Call Now" mobile.

**Entregable:** flow de lead probado end-to-end.

### Fase 4 — QA + Launch (3 días)

- Cross-browser testing (Chrome, Safari, Firefox, Edge).
- Cross-device testing (iPhone, Android, tablet, desktop).
- Lighthouse audit por página (objetivo: 95+ en Performance, SEO, Accessibility, Best Practices).
- Validar Schema con Google Rich Results Test.
- Validar sitemap en Search Console.
- 301 redirects desde URLs viejas (si aplica).
- Launch + monitoreo primeras 48h.

**Entregable:** sitio en producción + dashboard de métricas + manual del cliente.

### Fase 5 — Post-launch SEO (recurrente, primeros 90 días)

- Submit sitemap a Search Console + Bing Webmaster.
- Reclamar Google Business Profile.
- Generar citations en 15 directorios B2B clave.
- Reporte mensual: posiciones, tráfico orgánico, conversiones.

---

## 10. Estimación de esfuerzo

**Total de desarrollo:** ~21 días hábiles (3 a 4 semanas con ajustes de cliente).

| Fase | Días | Tipo de trabajo |
|---|---|---|
| Discovery | 3 | Cliente + planning |
| Setup + Diseño base | 5 | Desarrollo |
| Contenido + Páginas | 7 | Desarrollo + copywriting |
| Form + Integraciones | 3 | Desarrollo |
| QA + Launch | 3 | QA |

**Costos recurrentes mensuales del cliente** (no incluye desarrollo):

| Servicio | Costo mensual USD |
|---|---|
| Dominio `.com` | ~$1 (≈$10/año) |
| Google Workspace (1 usuario) | $6 |
| Cloudflare Pages | $0 |
| Cloudflare Turnstile | $0 |
| Resend (3K emails) | $0 |
| Google Analytics 4 | $0 |
| **Total fijo** | **~$7/mes** |

Si quieren CallRail para tracking de llamadas: +$45/mes (opcional, recomendado fase 2).

---

## 11. Riesgos y advertencias honestas

1. **Las fotos reales son críticas.** Sin fotos de proyectos reales, el sitio se va a ver como otro sitio genérico de contratista. Hay que insistirle al cliente que las envíe antes de la Fase 2. Mientras tanto, usar placeholders neutros (no stock photos genéricas con corbata).

2. **El nombre y la dirección PMB.** "PMB 357073" indica una mailbox virtual, no una oficina física. Para Google Business Profile esto puede ser un problema (Google a veces rechaza PMBs para listings físicos). Solución: registrar GBP como **Service Area Business** (sin dirección visible al público), declarando los estados/ciudades servidas. Esto es más correcto para una empresa de instalación que viaja al cliente de todas formas.

3. **John Korabik en About.** El briefing menciona "Joh Korabik trabajó 35 años como installer". Asumo typo (John). Confirmar bio, año de fundación de la LLC, y si quiere foto personal o no.

4. **Bolingbrook removido.** Confirmado por el briefing. Revisar también que no aparezca en metadata de pages viejas, en Google Business Profile, ni en directorios — esa limpieza es parte del Fase 5.

5. **"Travel projects welcome" + nationwide.** Esto es un diferenciador fuerte y debe aparecer en homepage, service area, y schema. Muchos competidores son regionales.

6. **Competencia directa en Chicago/Midwest:** Konstant, Frazier, Steel King installers locales. La estrategia SEO debe enfocarse en long-tail ("pallet rack installation [ciudad] [estado]") más que en "pallet rack installation" genérico, donde es caro competir.

---

## 12. Próximos pasos concretos

Antes de empezar Fase 1, necesito del cliente:

1. ✉️ Las fotos reales (briefing punto 6) — mínimo 15–20 imágenes de proyectos terminados.
2. 🎨 Logo en SVG o PNG alta resolución (mínimo 1024px).
3. 🔑 Acceso o autorización para registrar/transferir el dominio a Cloudflare.
4. 📧 Confirmar email principal (`jk@` vs `info@` vs ambos).
5. ✅ Aprobación del copy de homepage y de los 7 servicios (mando draft).
6. 👤 Bio corta de John Korabik + foto si la quiere incluida.
7. 🏢 Lista de clientes/proyectos representativos (para testimonios o "trusted by" si tiene permiso).
8. 📞 Confirmar si quiere el número 630-363-7251 como único, o agregar un toll-free.

---

**Preparado por Ignia · ignia.site**

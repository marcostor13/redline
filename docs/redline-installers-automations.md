# Redline Installers — Opciones de Automatización

**Anexo al plan principal de implementación**
**Objetivo:** Pasar de sitio informativo → sitio funcional que genera, califica y procesa leads sin intervención manual de John.

---

## 1. Diagnóstico del sitio actual

### Lo que tienen hoy (`redlineinstallers.com`)

- 4 páginas estáticas en Weebly viejo: Home, Services, About, Contact.
- **Cero formularios, cero chat, cero booking, cero automatización.**
- SSL no válido en el servidor (handshake falla) — el sitio actual probablemente no es HTTPS-strict, lo que ya hunde el SEO.
- Categorizado como "Demolition Contractor" en directorios B2B → mensaje incorrecto.
- John Korabik tiene 17 recomendaciones públicas en LinkedIn (Equipment Depot, etc.) que el sitio **no está usando** como prueba social.
- Listing de BuildZoom con licencia inactiva desde 2012 — hay deuda técnica de directorios.

### Por qué automatizar tiene ROI alto en este negocio

El proceso actual de Redline para un nuevo lead se ve así:

```
Cliente busca en Google → encuentra sitio → llama o no llama
   ↓ (si llama)
John contesta el teléfono → conversa → manda email → 
   visita el sitio del cliente → cotiza en Word/Excel → 
   espera respuesta → re-cotiza → cierra
```

**Problemas medibles:**
1. **Filtrado de leads = cero.** John gasta tiempo en llamadas de proyectos de $500 cuando su sweet spot probablemente es $25K+.
2. **Latencia de respuesta.** Cliente B2B que necesita cotización el lunes a las 9am no llega al jueves: se va al competidor.
3. **No hay datos.** ¿Cuántos leads/mes? ¿Cuántos convierten? ¿Qué keyword los trajo? Imposible saber sin instrumentación.
4. **Prueba social desperdiciada.** Tienen 25+ años de proyectos sin un solo case study online.
5. **Dependencia total de John.** Si John está en obra, los leads esperan.

Las 3 opciones de abajo atacan estos puntos por orden de impacto.

---

## OPCIÓN 1 — Smart Quote Engine + Booking Funnel

> **TL;DR:** Cotizador inteligente con wizard de 5 pasos que devuelve rango de precio + agenda site visit + manda PDF preliminar al cliente y a John. Es el upgrade más directo y de mayor ROI.

### Qué es

Un wizard interactivo en `/quote` que reemplaza el "call us para cotizar". El cliente entra, en 3–4 minutos llena un funnel guiado, y recibe:

1. Un **rango estimado de inversión** (no precio cerrado — protege a John y educa al cliente).
2. Opción de **agendar site visit virtual o física** directamente en el calendario de John.
3. **PDF preliminar** con el scope que él armó, branded Redline.
4. Confirmación por email + SMS.

John recibe en paralelo: notificación + lead con scoring automático (Hot/Warm/Cold) según presupuesto declarado, timeline y tamaño.

### Flow del usuario (5 pasos)

```
Step 1 — ¿Qué necesitas?
   [ ] Pallet Rack Installation (new)
   [ ] Warehouse Relocation
   [ ] Rack Repair & Modifications
   [ ] Mezzanine Installation
   [ ] Conveyor System
   [ ] Tear Down & Reinstallation
   [ ] Material Handling System
   [ ] Not sure — recommend me

Step 2 — Tamaño del proyecto
   • Warehouse sq ft: [slider 1K – 500K+]
   • Estimated # of pallet positions / racks: [input]
   • Number of aisles (if known): [input]
   • Single or multi-level (mezzanine)?

Step 3 — Ubicación y timing
   • Project address: [Google Places autocomplete]
   • Timeline:
     ( ) Emergency / ASAP (< 2 weeks)
     ( ) 2–6 weeks
     ( ) 1–3 months
     ( ) Planning phase (3+ months)
   • Operating constraints:
     [ ] Active warehouse — needs night/weekend work
     [ ] Empty warehouse — flexible hours

Step 4 — Detalles técnicos (opcional, suma puntos de scoring)
   • Existing layout drawings?  [upload PDF/DWG/JPG]
   • Photos of current space?   [upload up to 6]
   • Rack supplier already chosen?
     ( ) Yes — [Steel King / Interlake / Ridg-U-Rak / Other]
     ( ) Need recommendation
   • Budget range (helps us match scope):
     ( ) < $10K   ( ) $10–50K   ( ) $50–150K   ( ) $150K+   ( ) Open

Step 5 — Contacto
   • Name, Company, Email, Phone, Role
   • [Cloudflare Turnstile]
   • [ ] I want to schedule a site visit now → muestra calendario inline

→ Submit → Loading 3–5 seg → Pantalla de resultado:
   • Estimated investment range: $XX,XXX – $XX,XXX
   • Estimated timeline: X – Y weeks
   • Next step CTA: "Book a free site assessment" (Cal.com inline)
   • PDF preliminar descargable
   • "John will contact you within 4 business hours"
```

### Stack técnico

| Pieza | Tecnología |
|---|---|
| UI del wizard | Preact island en Astro (state management con nanostores) |
| Validación | Zod schemas compartidos client + server |
| Pricing engine | Función pura en TypeScript con tabla de pricing rules (sq ft × service × travel zone × urgency multiplier) — editable en JSON sin redeploy |
| Address autocomplete | Google Places API (free tier suficiente) |
| Travel cost calc | Distance Matrix API → multiplier por zona |
| File uploads | Cloudflare R2 (storage S3-compatible, gratis hasta 10GB) |
| PDF generation | `@react-pdf/renderer` server-side en Cloudflare Worker |
| Email (cliente + interno) | Resend con templates React Email |
| Booking | Cal.com self-hosted o Cal.com Cloud ($15/mo team plan) |
| CRM / Lead storage | Cloudflare D1 (SQLite serverless, gratis) + dashboard simple en `/admin` |
| Lead scoring | Reglas simples en TS (budget × timeline × size → hot/warm/cold) |
| Notificación a John | Email + SMS (Twilio) + opcional WhatsApp |
| Analytics | GA4 events: `quote_started`, `quote_step_X_completed`, `quote_submitted`, `site_visit_booked` |

### Valor de negocio (concreto)

- **Califica antes de hablar.** John deja de gastar 30 min/llamada con leads de $500. El sistema marca tier por presupuesto declarado.
- **Tiempo de respuesta de horas → segundos.** El cliente B2B obtiene un rango inmediato. Esa expectativa hoy no la cumple ningún competidor en Chicagoland.
- **Captura datos.** Cada lead queda con: keyword de Google que lo trajo (UTMs), tamaño, presupuesto, timeline. En 3 meses Redline sabe qué tipo de proyectos pega su pitch y cuáles no.
- **Conversión típica de quote-wizards en B2B services:** 8–15% de visitantes lo terminan vs 1–2% de un form genérico. Si el sitio empieza con 500 visitas/mes orgánicas, son 40–75 quotes/mes vs los 5–10 actuales estimados.
- **Diferencial publicable.** "Get an instant estimate" en homepage = mensaje rompedor en este rubro.

### Esfuerzo y costo

- **Desarrollo:** 8–12 días hábiles adicionales al plan base.
- **Costo recurrente cliente:**
  - Resend: $0 (3K/mes)
  - Twilio SMS: ~$15–30/mes según volumen
  - Cal.com: $0 self-hosted o $15/mo cloud
  - Google Places API: $0 (free tier 28K calls/mes)
  - Cloudflare R2/D1/Workers: $0–5/mes según volumen
  - **Total: ~$20–50/mes** según volumen real

### Riesgos honestos

1. **El pricing engine necesita data real de John.** No puedo inventar precios. Necesitamos sentarnos 2 horas con él y armar la tabla: "para 10K sq ft, instalación standard, dentro de Chicagoland, sale entre X y Y dólares". Si esa data no se levanta bien, el cotizador da rangos que asustan o subcotizan.
2. **Riesgo de comoditización.** Algunos clientes podrían usar el rango para shoppear contra competidores. Mitigación: el rango es amplio, y el lock-in es la velocidad + el site visit gratis.
3. **Tracking de uploads pesados.** Si el cliente sube CADs de 50MB, hay que limitar a 20MB y converir DWG a preview server-side. Trabajo extra.

---

## OPCIÓN 2 — AI-Powered Rack Inspection Tool

> **TL;DR:** El cliente sube 3–6 fotos de racks dañados, una IA con visión los analiza, clasifica el daño por severidad, sugiere acción y agenda inspección urgente o normal. Lead magnet único en el rubro.

### Qué es

Una herramienta autoservicio en `/tools/rack-inspection` orientada al servicio de **Rack Repair & Modifications**. Cualquier warehouse manager puede sacar fotos con el celular en piso, subirlas, y recibir en 30 segundos un informe automático:

- ¿Es crítico? (puede colapsar) / Moderado / Cosmético
- ¿Qué tipo de daño? (column, beam, brace, footplate, anchor)
- ¿Recomendación? (reemplazo, refuerzo, monitoreo)
- ¿Referencia OSHA/ANSI MH16.1 aplicable?
- ¿Cuánto tiempo seguro tiene antes de necesitar acción?
- **CTA:** "Schedule emergency inspection" o "Get repair quote"

Esto no es solo automatización: es un **lead magnet de SEO brutal**. Rankearía rápido por "rack inspection tool", "damaged rack assessment", "is my pallet rack safe". Nadie en el rubro tiene esto.

### Flow del usuario

```
Landing /tools/rack-inspection
   ↓
"Upload photos of damaged racks — get an AI safety assessment in 30 seconds"
   ↓
[Drag & drop area] — 3 a 6 fotos
   ↓ optional context fields:
   • Approximate beam load
   • When did damage occur?
   • Is the rack currently loaded?
   ↓ Submit
   ↓ (30 seg loading con animación)
   ↓
RESULT PAGE:
   ▸ Por cada foto: thumbnail + análisis individual
     • Damage detected: "Vertical column dent, lower section"
     • Severity: 🔴 CRITICAL (rojo / amarillo / verde)
     • Likely cause: forklift impact
     • Reference: ANSI MH16.1 §6.2 (column damage threshold)
     • Recommendation: Unload immediately, replace column
   ▸ Overall summary:
     • Critical issues: 2
     • Moderate: 1
     • Cosmetic: 1
   ▸ Two CTAs:
     [ Schedule emergency on-site inspection — free ]
     [ Download full PDF report ]
   ▸ Capture lead form to download PDF (name + email + phone + location)

→ PDF generado server-side, marca Redline, con disclaimer legal
→ Lead entra a CRM con flag "rack-inspection" → contact priority alto
```

### Stack técnico

| Pieza | Tecnología |
|---|---|
| UI | Preact island en Astro con uploader (uppy.js o componente custom) |
| Image storage | Cloudflare R2 (signed URLs, expira en 30 días) |
| AI Vision | **Claude Sonnet 4** vía Anthropic API (excelente para análisis técnico estructurado, mejor que GPT-4V en mi experiencia para inspección industrial) |
| Prompt engineering | System prompt con: rol de "certified rack inspector", referencias ANSI MH16.1 / RMI, output forzado en JSON schema con Zod |
| Output parsing | Zod schema → tipado fuerte en TS |
| PDF report | `@react-pdf/renderer` con template branded Redline |
| Lead capture | Resend + entrada a Cloudflare D1 |
| Rate limiting | Cloudflare Turnstile + max 5 análisis/hora por IP |
| Disclaimer legal | Bien visible: "This is a preliminary AI assessment, not an engineering inspection. Always consult a certified inspector before structural decisions." |

### Ejemplo de prompt al modelo

```
You are a certified pallet rack inspector following ANSI MH16.1 and 
RMI guidelines. Analyze the uploaded photos for structural damage.

For each photo, output JSON matching this schema:
{
  damage_type: "column" | "beam" | "brace" | "footplate" | "anchor" | "none",
  damage_description: string,
  severity: "critical" | "moderate" | "cosmetic" | "none",
  likely_cause: string,
  ansi_reference: string,
  recommendation: string,
  load_status_advice: "unload_immediately" | "reduce_load" | "monitor" | "safe"
}

Be conservative — when in doubt, escalate severity. If image quality 
is too poor to assess, return severity "unclear" and request better photos.
```

### Valor de negocio

- **Lead magnet SEO único.** Posicionamiento rápido en "rack inspection", "rack repair estimate", "damaged pallet rack what to do". Long-tail con poca competencia.
- **Captura warm leads.** Quien usa la herramienta YA tiene un problema concreto. Tasa de conversión a quote real altísima (estimado 20–30%).
- **Posiciona a Redline como líder técnico**, no como contratista. Refuerza el reposicionamiento que el cliente pidió.
- **Branding inteligente.** Los PDFs reportes circulan dentro de las empresas → exposición de marca interna.
- **Compounding effect:** cada inspección genera contenido útil para SEO (anonimizado con permiso, casos reales como blog posts: "5 most common rack damage we see").

### Esfuerzo y costo

- **Desarrollo:** 6–9 días hábiles adicionales.
- **Costo recurrente:**
  - Anthropic API: ~$0.01 por análisis (6 imágenes a Sonnet 4). 500 análisis/mes = ~$5
  - R2 storage: ~$1/mes para volumen razonable
  - Resend + Cloudflare base: incluidos
  - **Total: ~$10–20/mes**

### Riesgos honestos

1. **Liability legal.** Es lo más sensible. Si la IA dice "safe" y el rack colapsa, hay riesgo. Mitigación obligatoria:
   - Disclaimer visible y aceptación explícita (checkbox) antes de usar.
   - Lenguaje siempre "preliminary assessment" / "not a substitute for certified inspection".
   - Logging de cada análisis con hash de imagen para defensa legal.
   - Considerar revisar con el seguro de Redline antes de lanzar.
2. **Calidad del modelo.** Hay que probar con 50–100 fotos reales antes de lanzar. Si John tiene fotos de proyectos pasados, ese es el dataset de validación.
3. **Abuso por competencia.** Otros installers pueden usar la herramienta para entrenarse. Rate limiting + watermark en PDFs mitigan.

---

## OPCIÓN 3 — WhatsApp/SMS AI Concierge + Customer Project Portal

> **TL;DR:** Lado público: agente conversacional 24/7 vía WhatsApp/SMS/web que pre-califica, agenda y responde FAQs técnicos. Lado privado: portal donde clientes activos ven progreso de su proyecto. Reduce 60% las llamadas operativas y mejora retención.

### Qué es (dos componentes)

#### 3.A — Concierge público (pre-venta)

Un agente IA accesible por:
- Widget de chat en el sitio (esquina inferior)
- WhatsApp Business (botón "Chat on WhatsApp" en el sitio)
- SMS al número de la empresa

Capaz de:
- Responder FAQs técnicos: clearances, beam capacity, seismic zones, código local, lead times.
- Pre-calificar: "Cuéntame del proyecto" → captura sq ft, ubicación, timeline.
- Agendar site visits.
- Escalar a John por SMS cuando detecta urgencia o ticket grande.
- Bilingüe (English/Spanish — Chicagoland tiene base hispana de warehouse managers).

#### 3.B — Portal de cliente activo (post-venta)

Una vez firmado un proyecto, el cliente recibe acceso a `/portal` con:
- Timeline del proyecto (Gantt simple)
- Fotos diarias subidas por el crew (vía app móvil simple o WhatsApp del foreman)
- Documentos: cotización aprobada, planos, certificados, fotos finales
- Próximos hitos
- Botón "Message John" → va a WhatsApp
- Survey de satisfacción al final + pedido de review en Google

### Flow ejemplo del Concierge

```
Cliente en sitio o WhatsApp:
"Hi, I have a 40K sq ft warehouse in Aurora, need pallet racks"

Bot:
"Hi! Happy to help with your warehouse in Aurora, IL.
Quick questions to get John the right info:

1. Is it a new install or replacing existing racks?
2. Approximate # of pallet positions you need?
3. Any timeline pressure?

You can also use our instant estimator: [link to /quote]"

Cliente: "New install, around 1,500 positions, need it done in 6 weeks"

Bot:
"Got it — 1,500 positions in 6 weeks for Aurora is doable.
Based on that scope, you're looking at roughly $80K–$140K depending 
on rack supplier and aisle configuration. 

John can do a site visit this week. Want me to book it?
[Tue 10am] [Wed 2pm] [Thu 9am]"

Cliente: "Wed 2pm"

Bot:
"Booked. John (630-363-7251) will be there Wednesday at 2pm.
You'll get a reminder 24h before. Anything else I can help with?"

→ Lead entra a CRM con todo el contexto + agenda en Cal.com de John
→ John recibe SMS: "🔥 New booked site visit: Aurora 40K sqft, 1500 pos, Wed 2pm"
```

### Stack técnico

| Pieza | Tecnología |
|---|---|
| Brain del agente | Claude Sonnet 4 vía API (mejor conversacional + cumple instrucciones complejas) |
| Memoria de conversación | Cloudflare D1 + KV (historial por session_id / phone_number) |
| Web chat widget | Componente Preact en Astro |
| WhatsApp | Meta WhatsApp Business API directamente, o vía Twilio (más fácil pero más caro) |
| SMS | Twilio |
| Orquestación de workflows | Cloudflare Workers (no necesitamos n8n para esto) |
| Booking | Cal.com API integrada |
| Portal cliente | Astro con auth por magic link (Lucia Auth o Supabase Auth) |
| Storage de fotos del proyecto | Cloudflare R2 |
| Subida de fotos por crew | App móvil simple (PWA) o flow por WhatsApp del foreman |
| Notificación a John | SMS Twilio + email |
| Knowledge base del agente | Markdown files con FAQs técnicos, indexados → context injection en prompt |

### Valor de negocio

- **Disponibilidad 24/7.** El warehouse manager que descubre rack dañado a las 9pm puede agendar inspección al toque, no espera al lunes.
- **Reduce carga operativa.** John deja de contestar 10 llamadas/día con "¿cuánto sale instalar un rack?". Solo recibe los leads pre-calificados.
- **Retención + referrals.** El portal con fotos diarias es lo que diferencia experiencia premium. Cliente feliz = review en Google = más SEO.
- **Bilingüe out of the box.** Diferencial real en Chicagoland.
- **Documentación automática para case studies.** Cada proyecto cerrado deja en R2 fotos + métricas listas para convertir en página `/portfolio/[proyecto]`.

### Esfuerzo y costo

- **Desarrollo:** 12–18 días hábiles adicionales (es el más complejo de los 3).
- **Costo recurrente:**
  - WhatsApp Business API: $0.005–0.02 por mensaje saliente (free tier: 1000 conversaciones/mes)
  - Twilio SMS: ~$0.0075/SMS
  - Anthropic API: ~$0.005–0.02 por conversación
  - Cal.com cloud: $15/mo
  - Total estimado con uso real: **$50–150/mes**

### Riesgos honestos

1. **El agente puede decir burradas.** Mitigación: prompt estricto con "si no estás seguro, ofrece conectar con John". Guardrails con función de "handoff" obligatorio cuando se detectan keywords críticos (presupuesto > $X, mención de injury, palabras OSHA citation, etc.).
2. **WhatsApp Business API tiene fricción de setup.** Verificación de Meta puede tomar 2–3 semanas. Si urge, empezar con Twilio + SMS y agregar WhatsApp después.
3. **El portal cliente es overkill si tienen 2–3 proyectos activos/mes.** Solo justifica el dev si el volumen es 8+ proyectos simultáneos. Para volumen bajo, basta con un Trello/Notion compartido al cliente.
4. **Hay que cuidar el tono.** Un cliente B2B industrial NO quiere bot chistoso. El prompt debe forzar tono profesional, conciso, americano-directo.

---

## 2. Comparativa de las 3 opciones

| Criterio | 1. Quote Engine | 2. AI Rack Inspection | 3. WhatsApp Concierge + Portal |
|---|---|---|---|
| **Esfuerzo dev (días extra)** | 8–12 | 6–9 | 12–18 |
| **Costo recurrente** | $20–50/mo | $10–20/mo | $50–150/mo |
| **Impacto en lead gen** | 🔥🔥🔥 Alto | 🔥🔥 Alto | 🔥🔥 Medio-alto |
| **Diferencial vs competencia** | 🔥🔥 Alto | 🔥🔥🔥 Único en rubro | 🔥🔥 Alto |
| **Tiempo a primer valor** | 2 semanas | 1.5 semanas | 3–4 semanas |
| **Dependencia de input del cliente** | Alta (pricing data) | Media (fotos de validación) | Alta (FAQs, voz, integraciones) |
| **Riesgo legal** | Bajo | **Medio** (liability) | Bajo |
| **Escala con volumen** | Lineal | Excelente | Excelente |

---

## 3. Recomendación priorizada

Si tuviera que ordenar la inversión del cliente con la información actual:

### 🥇 Fase A — Lanzar con Opción 1 (Quote Engine)

Es el menor riesgo, mayor retorno inmediato y resuelve el dolor #1: la fricción del "call us". Encaja perfectamente en el plan base de Astro sin sobrecomplicar. Es el upgrade que **convierte el sitio en máquina de leads desde el día 1**.

### 🥈 Fase B — 30–60 días después del launch: Opción 2 (Rack Inspection)

Una vez que el sitio está estable, métricas de tráfico fluyendo y John tiene 50+ fotos de proyectos pasados para validar el modelo, soltar la inspection tool como **lead magnet de SEO**. Es la pieza que les da posicionamiento técnico y un diferencial publicable: *"The only warehouse installer with an AI rack safety assessment tool."*

### 🥉 Fase C — A partir del mes 3–6, si el volumen lo justifica: Opción 3 (Concierge + Portal)

La 3 es la más cara y compleja. Tiene sentido cuando ya tengan 30+ leads/mes y 5+ proyectos activos simultáneos. Antes de ese punto, el ROI por hora invertida es menor que las otras dos. **No la implementaría primero.**

### Lo que NO recomiendo hacer

- **No** poner las 3 al mismo tiempo. Cada una necesita validación con data real antes de la siguiente.
- **No** invertir en chatbot genérico (Tidio, Tawk.to). No agrega valor en B2B industrial — los clientes prefieren llamar.
- **No** prometer al cliente "todo automatizado". Vendamos: "el sitio nuevo es la base; le pongo el cotizador inteligente desde el día 1; en 60 días agrego la herramienta de inspección con IA; el resto lo evaluamos con métricas reales."

---

## 4. Próximos pasos concretos

Para arrancar la **Opción 1 (Quote Engine)** junto con el plan base, necesito de John:

1. **2 horas en zoom** para armar la matriz de pricing: filas = servicios, columnas = tamaños, celdas = rangos. Esto es 100% dependiente de su experiencia.
2. **Lista de zonas de viaje** con multiplicador: Chicagoland (base), Midwest (+15%), Out-of-state (+30%), etc.
3. **Lead times reales** por tipo de servicio (impacta el cálculo de timeline en el wizard).
4. **Decisión sobre el rango.** ¿Quiere mostrar rango siempre, o gated tras dar email? Mi recomendación: rango siempre visible, refina con email.
5. **Calendario que va a conectar** (Google Calendar o Outlook).

Si arrancan también la **Opción 2 (Rack Inspection)** en paralelo o como Fase B:
1. 50–100 fotos de racks dañados de proyectos pasados (con consentimiento) para validación.
2. Revisión del disclaimer legal con su abogado o broker de seguros.
3. Branding del PDF de reporte.

---

**Preparado por Ignia · ignia.site**
**Anexo a:** `redline-installers-plan.md`

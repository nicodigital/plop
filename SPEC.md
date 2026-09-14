# PLOP! Sites --- SPEC de desarrollo web

## 1. Objetivo del proyecto

Desarrollar el sitio comercial de **PLOP! Sites**, orientado
inicialmente a pequeños negocios y al sector inmobiliario en Brasil. La propuesta debe comunicar de inmediato que PLOP desarrolla sitios web profesionales, rápidos, modernos, fáciles de gestionar y con un costo competitivo.

El sitio debe vender el resultado ---presencia digital, velocidad,
visibilidad, soporte y simplicidad--- y no la tecnología utilizada.

**Idea de marca:** sitios que hacen acontecer.\
**Posicionamiento:** alta performance sin alto costo ni complejidad
innecesaria.\
**Idioma inicial:** portugués de Brasil.

------------------------------------------------------------------------

## 2. Principios del producto

1. Claridad comercial antes que exhibición tecnológica.
2. Storytelling visual sin sacrificar performance.
3. Diseño expresivo, accesible y profesional; nunca infantil.
4. HTML semántico y contenido indexable.
5. JavaScript progresivo: usarlo solo donde aporte valor.
6. Animaciones como enhancement; el sitio debe funcionar sin ellas.
7. Mobile-first para contenido y conversión, aunque la experiencia
   cinematográfica principal se diseñe para desktop.
8. Componentes reutilizables y sistema visual consistente.
9. Core Web Vitals como criterio de aceptación.
10. Arquitectura preparada para crecer a páginas de servicios, nichos, casos y SEO local.

------------------------------------------------------------------------

## 3. Stack recomendado

- **Astro** como framework.
- TypeScript.
- CSS moderno mediante Tailwind CSS o CSS/Sass del proyecto; evitar duplicar sistemas.
- Imágenes en AVIF/WebP con `astro:assets` cuando corresponda.
- SVG para iconografía y logotipo definitivo.
- Fuentes locales o self-hosted cuando la licencia lo permita.
- Sin framework cliente global (React/Vue) salvo necesidad puntual.
- Deploy será en CLAUDFLARE workers.

------------------------------------------------------------------------

## 4. Arquitectura de información

### MVP

- `/` --- Home
- `/planos/` --- Planos / paquetes
- `/portfolio/` o `/projetos/` --- Casos
- `/blog/`
- `/blog/[slug]/`
- `/contato/`
- páginas legales requeridas

### Evolución SEO

Preparar la arquitectura para incorporar:

- `/sites-para-pequenos-negocios/`
- `/sites-para-imobiliarias/`
- `/sites-para-restaurantes/`
- `/sites-para-clinicas/`
- páginas por intención/servicio
- páginas locales cuando exista contenido real y diferenciado

No generar páginas doorway ni contenido local duplicado.

------------------------------------------------------------------------

## 5. Home --- narrativa principal

La primera parte de Home utiliza un video de fondo (C:\Proyectos\PLOP\assets\video\bg-hero.mp4) con una laptop que tiene un pequeño movimiento(laptop a la derecha). El contenido textual es HTML real superpuesto o dispuesto junto al recurso visual.

### Sección 01 --- Hero

**Objetivo:** explicar qué hacemos y provocar la primera conversión.

- Laptop a la derecha.
- Gran espacio negativo a la izquierda.
- H1 sugerido: `Seu negócio em destaque.`
- Eyebrow: `SITES PROFISSIONAIS PARA NEGÓCIOS INDEPENDENTES`
- Copy orientativo:
  `Sites modernos, rápidos e fáceis de gerenciar. Design de alto desempenho com um preço que faz sentido.`
- CTA primario: `Quero meu site`
- CTA secundario: `Ver planos`
- Microbeneficios opcionales: rapidez, visibilidad, soporte.
- El H1 y CTA nunca deben estar rasterizados dentro del asset.

### Sección 02 --- Sobre nós

**Objetivo:** explicar el enfoque PLOP.

- Laptop pasa al lado izquierdo.
- Contenido HTML a la derecha.
- Mensaje posible: `Mais que sites, impulsionamos negócios.`
- Explicar simplicidad, estrategia, accesibilidad y acompañamiento.
- Evitar discurso de "agencia premium" o excesivamente corporativo.

### Sección 03 --- Como funciona

**Objetivo:** reducir fricción y explicar el producto.

- Laptop vuelve a la derecha con una perspectiva distinta.
- Contenido HTML a la izquierda.
- Estructura de 3 pasos:
  1. `Escolha um plano`
  2. `Personalize seu site`
  3. `Publique e cresça`
- Mensaje posible: `Do seu jeito. Em poucos passos.`

### Sección 04 --- Presentación / transición

**Objetivo:** culminar el primer arco visual.

- Laptop centrada.
- Vista frontal.
- Mayor escala.
- Pantalla final con el logotipo `plop! sites` centrado o una pieza
  visual equivalente.
- Debe funcionar como cierre de la secuencia cinematográfica y puente hacia el resto del sitio.

### Secciones posteriores sugeridas

La laptop deja de ser obligatoria. Continuar con:

- beneficios/diferenciales;
- planes;
- casos de éxito;
- para quién es PLOP;
- proceso/FAQ;
- soporte mensual;
- CTA final;
- footer.

------------------------------------------------------------------------

## 6. Storytelling con scroll

### Concepto

La experiencia desktop reproduce una secuencia visual 16:9 controlada por scroll. El usuario percibe una única escena donde la laptop:

`derecha → izquierda → derecha → centro frontal`

Las formas líquidas del fondo se desplazan lentamente y aportan
profundidad.

### Fuente

El pipeline definitivo puede partir de un **video maestro**(secuencia de imagenes en "C:\Proyectos\PLOP\assets\sequence"). 

### Implementación

Componente sugerido:

`src/components/story/ScrollLaptopSequence.astro`

Lógica:

`src/scripts/laptop-sequence.ts`

Datos:

`src/data/laptop-sequence.json`

Assets:

`public/assets/laptop-sequence/`

El canvas permanece sticky durante el arco narrativo. ScrollTrigger
transforma el progreso del scroll en un índice de frame.

```ts
const playhead = { frame: 0 };

gsap.to(playhead, {
  frame: totalFrames - 1,
  ease: "none",
  scrollTrigger: {
    trigger: "[data-laptop-story]",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
  onUpdate: renderFrame,
});
```

No vincular la secuencia a tiempo real. El usuario debe poder avanzar y retroceder con el scroll.

### Frames

Objetivo inicial:

- master: 1916×1080 / 24 fps (15 segundos);
- web desktop: aproximadamente 1600×900;
- extracción: 12--18 fps;
- objetivo: 180--240 frames;
- formato preferido: WebP; evaluar AVIF solo después de medir
  decoding;
- nombres: `frame-0001.webp`, etc.

No fijar una cantidad definitiva hasta probar suavidad/peso.

### Carga

1. Mostrar poster inmediatamente.
2. Priorizar frames próximos al inicio.
3. Cargar progresivamente el resto.
4. No bloquear la interacción esperando toda la secuencia.
5. Cachear imágenes decodificadas con una estrategia acotada.
6. Renderizar solo cuando cambia el frame.
7. Respetar DPR con un límite razonable para evitar canvas gigantes.

### Responsive

- **Desktop ≥ 992px:** secuencia completa.
- **Tablet:** evaluar secuencia de menor resolución/cantidad de
  frames.
- **Mobile:** preferir poster, animación simplificada o video ligero
  si la medición demuestra que la secuencia no compensa su costo.
- Nunca descargar silenciosamente la secuencia desktop en mobile.

### Reduced motion

Con `prefers-reduced-motion: reduce`:

- desactivar scrub cinematográfico;
- mostrar imágenes/estados estáticos;
- mantener todo el contenido y CTAs accesibles.

------------------------------------------------------------------------

## 7. Animación

La motion language es **líquida, moderada y elegante**.

### Laptop

Combinar de forma sutil:

- X/Y;
- escala;
- perspectiva;
- rotación;
- microflotación.

Evitar:

- bounce evidente;
- elastic;
- giros exagerados;
- aceleraciones bruscas;
- sensación de "objeto de videojuego".

### Fondo

Burbujas/formas:

- movimiento muy lento;
- velocidades diferentes;
- parallax suave;
- desplazamientos no sincronizados;
- sensación de gravedad/flotación;
- siempre secundarias respecto de laptop y contenido.

### UI

Entradas de contenido con opacity + translate moderado. Duraciones
típicas 300--700 ms. No animar todo. El CTA debe sentirse inmediato.

------------------------------------------------------------------------

## 8. Componentes sugeridos

```text
src/
  components/
    layout/
      Header.astro
      Footer.astro
    ui/
      Button.astro
      Badge.astro
      SectionHeading.astro
      BenefitCard.astro
      PlanCard.astro
      ProjectCard.astro
      FaqItem.astro
    story/
      ScrollLaptopSequence.astro
      StorySection.astro
    sections/
      Hero.astro
      About.astro
      HowItWorks.astro
      ShowcaseTransition.astro
      Benefits.astro
      Plans.astro
      Projects.astro
      Audience.astro
      FAQ.astro
      FinalCTA.astro
  layouts/
    BaseLayout.astro
  pages/
  scripts/
  styles/
  data/
```

No crear componentes para fragmentos que no tengan reutilización o
responsabilidad clara.

-------------------------------------------------------------------

## 9. Oferta comercial inicial

El sistema debe poder representar la oferta:

**1 Site One Page + Blog**

- entrada: `R$ 1.500`
- mensualidad: `R$ 300/mês`

La mensualidad puede incluir:

- hospedagem;
- suporte técnico;
- manutenção;
- publicação de 1 conteúdo por mês.

No prometer redacción SEO completa dentro de la mensualidad salvo que se
defina explícitamente.

Mensaje comercial recomendado:

`Seu site pronto. E cuidado todos os meses.`

Apoyo:

`Você cuida do seu negócio. A gente cuida do seu site.`

------------------------------------------------------------------------

## 10. SEO

- HTML semántico.
- Un H1 claro por página.
- Jerarquía H2/H3 lógica.
- Titles y descriptions únicos.
- Canonical.
- Sitemap.
- robots.txt.
- Open Graph.
- Twitter/X cards si se usan.
- JSON-LD adecuado: Organization/ProfessionalService o tipo más
  preciso cuando corresponda, WebSite, BreadcrumbList, Article para
  blog.
- No inventar ratings, clientes, resultados o localizaciones.
- Internal linking entre servicios, casos y contenidos.
- URLs en portugués y estables.
- Imágenes con alt contextual cuando sean informativas.

------------------------------------------------------------------------

## 11. Performance

Objetivos de referencia en producción, móvil y condiciones reales:

- LCP ≤ 2.5 s.
- CLS ≤ 0.1.
- INP ≤ 200 ms.
- evitar JS global innecesario;
- lazy load debajo del fold;
- fuentes con subset/preload selectivo;
- no precargar assets no críticos;
- tamaño de la secuencia medido y documentado;
- poster del storytelling optimizado;
- no convertir el hero en una dependencia de cientos de frames antes
  de mostrar contenido.

El contenido principal del hero debe aparecer aunque la animación
todavía no haya cargado.

------------------------------------------------------------------------

## 12. Accesibilidad

- WCAG 2.2 AA como objetivo.
- contraste validado;
- focus visible;
- navegación por teclado;
- landmarks;
- labels reales;
- botones y links semánticos;
- canvas decorativo con `aria-hidden="true"`;
- no comunicar información esencial únicamente mediante color o
  animación;
- reduced motion;
- formularios con mensajes de error accesibles.

------------------------------------------------------------------------

## 13. Analytics y conversión

Preparar eventos desacoplados del proveedor:

- `cta_primary_click`
- `plans_view`
- `plan_select`
- `whatsapp_click`
- `contact_submit`
- `project_view`
- `blog_cta_click`

La implementación de GTM/GA4/Meta debe poder añadirse sin acoplar
componentes a IDs específicos.

------------------------------------------------------------------------

## 14. Formularios

- validación cliente + servidor;
- honeypot y/o Turnstile si se requiere;
- mensajes claros;
- no exponer secretos;
- consentimiento cuando aplique;
- feedback de envío;
- tracking solo tras éxito real.

------------------------------------------------------------------------

## 15. Browser support

Priorizar versiones actuales de:

- Chrome;
- Edge;
- Firefox;
- Safari.

La experiencia base debe permanecer usable cuando Canvas/GSAP o ciertas
optimizaciones no estén disponibles.

------------------------------------------------------------------------

## 16. Criterios de aceptación

1. En menos de pocos segundos queda claro que PLOP crea sitios web.
2. El hero conserva espacio limpio para copy y CTA.
3. Las primeras cuatro secciones forman una narrativa visual continua.
4. El scroll controla la secuencia en ambas direcciones sin saltos.
5. La animación no bloquea contenido ni navegación.
6. Mobile no carga innecesariamente la experiencia desktop.
7. Reduced motion funciona.
8. El contenido crítico es HTML real.
9. La identidad coincide con `DESIGN.md`.
10. Lighthouse y Web Vitals no muestran regresiones graves atribuibles
    al storytelling.
11. SEO técnico básico completo.
12. Componentes y contenido quedan preparados para crecimiento.

------------------------------------------------------------------------

## 17. Orden de implementación

### Fase 1 --- Foundation

Astro, tokens, tipografía, layout, Header/Footer, componentes base.

### Fase 2 --- Home estática

Construir todas las secciones sin depender de GSAP.

### Fase 3 --- Storytelling

Integrar poster, canvas, frames, ScrollTrigger y estados 01--04.

### Fase 4 --- Contenido

Planes, proyectos, blog y CMS file-based.

### Fase 5 --- Calidad

Responsive, accesibilidad, SEO, analytics, performance y reduced motion.

### Fase 6 --- QA

Chrome/Edge/Firefox/Safari, tamaños representativos, navegación teclado,
throttling y pruebas de scroll rápido/reverso.

------------------------------------------------------------------------

## 18. Regla para Harness

Antes de implementar una decisión visual no definida, consultar
`DESIGN.md`. No introducir nuevos colores, radios, sombras, tipografías, estilos de iconos o patrones de motion de forma arbitraria.

Cuando exista tensión entre efecto visual y performance/accesibilidad, conservar la intención visual mediante progressive enhancement y priorizar usabilidad, contenido y Core Web Vitals.

---
name: PLOP! Sites
description: Azul de marca como superficie completa, lima solo para la acción, una espina editorial que desciende la página.
colors:
  plop-blue-50: "#eef6ff"
  plop-blue-100: "#daebff"
  plop-blue-200: "#bddcff"
  plop-blue-300: "#8fc7ff"
  plop-blue-400: "#5aa8ff"
  plop-blue-500: "#3486fd"
  plop-blue-600: "#1e66f2"
  plop-blue-700: "#1650df"
  plop-blue-800: "#1b47c4"
  plop-blue-900: "#1a3b8e"
  plop-blue-950: "#152656"
  plop-blue: "#2563ff"
  plop-lime: "#c7ff00"
  plop-lime-bright: "#d6ff3d"
  plop-white: "#ffffff"
  plop-pink: "#ff4d84"
  plop-violet: "#8b6cf6"
  plop-blue-deep: "#1b47c4"
  plop-blue-dim: "#1a3b8e"
  plop-ink: "#1a3b8e"
  plop-paper: "#eef6ff"
  plop-on-blue: "#bddcff"
  plop-on-ink: "#8fc7ff"
  plop-on-white: "#3d4a66"
  plop-hairline: "#bddcff"
typography:
  h1:
    fontFamily: "Quicksand Variable, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  h2:
    fontFamily: "Quicksand Variable, system-ui, sans-serif"
    fontSize: "clamp(2.125rem, 4.2vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  h3:
    fontFamily: "Quicksand Variable, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 2rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  lead:
    fontFamily: "Outfit Variable, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Outfit Variable, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Outfit Variable, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  numeric:
    fontFamily: "Quicksand Variable, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 4vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum 1"
rounded:
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "40px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4vw, 64px)"
  section: "clamp(80px, 12vw, 180px)"
  spine-gap: "clamp(48px, 6vw, 112px)"
  card-pad: "clamp(24px, 2.6vw, 36px)"
  container: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.plop-lime}"
    textColor: "{colors.plop-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.plop-lime-bright}"
    textColor: "{colors.plop-ink}"
  button-primary-lg:
    backgroundColor: "{colors.plop-lime}"
    textColor: "{colors.plop-ink}"
    rounded: "{rounded.pill}"
    padding: "0 32px"
    height: "56px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.plop-white}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-solid-ink:
    backgroundColor: "{colors.plop-ink}"
    textColor: "{colors.plop-white}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-solid-ink-hover:
    backgroundColor: "{colors.plop-blue-800}"
    textColor: "{colors.plop-white}"
  input-field:
    backgroundColor: "{colors.plop-white}"
    textColor: "{colors.plop-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    width: "100%"
  card-plan:
    backgroundColor: "{colors.plop-white}"
    textColor: "{colors.plop-ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-pad}"
  card-plan-recommended:
    backgroundColor: "{colors.plop-ink}"
    textColor: "{colors.plop-white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-pad}"
  badge-recommended:
    backgroundColor: "{colors.plop-lime}"
    textColor: "{colors.plop-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    typography: "{typography.small}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.plop-white}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  slider-control:
    backgroundColor: "transparent"
    textColor: "{colors.plop-white}"
    rounded: "{rounded.pill}"
    size: "48px"
---

# Design System: PLOP! Sites

> Registro del sistema tal como quedó construido. La fuente de verdad de los
> tokens es `src/styles/global.css`; este documento explica dónde y por qué se
> usan. Reemplaza al documento de dirección previo: la secuencia de
> storytelling de cuatro escenas y la lista de estados de la laptop ya no
> forman parte del producto (héroe con video de fondo + slider Swiper).

## Overview

**Creative North Star: "La espina editorial sobre azul saturado"**

PLOP se construyó como un solo argumento que desciende por una columna
izquierda mientras la prueba cambia en un riel derecho. El azul de marca no es
un acento: es la superficie. Sobre él descansan masas líquidas grandes y pocas,
tipografía redondeada en tamaños grandes y una única cosa lima por pantalla,
que siempre es la acción. La página rechaza deliberadamente la pila de landing
de agencia (héroe, tira de logos, tres tarjetas con iconos, grilla de
proyectos): en su lugar alterna azul, papel e ink para marcar ritmo, y rompe la
espina una sola vez, cuando el slider de proyectos toma el ancho completo.

La densidad es baja y el aire es material de construcción. No hay una sola
sombra en todo el build: la profundidad viene del tono (azul, azul profundo,
ink), del radio grande y de una hairline fría. Nada brilla, nada flota sobre un
blur y ningún gradiente mezcla más de una familia de azul. El movimiento es
discreto y sirve solo para presentar contenido que ya existe en el HTML.

Rechazos visuales confirmados y sostenidos por el build: glassmorphism, neón
oscuro, estética gamer o cyberpunk, gradientes arcoíris, sombras pesadas,
interfaces saturadas y clichés de render 3D de "tecnología futurista".

**Key Characteristics:**

- Azul PLOP como superficie completa, no como acento.
- Lima exclusivamente para la acción; su rareza es el mecanismo.
- Cero sombras: la profundidad es tonal.
- Texto secundario teñido del fondo, nunca gris.
- Una espina 5fr/6fr que ninguna sección renegocia.
- Contenido visible sin JavaScript; la animación solo se suma.

## Colors

Paleta de un solo eje: una familia azul en tres profundidades, un verde lima de
acción y neutros fríos derivados del azul en lugar de grises neutros.

### Primary

- **Azul PLOP** (`plop-blue`): la superficie de marca. Fondo del héroe y de los
  bloques de identidad. Sobre este tono solo va texto blanco grande o titulares:
  el cuerpo de texto nunca descansa aquí.
- **Azul Profundo** (`plop-blue-deep`): sombra tonal del azul de marca, no un
  segundo color. Es el fondo de las secciones azules con copy corrido (el
  slider de proyectos) y la base del scrim del héroe, porque ahí el blanco y su
  tinte suave deben superar 4.5:1.
- **Azul Apagado** (`plop-blue-dim`): un escalón por debajo del azul profundo.
  Fondo de los contenedores de media mientras el video no ha cargado y de
  bloques internos dentro de una sección azul profunda.

### Secondary

- **Lima PLOP** (`plop-lime`): color de acción. Botón primario, badge del plan
  recomendado, barra del ítem de navegación activo, checks dentro de la card
  oscura, anillo de foco y `::selection`. No es decoración.
- **Lima Brillante** (`plop-lime-bright`): único estado hover del lima. No
  aparece en reposo en ninguna superficie.

### Tertiary

- **Rosa PLOP** (`plop-pink`): estado de error en formularios (mensaje y borde
  del campo inválido). Es el único uso del rosa en el build.
- **Violeta PLOP** (`plop-violet`): declarado en el tema y **no usado** en el
  build. Permanece disponible como acento puntual; introducirlo exige una razón
  jerárquica, no estética.

### La escala azul

El sistema no tiene neutros oscuros. La escala `plop-blue-50 … 950` es la única
familia de la que sale todo fondo oscuro, todo texto sobre claro y toda línea:
el contraste del sitio es azul contra blanco, no gris contra blanco. Los grises
de la primera versión (`plop-black`, `plop-graphite`, `plop-graphite-soft`)
fueron retirados y no deben volver.

Cada rol nombra un escalón, de modo que retocar un escalón retoca el rol
completo en un solo lugar:

- **Blanco** (`plop-white`): fondo de descanso, texto sobre azul e ink,
  superficie de las cards claras y de los campos de formulario.
- **Papel** (`plop-paper` → `blue-50`): fondo de descanso alternativo, teñido
  desde el azul para que dos secciones claras seguidas se lean como cambio de
  ritmo y no como la misma sección repetida. Es el fondo de la sección de planes.
- **Ink** (`plop-ink` → `blue-950`, 14.5:1 sobre blanco): texto por defecto
  sobre claro y superficie de los bloques de alto contraste (card del plan
  recomendado, botón `solid-ink`, footer, About, riel de Cómo funciona).
- **Azul profundo / atenuado** (`plop-blue-deep` → `blue-700`,
  `plop-blue-dim` → `blue-800`): fondos de sección donde el cuerpo de texto
  se apoya sobre azul y aún así supera 4.5:1.
- **`blue-800` / `blue-900`** aparecen además como estados: hover del botón
  `solid-ink` y del dock de WhatsApp, y card elevada dentro de un panel ink.
- **Sobre Azul / Sobre Ink / Sobre Blanco** (`plop-on-blue` → `blue-200`,
  `plop-on-ink` → `blue-200`, `plop-on-white`): texto secundario, uno por
  fondo, aplicado con `.muted` dentro de `.on-blue` / `.on-ink` / `.on-white`.
  `plop-on-ink` era `blue-300`, que pasa 4.5:1 sobre blue-900 (5.72) pero no
  sobre blue-800 (4.29) — y el footer y About están sobre blue-800. Ahora los
  dos apuntan a `blue-200`, que pasa en ambos; el precio es que la distinción
  entre `.on-blue` y `.on-ink` quedó colapsada. La alternativa es devolver esas
  dos superficies a blue-900.
- **Hairline** (`plop-hairline` → `blue-200`): bordes de campos, divisiones
  internas de las cards claras y contorno de card sobre papel. Es la única
  línea del sistema.

### Named Rules

**La Regla del Lima Único.** El lima es la acción y nada más. En cualquier
viewport debe existir como máximo un elemento lima que no sea foco ni selección;
si hay dos cosas lima compitiendo, una de ellas no era una acción. Prueba: tapa
el lima de la pantalla y el usuario ya no sabe qué hacer.

**La Regla del Gris Prohibido.** El texto secundario nunca es gris neutro: usa
el tinte de su propio fondo (`plop-on-blue`, `plop-on-ink`, `plop-on-white`). Si
aparece un gris neutro en el diff, es un error de sistema, no una decisión.

**La Regla del Azul que Aguanta.** El cuerpo de texto que se apoya en azul se
apoya en `plop-blue-deep` o `plop-blue-dim`, nunca en `plop-blue`. El azul de
marca es superficie de titular, no de párrafo. El scrim de legibilidad se
construye con el azul profundo: oscurecer con negro mata la identidad.

## Typography

**Display Font:** Quicksand Variable 600/700 (con `system-ui` como respaldo)
**Body Font:** Outfit Variable 400 (con `system-ui`, `-apple-system`)

Las dos son variables: un archivo por familia cubre todos los pesos que la
página pide, así que no hay negrita sintética ni un segundo pedido de red.

> **Pendiente de licencia.** La cara display prevista es **Cera Round Pro
> Black**. El único archivo disponible es la demo de Fontspring, que sustituye
> `$` y `4` por un glifo con la marca "DEMO" y no trae vocales acentuadas — es
> decir, estampa una marca de agua sobre todos los precios del sitio. El cambio
> es un import y la línea `--font-display` en `src/styles/global.css`; hasta que
> llegue el `.woff2` licenciado, Quicksand ocupa el rol.
>
> **Techo de peso.** 700 es el peso máximo de Quicksand, y pesa aproximadamente
> lo que un semibold en otras familias. El H1 queda más liviano que el
> wordmark PLOP que tiene encima; si el titular se quiere más rotundo, la
> palanca no es el peso sino el tamaño y el tracking.

**Character:** Redondeada, gruesa y optimista arriba; neutra, ancha y legible
abajo. El contraste entre ambas es de forma, no de tamaño: el titular manda por
curvatura y peso, no por adornos.

### Hierarchy

- **H1** (700, `clamp(2.75rem, 6vw, 5.5rem)`, line-height 0.98, tracking
  -0.035em): un solo H1 por página, en el héroe o en el masthead. `text-wrap:
  balance` y un `max-width` en `ch` sobre el propio elemento.
- **H2** (700, `clamp(2.125rem, 4.2vw, 3.75rem)`): entrada de cada sección. Es
  el nivel que marca el descenso de la espina.
- **H3** (600–700, `clamp(1.375rem, 2.2vw, 2rem)`): títulos de card, de plan y
  de slide.
- **Lead** (400, `clamp(1.125rem, 1.5vw, 1.375rem)`, line-height 1.6): el
  párrafo que sigue a cada H2, siempre limitado por `.measure` (62ch) o
  `.measure-tight` (48ch).
- **Body** (400, 1rem, line-height 1.6, `text-wrap: pretty`): texto corrido,
  features de plan, metadatos de proyecto.
- **Small** (600–700, 0.875rem): estados de formulario, notas y metadatos.
  Nunca por debajo de 14px para información funcional.
- **Numeric** (Quicksand 700, `clamp(2.5rem, 4vw, 3.25rem)`, tracking -0.04em,
  `tabular-nums`): precios. Un precio se lee comparando; debe alinearse columna
  contra columna.
- **Article** (`.prose-plop`, 1.0625rem, line-height 1.72, 68ch): la superficie
  más calmada del sitio. La marca aparece solo en headings, enlaces y viñetas.

### Named Rules

**La Regla del `ch` en el Heading.** Un `max-width` en `ch` va sobre el elemento
del titular, jamás sobre un contenedor cuyo `font-size` es 16px. El `ch` se mide
contra la fuente del elemento donde vive: puesto en un wrapper, un
`max-w-[13ch]` estranguló el H1 a 211px en producción. Si un titular se ve
estrecho, busca el `ch` en el wrapper antes que cualquier otra cosa.

**La Regla de la Cifra Medida.** Todo precio, paso numerado o conteo lleva
`[data-numeric]` (`tabular-nums`). Los números son valores medidos, no prosa.

**La Regla de la Voz Única del Titular.** Quicksand y Outfit no comparten el rol
de heading. Un titular es Quicksand; un párrafo es Outfit. No hay tercera
familia, y el wordmark no depende de ninguna de las dos.

## Layout

Contenedor único `.shell`: máximo 1440px, centrado, con gutter
`clamp(20px, 4vw, 64px)`. Ninguna sección define su propio ancho.

**La espina.** `.spine-grid` es una columna en móvil y, desde 1024px, dos:
`minmax(0, 5fr)` para la espina del argumento y `minmax(0, 6fr)` para el riel de
prueba, con `gap: clamp(48px, 6vw, 112px)` y `align-items: stretch` para que el
riel pueda ser `sticky` a lo alto de toda la sección. La usan About, HowItWorks,
Faq, el footer y `/contato/`. Su proporción es la única constante estructural de
la página: las secciones no la renegocian.

**Ritmo vertical.** Cada sección respira con
`--section-space: clamp(80px, 12vw, 180px)`. El ritmo de fondos alterna azul,
papel/blanco e ink; no se cambia de color por sección sin motivo narrativo.

**La ruptura.** El slider de proyectos es la única sección que ignora la espina:
el riel toma el viewport completo una vez, con overflow visible y el slide
siguiente asomando. Esa ruptura única es lo que impide que la página se lea como
plantilla de dos columnas.

**Medidas de lectura.** `.measure` (62ch) y `.measure-tight` (48ch) son los dos
anchos de párrafo; el artículo usa 68ch. No existen párrafos a ancho completo.

**Responsive.** Breakpoints por defecto de Tailwind más dos umbrales propios y
justificados: 1024px (activación de la espina) y 900px (la tabla de planes pasa
a tres columnas). Móvil apila, reduce la escala de titulares por `clamp()` y
simplifica decoración antes que contenido. `overflow-x: hidden` en el `body`.

### Named Rules

**La Regla de la Espina.** Toda sección nueva de contenido entra en
`.spine-grid` dentro de `.shell`. Una sección puede romper la espina solo si esa
ruptura es el momento memorable de la página, y solo hay uno.

## Elevation & Depth

El sistema es **plano por decisión**: el build no contiene un solo `box-shadow`,
`drop-shadow` ni `backdrop-filter`. La profundidad se produce por tres medios:
escalones tonales dentro de la misma familia azul (`plop-blue`,
`plop-blue-deep`, `plop-blue-dim`), superficies muy oscuras (`plop-ink`) contra
superficies claras (`plop-paper`, blanco), y radios grandes que separan una masa
de su fondo sin proyectarla.

Las separaciones internas son hairlines de 1–2px: `plop-hairline` sobre claro y
blanco al 15% dentro de la card ink.

### Named Rules

**La Regla Sin Sombra.** Ninguna superficie proyecta sombra, en reposo ni en
hover. Si un elemento necesita separarse, cambia de tono o de radio. Glows y
blurs de fondo están fuera de este mundo.

**La Regla del Scrim Tonal.** Cuando haga falta legibilidad sobre media, el velo
se pinta en la familia azul (gradiente de `plop-blue-deep` a transparente, con
`color-mix`), nunca en negro ni en blanco translúcido.

## Shapes

Esquinas claramente redondeadas en cuatro escalones: 12px para campos y
elementos pequeños, 20px para bloques medios, 28px para cards y contenedores de
media, 40px para bloques editoriales grandes. Todo control interactivo tiene
forma de cápsula: botones, badges, enlaces de navegación y controles circulares
del slider (`999px`).

Los bordes son excepcionales y siempre finos: 2px `plop-hairline` en campos y
cards claras, 2px de blanco al 45% para controles fantasma sobre azul. No hay
esquinas rectas salvo en las secciones a sangre completa; el contraste entre
masa redondeada y borde recto del viewport es parte de la jerarquía.

Las masas líquidas son pocas, grandes, monocromáticas dentro del azul y
translúcidas; nunca compiten con el contenido y nunca se multiplican en formas
pequeñas.

## Components

### Buttons

- **Shape:** cápsula completa (`999px`), `inline-flex`, icono de 20px a la
  derecha dentro de un `group`.
- **Primary:** fondo lima y texto ink, Quicksand 600, altura mínima 48px (`md`) o
  56px (`lg`), padding horizontal 24/32px. Es la acción de la página.
- **Outline:** transparente con borde de 2px en blanco al 45% y texto blanco.
  Solo sobre azul o ink; es la acción secundaria del héroe.
- **Solid Ink:** fondo ink, texto blanco, hover a grafito. Es la acción sobre
  fondos claros, donde el lima quedaría ilegible en texto pequeño.
- **Hover / Focus:** transición de color en 180ms con `ease-plop-out`; el icono
  se desplaza 4px a la derecha; `active` baja 1px. Nada de rebote ni de escala.
  El foco es un anillo lima sólido de 3px con 3px de offset, global.
- **Touch target:** 48px mínimo de alto; los controles circulares, 44–48px.

### Cards / Containers

- **Corner Style:** 28px (`rounded.lg`) en cards y contenedores de media.
- **Background:** blanco o `plop-paper` para las claras; `plop-ink` para la
  destacada.
- **Shadow Strategy:** ninguna. Ver *La Regla Sin Sombra*.
- **Border:** 2px `plop-hairline` en las claras; ninguno en la ink, que se
  separa por contraste de tono.
- **Internal Padding:** `clamp(24px, 2.6vw, 36px)`; separadores internos como
  hairline con 24–28px arriba y abajo.

### Inputs / Fields

- **Style:** fondo blanco, borde de 2px `plop-hairline`, radio 12px, padding
  12/16px, label visible en 0.9375rem semibold; nunca placeholder como label.
- **Focus:** el borde pasa a `plop-blue` y encima aparece el anillo lima de
  `:focus-visible`. Dos señales: una de color y una de contorno.
- **Error:** borde y mensaje en `plop-pink`, `aria-invalid` en el campo y texto
  explícito debajo; el estado nunca se comunica solo por color.

### Navigation

- **Style:** header transparente sobre el héroe azul, logo vectorial a la
  izquierda, enlaces en cápsula al centro/derecha y CTA lima a la derecha.
- **States:** blanco al 85% en reposo, blanco puro en hover y en `aria-current`;
  la página actual añade una barra lima de 2px bajo la etiqueta, de modo que el
  estado no depende solo del color.
- **Mobile:** botón circular de 44px con borde fantasma abre un drawer que
  hereda la tipografía display, cierra con `Escape` y marca la página actual en
  lima.

### Icons

Set autoral de una sola familia: grilla de 24px, trazo de 2px, `linecap` y
`linejoin` redondos, `currentColor`, `aria-hidden`. Tamaños usados: 20px dentro
de botones y listas, 22–24px en controles. La única excepción sólida es la marca
de WhatsApp, que es un logotipo de terceros y no un icono de UI. No se mezclan
familias, ni pesos de trazo, ni glifos tipográficos usados como iconos.

### Plan Table (signature)

Las tres cards de planes comparten una grilla: `.plan-table` define seis filas
(nombre, público, entrada, mensualidad, features, acción) y cada card ocupa
`grid-row: span 6`, de modo que cada dato queda a la misma altura en las tres
columnas desde 900px. El precio se lee por comparación horizontal; si una fila
se desalinea, la comparación se rompe. La card recomendada invierte la
superficie a ink, pinta la entrada en lima y lleva el badge lima; no se colorea
entera de lima.

### Projects Bands (signature)

**Dos** bandas continuas de Swiper, una sobre otra, cinco proyectos cada una,
sobre azul profundo. Es el único momento en que la página rompe la espina y
toma el viewport entero: el contenedor sale de su columna con
`left-1/2 w-screen -translate-x-1/2`, de modo que las tiles se cortan contra
los bordes de la pantalla y no contra un contenedor. La lectura que se busca
es "esto sigue más allá del borde", no "acá hay diez tarjetas".

Son dos y no una porque **una sola banda se lee como una fila de espera**. Dos
a distinta velocidad se leen como un cuerpo de trabajo: siempre hay algo
entrando y algo saliendo, y el ojo no se acomoda al ritmo de una sola tira.
La de abajo corre más rápido (`speed` 6800 contra 9000) y arranca dos tiles
más adelante, para que las dos nunca se alineen en grilla — alinearse
anularía el motivo de que haya dos.

- **Tile**: radio 28px, proporción 720:356, video con `preload="none"` y
  póster, metadatos debajo (sector más una frase). Ancho fijo por breakpoint
  —`min(82vw, 420px)` / `46vw` / `min(34vw, 640px)`— y no `slidesPerView`,
  porque un marquee necesita una tile que el viewport pueda cortar a
  cualquier ancho.
- **Movimiento**: `autoplay` con `delay: 0` y un `speed` por banda, más
  `transition-timing-function: linear` en el wrapper. Siempre está a mitad de
  transición, nunca en reposo; sin la curva lineal la banda respiraría y se
  leería como tropiezo. No hay slide activa, así que tampoco hay
  de-énfasis: todas las tiles van a plena saturación.
- **Sin flechas ni puntos.** Una banda continua no tiene posiciones a las que
  ir. Queda el arrastre, y un único control.
- **Control de reproducción**: pausa y reanuda la banda *y* los videos a la
  vez, porque en pantalla son un solo movimiento. Detener el autoplay no
  alcanza —la transición de siete segundos ya en curso sigue—, así que
  congelar significa fijar el wrapper donde esté; y al reanudar hay que
  limpiar `swiper.animating`, que quedó en `true` porque esa transición
  nunca disparó `transitionend`.
- **Decodificación**: sigue a la pantalla y después a un presupuesto. Un
  `IntersectionObserver` por tile marca lo que está en cuadro, y de eso solo
  las **cuatro más cercanas al centro** decodifican; el resto sostiene su
  póster. Dos bandas duplican las tiles visibles, y cada tile es un video: sin
  ese techo un desktop decodifica seis a la vez. En los bordes están cortadas
  igual, así que el techo no cuesta nada de mirar.
- **Los videos duran 10 segundos.** Las capturas originales corren de 13 a 38,
  pero una tile se mira unos pocos antes de irse, y los segundos valiosos son
  los primeros: el héroe y la primera sección del sitio del cliente. Diez en
  loop es lo que alguien realmente ve, y es un tercio de los bytes.

### Fondo líquido (signature)

El tramo azul de la página no es un color plano: es un cuerpo de líquido que
la página recorre. Cinco círculos derivan en relojes distintos dentro de un
filtro SVG (`#plop-goo`, definido una sola vez en `BaseLayout.astro`) que los
funde donde se superponen en vez de dejarlos como discos sueltos.

**Un solo fondo, fijo, detrás de varias secciones.** `GooeyStack` lo ancla con
`position: sticky` en una columna absoluta que abarca todo el bloque, y
`ProjectsSlider`, `About` y `HowItWorks` se deslizan por encima sin fondo
propio. Un fondo por sección leería como el mismo papel tapiz empezando de
nuevo en cada borde; además cuesta un filtro desenfocado por sección, y el
filtro es lo más caro de la página. `FinalCta` lo usa directo porque va sola.

Esa columna no puede llevar `overflow-hidden`: un ancestro que recorta pasa a
ser el scrollport del sticky y lo convierte en un `absolute` silencioso.
`GooeyBackground` se recorta a sí mismo.

**El techo de contraste.** El texto secundario sobre estos fondos es
`plop-on-blue` (blue-200, L=0.692), que necesita el fondo en L≤0.115 para
llegar a 4.5:1. Las burbujas son **blue-700 al 50%**, que sobre blue-800 da
L=0.100 — el paso más claro con margen real. blue-600 con el mismo alpha llega
a 0.122 y baja ese texto a 4.32:1. Para subir más, primero hay que pasar a
blanco el texto secundario de esas secciones.

El 50% va en la capa (`opacity`), nunca en el color: la rampa del filtro
(`22 -9`) lleva todo alpha a 0 o 1, así que una burbuja traslúcida sale del
filtro completamente opaca.

`scripts/a11y.mjs` mide el **pixel más claro** que el fondo llega a mostrar
—no un fotograma cualquiera— contra ese techo. Como las burbujas se mueven,
solo una cota superior demuestra que ninguna deriva puede hundir el texto.

**Coste.** Las animaciones se pausan fuera de viewport (`IntersectionObserver`)
y con la pestaña en segundo plano. En móvil dos de las cinco burbujas se
apagan: caen dentro de la columna de texto, donde no aportan forma y sí
agrandan la región del filtro.

### Reveal (signature)

Una sola animación de entrada, compartida por toda la página: `[data-reveal]`
sube 18px y aparece en `calc(var(--beat) * 2)` con `ease-plop-out`. El estado
oculto solo existe bajo `.js-reveal`, que se añade antes del primer pintado.
Sin JavaScript, nada está oculto jamás, y `reveal.ts` desarma la clase si no
hay `IntersectionObserver`.

### Scroll suave (Lenis)

`src/scripts/smooth-scroll.ts` monta Lenis sobre el documento, no sobre un
wrapper transformado: `position: sticky`, `IntersectionObserver` y el riel de
Cómo funciona siguen funcionando sin tocarlos. Una sola curva, `duration: 0.9`
con ease-out cuártico; suaviza la distancia que el visitante ya pidió y nunca
toma el control del scroll para conducir una secuencia.

En táctil el scroll es nativo (`syncTouch: false`): suavizar un dedo que ya
está sobre el vidrio solo agrega latencia. Los enlaces internos se manejan a
mano, porque mientras Lenis sostiene la posición el salto nativo al fragmento
se sobrescribe en el frame siguiente; el enlace de salto va instantáneo y en
todos los casos el foco se mueve al destino.

Lenis trae `respectReducedMotion: true` de fábrica; acá va en `false` a
propósito, porque si no el scroll salta mientras todo lo demás de la página
sigue animando.

### Movimiento reducido: decisión explícita

**El sitio no responde a `prefers-reduced-motion`.** Es una decisión del dueño,
tomada a sabiendas, y está aplicada en un solo sentido en los cuatro lugares
donde antes se ramificaba: el video del héroe, los videos del slider, Lenis y
el reveal. También se quitó el bloque global de
`transition-duration: 0.01ms !important`, que además aplastaba la transición de
Swiper y hacía que el slider pareciera roto en vez de simplemente quieto.

Lo que sostiene la conformidad en su lugar:

- **Un único control de reproducción** (`[data-projects-playback]`, en el
  slider), que detiene y reanuda todo lo que se mueve solo: las dos bandas, los
  videos del portfolio y los fondos líquidos —estos últimos vía
  `:root[data-motion-paused]`. WCAG 2.2 SC 2.2.2 pide que el movimiento
  automático de más de cinco segundos sea detenible, no que no exista; el
  control es lo que cumple ese criterio ahora, y por eso borrarlo saca a la
  página de AA. `scripts/a11y.mjs` falla si no está.
- **Nada queda escondido.** El reveal corre para todos, y `scripts/a11y.mjs`
  verifica que tras recorrer la página entera no quede un solo `[data-reveal]`
  bajo opacidad 1.

El video del héroe es la excepción sin control: es decorativo, mudo y va
detrás del scrim. Si alguna vez se quiere volver atrás, el camino es envolver
el bloque de reveal en `@media (prefers-reduced-motion: no-preference)` y
devolver el guardia al script del `<head>` de `BaseLayout.astro`.

### Named Rules

**La Regla del Beat.** El sitio tiene un reloj: `--beat: 320ms`. Las apariciones
y las transiciones de riel corren en múltiplos del beat (640ms); el feedback
inmediato de estado (hover, color de borde, foco) corre en la capa rápida de
180ms. No se inventan duraciones fuera de estas dos.

**La Regla del Contenido Primero.** Ningún contenido depende de JavaScript para
existir. La animación, el slider y la validación son mejoras sobre un HTML que
ya es correcto y legible.

## Do's and Don'ts

### Do:

- **Do** usar el azul de marca como superficie completa y reservar el lima para
  la acción (*La Regla del Lima Único*).
- **Do** apoyar el cuerpo de texto sobre `plop-blue-deep` o `plop-blue-dim`
  cuando el fondo es azul, para que el contraste supere 4.5:1.
- **Do** teñir el texto secundario desde su propio fondo con `.muted` dentro de
  `.on-blue` / `.on-ink` / `.on-white`.
- **Do** poner los `max-width` en `ch` sobre el propio titular, nunca sobre un
  wrapper de 16px.
- **Do** montar toda sección nueva sobre `.shell` + `.spine-grid` y respetar
  `--section-space`.
- **Do** marcar precios, pasos y conteos con `[data-numeric]`.
- **Do** mantener un único anillo de foco lima de 3px, visible sobre cualquier
  fondo.
- **Do** dar a cada control interactivo al menos 44×48px de área táctil.
- **Do** usar el SVG aprobado del wordmark, con su área de seguridad equivalente
  a la altura de la `o`.
- **Do** mantener la iconografía en la familia autoral: 24px, trazo 2px,
  extremos redondos.

### Don't:

- **Don't** añadir `box-shadow`, `drop-shadow`, glow ni `backdrop-filter`: el
  sistema es plano y la profundidad es tonal.
- **Don't** oscurecer media con velos negros; el scrim se pinta en azul
  profundo.
- **Don't** usar lima como fondo de áreas grandes ni como color de texto pequeño
  sobre blanco.
- **Don't** introducir grises neutros para texto secundario.
- **Don't** introducir violeta, rosa u otro acento sin una razón jerárquica; más
  de dos o tres acentos simultáneos rompen el mundo.
- **Don't** mezclar familias de iconos, pesos de trazo ni glifos tipográficos
  usados como iconos.
- **Don't** reconstruir el wordmark con una fuente, recolorearlo, inclinarlo ni
  añadirle efectos.
- **Don't** usar glassmorphism, neón, estética gamer ni gradientes multicolor.
- **Don't** animar elemento por elemento ni inventar duraciones fuera del beat de
  320ms y la capa rápida de 180ms.
- **Don't** ocultar contenido detrás de JavaScript ni depender de él para que el
  slider, el formulario o la revelación muestren información.
- **Don't** reintroducir la secuencia de storytelling de cuatro escenas con la
  laptop ni ninguna animación de scroll por fotogramas: el héroe es video de
  fondo y la prueba es el slider.

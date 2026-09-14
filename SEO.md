# SEO.md — indexación en buscadores y en IA

Cómo se hace legible este sitio para los buscadores **y** para los modelos de
lenguaje, de dónde sale cada artefacto y qué tienes que hacer al añadir una
página.

`DESIGN.md` manda sobre el sistema visual y `STYLES.md` sobre el CSS. Este
archivo manda sobre todo lo que ve un crawler: metadatos, datos estructurados,
tarjetas sociales, el sitemap, `robots.txt` y los espejos en texto plano.

Documenta *este* sitio. Para llevar la misma estructura a otro proyecto Astro,
`specs/seo-ai-astro.md` es la versión portable: las mismas decisiones sin las
particularidades de PLOP.

## 1. La forma del sistema

Dos audiencias leen este sitio, y leen cosas distintas.

Un **crawler de búsqueda** lee el HTML renderizado: el `<title>`, la meta
description, el canonical, el grafo JSON-LD, los encabezados. Todo eso lo
emite `src/layouts/BaseLayout.astro` a partir de props que le pasa la página.

Un **modelo de lenguaje** lee texto. No ejecuta las animaciones de scroll, no
abre el slider de Swiper y no debería tener que quitar markup para encontrar
el precio de un plan. Por eso cada página existe además como markdown, y el
sitio publica un índice de esos espejos.

```text
/                          página HTML        ← crawler
/index.md                  espejo markdown    ← modelo
/llms.txt                  índice anotado     ← modelo
/llms-full.txt             el sitio entero en un archivo
/robots.txt                política de rastreo
/sitemap-index.xml         lo genera @astrojs/sitemap en el build
```

Nada de la capa de texto se escribe dos veces. Un solo módulo la construye:

```text
src/data/page-markdown.ts   ← la fuente única de los espejos en texto plano
  ├─ src/pages/[...slug].md.ts    cada hermano .md
  ├─ src/pages/llms.txt.ts        el índice
  └─ src/pages/llms-full.txt.ts   la concatenación
```

Son **endpoints, no scripts**. No hay paso postbuild ni archivo en `public/`
que regenerar a mano: se recalculan en cada petición de `npm run dev` y se
escriben en `dist/` en cada `npm run build`.

## 2. Añadir una página

Pasa `title` y `description` — ambas son props obligatorias, así que una
página sin ellas no compila.

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { pageSchema, breadcrumbSchema } from "../data/schema.ts";

const title = "Nome da página";
const description = "…"; // 110–165 caracteres
---

<BaseLayout
  title={title}
  description={description}
  schema={[
    pageSchema({ name: title, description, path: "/rota/" }),
    breadcrumbSchema([{ name: title }]),
  ]}
>
```

Después, si la página debe tener espejo de texto, añádela a `textPages()` en
`src/data/page-markdown.ts`. Si no debe tenerlo, pasa `markdown={false}` para
que el layout deje de anunciar un espejo que no existe.

Rutas que hoy **no** tienen espejo a propósito: `/404/` (también `noindex`) y
las páginas 2..n del listado del blog, que son porciones de una lista que
`/blog.md` ya contiene entera.

### Longitud de la description

Apunta a **110–165 caracteres**. Por debajo, el snippet del resultado no dice
nada; por encima, Google lo corta a mitad de frase. `BaseLayout` avisa en dev:

```text
[seo] /rota/: description is 89 chars (aim for 110-165).
```

El aviso es solo de dev. Es un empujón mientras escribes la página, no una
barrera de build — el build nunca falla por esto.

### Nunca reescribas a mano un dato que vive en los datos

`SITE_DESCRIPTION`, en `src/data/site.ts`, se construye a partir de
`entryPrice()` en `src/data/plans.ts`. Esto no es decoración: la meta
description del home citó "a partir de R$ 900" durante mucho tiempo después de
que el plan más barato pasara a R$ 1.000. Si una frase contiene un precio, un
recuento o una fecha que ya existe en un módulo de datos, interpólalo.

## 3. Contrato de metadatos — `BaseLayout`

| Prop | Default | Qué hace |
|---|---|---|
| `title` | obligatoria | `<title>`, `og:title`. Se le añade `— PLOP! Sites` salvo que el título ya sea el nombre del sitio. |
| `description` | obligatoria | `<meta name="description">`, `og:description`. |
| `image` | `OG_IMAGE` | Tarjeta social. Relativa a la raíz o absoluta; se resuelve contra `SITE_URL`. |
| `imageAlt` / `imageWidth` / `imageHeight` | valores de la tarjeta del sitio | `og:image:alt` / `:width` / `:height`. |
| `ogType` | `"website"` | `"article"` en un artículo del blog. |
| `article` | — | `{ publishedTime, modifiedTime, section? }`, ISO 8601. Solo se lee cuando `ogType` es `"article"`. |
| `schema` | — | Un objeto JSON-LD o un array de ellos. Se emite después del grafo global del sitio. |
| `noindex` | `false` | Añade `noindex,nofollow` y suprime el enlace al markdown. |
| `markdown` | `true` | Si se anuncia o no un hermano `.md`. |

La URL canónica siempre se deriva de `Astro.url.pathname` — no hay prop para
ella y no debería haberla.

Cada página lleva además dos nodos JSON-LD que nunca pide: la organización
`ProfessionalService` y el `WebSite`. Los emite el layout para que el sitio
entero se lea como un único editor y no como una docena de negocios sin
relación que casualmente comparten nombre.

## 4. Los espejos markdown

Cada espejo es `renderTextPage()` aplicado a un `TextPage`:

```text
# Título

> description

URL: https://plopsites.com.br/rota/
<líneas de metadatos: fechas, categoría, tiempo de lectura…>

---

<cuerpo>

---

PLOP! Sites — https://plopsites.com.br/
```

La URL canónica en HTML se indica dentro del cuerpo a propósito: un modelo que
cite el espejo debe enlazar al lector a la página, no al `.md`.

De dónde sale cada cuerpo:

| Espejo | Fuente | Riesgo de desfase |
|---|---|---|
| `/blog/<slug>.md` | `entry.body` de la colección `blog`, literal | ninguno |
| `/privacidade.md` | `entry.body` de la colección `legal`, literal | ninguno |
| `/blog.md` | generado desde la colección | ninguno |
| `/index.md` | `PLANS` + `PROJECTS` + `FAQ` + `site.ts`, más `HOME_PROSE` | solo `HOME_PROSE` |

`HOME_PROSE` es el único bloque del sitio que se mantiene a mano. Existe porque
el argumento de apertura del home vive dentro de `Hero.astro` y `About.astro`
como `<span>`s animados, y no hay forma de leerlo de vuelta desde ahí.
**Limítalo a las afirmaciones que esas secciones hacen de verdad, y a nada
más** — todo lo que viene después en `homeBody()` es generado y no necesita
mantenimiento. Si reescribes el hero, reescribe `HOME_PROSE` en el mismo
commit.

Esta es también la razón de que la política de privacidad sea una colección de
contenido y no markup dentro de `privacidade.astro`: era la única página cuya
prosa *podía* dejar de estar duplicada, así que se dejó.

### Convención de URLs

```text
/                  → /index.md
/privacidade/      → /privacidade.md
/blog/             → /blog.md
/blog/<slug>/      → /blog/<slug>.md
```

`mdPathFor()`, en `page-markdown.ts`, es el único sitio donde está escrita esa
regla.

Los espejos se descubren por dos vías: el `<link rel="alternate"
type="text/markdown">` en el head de la propia página, y los enlaces anotados
de `/llms.txt`. Están **deliberadamente fuera del sitemap** —
`@astrojs/sitemap` solo recorre rutas de página, así que los endpoints quedan
excluidos sin esfuerzo, y un sitemap que listara `/blog/x/` y `/blog/x.md` le
estaría pidiendo al crawler que indexe el mismo texto dos veces.

En el build estático se escriben como archivos reales, así que Cloudflare
Workers Static Assets los sirve por extensión. Las cabeceras `content-type`
que fija el endpoint valen en `astro dev`.

## 5. `llms.txt` y `llms-full.txt`

`/llms.txt` sigue la convención llms.txt: un H1, un blockquote de resumen, un
párrafo de contexto y luego secciones de enlaces anotados. Cada enlace apunta a
un espejo `.md`, de modo que quien lo siga reciba texto y no markup. Los planes
y los datos de contacto se renderizan en línea desde los módulos de datos.

`/llms-full.txt` es la concatenación de todos los espejos, para un modelo que
prefiere leer una vez a seguir una docena de enlaces. Se fecha por el contenido
más reciente, no por el reloj del build, así que una recompilación que no
cambió nada produce un archivo idéntico byte a byte.

Ambos se regeneran solos. No hay nada que ejecutar.

## 6. `robots.txt`

`src/pages/robots.txt.ts`, no un archivo en `public/` — así la línea del
sitemap se deriva de `SITE_URL` en vez de reescribirse al lado.

Los crawlers de IA van nombrados uno a uno en `AI_AGENTS`. Un `User-agent: *`
a secas solo significa *no prohibido*; un bloque `Allow` explícito es la
diferencia entre ser tolerado y ser invitado, y este sitio quiere que lo lean
— para eso están `/llms.txt` y los espejos.

`/api/` va en `Disallow`: es el handler de contacto del Worker, no hay nada que
indexar ahí y ningún crawler debería estar haciéndole POST.

Para dejar de permitir un agente, quítalo del array. Para bloquearlo
activamente, dale su propio bloque `Disallow: /` en vez de borrarlo — el
silencio y la negativa son señales distintas.

## 7. Sitemap

`@astrojs/sitemap`, configurado en `astro.config.mjs`:

- **`lastmod`** se lee del frontmatter de las colecciones (`updatedAt ??
  publishedAt`) en tiempo de configuración, antes de que exista la capa de
  contenido — de ahí la pequeña regex sobre el frontmatter en el config en
  lugar de una llamada a `getCollection()`.
- **`priority`** según la forma de la ruta: home 1.0, `/blog/` 0.8, artículos
  0.7, el resto 0.3.
- **`changefreq`**: semanal bajo `/blog/`, mensual en lo demás. Usa los valores
  de `ChangeFreqEnum`, no las cadenas sueltas — el config corre bajo
  `// @ts-check` y las cadenas no pasan el tipado.
- **`filter`** descarta las páginas paginadas del listado.

> El sitemap solo se emite en `astro build`, nunca en `astro dev`. Es inherente
> a la integración y no merece la pena sortearlo: haz un build para
> inspeccionarlo. Todo lo demás de este archivo sí funciona en dev.

## 8. Datos estructurados

`src/data/schema.ts` construye el JSON-LD. Se ensambla desde los mismos módulos
que renderizan las páginas — `PLANS`, `PROJECTS`, `FAQ` — y nunca se reescribe
dentro de una plantilla, así que un precio editado en `plans.ts` cambia el rich
result en el mismo commit.

Los nodos se enlazan por `@id`, nunca se repiten: existe un único
`ORGANIZATION_ID` y un único `WEBSITE_ID` para todo el sitio, y el grafo de
cada página los referencia.

| Constructor | Lo usa |
|---|---|
| `organizationSchema()` / `websiteSchema()` | el layout, en todas las páginas |
| `pageSchema({ type?, name, description, path })` | todas las páginas; `type` varía (`WebPage`, `CollectionPage`…) |
| `breadcrumbSchema(trail)` | toda página bajo la raíz; la última miga no lleva `item` |
| `faqSchema()` / `plansSchema(anchorOn)` / `projectsSchema()` | el home |

`plansSchema()` recibe la ruta donde viven las anclas de los planes. El sitio
es un one-pager, así que es `/`.

Los artículos construyen su nodo `BlogPosting` en línea, dentro de
`src/pages/blog/[slug].astro`, porque todo lo que contiene sale del frontmatter
del propio post.

## 9. Open Graph y la tarjeta social

La tarjeta por defecto es `public/assets/og/plop-og.jpg` — 1200×630, ~32 KB,
producida por:

```bash
npm run og      # node scripts/og-image.mjs
```

Determinista: Chromium headless renderiza un SVG en el lenguaje visual del
propio sitio (rampa azul, la masa líquida de GooeyBackground) alrededor del
**wordmark vectorial aprobado**, incrustado desde `src/assets/img/logo.svg`.
Según `AGENTS.md` §6 el logo nunca se recrea con tipografía. Reejecutarlo
reproduce el mismo archivo, por eso es un script bajo demanda y no un paso del
build.

**JPEG, no WebP.** WhatsApp no previsualiza una tarjeta WebP, y ahí es donde se
comparten la mayoría de los enlaces de este sitio. Los artículos siguen la
misma regla: la portada se vuelve a derivar a JPEG 1200×630 con `getImage()` en
lugar de reutilizar el WebP 16:9 que muestra la página.

```ts
const ogCard = await getImage({
  src: cover, width: 1200, height: 630, format: "jpg", fit: "cover",
});
```

Las rutas viven en `src/data/site.ts` (`OG_IMAGE`, `OG_IMAGE_ALT`,
`OG_IMAGE_WIDTH/HEIGHT`) y las leen tanto el layout como
`organizationSchema()`. No escribas esa ruta a mano en ningún otro sitio — una
vez estuvo escrita a mano en dos lugares, ambos apuntando a un archivo que no
existía, y por eso todas las páginas que no eran artículo servían una tarjeta
404.

## 10. Verificación

```bash
npm run check      # astro check — debe reportar 0 errores
npm run build      # debe completar; nunca se publica un build roto (AGENTS §25)
```

Tras un build, `dist/` debe contener `llms.txt`, `llms-full.txt`, `robots.txt`,
`index.md`, `privacidade.md`, `blog.md` y un `.md` por artículo.

En dev los endpoints responden directamente:

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  http://localhost:4321/llms.txt
```

Conviene revisar a mano después de un cambio de contenido o de precios:

- Que `/index.md` cite las mismas cifras que las tarjetas de planes — comparten
  `PLANS`, así que una discrepancia significa que algo se reescribió a mano
  donde debería haberse importado.
- Que el `.md` de un artículo contenga su cuerpo fuente sin alterar.
- Rich Results Test sobre `/` y sobre un artículo.
- El depurador de tarjetas de Facebook o LinkedIn sobre `/` y sobre un
  artículo: la imagen tiene que cargar de verdad, y el artículo debe reportar
  `og:type=article`.

## 11. Límites conocidos

- El sitemap no se regenera en `dev` (§7).
- `HOME_PROSE` puede desfasarse respecto del texto del hero; nada lo detecta
  (§4).
- El control de longitud de la description es un aviso de dev, no una barrera
  de build (§2).
- No hay feed RSS. Si se añade, enlázalo desde el head del layout y desde
  `/llms.txt`.

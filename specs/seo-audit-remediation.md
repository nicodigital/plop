# Spec: remediación de la auditoría SEO

Plan de trabajo por etapas para corregir los 18 hallazgos de la auditoría del
**17 de septiembre de 2026** sobre `plopsites.com.br`. Health score de partida:
**70/100**.

Informe completo:
<https://claude.ai/code/artifact/6a9dc03b-b29a-4c0c-9958-4d422a05624f>

`AGENTS.md` manda sobre cómo se escribe el código, `DESIGN.md` sobre el sistema
visual y `SEO.md` sobre lo que ve un crawler. Este spec no los reemplaza: dice
**qué** hay que arreglar, **en qué orden** y **cómo se verifica**. Cuando una
tarea toque metadatos, datos estructurados o espejos markdown, `SEO.md` sigue
siendo la fuente de verdad sobre la forma de hacerlo, y hay que actualizarlo si
el contrato cambia.

---

## 1. Por qué por etapas

Las tareas no son independientes. Tres restricciones fijan el orden:

1. **Latencia de datos.** El alta en Search Console y Bing no indexa nada por sí
   sola: arranca un reloj de semanas. Cuanto más tarde se hace, más tarde llega
   la información con la que se decide el resto.
2. **Dependencias duras.** Las citaciones no tienen a qué apuntar sin un Perfil
   de Empresa. Las reseñas necesitan el perfil creado. Las páginas verticales
   necesitan un caso del sector que hoy no existe.
3. **Riesgo de hacerlo al revés.** Marcar reseñas que no existen o publicar
   verticales sin prueba no es "adelantar trabajo": es exponerse a una acción
   manual o a publicar páginas vacías.

Cada etapa se cierra antes de abrir la siguiente. La única excepción es la
Etapa 1, cuyas altas de consola pueden dispararse en paralelo con la Etapa 0
porque no tocan el repo.

---

## 2. Reglas que aplican a todas las etapas

- **Definición de hecho:** la de `AGENTS.md` §31, más `astro check` y
  `astro build` en verde antes de considerar cerrada cualquier tarea de código.
- **Un commit por etapa como mínimo**, con los cambios agrupados por tema. No
  mezclar etapas en un mismo commit.
- **Producción sale del working tree.** Hoy el sitio en vivo tiene cambios sin
  commitear. Antes de la Etapa 0, commitear lo pendiente para que el repo vuelva
  a ser un registro fiel de lo que está en el aire.
- **Tareas de consola vs. tareas de repo.** Las marcadas `[consola]` no se
  resuelven con código y no puede hacerlas un agente: requieren tu cuenta.

### 2.1 Qué NO hacer

Estas salieron explícitamente de la auditoría y están acá para que nadie las
"arregle" por iniciativa propia:

- **No** agregar `url` a los 31 nodos `Service` de los `OfferCatalog`. Son
  líneas de características ("Hospedagem inclusa"), no páginas. Repetir la URL
  del plan 31 veces no aporta nada.
- **No** agregar `AggregateRating` ni `Review` hasta que existan reseñas reales.
  Markup de reseñas fabricado se arriesga a una acción manual.
- **No** construir páginas por ciudad donde no hay presencia real. Es el patrón
  que persigue el control de spam local de Google.
- **No** publicar páginas verticales sin un caso propio de ese sector.
- **No** envolver los videos en `VideoObject`. Son capturas de scroll de
  interfaz, no contenido que alguien busque y mire.
- **No** eliminar el `FAQPage`. Google retiró los rich results de FAQ el
  2026-05-07, así que ya no da beneficio en SERP, pero tampoco tiene riesgo.
- **No** aplanar `sitemap-index.xml`. La estructura index → hijo es estándar y
  correcta.

---

## 3. Etapa 0 — Correcciones críticas

**Objetivo:** que deje de haber daño en vivo. Sin dependencias.
**Esfuerzo estimado:** 1–2 h.

### 3.1 Retirar la dirección particular

`Avda. Iguaçu 1455, ap. 34 C` se publica hoy en tres superficies: footer
visible, `PostalAddress` del JSON-LD y un `hasMap` que enlaza directo al
departamento.

- En `src/data/site.ts`, quitar `street` del objeto `ADDRESS` y recomponer
  `ADDRESS_LINE` para que imprima solo ciudad, estado y país.
- En `src/data/schema.ts`, quitar `streetAddress` del `PostalAddress` y eliminar
  `hasMap`. Conservar `addressLocality`, `addressRegion`, `addressCountry` y
  `postalCode`: son suficientes para que `LocalBusiness` siga siendo válido.
- Revisar `src/components/layout/Footer.astro` para que el bloque `<address>` no
  quede con una coma o un separador huérfano.

**Estado final (2026-09-17) — la dirección ya no se publica en ninguna forma.**

Se resolvió en dos pasos. Primero se retiraron `street` y `hasMap`, y se corrigió
el CEP: el valor `84240-030` era de la región de Ponta Grossa y el dueño confirmó
el correcto, `80240-030`. Después, **Google indicó retirar la dirección física**
al publicar el Perfil de Empresa, así que también se eliminaron `postalCode` y
`postalDisplay`.

El `PostalAddress` publicado queda en su mínima expresión válida:

```json
{"@type":"PostalAddress","addressLocality":"Curitiba",
 "addressRegion":"PR","addressCountry":"BR"}
```

Y el footer imprime `Curitiba, Paraná, Brasil.` Esto concuerda con un perfil de
área de servicio con dirección oculta, que es la condición que Google pone para
un negocio sin atención presencial. `LocalBusiness` no necesita calle ni CEP
para seguir siendo elegible.

Efectos colaterales, ya aplicados: se eliminaron los exports `MAP_URL` y
`ADDRESS_LINE` de `site.ts` — el primero porque su único consumidor era el
`hasMap` original, el segundo porque no lo consumía nadie en todo `src/`.
`hasMap` volvió el mismo día apuntando al perfil (ver §6.1), no a una dirección.

### 3.2 Servir la página 404

`dist/404.html` se construye completa (40.354 bytes) y nunca se sirve:
producción devuelve 404 con cuerpo vacío.

En `wrangler.jsonc`, dentro del bloque `assets`:

```jsonc
"assets": {
  "directory": "./dist",
  "not_found_handling": "404-page"
}
```

### 3.3 Corregir los cuatro defectos de copy

| Archivo | Actual | Debe decir |
|---|---|---|
| `src/components/sections/ProjectsSlider.astro:13` | `inteligencia artifical` | `inteligência artificial` |
| `src/components/sections/ProjectsSlider.astro:14` | `para não parecer no resto` | redacción correcta en pt-BR |
| `src/components/sections/About.astro:47-50` | renderiza `parardepois` | espacio dentro del `<span>` o `&#32;` |
| `src/data/nav.ts:19` | comentario "the other twenty-three" | 30 |

El de `About.astro` no se ve en el código fuente: el minificador colapsa el
espacio entre los dos `<span>`. Verificar en `dist/index.html`, no en el `.astro`.

### 3.4 Retirar las dos pruebas falsas

`src/data/projects.ts` publica como prueba de trabajo entregado:

- línea 73 — `moviruta` apunta a `https://moviruta.nicolasgonzalez.dev/`, un
  subdominio personal, y está marcado `featured: true`, o sea que es el primer
  slide de la home;
- línea 229 — `pointer` apunta a `https://prueba.pointer.uy/`, un staging.

Y `/projetos/` se titula "Todos os sites entregues **e no ar**" mientras dos de
los treinta muestran la insignia "Em desenvolvimento".

Decidí una de estas tres, en orden de preferencia:

1. Sacar ambos proyectos del portfolio hasta que tengan URL definitiva.
2. Conservarlos pero quitar `featured` de `moviruta` y reescribir el título de
   `/projetos/` para que no afirme que todo está en el aire.
3. Apuntar ambos a su dominio definitivo si ya existe.

**Definición de hecho de la Etapa 0**

- `curl` a una URL inexistente devuelve la 404 de marca, no 0 bytes.
- El footer y el JSON-LD no contienen `streetAddress` ni número de apartamento.
- `grep -r "artifical\|inteligencia" src/` no devuelve nada.
- `grep -o "parar</span>" dist/index.html` no devuelve nada tras rebuild.
- Ningún `featured: true` apunta a un subdominio personal o a un staging.

---

## 4. Etapa 1 — Infraestructura, performance e instrumentación

**Objetivo:** cerrar la brecha de hardening, sacar la home de la banda mala de
LCP y arrancar el reloj de los datos.
**Depende de:** Etapa 0 cerrada, salvo §4.3 que puede ir en paralelo.
**Esfuerzo estimado:** 4–6 h de código + 30 min de consola.

### 4.1 Headers de seguridad

No hay ningún header de seguridad en ninguna ruta, y `Content-Type` no declara
`charset=utf-8`. `worker/index.ts` pasa todo directo a `env.ASSETS.fetch()`.

Crear `public/_headers`, que Cloudflare Workers Static Assets lee solo, sin
tocar el Worker. Mínimo:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Content-Security-Policy` acotada a los orígenes reales: Turnstile
  (`challenges.cloudflare.com`), Google Fonts si aplica, y los assets propios.
- `charset=utf-8` en el `Content-Type` de HTML.

La CSP hay que probarla contra el formulario de contacto antes de dar por
cerrada la tarea: un `script-src` mal acotado rompe Turnstile en silencio.

### 4.2 Sacar el video del hero del camino crítico de LCP

**Diagnóstico medido:** LCP de 3,39 s en móvil throttled, con el `<video>` como
elemento LCP. El desglose es `TTFB 343ms + delay 505ms + load 2.424ms + render
113ms`. Un póster de 54 KB carga en ~270 ms, así que los 2.424 ms son el WebM de
828 KB. La causa es que el script llama `.play()` apenas parsea, lo que mueve el
candidato LCP del póster al primer frame decodificado.

Dos palancas, idealmente las dos, en `src/components/sections/Hero.astro`:

1. **Diferir `.play()`** hasta después del `load` o de un `requestIdleCallback`,
   de modo que el candidato LCP se resuelva contra el póster.
2. **Servir una fuente móvil real** vía un segundo `<source media="(max-width:
   768px)">` con un encode más chico, o —siguiendo la prioridad móvil de
   `DESIGN.md`— no autoplayear video en viewports angostos y mostrar solo el
   póster.

Agregar además `fetchpriority="high"` al video, que Lighthouse marca como
faltante. El post del blog ya lo hace bien con su portada: reusar ese patrón.

Aplicar el mismo criterio a las páginas de proyecto (`preload`, autoplay
diferido). Hoy `/projetos/silentroom/` pasa con 2,29 s, pero sin margen.

### 4.3 `[consola]` Las tres altas

Ninguna requiere código. Hacerlas ya, porque el dato tarda semanas en llegar.

1. **Google Search Console** — propiedad de *dominio*, verificada por TXT en el
   DNS de Cloudflare. Enviar `sitemap-index.xml`, **no** el hijo `sitemap-0.xml`.
   Esperar 0/40 descubiertas hasta el primer rastreo: es normal.
2. **Bing Webmaster Tools** — tiene *Import from Google Search Console*: hereda
   verificación y sitemap en un clic. De ese índice comen Copilot y parte de
   ChatGPT Search.
3. **IndexNow** — en Cloudflare, Caching → Crawler Hints. Un interruptor.

### 4.4 `minPrice` en el plan Completo

`src/data/schema.ts:164-177`. El plan tiene `setupFrom: true` y el nombre ya
dice "Entrada, a partir de", pero el campo numérico sigue siendo `price`, que
los lectores de schema interpretan como precio cerrado. Usar `minPrice` cuando
`setupFrom` es verdadero, en el `Offer` y en el `UnitPriceSpecification`.
Essencial y Profissional no cambian.

### 4.5 El CTA secundario lavado

"Ver planos" queda translúcido y 20 px desplazado hasta ~3 s después de la
carga. No es layout shift (es `transform` + `opacity`, y el CLS sale limpio),
pero es un CTA poco legible durante el tramo en que el usuario decide. Acortar
la animación de entrada o subir la opacidad inicial.

**Definición de hecho de la Etapa 1**

- Lighthouse móvil sobre `/` da LCP **bajo 2,5 s** y el elemento LCP es el
  póster, no el video.
- El formulario de contacto envía correctamente con la CSP activa.
- `curl -I` devuelve los cinco headers y `charset=utf-8`.
- Las tres consolas verificadas, con el sitemap enviado en GSC.

---

## 5. Etapa 2 — Contenido y autoría

**Objetivo:** que el sitio tenga algo citable y alguien responsable detrás. Es
la etapa que más mueve el health score: contenido pesa 23% y hoy está en 58.
**Depende de:** Etapa 1 cerrada.
**Esfuerzo estimado:** 10–14 h.

### 5.1 Poner precios en el post de precios

`src/content/blog/quanto-custa-um-site-para-pequeno-negocio.md`, hoy 409
palabras. Las SERPs de esa consulta son 9 de 9 guías con tablas de rangos. El
post habla de dominio y hospedaje con cifras vagas y de **construcción** —la
intención real— sin ningún número.

- Bloque de resumen autocontenido de ~140 palabras al inicio, que responda la
  pregunta completa sin necesitar contexto.
- Tabla de rangos reales del mercado brasileño: construcción, dominio,
  hospedaje, mantenimiento.
- Tus propios R$ 1.000 + R$ 200 como punto de referencia nombrado. Hoy viven en
  `plans.ts` y en `llms.txt` pero nunca aparecen en el post.
- Sección explícita sobre por qué la mensualidad no es solo hospedaje.
- Citar fuentes: Registro.br para el dominio, y enlazar la documentación real
  cuando se afirme un umbral técnico.

Revisar el slug: `pequeno-negocio` contradice la regla de lenguaje de
`AGENTS.md` §13. Si se cambia, hay que hacerlo **antes** de que acumule enlaces,
y con redirect.

### 5.2 Una persona con nombre

Hoy `BLOG_AUTHOR` es la organización, no existe `/sobre` —aunque `AGENTS.md`
§29 la lista en la navegación— y `sameAs` tiene una sola entrada. Los posts
hacen afirmaciones técnicas sin nombre ni credencial. Es la causa directa del
**7/25** en autoridad.

- Crear `src/pages/sobre.astro` con nombre real, bio y trayectoria.
- `src/data/blog.ts:35` — cambiar el autor a una `Person` con nombre.
- Emitir `author` como nodo `Person` en el `BlogPosting`, enlazado por `@id`.
- `src/data/schema.ts:93` — expandir `sameAs` con LinkedIn, Instagram y GitHub
  reales. Solo perfiles que existan.
- Añadir `/sobre` a la navegación y a `page-markdown.ts` para que tenga espejo.

### 5.3 Curitiba en prosa

Aparece solo en el JSON-LD y en el footer, nunca en un encabezado ni en una
frase. La recuperación por embeddings corre sobre texto, no sobre
`addressLocality`.

- Un párrafo de ~150 palabras en la home que diga en prosa: estudio en Curitiba,
  atendiendo a todo Brasil, en portugués, español e inglés, con el precio de
  entrada y qué cubre la mensualidad.
- Revisar `<title>` y H1 de la home. Hoy son *Sites profissionais para negócios
  independentes* y *Seu site pronto para IA!*, y ninguno contiene el sustantivo
  del servicio ni la ciudad. El ángulo de IA puede vivir en el H2.
- Reflejar el párrafo nuevo en `HOME_PROSE` de `src/data/page-markdown.ts`.

### 5.4 Enlaces internos en el blog

Los seis posts tienen **cero** enlaces en el cuerpo. El blog es una isla: su
autoridad no fluye y sus lectores no llegan a la oferta salvo por el header.
Dos o tres enlaces por post a `/projetos/`, a `/#planos` o a otro post.

### 5.5 Legal y entidad

- `src/content/legal/privacidade.md` afirma que no hay rastreo de terceros,
  pero la home carga Turnstile desde `challenges.cloudflare.com`. Declarar
  Turnstile y la transferencia internacional (LGPD art. 33).
- Identificar al encargado de datos, como espera el art. 41.
- Publicar CNPJ y razón social en el footer. Es lo primero que chequea un
  comprador brasileño cauto, y hoy no está en ningún lado.
- `src/scripts/analytics.ts` ya empuja eventos a `window.dataLayer`. Hoy es
  inerte porque no hay contenedor, pero la política tiene que estar corregida
  **antes** de que se cargue uno.

**Estado al 2026-09-17**

Hecho: §5.1 completa (post reescrito con tabla de rangos, slug movido a
`/blog/quanto-custa-um-site/` con 301 en `public/_redirects`), §5.2 salvo
`sameAs`, §5.3 completa (sección `Studio.astro` en la home + espejo markdown),
§5.4 completa (20 enlaces internos, cada post emite y recibe), §5.5 salvo CNPJ.

Bloqueado por datos que solo tiene el dueño del sitio:

- **`AUTHOR.profiles` en `src/data/site.ts` tiene `https://nicolasgonzalez.dev/`**
  —verificada, y publica el mismo teléfono que este sitio, que es lo que
  convierte un `sameAs` en corroboración. Falta agregar LinkedIn / Instagram /
  GitHub cuando existan. `personSchema()` emite `sameAs` solo con lo que haya:
  una URL que da 404 es la única afirmación del grafo que cualquiera desmiente
  en una sola petición.
- ~~CNPJ~~ hecho: `46.793.328/0001-03`, en el footer, en `taxID` de
  `organizationSchema()`, en la política y en el bloque de contacto de
  `llms.txt`. **La razón social no se publica a propósito**: en un empresário
  individual es el nombre completo del dueño, es más revelador que el número y
  no es exigida por nada. El texto visible usa el nome fantasia.
- **El proveedor de e-mail transaccional no está nombrado** en la política
  (`src/content/legal/privacidade.md`, sección "Transferência internacional").
  El art. 33 de la LGPD se cumple mejor nombrándolo.

No tocado por decisión previa del dueño: el `<title>` y el H1 de la home. La
ciudad entró por el H2 de la sección nueva, que era el objetivo real de §5.3.

**Definición de hecho de la Etapa 2**

- Preguntarle a un modelo cuánto cuesta un sitio en Brasil y que pueda citar una
  cifra tuya desde el post. Hoy no puede.
- `/sobre` existe, está en la navegación, tiene espejo markdown y el
  `BlogPosting` referencia una `Person`.
- La política menciona Turnstile y el footer muestra CNPJ.

---

## 6. Etapa 3 — Presencia local `[consola]`

**Objetivo:** existir fuera del propio dominio. Local partió en **20/100**, que
es lo que corresponde a un sitio sin huella externa.
**Depende de:** Etapa 0 §3.1 cerrada — el perfil no se crea con una dirección
particular publicada en el sitio.
**Casi todo fuera del repo.**

Estrictamente en este orden, porque cada paso es el insumo del siguiente:

1. **Verificar si ya existe un Perfil de Empresa.** La auditoría no pudo
   confirmarlo. Mirar en business.google.com con tu cuenta.
2. **Crearlo o reconfigurarlo como negocio de área de servicio**, con dirección
   **oculta**, áreas de servicio (Curitiba + región metropolitana, o todo
   Brasil) y categoría primaria "Web designer" — la categoría equivocada es el
   factor negativo más fuerte del pack local.
3. **Reseñas después de cada entrega.** Cero hoy. El beneficio de ranking pide
   velocidad sostenida, no un empujón único.
4. **Citaciones brasileñas**, recién con el perfil vivo: Reclame Aqui (el
   equivalente real a BBB, vale reclamarlo aunque no esperes quejas), WhatsApp
   Business formalizado, LinkedIn de empresa, Instagram/Facebook Business, y los
   directorios Guia Mais, Apontador y TeleListas.
5. **Buscar el CNPJ en Econodata y CNPJ.biz.** Esos agregadores crean fichas
   solas desde datos de Receita Federal: puede haber una circulando con NAP
   incorrecto.
6. **B2B, que para un estudio rinde más que el directorio de consumo:**
   Clutch.co, GoodFirms y Workana — esta última cubre Argentina y Uruguay, donde
   ya entregaste.

### 6.1 Qué vuelve al schema cuando el perfil exista

La Etapa 0 retiró `streetAddress` y `hasMap`. **No fue renunciar a la presencia
local: es el estado que el perfil necesita.** Un negocio de área de servicio
lleva la dirección oculta en el Perfil de Empresa, y un sitio que muestra la
calle mientras el perfil la oculta produce la discordancia de NAP que disparan
las señales de spam.

El pack local no se gana desde el JSON-LD del sitio —ahí no hay palanca de
ranking— sino desde el perfil. El schema solo tiene que concordar con él.

Cuando el perfil esté verificado, en `src/data/schema.ts`:

- **Reponer `hasMap`** apuntando al *place URL* del perfil, no a una búsqueda de
  Maps por dirección. Es el valor que Google espera y el que no expone la calle.
- **Agregar el perfil a `sameAs`**, junto con LinkedIn e Instagram a medida que
  existan.
- **Evaluar `geo`** con latitud y longitud a cinco decimales. Solo si el perfil
  declara un área de servicio y no un pin en una puerta.
- **`openingHoursSpecification`** si vas a declarar horario de atención, aunque
  sea el de respuesta por WhatsApp.

Mantener `addressLocality`, `addressRegion` y `postalCode` como están: son
suficientes para la elegibilidad de `LocalBusiness` y concuerdan con un perfil
de dirección oculta.

### 6.2 Contenido local, que sí depende del sitio

Esto no espera al perfil y es lo que hoy falta (ver Etapa 2 §5.3): Curitiba
aparece solo en el JSON-LD y en el footer, nunca en prosa. La recuperación por
embeddings corre sobre texto. Un perfil verificado con un sitio que no nombra la
ciudad en ningún encabezado rinde por debajo de lo que podría.

---

## 7. Etapa 4 — Arquitectura de páginas

**Objetivo:** cubrir los tipos de página que hoy no existen.
**Bloqueada parcialmente:** solo §7.2, y solo por falta de un caso publicable
—no por falta de trabajo en el sector. §7.1 y §7.3 no dependen de nada.

### 7.1 `/planos/` como URL canónica

Hoy "Ver planos" resuelve a `/#planos`, al que no se puede mandar publicidad
limpiamente ni citar en una propuesta.

**Construirla por eso, no para rankear.** El análisis SXO revisó ~45 URLs de
resultados y encontró una sola página de precios, en una long-tail muy
refinada. Dos agencias que sí rankean en Curitiba no tienen `/planos/` ni
`/precos/`: tienen `/servicos/<servicio>/` y páginas de ciudad.

Mantener el resumen en la home y enlazar. Dar de alta la página en
`page-markdown.ts` y en el sitemap.

### 7.2 Páginas verticales — BLOQUEADA

En `site para clínica`, `site para advogado` y `site para imobiliária`,
**0 de 9 resultados son homes** en las tres SERPs. No hay página que atienda a
ese comprador: la persona del sector puntuó 36/100 en junio y 54/100 en la
segunda pasada del 2026-09-17 — sigue entre las más débiles, aunque ya no es la
última (esa es la del comprador B2B, 50/100, que se resuelve con §7.1).

**Corregido el 2026-09-17.** La versión anterior de este párrafo afirmaba que
los proyectos entregados no tienen «cero solapamiento» con esos verticales. Es
falso, y conviene no volver a creerlo:

| Vertical | Lo que hay en `projects.ts` |
| --- | --- |
| `site para advogado` | **dos** escritorios de abogados (`jorge-barrera`, `dellavalle-balbi`) |
| `site para imobiliária` | uno (`pointer`) — pero sigue en staging, `status: "wip"` |
| `site para clínica` | ninguno. Farmacêutica, dermocosmética y cuidado domiciliar son del mundo de la salud, pero quien busca una clínica quiere ver una clínica |

Lo que bloquea no es el trabajo. Es otra cosa, y hay que nombrarla bien porque
cambia lo que hay que hacer para desbloquearla:

1. **La prueba es uruguaya.** Los nueve proyectos de esos rubros son `.com.uy`,
   `.uy` o `.org`. Un abogado brasileño que entra a la vertical y hace clic en
   la prueba aterriza en un estudio uruguayo. Es el problema del §9,
   concentrado en la peor página posible para que aparezca.
2. **El caso no existe como contenido.** Cada proyecto tiene una línea
   factual; el comentario del tipo en `projects.ts` dice literalmente «No
   results, no metrics», y los clientes no se nombran por política. Problema,
   qué se construyó y resultado medible: las tres cosas están deliberadamente
   ausentes.
3. **La única inmobiliaria no está en el aire.**

Condición de desbloqueo, entonces, no es un proyecto nuevo: es **permiso de uno
de los dos estudios de abogados para nombrarlo, más un resultado contable**.
Una cifra de contactos, o incluso un antes/después de tiempo de carga. Con eso
`site para advogado` deja de estar bloqueada y el resto de la página es
investigación —normas de la OAB, funciones del sector—, no experiencia.

`site para clínica` sigue bloqueada de verdad.

Una vertical sin caso propio es una página vacía compitiendo contra páginas
llenas. El costo no es que no rankee: es sumar una página delgada más a un
sitio que ya tiene 30 en esa condición (§7.3).

Cuando se desbloquee, la estructura que usan las páginas que rankean es:
problema del sector → funcionalidades del sector (agendamento online,
conformidad OAB, catálogo de inmuebles) → nota de cumplimiento (LGPD, CFM, OAB)
→ **caso de ese sector** → planes → contacto.

### 7.3 Profundidad de las páginas de proyecto

Las 30 páginas tienen ~117 palabras con menos del 30% de texto único, y dos
pares comparten `<title>` idéntico (dos "Farmacêutica", dos "Escritório de
advocacia"). Son el 73% de las URLs indexables del sitio.

Dos caminos, a elegir:

- **Subirlas**: ~150 palabras de detalle real por proyecto —la restricción, la
  decisión de construcción, qué pedía el sector— las lleva de 30% a ~70% único
  y resuelve los títulos duplicados agregando un diferenciador.
- **Bajarlas**: dejarlas en `noindex` como destino de enlace y sacarlas del
  sitemap, concentrando la señal en `/projetos/`.

El primer camino es mejor si además habilita §7.2. El segundo es más barato.

---

## 8. Backlog

Reales, ninguno urgente. Sin etapa asignada.

- `www.plopsites.com.br` da NXDOMAIN en vez de redirigir al ápice.
- Los redirects de barra final salen en 307 en vez de 301. Es el default de
  Cloudflare Workers Static Assets; verificar si Wrangler permite cambiarlo.
- `BreadcrumbList` en JSON-LD sin breadcrumb visible en las páginas de proyecto.
- Falta `apple-touch-icon`.
- El laptop decorativo del hero muestra el titular viejo ("Seu negócio em
  destaque") en vez del actual.
- `src/pages/blog/[slug].astro` es la única ruta que no llama a `pageSchema()`.
- El `author` del `BlogPosting` duplica la identidad de la organización en vez
  de referenciarla por `@id`. Se resuelve solo con §5.2.
- Los grupos de agentes nombrados en `robots.txt` no heredan `Disallow: /api/`
  del grupo comodín. Es comportamiento de la especificación, no un bug.
- Las 30 páginas de proyecto no tienen `lastmod` porque `src/data/projects.ts`
  no guarda fechas.
- `priority` y `changefreq` en el sitemap: Google los ignora. Peso muerto
  inofensivo.
- El hero ignora `prefers-reduced-motion`, contra `AGENTS.md` §8. Está
  documentado en `Hero.astro:212-220` como decisión deliberada del dueño del
  sitio. Queda anotado por si se revisa.

---

## 9. El problema que ninguna etapa resuelve

**19 de 30 proyectos son `.uy`. Cero son `.com.br`.** Un prospecto brasileño que
hace clic en cualquier "prova" aterriza en un sitio uruguayo, en un sitio que se
presenta como estudio brasileño. No es un problema de código y no lo arregla
ninguna tarea de este spec.

Dos salidas:

1. Entregar el primer cliente brasileño y destacarlo.
2. Encuadrar el portfolio con honestidad. "Años entregando no Uruguai, agora no
   Brasil" convierte el pasivo en señal de experiencia, que es lo que en
   realidad es.

---

## 10. Medición

Volver a auditar **después de la Etapa 2**, no antes: las etapas 0 y 1 arreglan
cosas que la auditoría ya midió, y el health score no se mueve hasta que cambia
el contenido.

Para esa segunda pasada hace falta lo que esta vez faltó:

- **Clave de Google API** configurada, para tener CrUX y datos de campo reales
  en vez de laboratorio. Sin eso, INP sigue sin medirse.
- **Search Console con historial**, para saber qué se indexó de verdad.
- **Clave gratuita de Moz**, si se quiere perfil de backlinks.

Estado de partida, para comparar:

| Categoría | Peso | Base |
|---|---|---|
| Schema | 10% | 90 |
| SEO técnico | 22% | 78 |
| Imágenes (inferido) | 5% | ~80 |
| Performance (laboratorio) | 10% | 75 |
| On-page | 20% | 62 |
| Preparación para IA | 10% | 62 |
| Contenido | 23% | 58 |
| **Health score** | | **70** |

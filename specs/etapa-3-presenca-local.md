# Etapa 3 — Presença local

Documento de trabajo. Casi todo pasa fuera del repo, en consolas de terceros.
Lo que sigue es el material exacto a copiar, para que ocho fuentes digan lo
mismo en vez de ocho variantes de lo mismo.

**Depende de:** Etapa 0 §3.1 cerrada (sin dirección publicada) y Etapa 2
desplegada. Ambas cumplidas al 2026-09-17.

---

## 1. La forma canónica del nombre — decidida

**`Plop! Sites`.** Con el signo, que es la marca, y con la S mayúscula, que es
como ya figura en el Perfil de Empresa. Aplicado al 2026-09-17.

Circulaban tres formas: `Plop! sites` en el código, `Plop Sites` en el perfil y
`PLOP!` en el copy. Ahora el sitio construido solo contiene dos: el nombre
completo y el corto `Plop!` en prosa corrida, y el corto está declarado en
`alternateName` del `Organization` para que una máquina resuelva los dos a la
misma entidad.

`SITE_NAME` en `src/data/site.ts` es la única fuente: de ahí lo leen el
`<title>` de cada página, el grafo, `llms.txt`, el footer, el `aria-label` del
logo y del header, y el título de las capturas de proyecto. **No volver a
escribir el nombre a mano en ningún archivo.**

Cada citación de §4 usa el nombre completo, literal.

## 2. El bloque NAP canónico

Esto es lo que se pega, literal, en cada directorio. No reescribir.

```
Nome:        Plop! Sites
Categoria:   Web designer
CNPJ:        46.793.328/0001-03
Telefone:    +55 (41) 99939-0088
WhatsApp:    +55 (41) 99939-0088
E-mail:      ola@plopsites.com.br
Site:        https://plopsites.com.br
Cidade:      Curitiba, PR
Endereço:    não publicar (negócio de área de serviço)
Áreas:       Curitiba, São José dos Pinhais, Pinhais, Colombo,
             Araucária, São Paulo
Idiomas:     português, espanhol, inglês
```

Descripción corta (hasta ~160 caracteres):

```
Estúdio de criação de sites em Curitiba. Site profissional publicado e
cuidado todo mês: hospedagem, suporte e manutenção inclusos.
```

Descripción larga, cuando el directorio la pida:

```
O Plop! Sites é um estúdio de criação de sites em Curitiba, no Paraná, que
atende negócios independentes em todo o Brasil. O modelo cabe em duas
parcelas: uma entrada para construir o site, a partir de R$ 1.000, e uma
mensalidade que o mantém no ar — hospedagem, suporte técnico, manutenção e,
nos planos com blog, a publicação de um conteúdo por mês. Os sites são
construídos para carregar rápido, sem painel para o cliente administrar e sem
plugin para atualizar. O domínio fica sempre no nome do cliente. Atendimento
em português, espanhol e inglês.
```

**La dirección no se publica en ningún directorio.** Google pidió retirarla del
perfil por ser un negocio de área de servicio; un directorio que la muestre
reintroduce la discordancia que se evitó. Si el formulario la exige, poner solo
ciudad y estado.

---

## 3. Reseñas — el paso que más mueve el ranking

Hoy: **cero**. El beneficio viene de velocidad sostenida, no de un empujón
único: tres reseñas por mes durante seis meses valen más que dieciocho en una
semana, que además se lee como compra.

El enlace corto para pedirlas se copia del panel del Perfil de Empresa
(*Peça avaliações* → copiar enlace). No se puede derivar del CID sin la API de
Places, así que hay que sacarlo de ahí.

Mensaje para mandar por WhatsApp después de cada entrega:

```
Oi, [nome]! O site já está no ar e fico feliz com o resultado.

Se você puder deixar uma avaliação rápida no Google, ajuda muito outros
negócios a me encontrarem. Leva um minuto:

[link]

Obrigado!
```

Reglas que no conviene romper:

- Pedir siempre, a todos, no solo a quien parece contento. Filtrar a quién se
  le pide es *review gating* y es violación de las políticas de Google.
- Nunca ofrecer descuento ni nada a cambio.
- Responder todas, incluidas las malas, sin pelear. Responder también cuenta.

---

## 4. Citaciones brasileñas, en orden

Recién con el perfil vivo y verificado. Cada una usa el bloque NAP de §2 sin
modificar.

1. **Reclame Aqui** — el equivalente real a BBB en Brasil. Vale reclamar la
   ficha aunque no esperes quejas: si no la reclamás vos, existe igual y sin
   respuesta.
2. **WhatsApp Business** formalizado, con el mismo número y el mismo nombre.
3. **LinkedIn** — página de empresa, más el perfil personal enlazándola.
4. **Instagram / Facebook Business**.
5. **Guia Mais, Apontador, TeleListas** — directorios de consumo, bajo esfuerzo.

## 5. Buscar el CNPJ en los agregadores

**Econodata** y **CNPJ.biz** crean fichas solas desde datos de Receita Federal.
Ya puede haber una circulando con NAP incorrecto o con una dirección que el
perfil oculta. Buscar `46.793.328/0001-03` en ambos y corregir lo que se pueda.

## 6. B2B, que para un estudio rinde más que el directorio de consumo

- **Clutch.co** y **GoodFirms** — reseñas B2B verificadas, que es lo que mira
  un comprador de servicios.
- **Workana** — cubre Argentina y Uruguay, donde ya hay trabajo entregado.

---

## 7. Qué vuelve al schema, y cuándo

**`AggregateRating` solo cuando existan reseñas reales.** Marcar una nota
promedio sin reseñas que la respalden es motivo de acción manual, y una ficha
nueva es el peor momento posible para recibirla. La regla es: el schema refleja
lo que el perfil ya muestra, nunca se adelanta.

Cuando haya reseñas, en `src/data/schema.ts`:

- `aggregateRating` con el promedio y el conteo **exactos** del perfil.
- `review` con dos o tres, citadas textualmente, con autor y fecha.

Lo demás que puede sumarse cuando corresponda:

- `openingHoursSpecification`, si se declara horario de atención — aunque sea
  el de respuesta por WhatsApp.
- `geo` con latitud y longitud, **solo** si el perfil declara un punto y no un
  área de servicio. Hoy declara área, así que no.

`AUTHOR.profiles` en `src/data/site.ts` acepta las URLs de LinkedIn e Instagram
a medida que existan; `personSchema()` las emite en `sameAs` sin ningún otro
cambio.

---

## 8. Cómo se mide

Local partió en **20/100**, que es lo que corresponde a un sitio sin huella
externa. Las señales a mirar, en orden de aparición:

1. Impresiones y clics en el panel del Perfil de Empresa (semanas).
2. Aparición en el pack local para `criação de sites Curitiba` y variantes
   (meses, y depende de las reseñas).
3. Consultas de descubrimiento vs. directas en el perfil — la proporción dice
   si te están encontrando o si ya te conocían.

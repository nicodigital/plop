---
title: "Site lento perde cliente antes de mostrar o preço"
description: "O que acontece nos três primeiros segundos, por que o Google mede isso com os Core Web Vitals e o que de fato deixa um site pesado."
publishedAt: 2026-08-28
readingMinutes: 5
category: performance
cover: ../../assets/img/blog/site-lento-perde-cliente-isometric.webp
coverAlt: "Ilustração isométrica de um velocímetro lento diante de um navegador e um servidor, com uma pessoa esperando."
---

Quem abre um site no celular, na rua, com sinal ruim, não espera. Fecha e volta
para a busca. Você nunca fica sabendo que essa pessoa existiu.

Isso não é impressão. É o comportamento que o Google mede desde 2020 com um
conjunto de indicadores chamado Core Web Vitals, e que usa como sinal para
decidir quem aparece primeiro.

## Os três números que importam

**LCP** — quanto tempo até o maior elemento da primeira tela aparecer. A meta é
até 2,5 segundos.

**CLS** — quanto a página se mexe sozinha enquanto carrega. Sabe quando você vai
clicar num botão e ele pula para outro lugar? É isso sendo medido. A meta é
ficar abaixo de 0,1.

**INP** — quanto o site demora para responder quando você toca em alguma coisa.
A meta é até 200 milissegundos.

## O que deixa um site pesado

Quase sempre a mesma lista:

- **Imagens gigantes.** Uma foto de 4 MB tirada no celular, publicada do jeito
  que saiu. Redimensionada e convertida, a mesma foto pesa 80 KB.
- **Fontes demais.** Seis pesos de três famílias diferentes, e o texto some até
  todas carregarem.
- **Plugins acumulados.** Cada um traz seu próprio código. Dez plugins depois, o
  site carrega mais programação do que conteúdo — e é também o que faz o site
  [cair justo no mês cheio](/blog/seu-site-aguenta-a-temporada/).
- **Vídeo rodando à toa.** Um vídeo de fundo não comprimido consome dados e
  bateria de quem só queria ver o horário de funcionamento.
- **Rastreadores.** Cada pixel de anúncio adicionado é mais uma coisa para
  baixar antes da página ficar utilizável.

## O teste que você pode fazer agora

Abra o [PageSpeed Insights](https://pagespeed.web.dev/) do Google, cole o
endereço do seu site e olhe a aba de celular — não a de computador. É a de
celular que descreve a experiência da maior parte das visitas.

Se a nota estiver vermelha, o problema raramente é um só. Mas quase sempre
começa pelas imagens. Se a conta de arrumar tudo isso parecer maior que a de
recomeçar, [os números de um site novo estão
aqui](/blog/quanto-custa-um-site/).

## Velocidade não é detalhe técnico

É a primeira coisa que a pessoa sente do seu negócio, antes de ler uma linha
sobre o que você faz. Um site rápido não te faz vender sozinho. Um site lento
faz você não ser visto.

Os sites que a gente entrega são medidos com essa régua: estão todos em
[projetos](/projetos/), com o link de cada um.

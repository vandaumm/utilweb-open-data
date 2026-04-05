# 🛠️ Utilweb: Open Data & Logic Engine

Participe da nossa comunidade no Discord para colaborar: https://discord.gg/Mn8yWa3JPJ

Read in English below. / Leia em Português na seção dedicada abaixo.

Welcome to the open-source data repository of [Utilweb](https://utilweb.com.br), one of the largest utility portals in Brazil, built entirely during my night shifts. 

This repository contains the core mathematical logic and structured JSON databases that power 1,190+ free tools. The goal is to provide a clean infrastructure so developers worldwide don't have to manually map physical conversion factors or complex math formulas from scratch.

## 🌍 Global Assets (For all developers)

* conversores-db.json & conversores.js: A massive database with hundreds of physical, engineering, and culinary conversion factors. The JS file includes the Vanilla JS engine to process linear and non-linear formulas (like Temperatures: Celsius, Fahrenheit, Kelvin).
* moedas-db.json & moedas.js: Data structure and logic engine for currency and crypto conversion tools.
* horario-db.json & horario.js: Timezone and global clock logic.

---

## 🇧🇷 Ativos Globais (Para Desenvolvedores Brasileiros)

Bem-vindo ao repositório de dados abertos do [Utilweb](https://utilweb.com.br), construído nas minhas madrugadas de plantão. Este repositório foca em fornecer uma infraestrutura limpa para que outros devs não precisem mapear fatores de conversão ou fórmulas matemáticas complexas do zero.

O que temos aqui:

* conversores-db.json & conversores.js: Centenas de fatores de conversão mastigados (física, engenharia, culinária). O arquivo JS inclui o motor Vanilla JS para processar cálculos lineares e não-lineares (como escalas de temperatura).
* moedas-db.json & moedas.js: Lógica e estrutura de dados para conversores de moedas e criptomoedas.
* horario-db.json & horario.js: Lógica de fuso horário e relógio global.

---

## 🤝 How to Contribute / Como Contribuir

I maintain this massive project alone during my scarce free time. The community can help in two ways:

1. Found a calculation bug or math error? Open an Issue or submit a Pull Request fixing the JS logic.
2. Want a new unit or currency added? Add the data to the JSON and send a PR. 

If you know TypeScript and want to help type the JSON structures, your PR will be highly appreciated!

**Versão PT-BR:**
Mantenho este projeto massivo sozinho no meu pouco tempo livre. A comunidade pode ajudar de duas formas:

1. Encontrou um bug de cálculo ou erro matemático? Abra uma Issue ou mande um Pull Request corrigindo a lógica no JS.
2. Quer adicionar uma nova unidade ou moeda? Adicione os dados no JSON correspondente e envie o PR.

Se você trabalha com TypeScript e quiser ajudar com a tipagem das estruturas JSON, seu PR será muito bem-vindo!

---

## ⚖️ License & Attribution (Important)

This data and logic are free to use in your personal or commercial projects. 
However, you must provide attribution by linking back to the official tool as the source of the data. 

**PT-BR:** Estes dados e lógicas são gratuitos para uso em seus projetos pessoais ou comerciais. 
No entanto, você deve fornecer atribuição colocando um link para a ferramenta oficial como fonte dos dados.

HTML snippet for attribution / Snippet HTML para atribuição:
`<p>Data and calculations powered by <a href="https://utilweb.com.br" target="_blank">Utilweb</a></p>`

By using this repository, you agree to include the attribution link above in your project's interface or documentation.
Ao utilizar este repositório, você concorda em incluir o link de atribuição acima na interface ou documentação do seu projeto.

=== MAPA DE ARQUIVOS UTILWEB (V16.2) ===
Data: 05/04/2026 13:52
Ordem: Arquivos da raiz primeiro.
utilweb/
├── .htaccess
├── ads.txt
├── index.php
├── manifest.json
├── robots.txt
├── sitemap.php
├── sw.js
├── assets/
│   ├── conversores-db.json ⭐
│   ├── estilo.css
│   ├── guias-db.json
│   ├── horario-db.json ⭐
│   ├── moedas-db.json ⭐
│   ├── rates-cache.json
│   ├── script.js
│   ├── search-index.json
│   ├── css/
│   │   ├── blog.css
│   │   ├── categoria.css
│   │   ├── style.css
│   │   └── tools/ ⭐
│   │       ├── calculadora-rescisao.css
│   │       ├── calculadora-salario-liquido.css
│   │       ├── conversores.css
│   │       └── moedas.css
│   └── js/
│       ├── dark-mode.js
│       ├── main.js
│       ├── search.js
│       └── tools/ ⭐
│           ├── calculadora-rescisao.js
│           ├── calculadora-salario-liquido.js
│           ├── conversores.js
│           └── moedas.js
├── conversores/
│   └── unidade/
├── financeiras/
│   ├── calculadora-13-salario/
│   ├── calculadora-ferias/
│   └── calculadora-rescisao/
├── includes/
│   ├── footer_utilweb.php
│   └── header_utilweb.php
├── saude/
│   ├── calculadora-de-sono/
│   └── calculadora-imc/
└── tempo/
    ├── cronometro/
    └── relogio-online/

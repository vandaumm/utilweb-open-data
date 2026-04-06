# 🛠️ Utilweb: Open Data & Logic Engine
Participe da nossa comunidade no Discord para colaborar: https://discord.gg/Mn8yWa3JPJ

(For the English version, please scroll down).

---

## 🇧🇷 Sobre o Projeto (Português)
Bem-vindo ao repositório de dados abertos do Utilweb.com.br, um dos maiores portais de utilidades do Brasil, construído inteiramente nas minhas madrugadas de plantão. 

Este repositório fornece a infraestrutura matemática e os bancos de dados JSON que alimentam mais de 1.190 ferramentas gratuitas. O objetivo é poupar outros desenvolvedores de mapear fatores de conversão física ou lógicas matemáticas complexas do zero.

### 🛑 REGRAS DE OURO PARA CONTRIBUIDORES 🛑
O Utilweb é um projeto voltado 100% para o público brasileiro. Para proteger nosso SEO e a usabilidade (UX) dos nossos usuários, siga estritamente estas regras:

1. Código em Inglês: Variáveis, funções, comentários e chaves de JSON/Banco de dados devem ser em inglês para padronização global. (Exemplo Certo: currency_name: Dólar).
2. Conteúdo em Português (pt-BR): Valores do JSON, slugs de URL, textos de interface e HTML NÃO DEVEM ser traduzidos. Devem permanecer em português. (Exemplo Certo: slug: dolar-para-real-hoje).
3. Formatação Matemática: Não alterere a localização do JavaScript para en-US. O público brasileiro usa vírgula (,) para decimais e ponto (.) para milhares. A lógica do JS deve respeitar isso nativamente.

### 🗂️ Estrutura do Repositório (Ativos)

1. SEO Programático (Bancos de Dados & Motores)
Arquivos que geram centenas de páginas dinamicamente:
- conversores-db.json & js/tools/conversores.js: Fatores de conversão (física, engenharia, culinária) e motor de cálculo linear/não-linear.
- moedas-db.json & js/tools/moedas.js: Lógica e estrutura de dados para moedas tradicionais e criptomoedas.
- horario-db.json & js/tools/relogio-cidade.js: Lógica de fuso horário e relógio global.
- guias-db.json: Estrutura de conteúdo longo (Pillar Content) e Rich Snippets (FAQ/HowTo).

2. Ferramentas Únicas (Single Page Tools)
Lógicas isoladas em js/tools/ e estilizadas em css/tools/:
- Financeiras: calculadora-rescisao, calculadora-salario-liquido, calculadora-ferias, calculadora-13-salario, calculadora-juros-compostos, calculadora-de-porcentagem.
- Saúde e Vida: imc, sleep-calculator, calendario-fertil.
- Tempo: cronometro, temporizador, contador-regressivo, despertador, relogio-hub.
- Utilitários Digitais: gerador-link-whatsapp, gerador-qr-code, gerador-de-senha, meu-ip, contador-palavras, compressor-de-imagem, conversor-de-imagem, sorteador-hub.

### 🤝 Como Contribuir
Mantenho este projeto massivo sozinho. Você pode ajudar das seguintes formas:
1. Encontrou um bug matemático ou de interface? Abra uma Issue detalhando o problema antes de codificar, para alinharmos as expectativas.
2. Criou um Pull Request (PR)? Especifique claramente qual foi o objetivo da alteração.
3. Quer mapear novos slugs para o SEO programático ou tipar os arquivos em TypeScript? PRs são muito bem-vindos, desde que respeitem as regras de idioma.

### ⚖️ Licença e Atribuição (Importante)
Estes dados e lógicas são regidos sob a Licença MIT e gratuitos para uso pessoal/comercial. No entanto, exigimos atribuição com link apontando para a fonte original.

Snippet HTML obrigatório:
<p>Data and calculations powered by <a href=https://utilweb.com.br target=_blank>Utilweb</a></p>

---

🌍 About the Project (English)
Welcome to the open-source data repository of Utilweb.com.br, one of the largest utility portals in Brazil, built entirely during my night shifts.

This repository contains the core mathematical logic and structured JSON databases that power 1,190+ free tools. The goal is to provide a clean infrastructure so developers worldwide don't have to manually map physical conversion factors or complex math formulas from scratch.

🛑 GOLDEN RULES FOR CONTRIBUTORS (READ BEFORE PR) 🛑
Utilweb targets a 100% Brazilian audience. To protect our SEO and user experience (UX), you MUST follow these strict rules:

1. Code is in English: Variables, functions, comments, and database/JSON keys must be in English for global standardization. (Right: currency_name: Dólar).
2. Content is in Portuguese (pt-BR): JSON values, URL slugs, UI texts, and HTML content MUST remain in Brazilian Portuguese. DO NOT translate them to English. (Right: slug: dolar-para-real-hoje).
3. Number Formatting: Do not change JavaScript locales to en-US. Brazilians use commas (,) for decimals and dots (.) for thousands. The JS math logic must respect this native input.

🗂️ Repository Structure (Assets)

1. Programmatic SEO (Databases & Engines)
Files generating hundreds of dynamic pages:
- conversores-db.json & js/tools/conversores.js: Massive database of physical/culinary conversion factors and the linear/non-linear calculation engine.
- moedas-db.json & js/tools/moedas.js: Data structure and logic engine for fiat and crypto currencies.
- horario-db.json & js/tools/relogio-cidade.js: Timezone and global clock logic.
- guias-db.json: Pillar content structure and Rich Snippets (FAQ/HowTo).

2. Single Page Tools
Isolated logic in js/tools/ and styles in css/tools/:
- Financial: calculadora-rescisao, calculadora-salario-liquido, calculadora-ferias, calculadora-13-salario, calculadora-juros-compostos, calculadora-de-porcentagem.
- Health: imc, sleep-calculator, calendario-fertil.
- Time: cronometro, temporizador, contador-regressivo, despertador, relogio-hub.
- Digital Utilities: gerador-link-whatsapp, gerador-qr-code, gerador-de-senha, meu-ip, contador-palavras, compressor-de-imagem, conversor-de-imagem, sorteador-hub.

🤝 How to Contribute
I maintain this massive project alone. The community can help in the following ways:
1. Found a calculation or UI bug? Open an Issue explaining the problem before coding, so we can align expectations.
2. Submitting a Pull Request (PR)? Clearly state the exact objective of your fix/addition.
3. Want to map new programmatic SEO slugs or add TypeScript types? PRs are highly appreciated as long as they follow the language rules above.

⚖️ License & Attribution (Important)
This data and logic are under the MIT License and free to use in personal/commercial projects. However, you MUST provide attribution with a backlink to the original source.

Required HTML snippet:
<p>Data and calculations powered by <a href=https://utilweb.com.br target=_blank>Utilweb</a></p>

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

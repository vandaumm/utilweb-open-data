<?php
header("Content-Type: application/xml; charset=utf-8");

// Configurações
$baseUrl = "https://utilweb.com.br";
$jsonPath = $_SERVER['DOCUMENT_ROOT'] . '/assets/search-index.json';

// Tenta pegar a data de modificação do JSON
$lastModDate = date('Y-m-d');
if (file_exists($jsonPath)) {
    $lastModDate = date('Y-m-d', filemtime($jsonPath));
}

// Carregar JSON
$tools = [];
if (file_exists($jsonPath)) {
    $jsonContent = file_get_contents($jsonPath);
    $tools = json_decode($jsonContent, true);
}

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

    <url>
        <loc><?= $baseUrl ?>/</loc>
        <lastmod><?= $lastModDate ?></lastmod>
        <changefreq>daily</changefreq>
        <priority>1.00</priority>
    </url>

    <?php if (!empty($tools)): ?>
        <?php foreach ($tools as $item): ?>
            <?php 
                // A. Verifica se deve incluir (padrão é true)
                if (isset($item['sitemap']['include']) && $item['sitemap']['include'] === false) {
                    continue;
                }

                // B. Garante URL completa
                $url = $item['url'];
                if (strpos($url, 'http') === false) {
                    $url = $baseUrl . $url;
                }

                // C. Define Prioridade Automática
                $priority = '0.85'; // Ferramentas Padrão
                $freq = 'weekly';
                $cat = isset($item['category']) ? $item['category'] : '';

                if ($cat === 'Navegação') { // Seus Hubs de Categoria
                    $priority = '0.90';
                }
                elseif ($cat === 'Institucional') {
                    $priority = '0.60';
                    $freq = 'yearly';
                }
                elseif ($cat === 'Relógio Mundial') { // Cidades
                    $priority = '0.80';
                }
            ?>
    <url>
        <loc><?= htmlspecialchars($url) ?></loc>
        <lastmod><?= $lastModDate ?></lastmod>
        <changefreq><?= $freq ?></changefreq>
        <priority><?= $priority ?></priority>
    </url>
        <?php endforeach; ?>
    <?php endif; ?>

</urlset>

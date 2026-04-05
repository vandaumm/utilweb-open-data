<?php
  // --- CONFIGURAÇÕES DA PÁGINA INICIAL ---
  $pageTitle = "Utilweb: Ferramentas Online Gratuitas para Simplificar seu Dia";
  $metaDescription = "O maior hub de ferramentas online gratuitas. Encontre calculadoras, conversores, geradores e dezenas de utilitários para suas tarefas diárias.";
  $canonicalURL = "https://utilweb.com.br/";
  $bodyClass = "page-home";

  // --- FUNÇÃO AUXILIAR PARA NORMALIZAR CATEGORIAS ---
  function normalizeCategory($str) {
      $str = strtolower(trim($str));
      $map = [
          'finanças' => 'financeiras',
          'financeira' => 'financeiras',
          'moedas' => 'moedas',
          'moeda' => 'moedas',
          'cambio' => 'moedas',
          'câmbio' => 'moedas',
          'saúde' => 'saude',
          'utilitarios' => 'utilitarios',
          'utilitário' => 'utilitarios',
          'texto' => 'texto',
          'imagens' => 'imagens',
          'imagem' => 'imagens',
          'conversor' => 'conversores',
          'conversores' => 'conversores',
          'conversão' => 'conversores',
          'conversões' => 'conversores',
          'tempo' => 'tempo',
          'guia' => 'guias',
          'guias' => 'guias',
          'blog' => 'blog',
          'institucional' => 'institucional'
      ];
      return $map[$str] ?? $str;
  }

  // --- LÓGICA DE CONTEÚDO DINÂMICO ---
  
  // 1. Ler o "banco de dados" JSON
  $jsonPath = __DIR__ . '/assets/search-index.json';
  $allTools = [];
  if (file_exists($jsonPath)) {
      $jsonContent = file_get_contents($jsonPath);
      $allTools = json_decode($jsonContent, true);
  }

  // [SEO STRATEGY] FERRAMENTAS VIP (Para furar a fila e aparecer em 1º)
  $vipTools = [
      '/tempo/relogio-online/' => true,
      '/financeiras/calculadora-salario-liquido/' => true,
      '/financeiras/calculadora-rescisao/' => true,
      '/tempo/temporizador/' => true,
      '/tempo/contador-regressivo/' => true,
      '/utilitarios/sorteador-online/' => true,
      '/conversores/unidade/toneladas-para-sacas/' => true,
      '/moedas/par/dolar-para-real-hoje/' => true,
      '/moedas/par/bitcoin-para-real-hoje/' => true,
      '/moedas/par/euro-para-real-hoje/' => true
  ];

  // 2. Separar as ferramentas e aplicar filtros
  $toolItems = [];
  $guideItems = [];
  
  // Filtro de segurança: removemos páginas de sistema e inativamos o blog na home
  $excludedCategories = ['navegação', 'relógio mundial', 'institucional', 'blog'];

  foreach ($allTools as $item) {
      if (!isset($item['category'])) continue;

      // Filtro extra: Não mostrar as páginas raiz das categorias na Home
      if (isset($item['url']) && in_array($item['url'], ['/moedas/', '/conversores/', '/financeiras/', '/guias/'])) {
          continue;
      }

      $rawCategory = mb_strtolower(trim($item['category']), 'UTF-8');
      
      if (in_array($rawCategory, $excludedCategories)) {
          continue;
      }

      $normalizedCat = normalizeCategory($item['category']);

      if ($normalizedCat === 'guias') {
          // Separa os guias para a seção exclusiva no rodapé
          $guideItems[] = $item;
      } else {
          $item['category'] = $normalizedCat; 
          
          // Marca se é VIP para uso no HTML depois
          $item['is_vip'] = isset($vipTools[$item['url']]);
          
          $toolItems[] = $item;
      }
  }

  // 3. Agrupar ferramentas por categoria
  $toolsByCategory = [];
  foreach ($toolItems as $tool) {
      $toolsByCategory[$tool['category']][] = $tool;
  }

  // [SEO STRATEGY] REORDENAÇÃO INTELIGENTE
  // Coloca as VIPs no topo de cada array de categoria
  foreach ($toolsByCategory as $cat => &$tools) {
      usort($tools, function($a, $b) {
          if (($a['is_vip'] ?? false) && !($b['is_vip'] ?? false)) return -1;
          if (!($a['is_vip'] ?? false) && ($b['is_vip'] ?? false)) return 1;
          return 0;
      });
  }
  unset($tools);

  // 4. Mapear nomes E LINKS de categoria para a seção principal de ferramentas
  $categoryMap = [
      'financeiras' => ['title' => 'Finanças',          'url' => '/financeiras/'],
      'moedas'      => ['title' => 'Cotações e Moedas', 'url' => '/moedas/'],
      'conversores' => ['title' => 'Conversores',       'url' => '/conversores/'],
      'saude'       => ['title' => 'Saúde',             'url' => '/saude/'],
      'tempo'       => ['title' => 'Tempo',             'url' => '/tempo/'],
      'utilitarios' => ['title' => 'Utilitários',       'url' => '/utilitarios/'],
      'texto'       => ['title' => 'Texto',             'url' => '/texto/'],
      'imagens'     => ['title' => 'Imagens',           'url' => '/imagens/']
  ];

  // --- MONTAGEM DA PÁGINA ---
  require_once __DIR__ . '/templates/header.php';
?>

<section class="hero-section">
    <div class="container home-container">
        <h1>Ferramentas Online para Simplificar seu Dia</h1>
        <p>Encontre a ferramenta certa para qualquer tarefa. Rápido, seguro e 100% gratuito.</p>
    </div>
</section>

<section class="main-content-section home-section">
    <div class="container home-container">
        <h2 class="section-title">Navegue por Todas as Ferramentas</h2>

        <?php
        // 5. Loop dinâmico com LIMITE DE ITENS e TÍTULOS CLICÁVEIS
        foreach ($categoryMap as $key => $info):
            if (!isset($toolsByCategory[$key]) || empty($toolsByCategory[$key])) {
                continue; 
            }

            $catTools = $toolsByCategory[$key];
            $totalCount = count($catTools);
            $limit = 12; // MÁXIMO DE 12 ITENS NA HOME POR CATEGORIA
            
            // Pega apenas os primeiros 12 (que agora já começam com as VIPs)
            $displayTools = array_slice($catTools, 0, $limit);
        ?>
            <div class="category-block" style="margin-bottom: var(--spacing-xxl);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--spacing-sm);">
                    
                    <h3 class="category-title" style="margin-bottom: 0; border: none;">
                        <a href="<?= htmlspecialchars($info['url']) ?>" 
                           style="color: var(--c-text-primary); text-decoration: none;"
                           onmouseover="this.style.color='var(--c-primary)'" 
                           onmouseout="this.style.color='var(--c-text-primary)'">
                            <?= htmlspecialchars($info['title']) ?>
                        </a>
                    </h3>
                    
                    <?php if ($totalCount > $limit): ?>
                        <a href="<?= htmlspecialchars($info['url']) ?>" style="font-size: 0.9rem; font-weight: 600;">
                            Ver todos (<?= $totalCount ?>) &rarr;
                        </a>
                    <?php endif; ?>
                </div>
                
                <hr style="border: 0; border-top: 2px solid var(--c-border); margin-bottom: var(--spacing-lg);">

                <div class="grid tools-grid">
                    <?php foreach ($displayTools as $tool): 
                        // Estilo extra se for VIP
                        $isVip = $tool['is_vip'] ?? false;
                        $vipStyle = $isVip ? 'border-left: 4px solid var(--c-primary); background: var(--surface-hover);' : '';
                        $vipIcon = $isVip ? '🔥 ' : '';
                    ?>
                        <a href="<?= htmlspecialchars($tool['url']) ?>" class="card card--tool" style="<?= $vipStyle ?>">
                            <h3><?= $vipIcon . htmlspecialchars($tool['title']) ?></h3>
                            <p><?= htmlspecialchars($tool['description'] ?? '') ?></p>
                        </a>
                    <?php endforeach; ?>
                </div>

                <?php if ($totalCount > $limit): ?>
                    <div style="text-align: center; margin-top: var(--spacing-md);">
                        <a href="<?= htmlspecialchars($info['url']) ?>" class="btn btn--outline" style="display: inline-block; padding: 8px 16px; border: 1px solid var(--c-border); border-radius: var(--border-radius); color: var(--c-text-secondary);">
                            Ver mais <?= ($totalCount - $limit) ?> ferramentas de <?= htmlspecialchars($info['title']) ?>...
                        </a>
                    </div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>

    </div>
</section>

<section class="main-content-section section--surface">
    <div class="container home-container">
        <h2 class="section-title">Guias e Tutoriais</h2>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 40px; color: var(--c-text-secondary);">Passo a passo completos para descomplicar burocracias e tarefas do dia a dia.</p>
        
        <div class="grid tools-grid">
            <?php
            // Exibe até 6 guias recentes na home
            $recentGuides = array_slice($guideItems, 0, 6);

            if (!empty($recentGuides)):
                foreach ($recentGuides as $guide):
            ?>
                    <a href="<?= htmlspecialchars($guide['url']) ?>" class="card card--tool">
                        <h3>📄 <?= htmlspecialchars($guide['title']) ?></h3>
                        <p><?= htmlspecialchars($guide['description'] ?? '') ?></p>
                    </a>
            <?php
                endforeach;
            else:
            ?>
                <p style="text-align: center; grid-column: 1 / -1;">Nenhum guia encontrado no momento.</p>
            <?php endif; ?>
        </div>

        <?php if (count($guideItems) > 6): ?>
            <div style="text-align: center; margin-top: var(--spacing-xl);">
                <a href="/guias/" class="btn btn--outline" style="display: inline-block; padding: 10px 20px; border: 1px solid var(--c-border); border-radius: var(--border-radius); color: var(--c-text-secondary); font-weight: 600;">
                    Ver todos os Guias &rarr;
                </a>
            </div>
        <?php endif; ?>
    </div>
</section>

<?php
  require_once __DIR__ . '/templates/footer.php';
?>

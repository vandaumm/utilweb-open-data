document.addEventListener('DOMContentLoaded', function() {
    
    // --- CONFIGURAÇÃO DAS ABAS ---
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    function setupTabs() {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove classe ativa de todas as abas
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Adiciona classe ativa na aba clicada
                tab.classList.add('active');
                
                // Busca o conteúdo pelo data-tab (ex: valor -> valor-content)
                const targetId = tab.dataset.tab + '-content';
                const targetContent = document.getElementById(targetId);
                
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // --- FUNÇÕES DE FORMATAÇÃO ---
    function formatNumber(num) {
        if (isNaN(num)) return '';
        return num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }

    // --- CÁLCULO: VALOR ---
    const valorPercent = document.getElementById('valor-percent');
    const valorTotal = document.getElementById('valor-total');
    const valorResult = document.getElementById('valor-resultado');

    function calculateValor() {
        if (!valorPercent || !valorTotal || !valorResult) return;
        
        const p = parseFloat(valorPercent.value);
        const t = parseFloat(valorTotal.value);

        if (isNaN(p) || isNaN(t)) {
            valorResult.innerHTML = '<p>Preencha os campos para ver o resultado.</p>';
            return;
        }
        const res = (p / 100) * t;
        valorResult.innerHTML = `<p>${formatNumber(p)}% de ${formatNumber(t)} é:</p><p class="valor-final valor-destaque">${formatNumber(res)}</p>`;
    }

    // --- CÁLCULO: RELAÇÃO ---
    const relacaoParte = document.getElementById('relacao-parte');
    const relacaoTotal = document.getElementById('relacao-total');
    const relacaoResult = document.getElementById('relacao-resultado');

    function calculateRelacao() {
        if (!relacaoParte || !relacaoTotal || !relacaoResult) return;

        const parte = parseFloat(relacaoParte.value);
        const total = parseFloat(relacaoTotal.value);

        if (isNaN(parte) || isNaN(total)) {
            relacaoResult.innerHTML = '<p>Preencha os campos para ver o resultado.</p>';
            return;
        }
        if (total === 0) {
            relacaoResult.innerHTML = '<p>O total não pode ser zero.</p>';
            return;
        }
        const res = (parte / total) * 100;
        relacaoResult.innerHTML = `<p>${formatNumber(parte)} corresponde a:</p><p class="valor-final valor-destaque">${formatNumber(res)}% de ${formatNumber(total)}</p>`;
    }

    // --- CÁLCULO: VARIAÇÃO ---
    const variacaoIni = document.getElementById('variacao-inicial');
    const variacaoFim = document.getElementById('variacao-final');
    const variacaoResult = document.getElementById('variacao-resultado');

    function calculateVariacao() {
        if (!variacaoIni || !variacaoFim || !variacaoResult) return;

        const ini = parseFloat(variacaoIni.value);
        const fim = parseFloat(variacaoFim.value);

        if (isNaN(ini) || isNaN(fim)) {
            variacaoResult.innerHTML = '<p>Preencha os campos para ver o resultado.</p>';
            return;
        }
        if (ini === 0) {
            variacaoResult.innerHTML = '<p>O valor inicial não pode ser zero.</p>';
            return;
        }
        const res = ((fim - ini) / ini) * 100;
        const tipo = res >= 0 ? 'aumento' : 'diminuição';
        const classe = res >= 0 ? 'aumento' : 'diminuicao';

        variacaoResult.innerHTML = `<p>Isso é um <strong class="${classe}">${tipo}</strong> de:</p><p class="valor-final valor-destaque ${classe}">${formatNumber(Math.abs(res))}%</p>`;
    }

    // --- LISTENERS ---
    setupTabs();

    if(valorPercent && valorTotal) {
        valorPercent.addEventListener('input', calculateValor);
        valorTotal.addEventListener('input', calculateValor);
    }
    if(relacaoParte && relacaoTotal) {
        relacaoParte.addEventListener('input', calculateRelacao);
        relacaoTotal.addEventListener('input', calculateRelacao);
    }
    if(variacaoIni && variacaoFim) {
        variacaoIni.addEventListener('input', calculateVariacao);
        variacaoFim.addEventListener('input', calculateVariacao);
    }
});

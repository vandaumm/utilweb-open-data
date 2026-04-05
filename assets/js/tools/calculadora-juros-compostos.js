document.addEventListener('DOMContentLoaded', () => {
    // --- MAPEAMENTO DE ELEMENTOS (DOM) ---
    const elements = {
        tabs: document.querySelectorAll('.tab-link'),
        simuladorContent: document.getElementById('simulador-content'),
        metaContent: document.getElementById('meta-content'),
        retiradasContent: document.getElementById('retiradas-content'),

        // Aba 1: Simulador Padrão
        valorInicial: document.getElementById('valor-inicial'),
        aporteMensal: document.getElementById('aporte-mensal'),
        taxaJuros: document.getElementById('taxa-juros'),
        taxaJurosSlider: document.getElementById('taxa-juros-slider'),
        periodo: document.getElementById('periodo'),
        periodoTipo: document.getElementById('periodo-tipo'),
        taxaInflacao: document.getElementById('taxa-inflacao'),

        // Aba 2: Atingir Meta
        metaValor: document.getElementById('meta-valor'),
        metaValorInicial: document.getElementById('meta-valor-inicial'),
        metaTaxaJuros: document.getElementById('meta-taxa-juros'),
        metaPeriodo: document.getElementById('meta-periodo'),
        metaPeriodoTipo: document.getElementById('meta-periodo-tipo'),
        
        // Aba 3: Simulador de Retiradas
        retiradaValorInicial: document.getElementById('retirada-valor-inicial'),
        retiradaValorMensal: document.getElementById('retirada-valor-mensal'),
        retiradaTaxaJuros: document.getElementById('retirada-taxa-juros'),
        retiradaInflacao: document.getElementById('retirada-inflacao'),

        resultsSection: document.getElementById('results-section'),
    };

    let resultsChart = null;
    let activeTab = 'simulador';

    // --- FUNÇÕES UTILITÁRIAS ---
    const formatAsCurrency = (value) => {
        if (isNaN(value)) value = 0;
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const parseFromCurrency = (value) => {
        if (typeof value !== 'string' || value.trim() === '') return 0;
        const number = parseFloat(value.replace(/\s*R\$\s*/, '').replace(/\./g, '').replace(',', '.'));
        return isNaN(number) ? 0 : number;
    };

    const debounce = (func, delay = 250) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // --- LÓGICA DAS ABAS E INICIALIZAÇÃO ---
    function setupTabs() {
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                switchTab(e.target.dataset.tab);
            });
        });
    }
    
    function switchTab(tabName) {
        if (activeTab === tabName) return;
        activeTab = tabName;

        elements.tabs.forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-content`);
        });
        
        elements.resultsSection.style.display = 'none';
        if (resultsChart) resultsChart.destroy();
        triggerCalculation();
    }


    // --- CÁLCULO CENTRAL ---
    function triggerCalculation() {
        switch (activeTab) {
            case 'simulador':
                runStandardSimulation();
                break;
            case 'meta':
                runMetaSimulation();
                break;
            case 'retiradas':
                runWithdrawalSimulation();
                break;
        }
    }

    // --- LÓGICAS DE SIMULAÇÃO ---

    function runStandardSimulation() {
        const valorInicial = parseFromCurrency(elements.valorInicial.value);
        const aporteMensal = parseFromCurrency(elements.aporteMensal.value);
        const taxaJurosAnual = parseFloat(elements.taxaJuros.value) / 100;
        const periodoValor = parseInt(elements.periodo.value, 10);
        const periodoTipo = elements.periodoTipo.value;
        
        if (isNaN(taxaJurosAnual) || isNaN(periodoValor) || periodoValor <= 0 || taxaJurosAnual <= 0) {
            elements.resultsSection.style.display = 'none';
            return;
        }
        
        const taxaInflacaoAnual = parseFloat(elements.taxaInflacao.value) / 100 || 0;
        const taxaMensal = Math.pow(1 + taxaJurosAnual, 1 / 12) - 1;
        const totalMeses = periodoTipo === 'anos' ? periodoValor * 12 : periodoValor;
        const periodoAnos = totalMeses / 12;

        let valorAcumulado = valorInicial;
        const tableData = [];
        const chartLabels = ['Início', ...Array.from({ length: Math.ceil(periodoAnos) }, (_, i) => `Ano ${i + 1}`)];
        const chartDataTotalInvestido = [valorInicial];
        const chartDataValorAcumulado = [valorInicial];
        
        for (let i = 1; i <= totalMeses; i++) {
            valorAcumulado *= (1 + taxaMensal);
            valorAcumulado += aporteMensal;
            
            if (i % 12 === 0 || i === totalMeses) {
                const ano = Math.ceil(i / 12);
                const totalInvestidoNoAno = valorInicial + (aporteMensal * i);
                if (i === totalMeses && tableData.length < ano) {
                    tableData.push({ ano: periodoAnos.toFixed(1), totalInvestido: totalInvestidoNoAno, juros: valorAcumulado - totalInvestidoNoAno, valorFinal: valorAcumulado });
                    chartDataTotalInvestido[ano] = totalInvestidoNoAno;
                    chartDataValorAcumulado[ano] = valorAcumulado;
                } else if (i % 12 === 0) {
                     tableData.push({ ano, totalInvestido: totalInvestidoNoAno, juros: valorAcumulado - totalInvestidoNoAno, valorFinal: valorAcumulado });
                     chartDataTotalInvestido[ano] = totalInvestidoNoAno;
                     chartDataValorAcumulado[ano] = valorAcumulado;
                }
            }
        }
        
        const totalInvestido = valorInicial + (aporteMensal * totalMeses);
        const valorFinalReal = valorAcumulado / Math.pow(1 + taxaInflacaoAnual, periodoAnos);

        displayStandardResults({
            totalInvestido,
            totalJuros: valorAcumulado - totalInvestido,
            valorFinal: valorAcumulado,
            valorFinalReal,
            chartData: { labels: chartLabels, dataTotalInvestido: chartDataTotalInvestido, dataValorAcumulado: chartDataValorAcumulado },
            tableData
        });
    }

    function runMetaSimulation() {
        const meta = parseFromCurrency(elements.metaValor.value);
        const inicial = parseFromCurrency(elements.metaValorInicial.value);
        const taxaAnual = parseFloat(elements.metaTaxaJuros.value) / 100;
        const periodoValor = parseInt(elements.metaPeriodo.value, 10);
        const periodoTipo = elements.metaPeriodoTipo.value;

        if (isNaN(meta) || isNaN(taxaAnual) || isNaN(periodoValor) || meta <= inicial || taxaAnual <= 0 || periodoValor <= 0) {
            displayErrorResult("Por favor, preencha todos os campos com valores válidos para calcular.");
            return;
        }

        const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
        const totalMeses = periodoTipo === 'anos' ? periodoValor * 12 : periodoValor;
        const aporteNecessario = (meta - inicial * Math.pow(1 + taxaMensal, totalMeses)) / ((Math.pow(1 + taxaMensal, totalMeses) - 1) / taxaMensal);
        
        displayMetaResult(aporteNecessario);
    }

    function runWithdrawalSimulation() {
        const valorInicial = parseFromCurrency(elements.retiradaValorInicial.value);
        const retiradaMensal = parseFromCurrency(elements.retiradaValorMensal.value);
        const taxaAnual = parseFloat(elements.retiradaTaxaJuros.value) / 100;
        const inflacaoAnual = parseFloat(elements.retiradaInflacao.value) / 100 || 0;

        if (isNaN(valorInicial) || isNaN(retiradaMensal) || isNaN(taxaAnual) || valorInicial <= 0 || retiradaMensal <= 0 || taxaAnual <= 0) {
            displayErrorResult("Preencha os campos com valores válidos para simular as retiradas.");
            return;
        }
        
        const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;

        if (valorInicial * taxaMensal >= retiradaMensal && inflacaoAnual === 0) {
            displayWithdrawalResult({ perpetual: true, perpetualIncome: valorInicial * taxaMensal });
            return;
        }

        let saldoAtual = valorInicial;
        let retiradaAtual = retiradaMensal;
        let meses = 0;
        const maxMeses = 1200; // Limite de 100 anos para evitar loop infinito
        
        const chartLabels = ['Início'];
        const chartDataSaldo = [saldoAtual];

        while (saldoAtual > retiradaAtual && meses < maxMeses) {
            meses++;
            saldoAtual += (saldoAtual * taxaMensal); // Juros
            saldoAtual -= retiradaAtual; // Retirada
            
            if (meses % 12 === 0) {
                if (inflacaoAnual > 0) retiradaAtual *= (1 + inflacaoAnual);
                chartLabels.push(`Ano ${meses / 12}`);
                chartDataSaldo.push(saldoAtual);
            }
        }
        
        displayWithdrawalResult({ 
            meses, 
            perpetual: meses >= maxMeses,
            perpetualIncome: valorInicial * taxaMensal,
            chartData: { labels: chartLabels, dataSaldo: chartDataSaldo }
        });
    }

    // --- FUNÇÕES DE EXIBIÇÃO DE RESULTADOS ---
    function displayStandardResults(data) {
        const inflacaoInputada = parseFloat(elements.taxaInflacao.value) > 0;
        let realValueHtml = inflacaoInputada ? `
            <div class="stat-card">
                <div class="stat-label">Valor Final (Corrigido p/ Inflação)</div>
                <div class="stat-value">${formatAsCurrency(data.valorFinalReal)}</div>
            </div>` : '';

        elements.resultsSection.innerHTML = `
            <h2 class="section-title">Resultado da Simulação</h2>
            <div class="results-summary">
                <div class="stat-card"><div class="stat-label">Total Investido</div><div class="stat-value">${formatAsCurrency(data.totalInvestido)}</div></div>
                <div class="stat-card"><div class="stat-label">Total em Juros</div><div class="stat-value positive">${formatAsCurrency(data.totalJuros)}</div></div>
                <div class="stat-card"><div class="stat-label">Valor Final Bruto</div><div class="stat-value">${formatAsCurrency(data.valorFinal)}</div></div>
                ${realValueHtml}
            </div>
            <div class="chart-container"><canvas id="results-chart"></canvas></div>
            <div class="results-actions"><button id="goToWithdrawal" class="btn btn-secondary">Simular Retiradas com este Valor</button></div>
            <div id="results-table-container">
                <h3 class="section-title" style="font-size: 1.5rem; margin-top: 40px;">Projeção Ano a Ano</h3>
                <table class="results-table">
                    <thead><tr><th>Ano</th><th>Total Aportado</th><th>Juros Acumulados</th><th>Saldo Final</th></tr></thead>
                    <tbody>
                        ${data.tableData.map(row => `
                            <tr>
                                <td>${row.ano}</td>
                                <td>${formatAsCurrency(row.totalInvestido)}</td>
                                <td>${formatAsCurrency(row.juros)}</td>
                                <td>${formatAsCurrency(row.valorFinal)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        elements.resultsSection.style.display = 'block';
        createChart(data.chartData, 'standard');

        document.getElementById('goToWithdrawal').addEventListener('click', () => {
            elements.retiradaValorInicial.value = formatAsCurrency(data.valorFinal);
            switchTab('retiradas');
        });
    }

    function displayMetaResult(aporte) {
        let resultHtml = (aporte > 0) ? `
            <p>Para atingir sua meta, você precisa fazer um aporte mensal de:</p>
            <div class="aporte-necessario">${formatAsCurrency(aporte)}</div>` : 
            `<p class="positive">Parabéns! Com os juros compostos, seu valor inicial já é suficiente para atingir a meta no prazo estipulado, sem necessidade de novos aportes.</p>`;
        elements.resultsSection.innerHTML = `<div id="meta-result">${resultHtml}</div>`;
        elements.resultsSection.style.display = 'block';
    }

    function displayWithdrawalResult(data) {
        let resultHtml = '';
        if (data.perpetual) {
            resultHtml = `
                <div class="stat-card">
                    <div class="stat-label">Parabéns! Seus rendimentos cobrem as retiradas.</div>
                    <div class="stat-value positive">RENDA PERPÉTUA</div>
                    <p style="margin-top: 10px;">Seus juros mensais são de aprox. <strong>${formatAsCurrency(data.perpetualIncome)}</strong>, valor maior ou igual à sua retirada.</p>
                </div>`;
        } else {
            const anos = Math.floor(data.meses / 12);
            const meses = data.meses % 12;
            resultHtml = `
                 <div class="stat-card">
                    <div class="stat-label">Seu dinheiro durará aproximadamente:</div>
                    <div class="stat-value">${anos} anos e ${meses} meses</div>
                </div>
                <div class="chart-container"><canvas id="results-chart"></canvas></div>`;
        }
        elements.resultsSection.innerHTML = `<h2 class="section-title">Resultado da Simulação de Retiradas</h2><div class="results-summary">${resultHtml}</div>`;
        elements.resultsSection.style.display = 'block';
        
        if (!data.perpetual) {
            createChart(data.chartData, 'withdrawal');
        }
    }
    
    function displayErrorResult(message) {
        elements.resultsSection.innerHTML = `<div id="meta-result"><p>${message}</p></div>`;
        elements.resultsSection.style.display = 'block';
    }
    
    function createChart(chartData, type) {
        const ctx = document.getElementById('results-chart').getContext('2d');
        if (resultsChart) resultsChart.destroy();
        
        let datasets = [];
        if (type === 'standard') {
            datasets = [
                { label: 'Total Investido', data: chartData.dataTotalInvestido, borderColor: '#667781', backgroundColor: 'rgba(102, 119, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 0 },
                { label: 'Valor Acumulado', data: chartData.dataValorAcumulado, borderColor: '#128C7E', backgroundColor: 'rgba(18, 140, 126, 0.2)', fill: true, tension: 0.4, pointRadius: 0 }
            ];
        } else { // withdrawal
            datasets = [
                { label: 'Saldo Remanescente', data: chartData.dataSaldo, borderColor: '#d9534f', backgroundColor: 'rgba(217, 83, 79, 0.2)', fill: true, tension: 0.4, pointRadius: 0 }
            ];
        }

        resultsChart = new Chart(ctx, {
            type: 'line',
            data: { labels: chartData.labels, datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { y: { ticks: { callback: (value) => 'R$ ' + (value / 1000).toFixed(0) + 'k' } } },
                plugins: { tooltip: { mode: 'index', intersect: false, callbacks: { label: (context) => `${context.dataset.label}: ${formatAsCurrency(context.raw)}` } } }
            }
        });
    }

    // --- EVENT LISTENERS ---
    function setupListeners() {
        const debouncedTrigger = debounce(triggerCalculation, 300);

        const inputsToTrack = [
            elements.valorInicial, elements.aporteMensal, elements.taxaJuros,
            elements.periodo, elements.periodoTipo, elements.taxaInflacao, 
            elements.metaValor, elements.metaValorInicial, elements.metaTaxaJuros, 
            elements.metaPeriodo, elements.metaPeriodoTipo,
            elements.retiradaValorInicial, elements.retiradaValorMensal,
            elements.retiradaTaxaJuros, elements.retiradaInflacao
        ];

        inputsToTrack.forEach(input => {
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener(eventType, debouncedTrigger);
            if(input.classList.contains('currency')) input.addEventListener('keyup', debouncedTrigger);
        });

        elements.taxaJurosSlider.addEventListener('input', (e) => { elements.taxaJuros.value = e.target.value; debouncedTrigger(); });
        elements.taxaJuros.addEventListener('input', (e) => { elements.taxaJurosSlider.value = e.target.value; });
    }
    
    // --- FUNÇÕES DE INICIALIZAÇÃO ---
    function setupCurrencyFormatting() {
        document.querySelectorAll('.currency').forEach(input => {
            input.addEventListener('keyup', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value === '') return;
                value = (parseInt(value, 10) / 100);
                e.target.value = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            });
        });
    }

    function init() {
        setupCurrencyFormatting();
        setupTabs();
        setupListeners();
        triggerCalculation();
    }

    init();
});

document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS ---
    const elements = {
        tabs: document.querySelectorAll('.tab-link'),
        tabContents: document.querySelectorAll('.tab-content'),
        // Aba Principal
        salarioBruto: document.getElementById('salario-bruto'),
        dependentes: document.getElementById('dependentes'), 
        dependentesFamilia: document.getElementById('dependentes-familia'), 
        outrosDescontos: document.getElementById('outros-descontos'),
        beneficios: document.getElementById('beneficios'),
        toggleHE: document.getElementById('toggle-horas-extras'),
        containerHE: document.getElementById('horas-extras-container'),
        he50: document.getElementById('he-50-qtd'),
        he100: document.getElementById('he-100-qtd'),
        // Aba Reverso
        salarioLiquidoDesejado: document.getElementById('salario-liquido-desejado'),
        dependentesReverso: document.getElementById('dependentes-reverso'),
        outrosDescontosReverso: document.getElementById('outros-descontos-reverso'),
        
        resultsSection: document.getElementById('results-section'),
    };
    
    // --- UTILS ---
    const formatCurrencyInput = (value) => {
        value = value.replace(/\D/g, "");
        value = (value / 100).toFixed(2) + "";
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        return "R$ " + value;
    };

    const parseCurrency = (val) => (!val) ? 0 : parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const formatCurrency = (val) => isNaN(val) ? 'R$ 0,00' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- EVENT LISTENERS ---
    document.querySelectorAll('.currency').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = formatCurrencyInput(e.target.value);
            triggerCalculation();
        });
    });

    const numberInputs = [
        elements.dependentes, elements.dependentesFamilia, elements.he50, elements.he100, 
        elements.dependentesReverso
    ];
    numberInputs.forEach(input => {
        if(input) input.addEventListener('input', triggerCalculation);
    });

    if(elements.toggleHE) {
        elements.toggleHE.addEventListener('click', () => {
            elements.containerHE.classList.toggle('hidden');
            elements.toggleHE.textContent = elements.containerHE.classList.contains('hidden') 
                ? '+ Adicionar Horas Extras' 
                : '- Ocultar Horas Extras';
        });
    }

    // --- CONFIGURAÇÃO 2026 (OFICIAL) ---
    const config = {
        deducaoIRPorDependente: 189.59, 
        quotaSalarioFamilia: 62.04, 
        tetoSalarioFamilia: 1819.26, 
        
        // Tabela INSS 2026 (Estimada/Mantida)
        inssTable: [
            { teto: 1412.00, aliquota: 0.075 },
            { teto: 2666.68, aliquota: 0.090 },
            { teto: 4000.03, aliquota: 0.120 },
            { teto: 8200.00, aliquota: 0.140 }
        ],
        tetoINSS: 8200.00, 
        
        // Tabela IRRF TRADICIONAL (Lei 15.270/2025 mantém essa tabela)
        irrfTable: [
            { teto: 2428.80, aliquota: 0,     deducao: 0 },       
            { teto: 2826.65, aliquota: 0.075, deducao: 182.16 },
            { teto: 3751.05, aliquota: 0.15,  deducao: 394.16 },
            { teto: 4664.68, aliquota: 0.225, deducao: 675.49 },
            { teto: Infinity, aliquota: 0.275, deducao: 908.73 }
        ],
        
        // Parâmetros do Redutor (O mecanismo da isenção de 5k)
        redutor: {
            tetoIsencao: 5000.00,
            tetoLimiteDesconto: 7350.00,
            fator: 0.133145,
            fixo: 978.62
        }
    };

    // --- LÓGICA DE CÁLCULO DIRETO ---
    const calculateINSS = (brutoTotal) => {
        // [BLINDAGEM] Garante que o cálculo nunca exceda o teto configurado
        const baseINSS = Math.min(brutoTotal, config.tetoINSS);
        
        let desconto = 0;
        let baseAnterior = 0;
        
        for (const faixa of config.inssTable) {
            if (baseINSS > baseAnterior) {
                const tetoFaixa = Math.min(baseINSS, faixa.teto);
                const baseFaixa = tetoFaixa - baseAnterior;
                desconto += baseFaixa * faixa.aliquota;
                baseAnterior = faixa.teto;
            } else {
                break;
            }
        }
        return parseFloat(desconto.toFixed(2));
    };

    const calculateIRRF = (brutoTotal, inss, dependentesIR) => {
        // 1. Base de Cálculo Legal
        const baseCalculo = brutoTotal - inss - (dependentesIR * config.deducaoIRPorDependente);
        
        if (baseCalculo <= config.irrfTable[0].teto) return 0;

        // 2. Cálculo do Imposto "Cheio" (Tabela Tradicional)
        let impostoBruto = 0;
        const faixa = config.irrfTable.find(f => baseCalculo <= f.teto);
        if (faixa) {
            impostoBruto = (baseCalculo * faixa.aliquota) - faixa.deducao;
        }
        
        // 3. Aplicação do Redutor (Lei 15.270/2025)
        let descontoLeiNova = 0;

        if (baseCalculo <= config.redutor.tetoIsencao) {
            descontoLeiNova = impostoBruto; // Isenção total
        } else if (baseCalculo <= config.redutor.tetoLimiteDesconto) {
            // [ATENÇÃO] Fórmula usa RENDIMENTOS TRIBUTÁVEIS (Bruto), não a Base.
            const valorFormula = config.redutor.fixo - (config.redutor.fator * brutoTotal);
            descontoLeiNova = Math.max(0, valorFormula);
        }

        const impostoFinal = Math.max(0, impostoBruto - descontoLeiNova);
        return parseFloat(impostoFinal.toFixed(2));
    };

    const calculateBaseCLT = (bruto, dependentesIR, outrosDescontos) => {
        const inss = calculateINSS(bruto);
        const irrf = calculateIRRF(bruto, inss, dependentesIR);
        const liquido = bruto - inss - irrf - outrosDescontos;
        return { bruto, inss, irrf, outrosDescontos, liquido };
    };

    // --- CÁLCULO REVERSO (LÍQUIDO -> BRUTO) ---
    const runReverseCalculation = () => {
        const liquidoDesejado = parseCurrency(elements.salarioLiquidoDesejado.value);
        if (liquidoDesejado <= 0) { elements.resultsSection.style.display = 'none'; return; }
        
        const dependentes = parseInt(elements.dependentesReverso.value, 10) || 0;
        const outrosDescontos = parseCurrency(elements.outrosDescontosReverso.value);
        
        // 1. Estimativa inicial mais inteligente
        let brutoEstimado = liquidoDesejado < 5000 ? liquidoDesejado * 1.08 : liquidoDesejado * 1.25;
        
        // 2. Newton-Raphson com Derivada Dinâmica
        // Isso corrige o erro de usar fator fixo (0.75) em curvas não lineares
        for (let i = 0; i < 50; i++) {
            // Calcula onde estamos
            const resAtual = calculateBaseCLT(brutoEstimado, dependentes, outrosDescontos);
            const diff = resAtual.liquido - liquidoDesejado;

            // Se a diferença for centavos, paramos
            if (Math.abs(diff) < 0.01) break;

            // Calcula a "inclinação" (derivada) da curva fiscal neste ponto exato
            // Simulamos um aumento de R$ 1,00 no bruto para ver quanto o líquido aumenta
            const step = 1.00;
            const resStep = calculateBaseCLT(brutoEstimado + step, dependentes, outrosDescontos);
            const derivada = (resStep.liquido - resAtual.liquido) / step;

            // Evita divisão por zero (segurança)
            if (derivada === 0) {
                brutoEstimado -= diff; 
            } else {
                // Ajusta o bruto baseado na inclinação real
                brutoEstimado -= diff / derivada;
            }
        }

        displayReverseResults({ bruto: brutoEstimado, liquido: liquidoDesejado });
    };

    // --- ORQUESTRADOR PADRÃO ---
    const runStandardCalculation = () => {
        const salarioFixo = parseCurrency(elements.salarioBruto.value);
        if (salarioFixo === 0) { elements.resultsSection.style.display = 'none'; return; }

        const beneficios = parseCurrency(elements.beneficios.value);
        const he50 = parseFloat(elements.he50.value) || 0;
        const he100 = parseFloat(elements.he100.value) || 0;
        const depIR = parseInt(elements.dependentes.value) || 0;
        const depFam = parseInt(elements.dependentesFamilia.value) || 0;
        const outrosDescontos = parseCurrency(elements.outrosDescontos.value);

        const valorHora = salarioFixo / 220;
        const valorHE = (valorHora * 1.5 * he50) + (valorHora * 2.0 * he100);
        
        const brutoTotal = salarioFixo + valorHE + beneficios;
        
        let salarioFamilia = 0;
        if (brutoTotal <= config.tetoSalarioFamilia) {
            salarioFamilia = depFam * config.quotaSalarioFamilia;
        }

        const result = calculateBaseCLT(brutoTotal, depIR, outrosDescontos);

        const finalData = {
            brutoTotal: brutoTotal,
            valorHE: valorHE,
            beneficios: beneficios,
            salarioFamilia: salarioFamilia,
            inss: result.inss,
            irrf: result.irrf,
            outrosDescontos: result.outrosDescontos,
            liquido: result.liquido + salarioFamilia 
        };

        displayResults(finalData);
    };

    // --- DISPLAY E GRÁFICOS ---
    let resultsChart = null;

    const displayResults = (data) => {
        let isentoMsg;
        if (data.irrf === 0 && data.brutoTotal > 0) {
            isentoMsg = '<span class="badge-isento">Isento/Reduzido (Lei 2026)</span>';
        } else {
            isentoMsg = formatCurrency(data.irrf);
        }

        elements.resultsSection.innerHTML = `
            <div class="results-layout">
                <div class="chart-container"><canvas id="results-chart"></canvas></div>
                <div class="breakdown-section">
                    <table class="breakdown-table">
                        <tbody>
                            <tr>
                                <td>Salário Bruto Total <br><small>(Fixo + HE + Benefícios)</small></td>
                                <td class="neutral">${formatCurrency(data.brutoTotal)}</td>
                            </tr>
                            ${data.salarioFamilia > 0 ? `
                            <tr>
                                <td>(+) Salário Família</td>
                                <td class="positive">${formatCurrency(data.salarioFamilia)}</td>
                            </tr>` : ''}
                            <tr>
                                <td>(-) INSS</td>
                                <td class="negative">${formatCurrency(data.inss)}</td>
                            </tr>
                            <tr>
                                <td>(-) IRRF</td>
                                <td class="negative">${isentoMsg}</td>
                            </tr>
                            <tr>
                                <td>(-) Outros Descontos</td>
                                <td class="negative">${formatCurrency(data.outrosDescontos)}</td>
                            </tr>
                            <tr class="final-result">
                                <td>Salário Líquido</td>
                                <td>${formatCurrency(data.liquido)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`;
        elements.resultsSection.style.display = 'block';
        updateChart(data.liquido, (data.inss + data.irrf + data.outrosDescontos));
    };

    const displayReverseResults = (data) => {
        elements.resultsSection.innerHTML = `
            <div class="reverse-result-container">
                <p class="label">Para receber <strong>${formatCurrency(data.liquido)}</strong> líquidos em 2026,</p>
                <p class="label">o salário bruto deve ser aproximadamente:</p>
                <p class="value">${formatCurrency(data.bruto)}</p>
            </div>`;
        elements.resultsSection.style.display = 'block';
        if (resultsChart) { resultsChart.destroy(); resultsChart = null; }
    };

    const updateChart = (liquido, descontos) => {
        const ctx = document.getElementById('results-chart');
        if(!ctx) return;
        if (resultsChart) resultsChart.destroy();

        resultsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Líquido', 'Impostos/Descontos'],
                datasets: [{
                    data: [liquido, descontos],
                    backgroundColor: ['#128C7E', '#E53935'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    };

    // --- TAB SYSTEM ---
    let activeTab = 'bruto-liquido';
    function triggerCalculation() {
        if (activeTab === 'bruto-liquido') runStandardCalculation();
        else runReverseCalculation();
    }

    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activeTab = tab.dataset.tab;
            
            elements.tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            document.getElementById(`${activeTab}-content`).classList.add('active');
            elements.resultsSection.style.display = 'none';
            triggerCalculation();
        });
    });

    if (elements.salarioBruto.value) triggerCalculation();
});

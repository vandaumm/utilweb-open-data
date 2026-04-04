/**
 * @fileoverview Lógica para a Calculadora de Férias do Utilweb (Versão 2026 Oficial).
 * Regras Atualizadas: Lei 15.270/2025 (Redutor Simplificado) e Terço Constitucional.
 * * NOTA TÉCNICA: 
 * O Abono Pecuniário (venda de férias) é indenizatório e ISENTO de IRRF e INSS.
 * O Adiantamento de 13º sofre incidência de FGTS, mas o desconto de INSS/IRRF
 * ocorre apenas no pagamento da segunda parcela (dezembro/rescisão).
 */

document.addEventListener('DOMContentLoaded', () => {

    const dom = {
        form: document.getElementById('ferias-form'),
        salarioBrutoInput: document.getElementById('salario-bruto'),
        mediaVariaveisInput: document.getElementById('media-variaveis'),
        dependentesInput: document.getElementById('dependentes'),
        diasFeriasSelect: document.getElementById('dias-ferias'),
        adiantar13Select: document.getElementById('adiantar-13'),
        resultsSection: document.getElementById('results-section'),
        resValorLiquido: document.getElementById('res-valor-liquido'),
        resFeriasBrutas: document.getElementById('res-ferias-brutas'),
        rowAbono: document.getElementById('row-abono'),
        resAbono: document.getElementById('res-abono'),
        rowAdiantamento13: document.getElementById('row-adiantamento-13'),
        resAdiantamento13: document.getElementById('res-adiantamento-13'),
        resInss: document.getElementById('res-inss'),
        resIrrf: document.getElementById('res-irrf'),
    };

    // --- [MÁSCARA DE MOEDA] ---
    const formatCurrencyInput = (value) => {
        value = value.replace(/\D/g, "");
        value = (value / 100).toFixed(2) + "";
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        return "R$ " + value;
    };

    [dom.salarioBrutoInput, dom.mediaVariaveisInput].forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = formatCurrencyInput(e.target.value);
        });
    });

    const parseCurrency = (str) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    };

    // --- CONFIGURAÇÃO FISCAL 2026 (PADRÃO UTILWEB) ---
    const config = {
        deducaoIRPorDependente: 189.59,
        
        inssTable: [
            { teto: 1412.00, aliquota: 0.075 },
            { teto: 2666.68, aliquota: 0.090 },
            { teto: 4000.03, aliquota: 0.120 },
            { teto: 8200.00, aliquota: 0.140 }
        ],
        tetoINSS: 8200.00,
        
        // Tabela IRRF TRADICIONAL
        irrfTable: [
            { teto: 2428.80, aliquota: 0,     deducao: 0 },       
            { teto: 2826.65, aliquota: 0.075, deducao: 182.16 },
            { teto: 3751.05, aliquota: 0.15,  deducao: 394.16 },
            { teto: 4664.68, aliquota: 0.225, deducao: 675.49 },
            { teto: Infinity, aliquota: 0.275, deducao: 908.73 }
        ],
        
        // Redutor da Lei 15.270/2025
        redutor: {
            tetoIsencao: 5000.00,
            tetoLimiteDesconto: 7350.00,
            fator: 0.133145,
            fixo: 978.62
        }
    };

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- ENGINE FISCAL ---

    const calcularINSS = (brutoTotal) => {
        // Garante que a base não ultrapasse o teto antes do loop
        const baseINSS = Math.min(brutoTotal, config.tetoINSS);
        let desconto = 0;
        let baseAnterior = 0;
        
        for (const faixa of config.inssTable) {
            if (baseINSS > baseAnterior) {
                const tetoFaixa = Math.min(baseINSS, faixa.teto);
                const baseFaixa = tetoFaixa - baseAnterior;
                desconto += baseFaixa * faixa.aliquota;
                baseAnterior = faixa.teto;
            } else { break; }
        }
        return parseFloat(desconto.toFixed(2));
    };

    const calcularIRRF = (brutoTributavel, inss, dependentes) => {
        // [AJUSTE AUDITORIA] A dedução por dependente é aplicada na base.
        // Se isso reduzir a base para menos de R$ 5.000, o redutor garantirá a isenção total.
        const baseCalculo = Math.max(0, brutoTributavel - inss - (dependentes * config.deducaoIRPorDependente));
        
        if (baseCalculo <= config.irrfTable[0].teto) return 0;

        // 2. Cálculo Tabela Padrão
        const faixa = config.irrfTable.find(f => baseCalculo <= f.teto);
        let impostoBruto = (baseCalculo * faixa.aliquota) - faixa.deducao;

        // 3. Aplicação do Redutor (Lei 15.270)
        let descontoLeiNova = 0;

        if (baseCalculo <= config.redutor.tetoIsencao) {
            descontoLeiNova = impostoBruto;
        } else if (baseCalculo <= config.redutor.tetoLimiteDesconto) {
            // Fórmula aplica sobre o BRUTO TRIBUTÁVEL
            const valorFormula = config.redutor.fixo - (config.redutor.fator * brutoTributavel);
            descontoLeiNova = Math.max(0, valorFormula);
        }

        return parseFloat(Math.max(0, impostoBruto - descontoLeiNova).toFixed(2));
    };

    // --- MAIN LOGIC ---

    const onFormSubmit = (event) => {
        event.preventDefault();

        const salarioBruto = parseCurrency(dom.salarioBrutoInput.value);
        const mediaVariaveis = parseCurrency(dom.mediaVariaveisInput.value);
        
        if (salarioBruto <= 0) {
            alert("Por favor, informe um Salário Bruto válido.");
            return;
        }

        const numDependentes = parseInt(dom.dependentesInput.value, 10) || 0;
        const adiantar13 = dom.adiantar13Select.value === 'sim';
        
        const selecaoDias = dom.diasFeriasSelect.value;
        let diasDescanso = 0;
        let venderAbono = false;

        if (selecaoDias === '20_vende') {
            diasDescanso = 20;
            venderAbono = true;
        } else {
            diasDescanso = parseInt(selecaoDias, 10);
            venderAbono = false;
        }

        // 1. Remuneração Base (Salário + Médias)
        const remuneracaoTotal = salarioBruto + mediaVariaveis;
        const valorDia = remuneracaoTotal / 30;

        // 2. Férias Brutas (Tributável)
        const valorDiasFerias = valorDia * diasDescanso;
        const umTercoConstitucional = valorDiasFerias / 3;
        const feriasBrutas = valorDiasFerias + umTercoConstitucional;

        // 3. Abono Pecuniário (Indenizatório / Isento)
        let abonoPecuniario = 0;
        if (venderAbono) {
            const valorDezDias = valorDia * 10; 
            const umTercoAbono = valorDezDias / 3;
            abonoPecuniario = valorDezDias + umTercoAbono;
        }

        // 4. Adiantamento 13º (Não tributado no recibo de férias)
        // O acerto tributário ocorre apenas em Dezembro.
        let adiantamento13 = 0;
        if (adiantar13) {
            adiantamento13 = salarioBruto / 2;
        }

        // 5. Base de Cálculo Tributável (Apenas Férias Gozadas + 1/3)
        const baseTributavel = feriasBrutas; 
        
        // 6. Descontos
        const descontoINSS = calcularINSS(baseTributavel);
        const descontoIRRF = calcularIRRF(baseTributavel, descontoINSS, numDependentes);

        // 7. Total Líquido
        const totalLiquido = (feriasBrutas + abonoPecuniario + adiantamento13) - descontoINSS - descontoIRRF;

        updateDOM({
            feriasBrutas, 
            abonoPecuniario, 
            adiantamento13,
            descontoINSS, 
            descontoIRRF, 
            totalLiquido
        });
    };

    const updateDOM = (results) => {
        dom.resFeriasBrutas.textContent = formatCurrency(results.feriasBrutas);
        dom.resInss.textContent = formatCurrency(results.descontoINSS > 0 ? -results.descontoINSS : 0);
        
        // [AJUSTE AUDITORIA] Resetar classe antes de aplicar lógica
        dom.resIrrf.classList.remove('badge-isento');
        
        if (results.descontoIRRF > 0) {
             dom.resIrrf.textContent = formatCurrency(-results.descontoIRRF);
        } else {
             dom.resIrrf.textContent = "Isento (Lei 2026)";
             dom.resIrrf.classList.add('badge-isento');
        }

        dom.resValorLiquido.textContent = formatCurrency(results.totalLiquido);

        // Controle de exibição de linhas opcionais
        if (results.abonoPecuniario > 0) {
            dom.resAbono.textContent = formatCurrency(results.abonoPecuniario);
            dom.rowAbono.style.display = 'flex';
        } else {
            dom.rowAbono.style.display = 'none';
        }

        if (results.adiantamento13 > 0) {
            dom.resAdiantamento13.textContent = formatCurrency(results.adiantamento13);
            dom.rowAdiantamento13.style.display = 'flex';
            // Dica visual opcional: poderia adicionar um tooltip aqui informando sobre a tributação futura
        } else {
            dom.rowAdiantamento13.style.display = 'none';
        }

        dom.resultsSection.style.display = 'block';
        dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    if (dom.form) {
        dom.form.addEventListener('submit', onFormSubmit);
    }
});

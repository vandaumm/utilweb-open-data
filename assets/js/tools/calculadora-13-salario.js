/**
 * @fileoverview Lógica para a Calculadora de 13º Salário do Utilweb (Versão 2026 Oficial).
 * Regras Atualizadas: Tributação Exclusiva na Fonte, INSS Progressivo e Lei 15.270.
 * * * NOTA TÉCNICA E JURÍDICA: 
 * O 13º Salário possui tributação exclusiva e definitiva.
 * 1. 1ª Parcela (Adiantamento): Paga integralmente (50%), sem descontos.
 * 2. 2ª Parcela (Quitação): Sofre desconto integral do INSS sobre o valor total anual
 * e do IRRF (sobre o total, deduzido INSS, dependentes e pensão).
 * 3. Lei 15.270/2025: O redutor simplificado aplica-se também ao 13º, conforme
 * orientação da Receita Federal, tratando-o como rendimento exclusivo.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Mapeamento de Elementos do DOM ---
    const dom = {
        form: document.getElementById('salario13-form'),
        salarioBrutoInput: document.getElementById('salario-bruto'),
        mesesTrabalhadosInput: document.getElementById('meses-trabalhados'),
        dependentesInput: document.getElementById('dependentes'),
        resultsSection: document.getElementById('results-section')
    };

    // --- [MÁSCARA DE MOEDA] ---
    const formatCurrencyInput = (value) => {
        value = value.replace(/\D/g, "");
        value = (value / 100).toFixed(2) + "";
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        return "R$ " + value;
    };

    if (dom.salarioBrutoInput) {
        dom.salarioBrutoInput.addEventListener('input', (e) => {
            e.target.value = formatCurrencyInput(e.target.value);
        });
    }

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
        
        // Tabela IRRF TRADICIONAL (Utilizada para Tributação Exclusiva)
        irrfTableExclusiva13: [
            { teto: 2428.80, aliquota: 0,     deducao: 0 },       
            { teto: 2826.65, aliquota: 0.075, deducao: 182.16 },
            { teto: 3751.05, aliquota: 0.15,  deducao: 394.16 },
            { teto: 4664.68, aliquota: 0.225, deducao: 675.49 },
            { teto: Infinity, aliquota: 0.275, deducao: 908.73 }
        ],
        
        // Redutor da Lei 15.270/2025 (Aplicável também ao 13º conforme Orientação da Receita)
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

    const calcularIRRF = (baseCalculo) => {
        if (baseCalculo <= config.irrfTableExclusiva13[0].teto) return 0;

        // 1. Cálculo Padrão (Tabela Tradicional)
        const faixa = config.irrfTableExclusiva13.find(f => baseCalculo <= f.teto);
        let impostoBruto = 0;
        if (faixa) {
             impostoBruto = (baseCalculo * faixa.aliquota) - faixa.deducao;
        }

        // 2. Aplicação do Redutor (Lei 15.270 aplica-se ao 13º também)
        // Fonte: Receita Federal - Orientações para Fontes Pagadoras
        let descontoLeiNova = 0;

        if (baseCalculo <= config.redutor.tetoIsencao) {
            descontoLeiNova = impostoBruto;
        } else if (baseCalculo <= config.redutor.tetoLimiteDesconto) {
            // A fórmula usa a base de cálculo tributável como referência
            const valorFormula = config.redutor.fixo - (config.redutor.fator * baseCalculo);
            descontoLeiNova = Math.max(0, valorFormula);
        }

        return parseFloat(Math.max(0, impostoBruto - descontoLeiNova).toFixed(2));
    };

    // --- CÁLCULO CORE (13º SALÁRIO) ---

    const calcular13 = (values) => {
        const { salarioBruto, mesesTrabalhados, dependentes } = values;

        // 1. Valor Integral do 13º (Proporcional aos meses trabalhados no ano)
        const salario13Integral = (salarioBruto / 12) * mesesTrabalhados;
        
        // 2. Primeira Parcela (Adiantamento - sem descontos legais)
        const primeiraParcela = salario13Integral / 2;

        // 3. Cálculo dos Descontos (Sobre o Valor Integral Anual)
        const inss = calcularINSS(salario13Integral);
        
        // 4. Base IRRF (Valor Integral - INSS - Dependentes)
        const deducaoDependentes = dependentes * config.deducaoIRPorDependente;
        const baseCalculoIRRF = Math.max(0, salario13Integral - inss - deducaoDependentes);
        
        const irrf = calcularIRRF(baseCalculoIRRF);
        
        // 5. Segunda Parcela (Quitação)
        // Fórmula: Valor Integral - Adiantamento (1ª Parc) - INSS Total - IRRF Total
        const totalDescontos = inss + irrf;
        const segundaParcela = salario13Integral - primeiraParcela - totalDescontos;
        
        // 6. Total Líquido Recebido (Soma das duas parcelas líquidas)
        const salario13Liquido = primeiraParcela + segundaParcela;

        return {
            salario13Bruto: salario13Integral,
            primeiraParcela,
            segundaParcela,
            salario13Liquido,
            inss,
            irrf
        };
    };

    // --- EXIBIÇÃO ---

    const displayResults = (result) => {
        // Formatação condicional do IRRF (Isento/Valor)
        const irrfDisplay = result.irrf > 0 
            ? `<span class="negative">${formatCurrency(result.irrf)}</span>`
            : `<span class="badge-isento">Isento (Lei 2026)</span>`;

        dom.resultsSection.innerHTML = `
            <h2 class="results-header">Resultado do Cálculo</h2>
            
            <div class="results-breakdown">
                <div class="breakdown-row">
                    <span>Salário Bruto de Referência</span>
                    <span>${formatCurrency(parseCurrency(dom.salarioBrutoInput.value))}</span>
                </div>
                <div class="breakdown-row">
                    <span>13º Salário Bruto (Proporcional)</span>
                    <span>${formatCurrency(result.salario13Bruto)}</span>
                </div>

                <hr class="results-divider">

                <div class="breakdown-row positive">
                    <span>✅ <strong>1ª Parcela (Até 30/Nov)</strong></span>
                    <span><strong>${formatCurrency(result.primeiraParcela)}</strong></span>
                </div>
                <small style="display:block; margin-top:-5px; margin-bottom:15px; color:#666; font-size:0.85em;">
                    *Paga integralmente sem descontos.
                </small>

                <hr class="results-divider">

                <div class="breakdown-row">
                    <span>Valor da 2ª Parcela (Antes dos Descontos)</span>
                    <span>${formatCurrency(result.primeiraParcela)}</span>
                </div>

                <div class="sub-breakdown">
                    <div class="breakdown-row negative">
                        <span>(-) Desconto INSS (Sobre Total)</span>
                        <span>${formatCurrency(result.inss)}</span>
                    </div>
                    <div class="breakdown-row">
                        <span>(-) Desconto IRRF (Sobre Total)</span>
                        ${irrfDisplay}
                    </div>
                </div>

                <div class="breakdown-row positive">
                    <span>✅ <strong>2ª Parcela (Até 20/Dez)</strong></span>
                    <span><strong>${formatCurrency(result.segundaParcela)}</strong></span>
                </div>
            </div>

            <div class="results-summary-final">
                <span>💰 Total Líquido (Soma das Parcelas)</span>
                <span>${formatCurrency(result.salario13Liquido)}</span>
            </div>
            
            <p class="legal-note" style="margin-top: 20px; text-align: center; font-size: 0.8rem; color: #666;">
                *O 13º Salário possui tributação exclusiva e não se soma ao salário mensal. O cálculo do IRRF segue as regras da Lei 15.270/2025.
            </p>
        `;
        dom.resultsSection.style.display = 'block';
        dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    
    // --- EVENT LISTENER ---
    if (dom.form) {
        dom.form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const formValues = {
                salarioBruto: parseCurrency(dom.salarioBrutoInput.value),
                mesesTrabalhados: parseInt(dom.mesesTrabalhadosInput.value, 10),
                dependentes: parseInt(dom.dependentesInput.value, 10)
            };

            // [VALIDAÇÃO ROBUSTA]
            if (!formValues.salarioBruto) {
                alert('Por favor, preencha o Salário Bruto.');
                return;
            }
            if (!formValues.mesesTrabalhados || formValues.mesesTrabalhados < 1 || formValues.mesesTrabalhados > 12) {
                alert('Por favor, informe entre 1 e 12 meses trabalhados.');
                return;
            }

            const result = calcular13(formValues);
            displayResults(result);
        });
    }
});

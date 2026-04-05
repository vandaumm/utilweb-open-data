/**
 * @fileoverview Lógica para a Calculadora de Rescisão de Contrato do Utilweb (Versão 2026 Oficial).
 * Regras Atualizadas: Lei 15.270/2025 (Redutor Simplificado) e Aviso Prévio Proporcional.
 * * NOTA TÉCNICA: 
 * A isenção de R$ 5.000,00 é operacionalizada via redutor legal aplicado após 
 * o cálculo do IRRF pela tabela tradicional, conforme orientação da Receita Federal.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const dom = {
        form: document.getElementById('rescisao-form'),
        dataAdmissao: document.getElementById('data-admissao'),
        dataDemissao: document.getElementById('data-demissao'),
        motivoRescisao: document.getElementById('motivo-rescisao'),
        salarioBruto: document.getElementById('salario-bruto'),
        saldoFgts: document.getElementById('saldo-fgts'),
        avisoPrevio: document.getElementById('aviso-previo'),
        dependentes: document.getElementById('dependentes'),
        feriasVencidas: document.getElementById('ferias-vencidas'),
        resultsSection: document.getElementById('results-section'),
        proventosList: document.getElementById('proventos-list'),
        descontosList: document.getElementById('descontos-list'),
        totalLiquido: document.getElementById('total-liquido-rescisao'),
    };

    // --- [MÁSCARA DE MOEDA] ---
    const formatCurrencyInput = (value) => {
        value = value.replace(/\D/g, "");
        value = (value / 100).toFixed(2) + "";
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        return "R$ " + value;
    };

    if(dom.salarioBruto) {
        dom.salarioBruto.addEventListener('input', (e) => e.target.value = formatCurrencyInput(e.target.value));
    }
    if(dom.saldoFgts) {
        dom.saldoFgts.addEventListener('input', (e) => e.target.value = formatCurrencyInput(e.target.value));
    }

    const parseCurrency = (str) => {
        if (!str) return 0;
        return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    };

    // --- CONFIGURAÇÃO FISCAL 2026 (OFICIAL) ---
    // Mesmo padrão utilizado na Calculadora de Salário Líquido
    const config = {
        deducaoIRPorDependente: 189.59, 
        
        inssTable: [
            { teto: 1412.00, aliquota: 0.075 },
            { teto: 2666.68, aliquota: 0.090 },
            { teto: 4000.03, aliquota: 0.120 },
            { teto: 8200.00, aliquota: 0.140 }
        ],
        tetoINSS: 8200.00,
        
        // Tabela IRRF TRADICIONAL (A lei manteve esta tabela)
        irrfTable: [
            { teto: 2428.80, aliquota: 0,     deducao: 0 },       
            { teto: 2826.65, aliquota: 0.075, deducao: 182.16 },
            { teto: 3751.05, aliquota: 0.15,  deducao: 394.16 },
            { teto: 4664.68, aliquota: 0.225, deducao: 675.49 },
            { teto: Infinity, aliquota: 0.275, deducao: 908.73 }
        ],
        
        // Redutor da Lei 15.270/2025 (Mecanismo da Isenção)
        redutor: {
            tetoIsencao: 5000.00,
            tetoLimiteDesconto: 7350.00,
            fator: 0.133145,
            fixo: 978.62
        }
    };

    // --- Helper Functions ---
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr + 'T00:00:00');
    };

    // --- Lógica de Cálculo Fiscal (Engine Atualizada) ---

    const calcularINSS = (brutoTotal) => {
        // Blindagem: Garante que não calcule sobre valor acima do teto
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
        // 1. Definição da Base de Cálculo
        const baseCalculo = brutoTributavel - inss - (dependentes * config.deducaoIRPorDependente);
        
        if (baseCalculo <= config.irrfTable[0].teto) return 0;

        // 2. Cálculo Padrão (Tabela Tradicional)
        let impostoBruto = 0;
        const faixa = config.irrfTable.find(f => baseCalculo <= f.teto);
        if (faixa) {
            impostoBruto = (baseCalculo * faixa.aliquota) - faixa.deducao;
        }

        // 3. Aplicação do Redutor (Lei 15.270)
        let descontoLeiNova = 0;

        if (baseCalculo <= config.redutor.tetoIsencao) {
            // Isenção total para base até 5k
            descontoLeiNova = impostoBruto;
        } else if (baseCalculo <= config.redutor.tetoLimiteDesconto) {
            // Redução parcial (Fórmula Oficial aplicada sobre o BRUTO)
            const valorFormula = config.redutor.fixo - (config.redutor.fator * brutoTributavel);
            descontoLeiNova = Math.max(0, valorFormula);
        }

        const impostoFinal = Math.max(0, impostoBruto - descontoLeiNova);
        return parseFloat(impostoFinal.toFixed(2));
    };

    // --- Main Logic (Rescisão) ---
    if(dom.form) {
        dom.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const admissao = parseDate(dom.dataAdmissao.value);
            const demissao = parseDate(dom.dataDemissao.value);
            
            if (!admissao || !demissao) {
                alert("Por favor, preencha as datas corretamente.");
                return;
            }
            if (demissao < admissao) {
                alert("A data de demissão não pode ser anterior à data de admissão.");
                return;
            }

            const inputs = {
                salario: parseCurrency(dom.salarioBruto.value),
                saldoFgts: parseCurrency(dom.saldoFgts.value),
                dependentes: parseInt(dom.dependentes.value, 10) || 0,
                motivo: dom.motivoRescisao.value,
                aviso: dom.avisoPrevio.value,
                temFeriasVencidas: dom.feriasVencidas.checked,
            };
            
            if (inputs.salario <= 0) {
                alert("Por favor, informe um salário válido.");
                return;
            }

            const proventos = {};
            const descontos = {};

            // --- 1. Saldo de Salário ---
            const diasTrabalhadosMes = demissao.getDate();
            proventos.saldoDeSalario = (inputs.salario / 30) * diasTrabalhadosMes;
            
            // --- 2. Aviso Prévio (Lei 12.506) ---
            const diffTime = Math.abs(demissao - admissao);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const anosCompletos = Math.floor(diffDays / 365);
            
            // 30 dias base + 3 dias por ano completo (Max 90)
            let diasAvisoTotal = 30 + Math.min(anosCompletos * 3, 60);

            proventos.avisoPrevio = 0;
            if (inputs.motivo === 'sem_justa_causa' && inputs.aviso === 'indenizado') {
                proventos.avisoPrevio = (inputs.salario / 30) * diasAvisoTotal;
            }

            // --- 3. 13º Proporcional ---
            const anoDemissao = demissao.getFullYear();
            const inicioAno = new Date(anoDemissao, 0, 1);
            const dataInicio13 = admissao > inicioAno ? admissao : inicioAno;
            
            let meses13 = (demissao.getMonth() - dataInicio13.getMonth()) + 1;
            
            // Ajuste fração 15 dias
            if (dataInicio13.getDate() > 15) meses13 -= 1;
            if (demissao.getDate() < 15) meses13 -= 1;
            
            // Projeção do aviso prévio
            if (inputs.motivo === 'sem_justa_causa' && inputs.aviso === 'indenizado') {
                meses13 = Math.min(12, meses13 + 1);
            }
            meses13 = Math.max(0, Math.min(12, meses13));

            proventos.decimoTerceiro = (inputs.salario / 12) * meses13;
            
            // --- 4. Férias Proporcionais ---
            const inicioPeriodoAquisitivo = new Date(admissao);
            inicioPeriodoAquisitivo.setFullYear(demissao.getFullYear());
            if (inicioPeriodoAquisitivo > demissao) {
                inicioPeriodoAquisitivo.setFullYear(demissao.getFullYear() - 1);
            }

            let mesesFerias = (demissao.getMonth() - inicioPeriodoAquisitivo.getMonth());
            if (mesesFerias < 0) mesesFerias += 12;
            
            if (demissao.getDate() >= 15) mesesFerias += 1;

            if (inputs.motivo === 'sem_justa_causa' && inputs.aviso === 'indenizado') {
                mesesFerias += 1;
            }
            mesesFerias = Math.max(0, Math.min(12, mesesFerias));

            proventos.feriasProporcionais = (inputs.salario / 12) * mesesFerias;
            proventos.umTercoFeriasProp = proventos.feriasProporcionais / 3;

            // --- 5. Férias Vencidas ---
            proventos.feriasVencidas = 0;
            proventos.umTercoFeriasVenc = 0;
            if (inputs.temFeriasVencidas) {
                proventos.feriasVencidas = inputs.salario;
                proventos.umTercoFeriasVenc = inputs.salario / 3;
            }

            // --- 6. Multa FGTS ---
            proventos.multaFgts = 0;
            if (inputs.motivo === 'sem_justa_causa') {
                proventos.multaFgts = inputs.saldoFgts * 0.40;
            }

            // --- Regras de Justa Causa / Pedido Demissão ---
            if (inputs.motivo === 'pedido_demissao') {
                proventos.avisoPrevio = 0;
                proventos.multaFgts = 0;
            } else if (inputs.motivo === 'com_justa_causa') {
                proventos.avisoPrevio = 0;
                proventos.multaFgts = 0;
                proventos.decimoTerceiro = 0;
                proventos.feriasProporcionais = 0;
                proventos.umTercoFeriasProp = 0;
            }
            
            // --- CÁLCULO DOS DESCONTOS (O Pulo do Gato) ---
            
            // 1. INSS (Calculado separadamente para Saldo de Salário e 13º)
            descontos.inssSalario = calcularINSS(proventos.saldoDeSalario);
            descontos.inss13 = calcularINSS(proventos.decimoTerceiro);
            
            // 2. IRRF (Calculado sobre a soma das verbas tributáveis)
            // Nota: Férias Indenizadas + 1/3 e Aviso Prévio Indenizado são ISENTOS de IR.
            // Somamos Saldo de Salário + 13º para encontrar a faixa correta na tabela.
            
            const brutoTributavelTotal = proventos.saldoDeSalario + proventos.decimoTerceiro;
            const inssTotalDedutivel = descontos.inssSalario + descontos.inss13;
            
            descontos.irrf = calcularIRRF(
                brutoTributavelTotal, 
                inssTotalDedutivel, 
                inputs.dependentes
            );

            // --- Renderização ---
            renderResults(proventos, descontos);
        });
    }

    function renderResults(proventos, descontos) {
        dom.proventosList.innerHTML = '';
        dom.descontosList.innerHTML = '';
        let totalProventos = 0;
        let totalDescontos = 0;

        const addRow = (list, label, value, type = 'positive') => {
            if (value > 0.01) { 
                list.innerHTML += `<div class="breakdown-row ${type}"><span>${label}</span><span>${formatCurrency(value)}</span></div>`;
                if(type === 'positive') totalProventos += value;
                else totalDescontos += value;
            }
        };

        // Proventos
        addRow(dom.proventosList, 'Saldo de Salário', proventos.saldoDeSalario);
        addRow(dom.proventosList, 'Aviso Prévio Indenizado', proventos.avisoPrevio);
        addRow(dom.proventosList, '13º Proporcional', proventos.decimoTerceiro);
        addRow(dom.proventosList, 'Férias Vencidas', proventos.feriasVencidas);
        addRow(dom.proventosList, '1/3 Férias Vencidas', proventos.umTercoFeriasVenc);
        addRow(dom.proventosList, 'Férias Proporcionais', proventos.feriasProporcionais);
        addRow(dom.proventosList, '1/3 Férias Prop.', proventos.umTercoFeriasProp);
        addRow(dom.proventosList, 'Multa 40% FGTS', proventos.multaFgts);

        // Descontos
        addRow(dom.descontosList, 'INSS (Sobre Salário)', descontos.inssSalario, 'negative');
        addRow(dom.descontosList, 'INSS (Sobre 13º)', descontos.inss13, 'negative');
        
        // Exibição inteligente do IRRF
        if (descontos.irrf > 0) {
            addRow(dom.descontosList, 'IRRF (Retido na Fonte)', descontos.irrf, 'negative');
        } else {
            // Se for isento, não exibe linha negativa ou exibe informativo opcional
             // dom.descontosList.innerHTML += `<div class="breakdown-row neutral" style="color:var(--c-success)"><span>IRRF</span><span>Isento (Lei 2026)</span></div>`;
        }
        
        const totalLiquido = totalProventos - totalDescontos;
        dom.totalLiquido.textContent = formatCurrency(totalLiquido);

        dom.resultsSection.style.display = 'block';
        dom.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

/**
 * Utilweb: Calculadora de IMC v2.0 (Padrão V5)
 */
document.addEventListener('DOMContentLoaded', function() {
    // --- MAPEAMENTO DE ELEMENTOS ---
    const elements = {
        alturaInput: document.getElementById('altura'),
        pesoInput: document.getElementById('peso'),
        imcValor: document.getElementById('imc-valor'),
        imcCategoriaTextoGrafico: document.getElementById('imc-categoria-texto-grafico'),
        faixaPesoIdeal: document.getElementById('faixa-peso-ideal'),
        segmentos: document.querySelectorAll('.imc-segmento'),
        resultSection: document.querySelector('.imc-resultado-section')
    };

    // --- INICIALIZAÇÃO ---
    function initialize() {
        if(!elements.alturaInput) return;

        elements.alturaInput.addEventListener('input', handleCalculations);
        elements.pesoInput.addEventListener('input', (e) => {
            formatPesoInput(e);
            handleCalculations();
        });
    }

    // --- MÁSCARA DE PESO (Permite vírgula) ---
    function formatPesoInput(event) {
        let value = event.target.value.replace(/[^0-9,]/g, ''); // Permite números e vírgula
        
        // Evita múltiplas vírgulas
        if ((value.match(/,/g) || []).length > 1) {
            value = value.substring(0, value.lastIndexOf(','));
        }
        
        event.target.value = value;
    }

    // --- CÁLCULO CENTRAL ---
    function handleCalculations() {
        const alturaVal = elements.alturaInput.value;
        const pesoVal = elements.pesoInput.value.replace(',', '.');
        
        const alturaCm = parseFloat(alturaVal);
        const peso = parseFloat(pesoVal);

        // 1. Atualiza Faixa de Peso Ideal (independente do peso atual)
        if (!isNaN(alturaCm) && alturaCm > 50 && alturaCm < 300) {
            updateFaixaDePesoIdeal(alturaCm);
        } else {
            elements.faixaPesoIdeal.textContent = 'Preencha sua altura acima';
            elements.faixaPesoIdeal.classList.remove('active');
        }

        // 2. Calcula IMC
        if (!isNaN(alturaCm) && alturaCm > 0 && !isNaN(peso) && peso > 0) {
            const alturaM = alturaCm / 100;
            const imc = peso / (alturaM * alturaM);
            updateIMCDisplay(imc);
            elements.resultSection.classList.add('has-result');
        } else {
            resetIMCDisplay();
            elements.resultSection.classList.remove('has-result');
        }
    }
    
    // --- ATUALIZAÇÃO DE UI ---
    function updateIMCDisplay(imc) {
        const categoriaInfo = getCategoriaIMC(imc);
        
        // Valor Numérico
        elements.imcValor.textContent = imc.toFixed(1).replace('.', ',');
        
        // Texto da Categoria e Cor
        elements.imcCategoriaTextoGrafico.textContent = categoriaInfo.nome;
        elements.imcCategoriaTextoGrafico.className = 'imc-categoria-texto-grafico'; // Reset
        elements.imcCategoriaTextoGrafico.classList.add(categoriaInfo.classe);

        // Gráfico SVG (Ativa o segmento correto)
        elements.segmentos.forEach(segmento => {
            if (segmento.id === categoriaInfo.segmentId) {
                segmento.classList.add('active');
            } else {
                segmento.classList.remove('active');
            }
        });
    }

    function resetIMCDisplay() {
        elements.imcValor.textContent = '--';
        elements.imcCategoriaTextoGrafico.textContent = 'Aguardando dados...';
        elements.imcCategoriaTextoGrafico.className = 'imc-categoria-texto-grafico cat-preencha';
        elements.segmentos.forEach(segmento => segmento.classList.remove('active'));
    }

    function updateFaixaDePesoIdeal(alturaCm) {
        const alturaM = alturaCm / 100;
        const pesoMin = 18.5 * (alturaM * alturaM);
        const pesoMax = 24.9 * (alturaM * alturaM);
        elements.faixaPesoIdeal.textContent = `${pesoMin.toFixed(1).replace('.', ',')} kg a ${pesoMax.toFixed(1).replace('.', ',')} kg`;
        elements.faixaPesoIdeal.classList.add('active');
    }

    // --- LÓGICA DE CATEGORIAS (OMS) ---
    function getCategoriaIMC(imc) {
        if (imc < 18.5) {
            return { nome: 'Abaixo do Peso', classe: 'cat-magreza', segmentId: 'segmento-magreza' };
        } else if (imc < 25) {
            return { nome: 'Peso Normal', classe: 'cat-normal', segmentId: 'segmento-normal' };
        } else if (imc < 30) {
            return { nome: 'Sobrepeso', classe: 'cat-sobrepeso', segmentId: 'segmento-sobrepeso' };
        } else { 
            // Simplificação visual: Obesidade I, II e III caem no mesmo segmento vermelho/laranja
            return { nome: 'Obesidade', classe: 'cat-obesidade', segmentId: 'segmento-obesidade' };
        }
    }

    initialize();
});

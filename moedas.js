document.addEventListener('DOMContentLoaded', () => {
    // 1. Elementos do DOM
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    const btnSwap = document.getElementById('btn-swap');
    const config = document.getElementById('moeda-config');

    if (!config) return;

    let rate = parseFloat(config.dataset.rate);
    const labelA = document.querySelector('label[for="input-a"]');
    const labelB = document.querySelector('label[for="input-b"]');
    
    let isSwapped = false;

    // --- FUNÇÕES DE AJUDA ---

    // Converte string "10.000,00" para float 10000.00
    function parseValue(str) {
        if (!str) return 0;
        // Remove pontos de milhar e troca vírgula por ponto
        let clean = str.replace(/\./g, '').replace(',', '.');
        let val = parseFloat(clean);
        return isNaN(val) ? 0 : val;
    }

    // Formata float para "10.000,00" (Com lógica inteligente para cripto)
    function formatValue(val) {
        if (val === 0) return "";
        
        // Se for menor que 1 (ex: cripto), mostra até 8 casas
        let maxDigits = Math.abs(val) < 1.0 ? 8 : 2;
        
        return val.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: maxDigits 
        });
    }

    // --- CÁLCULO ---
    function calculate(source) {
        // Lógica para Input A (Topo)
        if (source === 'a') {
            const rawA = inputA.value;
            // Se o usuário está digitando (tem cursor), não formatamos o input A ainda, só calculamos o B
            const valA = parseValue(rawA);
            
            let res = isSwapped ? valA / rate : valA * rate;
            inputB.value = formatValue(res);
        } 
        // Lógica para Input B (Baixo)
        else {
            const rawB = inputB.value;
            const valB = parseValue(rawB);
            
            let res = isSwapped ? valB * rate : valB / rate;
            inputA.value = formatValue(res);
        }
    }

    // Formata o próprio campo quando o usuário sai dele (Blur)
    function formatInput(e) {
        const val = parseValue(e.target.value);
        if (val !== 0) {
            e.target.value = formatValue(val);
        }
    }

    // Listeners
    inputA.addEventListener('input', () => calculate('a'));
    inputB.addEventListener('input', () => calculate('b'));
    
    // Formata "bonito" (10.000,00) quando clica fora
    inputA.addEventListener('change', formatInput); 
    inputB.addEventListener('change', formatInput);

    // --- BOTÃO INVERTER (SWAP) ---
    if (btnSwap) {
        btnSwap.addEventListener('click', () => {
            isSwapped = !isSwapped;
            
            // 1. Troca Labels (Visual)
            const tempText = labelA.textContent;
            labelA.textContent = labelB.textContent;
            labelB.textContent = tempText;

            // 2. Troca VALORES (O Pulo do Gato)
            // O valor que estava em cima vai para baixo, criando o efeito espelho
            const valTop = inputA.value;
            const valBottom = inputB.value;
            
            inputA.value = valBottom;
            inputB.value = valTop;

            // Animação
            btnSwap.classList.toggle('swapped');
        });
    }
    calculate('a');
});

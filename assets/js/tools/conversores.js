document.addEventListener('DOMContentLoaded', () => {
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    const btnSwap = document.getElementById('btn-swap');

    const configEl = document.getElementById('conversor-config');
    if (!configEl) return;

    const { type } = configEl.dataset;
    const factor = parseFloat(configEl.dataset.factor);

    let isSwapped = false;

    function formatNum(num) {
        if (!isFinite(num)) return '';
        return Number.isInteger(num) ? num : parseFloat(num.toFixed(6));
    }

    function convertAtoB(value) {
        switch (type) {
            case 'multiply':
                return value * factor;
            case 'divide':
                return value / factor;
            case 'inverse':
                return factor / value;
            case 'c_to_f':
                return (value * 1.8) + 32;
            case 'f_to_c':
                return (value - 32) / 1.8;
            case 'c_to_rankine':
                return (value + 273.15) * 1.8;
            case 'rankine_to_c':
                return (value - 491.67) / 1.8;
            
            // Novas rotas de Kelvin integradas
            case 'k_to_f':
                return (value - 273.15) * 1.8 + 32;
            case 'f_to_k':
                return (value - 32) / 1.8 + 273.15;
            case 'c_to_k':
                return value + 273.15;
            case 'k_to_c':
                return value - 273.15;
                
            default:
                return null;
        }
    }

    function convertBtoA(value) {
        switch (type) {
            case 'multiply':
                return value / factor;
            case 'divide':
                return value * factor;
            case 'inverse':
                return factor / value;
            case 'c_to_f':
                return (value - 32) / 1.8;
            case 'f_to_c':
                return (value * 1.8) + 32;
            case 'c_to_rankine':
                return (value - 491.67) / 1.8;
            case 'rankine_to_c':
                return (value + 273.15) * 1.8;
                
            // Operações inversas para o botão Swap
            case 'k_to_f':
                return (value - 32) / 1.8 + 273.15;
            case 'f_to_k':
                return (value - 273.15) * 1.8 + 32;
            case 'c_to_k':
                return value - 273.15;
            case 'k_to_c':
                return value + 273.15;
                
            default:
                return null;
        }
    }

    // Função auxiliar para limpar a entrada
    function parseInput(valStr) {
        if (!valStr) return NaN;
        // Troca vírgula por ponto para o JS entender
        const safeStr = valStr.replace(',', '.'); 
        return parseFloat(safeStr);
    }

    function calculate(from) {
        if (from === 'a') {
            // [CORREÇÃO] Usando a nova função parseInput
            const val = parseInput(inputA.value); 
            
            if (isNaN(val)) {
                inputB.value = '';
                return;
            }

            const res = isSwapped
                ? convertBtoA(val)
                : convertAtoB(val);

            // [MELHORIA] Formatamos a saída, mas mantemos o ponto interno do JS
            // O navegador converte visualmente para vírgula se o locale do usuário for PT-BR
            inputB.value = formatNum(res);

        } else {
            // [CORREÇÃO] Mesma coisa para o input B
            const val = parseInput(inputB.value);
            
            if (isNaN(val)) {
                inputA.value = '';
                return;
            }

            const res = isSwapped
                ? convertAtoB(val)
                : convertBtoA(val);

            inputA.value = formatNum(res);
        }
    }

    inputA.addEventListener('input', () => calculate('a'));
    inputB.addEventListener('input', () => calculate('b'));

    if (btnSwap) {
        btnSwap.addEventListener('click', () => {
            isSwapped = !isSwapped;

            const labelA = document.querySelector('label[for="input-a"]');
            const labelB = document.querySelector('label[for="input-b"]');

            if (labelA && labelB) {
                [labelA.textContent, labelB.textContent] =
                [labelB.textContent, labelA.textContent];
            }

            [inputA.value, inputB.value] = [inputB.value, inputA.value];

            if (inputA.value !== '') {
                calculate('a');
            }
        });
    }
    
    if (inputA && !inputA.value) {
        inputA.value = 1;
    }
    calculate('a');
});

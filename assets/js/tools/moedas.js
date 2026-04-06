document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const inputA = document.getElementById('input-a');
    const inputB = document.getElementById('input-b');
    const btnSwap = document.getElementById('btn-swap');
    const config = document.getElementById('moeda-config');

    if (!config) return;

    let rate = parseFloat(config.dataset.rate);
    const labelA = document.querySelector('label[for="input-a"]');
    const labelB = document.querySelector('label[for="input-b"]');
    
    let isSwapped = false;

    // --- HELPER FUNCTIONS ---

    // Converts string "1,000.00" to float 1000.00
    function parseValue(str) {
        if (!str) return 0;
        // CHANGED: Now handles international format (removes commas, keeps dot)
        let clean = str.replace(/,/g, ''); 
        let val = parseFloat(clean);
        return isNaN(val) ? 0 : val;
    }

    // Formats float to "1,000.00" (Smart logic for crypto)
    function formatValue(val) {
        if (val === 0) return "";
        
        // If value is small (e.g., crypto), show up to 8 decimal places
        let maxDigits = Math.abs(val) < 1.0 ? 8 : 2;
        
        // CHANGED: Using 'en-US' for global standard formatting
        return val.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: maxDigits 
        });
    }

    // --- CALCULATION ---
    function calculate(source) {
        if (source === 'a') {
            const rawA = inputA.value;
            const valA = parseValue(rawA);
            
            let res = isSwapped ? valA / rate : valA * rate;
            inputB.value = formatValue(res);
        } 
        else {
            const rawB = inputB.value;
            const valB = parseValue(rawB);
            
            let res = isSwapped ? valB * rate : valB / rate;
            inputA.value = formatValue(res);
        }
    }

    // Formats the field when user leaves it (Blur)
    function formatInput(e) {
        const val = parseValue(e.target.value);
        if (val !== 0) {
            e.target.value = formatValue(val);
        }
    }

    // Listeners
    inputA.addEventListener('input', () => calculate('a'));
    inputB.addEventListener('input', () => calculate('b'));
    
    inputA.addEventListener('change', formatInput); 
    inputB.addEventListener('change', formatInput);

    // --- SWAP BUTTON ---
    if (btnSwap) {
        btnSwap.addEventListener('click', () => {
            isSwapped = !isSwapped;
            
            // 1. Swap Labels
            const tempText = labelA.textContent;
            labelA.textContent = labelB.textContent;
            labelB.textContent = tempText;

            // 2. Swap Values
            const valTop = inputA.value;
            const valBottom = inputB.value;
            
            inputA.value = valBottom;
            inputB.value = valTop;

            // Animation
            btnSwap.classList.toggle('swapped');
        });
    }
    calculate('a');
});
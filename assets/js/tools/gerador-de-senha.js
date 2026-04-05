/**
 * @fileoverview Lógica do Gerador de Senha - Utilweb
 * @description Gera senhas seguras, avalia a força e lida com a cópia.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Cache dos elementos do DOM
    const dom = {
        output: document.getElementById('password-output'),
        copyBtn: document.getElementById('copy-btn'),
        lengthSlider: document.getElementById('length-slider'),
        lengthValue: document.getElementById('length-value'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        numbers: document.getElementById('numbers'),
        symbols: document.getElementById('symbols'),
        generateBtn: document.getElementById('generate-btn'),
        strengthBar: document.getElementById('strength-bar'),
        strengthText: document.getElementById('strength-text'),
    };

    // 2. Pool de caracteres (Removidos I, l, 1, 0, O para evitar confusão)
    const chars = { 
        upper: "ABCDEFGHJKLMNPQRSTUVWXYZ", 
        lower: "abcdefghijkmnpqrstuvwxyz", 
        number: "23456789", 
        symbol: "!@#$%^&*_+-=?" 
    };
    
    /**
     * Gera uma nova senha baseada nas opções selecionadas.
     */
    function generatePassword() {
        const length = dom.lengthSlider.value;
        let charPool = "";
        let guarantees = []; // Garante que pelo menos um de cada tipo selecionado exista

        if (dom.uppercase.checked) { charPool += chars.upper; guarantees.push(chars.upper[Math.floor(Math.random() * chars.upper.length)]); }
        if (dom.lowercase.checked) { charPool += chars.lower; guarantees.push(chars.lower[Math.floor(Math.random() * chars.lower.length)]); }
        if (dom.numbers.checked) { charPool += chars.number; guarantees.push(chars.number[Math.floor(Math.random() * chars.number.length)]); }
        if (dom.symbols.checked) { charPool += chars.symbol; guarantees.push(chars.symbol[Math.floor(Math.random() * chars.symbol.length)]); }
        
        if (charPool === "") {
            dom.output.value = "Selecione uma opção";
            evaluateStrength("");
            return;
        }
        
        let password = [...guarantees];
        for (let i = password.length; i < length; i++) {
            password.push(charPool[Math.floor(Math.random() * charPool.length)]);
        }

        // Embaralha o array final (para que os caracteres garantidos não fiquem só no início)
        dom.output.value = password.sort(() => Math.random() - 0.5).join('');
        evaluateStrength(dom.output.value);
    }

    /**
     * Avalia a força da senha e atualiza a UI.
     * @param {string} password - A senha para avaliar.
     */
    function evaluateStrength(password) {
        let score = 0;
        if (!password) { score = -1; }
        
        // Critérios de pontuação
        if (password.length >= 12) score++;
        if (password.length >= 16) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++; // Símbolos
        
        let text = "", color = "transparent";
        switch(score) {
            case 0: case 1: case 2: 
                text = "Fraca"; 
                color = '#F44336'; // Red
                break;
            case 3: case 4: 
                text = "Média"; 
                color = '#FFC107'; // Yellow
                break;
            case 5: 
                text = "Forte"; 
                color = '#4CAF50'; // Green
                break;
            case 6: 
                text = "Muito Forte"; 
                color = '#25D366'; // Strong Green
                break;
            default:
                text = "";
                color = "transparent";
                break;
        }
        
        dom.strengthText.textContent = text;
        dom.strengthBar.style.backgroundColor = color;
        dom.strengthBar.style.width = `${Math.max(0, (score / 6) * 100)}%`;
    }

    // --- 3. Event Listeners ---
    
    // Atualiza o valor e gera nova senha ao mover o slider
    dom.lengthSlider.addEventListener('input', (e) => { 
        dom.lengthValue.textContent = e.target.value; 
        generatePassword(); 
    });
    
    // Gera nova senha ao (des)marcar qualquer checkbox
    Object.values(dom).forEach(el => {
        if (el && el.type === 'checkbox') {
            el.addEventListener('change', generatePassword);
        }
    });
    
    // Gera nova senha ao clicar no botão principal
    dom.generateBtn.addEventListener('click', generatePassword);
    
    // Lógica para copiar
    dom.copyBtn.addEventListener('click', () => {
        if(!dom.output.value || dom.output.value === "Selecione uma opção") return;
        
        navigator.clipboard.writeText(dom.output.value).then(() => {
            dom.copyBtn.textContent = 'Copiado!';
            setTimeout(() => { dom.copyBtn.textContent = 'Copiar'; }, 2000);
        }).catch(err => {
            console.warn("Falha ao copiar para a área de transferência.", err);
        });
    });
    
    // 4. Gera uma senha inicial ao carregar a página
    generatePassword();
});

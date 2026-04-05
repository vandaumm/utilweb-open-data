/**
 * @fileoverview Sorteador Online Hub - Utilweb (Padrão V5)
 * @description Controle de abas, lógica de sorteio com animação e amigo secreto.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM CACHE ---
    const dom = {
        // Abas
        modeButtons: document.querySelectorAll('.tool-mode-btn'),
        modeSections: document.querySelectorAll('.tool-mode-section'),
        
        // Área de Resultado
        resultArea: document.getElementById('result-area'),
        resultValue: document.getElementById('main-result-value'),
        resetBtn: document.getElementById('reset-btn'),

        // Inputs - Nomes
        namesInput: document.getElementById('names-input'),
        preventRepeatNames: document.getElementById('prevent-repeat-names'),
        drawNamesBtn: document.getElementById('draw-names-btn'),

        // Inputs - Números (IDs corrigidos com o HTML)
        minNumber: document.getElementById('min-number'),
        maxNumber: document.getElementById('max-number'),
        qtyNumber: document.getElementById('quantity-number'),
        preventRepeatNumbers: document.getElementById('prevent-repeat-numbers'),
        drawNumbersBtn: document.getElementById('draw-numbers-btn'),

        // Inputs - Instagram
        instaInput: document.getElementById('instagram-input'),
        drawInstaBtn: document.getElementById('draw-instagram-btn'),

        // Inputs - Amigo Secreto
        secretInput: document.getElementById('secret-input'),
        drawSecretBtn: document.getElementById('draw-secret-btn'),
        secretResultList: document.getElementById('secret-result-list')
    };

    // --- STATE ---
    let isAnimating = false;

    // --- 1. CONTROLE DE ABAS ---
    dom.modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;

            // UI Updates
            dom.modeButtons.forEach(btn => btn.classList.remove('is-active'));
            button.classList.add('is-active');

            dom.modeSections.forEach(section => {
                section.classList.remove('is-active');
                if (section.id === `mode-${mode}`) {
                    section.classList.add('is-active');
                }
            });

            // Reseta área de resultado ao trocar de aba
            hideResult();
            if(dom.secretResultList) dom.secretResultList.classList.add('hidden');
        });
    });

    // --- 2. FUNÇÕES AUXILIARES ---

    function showResult(content) {
        dom.resultValue.textContent = content;
        dom.resultArea.classList.remove('hidden');
        
        // Scroll suave até o resultado no mobile
        if(window.innerWidth < 768) {
            dom.resultArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function hideResult() {
        dom.resultArea.classList.add('hidden');
    }

    dom.resetBtn.addEventListener('click', hideResult);

    /**
     * Efeito visual de "Tambor" (Roleta Digital)
     * @param {Array} possibleValues - Array de valores para piscar
     * @param {string|Array} finalValue - O valor (ou valores) vencedor
     */
    function animateDraw(possibleValues, finalValue) {
        if (isAnimating) return;
        isAnimating = true;
        dom.resultArea.classList.remove('hidden');
        
        let counter = 0;
        const cycles = 20; // Quantas trocas antes de parar
        const speed = 100; // ms

        const interval = setInterval(() => {
            // Mostra um valor aleatório do conjunto durante a animação
            const randomPreview = possibleValues[Math.floor(Math.random() * possibleValues.length)];
            dom.resultValue.textContent = randomPreview;
            counter++;

            if (counter >= cycles) {
                clearInterval(interval);
                isAnimating = false;
                // Formata o resultado final
                if (Array.isArray(finalValue)) {
                    dom.resultValue.innerHTML = finalValue.join('<br>');
                } else {
                    dom.resultValue.textContent = finalValue;
                }
            }
        }, speed);
    }

    function parseList(textarea) {
        if (!textarea) return [];
        return textarea.value
            .split(/\r?\n/) // Quebra por linha
            .map(t => t.trim())
            .filter(t => t !== '');
    }

    // --- 3. LÓGICA: SORTEAR NOMES ---
    if (dom.drawNamesBtn) {
        dom.drawNamesBtn.addEventListener('click', () => {
            const list = parseList(dom.namesInput);
            
            if (list.length === 0) {
                alert('Por favor, digite pelo menos um nome.');
                return;
            }

            // Lógica simples: escolhe 1
            const winner = list[Math.floor(Math.random() * list.length)];
            
            // Remove da lista se a checkbox estiver marcada
            if (dom.preventRepeatNames.checked) {
                const newList = list.filter(n => n !== winner);
                dom.namesInput.value = newList.join('\n');
            }

            animateDraw(list, winner);
        });
    }

    // --- 4. LÓGICA: INSTAGRAM (Similar a nomes, mas focado em @) ---
    if (dom.drawInstaBtn) {
        dom.drawInstaBtn.addEventListener('click', () => {
            let list = parseList(dom.instaInput);
            
            if (list.length === 0) {
                alert('Cole a lista de participantes do Instagram.');
                return;
            }

            // Limpeza básica de @ se o usuário colou texto sujo
            // Tenta achar padrões de user se a lista for muito suja, senão usa a linha
            const winner = list[Math.floor(Math.random() * list.length)];
            animateDraw(list, winner);
        });
    }

    // --- 5. LÓGICA: NÚMEROS ---
    if (dom.drawNumbersBtn) {
        dom.drawNumbersBtn.addEventListener('click', () => {
            const min = parseInt(dom.minNumber.value);
            const max = parseInt(dom.maxNumber.value);
            const qty = parseInt(dom.qtyNumber.value) || 1;
            const unique = dom.preventRepeatNumbers.checked;

            if (isNaN(min) || isNaN(max) || min > max) {
                alert('Intervalo de números inválido.');
                return;
            }

            const rangeSize = max - min + 1;
            if (unique && qty > rangeSize) {
                alert(`Impossível sortear ${qty} números únicos num intervalo de ${rangeSize}.`);
                return;
            }

            // Gera números
            let results = [];
            if (unique) {
                // Algoritmo para únicos
                const pool = Array.from({length: rangeSize}, (_, i) => i + min);
                for (let i = 0; i < qty; i++) {
                    const idx = Math.floor(Math.random() * pool.length);
                    results.push(pool[idx]);
                    pool.splice(idx, 1); // Remove sorteado
                }
            } else {
                // Com repetição
                for (let i = 0; i < qty; i++) {
                    results.push(Math.floor(Math.random() * (max - min + 1)) + min);
                }
            }
            
            // Cria um array dummy para a animação
            const dummyPool = Array.from({length: 10}, () => Math.floor(Math.random() * (max - min + 1)) + min);
            
            animateDraw(dummyPool, results.join(' - '));
        });
    }

    // --- 6. LÓGICA: AMIGO SECRETO (Fisher-Yates) ---
    if (dom.drawSecretBtn) {
        dom.drawSecretBtn.addEventListener('click', () => {
            const participants = parseList(dom.secretInput);

            if (participants.length < 3) {
                alert('Mínimo de 3 participantes para Amigo Secreto.');
                return;
            }

            hideResult(); // Esconde o display principal
            dom.secretResultList.classList.remove('hidden');
            dom.secretResultList.innerHTML = '<p>Gerando pares...</p>';

            // Lógica de Embaralhamento (Derangement - ninguém tira a si mesmo)
            let givers = [...participants];
            let receivers = [...participants];
            let success = false;
            let pairs = [];

            // Tenta embaralhar até conseguir um ciclo válido (ninguém tira a si mesmo)
            // Tentativa limitada para evitar loop infinito em edge cases (raro com n>2)
            for(let attempt=0; attempt<100; attempt++) {
                // Embaralha receivers
                for (let i = receivers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
                }

                // Verifica colisão
                const hasCollision = givers.some((giver, i) => giver === receivers[i]);
                if (!hasCollision) {
                    success = true;
                    break;
                }
            }

            if (!success) {
                dom.secretResultList.innerHTML = '<p>Erro ao gerar. Tente novamente.</p>';
                return;
            }

            // Renderiza Lista
            let html = '<h4>Resultado (Copie e envie):</h4>';
            givers.forEach((giver, i) => {
                html += `
                <div class="secret-pair">
                    <span><strong>${giver}</strong> tirou:</span>
                    <span style="filter: blur(4px); cursor: pointer;" onclick="this.style.filter='none'">${receivers[i]}</span>
                </div>`;
            });
            html += '<p style="font-size:0.8rem; margin-top:10px; color:#666;">Clique no borrão para revelar (cuidado para não ver o dos outros!).</p>';
            
            dom.secretResultList.innerHTML = html;
        });
    }

});

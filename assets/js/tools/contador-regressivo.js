/**
 * @fileoverview Lógica do Contador Regressivo V5.8 (Fix Completo)
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CACHE DOM (Seletores) ---
    const dom = {
        // Seções
        setupSection: document.getElementById('setup-section'),
        timerSection: document.getElementById('timer-section'),
        
        // Elementos do Card
        countdownCardTitle: document.getElementById('countdown-card-title'), 
        toolCard: document.getElementById('main-countdown-card'), 

        // Inputs
        eventDate: document.getElementById('event-date'),
        eventTime: document.getElementById('event-time'),
        eventName: document.getElementById('event-name'),
        
        // Botões de Ação
        startBtn: document.getElementById('start-btn'),
        shareBtn: document.getElementById('share-btn'),
        resetBtn: document.getElementById('reset-btn'),
        presets: document.querySelectorAll('.btn-preset'),
        
        // Opções
        optMilliseconds: document.getElementById('opt-milliseconds'),
        optSound: document.getElementById('opt-sound'),
        
        // Display Principal
        daysGroup: document.getElementById('days-group'),
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
        milliseconds: document.getElementById('milliseconds'),
        msSeparator: document.querySelector('.ms-separator'),
        msBlock: document.querySelector('.ms-block'),
        progressBar: document.getElementById('progress-bar'),
        
        // Histórico
        historyList: document.getElementById('history-list'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        
        // Controles Visuais (Zoom/Cor/FS)
        colorInput: document.getElementById('tool-color-input'),
        fullscreenBtn: document.getElementById('fullscreen-toggle-btn'),
        fullscreenContainer: document.getElementById('fullscreen-container'),
        fullscreenCloseBtn: document.getElementById('fullscreen-close-btn'),
        
        // Botões de Zoom (Normal e FS)
        zoomInBtn: document.getElementById('zoom-in-btn'), 
        zoomOutBtn: document.getElementById('zoom-out-btn'),
        fsZoomInBtn: document.getElementById('fs-zoom-in-btn'),
        fsZoomOutBtn: document.getElementById('fs-zoom-out-btn'),
        
        // Display Tela Cheia
        fsDaysGroup: document.getElementById('fs-days-group'),
        fsDays: document.getElementById('fs-days'),
        fsHours: document.getElementById('fs-hours'),
        fsMinutes: document.getElementById('fs-minutes'),
        fsSeconds: document.getElementById('fs-seconds'),
        fsMilliseconds: document.getElementById('fs-milliseconds'),
        fsMsSeparator: document.querySelector('.ms-separator-fs-ms'),
        fsMsBlock: document.querySelector('.ms-block-fs')
    };

    // --- 2. ESTADO DA APLICAÇÃO ---
    let state = {
        targetDate: null,
        startTime: null,
        rafId: null, // ID da animação
        history: [],
        showMs: false,
        playSound: true,
        activeSound: null
    };

    const HISTORY_KEY = 'countdownHistory';
    const ZOOM_KEY = 'utilweb-contador-zoom';
    const COLOR_KEY = 'utilweb-contador-color';
    const AUDIO_PATH = '/sounds/alarm/alarm.mp3';

    // --- 3. ENGINE DE TEMPO (Loop Principal) ---

    const formatMs = (ms) => String(Math.floor(ms / 10)).padStart(2, '0');

    const calculateTime = (target) => {
        const now = new Date().getTime();
        const distance = target - now;
        return {
            total: distance,
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            milliseconds: distance % 1000
        };
    };

    const gameLoop = () => {
        const now = new Date().getTime();

        // A. Atualiza Contador Principal
        if (state.targetDate) {
            const t = calculateTime(state.targetDate);

            if (t.total <= 0) {
                finishCountdown();
            } else {
                updateMainDisplay(t);
                updateProgressBar(t.total);
            }
        }

        // B. Atualiza Histórico Vivo (apenas se visível)
        if (state.history.length > 0 && dom.historyList.offsetParent !== null) {
            updateHistoryLiveTimers(now);
        }

        state.rafId = requestAnimationFrame(gameLoop);
    };

    const updateMainDisplay = (t) => {
        // Atualiza Texto Principal
        if (dom.days) dom.days.textContent = String(t.days).padStart(2, '0');
        if (dom.hours) dom.hours.textContent = String(t.hours).padStart(2, '0');
        if (dom.minutes) dom.minutes.textContent = String(t.minutes).padStart(2, '0');
        if (dom.seconds) dom.seconds.textContent = String(t.seconds).padStart(2, '0');
        
        // Atualiza Texto Tela Cheia
        if (dom.fsDays) dom.fsDays.textContent = String(t.days).padStart(2, '0');
        if (dom.fsHours) dom.fsHours.textContent = String(t.hours).padStart(2, '0');
        if (dom.fsMinutes) dom.fsMinutes.textContent = String(t.minutes).padStart(2, '0');
        if (dom.fsSeconds) dom.fsSeconds.textContent = String(t.seconds).padStart(2, '0');

        // Milissegundos
        if (state.showMs) {
            const msStr = formatMs(t.milliseconds);
            if (dom.milliseconds) dom.milliseconds.textContent = msStr;
            if (dom.fsMilliseconds) dom.fsMilliseconds.textContent = msStr;
        }

        // Esconder Dias se for 0
        const showDays = t.days > 0;
        const displayDays = showDays ? 'flex' : 'none';
        if (dom.daysGroup) dom.daysGroup.style.display = displayDays;
        if (dom.fsDaysGroup) dom.fsDaysGroup.style.display = displayDays;

        // Mostrar/Esconder Bloco de Milissegundos
        // Normal
        if(dom.msBlock) dom.msBlock.style.display = state.showMs ? 'flex' : 'none';
        // Ocultamos o separador via CSS agora, mas garantimos aqui
        if(dom.msSeparator) dom.msSeparator.style.display = 'none'; 
        
        // Fullscreen
        if(dom.fsMsBlock) dom.fsMsBlock.style.display = state.showMs ? 'flex' : 'none';
        if(dom.fsMsSeparator) dom.fsMsSeparator.style.display = 'none';
    };

    const updateProgressBar = (distance) => {
        if (!dom.progressBar || !state.startTime) return;
        const totalDuration = state.targetDate - state.startTime;
        const elapsed = totalDuration - distance;
        let percentage = (elapsed / totalDuration) * 100;
        percentage = Math.min(100, Math.max(0, percentage)); 
        dom.progressBar.style.width = `${percentage}%`;
    };

    const finishCountdown = () => {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
        
        // Zera tudo visualmente
        const zeros = ['00', '00', '00', '00'];
        [dom.days, dom.hours, dom.minutes, dom.seconds].forEach((el, i) => { if(el) el.textContent = zeros[i]; });
        if(dom.milliseconds) dom.milliseconds.textContent = '00';
        if(dom.fsMilliseconds) dom.fsMilliseconds.textContent = '00';
        if(dom.progressBar) dom.progressBar.style.width = '100%';

        dom.countdownCardTitle.textContent = `🎉 O evento chegou!`;
        document.title = `Evento Finalizado | Utilweb`;

        if (state.playSound) playAlarm();
    };

    const playAlarm = () => {
        try {
            if (!state.activeSound) state.activeSound = new Audio(AUDIO_PATH);
            state.activeSound.play().catch(e => console.log("Autoplay bloqueado", e));
        } catch (error) { console.error("Erro no áudio", error); }
    };

    // --- 4. HISTÓRICO (Com Lixeira) ---

    const updateHistoryLiveTimers = (now) => {
        const liveElements = document.querySelectorAll('.history-timer-live');
        liveElements.forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            if (!target) return;

            const distance = target - now;
            
            if (distance <= 0) {
                if (!el.classList.contains('finished')) {
                    el.textContent = "Finalizado";
                    el.classList.add('finished');
                    el.style.textDecoration = "line-through";
                    el.style.color = "var(--c-text-secondary)";
                }
            } else {
                const d = Math.floor(distance / (1000 * 60 * 60 * 24));
                const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((distance % (1000 * 60)) / 1000);
                
                let text = '';
                if (d > 0) text += `${d}d `;
                text += `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                el.textContent = text;
            }
        });
    };

    const createHistoryItem = (item, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        const eventName = item.name || 'Evento sem nome';
        const targetDate = new Date(item.date).getTime();
        const dateReadable = new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });

        li.innerHTML = `
            <div class="history-info">
                <div class="history-header">
                    <span>${eventName}</span>
                    <small>${dateReadable}</small>
                </div>
                <div class="history-timer-live" data-target="${targetDate}">Calculando...</div>
            </div>
            <button class="btn-delete-history" title="Remover" aria-label="Remover do histórico">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
        `;

        // Click no item: Carrega a contagem
        li.addEventListener('click', (e) => {
            // Se o clique foi no botão de deletar, não faz nada
            if (e.target.closest('.btn-delete-history')) return;

            const dObj = new Date(item.date);
            const pad = n => n < 10 ? '0' + n : n;
            const localIso = dObj.getFullYear() + '-' + pad(dObj.getMonth() + 1) + '-' + pad(dObj.getDate());
            const localTime = pad(dObj.getHours()) + ':' + pad(dObj.getMinutes());

            dom.eventDate.value = localIso;
            dom.eventTime.value = localTime;
            dom.eventName.value = item.name;
            
            handleStart();
            if (dom.toolCard) {
                window.scrollTo({ top: dom.toolCard.offsetTop - 20, behavior: 'smooth' });
            }
        });

        // Click na lixeira: Deleta
        const deleteBtn = li.querySelector('.btn-delete-history');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if(confirm('Remover este item do histórico?')) {
                state.history.splice(index, 1);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
                renderHistory();
            }
        });

        return li;
    };

    const renderHistory = () => {
        dom.historyList.innerHTML = '';
        if (state.history.length === 0) {
            dom.historyList.innerHTML = '<p class="history-empty-message">Nenhuma contagem recente.</p>';
            if(dom.clearHistoryBtn) dom.clearHistoryBtn.style.display = 'none';
        } else {
            // Renderiza com índice para saber quem deletar
            state.history.forEach((item, index) => {
                dom.historyList.appendChild(createHistoryItem(item, index));
            });
            if(dom.clearHistoryBtn) dom.clearHistoryBtn.style.display = 'inline-flex';
        }
    };

    const saveToHistory = (item) => {
        // Verifica duplicata simples
        const isDuplicate = state.history.some(h => h.name === item.name && h.date === item.date);
        if (!isDuplicate) {
            state.history.unshift(item);
            if (state.history.length > 20) state.history.pop(); // Aumentado para 20
            localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
            renderHistory();
        }
    };

    const loadHistory = () => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) state.history = JSON.parse(stored);
        renderHistory();
    };

    // --- 5. LÓGICA DE CONTROLES (Start, Reset, Presets) ---

    const handleStart = () => {
        const date = dom.eventDate.value;
        const time = dom.eventTime.value || '00:00';

        if (!date) { alert('Por favor, selecione uma data.'); return; }

        const targetDateStr = `${date}T${time}`;
        const targetMs = new Date(targetDateStr).getTime();
        const eventName = dom.eventName.value.trim();

        if (targetMs < new Date().getTime()) {
            alert('A data deve ser futura.');
            return;
        }

        // Atualiza Estado
        state.targetDate = targetMs;
        state.startTime = new Date().getTime(); 
        state.showMs = dom.optMilliseconds.checked;
        state.playSound = dom.optSound.checked;

        // Atualiza UI
        dom.setupSection.style.display = 'none';
        dom.timerSection.style.display = 'block';
        dom.countdownCardTitle.textContent = eventName || 'Contagem Regressiva';
        document.title = `${eventName || 'Contagem'} | Utilweb`;

        // Salva e Inicia
        saveToHistory({ name: eventName, date: targetDateStr });
        
        // Garante que o loop esteja rodando
        if (!state.rafId) gameLoop();
    };

    const handleReset = () => {
        state.targetDate = null;
        if(state.activeSound) { 
            state.activeSound.pause(); 
            state.activeSound.currentTime = 0; 
        }
        
        dom.timerSection.style.display = 'none';
        dom.setupSection.style.display = 'block';
        dom.countdownCardTitle.textContent = 'Configure sua Contagem';
        document.title = 'Contador Regressivo Online | Utilweb';
    };

    const applyPreset = (type) => {
        const now = new Date();
        let target = new Date();
        let name = "", time = "00:00";

        switch(type) {
            case 'friday': // Próxima Sexta 18:00
                const day = now.getDay();
                const diff = 5 - day; // 5 é sexta
                const daysToAdd = diff > 0 ? diff : diff + 7;
                target.setDate(now.getDate() + daysToAdd);
                time = "18:00"; name = "Sextou!";
                break;
            case 'christmas': // Natal
                target.setMonth(11); target.setDate(25);
                if (now > target) target.setFullYear(now.getFullYear() + 1);
                name = "Natal";
                break;
            case 'newyear': // Ano Novo
                target.setMonth(0); target.setDate(1);
                target.setFullYear(now.getFullYear() + 1);
                name = "Ano Novo";
                break;
            case 'vacation': // Férias (ex: 10/Jan)
                target.setMonth(0); target.setDate(10);
                if (now.getMonth() === 0 && now.getDate() > 10) target.setFullYear(now.getFullYear() + 1);
                else if (now.getMonth() > 0) target.setFullYear(now.getFullYear() + 1);
                name = "Férias";
                break;
        }

        // Formata para input type="date"
        const pad = n => n < 10 ? '0' + n : n;
        dom.eventDate.value = target.getFullYear() + '-' + pad(target.getMonth() + 1) + '-' + pad(target.getDate());
        dom.eventTime.value = time;
        dom.eventName.value = name;
    };

    // --- 6. CONTROLES VISUAIS ---

    const initVisualControls = () => {
        // 1. Cor
        if (dom.colorInput) {
            const savedColor = localStorage.getItem(COLOR_KEY);
            if(savedColor) {
                document.documentElement.style.setProperty('--timer-color', savedColor);
                dom.colorInput.value = savedColor;
            }
            dom.colorInput.addEventListener('input', (e) => {
                document.documentElement.style.setProperty('--timer-color', e.target.value);
                localStorage.setItem(COLOR_KEY, e.target.value);
            });
        }

        // 2. Zoom
        if (dom.zoomInBtn && dom.zoomOutBtn) {
            const applyZoom = (level) => {
                document.documentElement.classList.toggle('clock-zoom-max', level === 1);
            };

            const savedZoom = localStorage.getItem(ZOOM_KEY);
            const currentZoom = parseInt(savedZoom || 0);
            applyZoom(currentZoom);

            const setMax = () => { applyZoom(1); localStorage.setItem(ZOOM_KEY, '1'); };
            dom.zoomInBtn.addEventListener('click', setMax);
            if(dom.fsZoomInBtn) dom.fsZoomInBtn.addEventListener('click', setMax);

            const setMedium = () => { applyZoom(0); localStorage.setItem(ZOOM_KEY, '0'); };
            dom.zoomOutBtn.addEventListener('click', setMedium);
            if(dom.fsZoomOutBtn) dom.fsZoomOutBtn.addEventListener('click', setMedium);
        }

        // 3. Tela Cheia
        if (dom.fullscreenBtn) {
            dom.fullscreenBtn.addEventListener('click', () => {
                dom.fullscreenContainer.classList.add('is-active');
                document.body.classList.add('fullscreen-active');
                document.documentElement.requestFullscreen().catch(e => console.log(e));
            });
            dom.fullscreenCloseBtn.addEventListener('click', () => {
                dom.fullscreenContainer.classList.remove('is-active');
                document.body.classList.remove('fullscreen-active');
                if(document.fullscreenElement) document.exitFullscreen();
            });
        }
    };

    // --- INICIALIZAÇÃO ---
    dom.startBtn.addEventListener('click', handleStart);
    dom.resetBtn.addEventListener('click', handleReset);
    
    // Limpar Histórico Completo
    if(dom.clearHistoryBtn) dom.clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja limpar todo o histórico?')) { 
            state.history = []; 
            localStorage.removeItem(HISTORY_KEY); 
            renderHistory(); 
        }
    });

    if(dom.shareBtn) dom.shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => alert('Link copiado!'));
    });

    dom.presets.forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    loadHistory();
    initVisualControls();
    gameLoop();
});

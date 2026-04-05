/**
 * @fileoverview Lógica do Cronômetro Online (Padrão V5 - Correção Separador)
 * @description Fundido com a lógica de controles (Zoom, Cor, Fullscreen) do Padrão-Ouro.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. [PADRÃO V5] DOM BINDING ---
    const dom = {
        // Seções
        setupSection: document.getElementById('setup-section'),
        displaySection: document.getElementById('display-section'),
        controlsSection: document.getElementById('controls-section'),
        
        // Título
        stopwatchTitle: document.getElementById('stopwatch-card-title'),

        // Display
        timeDisplay: document.getElementById('time'),
        
        // Botões de Ação (Ícones V5)
        startBtn: document.getElementById('start-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        lapBtn: document.getElementById('lap-btn'),
        resetBtn: document.getElementById('reset-btn'),
        resetGroup: document.getElementById('reset-group'), // Wrapper
        pauseLabel: document.getElementById('pause-label'),
        iconPause: document.getElementById('icon-pause'),
        iconPlay: document.getElementById('icon-play'),

        // Laps (Voltas)
        lapsContainer: document.getElementById('laps-container'),
        lapsList: document.getElementById('laps-list'),
        clearLapsBtn: document.getElementById('clear-laps-btn'),
        
        // Controles Padrão V5
        colorInput: document.getElementById('tool-color-input'),
        fullscreenBtn: document.getElementById('fullscreen-toggle-btn'),
        fullscreenContainer: document.getElementById('fullscreen-container'),
        fullscreenCloseBtn: document.getElementById('fullscreen-close-btn'),
        fullscreenTime: document.getElementById('fullscreen-time'),
        zoomInBtn: document.getElementById('zoom-in-btn'), 
        zoomOutBtn: document.getElementById('zoom-out-btn'),
        fsZoomInBtn: document.getElementById('fs-zoom-in-btn'),
        fsZoomOutBtn: document.getElementById('fs-zoom-out-btn'),
    };

    if (!dom.timeDisplay || !dom.fullscreenContainer) {
        console.error("Elementos essenciais do cronômetro não encontrados.");
        return;
    }

    // --- 2. STATE ---
    let animationFrame = null;
    let startTime = 0;
    let elapsedTime = 0;
    let lapCount = 0;
    let isRunning = false;

    // [PADRÃO V5] State
    const colorStorageKey = 'utilweb-cronometro-color';
    const zoomStorageKey = 'utilweb-cronometro-zoom';
    let currentZoomLevel = 0; // 0 (Médio) ou 1 (Máximo)

    // --- 3. CORE FUNCTIONS (Lógica do Cronômetro) ---

    /**
     * Formata milissegundos para [HH:]MM:SS:cs
     * @param {number} ms - Milissegundos
     * @returns {string} Tempo formatado
     */
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10); 
        const seconds = totalSeconds % 60;
        const minutes = Math.floor((totalSeconds / 60) % 60);
        const hours = Math.floor(totalSeconds / 3600);
        const pad = (num) => String(num).padStart(2, '0');

        // [V5 CORREÇÃO] Trocado o '.' por ':' para consistência visual
        let timeString = `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
        
        if (hours > 0) {
            timeString = `${pad(hours)}:${timeString}`;
        }
        return timeString;
    }

    function updateDisplayLoop() {
        if (!isRunning) return;

        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;

        const timeString = formatTime(elapsedTime);
        dom.timeDisplay.textContent = timeString;
        dom.fullscreenTime.textContent = timeString;

        const hasHours = elapsedTime >= 3600000;
        dom.timeDisplay.classList.toggle('stopwatch-display--with-hours', hasHours);
        dom.fullscreenTime.classList.toggle('stopwatch-display--with-hours', hasHours);

        animationFrame = requestAnimationFrame(updateDisplayLoop);
    }
    
    // [PADRÃO V5] Atualiza a UI para o estado "Ativo"
    function showActiveState() {
        dom.setupSection.style.display = 'none';
        dom.displaySection.style.display = 'block';
        dom.controlsSection.style.display = 'flex';
        dom.stopwatchTitle.textContent = 'Em andamento';
    }
    
    // [PADRÃO V5] Atualiza a UI para o estado "Setup"
    function showSetupState() {
        dom.setupSection.style.display = 'block';
        dom.displaySection.style.display = 'none';
        dom.controlsSection.style.display = 'none';
        dom.stopwatchTitle.textContent = 'Cronômetro';
    }

    // [PADRÃO V5] Atualiza os ícones do painel de controle
    function updateControlPanel(running, hasTime) {
        if (running) {
            // Rodando: Pausar, Volta
            dom.pauseLabel.textContent = 'Pausar';
            dom.iconPause.style.display = 'block';
            dom.iconPlay.style.display = 'none';
            dom.lapBtn.style.display = 'inline-flex';
            dom.lapBtn.previousElementSibling.style.display = 'block'; // Label "Volta"
            dom.resetGroup.style.display = 'none';
        } else {
            // Pausado: Continuar, Resetar
            dom.pauseLabel.textContent = 'Continuar';
            dom.iconPause.style.display = 'none';
            dom.iconPlay.style.display = 'block';
            dom.lapBtn.style.display = 'none';
            dom.lapBtn.previousElementSibling.style.display = 'none'; // Label "Volta"
            
            if (hasTime) {
                dom.resetGroup.style.display = 'flex';
            } else {
                dom.resetGroup.style.display = 'none';
            }
        }
    }
    
    function startCronometro() {
        if (isRunning) return;
        isRunning = true;
        
        startTime = Date.now() - elapsedTime; 
        
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(updateDisplayLoop);
        
        showActiveState();
        updateControlPanel(true, elapsedTime > 0);
    }
    
    function pauseCronometro() {
        if (!isRunning) return;
        isRunning = false;
        
        cancelAnimationFrame(animationFrame);
        
        updateControlPanel(false, elapsedTime > 0);
        dom.stopwatchTitle.textContent = 'Pausado';
    }
    
    function resetCronometro() {
        isRunning = false;
        cancelAnimationFrame(animationFrame);
        
        startTime = 0;
        elapsedTime = 0;
        lapCount = 0;
        
        const timeString = '00:00.00';

        dom.timeDisplay.textContent = timeString;
        dom.fullscreenTime.textContent = timeString;
        dom.timeDisplay.classList.remove('stopwatch-display--with-hours');
        dom.fullscreenTime.classList.remove('stopwatch-display--with-hours');
        
        dom.lapsList.innerHTML = '';
        dom.lapsContainer.style.display = 'none';
        
        showSetupState(); // Retorna ao botão "Iniciar"
    }

    function clearLaps() {
        if (confirm('Tem certeza que deseja limpar todas as voltas?')) {
            lapCount = 0;
            dom.lapsList.innerHTML = '';
            dom.lapsContainer.style.display = 'none';
        }
    }
    
    function recordLap() {
        if (!isRunning) return;
        
        lapCount++;
        const lapTime = formatTime(elapsedTime); 

        const li = document.createElement('li');
        li.className = 'lap-item';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'lap-item__number';
        numberSpan.textContent = `${lapCount}.`;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'lap-item__time';
        timeSpan.textContent = lapTime;
        
        li.appendChild(numberSpan);
        li.appendChild(timeSpan);
        
        if (dom.lapsList.firstChild) {
            dom.lapsList.insertBefore(li, dom.lapsList.firstChild);
        } else {
            dom.lapsList.appendChild(li);
        }

        dom.lapsContainer.style.display = 'block';
    }

    // --- 4. [PADRÃO V5] Funções de Controle ---

    function initToolControls() {
        if (!dom.colorInput) return;
        const defaultColor = getComputedStyle(document.documentElement).getPropertyValue('--c-text-primary');
        const savedColor = localStorage.getItem(colorStorageKey);
        
        if (savedColor) {
            applyColor(savedColor);
            dom.colorInput.value = savedColor;
        } else {
            applyColor(defaultColor);
            dom.colorInput.value = defaultColor;
        }

        dom.colorInput.addEventListener('input', (e) => {
            const newColor = e.target.value;
            applyColor(newColor);
            localStorage.setItem(colorStorageKey, newColor);
        });
    }

    function applyColor(color) {
        document.documentElement.style.setProperty('--timer-color', color);
    }

    function initFullscreen() {
        if (!dom.fullscreenBtn || !dom.fullscreenContainer || !dom.fullscreenCloseBtn) return;
        
        dom.fullscreenBtn.addEventListener('click', () => {
            dom.fullscreenContainer.classList.add('is-active');
            document.body.classList.add('fullscreen-active');
            try {
                if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
                else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
            } catch (e) { console.warn("Modo tela cheia não suportado.", e); }
        });

        const closeFullscreen = () => {
             dom.fullscreenContainer.classList.remove('is-active');
             document.body.classList.remove('fullscreen-active');
            try {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            } catch (e) { console.warn("Erro ao sair da tela cheia.", e); }
        }

        dom.fullscreenCloseBtn.addEventListener('click', closeFullscreen);

        const handleFullscreenChange = () => {
             if (!document.fullscreenElement && !document.webkitIsFullScreen) {
                dom.fullscreenContainer.classList.remove('is-active');
                document.body.classList.remove('fullscreen-active');
            }
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    }

    function applyZoom(level) {
        document.documentElement.classList.toggle('clock-zoom-max', level === 1);
        currentZoomLevel = level;
    }

    function initZoom() {
        if (!dom.zoomInBtn || !dom.zoomOutBtn) return;
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        if (isMobile) {
            applyZoom(0);
            return;
        }

        const savedZoom = localStorage.getItem(zoomStorageKey);
        currentZoomLevel = parseInt(savedZoom, 10) || 0;
        applyZoom(currentZoomLevel);
        
        const setZoomMax = () => {
            applyZoom(1); 
            localStorage.setItem(zoomStorageKey, '1');
        };
        dom.zoomInBtn.addEventListener('click', setZoomMax);
        if (dom.fsZoomInBtn) dom.fsZoomInBtn.addEventListener('click', setZoomMax);

        const setZoomMedium = () => {
            applyZoom(0); 
            localStorage.setItem(zoomStorageKey, '0');
        };
        dom.zoomOutBtn.addEventListener('click', setZoomMedium);
        if (dom.fsZoomOutBtn) dom.fsZoomOutBtn.addEventListener('click', setZoomMedium);
    }

    // --- 5. EVENT LISTENERS & INIT ---

    // Ações do Cronômetro
    dom.startBtn.addEventListener('click', startCronometro);
    dom.pauseBtn.addEventListener('click', () => {
        if (isRunning) {
            pauseCronometro();
        } else {
            startCronometro(); // Função "Continuar"
        }
    });
    dom.lapBtn.addEventListener('click', recordLap);
    dom.resetBtn.addEventListener('click', resetCronometro);
    if(dom.clearLapsBtn) dom.clearLapsBtn.addEventListener('click', clearLaps);

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            if (isRunning) {
                pauseCronometro();
            } else {
                startCronometro();
            }
        } else if (e.key === 'l' || e.key === 'L') {
            if (isRunning) recordLap();
        } else if (e.key === 'r' || e.key === 'R') {
            if (!isRunning && elapsedTime > 0) resetCronometro();
        }
    });
    
    // Inits Padrão V5
    initToolControls();
    initFullscreen();
    initZoom();
});

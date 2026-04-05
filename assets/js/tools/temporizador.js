/**
 * @fileoverview Lógica do Temporizador Online (v5.5 - Alarme Robusto & MP3)
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DOM BINDING ---
    const dom = {
        setup: document.getElementById('timer-setup'),
        display: document.getElementById('timer-display'),
        finished: document.getElementById('timer-finished'),
        timerCardTitle: document.getElementById('timer-card-title'),
        form: document.getElementById('timer-form'),
        hoursInput: document.getElementById('hours'),
        minutesInput: document.getElementById('minutes'),
        secondsInput: document.getElementById('seconds'),
        quickTimerBtns: document.querySelectorAll('.quick-timers-grid .btn'),
        timeRemaining: document.getElementById('time-remaining'),
        progressBar: document.getElementById('progress-bar'),
        pauseBtn: document.getElementById('pause-timer-btn'),
        pauseLabel: document.getElementById('pause-label'),
        iconPause: document.getElementById('icon-pause'),
        iconPlay: document.getElementById('icon-play'),
        stopBtn: document.getElementById('stop-timer-btn'),
        addTimeBtn: document.getElementById('add-time-btn'),
        resetFinishedBtn: document.getElementById('reset-finished-btn'),
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

    // --- 2. STATE ---
    let timerInterval = null; 
    let totalTime = 0; 
    let remainingTime = 0; 
    let isPaused = false;
    
    // Configuração de Áudio (Novo Padrão)
    let audioContext;
    let alarmAudio;
    let audioUnlocked = false;
    const ALARM_SRC = '/sounds/alarm/alarm.mp3';

    const originalTitle = document.title;
    const colorStorageKey = 'utilweb-temporizador-color';
    const zoomStorageKey = 'utilweb-temporizador-zoom';
    
    // --- 3. LÓGICA DE ÁUDIO (UNLOCK) ---

    function unlockAudio() {
        if (audioUnlocked) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            // Buffer silencioso para ativar o hardware
            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);

            alarmAudio = new Audio(ALARM_SRC);
            alarmAudio.preload = 'auto';
            alarmAudio.load();

            audioUnlocked = true;
            console.log('Áudio do temporizador desbloqueado.');
        } catch (e) {
            console.warn('Erro ao desbloquear áudio:', e);
        }
    }

    // --- 4. CORE FUNCTIONS ---

    function startTimer(durationInSeconds) {
        if (durationInSeconds <= 0) return;
        
        unlockAudio(); // Handshake de áudio no clique
        
        totalTime = durationInSeconds; 
        remainingTime = totalTime; 
        isPaused = false;
        
        dom.setup.style.display = 'none'; 
        dom.display.style.display = 'block'; 
        dom.finished.style.display = 'none';
        dom.timerCardTitle.textContent = 'Em andamento';
        dom.fullscreenContainer.classList.remove('is-finished');
        
        dom.pauseLabel.textContent = 'Pausar';
        dom.iconPause.style.display = 'block';
        dom.iconPlay.style.display = 'none';
        
        updateDisplay(); 
        runTimer();
    }
    
    function runTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isPaused && remainingTime > 0) {
                remainingTime--;
                updateDisplay();
                if (remainingTime <= 0) {
                    finishTimer();
                }
            }
        }, 1000);
    }

    function updateDisplay() {
        const h = Math.floor(remainingTime / 3600);
        const m = Math.floor((remainingTime % 3600) / 60);
        const s = remainingTime % 60;
        
        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        dom.timeRemaining.textContent = timeString;
        document.title = `${timeString} - Temporizador`;
        
        const progress = totalTime > 0 ? (remainingTime / totalTime) * 100 : 0;
        dom.progressBar.style.width = `${progress}%`;
        dom.fullscreenTime.textContent = timeString;
    }
    
    function pauseTimer() { 
        isPaused = !isPaused; 
        dom.pauseLabel.textContent = isPaused ? 'Continuar' : 'Pausar';
        dom.iconPause.style.display = isPaused ? 'none' : 'block';
        dom.iconPlay.style.display = isPaused ? 'block' : 'none';
    }
    
    function stopTimer() { 
        if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }
        clearInterval(timerInterval); 
        resetTimer(); 
    }
    
    function addTime() {
        unlockAudio(); // Reforça o desbloqueio
        remainingTime += 60;
        if (remainingTime > totalTime) totalTime = remainingTime;
        updateDisplay();
    }

    function finishTimer() {
        clearInterval(timerInterval);
        
        dom.display.style.display = 'none';
        dom.finished.style.display = 'block';
        dom.timerCardTitle.textContent = 'Tempo Esgotado!';
        dom.fullscreenContainer.classList.add('is-finished');
        
        document.title = "Tempo Esgotado!";
        
        // Disparo do Alarme
        if (alarmAudio) {
            alarmAudio.loop = true;
            alarmAudio.play().catch(e => console.warn("Alarme bloqueado pelo browser.", e));
        }
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Utilweb - Temporizador', { 
                body: 'Seu temporizador chegou ao fim!', 
                icon: '/img/icons/favicon-32x32.png' 
            });
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }
        
        dom.setup.style.display = 'block'; 
        dom.display.style.display = 'none'; 
        dom.finished.style.display = 'none';
        dom.timerCardTitle.textContent = 'Configurar Temporizador';
        dom.fullscreenContainer.classList.remove('is-finished');
        
        document.title = originalTitle;
    }

    // --- 5. CONTROLES PADRÃO (COR, FULLSCREEN, ZOOM) ---

    function initToolControls() {
        const savedColor = localStorage.getItem(colorStorageKey);
        if (savedColor) {
            document.documentElement.style.setProperty('--timer-color', savedColor);
            dom.colorInput.value = savedColor;
        }
        dom.colorInput.addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--timer-color', e.target.value);
            localStorage.setItem(colorStorageKey, e.target.value);
        });
    }

    function initFullscreen() {
        dom.fullscreenBtn.addEventListener('click', () => {
            dom.fullscreenContainer.classList.add('is-active');
            document.body.classList.add('fullscreen-active');
            if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        });
        dom.fullscreenCloseBtn.addEventListener('click', () => {
            dom.fullscreenContainer.classList.remove('is-active');
            document.body.classList.remove('fullscreen-active');
            if (document.exitFullscreen) document.exitFullscreen();
        });
    }

    function initZoom() {
        const applyZoom = (level) => document.documentElement.classList.toggle('clock-zoom-max', level === 1);
        const savedZoom = localStorage.getItem(zoomStorageKey);
        let currentZoom = parseInt(savedZoom, 10) || 0;
        applyZoom(currentZoom);

        [dom.zoomInBtn, dom.fsZoomInBtn].forEach(btn => btn?.addEventListener('click', () => {
            applyZoom(1); localStorage.setItem(zoomStorageKey, '1');
        }));
        [dom.zoomOutBtn, dom.fsZoomOutBtn].forEach(btn => btn?.addEventListener('click', () => {
            applyZoom(0); localStorage.setItem(zoomStorageKey, '0');
        }));
    }

    // --- 6. EVENT LISTENERS ---

    dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const h = parseInt(dom.hoursInput.value) || 0;
        const m = parseInt(dom.minutesInput.value) || 0;
        const s = parseInt(dom.secondsInput.value) || 0;
        startTimer((h * 3600) + (m * 60) + s);
    });

    dom.pauseBtn.addEventListener('click', pauseTimer);
    dom.stopBtn.addEventListener('click', stopTimer);
    dom.addTimeBtn.addEventListener('click', addTime);
    dom.resetFinishedBtn.addEventListener('click', resetTimer);
    
    dom.quickTimerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            unlockAudio();
            startTimer(parseInt(btn.dataset.time));
        });
    });

    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    initToolControls();
    initFullscreen();
    initZoom();
});

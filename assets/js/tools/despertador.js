/**
 * @fileoverview Lógica do Despertador Online (v6.0 - Worker, Zoom & Fullscreen Fix)
 * @description Sincroniza com fuso de Brasília, utiliza Web Worker para precisão e suporte a Zoom.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DOM BINDING ---
    const dom = {
        currentTime: document.getElementById('current-time'),
        currentDate: document.getElementById('current-date'),
        fullscreenTime: document.getElementById('fullscreen-time'),
        fullscreenDate: document.getElementById('fullscreen-date'),
        fullscreenAlarmInfo: document.getElementById('fullscreen-alarm-info'),
        colorInput: document.getElementById('tool-color-input'),
        fullscreenBtn: document.getElementById('fullscreen-toggle-btn'),
        testAlarmBtn: document.getElementById('test-alarm-btn'),
        setupView: document.getElementById('alarm-setup-view'),
        setView: document.getElementById('alarm-set-view'),
        infoTime: document.getElementById('alarm-time-info'),
        cancelAlarmBtn: document.getElementById('cancel-alarm-btn'),
        quickAlarmsGrid: document.getElementById('quick-alarms-grid'),
        openAlarmModalBtn: document.getElementById('open-alarm-modal-btn'),
        modalOverlay: document.getElementById('modal-overlay'),
        setupModal: document.getElementById('alarm-setup-modal'),
        closeSetupModalBtn: document.getElementById('close-setup-modal-btn'),
        hourInput: document.getElementById('alarm-hour'),
        minuteInput: document.getElementById('alarm-minute'),
        setAlarmBtn: document.getElementById('set-alarm-btn'),
        ringingModal: document.getElementById('alarm-ringing-modal'),
        ringingAlarmTime: document.getElementById('ringing-alarm-time'),
        stopAlarmBtn: document.getElementById('stop-alarm-btn'),
        fullscreenContainer: document.getElementById('fullscreen-container'),
        fullscreenCloseBtn: document.getElementById('fullscreen-close-btn'),
        zoomInBtn: document.getElementById('zoom-in-btn'), 
        zoomOutBtn: document.getElementById('zoom-out-btn'),
        fsZoomInBtn: document.getElementById('fs-zoom-in-btn'),
        fsZoomOutBtn: document.getElementById('fs-zoom-out-btn'),
    };

    // --- 2. STATE (ESTADO LÓGICO) ---
    let audioContext;
    let alarmAudio;
    let audioUnlocked = false;
    const ALARM_SRC = '/sounds/alarm/alarm.mp3';

    let timeOffset = 0;
    let userTimezone = 'America/Sao_Paulo';
    let isClockSynced = false;
    let reSyncInterval = null;
    
    let alarmTimeout = null; 
    let alarmTime = localStorage.getItem('utilweb-alarm-time'); 
    let isRingingTest = false; 

    const zoomStorageKey = 'utilweb-despertador-zoom'; 
    let currentZoomLevel = 0; 
    const originalTitle = document.title;
    let lastDateString = "";
    const quickTimes = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '18:00'];

    // --- 3. LÓGICA DE ÁUDIO ---
    function unlockAudio() {
        if (audioUnlocked) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') audioContext.resume();

            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);

            alarmAudio = new Audio(ALARM_SRC);
            alarmAudio.preload = 'auto';
            alarmAudio.load();

            audioUnlocked = true;
            console.log('Áudio desbloqueado.');
        } catch (e) {
            console.warn('Erro ao desbloquear áudio:', e);
        }
    }

    // --- 4. FUNÇÕES DE DISPARO ---
    function testAlarm() {
        unlockAudio();
        if (!alarmAudio) return;
        isRingingTest = true; 
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        alarmAudio.loop = true;
        alarmAudio.play().catch(err => console.error(err));
        dom.ringingAlarmTime.textContent = "TESTE";
        showModal(dom.ringingModal);
    }

    function playAlarm() {
        unlockAudio();
        if (!alarmAudio) return;
        isRingingTest = false; 
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        alarmAudio.loop = true;
        alarmAudio.play().catch(err => console.error(err));
        document.title = `ALARME TOCANDO! - ${alarmTime} | Utilweb`;
        dom.ringingAlarmTime.textContent = alarmTime;
        showModal(dom.ringingModal);
    }

    function stopAlarm() {
        if (alarmAudio) {
            alarmAudio.pause();
            alarmAudio.currentTime = 0;
        }
        hideModal(dom.ringingModal);
        document.title = originalTitle;

        if (isRingingTest) {
            isRingingTest = false; 
            if (alarmTime) showAlarmSetView(alarmTime);
        } else {
            clearTimeout(alarmTimeout); 
            alarmTime = null;
            localStorage.removeItem('utilweb-alarm-time');
            showAlarmSetupView();
        }
    }

    // --- 5. RELÓGIO E WORKER ---
    function getCurrentTime() {
        return new Date(Date.now() + timeOffset);
    }
    
    function clockTick() {
        const now = getCurrentTime();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            timeZone: userTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });
        
        dom.currentTime.textContent = timeString;
        if (dom.fullscreenTime) dom.fullscreenTime.textContent = timeString;
        
        if (!dom.ringingModal.classList.contains('is-active')) {
            document.title = `${timeString} | ${originalTitle}`;
        }

        if (now.getSeconds() === 0 || lastDateString === "") {
            const dateString = now.toLocaleDateString('pt-BR', {
                timeZone: userTimezone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
            });
            const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);
            if (lastDateString !== formattedDate) {
                lastDateString = formattedDate;
                dom.currentDate.textContent = formattedDate;
                if (dom.fullscreenDate) dom.fullscreenDate.textContent = formattedDate;
            }
        }
    }

    async function fetchTimeFromAPI() {
        try {
            const response = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo'); 
            if (!response.ok) throw new Error('Erro API');
            const data = await response.json();
            timeOffset = (data.unixtime * 1000) - Date.now();
            userTimezone = data.timezone;
        } catch (e) {
            console.warn("Usando relógio do sistema local.");
        } finally {
            if (!isClockSynced) {
                isClockSynced = true;
                try {
                    const alarmWorker = new Worker('/assets/js/tools/alarm-worker.js');
                    alarmWorker.onmessage = () => clockTick();
                } catch (e) {
                    setInterval(clockTick, 1000);
                }
                scheduleReSync();
            }
            clockTick();
            checkExistingAlarm();
        }
    }

    function scheduleReSync() {
        if (reSyncInterval) clearInterval(reSyncInterval);
        reSyncInterval = setInterval(fetchTimeFromAPI, 10800000);
    }

    // --- 6. ZOOM E TELA CHEIA ---
    function applyZoom(level) {
        document.documentElement.classList.toggle('clock-zoom-max', level === 1);
        currentZoomLevel = level;
    }

    function initZoom() {
        const savedZoom = localStorage.getItem(zoomStorageKey);
        currentZoomLevel = parseInt(savedZoom, 10) || 0;
        applyZoom(currentZoomLevel);
        
        const setMax = () => { applyZoom(1); localStorage.setItem(zoomStorageKey, '1'); };
        const setMin = () => { applyZoom(0); localStorage.setItem(zoomStorageKey, '0'); };

        if (dom.zoomInBtn) dom.zoomInBtn.addEventListener('click', setMax);
        if (dom.fsZoomInBtn) dom.fsZoomInBtn.addEventListener('click', setMax);
        if (dom.zoomOutBtn) dom.zoomOutBtn.addEventListener('click', setMin);
        if (dom.fsZoomOutBtn) dom.fsZoomOutBtn.addEventListener('click', setMin);
    }

    function closeFullscreen() {
        dom.fullscreenContainer.classList.remove('is-active');
        document.body.classList.remove('fullscreen-active');
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    }

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            dom.fullscreenContainer.classList.remove('is-active');
            document.body.classList.remove('fullscreen-active');
        }
    });

    // --- 7. ALARME E MODAIS ---
    function setAlarm(customTime) {
        unlockAudio();
        clearTimeout(alarmTimeout); 
        let h, m;
        if (customTime) [h, m] = customTime.split(':').map(Number);
        else {
            h = parseInt(dom.hourInput.value);
            m = parseInt(dom.minuteInput.value);
        }
        if (isNaN(h) || isNaN(m)) return;

        alarmTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const now = getCurrentTime(); 
        const alarmDate = new Date(now.getTime());
        alarmDate.setHours(h, m, 0, 0); 
        if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1);
        
        alarmTimeout = setTimeout(playAlarm, alarmDate.getTime() - now.getTime());
        localStorage.setItem('utilweb-alarm-time', alarmTime); 
        showAlarmSetView(alarmTime);
        hideModal(dom.setupModal);
    }

    function checkExistingAlarm() {
        if (alarmTime) {
            const [h, m] = alarmTime.split(':').map(Number);
            const now = getCurrentTime();
            const alarmDate = new Date(now.getTime());
            alarmDate.setHours(h, m, 0, 0);
            if (alarmDate.getTime() + 60000 < now.getTime()) {
                 stopAlarm();
                 return;
            }
            let diff = alarmDate.getTime() - now.getTime();
            if (diff < 0) diff += 86400000;
            alarmTimeout = setTimeout(playAlarm, diff);
            showAlarmSetView(alarmTime);
        } else {
            showAlarmSetupView();
        }
    }

    function showAlarmSetupView() {
        dom.setupView.style.display = 'block';
        dom.setView.style.display = 'none';
    }
    
    function showAlarmSetView(timeString) {
        dom.infoTime.textContent = timeString;
        dom.setupView.style.display = 'none';
        dom.setView.style.display = 'block';
    }

    function showModal(el) {
        dom.modalOverlay.classList.add('is-active');
        el.classList.add('is-active');
    }
    
    function hideModal(el) {
        dom.modalOverlay.classList.remove('is-active');
        if (el) el.classList.remove('is-active');
        else {
            dom.setupModal.classList.remove('is-active');
            dom.ringingModal.classList.remove('is-active');
        }
    }

    // --- 8. LISTENERS ---
    dom.testAlarmBtn.addEventListener('click', testAlarm); 
    dom.stopAlarmBtn.addEventListener('click', stopAlarm);
    dom.cancelAlarmBtn.addEventListener('click', () => {
        clearTimeout(alarmTimeout);
        alarmTime = null;
        localStorage.removeItem('utilweb-alarm-time');
        showAlarmSetupView();
    });
    
    dom.setAlarmBtn.addEventListener('click', () => setAlarm(null));
    dom.openAlarmModalBtn.addEventListener('click', () => showModal(dom.setupModal));
    dom.closeSetupModalBtn.addEventListener('click', () => hideModal(dom.setupModal));
    dom.modalOverlay.addEventListener('click', () => hideModal(null));

    quickTimes.forEach(time => {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = time;
        button.addEventListener('click', () => setAlarm(time));
        dom.quickAlarmsGrid.appendChild(button);
    });

    dom.colorInput.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--timer-color', e.target.value);
        localStorage.setItem('utilweb-despertador-color', e.target.value);
    });

    dom.fullscreenBtn.addEventListener('click', () => {
        dom.fullscreenContainer.classList.add('is-active');
        document.body.classList.add('fullscreen-active');
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    });
    
    dom.fullscreenCloseBtn.addEventListener('click', closeFullscreen);

    // --- 9. INIT ---
    const savedColor = localStorage.getItem('utilweb-despertador-color');
    if (savedColor) {
        document.documentElement.style.setProperty('--timer-color', savedColor);
        dom.colorInput.value = savedColor;
    }

    fetchTimeFromAPI();
    initZoom();
});
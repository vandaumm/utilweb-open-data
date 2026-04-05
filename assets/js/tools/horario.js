/**
 * @fileoverview Relógio de Cidade Específico (Padrão V6 - Worker & Drift Correction)
 * @description Controla o relógio V5 com melhorias de precisão via Web Worker.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM BINDING ---
    const dom = {
        clockContainer: document.getElementById('main-clock-container'),
        currentTime: document.getElementById('current-time'),
        currentDate: document.getElementById('current-date'),
        colorInput: document.getElementById('tool-color-input'),
        
        fullscreenBtn: document.getElementById('fullscreen-toggle-btn'),
        fullscreenContainer: document.getElementById('fullscreen-container'),
        fullscreenCloseBtn: document.getElementById('fullscreen-close-btn'),
        fullscreenTime: document.getElementById('fullscreen-time'),
        fullscreenDate: document.getElementById('fullscreen-date'),
        
        zoomInBtn: document.getElementById('zoom-in-btn'), 
        zoomOutBtn: document.getElementById('zoom-out-btn'),
        fsZoomInBtn: document.getElementById('fs-zoom-in-btn'),
        fsZoomOutBtn: document.getElementById('fs-zoom-out-btn'),
    };

    if (!dom.clockContainer || !dom.currentTime) return;

    const targetTimezone = dom.clockContainer.dataset.timezone;
    if (!targetTimezone) return;

    // --- 2. STATE ---
    let timeOffset = 0; 
    let clockInterval = null;
    let clockWorker = null; 
    const colorStorageKey = 'utilweb-relogio-color';
    const zoomStorageKey = 'utilweb-relogio-zoom';
    let currentZoomLevel = 0;

    // --- 3. LÓGICA DO RELÓGIO ---

    function updateClock() {
        const now = new Date(Date.now() + timeOffset);
        
        const timeOptions = { timeZone: targetTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const dateOptions = { timeZone: targetTimezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        const timeString = now.toLocaleTimeString('pt-BR', timeOptions);
        const dateString = now.toLocaleDateString('pt-BR', dateOptions);
        const formattedDate = dateString.charAt(0).toUpperCase() + dateString.slice(1);

        dom.currentTime.textContent = timeString;
        dom.currentDate.textContent = formattedDate;
        if(dom.fullscreenTime) dom.fullscreenTime.textContent = timeString;
        if(dom.fullscreenDate) dom.fullscreenDate.textContent = formattedDate;

        // Atualiza o título da aba
        const cityName = targetTimezone.split('/').pop().replace('_', ' ');
        document.title = `${timeString} - Relógio de ${cityName} | Utilweb`;
    }

    function startClock() {
        if (clockInterval) clearInterval(clockInterval);
        if (clockWorker) clockWorker.terminate();

        updateClock();

        try {
            clockWorker = new Worker('/assets/js/tools/alarm-worker.js');
            clockWorker.onmessage = () => updateClock();
            console.log("Relógio Cidade: Worker ativado.");
        } catch (e) {
            console.warn("Relógio Cidade: Usando fallback setInterval.");
            clockInterval = setInterval(updateClock, 1000);
        }
    }

    async function fetchTimeFromAPI() {
        try {
            const response = await fetch(`https://worldtimeapi.org/api/timezone/${targetTimezone}`);
            if (!response.ok) throw new Error();
            
            const data = await response.json();
            timeOffset = (data.unixtime * 1000) - Date.now();
            startClock();
        } catch (error) {
            console.error("Falha na API, usando hora local.");
            startClock();
        }
    }

    // --- 4. UI CONTROLS (COLOR, FULLSCREEN, ZOOM) ---

    function applyColor(color) {
        document.documentElement.style.setProperty('--timer-color', color);
    }

    function initToolControls() {
        if (!dom.colorInput) return;
        const savedColor = localStorage.getItem(colorStorageKey);
        if (savedColor) {
            applyColor(savedColor);
            dom.colorInput.value = savedColor;
        }
        dom.colorInput.addEventListener('input', (e) => {
            applyColor(e.target.value);
            localStorage.setItem(colorStorageKey, e.target.value);
        });
    }

    function initFullscreen() {
        if (!dom.fullscreenBtn) return;
        
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

        // ESC Fix
        const handleFsChange = () => {
            if (!document.fullscreenElement && !document.webkitIsFullScreen) {
                dom.fullscreenContainer.classList.remove('is-active');
                document.body.classList.remove('fullscreen-active');
            }
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
    }

    function applyZoom(level) {
        document.documentElement.classList.toggle('clock-zoom-max', level === 1);
        currentZoomLevel = level;
    }

    function initZoom() {
        if (!dom.zoomInBtn || !dom.zoomOutBtn) return;
        const savedZoom = localStorage.getItem(zoomStorageKey);
        currentZoomLevel = parseInt(savedZoom, 10) || 0;
        applyZoom(currentZoomLevel);
        
        const setMax = () => { applyZoom(1); localStorage.setItem(zoomStorageKey, '1'); };
        const setMin = () => { applyZoom(0); localStorage.setItem(zoomStorageKey, '0'); };

        dom.zoomInBtn.addEventListener('click', setMax);
        if (dom.fsZoomInBtn) dom.fsZoomInBtn.addEventListener('click', setMax);
        dom.zoomOutBtn.addEventListener('click', setMin);
        if (dom.fsZoomOutBtn) dom.fsZoomOutBtn.addEventListener('click', setMin);
    }

    // --- 5. INITIALIZE ---
    fetchTimeFromAPI();
    initToolControls();
    initFullscreen();
    initZoom();
});

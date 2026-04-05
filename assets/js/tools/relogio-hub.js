/**
 * @fileoverview Hub de Relógio Mundial - Utilweb (Padrão V6 - VPN-Proof & Correção de Drift)
 * @description Sincroniza com API, detecta erro do sistema e controla múltiplos relógios.
 * @url: /tempo/relogio-online/
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- MAPA DE FUSO HORÁRIO (Mantido original) ---
    const timezoneMap = {
        'tz-brasilia': { tz: 'America/Sao_Paulo', offsetBase: -3 },
        'tz-sao-paulo': { tz: 'America/Sao_Paulo', offsetBase: -3 },
        'tz-rio-de-janeiro': { tz: 'America/Sao_Paulo', offsetBase: -3 },
        'tz-curitiba': { tz: 'America/Sao_Paulo', offsetBase: -3 },
        'tz-manaus': { tz: 'America/Manaus', offsetBase: -4 },
        'tz-rio-branco': { tz: 'America/Rio_Branco', offsetBase: -5 },
        'tz-lisboa': { tz: 'Europe/Lisbon', offsetBase: 1 },
        'tz-acores': { tz: 'Atlantic/Azores', offsetBase: 0 },
        'tz-nova-iorque': { tz: 'America/New_York', offsetBase: -4 },
        'tz-londres': { tz: 'Europe/London', offsetBase: 1 },
        'tz-sydney': { tz: 'Australia/Sydney', offsetBase: 11 },
        'tz-toronto': { tz: 'America/Toronto', offsetBase: -4 },
        'tz-toquio': { tz: 'Asia/Tokyo', offsetBase: 9 },
        'tz-berlim': { tz: 'Europe/Berlin', offsetBase: 2 },
        'tz-pequim': { tz: 'Asia/Shanghai', offsetBase: 8 },
        'tz-dubai': { tz: 'Asia/Dubai', offsetBase: 4 }
    };
    
    // [V6] Cache do DOM Completo
    const dom = {
        mainTime: document.getElementById('main-time'),
        mainDate: document.getElementById('main-date'),
        mainTitle: document.getElementById('main-clock-title'),
        clockAlert: document.getElementById('clock-alert'), // NOVO: Elemento do alerta
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

    const worldClockElements = {};
    for (const id in timezoneMap) {
        worldClockElements[id] = {
            time: document.getElementById(id + '-time'), 
            date: document.getElementById(id + '-date'),
            offset: document.getElementById(id + '-offset')
        };
    }

    if (!dom.mainTime || !dom.fullscreenContainer) {
        console.warn('Elementos principais do relógio não encontrados.');
        return;
    }

    // --- STATE ---
    let timeOffset = 0;
    let clockInterval = null;
    let reSyncInterval = null; 
        let clockWorker = null; // [V6.1] Controle do Web Worker
    const colorStorageKey = 'utilweb-relogio-hub-color';
    const zoomStorageKey = 'utilweb-relogio-hub-zoom'; 
    let currentZoomLevel = 0; 
    let userTimezone = 'America/Sao_Paulo'; // [V6] Agora fixo como Brasília inicial
    let userGMTOffset = -3;
    const originalPageTitle = document.title;
    
    // Configurações padrão de formatação
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


    // --- 1. Funções do Relógio (API, Sincronização e CÁLCULOS ROBUSTOS) ---

    function getGMTOffsetMinutes(tz, date = new Date()) {
        try {
            const dateStr = date.toLocaleString('en-US', { timeZone: tz });
            const tzDate = new Date(dateStr);
            const hourShift = tzDate.getHours() - date.getHours();
            return (date.getTimezoneOffset() + (hourShift * 60)) * -1;
        } catch (e) {
            console.error("Erro no cálculo de fuso:", e);
            return 0; 
        }
    }

    function calculateOffsetString(now, tz, localOffsetMinutes) {
        const tzOffsetMinutes = getGMTOffsetMinutes(tz, now);
        const diffMinutes = tzOffsetMinutes - localOffsetMinutes;
        const diffHours = Math.round(diffMinutes / 60);

        let offsetStr = `${diffHours > 0 ? '+' : ''}${diffHours} H`;
        const tzDay = now.toLocaleDateString('pt-BR', { timeZone: tz, day: 'numeric', month: 'numeric', year: 'numeric' });
        const localDay = now.toLocaleDateString('pt-BR', { timeZone: userTimezone, day: 'numeric', month: 'numeric', year: 'numeric' });
        
        if (localDay !== tzDay) {
            const dayShift = tzDay.localeCompare(localDay) > 0 ? 'Amanhã' : 'Ontem';
            offsetStr = `${dayShift}, ${diffHours > 0 ? '+' : ''}${diffHours} H`;
        } else {
             offsetStr = `Hoje, ${offsetStr}`;
        }
        return offsetStr;
    }
    
    function updateClock() {
        const now = new Date(Date.now() + timeOffset);

        // 1. Atualiza Relógio Principal
        if (dom.mainTime) {
            const userTimeOptions = { ...timeOptions, timeZone: userTimezone };
            const userDateOptions = { ...dateOptions, timeZone: userTimezone };
            const timeString = now.toLocaleTimeString('pt-BR', userTimeOptions);
            const dateString = now.toLocaleDateString('pt-BR', userDateOptions);
            
            dom.mainTime.textContent = timeString;
                        // Atualiza o título da aba para o usuário ver a hora sem mudar de aba
            document.title = `${timeString} - ${originalPageTitle}`;
            dom.mainDate.textContent = dateString;
            if(dom.fullscreenTime) dom.fullscreenTime.textContent = timeString;
            if(dom.fullscreenDate) dom.fullscreenDate.textContent = dateString;
        }

        // 2. Atualiza Grid de Relógios Mundiais
        const localOffsetMinutes = getGMTOffsetMinutes(userTimezone, now);

        for (const id in worldClockElements) {
            const elements = worldClockElements[id];
            const { tz } = timezoneMap[id];
            const tzTimeOptions = { ...timeOptions, timeZone: tz };
            const tzDateOptions = { ...dateOptions, timeZone: tz };

            if (elements.time) elements.time.textContent = now.toLocaleTimeString('pt-BR', tzTimeOptions);
            if (elements.date) elements.date.textContent = now.toLocaleDateString('pt-BR', tzDateOptions);
            if (elements.offset) elements.offset.textContent = calculateOffsetString(now, tz, localOffsetMinutes);
        }
    }
    
        /**
     * [NOVO V6] Detecta e avisa sobre a discrepância do relógio local.
     * O alerta agora desaparece após 10 segundos para não poluir a tela.
     */
    function checkClockDiscrepancy(offset) {
        if (!dom.clockAlert) return;
        const secondsOff = Math.abs(Math.round(offset / 1000));

        if (secondsOff > 2) {
            const minutesOff = Math.floor(secondsOff / 60);
            let message = "";
            if (minutesOff > 0) {
                message = `⚠️ Seu relógio está <strong>${minutesOff}m e ${secondsOff % 60}s</strong> ${offset > 0 ? 'atrasado' : 'adiantado'}. Corrigimos para você!`;
            } else {
                message = `⚠️ Seu relógio está <strong>${secondsOff}s</strong> ${offset > 0 ? 'atrasado' : 'adiantado'}. Corrigimos para você!`;
            }
            
            dom.clockAlert.innerHTML = message;
            dom.clockAlert.classList.remove('hidden');

            // [MELHORIA] Remove o alerta após 10 segundos
            setTimeout(() => {
                dom.clockAlert.style.transition = "opacity 1s ease";
                dom.clockAlert.style.opacity = "0";
                setTimeout(() => {
                    dom.clockAlert.classList.add('hidden');
                    dom.clockAlert.style.opacity = "1"; // Reseta para a próxima aparição
                }, 1000);
            }, 10000);
            
        } else {
            dom.clockAlert.classList.add('hidden');
        }
    }

    function scheduleReSync() {
        if (reSyncInterval) clearInterval(reSyncInterval);
        reSyncInterval = setInterval(() => {
            fetchTimeFromAPI();
        }, 10800000); 
    }

        function startClock() {
        // Limpa processos anteriores para evitar duplicidade
        if (clockInterval) clearInterval(clockInterval);
        if (clockWorker) clockWorker.terminate();

        updateClock(); 

        try {
            // Tenta iniciar o Worker (usando o mesmo caminho do seu despertador)
            clockWorker = new Worker('/assets/js/tools/alarm-worker.js');
            clockWorker.onmessage = function() {
                updateClock();
            };
            console.log("Relógio: Worker iniciado com sucesso.");
        } catch (e) {
            // Fallback: Se o Worker falhar, usa o método tradicional
            console.warn("Relógio: Worker falhou, usando fallback de intervalo comum.", e);
            clockInterval = setInterval(updateClock, 1000);
        }

        scheduleReSync();
    }
    
    function setUserTimezoneCookie(timezone) {
        document.cookie = `user_timezone=${timezone}; path=/; max-age=31536000; secure; SameSite=Lax`; 
    }

    /**
     * [MELHORIA V6] Agora ignora IP para evitar erro de VPN e foca em Brasília.
     */
    async function fetchTimeFromAPI() {
        try {
            // Fixamos Brasília como padrão ouro da Utilweb
            const targetTz = 'America/Sao_Paulo';
            const response = await fetch(`https://worldtimeapi.org/api/timezone/${targetTz}`); 
            
            if (!response.ok) throw new Error('Falha na detecção da API');
            
            const data = await response.json();
            const serverTimestamp = data.unixtime * 1000;
            userTimezone = targetTz; 
            userGMTOffset = data.raw_offset / 3600;
            
            // [V6] Calcula o erro do sistema do usuário
            timeOffset = serverTimestamp - Date.now(); 
            
            // [V6] Alerta o usuário
            checkClockDiscrepancy(timeOffset);
            
            if(dom.mainTitle) {
                dom.mainTitle.textContent = `Hora de Brasília (GMT -3)`;
            }
            
            setUserTimezoneCookie(userTimezone);
            startClock();

        } catch (error) {
            console.warn("Falha ao sincronizar via API, usando Brasília como padrão local.", error);
            // Fallback: Mantém Brasília mas sem correção de drift se falhar
            userTimezone = 'America/Sao_Paulo';
            startClock();
        }
    }
    
    async function fetchTimeByTimezone(timezone) {
         try {
            const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
            
            const data = await response.json();
            const serverTimestamp = data.unixtime * 1000;
            userTimezone = data.timezone;
            userGMTOffset = data.raw_offset / 3600;
            timeOffset = serverTimestamp - Date.now();
            
            if(dom.mainTitle) {
                const locationName = timezone.split('/')[1]?.replace('_', ' ') || 'Local';
                const offsetSign = userGMTOffset > 0 ? '+' : '';
                dom.mainTitle.textContent = `Hora em ${locationName} (GMT ${offsetSign}${userGMTOffset})`;
            }
            setUserTimezoneCookie(userTimezone); 
            startClock();

        } catch (error) {
            console.error("Falha total ao buscar a hora da API:", error);
        }
    }

    // --- 2. Funções de Controle (Mantidas) ---

    function initToolControls() {
        if (!dom.colorInput) return;
        const savedColor = localStorage.getItem(colorStorageKey);
        if (savedColor) {
            applyColor(savedColor);
            dom.colorInput.value = savedColor;
        }
        dom.colorInput.addEventListener('input', (e) => {
            const newColor = e.target.value;
            applyColor(newColor);
            localStorage.setItem(colorStorageKey, newColor);
        });
    }

    function applyColor(color) {
        if (dom.mainTime) dom.mainTime.style.color = color;
        if (dom.fullscreenTime) dom.fullscreenTime.style.color = color;
    }

    function initFullscreen() {
        if (!dom.fullscreenBtn || !dom.fullscreenContainer || !dom.fullscreenCloseBtn) return;
        
        dom.fullscreenBtn.addEventListener('click', () => {
            dom.fullscreenContainer.classList.add('is-active');
            document.body.classList.add('fullscreen-active'); 
            
            // [V6] Esconde o alerta na tela cheia
            if(dom.clockAlert) dom.clockAlert.classList.add('hidden');

            try {
                if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
                else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen(); 
            } catch (e) { console.warn("Modo tela cheia não suportado.", e); }
        });

        const closeFullscreen = () => {
             dom.fullscreenContainer.classList.remove('is-active');
             document.body.classList.remove('fullscreen-active'); 
             
             // [V6] Avalia se deve mostrar o alerta de volta
             checkClockDiscrepancy(timeOffset);

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
                checkClockDiscrepancy(timeOffset);
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

    // --- INICIALIZAÇÃO ---
    fetchTimeFromAPI();
    initToolControls();
    initFullscreen();
    initZoom(); 
});
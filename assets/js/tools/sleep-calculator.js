/**
 * Utilweb: Calculadora do Sono v5.0
 * Lógica baseada em ciclos circadianos de 90 minutos.
 */
class SleepCalculator {
    constructor() {
        // Configurações
        this.CYCLE_LENGTH = 90; // Duração do ciclo em minutos
        this.CYCLES_TO_SHOW = [6, 5, 4]; // 6 ciclos (9h), 5 (7.5h), 4 (6h)

        // Elementos DOM
        this.formBedtime = document.getElementById('sleep-calculator-form');
        this.inputWakeTime = document.getElementById('wake-up-time');
        this.inputFallAsleep = document.getElementById('fall-asleep-time');
        this.containerBedtimeResults = document.getElementById('results-container');
        
        this.btnWakeupNow = document.getElementById('calculate-wakeup-now-btn');
        this.containerWakeupResults = document.getElementById('wakeup-results-container');

        this.init();
    }

    init() {
        // Modo 1: Quero acordar às X horas
        if (this.formBedtime) {
            this.formBedtime.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateBedtime();
            });
        }

        // Modo 2: Vou dormir agora
        if (this.btnWakeupNow) {
            this.btnWakeupNow.addEventListener('click', () => {
                this.calculateWakeUpTime();
            });
        }
    }

    /**
     * MODO 1: Calcula a hora de dormir baseado na hora de acordar (REVERSO)
     * Fórmula: HoraAcordar - (Ciclos * 90min) - TempoAdormecer
     */
    calculateBedtime() {
        const wakeTimeStr = this.inputWakeTime.value;
        if (!wakeTimeStr) return;

        const [hours, minutes] = wakeTimeStr.split(':').map(Number);
        const wakeTimeInMinutes = (hours * 60) + minutes;
        const fallAsleepMinutes = parseInt(this.inputFallAsleep.value, 10) || 15;

        const results = this.CYCLES_TO_SHOW.map(cycles => {
            const sleepDuration = cycles * this.CYCLE_LENGTH;
            // Subtrai duração do sono e tempo para adormecer
            let bedtimeInMinutes = wakeTimeInMinutes - sleepDuration - fallAsleepMinutes;
            
            // Ajuste para dias anteriores (valores negativos)
            if (bedtimeInMinutes < 0) {
                bedtimeInMinutes += 1440; // +24h
            }

            return {
                time: this.minutesToTimeStr(bedtimeInMinutes),
                cycles: cycles,
                duration: this.minutesToDurationStr(sleepDuration),
                label: this.getQualityLabel(cycles)
            };
        });

        this.renderResults(this.containerBedtimeResults, results, "Você deve se deitar às:", true);
    }

    /**
     * MODO 2: Calcula a hora de acordar baseado no agora (DIRETO)
     * Fórmula: Agora + TempoAdormecer + (Ciclos * 90min)
     */
    calculateWakeUpTime() {
        const now = new Date();
        const currentMinutes = (now.getHours() * 60) + now.getMinutes();
        const fallAsleepMinutes = 15; // Média padrão fixa para "dormir agora"

        // Invertemos a ordem para mostrar o horário mais próximo primeiro, ou o mais longo?
        // Geralmente mostra-se do mais longo (ideal) para o curto, ou cronológico.
        // Vamos manter a ordem de qualidade (6, 5, 4 ciclos)
        const results = this.CYCLES_TO_SHOW.map(cycles => {
            const sleepDuration = cycles * this.CYCLE_LENGTH;
            let wakeUpInMinutes = currentMinutes + fallAsleepMinutes + sleepDuration;
            
            // Ajuste para dia seguinte
            if (wakeUpInMinutes >= 1440) {
                wakeUpInMinutes -= 1440;
            }

            return {
                time: this.minutesToTimeStr(wakeUpInMinutes),
                cycles: cycles,
                duration: this.minutesToDurationStr(sleepDuration),
                label: this.getQualityLabel(cycles)
            };
        });

        // Ordenar resultados cronologicamente para o "Acordar Agora" faz mais sentido?
        // Não, vamos manter por qualidade (Melhor sono primeiro).
        
        this.renderResults(this.containerWakeupResults, results, "Configure seu despertador para:", false);
    }

    // --- Renderização ---

    renderResults(container, data, titleText, isBedtimeMode) {
        let html = `<h3 class="results-title">${titleText}</h3>`;
        html += `<div class="sleep-cards-grid">`;

        data.forEach(item => {
            html += `
                <div class="sleep-card ${item.label.cssClass}">
                    <div class="sleep-time">${item.time}</div>
                    <div class="sleep-badge">${item.label.text}</div>
                    <div class="sleep-details">
                        <span class="cycles">${item.cycles} Ciclos</span> • 
                        <span class="duration">${item.duration} de sono</span>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        
        if(isBedtimeMode) {
            const fallAsleep = this.inputFallAsleep.value;
            html += `<p class="results-note">💡 Já incluímos os <strong>${fallAsleep} minutos</strong> que você leva para pegar no sono.</p>`;
        } else {
            html += `<p class="results-note">💡 Consideramos uma média de <strong>15 minutos</strong> para você adormecer.</p>`;
        }

        container.innerHTML = html;
        container.style.display = 'block';
        
        // Scroll suave
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // --- Helpers ---

    minutesToTimeStr(totalMinutes) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    minutesToDurationStr(totalMinutes) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    }

    getQualityLabel(cycles) {
        if (cycles >= 6) return { text: 'Sono Ideal', cssClass: 'ideal' };
        if (cycles === 5) return { text: 'Sono Bom', cssClass: 'good' };
        return { text: 'Mínimo Recomendado', cssClass: 'minimum' };
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    new SleepCalculator();
});

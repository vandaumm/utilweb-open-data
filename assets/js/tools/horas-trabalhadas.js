document.addEventListener('DOMContentLoaded', () => {
    const btnCalc = document.getElementById('btn-calculate');

    btnCalc.addEventListener('click', () => {
        const t1 = document.getElementById('time-in-1').value;
        const t2 = document.getElementById('time-out-1').value;
        const t3 = document.getElementById('time-in-2').value;
        const t4 = document.getElementById('time-out-2').value;
        const rate = parseFloat(document.getElementById('hourly-rate').value);

        if (!t1 || !t2 || !t3 || !t4) {
            alert("⚠️ Por favor, preencha todos os campos de horário.");
            return;
        }

        const toMin = (time) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        const calcDiff = (inTime, outTime) => {
            let diff = toMin(outTime) - toMin(inTime);
            // LÓGICA DA MADRUGADA: Se o resultado for negativo, somamos um dia inteiro (1440 min)
            if (diff < 0) diff += 1440;
            return diff;
        };

        const totalMinutes = calcDiff(t1, t2) + calcDiff(t3, t4);

        // Saída HH:MM
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        document.getElementById('total-hours').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        // Saída Decimal
        const decimal = totalMinutes / 60;
        document.getElementById('decimal-hours').textContent = decimal.toFixed(2);

        // Financeiro
        if (rate > 0) {
            const totalCash = decimal * rate;
            document.getElementById('total-value').textContent = totalCash.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.getElementById('salary-result').classList.remove('hidden');
        } else {
            document.getElementById('salary-result').classList.add('hidden');
        }

        document.getElementById('result-box').classList.remove('hidden');
    });
});

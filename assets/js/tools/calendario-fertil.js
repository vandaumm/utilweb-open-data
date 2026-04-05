/**
 * Utilweb: Calendário de Fertilidade v5.1 (Padrão V5)
 */
document.addEventListener('DOMContentLoaded', function() {

    // MAPEAMENTO DE ELEMENTOS
    const elements = {
        dataInput: document.getElementById('data-ultima-menstruacao'),
        cicloInput: document.getElementById('duracao-ciclo'),
        calendarioWrapper: document.getElementById('calendario-wrapper'),
        resultsWrapper: document.getElementById('results-summary-wrapper'),
        resumoMenstruacao: document.getElementById('resumo-proxima-menstruacao'),
        resumoJanela: document.getElementById('resumo-janela-fertil'),
        resumoOvulacao: document.getElementById('resumo-dia-ovulacao'),
        clearDateBtn: document.getElementById('clear-date-btn'),
    };

    // Verificação de Segurança
    if (!elements.dataInput || !elements.cicloInput || !elements.calendarioWrapper) {
        return;
    }

    let mesCorrente = new Date();

    // INICIALIZAÇÃO
    function initialize() {
        // Define data de hoje como padrão se vazio (opcional, removido para forçar usuário a escolher)
        // Mas adicionamos listeners
        
        elements.dataInput.addEventListener('input', () => {
            toggleClearButton();
            renderizarTudo();
        });
        
        elements.cicloInput.addEventListener('input', renderizarTudo);
        
        if (elements.clearDateBtn) {
            elements.clearDateBtn.addEventListener('click', () => {
                elements.dataInput.value = '';
                toggleClearButton();
                renderizarTudo();
            });
        }
        
        toggleClearButton();
        renderizarTudo();
    }
    
    function toggleClearButton() {
        if (elements.clearDateBtn) {
            elements.clearDateBtn.style.display = elements.dataInput.value ? 'block' : 'none';
        }
    }

    // LÓGICA DE CÁLCULO
    function calcularDadosCiclo() {
        const dataInputString = elements.dataInput.value;
        const duracaoCiclo = parseInt(elements.cicloInput.value, 10);
        
        if (!dataInputString || isNaN(duracaoCiclo) || duracaoCiclo < 20 || duracaoCiclo > 45) return null;
        
        let dataBase;
        try {
            // Validação simples de data YYYY-MM-DD
            if (!dataInputString.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
            const [ano, mes, dia] = dataInputString.split('-').map(Number);
            dataBase = new Date(ano, mes - 1, dia);
            
            // Validação de data inválida (ex: 31 de Fevereiro)
            if (isNaN(dataBase.getTime()) || dataBase.getMonth() !== mes - 1) return null;
        } catch (error) { return null; }

        const ciclos = [];
        const faseLutea = 14; // Padrão médio

        // Calcula 3 ciclos passados e 7 futuros
        for (let i = -3; i < 7; i++) {
            const inicioMenstruacao = new Date(dataBase);
            inicioMenstruacao.setDate(inicioMenstruacao.getDate() + (i * duracaoCiclo));
            
            const fimMenstruacao = new Date(inicioMenstruacao);
            fimMenstruacao.setDate(fimMenstruacao.getDate() + 4); // Assumindo 5 dias de sangramento
            
            const diaOvulacao = new Date(inicioMenstruacao);
            diaOvulacao.setDate(diaOvulacao.getDate() + (duracaoCiclo - faseLutea));
            
            const inicioJanelaFertil = new Date(diaOvulacao);
            inicioJanelaFertil.setDate(diaOvulacao.getDate() - 5); // 5 dias antes da ovulação
            
            const fimJanelaFertil = new Date(diaOvulacao); // Janela termina no dia da ovulação
            
            ciclos.push({ inicioMenstruacao, fimMenstruacao, inicioJanelaFertil, fimJanelaFertil, diaOvulacao });
        }
        return ciclos;
    }
    
    // FUNÇÕES DE RENDERIZAÇÃO
    function renderizarTudo() {
        const dadosCiclo = calcularDadosCiclo();
        renderizarCalendario(dadosCiclo);
        renderizarResumo(dadosCiclo);
    }

    function renderizarCalendario(dadosCiclo) {
        elements.calendarioWrapper.innerHTML = '';
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const nomeMes = mesCorrente.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        // Header do Calendário
        const header = document.createElement('div');
        header.className = 'calendario-header';
        header.innerHTML = `
            <button class="btn-nav-calendario" aria-label="Mês anterior">&lt;</button>
            <h3>${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}</h3>
            <button class="btn-nav-calendario" aria-label="Próximo mês">&gt;</button>
        `;
        elements.calendarioWrapper.appendChild(header);
        
        // Eventos de Navegação
        header.querySelector('[aria-label="Mês anterior"]').onclick = () => { mesCorrente.setMonth(mesCorrente.getMonth() - 1); renderizarTudo(); };
        header.querySelector('[aria-label="Próximo mês"]').onclick = () => { mesCorrente.setMonth(mesCorrente.getMonth() + 1); renderizarTudo(); };
        
        // Grid Container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'calendario-grid-container';
        
        // Dias da Semana
        const diasSemanaWrapper = document.createElement('div');
        diasSemanaWrapper.className = 'dias-semana';
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(dia => { 
            diasSemanaWrapper.innerHTML += `<div class="dia-semana">${dia}</div>`; 
        });
        gridContainer.appendChild(diasSemanaWrapper);
        
        // Grid de Dias
        const grid = document.createElement('div');
        grid.className = 'calendario-grid';
        
        const primeiroDiaMes = new Date(mesCorrente.getFullYear(), mesCorrente.getMonth(), 1);
        const ultimoDiaMes = new Date(mesCorrente.getFullYear(), mesCorrente.getMonth() + 1, 0);
        
        // Espaços em branco antes do dia 1
        for (let i = 0; i < primeiroDiaMes.getDay(); i++) { 
            grid.appendChild(document.createElement('div')); 
        }
        
        // Dias do Mês
        for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
            const diaAtual = new Date(mesCorrente.getFullYear(), mesCorrente.getMonth(), dia);
            const diaEl = document.createElement('div');
            diaEl.className = 'dia mes-atual';
            diaEl.textContent = dia;
            
            if (dadosCiclo) {
                for (const ciclo of dadosCiclo) {
                    // Menstruação (Vermelho)
                    if (diaAtual >= ciclo.inicioMenstruacao && diaAtual <= ciclo.fimMenstruacao) {
                        diaEl.classList.add('menstruacao');
                    }
                    // Janela Fértil (Azul) - Apenas se não for menstruação (casos de ciclo curto)
                    if (diaAtual >= ciclo.inicioJanelaFertil && diaAtual <= ciclo.fimJanelaFertil) {
                        diaEl.classList.add('fertil');
                    }
                    // Ovulação (Verde) - Sobrescreve fértil
                    if (diaAtual.getTime() === ciclo.diaOvulacao.getTime()) { 
                        diaEl.classList.remove('fertil'); 
                        diaEl.classList.add('ovulacao'); 
                    }
                }
            }
            
            // Dia Atual (Hoje)
            if (diaAtual.getTime() === hoje.getTime()) {
                diaEl.classList.add('hoje');
            }
            
            grid.appendChild(diaEl);
        }
        
        gridContainer.appendChild(grid);
        elements.calendarioWrapper.appendChild(gridContainer);
    }
    
    function renderizarResumo(dadosCiclo) {
        if (!dadosCiclo) { 
            elements.resultsWrapper.style.display = 'none'; 
            return; 
        }
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Encontrar o próximo evento relevante (futuro ou atual)
        const proximoCiclo = dadosCiclo.find(c => c.inicioMenstruacao >= hoje) || dadosCiclo.find(c => c.diaOvulacao >= hoje) || dadosCiclo.find(c => c.fimMenstruacao >= hoje);
        
        if (!proximoCiclo) { 
            elements.resultsWrapper.style.display = 'none'; 
            return; 
        }
        
        const formatDate = (date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        const formatRange = (d1, d2) => `${d1.toLocaleDateString('pt-BR', {day: '2-digit'})} a ${formatDate(d2)}`;
        
        elements.resumoMenstruacao.innerHTML = `🩸 <strong>Próxima Menstruação:</strong> <span class="date-highlight">${formatDate(proximoCiclo.inicioMenstruacao)}</span>`;
        elements.resumoJanela.innerHTML = `✨ <strong>Janela Fértil:</strong> <span class="date-highlight">${formatRange(proximoCiclo.inicioJanelaFertil, proximoCiclo.fimJanelaFertil)}</span>`;
        elements.resumoOvulacao.innerHTML = `🎯 <strong>Pico da Fertilidade:</strong> <span class="date-highlight">${formatDate(proximoCiclo.diaOvulacao)}</span>`;
        
        elements.resultsWrapper.style.display = 'block';
    }

    initialize();
});

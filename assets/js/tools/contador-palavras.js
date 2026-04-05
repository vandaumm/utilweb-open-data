/**
 * @fileoverview Lógica do Contador de Palavras e Caracteres.
 */
document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        textInput: document.getElementById('text-input'),
        wordCount: document.getElementById('word-count'),
        charCount: document.getElementById('char-count'),
        charCountNoSpaces: document.getElementById('char-count-no-spaces'),
        // lineCount: document.getElementById('line-count'), // Removido da interface
        paragraphCount: document.getElementById('paragraph-count'),
        readingTime: document.getElementById('reading-time') 
    };

    function updateCounts() {
        const text = dom.textInput.value;

        if (text.length === 0) {
            dom.wordCount.textContent = 0;
            dom.charCount.textContent = 0;
            dom.charCountNoSpaces.textContent = 0;
            dom.paragraphCount.textContent = 0;
            dom.readingTime.textContent = '~0 min';
            return;
        }

        const trimmedText = text.trim();
        const words = trimmedText.match(/\S+/g) || [];
        const wordCount = words.length;
        
        dom.wordCount.textContent = wordCount;
        dom.charCount.textContent = text.length;
        dom.charCountNoSpaces.textContent = text.replace(/\s/g, '').length;
        
        // Contagem de Parágrafos: Separa por duas quebras de linha (padrão) e garante que o texto não esteja vazio.
        dom.paragraphCount.textContent = text.split(/\n\s*\n/).filter(p => p.trim() !== '').length || (trimmedText ? 1 : 0);
        
        // Cálculo do tempo de leitura (WPM = 225)
        const wpm = 225; 
        const minutes = wordCount / wpm;
        const readTime = Math.ceil(minutes);
        dom.readingTime.textContent = `~${readTime} min`;
    }

    dom.textInput.addEventListener('input', updateCounts);
    updateCounts(); // Executa uma vez no carregamento para iniciar
});

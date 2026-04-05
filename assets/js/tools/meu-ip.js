/**
 * @fileoverview Lógica da ferramenta "Meu IP", usando a API ipinfo.io.
 * @description Busca e exibe o IP, localização e provedor do usuário.
 */
document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        ipDisplay: document.getElementById('ip-display'),
        copyBtn: document.getElementById('copy-btn'),
        locationDisplay: document.getElementById('ip-location'),
        ispDisplay: document.getElementById('ip-isp')
    };

    if (!dom.ipDisplay || !dom.locationDisplay || !dom.ispDisplay) {
        console.warn("Elementos do DOM da ferramenta 'Meu IP' não encontrados.");
        return;
    }

    // --- LÓGICA USANDO A API IPINFO.IO ---
    fetch('https://ipinfo.io/json', { cache: "no-cache" })
        .then(response => {
            if (!response.ok) {
                throw new Error('A resposta da rede não foi bem-sucedida.');
            }
            return response.json();
        })
        .then(data => {
            // Os nomes dos campos são um pouco diferentes nesta API (data.ip, data.city, etc.)
            dom.ipDisplay.textContent = data.ip;
            dom.locationDisplay.textContent = `${data.city}, ${data.country}`;
            dom.ispDisplay.textContent = data.org; // O provedor vem no campo 'org'
        })
        .catch(error => {
            // Se der erro, exibe a mesma mensagem amigável.
            console.error('Erro ao buscar os dados do IP:', error);
            const errorMsg = 'Não foi possível obter';
            dom.ipDisplay.textContent = errorMsg;
            dom.locationDisplay.textContent = errorMsg;
            dom.ispDisplay.textContent = errorMsg;
        });
    // --- FIM DA LÓGICA ---

    if (!dom.copyBtn) return;

    dom.copyBtn.addEventListener('click', () => {
        const ip = dom.ipDisplay.textContent.trim();
        
        if (ip && !ip.includes('Buscando') && !ip.includes('Não foi possível')) {
            navigator.clipboard.writeText(ip).then(() => {
                const originalText = dom.copyBtn.textContent;
                dom.copyBtn.textContent = 'Copiado!';
                setTimeout(() => {
                    dom.copyBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Falha ao copiar o IP: ', err);
                alert('Não foi possível copiar o IP. Por favor, tente manualmente.');
            });
        }
    });
});

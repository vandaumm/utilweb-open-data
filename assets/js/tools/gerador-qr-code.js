/**
 * @fileoverview Lógica do Gerador de QR Code - Utilweb
 * @description Controla a troca de abas e a geração/download do QR Code.
 */
// A biblioteca externa 'qrcode.min.js' deve ser carregada no HTML (index.php) antes deste script.
document.addEventListener('DOMContentLoaded', () => {
    
    // Cache dos elementos do DOM
    const dom = {
        tabs: document.querySelectorAll('.tab-btn'),
        panels: document.querySelectorAll('.tab-panel'),
        inputs: document.querySelectorAll('.tab-panel input, .tab-panel select, .tab-panel textarea'),
        qrcodeContainer: document.getElementById('qrcode'),
        downloadBtn: document.getElementById('download-btn'),
    };
    let activeTab = 'text';

    /**
     * Gera o QR Code com base na aba ativa e nos dados dos inputs.
     */
    function generateQRCode() {
        let data = '';
        try {
            if (activeTab === 'text') { 
                data = document.getElementById('text-input').value; 
            } else if (activeTab === 'wifi') {
                const ssid = document.getElementById('wifi-ssid').value.replace(/([\\;,"'])/g, '\\$1');
                const password = document.getElementById('wifi-password').value.replace(/([\\;,"'])/g, '\\$1');
                const security = document.getElementById('wifi-security').value;
                if(ssid) data = `WIFI:T:${security};S:${ssid};P:${password};;`;
            } else if (activeTab === 'vcard') {
                const name = document.getElementById('vcard-name').value;
                const tel = document.getElementById('vcard-tel').value;
                const email = document.getElementById('vcard-email').value;
                if(name || tel || email) data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${tel}\nEMAIL:${email}\nEND:VCARD`;
            }
        } catch (e) { 
            console.error("Error getting data:", e); 
            return; 
        }

        dom.qrcodeContainer.innerHTML = ''; // Limpa o container
        
        if (data.trim()) {
            try {
                // Instancia o QRCode (depende da lib qrcode.min.js)
                new QRCode(dom.qrcodeContainer, { 
                    text: data, 
                    width: 256, 
                    height: 256, 
                    colorDark: "#000000", 
                    colorLight: "#ffffff", 
                    correctLevel: QRCode.CorrectLevel.H 
                });
                // Exibe o botão de download como 'inline-flex' para centralizar (devido ao .btn)
                dom.downloadBtn.style.display = 'inline-flex';
            } catch (e) { 
                dom.qrcodeContainer.innerHTML = '<p>Erro ao gerar.</p>'; 
                dom.downloadBtn.style.display = 'none'; 
            }
        } else {
            dom.qrcodeContainer.innerHTML = '<p>Insira dados para gerar</p>';
            dom.downloadBtn.style.display = 'none';
        }
    }
    
    // --- 3. Listeners ---
    
    // Troca de Abas
    dom.tabs.forEach(tab => tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        dom.tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        dom.panels.forEach(p => p.classList.toggle('active', p.id === `${activeTab}-panel`));
        generateQRCode(); // Gera o QR Code ao trocar de aba
    }));

    // Geração em tempo real ao digitar
    dom.inputs.forEach(input => input.addEventListener('input', generateQRCode));
    
    // Botão de Download
    dom.downloadBtn.addEventListener('click', (e) => {
        // Tenta encontrar o canvas ou o img (qrcode.js pode gerar ambos)
        const canvas = dom.qrcodeContainer.querySelector('canvas');
        const img = dom.qrcodeContainer.querySelector('img');

        let dataURL = null;
        if (canvas) {
            dataURL = canvas.toDataURL('image/png');
        } else if (img) {
            // Se for só <img>, precisamos de um canvas para converter
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            dataURL = tempCanvas.toDataURL('image/png');
        }
        
        if (dataURL) {
            e.currentTarget.href = dataURL;
            e.currentTarget.download = 'utilweb-qrcode.png';
        } else { 
            e.preventDefault(); 
            console.error("Não foi possível encontrar o canvas ou img do QR code para download.");
        }
    });
    
    // 4. Gera um QR Code inicial (vazio) ao carregar a página
    generateQRCode();
});

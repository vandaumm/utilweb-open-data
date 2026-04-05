document.addEventListener('DOMContentLoaded', function() {
    // --- MAPEAMENTO DE ELEMENTOS ---
    const elements = {
        ddiSelect: document.getElementById('ddi'),
        telefoneInput: document.getElementById('telefone'),
        mensagemTextarea: document.getElementById('mensagem'),
        charCounter: document.getElementById('char-counter'),
        previewMensagem: document.getElementById('preview-mensagem'),
        linkGeradoInput: document.getElementById('link-gerado'),
        btnCopiar: document.getElementById('btn-copiar'),
        qrcodeContainer: document.getElementById('qrcode-container'),
        btnBaixarQRCode: document.getElementById('btn-baixar-qrcode'),
    };

    // MELHORIA: Dados de formato para cada país
    const countryData = {
        '55': { placeholder: '(11) 99999-8888', mask: '(##) #####-####', len: 11 },
        '351': { placeholder: '912 345 678', mask: '### ### ###', len: 9 },
        '1': { placeholder: '(201) 555-0123', mask: '### ###-####', len: 10 },
        '44': { placeholder: '7700 900123', mask: '#### ######', len: 10 },
        '49': { placeholder: '1512 3456789', mask: '#### #######', len: 11 },
        '34': { placeholder: '612 34 56 78', mask: '### ## ## ##', len: 9 },
        '39': { placeholder: '312 345 6789', mask: '### #### ###', len: 10 },
        '54': { placeholder: '9 11 2345-6789', mask: '# ## ####-####', len: 11 }
    };

    let qrCodeInstance = null; // Armazena a instância do QR Code

    // --- FUNÇÃO DE INICIALIZAÇÃO ---
    function initialize() {
        setupEventListeners();
        updatePhoneFormat(); // Define o formato inicial
        updateGenerator(); // Gera o estado inicial
    }

    // --- CONFIGURAÇÃO DOS EVENT LISTENERS ---
    function setupEventListeners() {
        elements.ddiSelect.addEventListener('change', updatePhoneFormat);
        elements.telefoneInput.addEventListener('input', handleTelefoneInput);
        elements.mensagemTextarea.addEventListener('input', updateGenerator);
        elements.btnCopiar.addEventListener('click', copiarLink);
        elements.btnBaixarQRCode.addEventListener('click', baixarQRCode);
    }

    // --- FUNÇÃO PRINCIPAL (ATUALIZA TUDO) ---
    function updateGenerator() {
        const ddi = elements.ddiSelect.value;
        const telefone = elements.telefoneInput.value.replace(/\D/g, ''); // Remove máscara
        const mensagem = elements.mensagemTextarea.value;
        
        elements.charCounter.textContent = `${mensagem.length}/2048`;

        if (!telefone) {
            elements.linkGeradoInput.value = 'Preencha o número de telefone.';
            elements.qrcodeContainer.innerHTML = '<p>QR Code aparecerá aqui</p>'; // Placeholder
            return;
        }

        const link = `https://wa.me/${ddi}${telefone}?text=${encodeURIComponent(mensagem)}`;
        
        elements.linkGeradoInput.value = link;
        elements.previewMensagem.textContent = mensagem || '...';
        generateQRCode(link);
    }

    // --- FUNÇÕES AUXILIARES ---

    function updatePhoneFormat() {
        const ddi = elements.ddiSelect.value;
        const data = countryData[ddi] || { placeholder: 'Digite seu número', mask: '', len: 15 };
        elements.telefoneInput.placeholder = data.placeholder;
        elements.telefoneInput.value = ''; // Limpa o campo ao trocar de país
        elements.telefoneInput.maxLength = data.mask.length;
        updateGenerator(); // Recalcula com o campo limpo
    }

    function handleTelefoneInput(event) {
        const ddi = elements.ddiSelect.value;
        const data = countryData[ddi] || { mask: '', len: 15 };
        formatarTelefone(event.target, data.mask, data.len);
        updateGenerator();
    }

    function formatarTelefone(input, mask, maxLen) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > maxLen) value = value.slice(0, maxLen);
        let maskedValue = '';
        let i = 0;
        for (const char of mask) {
            if (i >= value.length) break;
            if (char === '#') {
                maskedValue += value[i];
                i++;
            } else {
                maskedValue += char;
            }
        }
        input.value = maskedValue;
    }

    function generateQRCode(link) {
        elements.qrcodeContainer.innerHTML = '';
        qrCodeInstance = new QRCode(elements.qrcodeContainer, {
            text: link,
            width: 180,
            height: 180,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    function copiarLink() {
        elements.linkGeradoInput.select();
        navigator.clipboard.writeText(elements.linkGeradoInput.value).then(() => {
            const originalText = elements.btnCopiar.textContent;
            elements.btnCopiar.textContent = 'Copiado!';
            elements.btnCopiar.style.backgroundColor = 'var(--c-primary-dark)'; // V5 var
            setTimeout(() => {
                elements.btnCopiar.textContent = originalText;
                elements.btnCopiar.style.backgroundColor = '';
            }, 2000);
        });
    }
    
    function baixarQRCode() {
        const canvas = elements.qrcodeContainer.querySelector('canvas');
        const img = elements.qrcodeContainer.querySelector('img');
        
        let dataURL = null;
        if (canvas) {
            dataURL = canvas.toDataURL('image/png');
        } else if (img) {
            // Fallback se for renderizado como imagem
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            dataURL = tempCanvas.toDataURL('image/png');
        }

        if (dataURL) {
            const link = document.createElement('a');
            link.download = 'utilweb-qrcode-whatsapp.png';
            link.href = dataURL;
            link.click();
        }
    }

    // --- INICIA A APLICAÇÃO ---
    initialize();
});

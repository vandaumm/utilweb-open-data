document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        dropArea: document.getElementById('drop-area'),
        fileInput: document.getElementById('file-input'),
        imageData: document.getElementById('image-data'),
        imagePreview: document.getElementById('image-preview'),
        imageInfo: document.getElementById('image-info'),
        optionsContainer: document.getElementById('options-container'),
        // === CORREÇÃO AQUI === 
        // O seletor de classe estava errado (hífen único).
        formatButtons: document.querySelectorAll('.btn--format'), 
        // === FIM DA CORREÇÃO ===
        qualityContainer: document.getElementById('quality-container'),
        qualitySlider: document.getElementById('quality-slider'),
        qualityValue: document.getElementById('quality-value'),
        convertBtn: document.getElementById('convert-btn'),
        resultsCard: document.getElementById('results-card'),
        resultPreview: document.getElementById('result-preview'),
        resultInfo: document.getElementById('result-info'),
        downloadBtn: document.getElementById('download-btn'),
    };

    let originalFile = null;
    let outputFormat = 'jpeg'; // Formato padrão

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem.');
            return;
        }
        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            dom.imagePreview.src = e.target.result;
            dom.imageInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
            dom.imageData.style.display = 'block';
            dom.optionsContainer.style.display = 'block';
            dom.convertBtn.disabled = false;
            dom.resultsCard.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function selectFormat(format) {
        outputFormat = format;
        dom.formatButtons.forEach(btn => btn.classList.remove('active'));
        // Esta linha estava correta, mas o seletor no DOM mapping estava errado.
        document.querySelector(`.btn--format[data-format="${format}"]`).classList.add('active');
        
        // Mostrar slider de qualidade apenas para formatos com perdas
        dom.qualityContainer.style.display = (format === 'jpeg' || format === 'webp') ? 'block' : 'none';
    }

    function convertImage() {
        if (!originalFile) return;

        dom.convertBtn.disabled = true;
        dom.convertBtn.textContent = 'Convertendo...';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                if (outputFormat === 'jpeg' && (originalFile.type === 'image/png' || originalFile.type === 'image/webp' || originalFile.type === 'image/gif')) {
                   ctx.fillStyle = '#FFF';
                   ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);

                const quality = parseInt(dom.qualitySlider.value) / 100;
                const mimeType = `image/${outputFormat}`;
                
                if (outputFormat === 'bmp' && !canvas.toDataURL('image/bmp').startsWith('data:image/bmp')) {
                     alert('Seu navegador não suporta a conversão para BMP. Tente outro formato.');
                     dom.convertBtn.disabled = false;
                     dom.convertBtn.textContent = 'Converter Imagem';
                     return;
                }

                const dataUrl = canvas.toDataURL(mimeType, quality);
                dom.resultPreview.src = dataUrl;
                dom.downloadBtn.href = dataUrl;

                const newExtension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
                const newFileName = `${originalFile.name.split('.').slice(0, -1).join('.')}.${newExtension}`;
                dom.downloadBtn.download = newFileName;

                const newSize = atob(dataUrl.split(',')[1]).length;
                dom.resultInfo.textContent = `Nova Imagem: ${newFileName} (${formatBytes(newSize)})`;
                
                dom.resultsCard.style.display = 'block';
                dom.convertBtn.disabled = false;
                dom.convertBtn.textContent = 'Converter Imagem';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(originalFile);
    }

    // --- Event Listeners ---
    dom.dropArea.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dom.dropArea.addEventListener(eventName, preventDefaults, false));
    ['dragenter', 'dragover'].forEach(eventName => dom.dropArea.addEventListener(eventName, () => dom.dropArea.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(eventName => dom.dropArea.addEventListener(eventName, () => dom.dropArea.classList.remove('drag-over'), false));
    dom.dropArea.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]), false);

    dom.formatButtons.forEach(btn => btn.addEventListener('click', (e) => selectFormat(e.target.dataset.format)));
    dom.qualitySlider.addEventListener('input', () => dom.qualityValue.textContent = dom.qualitySlider.value);
    dom.convertBtn.addEventListener('click', convertImage);
    
    // Inicia o formato padrão
    selectFormat(outputFormat);
});

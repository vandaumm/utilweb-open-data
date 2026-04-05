document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        dropArea: document.getElementById('drop-area'),
        fileInput: document.getElementById('file-input'),
        uploadSection: document.getElementById('upload-section'),
        optionsSection: document.getElementById('options-section'),
        imagePreview: document.getElementById('image-preview'),
        imageInfo: document.getElementById('image-info'),
        qualityContainer: document.getElementById('quality-container'),
        qualitySlider: document.getElementById('quality-slider'),
        qualityValue: document.getElementById('quality-value'),
        compressBtn: document.getElementById('compress-btn'),
        resultsCard: document.getElementById('results-card'),
        beforePreview: document.getElementById('before-preview'),
        afterPreview: document.getElementById('after-preview'),
        originalSize: document.getElementById('original-size'),
        newSize: document.getElementById('new-size'),
        reduction: document.getElementById('reduction'),
        downloadBtn: document.getElementById('download-btn'),
    };

    let originalFile = null;
    let originalFileDataUrl = null;

    function preventDefaults(e) { 
        e.preventDefault(); 
        e.stopPropagation(); 
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Por favor, selecione um arquivo de imagem (JPG ou PNG).');
            return;
        }
        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalFileDataUrl = e.target.result;
            dom.imagePreview.src = originalFileDataUrl;
            dom.imageInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
            
            dom.uploadSection.style.display = 'none'; // Oculta área de drop
            dom.optionsSection.style.display = 'block'; // Mostra opções
            dom.resultsCard.style.display = 'none'; // Oculta resultados antigos
            dom.compressBtn.disabled = false;
            
            // Mostra slider de qualidade apenas para JPEG
            dom.qualityContainer.style.display = file.type === 'image/jpeg' ? 'block' : 'none';
        };
        reader.readAsDataURL(file);
    }

    function compressImage() {
        if (!originalFile) return;
        dom.compressBtn.textContent = 'Comprimindo...';
        dom.compressBtn.disabled = true;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Usa 0.8 (80%) como qualidade padrão se não for JPEG (ex: PNG)
            const quality = originalFile.type === 'image/jpeg' ? parseInt(dom.qualitySlider.value) / 100 : 0.8;
            
            const dataUrl = canvas.toDataURL(originalFile.type, quality);
            
            dom.beforePreview.src = originalFileDataUrl;
            dom.afterPreview.src = dataUrl;
            dom.downloadBtn.href = dataUrl;
            
            const newFileName = `${originalFile.name.split('.').slice(0, -1).join('.')}-comprimido.${originalFile.type.split('/')[1]}`;
            dom.downloadBtn.download = newFileName;
            
            // Calcula o novo tamanho
            const newSize = atob(dataUrl.split(',')[1]).length;
            const reduction = Math.max(0, 100 - (newSize / originalFile.size) * 100);
            
            dom.originalSize.textContent = formatBytes(originalFile.size);
            dom.newSize.textContent = formatBytes(newSize);
            dom.reduction.textContent = `${reduction.toFixed(0)}%`;
            
            dom.optionsSection.style.display = 'none'; // Oculta opções
            dom.resultsCard.style.display = 'block'; // Mostra resultados
            dom.compressBtn.textContent = 'Comprimir Imagem';
            dom.uploadSection.style.display = 'block'; // Mostra área de drop novamente
        };
        img.src = originalFileDataUrl;
    }

    // --- Event Listeners ---
    dom.dropArea.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dom.dropArea.addEventListener(eventName, preventDefaults, false));
    ['dragenter', 'dragover'].forEach(eventName => dom.dropArea.addEventListener(eventName, () => dom.dropArea.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(eventName => dom.dropArea.addEventListener(eventName, () => dom.dropArea.classList.remove('drag-over'), false));
    dom.dropArea.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]), false);

    dom.qualitySlider.addEventListener('input', () => dom.qualityValue.textContent = dom.qualitySlider.value);
    dom.compressBtn.addEventListener('click', compressImage);
});

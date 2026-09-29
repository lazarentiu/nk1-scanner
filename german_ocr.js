/**
 * GERMAN OCR PRE-PROCESSOR & NORMALIZER
 */

const GermanOCR = {
    // 1. Optimizare vizuală a capturii (Canvas Binarization cu protecție)
    preprocessImage: function(imageElement) {
        const canvas = document.createElement('canvas');
        const scale = 2.0; 
        const width = (imageElement.naturalWidth || imageElement.width || 800) * scale;
        const height = (imageElement.naturalHeight || imageElement.height || 600) * scale;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageElement, 0, 0, width, height);

        try {
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
                const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const color = luminance > 140 ? 255 : 0;
                data[i] = data[i+1] = data[i+2] = color;
            }
            ctx.putImageData(imgData, 0, 0);
        } catch (e) {
            console.warn("Canvas cross-origin warning, using standard canvas data.", e);
        }

        return canvas;
    },

    // 2. Curățare text și reparare erori frecvente OCR germană
    normalizeText: function(rawText) {
        if (!rawText) return "";
        let text = rawText.toUpperCase();

        text = text.replace(/Ä/g, "AE")
                   .replace(/Ö/g, "OE")
                   .replace(/Ü/g, "UE")
                   .replace(/ß/g, "SS");

        text = text.replace(/G0A/g, "GOÄ")
                   .replace(/GOAE/g, "GOÄ")
                   .replace(/G0Z/g, "GOZ")
                   .replace(/P2N/g, "PZN")
                   .replace(/SGB5/g, "SGB V")
                   .replace(/SGB11/g, "SGB XI")
                   .replace(/GEBUH/g, "GEBÜH");

        return text.replace(/[^A-Z0-9\s§\.\,\-€%]/g, " ").replace(/\s+/g, " ").trim();
    }
};
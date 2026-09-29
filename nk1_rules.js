/**
 * GERMAN OCR PRE-PROCESSOR
 * Mărește rezoluția, aplică contrast extrem pentru citire perfectă 
 * și normalizează textul (repară diacritice și erori de scanare).
 */

const GermanOCR = {
    // 1. Optimizare vizuală a capturii (Canvas Binarization)
    preprocessImage: function(imageElement) {
        const canvas = document.createElement('canvas');
        // Mărim rezoluția de 2x pentru ca textul mărunt (ex. PZN) să nu fie blurat
        const scale = 2.0; 
        canvas.width = (imageElement.naturalWidth || imageElement.width) * scale;
        canvas.height = (imageElement.naturalHeight || imageElement.height) * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Filtru alb/negru absolut (îndepărtează fundalul gri al documentelor)
        for (let i = 0; i < data.length; i += 4) {
            const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const color = luminance > 140 ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = color;
        }

        ctx.putImageData(imgData, 0, 0);
        return canvas;
    },

    // 2. Corectare text și reparare erori frecvente OCR
    normalizeText: function(rawText) {
        if (!rawText) return "";
        let text = rawText.toUpperCase();

        // Conversie corectă a Umlaut-urilor și Eszett-ului
        text = text.replace(/Ä/g, "AE")
                   .replace(/Ö/g, "OE")
                   .replace(/Ü/g, "UE")
                   .replace(/ß/g, "SS");

        // Reparare erori structurale OCR des întâlnite în documente medicale
        text = text.replace(/G0A/g, "GOÄ")
                   .replace(/GOAE/g, "GOÄ")
                   .replace(/G0Z/g, "GOZ")
                   .replace(/P2N/g, "PZN")
                   .replace(/SGB5/g, "SGB V")
                   .replace(/SGB11/g, "SGB XI")
                   .replace(/GEBUH/g, "GEBÜH");

        // Eliminare zgomot de fond, lăsând doar text alfanumeric curat
        return text.replace(/[^A-Z0-9\s§\.\,\-€%]/g, " ").replace(/\s+/g, " ").trim();
    }
};
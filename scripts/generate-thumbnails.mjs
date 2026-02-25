import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const modelsData = [
    {
        id: 'aguacate',
        name: 'Aguacate',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
        filename: 'aguacate.png'
    },
    {
        id: 'zorro',
        name: 'Zorro',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
        filename: 'zorro.png'
    },
    {
        id: 'sillon',
        name: 'Sillón',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
        filename: 'sillon.png'
    },
    {
        id: 'camara',
        name: 'Cámara',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
        filename: 'camara.png'
    }
];

const outputDir = path.resolve('assets/img/thumbnails');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateThumbnails() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // HTML mínimo con model-viewer
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
            <style>
                body { margin: 0; background: transparent; }
                model-viewer { width: 512px; height: 512px; background: transparent; }
            </style>
        </head>
        <body>
            <model-viewer id="viewer" shadow-intensity="1" environment-image="neutral"></model-viewer>
        </body>
        </html>
    `;

    await page.setContent(content);
    await page.setViewport({ width: 512, height: 512 });

    for (const model of modelsData) {
        console.log(`Generando thumbnail para: ${model.name}...`);

        await page.evaluate((src) => {
            const viewer = document.getElementById('viewer');
            viewer.src = src;
        }, model.src);

        // Esperar a que el modelo cargue usando el evento de model-viewer
        try {
            await page.evaluate(async () => {
                const viewer = document.getElementById('viewer');
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Timeout loading model')), 20000);
                    viewer.addEventListener('load', () => {
                        clearTimeout(timeout);
                        resolve();
                    }, { once: true });
                    if (viewer.loaded) {
                        clearTimeout(timeout);
                        resolve();
                    }
                });
            });
        } catch (e) {
            console.log(`Advertencia: Timeout o error cargando ${model.name}, intentando capturar de todos modos...`);
        }

        // Pequeña espera para que las texturas se estabilicen
        await new Promise(r => setTimeout(r, 2000));

        const viewerHandle = await page.$('#viewer');
        const outputPath = path.join(outputDir, model.filename);
        await viewerHandle.screenshot({ path: outputPath, omitBackground: true });
        console.log(`✓ Guardado correctamente: ${outputPath}`);
    }

    await browser.close();
    console.log('\n¡Proceso de generación completado exitosamente!');
}

generateThumbnails().catch(err => {
    console.error('Error generando thumbnails:', err);
    process.exit(1);
});

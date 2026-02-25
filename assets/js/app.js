const modelsData = [
    {
        id: 'avocado',
        name: 'Aguacate',
        category: 'comidas',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
        thumbnail: 'assets/img/thumbnails/aguacate.png',
        accentColor: '#147E72'
    },
    {
        id: 'fox',
        name: 'Zorro',
        category: 'test',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
        thumbnail: 'assets/img/thumbnails/zorro.png',
        accentColor: '#E79D19'
    },
    {
        id: 'chair',
        name: 'Sillón',
        category: 'test',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
        thumbnail: 'assets/img/thumbnails/sillon.png',
        accentColor: '#147E72'
    },
    {
        id: 'camera',
        name: 'Cámara',
        category: 'test',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb',
        thumbnail: 'assets/img/thumbnails/camara.png',
        accentColor: '#E79D19'
    },
    {
        id: 'milk',
        name: 'Leche',
        category: 'bebidas',
        src: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb',
        accentColor: '#147E72'
    }
];

const categories = [
    { id: 'test', name: 'Test' },
    { id: 'comidas', name: 'Comidas' },
    { id: 'bebidas', name: 'Bebidas' }
];

let currentCategory = 'test';
let isExpanded = false;

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('models-carousel');
    const categoryNav = document.getElementById('category-nav');
    const modelViewer = document.getElementById('main-viewer');
    const loader = document.getElementById('loader');
    const bgCircle = document.getElementById('bg-circle-1');
    const btnExpand = document.getElementById('btn-expand-catalogue');
    const controlsContainer = document.querySelector('.controls-container');

    // Inicializar Categorías
    function renderCategories() {
        categoryNav.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-tab ${currentCategory === cat.id ? 'active' : ''}`;
            btn.textContent = cat.name;
            btn.addEventListener('click', () => {
                currentCategory = cat.id;
                renderCategories();
                renderCarousel();
            });
            categoryNav.appendChild(btn);
        });
    }

    // Inicializar catálogo con Optimización de Rendimiento
    function renderCarousel() {
        carousel.innerHTML = '';
        const filteredModels = modelsData.filter(m => m.category === currentCategory);

        if (filteredModels.length === 0) {
            carousel.innerHTML = `<p class="empty-msg">Próximamente...</p>`;
            return;
        }

        filteredModels.forEach((model, index) => {
            const card = document.createElement('div');
            card.className = `model-card ${index === 0 ? 'active' : ''}`;
            card.dataset.id = model.id;

            // Uso de imágenes (thumbnails) en lugar de multiples model-viewer para performance
            card.innerHTML = `
                <div class="model-preview-container">
                    <img 
                        src="${model.thumbnail}" 
                        alt="${model.name}" 
                        loading="lazy" 
                        class="model-thumb">
                </div>
                <div class="model-name">${model.name}</div>
            `;

            card.addEventListener('click', () => selectModel(model, card));
            carousel.appendChild(card);
        });
    }

    // Funcionalidad de selección de modelo
    function selectModel(model, selectedCardElement) {
        // Actualizar UI
        document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
        selectedCardElement.classList.add('active');

        // Efecto visual de fondo
        bgCircle.style.background = `radial-gradient(circle, ${model.accentColor} 0%, transparent 70%)`;

        // Mostrar loader
        loader.classList.add('active');

        // Cambiar modelo en el viewer
        modelViewer.src = model.src;
        modelViewer.alt = `Modelo 3D de ${model.name}`;
    }

    // Toggle Expansion
    if (btnExpand) {
        btnExpand.addEventListener('click', () => {
            isExpanded = !isExpanded;
            controlsContainer.classList.toggle('expanded', isExpanded);
            btnExpand.textContent = isExpanded ? 'Contraer' : 'Expandir';
        });
    }

    // Escuchar eventos de carga del model-viewer
    modelViewer.addEventListener('load', () => {
        loader.classList.remove('active');
    });

    modelViewer.addEventListener('error', (error) => {
        loader.classList.remove('active');
        console.error('Error al cargar el modelo 3D', error);
    });

    // Iniciar
    currentCategory = 'test'; // Reset default
    renderCategories();
    renderCarousel();

    // Configurar AR prompt (Nativo)
    modelViewer.addEventListener('ar-status', (event) => {
        if (event.detail.status === 'session-started') {
            document.getElementById('ar-prompt').style.display = 'block';
        } else {
            document.getElementById('ar-prompt').style.display = 'none';
        }
    });

    // Comprobar soporte de AR (WebXR o Quick Look)
    setTimeout(() => {
        if (!modelViewer.canActivateAR) {
            const qrFallback = document.getElementById('qr-fallback');
            if (qrFallback) {
                let targetUrl = window.location.href;
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    targetUrl = 'http://192.168.100.106:5173';
                }
                document.getElementById('qr-code-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`;
                qrFallback.style.display = 'flex';
            }
        }
    }, 1500);

    // --- Lógica de Navegación Multi-página ---
    function showPage(pageId) {
        document.querySelectorAll('.app-page').forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });

        // Efecto para el visor al entrar
        if (pageId === 'page-viewer') {
            modelViewer.style.opacity = '0';
            setTimeout(() => {
                modelViewer.style.opacity = '1';
                modelViewer.style.transition = 'opacity 0.8s ease';
            }, 100);
        }
    }

    // Event Listeners de Navegación
    document.getElementById('btn-intro-next')?.addEventListener('click', () => showPage('page-itsi'));
    document.getElementById('btn-itsi-prev')?.addEventListener('click', () => showPage('page-intro'));
    document.getElementById('btn-itsi-next')?.addEventListener('click', () => showPage('page-viewer'));
    document.getElementById('btn-back-home')?.addEventListener('click', () => showPage('page-itsi'));

});

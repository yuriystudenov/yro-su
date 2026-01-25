document.addEventListener('DOMContentLoaded', function() {
    // Получаем ID товара из URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        window.location.href = 'index.html#products';
        return;
    }
    
    loadProductDetail(productId);
    
    // Инициализация модального окна
    const modal = document.getElementById('imageModal');
    const closeModal = document.getElementById('closeModal');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');
    
    let currentProductImages = [];
    let currentImageIndex = 0;
    
    if (modal && closeModal) {
        closeModal.addEventListener('click', closeImageModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    if (prevImage) {
        prevImage.addEventListener('click', function() {
            changeModalImage(-1);
        });
    }
    
    if (nextImage) {
        nextImage.addEventListener('click', function() {
            changeModalImage(1);
        });
    }
    
    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeImageModal();
        }
    });
    
    function openImageModal(images, index = 0) {
        currentProductImages = images;
        currentImageIndex = index;
        
        const modalImage = document.getElementById('modalImage');
        modalImage.src = images[index];
        modalImage.alt = `Изображение ${index + 1}`;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeImageModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    function changeModalImage(direction) {
        currentImageIndex += direction;
        
        if (currentImageIndex < 0) {
            currentImageIndex = currentProductImages.length - 1;
        } else if (currentImageIndex >= currentProductImages.length) {
            currentImageIndex = 0;
        }
        
        document.getElementById('modalImage').src = currentProductImages[currentImageIndex];
    }
    
    // Telegram Popup
    const telegramPopup = document.getElementById('telegramPopup');
    const closeTelegramPopup = document.getElementById('closeTelegramPopup');
    
    // Функция открытия Telegram popup
    window.openTelegramPopup = function() {
        telegramPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    // Функция закрытия Telegram popup
    function closeTelegramPopupFunc() {
        telegramPopup.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Настройка Telegram popup
    if (closeTelegramPopup) {
        closeTelegramPopup.addEventListener('click', closeTelegramPopupFunc);
    }
    
    if (telegramPopup) {
        telegramPopup.addEventListener('click', function(e) {
            if (e.target === telegramPopup) {
                closeTelegramPopupFunc();
            }
        });
        
        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && telegramPopup.classList.contains('active')) {
                closeTelegramPopupFunc();
            }
        });
    }
    
    // Функция загрузки деталей товара
    async function loadProductDetail(id) {
        try {
            const response = await fetch('products.json');
            const data = await response.json();
            const product = data.products.find(p => p.id === id);
            
            if (!product) {
                document.getElementById('productDetailContent').innerHTML = `
                    <div style="text-align: center; padding: 100px 0;">
                        <h2>Товар не найден</h2>
                        <p>Запрошенный товар не существует или был удален.</p>
                        <a href="index.html#products" class="btn btn-primary" style="margin-top: 20px;">
                            Вернуться в каталог
                        </a>
                    </div>
                `;
                return;
            }
            
            renderProductDetail(product);
        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            document.getElementById('productDetailContent').innerHTML = `
                <div style="text-align: center; padding: 100px 0; color: #666;">
                    <p>Не удалось загрузить информацию о товаре.</p>
                    <a href="index.html#products" class="btn btn-primary" style="margin-top: 20px;">
                        Вернуться в каталог
                    </a>
                </div>
            `;
        }
    }
    
    function renderProductDetail(product) {
        const container = document.getElementById('productDetailContent');
        
        // Галерея изображений
        let galleryHTML = '';
        if (product.images && product.images.length > 0) {
            galleryHTML = `
                <div class="product-gallery">
                    <div class="main-product-image">
                        <img id="mainProductImage" src="${product.images[0]}" alt="${product.name}" 
                             onclick="openImageModal(${JSON.stringify(product.images)}, 0)">
                    </div>
                    <div class="product-thumbnails">
                        ${product.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                                 onclick="changeMainImage('${img}', ${index})">
                                <img src="${img}" alt="Изображение ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Таблица характеристик
        let specsHTML = '';
        if (product.specifications) {
            specsHTML = `
                <div class="product-specifications">
                    <h3>Технические характеристики</h3>
                    <table>
                        ${Object.entries(product.specifications).map(([key, value]) => `
                            <tr>
                                <td>${key}</td>
                                <td>${value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
        }
        
        // Список особенностей
        let featuresHTML = '';
        if (product.features && product.features.length > 0) {
            featuresHTML = `
                <div class="product-features">
                    <h3>Особенности</h3>
                    <ul>
                        ${product.features.map(feature => `
                            <li>${feature}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="product-detail-content">
                ${galleryHTML}
                
                <div class="product-info">
                    <h1>${product.name}</h1>
                    <div class="product-category">${product.category}</div>
                    <div class="product-price">${product.price}</div>
                    
                    <p>${product.description}</p>
                    
                    ${featuresHTML}
                    ${specsHTML}
                    
                    <div class="product-actions">
                        <button class="btn btn-telegram" onclick="openTelegramPopup()">
                            <i class="fab fa-telegram"></i> Консультация в Telegram
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Глобальные функции для галереи
        window.changeMainImage = function(imgSrc, index) {
            document.getElementById('mainProductImage').src = imgSrc;
            document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
        };
        
        window.openImageModal = function(images, index) {
            openImageModal(images, index);
        };
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // Фиксированная шапка при скролле
    const header = document.getElementById('header');
    const burgerMenu = document.getElementById('burger-menu');
    const nav = document.querySelector('.nav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Бургер-меню для мобильных
    burgerMenu.addEventListener('click', function() {
        nav.classList.toggle('active');
        burgerMenu.classList.toggle('active');
        
        // Анимация бургер-меню
        const spans = burgerMenu.querySelectorAll('span');
        if (nav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            burgerMenu.classList.remove('active');
            
            // Возвращаем бургер-меню в исходное состояние
            const spans = burgerMenu.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            
            // Убираем active класс у всех ссылок
            navLinks.forEach(item => item.classList.remove('active'));
            // Добавляем active класс к текущей ссылке
            this.classList.add('active');
        });
    });
    
    // Плавный скролл по якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимация появления элементов при скролле
    const animatedElements = document.querySelectorAll('.product-card, .project-card, .catalog-card');
    
    function checkVisibility() {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition.top < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Устанавливаем начальные стили для анимированных элементов
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', checkVisibility);
    checkVisibility(); // Проверяем при загрузке страницы
    
    // Активная навигация при скролле
    function highlightNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavOnScroll);
    
    // Система товаров с пагинацией
    const PRODUCTS_PER_PAGE = 6;
    let currentPage = 1;
    let allProducts = [];
    let filteredProducts = [];
    let currentFilter = 'all';
    
    // Загрузка данных из JSON
    async function loadProducts() {
        try {
            const container = document.getElementById('productsContainer');
            container.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Загрузка товаров...</p>
                </div>
            `;
            
            const response = await fetch('products.json');
            const data = await response.json();
            allProducts = data.products;
            filteredProducts = [...allProducts];
            renderProducts();
            setupPagination();
            setupFilters();
            setupSearch();
        } catch (error) {
            console.error('Ошибка загрузки товаров:', error);
            document.getElementById('productsContainer').innerHTML = 
                '<div class="loading-spinner"><p style="color: #666;">Не удалось загрузить товары. Пожалуйста, попробуйте позже.</p></div>';
        }
    }
    
    // Рендеринг продуктов
    function renderProducts() {
        const container = document.getElementById('productsContainer');
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);
        
        if (productsToShow.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1; padding: 40px;">Товары не найдены. Попробуйте изменить фильтры или поисковый запрос.</p>';
            return;
        }
        
        container.innerHTML = productsToShow.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-img">
                    ${product.images && product.images[0] 
                        ? `<img src="${product.images[0]}" alt="${product.name}" loading="lazy">`
                        : `<i class="fas fa-cogs"></i>`}
                </div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description.substring(0, 100)}...</p>
                <div class="product-price">${product.price}</div>
                <a href="product-detail.html?id=${product.id}" class="product-link">Подробнее <i class="fas fa-arrow-right"></i></a>
            </div>
        `).join('');
        
        // Добавляем обработчики клика для карточек
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.product-link')) {
                    const productId = this.getAttribute('data-id');
                    window.location.href = `product-detail.html?id=${productId}`;
                }
            });
        });
        
        // Анимация для новых карточек
        setTimeout(() => {
            container.querySelectorAll('.product-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            });
        }, 50);
    }
    
    // Настройка пагинации
    function setupPagination() {
        const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
        const paginationContainer = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Кнопка "Назад"
        paginationHTML += `
            <button class="page-link ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="changePage(${currentPage - 1})" 
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <button class="page-link ${currentPage === i ? 'active' : ''}" 
                            onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<span class="page-link disabled">...</span>`;
            }
        }
        
        // Кнопка "Вперед"
        paginationHTML += `
            <button class="page-link ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="changePage(${currentPage + 1})" 
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }
    
    // Изменение страницы
    window.changePage = function(page) {
        if (page < 1 || page > Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)) return;
        
        currentPage = page;
        renderProducts();
        setupPagination();
        window.scrollTo({
            top: document.getElementById('products').offsetTop - 100,
            behavior: 'smooth'
        });
    };
    
    // Настройка фильтров
    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Убираем активный класс у всех кнопок
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Добавляем активный класс текущей кнопке
                this.classList.add('active');
                
                currentFilter = this.getAttribute('data-filter');
                currentPage = 1;
                
                if (currentFilter === 'all') {
                    filteredProducts = [...allProducts];
                } else {
                    filteredProducts = allProducts.filter(product => 
                        product.category === currentFilter
                    );
                }
                
                renderProducts();
                setupPagination();
            });
        });
    }
    
    // Настройка поиска
    function setupSearch() {
        const searchInput = document.getElementById('productSearch');
        
        // Поиск при вводе
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            performSearch(searchTerm);
        });
        
        // Поиск при нажатии Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value.toLowerCase().trim());
            }
        });
    }
    
    function performSearch(searchTerm) {
        if (searchTerm === '') {
            filteredProducts = currentFilter === 'all' 
                ? [...allProducts] 
                : allProducts.filter(product => product.category === currentFilter);
        } else {
            filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                (product.features && product.features.some(feature => 
                    feature.toLowerCase().includes(searchTerm)
                ))
            );
        }
        
        currentPage = 1;
        renderProducts();
        setupPagination();
    }
    
    // Модальное окно для изображений
    let currentImageIndex = 0;
    let currentProductImages = [];
    const modal = document.getElementById('imageModal');
    const closeModal = document.getElementById('closeModal');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');
    const modalImage = document.getElementById('modalImage');
    
    // Функция открытия модального окна
    window.openImageModal = function(productImages, index = 0) {
        if (!productImages || productImages.length === 0) return;
        
        currentProductImages = productImages;
        currentImageIndex = index;
        
        modalImage.src = productImages[index];
        modalImage.alt = `Изображение ${index + 1}`;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    // Функция закрытия модального окна
    function closeImageModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Функция переключения изображений
    function changeModalImage(direction) {
        currentImageIndex += direction;
        
        if (currentImageIndex < 0) {
            currentImageIndex = currentProductImages.length - 1;
        } else if (currentImageIndex >= currentProductImages.length) {
            currentImageIndex = 0;
        }
        
        modalImage.src = currentProductImages[currentImageIndex];
        modalImage.alt = `Изображение ${currentImageIndex + 1}`;
    }
    
    // Настройка модального окна
    if (modal && closeModal) {
        closeModal.addEventListener('click', closeImageModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
        
        if (prevImage) prevImage.addEventListener('click', () => changeModalImage(-1));
        if (nextImage) nextImage.addEventListener('click', () => changeModalImage(1));
        
        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeImageModal();
            }
            
            // Навигация стрелками
            if (modal.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    changeModalImage(-1);
                } else if (e.key === 'ArrowRight') {
                    changeModalImage(1);
                }
            }
        });
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
    
    // Загружаем продукты после инициализации
    loadProducts();
    
    // Обработка нажатия на изображения сертификатов
    const certificateImages = document.querySelectorAll('.certificates-gallery img');
    certificateImages.forEach(img => {
        img.addEventListener('click', function() {
            openImageModal([this.src], 0);
        });
    });
    
    // Копирование телеграм-ссылки при клике
    const telegramUsername = document.querySelector('.telegram-username');
    if (telegramUsername) {
        telegramUsername.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(this.href, '_blank');
        });
    }
});
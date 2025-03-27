document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const navbar = document.querySelector('.navbar');
    const burger = document.querySelector('.burger');
    const menuContainer = document.querySelector('.menu-container');
    const navLinks = document.querySelectorAll('.nav-link, .btn-cta');
    const logo = document.querySelector('.logo-img');
    const contactForm = document.getElementById('contact-form');
    const sections = document.querySelectorAll('section');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Estado del menú
    let menuOpen = false;
    let lastScrollY = window.pageYOffset;
    
    // Inicialización
    initSmoothScrolling();
    initIntersectionObserver();
    initMap();
    fixMobileLayout();
    initPropertyGalleries(); // Nueva función para galerías de departamentos
    loadPropertiesData(); // Cargar datos de propiedades
    
    // Burger Menu
    burger.addEventListener('click', toggleMenu);
    burger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
    
    // Cerrar menú al hacer click en enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 992 && menuOpen) {
                closeMenu();
            }
            
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    history.pushState(null, null, this.getAttribute('href'));
                }
            }
        });
    });
    
    // Efecto scroll navbar
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', debounce(handleScroll));
    }
    
    // Formulario de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Precarga de imágenes
    preloadImages();
    
    // Función para alternar el menú
    function toggleMenu() {
        menuOpen = !menuOpen;
        burger.classList.toggle('active');
        menuContainer.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        burger.setAttribute('aria-expanded', menuOpen);
        
        if (menuOpen) {
            logo.style.filter = 'brightness(0) invert(1)';
            const firstLink = menuContainer.querySelector('a');
            if (firstLink) setTimeout(() => firstLink.focus(), 100);
        } else {
            logo.style.filter = '';
        }
    }
    
    // Función para cerrar el menú
    function closeMenu() {
        if (menuOpen) toggleMenu();
    }
    
    // Función para corregir margen blanco en móviles
    function fixMobileLayout() {
        if (window.innerWidth <= 375) {
            document.documentElement.style.overflowX = 'hidden';
            document.body.style.overflowX = 'hidden';
            
            const containers = document.querySelectorAll('.navbar-container, .hero-content, section');
            containers.forEach(container => {
                container.style.maxWidth = '100vw';
                container.style.overflowX = 'hidden';
            });
        }
    }
    
    // Función para manejar el scroll
    function handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
            logo.style.height = '60px';
            
            if (scrollY > lastScrollY && scrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.transform = 'translateY(0)';
            logo.style.height = '60px';
        }
        
        lastScrollY = scrollY;
    }
    
    // Debounce para optimizar eventos
    function debounce(func, wait = 15) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Reemplaza la función handleFormSubmit con esta versión:
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validar formulario
    const errors = validateForm(new FormData(form));
    if (errors.length > 0) {
        showNotification('error', errors.join('<br>'));
        return;
    }
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Envío real a Formspree
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showNotification('success', '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
            form.reset();
        } else {
            throw new Error('Error en el envío');
        }
    })
    .catch(error => {
        showNotification('error', 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.');
        console.error('Error:', error);
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}
    
    // Validación de formulario
    function validateForm(formData) {
        const errors = [];
        if (!formData.get('nombre')) errors.push('Nombre es requerido');
        if (!formData.get('email') || !/^\S+@\S+\.\S+$/.test(formData.get('email'))) {
            errors.push('Email válido es requerido');
        }
        if (!formData.get('mensaje')) errors.push('Mensaje es requerido');
        return errors;
    }
    
    // Mostrar notificación
    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <button class="close-notification" aria-label="Cerrar notificación">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    // Scroll suave para enlaces
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (!targetElement) return;
                
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
                
                history.pushState(null, null, targetId);
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
            });
        });
    }
    
    // Observer para animaciones
    function initIntersectionObserver() {
        if (prefersReducedMotion) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        sections.forEach(section => observer.observe(section));
    }
    
    // Inicialización del mapa
    function initMap() {
        const mapContainer = document.getElementById('mainMap');
        if (!mapContainer || typeof L === 'undefined') return;
        
        const defaultLat = -39.031495;
        const defaultLng = -67.575717;
        const defaultZoom = 15;
        
        const map = L.map('mainMap', {
            preferCanvas: true,
            zoomControl: false
        }).setView([defaultLat, defaultLng], defaultZoom);
        
        L.control.zoom({ position: 'topright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);
        
        const goldIcon = L.divIcon({
            className: 'map-marker',
            html: '<i class="fas fa-map-marker-alt"></i>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });
        
        const markers = [
            {
                lat: -39.031495,
                lng: -67.575717,
                title: "Nuestros Departamentos",
                content: "Ubicación privilegiada en el corazón de la ciudad",
                icon: goldIcon
            },
            {
                lat: -39.028855,
                lng: -67.572073,
                title: "Zona Gastronómica",
                content: "Los mejores restaurantes y cafés a pocos minutos",
                icon: L.divIcon({
                    className: 'map-marker',
                    html: '<i class="fas fa-utensils"></i>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                })
            },
            {
                lat: -39.028394,
                lng: -67.575837,
                title: "Área Comercial",
                content: "Tiendas y boutiques exclusivas cerca de tu alojamiento",
                icon: L.divIcon({
                    className: 'map-marker',
                    html: '<i class="fas fa-shopping-bag"></i>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                })
            },
            {
                lat: -39.031445,
                lng: -67.574320,
                title: "Parques y Espacios Verdes",
                content: "Áreas naturales para relajarse y hacer deporte",
                icon: L.divIcon({
                    className: 'map-marker',
                    html: '<i class="fas fa-tree"></i>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                })
            }
        ];
        
        markers.forEach(marker => {
            L.marker([marker.lat, marker.lng], { icon: marker.icon })
                .addTo(map)
                .bindPopup(`<h4>${marker.title}</h4><p>${marker.content}</p>`);
        });
        
        const locationCards = document.querySelectorAll('.location-card');
        locationCards.forEach(card => {
            card.addEventListener('click', function() {
                locationCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                const lat = parseFloat(this.dataset.lat);
                const lng = parseFloat(this.dataset.lng);
                const zoom = parseInt(this.dataset.zoom) || defaultZoom;
                
                map.flyTo([lat, lng], zoom, {
                    duration: 1,
                    easeLinearity: 0.25
                });
            });
        });

        setTimeout(() => map.invalidateSize(), 200);
        window.addEventListener('orientationchange', () => {
            setTimeout(() => map.invalidateSize(true), 300);
        });
    }
    
    // Precarga de imágenes
    function preloadImages() {
        const images = [
            'assets/dpto1-1.jpg',
            'assets/dpto1-2.jpg',
            'assets/dpto1-3.jpg',
            'assets/dpto1-4.jpg',
            'assets/dpto1-5.jpg',
            'assets/dpto2-1.jpg',
            'assets/dpto3-1.jpg',
            'assets/hero-fondo.jpg',
            'assets/logo-ph.png'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Galerías interactivas para departamentos
    function initPropertyGalleries() {
        // Cambiar entre pestañas (fotos/videos)
        document.querySelectorAll('.media-nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                const tabContainer = this.closest('.property-media');
                
                tabContainer.querySelectorAll('.media-nav-btn').forEach(b => b.classList.remove('active'));
                tabContainer.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Cambiar imagen principal al hacer clic en miniaturas
        document.querySelectorAll('.thumbnail-grid img').forEach(thumb => {
            thumb.addEventListener('click', function() {
                const gallery = this.closest('.gallery');
                const mainImg = gallery.querySelector('.main-image img');
                const thumbSrc = this.src.replace('-thumb', '');
                
                mainImg.src = thumbSrc;
                mainImg.alt = this.alt.replace('Miniatura', 'Imagen');
                
                gallery.querySelectorAll('.thumbnail-grid img').forEach(img => {
                    img.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
        
        // Lazy loading para videos
        const videoObservers = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    iframe.src = iframe.dataset.src;
                    videoObservers.unobserve(iframe);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.video-container iframe').forEach(iframe => {
            iframe.dataset.src = iframe.src;
            iframe.src = '';
            videoObservers.observe(iframe);
        });
    }
    
    // Cargar datos de propiedades (podría ser desde una API)
    function loadPropertiesData() {
        const propertiesData = [
            {
                id: 1,
                name: "Departamento Alsina",
                ambientes: 5,
                banios: 2,
                cochera: true,
                precio: 85000,
                fotos: ["dpto1-1.jpg", "dpto1-2.jpg", "dpto1-3.jpg", "dpto1-4.jpg", "dpto1-5.jpg"],
                features: [
                    "Amplio living-comedor",
                    "Cocina totalmente equipada",
                    "2 dormitorios con placard",
                    "Baño completo y toilette",
                    "Terraza con parrilla"
                ]
            },
            {
                id: 2,
                name: "Departamento Canalito",
                ambientes: 4,
                banios: 1,
                cochera: true,
                precio: 75000,
                fotos: ["dpto2-1.jpg", "dpto2-2.jpg", "dpto2-3.jpg", "dpto2-4.jpg", "dpto2-5.jpg"],
                features: [
                    "Living-comedor integrado",
                    "Cocina moderna",
                    "1 dormitorio principal y 1 secundario",
                    "Baño completo",
                    "Balcón con vista"
                ]
            },
            {
                id: 3,
                name: "Departamento Centro",
                ambientes: 3,
                banios: 1,
                cochera: false,
                precio: 65000,
                fotos: ["dpto3-1.jpg", "dpto3-2.jpg", "dpto3-3.jpg", "dpto3-4.jpg", "dpto3-5.jpg"],
                features: [
                    "Ambiente amplio",
                    "Cocina integrada",
                    "1 dormitorio principal",
                    "Baño completo",
                    "Excelente ubicación céntrica"
                ]
            }
        ];
        
        // Aquí podrías implementar la generación dinámica de las tarjetas
        // basada en propertiesData si lo prefieres
        // generatePropertyCards(propertiesData);
    }
    
    // Generar tarjetas de propiedades dinámicamente (opcional)
    /*
    function generatePropertyCards(properties) {
        const propertyGrid = document.querySelector('.property-grid');
        if (!propertyGrid) return;
        
        propertyGrid.innerHTML = '';
        
        properties.forEach(property => {
            const propertyCard = document.createElement('article');
            propertyCard.className = 'property-card';
            propertyCard.innerHTML = `
                <!-- Estructura de la tarjeta como en el HTML -->
            `;
            propertyGrid.appendChild(propertyCard);
        });
        
        // Re-inicializar las galerías para las nuevas tarjetas
        initPropertyGalleries();
    }
    */
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', debounce(() => {
        fixMobileLayout();
    }, 100));
    
    // Mostrar navbar después de la carga
    window.addEventListener('load', () => {
        navbar.classList.add('loaded');
    });
});
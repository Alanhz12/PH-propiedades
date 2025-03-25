// Navbar Profesional Mejorado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const navbar = document.querySelector('.navbar');
    const burger = document.querySelector('.burger');
    const menuContainer = document.querySelector('.menu-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const logo = document.querySelector('.logo-img');
    const contactForm = document.getElementById('contact-form');
    const sections = document.querySelectorAll('section');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Estado del menú
    let menuOpen = false;
    let lastScrollY = window.scrollY;
    
    // Inicialización
    initSmoothScrolling();
    initIntersectionObserver();
    initMap();
    
    // Burger Menu
    burger.addEventListener('click', toggleMenu);
    burger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
    
    // Cerrar menú al hacer click en enlaces (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenuOnMobile);
    });
    
    // Efecto scroll navbar
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', debounce(handleScroll));
    }
    
    // Formulario de contacto
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Precarga de imágenes importantes
    preloadImages();
    
    // Función para alternar el menú
    function toggleMenu() {
        menuOpen = !menuOpen;
        burger.classList.toggle('active');
        menuContainer.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        burger.setAttribute('aria-expanded', menuOpen);
        
        if (menuOpen) {
            // Enfocar el primer enlace del menú al abrirlo
            const firstLink = menuContainer.querySelector('a');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }
    }
    
    // Función para cerrar el menú en móvil
    function closeMenuOnMobile() {
        if (window.innerWidth <= 992) {
            menuOpen = false;
            burger.classList.remove('active');
            menuContainer.classList.remove('active');
            document.body.classList.remove('no-scroll');
            burger.setAttribute('aria-expanded', 'false');
        }
    }
    
    // Función para manejar el scroll
    function handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
            logo.style.height = '40px';
            
            // Efecto hide/show al hacer scroll
            if (scrollY > lastScrollY && scrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.transform = 'translateY(0)';
            logo.style.height = '50px';
        }
        
        lastScrollY = scrollY;
    }
    
    // Debounce para optimizar el scroll
    function debounce(func, wait = 15) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
   // Manejo del formulario de contacto
if (document.getElementById('contact-form')) {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar estado de carga
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Simular envío (reemplazar con envío real a tu backend)
        setTimeout(() => {
            // Aquí iría la lógica real de envío con fetch()
            
            // Mostrar mensaje de éxito
            showNotification('success', '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.');
            
            // Resetear formulario
            this.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
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
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Cerrar manualmente
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
                
                // Actualizar URL sin recargar
                history.pushState(null, null, targetId);
                
                // Mover el foco al elemento destino para accesibilidad
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
            });
        });
    }
    
    // Observer para animaciones al hacer scroll
    function initIntersectionObserver() {
        if (prefersReducedMotion) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    // Inicialización del mapa
    function initMap() {
        // Verificar si el contenedor del mapa existe
        const mapContainer = document.getElementById('mainMap');
        if (!mapContainer) {
            console.error('No se encontró el contenedor del mapa');
            return;
        }

        // Verificar si Leaflet está cargado
        if (typeof L === 'undefined') {
            console.error('Leaflet no está cargado');
            return;
        }

        // Coordenadas iniciales (General Roca, Rio Negro)
        const defaultLat = -39.031495;
        const defaultLng = -67.575717;
        const defaultZoom = 15;
        
        // Crear mapa
        const map = L.map('mainMap', {
            preferCanvas: true, // Mejor rendimiento
            zoomControl: false // Desactivamos para posicionarlo manualmente
        }).setView([defaultLat, defaultLng], defaultZoom);
        
        // Añadir control de zoom personalizado
        L.control.zoom({
            position: 'topright'
        }).addTo(map);
        
        // Añadir tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(map);
        
        // Estilo para los marcadores
        const goldIcon = L.divIcon({
            className: 'map-marker',
            html: '<i class="fas fa-map-marker-alt"></i>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });
        
        // Añadir marcadores
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
        
        // Añadir marcadores al mapa
        markers.forEach(marker => {
            const m = L.marker([marker.lat, marker.lng], { icon: marker.icon })
                .addTo(map)
                .bindPopup(`<h4>${marker.title}</h4><p>${marker.content}</p>`);
        });
        
        // Interacción con las tarjetas de ubicación
        const locationCards = document.querySelectorAll('.location-card');
        
        locationCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remover clase active de todas las tarjetas
                locationCards.forEach(c => c.classList.remove('active'));
                
                // Añadir clase active a la tarjeta clickeada
                this.classList.add('active');
                
                // Obtener coordenadas y zoom
                const lat = parseFloat(this.dataset.lat);
                const lng = parseFloat(this.dataset.lng);
                const zoom = parseInt(this.dataset.zoom) || defaultZoom;
                
                // Mover el mapa a la ubicación seleccionada
                map.flyTo([lat, lng], zoom, {
                    duration: 1, // Duración de la animación en segundos
                    easeLinearity: 0.25
                });
            });
        });

        // Forzar redimensionamiento del mapa después de la carga
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }
    
    // Precarga de imágenes importantes
    function preloadImages() {
        const images = [
            'asset/hero-fondo.jpg',
            'asset/depto-alsina.webp',
            'asset/depto-canalito.webp',
            'asset/ph.png',
            'assets/logo-blanco.webp'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
});
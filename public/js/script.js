// ===== ELEMENTOS DEL DOM =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section');
const contactForm = document.getElementById('contactForm');
const scrollIndicator = document.querySelector('.scroll-indicator');

// ===== NAVEGACIÓN =====
// Toggle menú móvil
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Cerrar menú móvil y hacer scroll suave al hacer clic en un enlace
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');

        const targetId = link.getAttribute('href');

        // Si el enlace no apunta a una sección real (ej. "#" del Formulario Cliente), no hacer scroll
        if (!targetId || targetId === '#') {
            return;
        }

        e.preventDefault();
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// ===== EFECTOS DE SCROLL =====
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Navbar scroll effect
    navbar.classList.toggle('scrolled', scrollY > 50);
    
    // Ocultar scroll indicator
    if (scrollIndicator) {
        scrollIndicator.style.opacity = scrollY > 100 ? '0' : '1';
    }
    
    // Active link on scroll
    let current = '';
    sections.forEach(section => {
        if (scrollY >= section.offsetTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href').substring(1) === current);
    });
});

// Click en scroll indicator
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
    });
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const [nombre, email, telefono, mensaje] =
        ['nombre', 'email', 'telefono', 'mensaje'].map(id => $(id).value);

    if (!nombre || !email || !telefono || !mensaje) {
        return alert('Por favor, completa todos los campos.');
    }
    if (!validarEmail(email)) {
        return alert('Por favor, ingresa un correo electrónico válido.');
    }
    if (!/^[0-9]{7,10}$/.test(telefono)) {
        return alert('Por favor, ingresa un número de teléfono válido (7-10 dígitos).');
    }

    const exito = await enviarFormulario('/api/contacto', { nombre, email, telefono, mensaje },
        'Hubo un error al enviar tu mensaje. Intenta de nuevo más tarde.');
    if (exito) contactForm.reset();
});

// ===== ANIMACIÓN DE ELEMENTOS AL HACER SCROLL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('.service-card, .pricing-card, .schedule-card, .value-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== DESTACAR HORARIO ACTUAL =====
async function actualizarHorarioActual() {
    const ahora = new Date();
    const hoy = ahora.getDay();
    const fecha = ahora.toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local
    const scheduleCards = document.querySelectorAll('.schedule-card');

    let esFestivo = false;
    try {
        const festivos = await (await fetch(`/api/festivos/${ahora.getFullYear()}`)).json();
        esFestivo = festivos.includes(fecha);
    } catch (error) {
        console.error('No se pudieron cargar los festivos:', error);
    }

    const indice = hoy === 0 ? 2 : (hoy === 6 || esFestivo) ? 1 : 0; // 0: L-V, 1: Sáb/Festivo, 2: Dom
    scheduleCards.forEach((card, i) => {
        card.style.border = i !== indice ? 'none'
            : indice === 2 ? '3px solid #999' : '3px solid var(--primary-color)';
    });
}

window.addEventListener('load', actualizarHorarioActual);

// ===== SLIDER DE GALERÍA =====
const sliderImages = document.querySelectorAll('.slider-image');
const sliderDotsContainer = document.querySelector('.slider-dots');
let currentSlide = 0;

// Crear puntos indicadores
sliderImages.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    sliderDotsContainer.appendChild(dot);
});

const sliderDots = document.querySelectorAll('.slider-dot');

function goToSlide(slideIndex) {
    sliderImages[currentSlide].classList.remove('active');
    sliderDots[currentSlide].classList.remove('active');
    currentSlide = slideIndex;
    sliderImages[currentSlide].classList.add('active');
    sliderDots[currentSlide].classList.add('active');
}

function nextSlide() {
    goToSlide((currentSlide + 1) % sliderImages.length);
}

setInterval(nextSlide, 5000);

// ===== MODALES =====
const video = $('modalVideo');
const modalVideo = crearModal($('videoModal'), {
    alCerrar: () => { video.pause(); video.src = ''; }
});
const modalFormulario = crearModal($('formularioModal'), {
    alCerrar: () => { $('formularioIframe').src = ''; }
});

document.querySelectorAll('.service-card[data-video]').forEach(card => {
    card.addEventListener('click', () => {
        video.src = card.dataset.video;
        $('modalTitle').textContent = card.dataset.title;
        modalVideo.abrir();
        video.play();
    });
});
document.querySelector('.modal-close').addEventListener('click', modalVideo.cerrar);

$('btnFormularioCliente').addEventListener('click', (e) => {
    e.preventDefault();
    $('formularioIframe').src = 'formulario.html';
    modalFormulario.abrir();
});
document.querySelector('.modal-formulario-close').addEventListener('click', modalFormulario.cerrar);

// ===== GEOLOCALIZACIÓN: DISTANCIA AL GIMNASIO =====
const ubicacionGimnasio = {
    latitude: 4.439800221145623,
    longitude: -75.22768087174258
};

const btnUbicacion = document.getElementById('btnUbicacion');
const distanciaGimnasio = document.getElementById('distanciaGimnasio');

// Calcula la distancia en km entre dos coordenadas (fórmula de Haversine)
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

if (btnUbicacion) {
    btnUbicacion.addEventListener('click', () => {
        if (!navigator.geolocation) {
            distanciaGimnasio.textContent = 'Tu navegador no soporta geolocalización.';
            return;
        }

        distanciaGimnasio.textContent = 'Calculando distancia...';

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const distancia = calcularDistanciaKm(
                    posicion.coords.latitude,
                    posicion.coords.longitude,
                    ubicacionGimnasio.latitude,
                    ubicacionGimnasio.longitude
                );
                distanciaGimnasio.textContent = `Estás a ${distancia.toFixed(2)} km del gimnasio.`;
            },
            () => {
                distanciaGimnasio.textContent = 'No pudimos obtener tu ubicación. Verifica los permisos del navegador.';
            }
        );
    });
}

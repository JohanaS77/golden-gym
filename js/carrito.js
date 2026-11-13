// ===== CARRITO DE COMPRAS - GoldenGym Ibagué =====
// Flujo: Agregar al carrito -> Ver/editar carrito -> Comprar -> Confirmar -> Confirmación final.

(function () {
    const STORAGE_KEY = 'goldengym_carrito';

    // ===== ESTADO =====
    let carrito = cargarCarrito();

    // ===== ELEMENTOS DEL DOM =====
    const cartIconBtn = $('cartIconBtn');
    const cartCountBadge = $('cartCount');

    const cartModalClose = document.querySelector('.cart-modal-close');
    const cartItemsContainer = $('cartItemsContainer');
    const cartEmptyMessage = $('cartEmptyMessage');
    const cartTotalEl = $('cartTotal');
    const btnVaciarCarrito = $('btnVaciarCarrito');
    const btnSeguirComprando = $('btnSeguirComprando');
    const btnComprar = $('btnComprar');

    const checkoutModalClose = document.querySelector('.checkout-modal-close');
    const checkoutSummary = $('checkoutSummary');
    const checkoutTotalEl = $('checkoutTotal');
    const btnCancelarCompra = $('btnCancelarCompra');
    const btnConfirmarCompra = $('btnConfirmarCompra');

    const btnCerrarSuccess = $('btnCerrarSuccess');

    // ===== MODALES (creados con la fábrica de js/modales.js) =====
    const modalCarrito = crearModal($('cartModal'));
    const modalCheckout = crearModal($('checkoutModal'));
    const modalExito = crearModal($('successModal'));

    // ===== UTILIDADES =====
    function formatearPrecio(valor) {
        return '$' + valor.toLocaleString('es-CO');
    }

    function cargarCarrito() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('No se pudo leer el carrito guardado:', e);
            return [];
        }
    }

    function guardarCarrito() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
        } catch (e) {
            console.error('No se pudo guardar el carrito:', e);
        }
    }

    function actualizar() {
        guardarCarrito();
        renderizarCarrito();
    }

    function calcularTotal() {
        return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    }

    function calcularCantidadTotal() {
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    // ===== RENDERIZADO =====
    function actualizarBadge() {
        const cantidad = calcularCantidadTotal();
        cartCountBadge.textContent = cantidad;
        cartCountBadge.style.display = cantidad > 0 ? 'flex' : 'none';
    }

    const plantillaItem = (item) => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.nombre}</h4>
                <p class="cart-item-price">${formatearPrecio(item.precio)} c/u</p>
            </div>
            <div class="cart-item-quantity">
                <button type="button" class="qty-btn qty-decrease" aria-label="Disminuir cantidad">−</button>
                <span class="qty-value">${item.cantidad}</span>
                <button type="button" class="qty-btn qty-increase" aria-label="Aumentar cantidad">+</button>
            </div>
            <div class="cart-item-subtotal">${formatearPrecio(item.precio * item.cantidad)}</div>
            <button type="button" class="cart-item-remove" aria-label="Eliminar producto">
                <i class="fas fa-trash"></i>
            </button>
        </div>`;

    function renderizarCarrito() {
        if (carrito.length === 0) {
            cartItemsContainer.replaceChildren(cartEmptyMessage);
        } else {
            cartItemsContainer.innerHTML = carrito.map(plantillaItem).join('');
        }
        cartTotalEl.textContent = formatearPrecio(calcularTotal());
        actualizarBadge();
    }

    function renderizarResumenCompra() {
        checkoutSummary.innerHTML = carrito.map(item => `
            <div class="checkout-item-row">
                <span class="checkout-item-name">${item.nombre} <span class="checkout-item-qty">x${item.cantidad}</span></span>
                <span class="checkout-item-subtotal">${formatearPrecio(item.precio * item.cantidad)}</span>
            </div>`).join('');
        checkoutTotalEl.textContent = formatearPrecio(calcularTotal());
    }

    // ===== ACCIONES DEL CARRITO =====
    function agregarAlCarrito(id, nombre, precio) {
        const existente = carrito.find(item => item.id === id);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ id, nombre, precio, cantidad: 1 });
        }
        actualizar();
    }

    function cambiarCantidad(id, cambio) {
        const item = carrito.find(i => i.id === id);
        // La cantidad mínima es 1; para quitar un producto se usa el botón de eliminar.
        if (item && item.cantidad + cambio >= 1) {
            item.cantidad += cambio;
            actualizar();
        }
    }

    function eliminarProducto(id) {
        carrito = carrito.filter(i => i.id !== id);
        actualizar();
    }

    function vaciarCarrito() {
        if (carrito.length === 0) return;
        carrito = [];
        actualizar();
    }

    function abrirCarrito() {
        renderizarCarrito();
        modalCarrito.abrir();
    }

    // ===== CONSTRUCCIÓN DEL XML DE LA COMPRA =====
    function escaparXml(texto) {
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function construirXmlCompra() {
        const itemsXml = carrito.map(item => `
        <item>
            <nombre>${escaparXml(item.nombre)}</nombre>
            <cantidad>${item.cantidad}</cantidad>
            <precio>${item.precio}</precio>
            <subtotal>${item.precio * item.cantidad}</subtotal>
        </item>`).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<compra>
    <items>${itemsXml}
    </items>
    <total>${calcularTotal()}</total>
</compra>`;
    }

    // ===== EVENTOS: ícono carrito =====
    cartIconBtn.addEventListener('click', abrirCarrito);
    cartModalClose.addEventListener('click', modalCarrito.cerrar);

    // ===== EVENTOS: botones "Agregar al carrito" =====
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-plan-id');
            const nombre = button.getAttribute('data-plan-name');
            const precio = parseInt(button.getAttribute('data-plan-price'), 10);
            agregarAlCarrito(id, nombre, precio);
            abrirCarrito();
        });
    });

    // ===== EVENTOS: cantidad / eliminar (delegación de eventos) =====
    const accionesItem = {
        '.qty-increase': (id) => cambiarCantidad(id, 1),
        '.qty-decrease': (id) => cambiarCantidad(id, -1),
        '.cart-item-remove': eliminarProducto
    };

    cartItemsContainer.addEventListener('click', (e) => {
        const id = e.target.closest('.cart-item')?.dataset.id;
        const selector = Object.keys(accionesItem).find(s => e.target.closest(s));
        if (id && selector) accionesItem[selector](id);
    });

    // ===== EVENTOS: acciones del carrito =====
    btnVaciarCarrito.addEventListener('click', vaciarCarrito);

    btnSeguirComprando.addEventListener('click', () => {
        modalCarrito.cerrar();
        $('planes')?.scrollIntoView({ behavior: 'smooth' });
    });

    btnComprar.addEventListener('click', () => {
        if (carrito.length === 0) {
            alert('Tu carrito está vacío. Agrega al menos un plan antes de continuar.');
            return;
        }
        renderizarResumenCompra();
        modalCarrito.cerrar();
        modalCheckout.abrir();
    });

    // ===== EVENTOS: modal de resumen / confirmación =====
    checkoutModalClose.addEventListener('click', modalCheckout.cerrar);

    btnCancelarCompra.addEventListener('click', () => {
        modalCheckout.cerrar();
        abrirCarrito();
    });

    btnConfirmarCompra.addEventListener('click', async () => {
        try {
            const respuesta = await fetch('/api/compra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/xml' },
                body: construirXmlCompra()
            });
            const xml = new DOMParser().parseFromString(await respuesta.text(), 'application/xml');
            const leer = (tag) => xml.querySelector(tag)?.textContent;

            modalCheckout.cerrar();

            if (leer('exito') === 'true') {
                $('successMessage').textContent = `${leer('mensaje')} (N° de transacción: ${leer('numeroTransaccion')})`;
                modalExito.abrir();
                vaciarCarrito();
            } else {
                alert(leer('mensaje') || leer('error') || 'Ocurrió un error al procesar la compra.');
                abrirCarrito();
            }
        } catch (error) {
            console.error('Error al confirmar la compra:', error);
            alert('No se pudo conectar con el servidor. Intenta de nuevo.');
        }
    });

    btnCerrarSuccess.addEventListener('click', modalExito.cerrar);

    // ===== INICIALIZACIÓN =====
    actualizarBadge();
})();
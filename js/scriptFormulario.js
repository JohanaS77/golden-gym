const formularioCliente = $('formularioRegistro');

if (formularioCliente) {
    formularioCliente.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = $('correo').value.trim();
        const nombre = $('nombre').value.trim();
        const dias = document.querySelectorAll('input[name="dias[]"]:checked').length;

        if (!nombre || !email || dias === 0) {
            return alert('Por favor, completa todos los campos requeridos.');
        }
        if (!validarEmail(email)) {
            return alert('Por favor, ingresa un correo electrónico válido.');
        }

        const datos = Object.fromEntries(new FormData(formularioCliente));
        const exito = await enviarFormulario('/api/registro', datos,
            'Hubo un error al enviar tus datos. Intenta de nuevo más tarde.');

        if (exito) {
            formularioCliente.reset();
            setTimeout(cerrarModalFormulario, 500);
        }
    });
}

// Función para cerrar el modal desde el formulario
function cerrarModalFormulario() {
    if (!window.parent) return;
    
    const formularioModal = window.parent.document.getElementById('formularioModal');
    const formularioIframe = window.parent.document.getElementById('formularioIframe');
    
    if (formularioModal) {
        formularioModal.style.display = 'none';
        if (formularioIframe) {
            formularioIframe.src = '';
        }
        window.parent.location.hash = '#inicio';
    }
}
// Factory Method: crea un modal con abrir/cerrar, clic fuera y tecla Escape
function crearModal(modal, { alCerrar } = {}) {
    const abrir = () => { modal.style.display = 'block'; };
    const cerrar = () => { modal.style.display = 'none'; alCerrar?.(); };

    modal.addEventListener('click', (e) => { if (e.target === modal) cerrar(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') cerrar();
    });

    return { abrir, cerrar };
}
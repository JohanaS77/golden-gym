const crearRutaFormulario = require('./crearRutaFormulario');

module.exports = crearRutaFormulario({
    obligatorios: ['nombre', 'email', 'mensaje'],
    errorMsg: 'Nombre, correo y mensaje son obligatorios.',
    logMsg: 'Nuevo mensaje de contacto recibido:',
    mensajeExito: ({ nombre }) =>
        `¡Gracias ${nombre}! Tu mensaje ha sido enviado. Nos pondremos en contacto contigo pronto.`
});
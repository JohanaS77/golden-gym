const crearRutaFormulario = require('./crearRutaFormulario');

module.exports = crearRutaFormulario({
    obligatorios: ['nombre', 'correo'],
    errorMsg: 'Nombre y correo son obligatorios.',
    logMsg: 'Nuevo registro de cliente recibido:',
    mensajeExito: ({ nombre }) =>
        `¡Felicidades ${nombre}!\n\nTus datos han sido recibidos correctamente.\n\nNos pondremos en contacto contigo pronto para ayudarte en tu entrenamiento.\n\n¡Bienvenido(a) a GOLDEN GYM IBAGUÉ!`
});
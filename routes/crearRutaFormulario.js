const express = require('express');

// Factory Method: fabrica un router POST con validación de campos obligatorios
function crearRutaFormulario({ obligatorios, errorMsg, logMsg, mensajeExito }) {
    const router = express.Router();

    router.post('/', (req, res) => {
        if (obligatorios.some(campo => !req.body[campo])) {
            return res.status(400).json({ exito: false, error: errorMsg });
        }
        console.log(logMsg, req.body);
        res.json({ exito: true, mensaje: mensajeExito(req.body) });
    });

    return router;
}

module.exports = crearRutaFormulario;


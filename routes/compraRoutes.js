const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');

const parser = new xml2js.Parser({ explicitArray: false });
const builder = new xml2js.Builder();
const enviarXml = (res, status, objeto) =>
    res.status(status).type('application/xml').send(builder.buildObject(objeto));

// POST /api/compra  (recibe y responde en formato XML)
router.post('/', async (req, res) => {
    try {
        // req.body llega como texto XML (lo configuramos en server.js)
        const resultado = await parser.parseStringPromise(req.body);
        const compra = resultado.compra;

        console.log('Nueva compra (XML) recibida:');
        console.log(JSON.stringify(compra, null, 2));

        const respuestaObjeto = {
            respuestaCompra: {
                exito: true,
                numeroTransaccion: 'TX-' + Date.now(),
                mensaje: `Compra confirmada. Total: $${compra.total}`
            }
        };

        enviarXml(res, 200, respuestaObjeto);

    } catch (error) {
        console.error('Error al procesar la compra XML:', error);
        enviarXml(res, 400, { respuestaCompra: { exito: false, error: 'El XML enviado no es válido.' } });
    }
});

module.exports = router;
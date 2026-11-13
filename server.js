const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(require('path').join(__dirname, 'public')));

['contacto', 'registro', 'festivos'].forEach(nombre =>
    app.use(`/api/${nombre}`, require(`./routes/${nombre}Routes`))
);
app.use('/api/compra', express.text({ type: '*/xml' }), require('./routes/compraRoutes'));

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
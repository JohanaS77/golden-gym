// Atajo para getElementById
const $ = (id) => document.getElementById(id);

// Facade: envía JSON al backend y muestra el resultado. Devuelve true si hubo éxito.
async function enviarFormulario(url, datos, errorRed) {
    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json();
        alert(resultado.exito ? resultado.mensaje : resultado.error);
        return resultado.exito;
    } catch (error) {
        console.error(error);
        alert(errorRed);
        return false;
    }
}
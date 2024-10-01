const express = require('express'); // Importa Express
const fs = require('fs'); // Importa el módulo de sistema de archivos
const path = require('path'); // Importa el módulo para trabajar con rutas de archivos
const app = express(); // Crea una aplicación Express
const port = 3000; // Define el puerto en el que escuchará el servidor

// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'main/public'))); // Sirve archivos estáticos de la carpeta public

// Middleware para parsear JSON en las solicitudes POST
app.use(express.json()); // Permite que el servidor procese solicitudes JSON

// Ruta para servir la página principal (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Envía el archivo index.html como respuesta
});

// Ruta para obtener dragones desde el archivo JSON
app.get('/dragons', (req, res) => {
    const dragonsPath = path.join(__dirname, 'dragons.json'); // Define la ruta al archivo dragons.json

    // Lee el archivo de dragones
    fs.readFile(dragonsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de dragones:', err); // Registro del error en el servidor
            return res.status(500).json({ message: 'Error en el servidor al leer los dragones' }); // Envía un error al cliente
        }

        try {
            const dragons = JSON.parse(data); // Intenta parsear el archivo JSON
            res.json(dragons); // Envía los dragones en formato JSON
        } catch (parseError) {
            console.error('Error al parsear el archivo de dragones:', parseError); // Registro de error de parseo
            res.status(500).json({ message: 'Error en el formato de los datos de dragones' }); // Envía error si falla el parseo
        }
    });
});

// Ruta para guardar dragones en el archivo JSON
app.post('/dragons', (req, res) => {
    const dragons = req.body; // Obtiene el array de dragones del cuerpo de la solicitud
    const dragonsPath = path.join(__dirname, 'dragons.json'); // Define la ruta al archivo dragons.json

    if (!Array.isArray(dragons)) {
        return res.status(400).json({ message: 'El cuerpo de la solicitud debe ser un array de dragones' }); // Verificación del formato de la solicitud
    }

    // Escribe el array de dragones en el archivo JSON
    fs.writeFile(dragonsPath, JSON.stringify(dragons, null, 2), (err) => {
        if (err) {
            console.error('Error al guardar los dragones:', err); // Registro de error en el servidor
            return res.status(500).json({ message: 'Error en el servidor al guardar los dragones' }); // Envía un error al cliente
        }

        res.json({ message: 'Dragones guardados correctamente' }); // Envía una respuesta exitosa al cliente
    });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`); // Confirma que el servidor está en ejecución
});
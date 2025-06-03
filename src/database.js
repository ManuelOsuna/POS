// importar mongoose para conectarnos a MongoDB
const mongoose = require('mongoose');
require('dotenv').config(); // para cargar las variables de entorno desde el archivo .env

// establecemos la conexion con la base de datos
mongoose.connect(process.env.MONGODB_URI, {})
    .then(db => console.log('Base de datos conectada')) // mensaje de exito si la conexion es exitosa
    .catch(err => console.error(err)); // captura y muestra cualquier error de conexion

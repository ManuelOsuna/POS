// Importamos Mongoose, que nos permite trabajar con MongoDB en Node.js
const mongoose = require('mongoose');

// Importamos bcrypt-nodejs para cifrar contraseñas
const bcrypt = require('bcrypt-nodejs');

// Extraemos Schema de mongoose para definir la estructura de los datos
const { Schema } = mongoose;

// Definimos el esquema del usuario
const userSchema = new Schema({
    name: String,   // campo para almacenar el nombre
    email: String,  // Campo para almacenar el correo del usuario
    password: String, // Campo para almacenar la contraseña cifrada del usuario
    rol: { type: String, enum: ['admin', 'vendedor', 'supervisor'], required: true },  // Roles posibles
    telefono: { type: String },                         // Teléfono (opcional)
    fecha_ingreso: { type: Date, default: Date.now },   // Fecha de ingreso, por defecto es la fecha actual
    activo: { type: Boolean, default: true }            // Campo para indicar si el usuario está activo (por defecto, verdadero)
});

// Método para cifrar la contraseña antes de guardarla en la base de datos
userSchema.methods.encryptPassword = function(password) {
    // Genera un hash de la contraseña usando bcrypt con un "salt" de 10 rondas
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Método para comparar una contraseña ingresada con la almacenada en la base de datos
userSchema.methods.comparePassword = function(password) {
    // Compara la contraseña en texto plano con la contraseña cifrada
    return bcrypt.compareSync(password, this.password);
};

// Exportamos el modelo 'usuarios', basado en el esquema definido
module.exports = mongoose.model('Usuario', userSchema, 'usuarios');

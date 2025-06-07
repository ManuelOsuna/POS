const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: String,
  marca: String,
  codigo: String,
  precio: { type: Number, required: true },
  stock: Number,
  categoria: String,
  descripcion: String,
  activo: { type: Boolean, default: true },
  imagen: String,
  fecha_ingreso: Date
}, {
  timestamps: true
});

// Usamos singular 'Producto' para el modelo, Mongoose crea colección 'productos'
module.exports = mongoose.model('Producto', productoSchema, 'productos');

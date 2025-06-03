const mongoose = require('mongoose');

// Esquema de la venta
const ventaSchema = new mongoose.Schema({
    fecha: Date, 
    cliente: {
    nombre: String,
    documento: String,
    telefono: String,
    direccion: String
  },
  productos: [
    {
      producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, // Referencia a otro modelo de 'Producto'
      nombre: String,
      precio_unitario: Number,
      cantidad: Number,
      subtotal: Number // Subtotal de ese producto (cantidad * precio_unitario)
    }
  ],
  total: { type: Number }, // El total de la venta
  metodo_pago: String,
  estado: String,
  observaciones: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Referencia al usuario que hizo la venta
  activo: { type: Boolean, default: true } // Si la venta está activa o no
});

// Middleware para calcular el total de la venta antes de guardarla
ventaSchema.pre('save', function (next) {
  let totalVenta = 0;
  
  // Sumamos los subtotales de todos los productos en la venta
  this.productos.forEach(producto => {
    totalVenta += producto.subtotal; // Cada producto tiene un subtotal calculado previamente
  });

  // Asignamos el total calculado
  this.total = totalVenta;
  next();
});

module.exports = mongoose.model('Venta', ventaSchema, 'ventas');

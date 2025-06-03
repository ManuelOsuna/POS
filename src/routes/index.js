// Importamos Express para manejar rutas
const express = require('express');
// Creamos un enrutador de Express para definir las rutas de la aplicación
const router = express.Router();

// Importamos Passport para la autenticación de usuarios
const passport = require('passport');

// Importamos productos para su uso
const Producto = require('../models/producto');

// Importamos ventas para su uso
const Venta = require('../models/venta');

// Importamos clientes para su uso
const Cliente = require('../models/cliente');

// Importamos clientes para su uso
const Usuario = require('../models/user');

// Ruta para la página principal (Home)
router.get('/', (req, res, next) => {
    res.render('index'); // Renderiza la vista 'index.ejs'
});

// Ruta para la página de productos encontrados
router.get('/productos', async (req, res) => {
    try {
      const productos = await Producto.find({ activo: true });
     
  
      res.render('productos', { productos });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener productos');
    }
  });

  // Ruta para la página de ventas encontradas
router.get('/ventas', async (req, res) => {
    try {
      const ventas = await Venta.find().populate('user_id', 'name');
      res.render('ventas', { ventas });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener ventas');
    }
  });
  
// Ruta para mostrar el formulario de registro (signup)
router.get('/signup', (req, res, next) => {
    res.render('signup'); // Renderiza la vista 'signup.ejs'
});

//

// Ruta para procesar el formulario de registro
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // Si el registro es exitoso, redirige a la página de perfil
    failureRedirect: '/signup', // Si hay un error, redirige de nuevo al formulario de registro
    passReqToCallback: true // Permite pasar la solicitud (req) a la estrategia de autenticación
}));

// Ruta para mostrar el formulario de inicio de sesión (signin)
router.get('/signin', (req, res, next) => {
    res.render('signin'); // Renderiza la vista 'signin.ejs'
});

// Ruta para procesar el inicio de sesión
router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/profile', // Si la autenticación es exitosa, redirige al perfil del usuario
    failureRedirect: '/signin', // Si falla, redirige al formulario de inicio de sesión
    passReqToCallback: true // Permite pasar la solicitud a la estrategia de autenticación
}));

// Ruta para la página de perfil, y script de fecha para la manipulacion de fechas
router.get('/profile', async (req, res) => {
  try {
    // Obtener la fecha de inicio (hoy a las 00:00:00)
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    // Obtener la fecha de mañana (mañana a las 00:00:00)
    const mañana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);

    // Buscar ventas del día actual que estén activas
    const ventasHoy = await Venta.find({
      fecha: { $gte: hoy, $lt: mañana },
      activo: true
    });

    // Calcular total vendido hoy
    const totalHoy = ventasHoy.reduce((sum, venta) => sum + venta.total, 0);

    // Número de ventas realizadas hoy
    const totalVentas = ventasHoy.length;

    // Método de pago más usado
    const metodoMasUsado = (() => {
      const contador = {};
      for (const venta of ventasHoy) {
        const metodo = venta.metodo_pago || 'Desconocido';
        contador[metodo] = (contador[metodo] || 0) + 1;
      }
      const ordenado = Object.entries(contador).sort((a, b) => b[1] - a[1]);
      return ordenado[0]?.[0] || 'N/A';
    })();

    // Renderizar vista con datos dinámicos
    res.render('profile', {
      totalHoy,
      totalVentas,
      metodoMasUsado
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el dashboard');
  }
});




// Ruta para cerrar sesión
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err); // Si hay un error al cerrar sesión, pásalo al manejador de errores
        }
        res.redirect('/'); // Redirige a la página principal después de cerrar sesión
    });
});

// Función middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { // Comprueba si el usuario ha iniciado sesión
        return next(); // Si está autenticado, permite continuar con la solicitud
    }
    res.redirect('/'); // Si no está autenticado, redirige a la página principal
}

// Mostrar formulario de agregar producto
router.get('/nuevo-producto', isAuthenticated, (req, res) => {
    res.render('nuevo-producto');
});

router.post('/productos', async (req, res) => {
    try {
      const nuevoProducto = new Producto({
        nombre: req.body.nombre,
        marca: req.body.marca,
        modelo: req.body.modelo,
        precio: req.body.precio,
        stock: req.body.stock,
        categoria: req.body.categoria,
        descripcion: req.body.descripcion,
        activo: req.body.activo === 'true',
        imagen: req.body.imagen,
        fecha_ingreso: new Date()
      });
  
      await nuevoProducto.save();
      res.redirect('/productos');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      res.status(500).send('Error interno del servidor');
    }
  });

  
// Mostrar formulario de agregar venta
router.get('/nueva-venta', async (req, res) => {
    try {
      const clientes = await Cliente.find({});
      const productos = await Producto.find({});
      const vendedores = await Usuario.find({ rol: 'vendedor', activo: true });
      const ventas = await Venta.find({});
  
      res.render('nueva-venta', {
        clientes,
        productos,
        vendedores,
        ventas
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al cargar los datos');
    }
  });


// Guardar nueva venta con validación de stock
router.post('/ventas', async (req, res) => {
    try {
      const productosDisponibles = await Producto.find();

      const clienteDB = await Cliente.findById(req.body.cliente);
      const productosForm = req.body.productos || [];
  
      const productosVenta = [];
  
      for (let i = 0; i < productosForm.length; i++) {
        const producto = await Producto.findById(productosForm[i].id);
  
        const cantidadSolicitada = parseInt(productosForm[i].cantidad);
  
        if (!producto) {
          return res.status(400).send(`Producto no encontrado: ID ${productosForm[i].id}`);
        }
  
        //Validar stock disponible
        if (producto.stock < cantidadSolicitada) {
          return res.status(400).send(`Stock insuficiente para el producto "${producto.nombre}". Solo hay ${producto.stock} unidades.`);
        }
  
        productosVenta.push({
            producto_id: producto._id,
            nombre: producto.nombre,
            precio_unitario: producto.precio,
            cantidad: cantidadSolicitada,
            subtotal: producto.precio * cantidadSolicitada  // <-- calculamos subtotal aquí
          });
  
        //Descontar del stock
        producto.stock -= cantidadSolicitada;
        await producto.save();
      }
  
      const nuevaVenta = new Venta({
        fecha: new Date(),
        cliente: {
          nombre: clienteDB.nombre,
          documento: clienteDB.documento,
          telefono: clienteDB.telefono,
          direccion: clienteDB.direccion
        },
        productos: productosVenta,
        metodo_pago: req.body['metodo-pago'],
        estado: req.body.estado,
        observaciones: req.body.descripcion,
        user_id: req.body.vendedor,
        activo: true
      });
  
      await nuevaVenta.save();
      res.redirect('/ventas');
    } catch (err) {
      console.error('Error al guardar la venta:', err);
      res.status(500).send('Error interno al guardar la venta');
    }
  });
  
  

// Exportamos el enrutador para que pueda ser utilizado en el servidor principal
module.exports = router;
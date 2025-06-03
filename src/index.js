// Código del servidor

// Importamos los módulos necesarios
const express = require('express'); // Framework para manejar rutas y solicitudes HTTP
const engine = require('ejs-mate'); // Motor de plantillas para trabajar con EJS
const path = require('path'); // Módulo para manejar rutas de archivos y directorios
const morgan = require('morgan'); // Middleware para registrar las solicitudes en la consola
const passport = require('passport'); // Módulo de autenticación de usuarios
const session = require('express-session'); // Manejo de sesiones en Express
const flash = require('connect-flash'); // Middleware para mensajes temporales en la sesión

// Inicialización de la aplicación Express
const app = express();
require('./database'); // Importa la configuración y conexión a la base de datos
require('./passport/local-auth'); // Importa la configuración de autenticación con Passport

// Configuración del servidor
app.set('views', path.join(__dirname, 'views')); // Especificamos la carpeta de las vistas
app.engine('ejs', engine); // Configuramos EJS-Mate como motor de plantillas
app.set('view engine', 'ejs'); // Establecemos EJS como motor de plantillas
app.set('port', process.env.PORT || 3000); // Definimos el puerto en el que se ejecutará el servidor

// Middlewares
app.use(express.static('src/public')); // Servimos archivos estáticos desde la carpeta 'public'
app.use(morgan('dev')); // Usamos Morgan en modo desarrollo para ver las peticiones en la consola
app.use(express.urlencoded({ extended: true })); // Permite recibir datos de formularios en formato URL-encoded

// Configuración de la sesión
app.use(session({
    secret: 'myscretsession', // Clave secreta para cifrar la sesión
    resave: false, // Evita que la sesión se guarde en cada solicitud si no hay cambios
    saveUninitialized: false // Evita que se guarden sesiones vacías
}));

app.use(flash()); // Middleware para manejar mensajes flash (mensajes temporales en la sesión)
app.use(passport.initialize()); // Inicializa Passport para la autenticación de usuarios
app.use(passport.session()); // Habilita el uso de sesiones con Passport

// Middleware global para manejar variables locales accesibles en las vistas
app.use((req, res, next) => {
    app.locals.signupMessage = req.flash('signupMessage'); // Mensaje de error o éxito en el registro
    app.locals.signinMessage = req.flash('signinMessage'); // Mensaje de error o éxito en el inicio de sesión
    app.locals.user = req.user; // Guarda los datos del usuario autenticado en la sesión
    next(); // Continúa con la siguiente función middleware
});

// Rutas de la aplicación
app.use('/', require('./routes/index')); // Carga las rutas definidas en 'routes/index.js'

// Iniciar el servidor en el puerto configurado
app.listen(app.get('port'), () => {
    console.log('Servidor levantado en el puerto', app.get('port'));
});

// Importamos Passport para la autenticación de usuarios
const passport = require('passport'); 

// Importamos la estrategia de autenticación local de Passport
const LocalStrategy = require('passport-local').Strategy;

// Importamos el modelo de usuario
const User = require('../models/user');

// Serialización del usuario: guarda solo el ID del usuario en la sesión
passport.serializeUser((user, done) => {
    done(null, user.id); // Guarda el ID del usuario en la sesión
});

// Deserialización del usuario: recupera los datos del usuario a partir del ID almacenado en la sesión
passport.deserializeUser(async (id, done) => {
   const user = await User.findById(id); // Busca el usuario en la base de datos por su ID
   done(null, user); // Pasa el usuario encontrado a la sesión
});

// Configuración de la estrategia de registro de usuario (local-signup)
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email', // Se usará el campo "email" como nombre de usuario
    passwordField: 'password', // Se usará el campo "password" para la contraseña
    passReqToCallback: true // Permite acceder a "req" dentro de la función callback
}, async (req, email, password, done) => {
    
    // Verificamos si el usuario ya existe en la base de datos
    const user = await User.findOne({ email: email });
    if (user) {
        // Si el usuario ya existe, enviamos un mensaje de error
        return done(null, false, req.flash('signupMessage', 'El correo ya existe'));
    } else {
        // Si el usuario no existe, creamos uno nuevo
        const newUser = new User();
        newUser.name = req.body.name;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password); // Ciframos la contraseña antes de guardarla
        newUser.rol = "vendedor";
        await newUser.save(); // Guardamos el usuario en la base de datos
        done(null, newUser); // Autenticamos al usuario y lo guardamos en la sesión
    }
}));

// Configuración de la estrategia de inicio de sesión (local-signin)
passport.use('local-signin', new LocalStrategy({
    usernameField: 'email', // Se usará el campo "email" como nombre de usuario
    passwordField: 'password', // Se usará el campo "password" para la contraseña
    passReqToCallback: true // Permite acceder a "req" dentro de la función callback
}, async (req, email, password, done) => {
    
    // Buscamos al usuario en la base de datos
    const user = await User.findOne({ email: email });
    if (!user) {
        // Si el usuario no existe, enviamos un mensaje de error
        return done(null, false, req.flash('signinMessage', 'Usuario No Encontrado'));
    }

    // Verificamos si la contraseña es correcta
    if (!user.comparePassword(password)) {
        return done(null, false, req.flash('signinMessage', 'Contraseña Incorrecta'));
    }

    // Si el usuario existe y la contraseña es correcta, autenticamos al usuario
    done(null, user);
}));

// routes/userRouter.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const userController = require('../controllers/userController'); // Asegúrate de que este controlador exista y tenga los métodos


// Ruta para la página principal (Home.ejs) cuando se accede directamente a /
// ¡Esta ruta ya no es necesaria aquí si app.js la maneja directamente!
// router.get('/', (req, res) => {
//     res.render('Home');
// });

// Mostrar formulario de login (accesible en /users/login)
router.get('/login', userController.mostrarLogin);

// Procesar login (POST a /users/login)
router.post('/login', userController.procesarLogin);

// Vista para el panel de administración de USUARIOS (accesible en /users/admin)
// Es importante que esta ruta renderice la vista correcta (users/admin.ejs)
router.get('/admin', (req, res) => {
    // Aquí puedes cargar los productos para el panel de administración.
    // Esto es correcto si 'users/admin' es donde quieres mostrar la lista de productos
    // para que el usuario logueado la vea y administre.
    const productosFilePath = path.join(__dirname, '../data/products.json');
    const productosData = JSON.parse(fs.readFileSync(productosFilePath, 'utf-8'));
    const productos = productosData.productos || [];

    res.render('users/admin', { products: productos });
});

// Ruta para el registro de usuarios (accesible en /users/register)
//router.post('/logout', userController.logout);

module.exports = router;
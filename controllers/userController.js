// controllers/userController.js

const path = require('path');
const fs = require('fs');

const userController = {
    // Renderiza el formulario de login
    mostrarLogin: (req, res) => {
        // Asume que la vista de login está en views/users/login.ejs
        res.render('users/login');
    },

    // Procesa el login
    procesarLogin: (req, res) => {
        const { username, password } = req.body;

        // Lógica de autenticación simple (¡solo para desarrollo, no usar en producción!)
        if (username === 'admin' && password === '1234') {
            res.redirect('/users/admin'); // Redirige al panel de administración
        } else {
            res.render('users/login', { error: 'Usuario o contraseña incorrecta' });
        }
    },

    // Renderiza el panel de administración con los productos
    mostrarAdminPanel: (req, res) => {
        const productosFilePath = path.join(__dirname, '../data/products.json');

        fs.readFile(productosFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error leyendo archivo products.json para el panel de admin:', err);
                return res.status(500).send('Error interno del servidor al cargar productos.');
            }

            let productos = [];
            try {
                const productosData = JSON.parse(data);
                productos = productosData.productos || [];
            } catch (parseErr) {
                console.error('Error parseando products.json:', parseErr);
                return res.status(500).send('Error interno del servidor al procesar productos.');
            }

            // Asume que la vista de admin está en views/users/admin.ejs
            res.render('users/admin', { products: productos });
        });
    }
};

module.exports = userController;
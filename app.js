// app.js

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const fs = require('fs').promises;

const routerProducto = require('./routes/productRouter');
const userRouter = require('./routes/userRouter');

// Middleware para parsear el body de las peticiones
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Middleware para method-override (formularios con DELETE/PUT)
app.use(methodOverride('_method'));

// Servir archivos estáticos (CSS, JS, imágenes) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===========================================
// Definición de Rutas Principales
// ===========================================

// 1. Ruta para la página principal (Home.ejs)
// *** MODIFICADO PARA CARGAR DATOS PARA HOME.EJS (Kits y Ofertas) ***
app.get('/', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'products.json');
        const rawData = await fs.readFile(dataPath, 'utf8');
        const jsonData = JSON.parse(rawData);

        const allItems = jsonData.productos;

        // Filtrar productos para la sección "Kits Especiales"
        const kits = allItems.filter(item => item.categoria === 'kits');
        
        // Filtrar productos para la sección "Ofertas Especiales"
        // Un producto está en oferta si tiene un precio_original y un precio actual diferente
        const offers = allItems.filter(item => item.precio_original && item.precio_original > item.precio);

        // Adapta los productos (kits y ofertas) para la vista
        const adaptedKits = [];
        kits.forEach(item => {
            const adaptedItem = {
                _id: item.id,
                name: item.nombre,
                imageUrl: item.imagen,
                price: item.precio,
                currentPrice: item.precio, // Mantener currentPrice como precio actual
                originalPrice: item.precio_original,
                description: item.descripcion || '',
                category: item.categoria
            };
            if (adaptedItem.originalPrice && adaptedItem.originalPrice > adaptedItem.currentPrice) {
                const discount = adaptedItem.originalPrice - adaptedItem.currentPrice;
                adaptedItem.discountPercentage = ((discount / adaptedItem.originalPrice) * 100).toFixed(0);
            }
            adaptedKits.push(adaptedItem);
        });

        const adaptedOffers = [];
        offers.forEach(item => {
            const adaptedItem = {
                _id: item.id,
                name: item.nombre,
                imageUrl: item.imagen,
                price: item.precio,
                currentPrice: item.precio, // Mantener currentPrice como precio actual
                originalPrice: item.precio_original,
                description: item.descripcion || '',
                category: item.categoria
            };
            if (adaptedItem.originalPrice && adaptedItem.originalPrice > adaptedItem.currentPrice) {
                const discount = adaptedItem.originalPrice - adaptedItem.currentPrice;
                adaptedItem.discountPercentage = ((discount / adaptedItem.originalPrice) * 100).toFixed(0);
            }
            adaptedOffers.push(adaptedItem);
        });


        res.render('Home', {
            kits: adaptedKits,
            offers: adaptedOffers 
        });

    } catch (error) {
        console.error('Error al cargar la página de inicio:', error);
        res.status(500).render('error', {
            message: 'No pudimos cargar la página de inicio en este momento.'
        });
    }
});
// ----------------------------------------------------


// 2. Ruta para la página de productos (productos.ejs)
app.get('/productos', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'products.json');
        
        const rawData = await fs.readFile(dataPath, 'utf8');
        const jsonData = JSON.parse(rawData);

        const allItems = jsonData.productos;
        let productosFiltrados = [];
        const categoriaSolicitada = req.query.categoria;

        if (categoriaSolicitada) {
            productosFiltrados = allItems.filter(item => item.categoria === categoriaSolicitada);
        } else {
            productosFiltrados = allItems;
        }

        const adaptedProducts = [];
        productosFiltrados.forEach(item => {
            const adaptedItem = {
                _id: item.id,
                name: item.nombre,
                imageUrl: item.imagen,
                price: item.precio,
                currentPrice: item.precio,
                originalPrice: item.precio_original,
                description: item.descripcion || '',
                category: item.categoria
            };

            if (adaptedItem.originalPrice && adaptedItem.originalPrice > adaptedItem.currentPrice) {
                const discount = adaptedItem.originalPrice - adaptedItem.currentPrice;
                adaptedItem.discountPercentage = ((discount / adaptedItem.originalPrice) * 100).toFixed(0);
            }
            adaptedProducts.push(adaptedItem);
        });

        res.render('productos', {
            productosFiltrados: adaptedProducts,
            categoriaSeleccionada: categoriaSolicitada
        });

    } catch (error) {
        console.error('Error al cargar la página de productos o categoría:', error);
        res.status(500).render('error', {
            message: 'No pudimos cargar los productos o la categoría solicitada en este momento.'
        });
    }
});

// 3. Rutas de Administración de Productos
app.use('/admin/productos', routerProducto);

// 4. Rutas de Usuario/Autenticación
app.use('/users', userRouter);

// 5. Ruta para la página de Contacto (contact.ejs)
app.get('/contacto', (req, res) => {
    res.render('contact/contact'); 
});

// 6. Ruta para manejar el envío del formulario de contacto (POST)
app.post('/submit-contact', (req, res) => {
    // Aquí se procesan los datos del formulario:
    // Ajusto los nombres para que coincidan con los 'name' de tus inputs en contact.ejs
    const { nombre, email, telefono, mensaje } = req.body;

    console.log('Mensaje de contacto recibido:');
    console.log(`Nombre: ${nombre}`);
    console.log(`Email: ${email}`);
    console.log(`Teléfono: ${telefono || 'No proporcionado'}`); // Teléfono es opcional
    console.log(`Mensaje: ${mensaje}`);

    // En un proyecto real, aquí guardaría el mensaje en una base de datos
    // o enviarías un email, etc.

    // Después de procesar, redirige a la página de éxito
    res.redirect('/contacto/exito');
});

// 7. Ruta para la página de éxito de contacto (GET)
app.get('/contacto/exito', (req, res) => {
    res.render('contact/contact-success'); // Esto buscará en views/contact/contact-success.ejs
});

// 8. Manejo de errores 404 (ESTO SIEMPRE AL FINAL)
app.use((req, res, next) => {
    res.status(404).render('error404', {
        mensaje: 'Página no encontrada',
        imagen: '/image/error404.png'
    });
});

// Inicio del servidor
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
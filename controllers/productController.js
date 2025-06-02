// controllers/productController.js

const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON
const productosFilePath = path.join(__dirname, '../data/products.json');

// Función para leer productos
const leerProductos = () => {
    try {
        const data = fs.readFileSync(productosFilePath, 'utf-8');
        const parsedData = JSON.parse(data);
        return parsedData.productos || [];
    } catch (error) {
        console.error("Error al leer products.json:", error.message);
        return [];
    }
};

// Función para escribir productos
const guardarProductos = (productos) => {
    const data = { productos: productos };
    try {
        fs.writeFileSync(productosFilePath, JSON.stringify(data, null, 2));
        console.log("DEBUG: Productos guardados exitosamente en products.json");
    } catch (error) {
        console.error("ERROR: Fallo al escribir products.json:", error.message);
    }
};

const productController = {
    stock: (req, res) => {
        const productos = leerProductos();
        // página HTML de inicio
        res.render('Home', { products: productos });
    },

    detalle: (req, res) => {
        const productos = leerProductos();
        const id = parseInt(req.params.id);
        const producto = productos.find(p => p.id === id);

        if (producto) {
            res.render('products/detalleProd', { producto: producto });
        } else {
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Mostrar formulario de creación
    create: (req, res) => {
        res.render('products/createProduct');
    },

    // Guardar nuevo producto
    store: (req, res) => {
        const productos = leerProductos();
        const { nombre, precio, categoria, descripcion } = req.body; 

        const imagen = req.file ? `image/${req.file.filename}` : 'image/default-product.png'; 

        const nuevoProducto = {
            id: productos.length ? productos[productos.length - 1].id + 1 : 1,
            nombre,
            precio: parseFloat(precio),
            categoria,
            descripcion,
            imagen
        };

        try {
            productos.push(nuevoProducto);
            guardarProductos(productos);
            res.redirect("/users/admin");
        } catch (error) {
            console.error("Error al guardar el producto:", error);
            res.status(500).send("Error interno al guardar el producto.");
        }
    },
    // Mostrar formulario de edición
    edit: (req, res) => {
        const productos = leerProductos();
        const id = parseInt(req.params.id);
        const producto = productos.find(p => p.id === id);

        if (producto) {
            res.render('products/editProduct', { producto }); // 'editProduct.ejs' en products/
        } else {
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Guardar cambios del producto editado
    update: (req, res) => {
        const productos = leerProductos();
        const id = parseInt(req.params.id);
        const { nombre, precio, categoria, descripcion } = req.body;
        const imagen = req.file ? `image/${req.file.filename}` : null;

        const productoIndex = productos.findIndex(p => p.id === id);

        if (productoIndex !== -1) {
            productos[productoIndex] = {
                ...productos[productoIndex],
                nombre,
                precio: parseFloat(precio),
                categoria,
                descripcion,
                imagen: imagen || productos[productoIndex].imagen // Si no hay nueva imagen, mantiene la anterior
            };

            guardarProductos(productos);
            res.redirect('/users/admin');
        } else {
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Mostrar confirmación de eliminación
    delete: (req, res) => { 
        const productos = leerProductos();
        const id = parseInt(req.params.id);
        const producto = productos.find(p => p.id === id);

        if (producto) {
            res.render('products/deleteProductConfirm', { producto });
        } else {
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Eliminar producto
    destroy: (req, res) => {
        console.log("DEBUG: Método destroy alcanzado.");
        let productos = leerProductos();
        console.log("DEBUG: Productos leídos (cantidad):", productos.length);
        const id = parseInt(req.params.id);
        console.log("DEBUG: ID recibido para eliminar:", id);

        const productoIndex = productos.findIndex(p => p.id === id);
        console.log("DEBUG: Índice del producto a eliminar:", productoIndex);

        if (productoIndex !== -1) {
            const imagenAEliminar = productos[productoIndex].imagen;
            if (imagenAEliminar && imagenAEliminar !== 'image/default-product.png') {
                const rutaImagen = path.join(__dirname, '../public', imagenAEliminar);
                fs.unlink(rutaImagen, (err) => {
                    if (err) console.error("ERROR: Fallo al eliminar la imagen del disco:", err);
                });
            }

            productos.splice(productoIndex, 1);
            console.log("DEBUG: Productos después de splice (cantidad):", productos.length);

            guardarProductos(productos);
            res.redirect('/users/admin');
        } else {
            console.log("DEBUG: Producto con ID", id, "no encontrado para eliminar."); // DEBUG
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Filtrar por categoría 'ofertas'
    ofertas: (req, res) => {
        const productos = leerProductos();
        const productosOferta = productos.filter(p => p.categoria === 'ofertas');
        res.render('products/ofertas', { products: productosOferta }); //'ofertas.ejs' en products/
    },

    // Filtrar por categoría 'kits'
    kits: (req, res) => {
        const productos = leerProductos();
        const productosKits = productos.filter(p => p.categoria === 'kits');
        res.render('products/kits', { products: productosKits }); //'kits.ejs' en products/
    },

    // Nuevo método para mostrar el formulario de contacto
    contactForm: (req, res) => {
        res.render('contact/contact');
    },

    // Nuevo método para manejar el envío del formulario de contacto
    handleContactForm: (req, res) => {
        const { nombre, email, telefono, mensaje } = req.body;
        console.log("Formulario de contacto recibido:");
        console.log("Nombre:", nombre);
        console.log("Email:", email);
        console.log("Teléfono:", telefono);
        console.log("Mensaje:", mensaje);
        res.redirect('/contact-success');
    },
    admin: (req, res) => {
    const productos = leerProductos();
    res.render('admin/admin', { products: productos });
    }
    
};

module.exports = productController;
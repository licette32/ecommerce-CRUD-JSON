// controllers/productController.js

const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON
const productosFilePath = path.join(__dirname, '../data/products.json');

// Función para leer productos
const leerProductos = () => {
    try {
        const data = fs.readFileSync(productosFilePath, 'utf-8');
        // Asegúrate de que el JSON tenga la estructura esperada { "productos": [...] }
        const parsedData = JSON.parse(data);
        return parsedData.productos || []; // Si 'productos' no existe, devuelve un array vacío
    } catch (error) {
        // Si el archivo no existe o hay un error de parseo, devuelve un array vacío
        console.error("Error al leer products.json:", error.message);
        return [];
    }
};

// Función para escribir productos
const guardarProductos = (productos) => {
    const data = { productos: productos }; // Envuelve el array de productos en un objeto con la clave 'productos'
    try {
        fs.writeFileSync(productosFilePath, JSON.stringify(data, null, 2));
        console.log("DEBUG: Productos guardados exitosamente en products.json"); // LOG DE ÉXITO
    } catch (error) {
        console.error("ERROR: Fallo al escribir products.json:", error.message); // LOG DE ERROR
    }
};

const productController = {
    // Si esta es tu ruta principal (GET /), usualmente renderiza una vista
    // Actualmente, hace res.json. Si quieres una página HTML, cámbialo a res.render
    stock: (req, res) => {
        const productos = leerProductos();
        // Si quieres que esta sea tu página HTML de inicio:
        res.render('Home', { products: productos }); // Asumiendo que tu vista se llama Home.ejs en products/

        // Si quieres que sea un endpoint de API que devuelve JSON:
        // res.json(productos);
    },

    detalle: (req, res) => {
        const productos = leerProductos();
        const id = parseInt(req.params.id);
        const producto = productos.find(p => p.id === id);

        if (producto) {
            // Si quieres una vista para el detalle:
            res.render('products/detalleProd', { producto: producto }); // Asume vista 'detalleProd.ejs'

            // Si quieres que sea un endpoint de API que devuelve JSON:
            // res.json(producto);
        } else {
            res.status(404).render('error404', { // Asume que tienes una vista 'error404.ejs'
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png' // Asegúrate de que esta imagen exista en public/img
            });
        }
    },

    // Mostrar formulario de creación
    create: (req, res) => {
        res.render('products/createProduct'); // Asume que tu vista es 'createProduct.ejs' en products/
    },

    // Guardar nuevo producto
    store: (req, res) => {
        const productos = leerProductos();
        // ESTE ES EL CAMBIO FUNDAMENTAL: Incluir 'descripcion' en la desestructuración
        const { nombre, precio, categoria, descripcion } = req.body; 

        // Asegúrate de que req.file tenga la propiedad 'filename' después de Multer
        // Y que la ruta de la imagen sea consistente (image/ o images/)
        const imagen = req.file ? `image/${req.file.filename}` : 'image/default-product.png'; 

        const nuevoProducto = {
            id: productos.length ? productos[productos.length - 1].id + 1 : 1,
            nombre,
            precio: parseFloat(precio),
            categoria,
            descripcion, // Ahora 'descripcion' está correctamente definida
            imagen
        };

        try {
            productos.push(nuevoProducto); // <-- Asegúrate de que sea 'nuevoProducto' (con 'o' al final)
            guardarProductos(productos); // Llama a tu función guardarProductos
            res.redirect("/users/admin"); // Redirección correcta
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
            res.render('products/editProduct', { producto }); // Asume que tu vista es 'editProduct.ejs' en products/
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
        const imagen = req.file ? `image/${req.file.filename}` : null; // Ruta relativa desde 'public'

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
            res.redirect('/users/admin'); // Redirige a la ruta principal de administración después de actualizar
        } else {
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Mostrar confirmación de eliminación
    delete: (req, res) => { // Este es para la confirmación GET /delete/:id
        const productos = leerProductos();
        const id = parseInt(req.params.id);
        const producto = productos.find(p => p.id === id);

        if (producto) {
            res.render('products/deleteProductConfirm', { producto }); // Asume vista 'deleteProductConfirm.ejs'
        } else {
            res.status(404).render('error404', {
                mensaje: 'Producto no encontrado',
                imagen: '/image/error404.png'
            });
        }
    },

    // Eliminar producto
    destroy: (req, res) => { // Este es para la eliminación DELETE /delete/:id
        console.log("DEBUG: Método destroy alcanzado."); // DEBUG
        let productos = leerProductos();
        console.log("DEBUG: Productos leídos (cantidad):", productos.length); // DEBUG
        const id = parseInt(req.params.id);
        console.log("DEBUG: ID recibido para eliminar:", id); // DEBUG

        const productoIndex = productos.findIndex(p => p.id === id);
        console.log("DEBUG: Índice del producto a eliminar:", productoIndex); // DEBUG

        if (productoIndex !== -1) {
            // Lógica opcional para eliminar la imagen del disco
            const imagenAEliminar = productos[productoIndex].imagen;
            if (imagenAEliminar && imagenAEliminar !== 'image/default-product.png') {
                const rutaImagen = path.join(__dirname, '../public', imagenAEliminar);
                fs.unlink(rutaImagen, (err) => {
                    if (err) console.error("ERROR: Fallo al eliminar la imagen del disco:", err);
                });
            }

            productos.splice(productoIndex, 1);
            console.log("DEBUG: Productos después de splice (cantidad):", productos.length); // DEBUG

            guardarProductos(productos); // Llama a la función para guardar
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
        res.render('products/ofertas', { products: productosOferta }); // Asume 'ofertas.ejs' en products/
    },

    // Filtrar por categoría 'kits'
    kits: (req, res) => {
        const productos = leerProductos();
        const productosKits = productos.filter(p => p.categoria === 'kits');
        res.render('products/kits', { products: productosKits }); // Asume 'kits.ejs' en products/
    },

    // Nuevo método para mostrar el formulario de contacto
    contactForm: (req, res) => {
        res.render('contact/contact'); // Renderiza 'contact.ejs'
    },

    // Nuevo método para manejar el envío del formulario de contacto
    handleContactForm: (req, res) => {
        const { nombre, email, telefono, mensaje } = req.body;
        // Aquí puedo procesar los datos del formulario:
        // - Guardar en una base de datos
        // - Ver: Enviar un email (usando Nodemailer, por ejemplo)
        console.log("Formulario de contacto recibido:");
        console.log("Nombre:", nombre);
        console.log("Email:", email);
        console.log("Teléfono:", telefono);
        console.log("Mensaje:", mensaje);
        // Por ahora, solo redirige a una página de agradecimiento o a la página de inicio
        res.redirect('/contact-success');
    },
    admin: (req, res) => {
    const productos = leerProductos();
    res.render('admin/admin', { products: productos }); // Asegúrate que la ruta sea views/admin/admin.ejs
    }
    
};

module.exports = productController; // Exporta el objeto controlador
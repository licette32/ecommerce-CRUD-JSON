// routes/productRouter.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const productoController = require("../controllers/productController");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- Definición de Rutas ---

// GET /admin/productos/ - Muestra el listado de productos
// Nota: Si esta ruta se accede via /admin/productos, entonces router.get("/") es la ruta raíz de este router
router.get("/", productoController.stock); // Asume que 'stock' renderiza el listado de productos de admin

router.get("/create", productoController.create);
router.post("/create", upload.single('imagen'), productoController.store);

router.get("/detalle/:id", productoController.detalle);

router.get("/edit/:id", productoController.edit);
router.put("/:id", upload.single('imagen'), productoController.update);

router.get("/delete/:id", productoController.delete);
router.delete("/:id", productoController.destroy);

// ELIMINAR ESTA LÍNEA si el panel de administración principal se maneja en userRouter
// router.get("/admin", productoController.admin); // <--- QUITAR ESTA LÍNEA

// Rutas adicionales para categorías
router.get("/ofertas", productoController.ofertas);
router.get("/kits", productoController.kits);

// Rutas de contacto
router.get("/contact", productoController.contactForm);
router.post("/submit-contact", productoController.handleContactForm);

router.get("/contact-success", (req, res) => {
    res.render('contact-success');
});

module.exports = router;
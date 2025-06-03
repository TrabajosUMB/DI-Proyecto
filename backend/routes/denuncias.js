const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Denuncia = require('../models/Denuncia');
const { verifyToken } = require('../middleware/auth');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', process.env.UPLOAD_DIR));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) // 5MB por defecto
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

// Obtener todas las denuncias
router.get('/', async (req, res) => {
    try {
        const denuncias = await Denuncia.find()
            .sort({ createdAt: -1 })
            .populate('usuario', 'nombre email');

        res.json({
            success: true,
            data: denuncias
        });
    } catch (error) {
        console.error('Error al obtener denuncias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener denuncias'
        });
    }
});

// Crear una nueva denuncia
router.post('/', verifyToken, upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, descripcion, latitud, longitud } = req.body;
        const usuario_id = req.user.id;

        const denuncia = await Denuncia.create({
            titulo,
            descripcion,
            ubicacion: {
                type: 'Point',
                coordinates: [parseFloat(longitud), parseFloat(latitud)]
            },
            usuario: usuario_id,
            imagen: req.file ? {
                url: `/uploads/${req.file.filename}`,
                public_id: req.file.filename
            } : undefined
        });

        res.status(201).json({
            success: true,
            message: 'Denuncia creada exitosamente',
            data: denuncia
        });
    } catch (error) {
        console.error('Error al crear denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear denuncia'
        });
    }
});

// Obtener una denuncia específica
router.get('/:id', async (req, res) => {
    try {
        const denuncia = await Denuncia.findById(req.params.id)
            .populate('usuario', 'nombre email');

        if (!denuncia) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada'
            });
        }

        res.json({
            success: true,
            data: denuncia
        });
    } catch (error) {
        console.error('Error al obtener denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener denuncia'
        });
    }
});

// Actualizar una denuncia
router.put('/:id', verifyToken, upload.single('imagen'), async (req, res) => {
    try {
        const { titulo, descripcion, latitud, longitud } = req.body;
        const denuncia_id = req.params.id;
        const usuario_id = req.user.id;

        // Verificar si la denuncia existe y pertenece al usuario
        const denuncia = await Denuncia.findOne({ _id: denuncia_id, usuario: usuario_id });

        if (!denuncia) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada o no autorizada'
            });
        }

        // Actualizar la denuncia
        denuncia.titulo = titulo;
        denuncia.descripcion = descripcion;
        denuncia.ubicacion = {
            type: 'Point',
            coordinates: [parseFloat(longitud), parseFloat(latitud)]
        };

        if (req.file) {
            denuncia.imagen = {
                url: `/uploads/${req.file.filename}`,
                public_id: req.file.filename
            };
        }

        await denuncia.save();

        res.json({
            success: true,
            message: 'Denuncia actualizada exitosamente',
            data: denuncia
        });
    } catch (error) {
        console.error('Error al actualizar denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar denuncia'
        });
    }
});

// Eliminar una denuncia
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const denuncia_id = req.params.id;
        const usuario_id = req.user.id;

        // Verificar si la denuncia existe y pertenece al usuario
        const denuncia = await Denuncia.findOneAndDelete({ _id: denuncia_id, usuario: usuario_id });

        if (!denuncia) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada o no autorizada'
            });
        }

        res.json({
            success: true,
            message: 'Denuncia eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar denuncia'
        });
    }
});

module.exports = router;

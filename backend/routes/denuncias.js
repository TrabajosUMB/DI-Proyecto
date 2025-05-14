const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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
router.get('/', verifyToken, async (req, res) => {
    try {
        const [denuncias] = await req.app.locals.db.execute(`
            SELECT d.*, u.nombre as usuario_nombre 
            FROM denuncias d 
            JOIN usuarios u ON d.usuario_id = u.id 
            WHERE d.deleted_at IS NULL 
            ORDER BY d.fecha DESC
        `);

        res.json({
            success: true,
            denuncias
        });
    } catch (error) {
        console.error('Error al obtener denuncias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las denuncias'
        });
    }
});

// Crear nueva denuncia
router.post('/', verifyToken, upload.single('imagen'), async (req, res) => {
    try {
        const { tipo, descripcion, latitud, longitud } = req.body;
        const usuario_id = req.user.id;
        const imagen = req.file ? req.file.filename : null;

        const [result] = await req.app.locals.db.execute(
            'INSERT INTO denuncias (tipo, descripcion, latitud, longitud, imagen, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
            [tipo, descripcion, latitud, longitud, imagen, usuario_id]
        );

        res.status(201).json({
            success: true,
            message: 'Denuncia creada exitosamente',
            denuncia: {
                id: result.insertId,
                tipo,
                descripcion,
                latitud,
                longitud,
                imagen,
                usuario_id
            }
        });
    } catch (error) {
        console.error('Error al crear denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la denuncia'
        });
    }
});

// Obtener una denuncia específica
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [denuncias] = await req.app.locals.db.execute(
            `SELECT d.*, u.nombre as usuario_nombre 
             FROM denuncias d 
             JOIN usuarios u ON d.usuario_id = u.id 
             WHERE d.id = ? AND d.deleted_at IS NULL`,
            [req.params.id]
        );

        if (denuncias.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada'
            });
        }

        res.json({
            success: true,
            denuncia: denuncias[0]
        });
    } catch (error) {
        console.error('Error al obtener denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la denuncia'
        });
    }
});

// Actualizar una denuncia
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { tipo, descripcion, estado } = req.body;
        const denuncia_id = req.params.id;

        // Verificar si la denuncia existe y pertenece al usuario
        const [denuncias] = await req.app.locals.db.execute(
            'SELECT * FROM denuncias WHERE id = ? AND usuario_id = ? AND deleted_at IS NULL',
            [denuncia_id, req.user.id]
        );

        if (denuncias.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada o no autorizada'
            });
        }

        await req.app.locals.db.execute(
            'UPDATE denuncias SET tipo = ?, descripcion = ?, estado = ? WHERE id = ?',
            [tipo, descripcion, estado, denuncia_id]
        );

        res.json({
            success: true,
            message: 'Denuncia actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la denuncia'
        });
    }
});

// Eliminar una denuncia (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const denuncia_id = req.params.id;

        // Verificar si la denuncia existe y pertenece al usuario
        const [denuncias] = await req.app.locals.db.execute(
            'SELECT * FROM denuncias WHERE id = ? AND usuario_id = ? AND deleted_at IS NULL',
            [denuncia_id, req.user.id]
        );

        if (denuncias.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Denuncia no encontrada o no autorizada'
            });
        }

        // Realizar soft delete
        await req.app.locals.db.execute(
            'UPDATE denuncias SET deleted_at = NOW() WHERE id = ?',
            [denuncia_id]
        );

        res.json({
            success: true,
            message: 'Denuncia eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar denuncia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la denuncia'
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { validatePassword, validateEmail, loginRateLimit } = require('../middleware/auth');

// Registro de usuario
router.post('/register', [validateEmail, validatePassword], async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await Usuario.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Crear nuevo usuario
        const usuario = await Usuario.create({
            nombre,
            email,
            password
        });

        // Generar token
        const token = usuario.getSignedJwtToken();

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: usuario._id,
                nombre,
                email
            }
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

// Inicio de sesión
router.post('/login', [validateEmail, loginRateLimit], async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporcione email y contraseña'
            });
        }

        // Verificar usuario
        const usuario = await Usuario.findOne({ email }).select('+password');

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await usuario.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = usuario.getSignedJwtToken();

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

// Recuperación de contraseña
router.post('/reset-password', validateEmail, async (req, res) => {
    try {
        const { email } = req.body;

        // Verificar si el usuario existe
        const [users] = await req.app.locals.db.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Generar token de recuperación
        const resetToken = jwt.sign(
            { id: users[0].id, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Guardar token en la base de datos
        await req.app.locals.db.execute(
            'UPDATE usuarios SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
            [resetToken, users[0].id]
        );

        // Aquí se enviaría el email con el enlace de recuperación
        // Por ahora solo simulamos el envío

        res.json({
            success: true,
            message: 'Se ha enviado un enlace de recuperación a tu correo'
        });
    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

module.exports = router;

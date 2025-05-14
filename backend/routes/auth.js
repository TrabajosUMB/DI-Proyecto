const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validatePassword, validateEmail, loginRateLimit } = require('../middleware/auth');

// Registro de usuario
router.post('/register', [validateEmail, validatePassword], async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe
        const [existingUsers] = await req.app.locals.db.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario
        const [result] = await req.app.locals.db.execute(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );

        // Generar token
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: result.insertId,
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

        // Buscar usuario
        const [users] = await req.app.locals.db.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            // Incrementar contador de intentos fallidos
            await req.app.locals.db.execute(
                'UPDATE usuarios SET failed_login_attempts = failed_login_attempts + 1, last_attempt = NOW() WHERE id = ?',
                [user.id]
            );

            // Verificar si debe bloquearse la cuenta
            if (user.failed_login_attempts >= 4) {
                await req.app.locals.db.execute(
                    'UPDATE usuarios SET account_locked = 1 WHERE id = ?',
                    [user.id]
                );
            }

            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Resetear contador de intentos fallidos
        await req.app.locals.db.execute(
            'UPDATE usuarios SET failed_login_attempts = 0, account_locked = 0 WHERE id = ?',
            [user.id]
        );

        // Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
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

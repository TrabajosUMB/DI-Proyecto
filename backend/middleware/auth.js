const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana por IP
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos'
});

// Middleware para verificar el token JWT
const verifyToken = async (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado - Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            // Verificar si el token está en la lista negra
            const [rows] = await req.app.locals.db.execute(
                'SELECT * FROM invalid_tokens WHERE token = ?',
                [token]
            );

            if (rows.length > 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            // Si el token está expirado, agregarlo a la lista negra
            if (err.name === 'TokenExpiredError') {
                await req.app.locals.db.execute(
                    'INSERT INTO invalid_tokens (token, expires_at) VALUES (?, ?)',
                    [token, new Date(err.expiredAt)]
                );
            }

            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    } catch (error) {
        console.error('Error en la verificación del token:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en la autenticación'
        });
    }
};

// Middleware para validar contraseñas
const validatePassword = (req, res, next) => {
    const { password } = req.body;
    
    // Requisitos mínimos para la contraseña
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
        errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
        errors.push('La contraseña debe incluir al menos una mayúscula');
    }
    if (!hasLowerCase) {
        errors.push('La contraseña debe incluir al menos una minúscula');
    }
    if (!hasNumbers) {
        errors.push('La contraseña debe incluir al menos un número');
    }
    if (!hasSpecialChar) {
        errors.push('La contraseña debe incluir al menos un carácter especial');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña no cumple con los requisitos mínimos',
            errors
        });
    }

    next();
};

// Middleware para validar email
const validateEmail = (req, res, next) => {
    const { email } = req.body;
    
    // Expresión regular para validar email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'El formato del correo electrónico no es válido'
        });
    }

    next();
};

// Middleware para limitar intentos de inicio de sesión
const loginRateLimit = async (req, res, next) => {
    const { email } = req.body;
    
    try {
        // Obtener intentos fallidos
        const [rows] = await req.app.locals.db.execute(
            'SELECT failed_login_attempts, account_locked, last_attempt FROM usuarios WHERE email = ?',
            [email]
        );

        if (rows.length > 0) {
            const user = rows[0];
            
            // Si la cuenta está bloqueada, verificar si ha pasado el tiempo de bloqueo
            if (user.account_locked) {
                const lockTime = 15 * 60 * 1000; // 15 minutos
                const timeSinceLock = new Date() - new Date(user.last_attempt);
                
                if (timeSinceLock < lockTime) {
                    return res.status(429).json({
                        success: false,
                        message: `Cuenta bloqueada. Intente de nuevo en ${Math.ceil((lockTime - timeSinceLock) / 60000)} minutos`
                    });
                }
                
                // Desbloquear la cuenta si ha pasado el tiempo
                await req.app.locals.db.execute(
                    'UPDATE usuarios SET account_locked = 0, failed_login_attempts = 0 WHERE email = ?',
                    [email]
                );
            }
        }
        
        next();
    } catch (error) {
        console.error('Error en la verificación de intentos de inicio de sesión:', error);
        next(error);
    }
};

// Sanitización de entrada
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key].trim());
            }
        });
    }
    next();
};

// Configuración de seguridad con Helmet
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'", "https:", "http:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    hsts: {
        maxAge: 15552000,
        includeSubDomains: true
    }
});

// Prevención de parámetros de consulta duplicados
const preventParamPollution = hpp();

module.exports = {
    verifyToken,
    validatePassword,
    validateEmail,
    loginRateLimit,
    sanitizeInput,
    securityHeaders,
    preventParamPollution,
    limiter
};

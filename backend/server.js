const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
});
app.use('/api/', limiter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadDir)) {
    require('fs').mkdirSync(uploadDir, { recursive: true });
}

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(uploadDir));

// Conectar a MongoDB y luego iniciar el servidor
connectDB()
    .then(() => {
        console.log('MongoDB conectado exitosamente');
        
        // Rutas
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/denuncias', require('./routes/denuncias'));

        // Ruta principal
        app.get('/', (req, res) => {
            res.json({ message: 'API de Denuncias Ciudadanas' });
        });

        // Manejo de errores
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? err.message : {}
            });
        });

        // Iniciar servidor
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    });

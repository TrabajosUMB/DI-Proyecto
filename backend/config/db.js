const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de la base de datos MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB conectado exitosamente');
        return mongoose.connection;
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;

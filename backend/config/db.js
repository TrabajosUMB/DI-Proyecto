const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'denuncias_ciudadanas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos establecida correctamente');
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
};

// Función para ejecutar consultas
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection,
    query
};

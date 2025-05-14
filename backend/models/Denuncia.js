const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true,
        maxlength: [100, 'El título no puede tener más de 100 caracteres']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true,
        maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
    },
    ubicacion: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    imagen: {
        url: String,
        public_id: String
    },
    estado: {
        type: String,
        enum: ['pendiente', 'en_proceso', 'resuelto', 'rechazado'],
        default: 'pendiente'
    },
    severidad: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        required: true
    },
    usuario: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true
});

// Índice geoespacial para búsquedas por ubicación
denunciaSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Denuncia', denunciaSchema);

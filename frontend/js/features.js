// Características específicas por tipo de usuario
const userTypeFeatures = {
    // Características para usuarios a pie
    pie: {
        // Denuncia anónima
        enableAnonymousReport: true,
        // Reportes rápidos con una mano
        quickReport: true,
        // UI optimizada para peatones
        uiMode: 'pedestrian'
    },
    
    // Características para usuarios en carro
    carro: {
        // Guardar para enviar después
        enableDraftReports: true,
        // Ver reportes en rutas frecuentes
        showRouteReports: true,
        // Clasificación por tipo de vía
        roadTypeClassification: true
    },
    
    // Características para usuarios en moto
    moto: {
        // Reportes por voz
        enableVoiceReports: true,
        // Marcación de puntos críticos
        criticalPointsMarking: true,
        // Alertas de seguridad compartidas
        sharedSafetyAlerts: true
    },
    
    // Características para usuarios en transporte público
    transporte_publico: {
        // Denuncias colectivas
        enableCollectiveReports: true,
        // Geolocalización en paraderos
        stopLocationReporting: true,
        // Notas de experiencia
        passengerExperienceNotes: true
    }
};

// Sistema de calificación y feedback
class FeedbackSystem {
    static async rateResponse(reportId, rating, comment) {
        try {
            const response = await axios.post('/api/feedback', {
                reportId,
                rating,
                comment
            });
            return response.data;
        } catch (error) {
            console.error('Error al enviar calificación:', error);
            throw error;
        }
    }

    static async getAverageResponseTime(area) {
        try {
            const response = await axios.get('/api/statistics/response-time', {
                params: { area }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener tiempo promedio:', error);
            throw error;
        }
    }
}

// Sistema de voz para reportes
class VoiceReportSystem {
    constructor() {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.lang = 'es-CO';
    }

    startRecording() {
        return new Promise((resolve, reject) => {
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            this.recognition.onerror = reject;
            this.recognition.start();
        });
    }

    stopRecording() {
        this.recognition.stop();
    }
}

// Sistema de reportes guardados
class DraftReportSystem {
    static saveDraft(reportData) {
        const drafts = JSON.parse(localStorage.getItem('reportDrafts') || '[]');
        drafts.push({
            ...reportData,
            draftId: Date.now(),
            savedAt: new Date().toISOString()
        });
        localStorage.setItem('reportDrafts', JSON.stringify(drafts));
    }

    static getDrafts() {
        return JSON.parse(localStorage.getItem('reportDrafts') || '[]');
    }

    static deleteDraft(draftId) {
        const drafts = this.getDrafts().filter(draft => draft.draftId !== draftId);
        localStorage.setItem('reportDrafts', JSON.stringify(drafts));
    }
}

// Sistema de alertas compartidas
class SharedAlertsSystem {
    static async publishAlert(alert) {
        try {
            const response = await axios.post('/api/alerts', alert);
            return response.data;
        } catch (error) {
            console.error('Error al publicar alerta:', error);
            throw error;
        }
    }

    static async getNearbyAlerts(location, radius) {
        try {
            const response = await axios.get('/api/alerts/nearby', {
                params: { lat: location.lat, lng: location.lng, radius }
            });
            return response.data;
        } catch (error) {
            console.error('Error al obtener alertas cercanas:', error);
            throw error;
        }
    }
}

export {
    userTypeFeatures,
    FeedbackSystem,
    VoiceReportSystem,
    DraftReportSystem,
    SharedAlertsSystem
};

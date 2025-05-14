# 🚨 Sistema de Denuncias Ciudadanas con IA
# CivicAlert

## 📝 Descripción
Sistema web avanzado para la gestión de denuncias ciudadanas que permite reportar problemas urbanos como baches, utilizando inteligencia artificial para análisis automático de severidad y geolocalización precisa. El sistema utiliza YOLOv8 para detección de baches y GPT-4 para análisis de descripciones, junto con una arquitectura moderna desplegada en servicios cloud.

## 🛠️ Tecnologías Utilizadas
- **Frontend**:
  - Vite + JavaScript
  - Mapbox GL JS para mapas interactivos
  - Bootstrap 5 + CSS3
  - MediaDevices API para acceso a cámara
- **Backend**:
  - Node.js + Express.js
  - MongoDB para base de datos principal
  - Redis para caché
  - JWT para autenticación
- **IA y ML**:
  - YOLOv8 para detección de baches
  - GPT-4 para análisis de descripciones
  - FastAPI para servicios de IA
- **DevOps**:
  - Docker + Docker Compose
  - Netlify para frontend
  - Render para backend
  - GPU support para inferencia

## 📛 Estructura del Proyecto
```
proyecto/
├── frontend/          # Cliente web con Vite + JavaScript
│   ├── js/           # Lógica de la aplicación
│   ├── css/          # Estilos y temas
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
├── backend/           # API REST con Node.js
│   ├── routes/       # Rutas de la API
│   ├── middleware/   # Middlewares de autenticación
│   ├── models/       # Modelos de MongoDB
│   ├── config/       # Configuración
│   └── Dockerfile
├── ai-service/        # Servicio de IA con FastAPI
│   ├── main.py       # Análisis con YOLOv8 y GPT-4
│   ├── requirements.txt
│   └── Dockerfile
├── database/          # Esquemas de base de datos
│   ├── schema.mongodb.js  # Esquema MongoDB
│   └── schema.sql        # (Deprecated)
├── docker-compose.yml  # Orquestación de servicios
├── .env              # Variables de entorno
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose
- NVIDIA Container Toolkit (para GPU)
- Git

### Configuración
1. Clonar el repositorio:
```bash
git clone <url-repositorio>
cd proyecto
```

2. Configurar variables de entorno (.env):
```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/denuncias_db

# Server
PORT=3003
NODE_ENV=production

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# AI Service
AI_SERVICE_URL=http://ai-service:8000
```

3. Iniciar servicios:
```bash
docker-compose up --build
```

## 🌟 Características

### 📍 Mapas Interactivos
- Selección precisa de ubicación
- Geocodificación inversa
- Visualización de denuncias cercanas
- Clustering de marcadores

### 📸 Captura de Imágenes
- Acceso directo a cámara del dispositivo
- Captura en tiempo real
- Subida de imágenes existentes
- Previsualización instantánea

### 🤖 Análisis con IA
- Detección automática de baches
- Clasificación de severidad
- Análisis de descripciones
- Priorización inteligente

### 📱 Diseño Adaptativo
- Interfaz moderna y responsiva
- Optimizado para móviles
- Transiciones suaves
- Modo oscuro automático

## 🔑 Seguridad
- Autenticación JWT con rotación de tokens
- Rate limiting para prevenir ataques de fuerza bruta (100 peticiones/15min)
- Sanitización de entradas y validación de datos
- CORS configurado para dominios específicos
- Headers seguros con Helmet
- Encriptación bcrypt para contraseñas
- Variables de entorno seguras
- Validación de esquemas MongoDB

## 🌐 URLs de Despliegue

- Frontend: https://denuncias-ciudadanas.netlify.app
- Backend API: https://denuncias-api.onrender.com
- Servicio IA: https://denuncias-ai.huggingface.co

Nota: Asegúrate de que CORS_ORIGIN en el backend coincida con el dominio de Netlify.

## 📊 Monitoreo
- Logs centralizados
- Métricas de contenedores
- Alertas automáticas
- Análisis de rendimiento

## 🔄 Estado del Proyecto
- [x] Dockerización completa
- [x] Integración de Mapbox con geocodificación
- [x] Implementación de IA (YOLOv8 + GPT-4)
- [x] Sistema de cámara y procesamiento de imágenes
- [x] API REST con autenticación JWT
- [x] Caché con Redis
- [x] Despliegue en Netlify (Frontend)
- [x] Despliegue en Render (Backend)
- [x] Base de datos MongoDB Atlas
- [x] Servicio de IA en contenedor
- [ ] Tests E2E
- [ ] CI/CD Pipeline
- [ ] Escalado automático

## 📫 Soporte
Para reportar problemas o sugerir mejoras, por favor crear un issue en el repositorio.

# 🚨 Sistema de Denuncias Ciudadanas con IA

## 📝 Descripción
Sistema web avanzado para la gestión de denuncias ciudadanas que permite reportar problemas urbanos como baches, utilizando inteligencia artificial para análisis automático de severidad y geolocalización precisa.

## 🛠️ Tecnologías Utilizadas
- **Frontend**:
  - Vite + JavaScript
  - Mapbox GL JS para mapas interactivos
  - Bootstrap 5 + CSS3
  - MediaDevices API para acceso a cámara
- **Backend**:
  - Node.js + Express.js
  - MySQL para datos principales
  - Redis para caché
  - JWT para autenticación
- **IA y ML**:
  - YOLOv8 para detección de baches
  - GPT-4 para análisis de descripciones
  - FastAPI para servicios de IA
- **DevOps**:
  - Docker + Docker Compose
  - Nginx como proxy reverso
  - GPU support para inferencia

## 📁 Estructura del Proyecto
```
proyecto/
├── frontend/
│   ├── src/
│   │   ├── js/
│   │   └── css/
│   ├── index.html
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── Dockerfile
├── ai-service/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── database/
│   └── schema.sql
├── docker-compose.yml
├── .env
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

2. Configurar variables de entorno:
```env
# Database
DB_HOST=db
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=denuncias_db

# Server
PORT=3003
NODE_ENV=production

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRES_IN=24h

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
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

## 🔒 Seguridad
- Autenticación JWT
- Rate limiting
- Sanitización de entradas
- Validación de datos
- CORS configurado
- Headers seguros (Helmet)
- Encriptación bcrypt

## 📊 Monitoreo
- Logs centralizados
- Métricas de contenedores
- Alertas automáticas
- Análisis de rendimiento

## 🔄 Estado del Proyecto
- [x] Dockerización completa
- [x] Integración de Mapbox
- [x] Implementación de IA
- [x] Sistema de cámara
- [x] API REST
- [x] Caché con Redis
- [ ] Tests E2E
- [ ] CI/CD Pipeline
- [ ] Escalado automático

## 📫 Soporte
Para reportar problemas o sugerir mejoras, por favor crear un issue en el repositorio.

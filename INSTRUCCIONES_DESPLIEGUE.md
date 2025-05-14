# Instrucciones de Despliegue

## Prerrequisitos
1. Cuenta en GitHub
2. Cuenta en Netlify (para el frontend)
3. Cuenta en Render (para el backend)
4. Cuenta en MongoDB Atlas (para la base de datos)

## Paso 1: Preparar el Repositorio

1. Inicializar Git en el proyecto:
```bash
git init
git add .
git commit -m "Versión inicial del proyecto"
```

2. Crear un nuevo repositorio en GitHub:
   - Ve a github.com
   - Haz clic en "New repository"
   - Nombra tu repositorio "sistema-denuncias"
   - No inicialices el repositorio con README

3. Conectar y subir el repositorio:
```bash
git remote add origin https://github.com/TU_USUARIO/sistema-denuncias.git
git branch -M main
git push -u origin main
```

## Paso 2: Desplegar el Frontend (Netlify)

1. Ir a [Netlify](https://www.netlify.com/)
2. Iniciar sesión o registrarse
3. Clic en "New site from Git"
4. Seleccionar GitHub como proveedor
5. Seleccionar el repositorio "sistema-denuncias"
6. Configurar:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Base directory: `frontend`

7. Configurar variables de entorno en Netlify:
   - VITE_API_URL: URL del backend (se obtiene después)
   - VITE_MAPBOX_TOKEN: Tu token de Mapbox

## Paso 3: Desplegar el Backend (Render)

1. Ir a [Render](https://render.com/)
2. Iniciar sesión o registrarse
3. Clic en "New Web Service"
4. Conectar con GitHub y seleccionar el repositorio
5. Configurar:
   - Name: sistema-denuncias-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Directory: `backend`

6. Configurar variables de entorno:
   - DB_HOST: URL de MongoDB Atlas
   - DB_USER: Usuario de la base de datos
   - DB_PASSWORD: Contraseña de la base de datos
   - JWT_SECRET: Clave secreta para JWT
   - NODE_ENV: production

## Paso 4: Configurar la Base de Datos

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. Configurar usuario y contraseña
4. Obtener la URL de conexión
5. Importar el esquema de la base de datos:
   - Usar MongoDB Compass para importar
   - O ejecutar los scripts de migración

## Paso 5: Configuración Final

1. Actualizar la URL del backend en Netlify:
   - Ir a la configuración del sitio en Netlify
   - Agregar la URL del backend de Render como variable de entorno

2. Verificar CORS en el backend:
   - Asegurarse de que el dominio de Netlify esté permitido

3. Probar la aplicación:
   - Verificar registro de usuarios
   - Probar creación de denuncias
   - Validar carga de imágenes
   - Comprobar geolocalización

## Notas Importantes

- Guarda todas las credenciales de manera segura
- No compartas las variables de entorno
- Haz copias de seguridad regulares de la base de datos
- Monitorea el uso de recursos gratuitos

## Solución de Problemas

1. Si el frontend no conecta con el backend:
   - Verificar las variables de entorno
   - Comprobar la configuración de CORS

2. Si las imágenes no se cargan:
   - Verificar permisos de almacenamiento
   - Comprobar límites de tamaño de archivo

3. Si el mapa no funciona:
   - Verificar el token de Mapbox
   - Comprobar restricciones de dominio

## Mantenimiento

1. Monitorear logs en:
   - Netlify: Sección "Deploys"
   - Render: Sección "Logs"
   - MongoDB Atlas: Sección "Metrics"

2. Actualizar dependencias regularmente:
```bash
npm audit
npm update
```

3. Hacer copias de seguridad semanales de la base de datos

## Recursos Útiles

- [Documentación de Netlify](https://docs.netlify.com/)
- [Documentación de Render](https://render.com/docs)
- [Documentación de MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Guía de despliegue de Node.js](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)

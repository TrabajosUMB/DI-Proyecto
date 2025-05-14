import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import axios from 'axios';

// Configuración de endpoints
const API_URL = import.meta.env.VITE_API_URL || '';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || '';

// Configuración de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Estado global
let currentPosition = null;
let map = null;
let mediaStream = null;

// Inicialización del mapa
function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.0060, 40.7128], // Se actualizará con la ubicación del usuario
        zoom: 12
    });

    // Agregar controles
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    // Agregar geocoder
    const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: true
    });
    map.addControl(geocoder);

    // Evento de clic en el mapa
    map.on('click', (e) => {
        currentPosition = e.lngLat;
        updateMarker();
    });
}

// Marcador en el mapa
let marker = null;
function updateMarker() {
    if (marker) marker.remove();
    marker = new mapboxgl.Marker()
        .setLngLat(currentPosition)
        .addTo(map);
}

// Manejo de la cámara
const cameraPreview = document.getElementById('cameraPreview');
const photoCanvas = document.getElementById('photoCanvas');
const photoPreview = document.getElementById('photoPreview');

async function initCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        cameraPreview.srcObject = mediaStream;
        cameraPreview.classList.remove('d-none');
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
}

function takePhoto() {
    const context = photoCanvas.getContext('2d');
    photoCanvas.width = cameraPreview.videoWidth;
    photoCanvas.height = cameraPreview.videoHeight;
    context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);
    
    const photoData = photoCanvas.toDataURL('image/jpeg');
    photoPreview.src = photoData;
    photoPreview.classList.remove('d-none');
    
    // Detener la cámara
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    cameraPreview.classList.add('d-none');
}

// Event Listeners
document.getElementById('openCamera').addEventListener('click', initCamera);
document.getElementById('uploadPhoto').addEventListener('click', () => {
    document.getElementById('photoInput').click();
});

document.getElementById('photoInput').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            photoPreview.src = e.target.result;
            photoPreview.classList.remove('d-none');
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

document.getElementById('newReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentPosition) {
        alert('Por favor, selecciona una ubicación en el mapa');
        return;
    }

    const formData = new FormData();
    formData.append('location', JSON.stringify(currentPosition));
    formData.append('description', document.getElementById('description').value);
    
    // Convertir canvas a blob
    if (!photoPreview.classList.contains('d-none')) {
        const response = await fetch(photoPreview.src);
        const blob = await response.blob();
        formData.append('photo', blob, 'photo.jpg');
    }

    try {
        const response = await axios.post(`${API_URL}/api/reports`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        // Analizar la imagen con IA
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze/pothole`, formData);
        
        alert('Denuncia enviada con éxito');
        window.location.reload();
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('Error al enviar la denuncia. Por favor, intenta nuevamente.');
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

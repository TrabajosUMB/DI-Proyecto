const denuncias = {
    map: null,
    marker: null,
    selectedLocation: null,
    photoFile: null,

    init() {
        // Inicializar el mapa
        this.initMap();
        
        // Event listeners
        document.getElementById('obtenerUbicacion').addEventListener('click', () => this.getCurrentLocation());
        document.getElementById('tomarFoto').addEventListener('click', () => this.takePicture());
        
        const form = document.getElementById('denunciaForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },

    initMap() {
        // Inicializar el mapa centrado en Colombia
        this.map = L.map('map').setView([4.6097, -74.0817], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Permitir seleccionar ubicación en el mapa
        this.map.on('click', (e) => {
            this.setLocation(e.latlng.lat, e.latlng.lng);
        });
    },

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.setLocation(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('No se pudo obtener la ubicación. Por favor, seleccione manualmente en el mapa.');
                }
            );
        } else {
            alert('Geolocalización no está soportada en este navegador.');
        }
    },

    setLocation(lat, lng) {
        this.selectedLocation = { lat, lng };
        
        // Actualizar marcador en el mapa
        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng]).addTo(this.map);
        }
        
        this.map.setView([lat, lng], 15);
    },

    async takePicture() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.photoFile = file;
                const preview = document.getElementById('previewFoto');
                preview.src = URL.createObjectURL(file);
                preview.classList.remove('d-none');
            }
        };
        
        input.click();
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!auth.isAuthenticated()) {
            alert('Debe iniciar sesión para crear una denuncia');
            window.location.href = '/login';
            return;
        }

        if (!this.selectedLocation) {
            alert('Por favor seleccione una ubicación en el mapa');
            return;
        }

        const form = e.target;
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData();
        formData.append('tipo', document.getElementById('tipo').value);
        formData.append('descripcion', document.getElementById('descripcion').value);
        formData.append('latitud', this.selectedLocation.lat);
        formData.append('longitud', this.selectedLocation.lng);
        if (this.photoFile) {
            formData.append('imagen', this.photoFile);
        }

        try {
            const response = await fetch('/api/denuncias', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert('Denuncia creada exitosamente');
                window.location.reload();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error al crear denuncia:', error);
            alert('Error al crear la denuncia: ' + error.message);
        }
    }
};

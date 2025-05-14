const auth = {
    token: null,
    user: null,

    init() {
        // Verificar si hay un token guardado
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.updateUI();
    },

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.updateUI();
                window.location.href = '/';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            throw error;
        }
    },

    async register(nombre, email, password) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                this.updateUI();
                window.location.href = '/';
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            throw error;
        }
    },

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateUI();
        window.location.href = '/login';
    },

    updateUI() {
        const isAuthenticated = !!this.token;
        const loginItems = document.querySelectorAll('.nav-item:not(#logoutItem)');
        const logoutItem = document.getElementById('logoutItem');
        const denunciaForm = document.getElementById('denunciaForm');

        if (isAuthenticated) {
            loginItems.forEach(item => item.classList.add('d-none'));
            logoutItem.classList.remove('d-none');
            if (denunciaForm) denunciaForm.classList.remove('d-none');
        } else {
            loginItems.forEach(item => item.classList.remove('d-none'));
            logoutItem.classList.add('d-none');
            if (denunciaForm) denunciaForm.classList.add('d-none');
        }
    },

    getToken() {
        return this.token;
    },

    isAuthenticated() {
        return !!this.token;
    }
};

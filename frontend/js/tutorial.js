class TutorialGuide {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: "Bienvenido a CivicAlert",
                content: "Vamos a aprender cómo reportar problemas en su ciudad de manera fácil y rápida.",
                element: "#welcome-screen"
            },
            {
                title: "Seleccione su tipo de usuario",
                content: "Escoja cómo se transporta: a pie, en carro, en moto o en transporte público.",
                element: "#user-type-selection"
            },
            {
                title: "Reporte un problema",
                content: "Pulse el botón grande azul para comenzar a reportar un problema.",
                element: "#report-button"
            },
            {
                title: "Tome una foto",
                content: "Pulse el botón de la cámara para tomar una foto del problema. También puede usar su voz.",
                element: "#camera-button"
            },
            {
                title: "Describa el problema",
                content: "Cuéntenos qué está mal. Puede escribir o usar su voz para describir el problema.",
                element: "#description-input"
            }
        ];
    }

    start() {
        this.showStep(0);
        this.addAssistanceButton();
    }

    showStep(index) {
        if (index >= this.steps.length) {
            this.finish();
            return;
        }

        const step = this.steps[index];
        const element = document.querySelector(step.element);
        
        if (!element) return;

        // Crear el tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tutorial-tooltip';
        tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
            <div class="tutorial-controls">
                ${index > 0 ? '<button class="btn-prev">Anterior</button>' : ''}
                <button class="btn-next">${index === this.steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
            </div>
        `;

        // Posicionar el tooltip
        this.positionTooltip(tooltip, element);

        // Agregar eventos
        const nextBtn = tooltip.querySelector('.btn-next');
        nextBtn.addEventListener('click', () => this.showStep(index + 1));

        const prevBtn = tooltip.querySelector('.btn-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.showStep(index - 1));
        }

        // Resaltar el elemento actual
        element.classList.add('tutorial-highlight');
    }

    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${rect.bottom + scrollTop + 10}px`;
        tooltip.style.left = `${rect.left}px`;
        
        document.body.appendChild(tooltip);
    }

    finish() {
        // Guardar en localStorage que el usuario completó el tutorial
        localStorage.setItem('tutorialCompleted', 'true');
        
        // Mostrar mensaje de felicitación
        const congratsMessage = document.createElement('div');
        congratsMessage.className = 'alert alert-success';
        congratsMessage.innerHTML = `
            <h3>¡Felicitaciones!</h3>
            <p>Ya sabe cómo usar CivicAlert. Recuerde que puede ver este tutorial nuevamente
            pulsando el botón de ayuda en la esquina inferior derecha.</p>
            <button class="btn btn-primary">Entendido</button>
        `;
        
        document.body.appendChild(congratsMessage);
        
        // Remover el mensaje después de que el usuario pulse "Entendido"
        const okButton = congratsMessage.querySelector('button');
        okButton.addEventListener('click', () => {
            congratsMessage.remove();
        });
    }

    addAssistanceButton() {
        const assistButton = document.createElement('button');
        assistButton.className = 'assistance-mode';
        assistButton.innerHTML = '?';
        assistButton.title = 'Necesito ayuda';
        
        assistButton.addEventListener('click', () => {
            // Mostrar menú de ayuda
            const helpMenu = document.createElement('div');
            helpMenu.className = 'help-menu card';
            helpMenu.innerHTML = `
                <h3>¿Qué necesita?</h3>
                <button class="nav-button" data-action="tutorial">Ver tutorial nuevamente</button>
                <button class="nav-button" data-action="text-size">Aumentar tamaño del texto</button>
                <button class="nav-button" data-action="contrast">Aumentar contraste</button>
                <button class="nav-button" data-action="voice">Activar comandos por voz</button>
            `;
            
            document.body.appendChild(helpMenu);
            
            // Manejar acciones del menú de ayuda
            helpMenu.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'tutorial') {
                    helpMenu.remove();
                    this.start();
                } else if (action === 'text-size') {
                    document.body.style.fontSize = 
                        parseFloat(getComputedStyle(document.body).fontSize) * 1.2 + 'px';
                } else if (action === 'contrast') {
                    document.body.classList.toggle('high-contrast');
                } else if (action === 'voice') {
                    this.startVoiceCommands();
                }
            });
        });
        
        document.body.appendChild(assistButton);
    }

    startVoiceCommands() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.lang = 'es-CO';
            
            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                
                if (command.includes('reportar')) {
                    document.querySelector('#report-button').click();
                } else if (command.includes('ayuda')) {
                    this.start();
                } else if (command.includes('más grande')) {
                    document.body.style.fontSize = 
                        parseFloat(getComputedStyle(document.body).fontSize) * 1.2 + 'px';
                }
            };
            
            recognition.start();
        }
    }
}

// Exportar la clase
export default TutorialGuide;

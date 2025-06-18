class IntegrationProgressModal {
    constructor() {
        this.modal = null;
        this.createModal();
    }

    createModal() {
        if (this.modal) {
            this.modal.remove();
        }

        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[9999]';
        this.modal.style.display = 'none';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.innerHTML = `
            <div class="relative bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <h3 class="text-lg font-medium text-gray-900 mt-4">Intégration en cours...</h3>
                    <p class="text-sm text-gray-500 mt-2" id="integration-status">Initialisation...</p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2" id="integration-percent">0%</p>
                    <p class="text-sm text-gray-500 mt-2" id="integration-elapsed"></p>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    async show() {
        if (!this.modal) {
            this.createModal();
        }
        this.modal.style.display = 'flex';
        this.modal.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    async hide() {
        if (this.modal) {
            this.modal.style.opacity = '0';
            this.modal.style.transition = 'opacity 0.3s ease-out';
            
            await new Promise(resolve => setTimeout(resolve, 300));
            this.modal.style.display = 'none';
            this.modal.style.opacity = '1';
        }
    }

    updateProgress(message, progress, elapsedFormatted) {
        if (!this.modal) return;

        requestAnimationFrame(() => {
            const statusElement = this.modal.querySelector('#integration-status');
            const progressBar = this.modal.querySelector('.bg-blue-600');
            const percentElement = this.modal.querySelector('#integration-percent');
            const elapsedElement = this.modal.querySelector('#integration-elapsed');

            if (statusElement) statusElement.textContent = message;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
                if (progress === 100) {
                    progressBar.classList.add('bg-green-600');
                    progressBar.classList.remove('bg-blue-600');
                }
            }
            if (percentElement) percentElement.textContent = `${progress}%`;
            if (elapsedElement) elapsedElement.textContent = elapsedFormatted ? `Temps écoulé : ${elapsedFormatted}` : '';
        });
    }
}

// Export global
window.IntegrationProgressModal = IntegrationProgressModal; 
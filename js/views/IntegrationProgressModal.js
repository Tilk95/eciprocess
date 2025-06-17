class IntegrationProgressModal {
    constructor() {
        this.modal = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[9999]';
        this.modal.style.display = 'none';
        this.modal.innerHTML = `
            <div class="relative bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <h3 class="text-lg font-medium text-gray-900 mt-4">Intégration en cours...</h3>
                    <p class="text-sm text-gray-500 mt-2" id="integration-status">Initialisation...</p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2" id="integration-percent">0%</p>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    show() {
        if (!this.modal) {
            this.createModal();
        }
        this.modal.style.display = 'flex';
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    updateProgress(message, progress) {
        if (!this.modal) return;

        const statusElement = this.modal.querySelector('#integration-status');
        const progressBar = this.modal.querySelector('.bg-blue-600');
        const percentElement = this.modal.querySelector('#integration-percent');

        if (statusElement) statusElement.textContent = message;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentElement) percentElement.textContent = `${progress}%`;
    }
}

// Export global
window.IntegrationProgressModal = IntegrationProgressModal; 
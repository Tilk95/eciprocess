class ECITableView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.table = null;
        this.articles = [];
        this.filteredArticles = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 0;
        this.progressModal = null;
        this.toastTimeout = null;
        this.currentFilter = null;
        this.lastVisibleIndex = 0;
        
        // Options de pagination
        this.pageSizeOptions = [10, 25, 50, 100];
        
        // Configuration des colonnes
        this.columns = [
            { id: 'typeArticle', label: 'Type Article', visible: false },
            { id: 'marche', label: 'Marché', visible: true },
            { id: 'dateDepart', label: 'Date Départ', visible: true, format: 'date' },
            { id: 'heureDepart', label: 'Heure Départ', visible: true, format: 'time' },
            { id: 'cleAppariement', label: 'Clé Appariement', visible: false },
            { id: 'guidECI', label: 'GUID ECI', visible: true, format: 'guid' },
            { id: 'dateHeureValidite', label: 'Date Validité', visible: true, format: 'datetime' },
            { id: 'nature', label: 'Nature', visible: true },
            { id: 'typeECI', label: 'Type ECI', visible: true },
            { id: 'guidPH', label: 'GUID PH', visible: false, format: 'guid' },
            { id: 'guidPCT', label: 'GUID PCT', visible: false, format: 'guid' },
            { id: 'famille', label: 'Famille', visible: true },
            { id: 'guidECIASupprimer', label: 'GUID ECI à Supprimer', visible: true, format: 'guid' },
            { id: 'serviceAnnuel', label: 'Service Annuel', visible: true },
            { id: 'empreinte_circulation', label: 'Empreinte Circulation', visible: true, format: 'guid' }
        ];

        // Couleurs pour les groupes
        this.groupColors = [
            'bg-blue-200',
            'bg-green-200',
            'bg-yellow-200',
            'bg-purple-200',
            'bg-pink-200',
            'bg-indigo-200',
            'bg-red-200',
            'bg-gray-200'
        ];
    }

    showProgressModal() {
        if (!this.progressModal) {
            this.progressModal = document.createElement('div');
            this.progressModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center';
            this.progressModal.innerHTML = `
                <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <h3 class="text-lg font-medium text-gray-900 mt-4">Chargement en cours...</h3>
                        <p class="text-sm text-gray-500 mt-2">Veuillez patienter pendant le traitement du fichier.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(this.progressModal);
        }
    }

    hideProgressModal() {
        if (this.progressModal) {
            this.progressModal.remove();
            this.progressModal = null;
        }
    }

    setArticles(articles) {
        this.showProgressModal();
        
        // Utiliser setTimeout pour permettre l'affichage de la modale
        setTimeout(() => {
            // Trier les articles
            this.articles = articles.sort((a, b) => {
                // Trier par marché
                if (a.marche !== b.marche) {
                    return a.marche.localeCompare(b.marche);
                }
                // Puis par date de départ
                if (a.dateDepart !== b.dateDepart) {
                    return a.dateDepart.localeCompare(b.dateDepart);
                }
                // Puis par date de début de validité
                if (a.dateDebutValidite !== b.dateDebutValidite) {
                    return a.dateDebutValidite.localeCompare(b.dateDebutValidite);
                }
                // Enfin par nature
                return a.nature.localeCompare(b.nature);
            });
            
            this.filteredArticles = [...this.articles];
            this.currentPage = 1;
            this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
            this.render();
            
            this.hideProgressModal();
        }, 0);
    }

    toggleMarcheFilter(marche) {
        // Sauvegarder l'index de l'élément actuellement visible
        const currentIndex = (this.currentPage - 1) * this.itemsPerPage;
        const visibleArticle = this.filteredArticles[currentIndex];
        
        if (this.currentFilter === marche) {
            // Désactiver le filtre
            this.currentFilter = null;
            this.filteredArticles = [...this.articles];
        } else {
            // Activer le filtre
            this.currentFilter = marche;
            this.filteredArticles = this.articles.filter(article => article.marche === marche);
        }

        // Recalculer le nombre total de pages
        this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);

        // Trouver la nouvelle position de l'élément précédemment visible
        if (visibleArticle) {
            const newIndex = this.filteredArticles.findIndex(article => 
                article.marche === visibleArticle.marche &&
                article.dateDepart === visibleArticle.dateDepart &&
                article.nature === visibleArticle.nature &&
                article.dateDebutValidite === visibleArticle.dateDebutValidite
            );
            
            if (newIndex !== -1) {
                this.currentPage = Math.floor(newIndex / this.itemsPerPage) + 1;
            } else {
                this.currentPage = 1;
            }
        } else {
            this.currentPage = 1;
        }

        this.render();
    }

    createColumnConfigButton() {
        const button = document.createElement('button');
        button.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors';
        button.innerHTML = `
            <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            Configurer les colonnes
        `;
        
        button.addEventListener('click', () => this.showColumnConfigModal());
        return button;
    }

    showColumnConfigModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto';
        
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Configuration des colonnes</h3>
                <button class="text-gray-400 hover:text-gray-500">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-2">
                ${this.columns.map(column => `
                    <div class="flex items-center">
                        <input type="checkbox" id="${column.id}" 
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                               ${column.visible ? 'checked' : ''}>
                        <label for="${column.id}" class="ml-2 block text-sm text-gray-900">
                            ${column.label}
                        </label>
                    </div>
                `).join('')}
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                    Annuler
                </button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                    Appliquer
                </button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Gestionnaire pour le bouton de fermeture
        const closeButton = modalContent.querySelector('button');
        closeButton.addEventListener('click', () => modal.remove());

        // Gestionnaire pour le bouton Annuler
        const cancelButton = modalContent.querySelector('button:nth-of-type(1)');
        cancelButton.addEventListener('click', () => modal.remove());

        // Gestionnaire pour le bouton Appliquer
        const applyButton = modalContent.querySelector('button:nth-of-type(2)');
        applyButton.addEventListener('click', () => {
            this.columns.forEach(column => {
                const checkbox = modalContent.querySelector(`#${column.id}`);
                column.visible = checkbox.checked;
            });
            modal.remove();
            this.render();
        });
    }

    createTable() {
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        
        // Utiliser la méthode createTableHeader pour afficher les indicateurs de tri
        const thead = this.createTableHeader();
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        table.appendChild(tbody);

        return table;
    }

    formatGuid(guid) {
        if (!guid || guid === 'Non trouvée' || guid === 'Non applicable') {
            return guid;
        }
        // Supprimer les tirets si présents
        guid = guid.replace(/-/g, '');
        if (guid.length < 8) {
            return guid;
        }
        return `${guid.substring(0, 4)}....${guid.substring(guid.length - 4)}`;
    }

    showToast(message) {
        // Supprimer le toast existant s'il y en a un
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        // Créer le nouveau toast
        const toast = document.createElement('div');
        toast.className = 'toast-message fixed bottom-20 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Supprimer le toast après 2 secondes
        this.toastTimeout = setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(`Copié : ${text}`);
        }).catch(err => {
            console.error('Erreur lors de la copie :', err);
            this.showToast('Erreur lors de la copie');
        });
    }

    getGroupKey(article) {
        return `${article.marche}_${article.dateDepart}`;
    }

    formatDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
    }

    formatTime(timeStr) {
        if (!timeStr || timeStr.length !== 6) return timeStr;
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
    }

    formatDateTime(dateTimeStr) {
        if (!dateTimeStr || dateTimeStr.length !== 14) return dateTimeStr;
        const date = this.formatDate(dateTimeStr.substring(0, 8));
        const time = this.formatTime(dateTimeStr.substring(8, 14));
        return `${date} ${time}`;
    }

    createTableRow(article, groupIndex) {
        const tr = document.createElement('tr');
        // Appliquer la couleur de groupe et le survol
        tr.className = `${this.groupColors[groupIndex % this.groupColors.length]} hover:bg-gray-100 transition-colors duration-150`;
        
        const cellValues = {
            typeArticle: article.typeArticle,
            marche: article.marche,
            dateDepart: article.dateDepart,
            heureDepart: article.heureDepart,
            cleAppariement: article.cleAppariement,
            guidECI: article.guidECI,
            dateHeureValidite: article.dateHeureValidite,
            nature: article.nature,
            typeECI: article.typeECI,
            guidPH: article.guidPH,
            guidPCT: article.guidPCT,
            famille: article.famille,
            guidECIASupprimer: article.guidECIASupprimer,
            serviceAnnuel: article.serviceAnnuel,
            empreinte_circulation: article.empreinte_circulation
        };

        // Colonnes à centrer
        const centeredColumns = [
            'dateDepart', 'heureDepart', 'nature', 'typeECI', 'famille', 'serviceAnnuel'
        ];

        this.columns.forEach(column => {
            if (column.visible) {
                const td = document.createElement('td');
                // Style de base pour toutes les cellules
                td.className = 'px-4 py-1 whitespace-nowrap text-sm text-gray-500 select-none';
                if (centeredColumns.includes(column.id)) {
                    td.className += ' text-center';
                }
                
                // Formater la valeur si nécessaire
                let displayValue = cellValues[column.id];
                if (column.format === 'guid') {
                    displayValue = this.formatGuid(displayValue);
                } else if (column.format === 'date') {
                    displayValue = this.formatDate(displayValue);
                } else if (column.format === 'time') {
                    displayValue = this.formatTime(displayValue);
                } else if (column.format === 'datetime') {
                    displayValue = this.formatDateTime(displayValue);
                }
                
                td.textContent = displayValue;
                
                // Ajouter les fonctionnalités pour les GUIDs et le marché
                if (column.format === 'guid' && cellValues[column.id]) {
                    td.title = `Cliquer pour copier : ${cellValues[column.id]}`;
                    td.className += ' cursor-pointer hover:text-blue-600';
                    td.addEventListener('click', () => {
                        this.copyToClipboard(cellValues[column.id]);
                    });
                } else if (column.id === 'marche') {
                    td.className += ' cursor-pointer hover:text-blue-600';
                    if (this.currentFilter === cellValues.marche) {
                        td.className += ' text-blue-600 font-medium';
                    }
                    td.addEventListener('click', () => {
                        this.toggleMarcheFilter(cellValues.marche);
                    });
                } else {
                    // Pour les cellules non-cliquables, on s'assure que le curseur reste en forme de flèche
                    td.className += ' cursor-default';
                }
                
                tr.appendChild(td);
            }
        });

        return tr;
    }

    createPagination() {
        const pagination = document.createElement('div');
        pagination.className = 'flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6';

        // Informations sur la pagination
        const info = document.createElement('div');
        info.className = 'flex-1 flex justify-between sm:hidden';
        info.innerHTML = `
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                Précédent
            </button>
            <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                Suivant
            </button>
        `;
        pagination.appendChild(info);

        // Pagination desktop
        const desktopPagination = document.createElement('div');
        desktopPagination.className = 'hidden sm:flex-1 sm:flex sm:items-center sm:justify-between';
        
        // Sélecteur de nombre d'éléments par page
        const pageSizeSelector = document.createElement('div');
        pageSizeSelector.className = 'flex items-center mr-4';
        pageSizeSelector.innerHTML = `
            <label for="pageSize" class="text-sm text-gray-700 mr-2">Afficher</label>
            <select id="pageSize" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                ${this.pageSizeOptions.map(size => `
                    <option value="${size}" ${size === this.itemsPerPage ? 'selected' : ''}>${size}</option>
                `).join('')}
            </select>
            <span class="text-sm text-gray-700 ml-2">éléments</span>
        `;
        desktopPagination.appendChild(pageSizeSelector);

        // Informations sur la pagination
        const paginationInfo = document.createElement('div');
        paginationInfo.innerHTML = `
            <p class="text-sm text-gray-700">
                Affichage de <span class="font-medium">${(this.currentPage - 1) * this.itemsPerPage + 1}</span> à 
                <span class="font-medium">${Math.min(this.currentPage * this.itemsPerPage, this.articles.length)}</span> sur 
                <span class="font-medium">${this.articles.length}</span> résultats
            </p>
        `;
        desktopPagination.appendChild(paginationInfo);

        // Navigation
        const navigation = document.createElement('div');
        navigation.innerHTML = `
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                ${this.createPaginationButtons()}
            </nav>
        `;
        desktopPagination.appendChild(navigation);

        pagination.appendChild(desktopPagination);

        // Ajouter l'écouteur d'événements pour le changement de nombre d'éléments par page
        const pageSizeSelect = pagination.querySelector('#pageSize');
        pageSizeSelect.addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1; // Retour à la première page
            this.totalPages = Math.ceil(this.articles.length / this.itemsPerPage);
            this.render();
        });

        return pagination;
    }

    createPaginationButtons() {
        const buttons = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Bouton précédent
        buttons.push(`
            <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <span class="sr-only">Précédent</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
        `);

        // Pages
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(`
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium 
                    ${i === this.currentPage ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}">
                    ${i}
                </button>
            `);
        }

        // Bouton suivant
        buttons.push(`
            <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <span class="sr-only">Suivant</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
        `);

        return buttons.join('');
    }

    getCurrentPageItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredArticles.slice(start, end);
    }

    render() {
        this.container.innerHTML = '';

        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'overflow-x-auto';
        this.container.appendChild(scrollContainer);

        // Pagination en haut (à l'intérieur du scrollContainer)
        if (this.articles.length > 0) {
            const paginationTop = this.createPagination();
            scrollContainer.appendChild(paginationTop);
            // Ajouter les écouteurs d'événements pour la pagination du haut
            const buttonsTop = paginationTop.querySelectorAll('button');
            buttonsTop.forEach(button => {
                button.addEventListener('click', () => {
                    if (button.textContent.includes('Précédent') && this.currentPage > 1) {
                        this.currentPage--;
                        this.render();
                    } else if (button.textContent.includes('Suivant') && this.currentPage < this.totalPages) {
                        this.currentPage++;
                        this.render();
                    } else if (!isNaN(parseInt(button.textContent))) {
                        this.currentPage = parseInt(button.textContent);
                        this.render();
                    }
                });
            });
        }

        this.table = this.createTable();
        scrollContainer.appendChild(this.table);

        const tbody = this.table.querySelector('tbody');
        const currentPageItems = this.getCurrentPageItems();
        
        // Créer un Map pour stocker les indices de groupe
        const groupMap = new Map();
        let groupIndex = 0;

        currentPageItems.forEach(article => {
            const groupKey = this.getGroupKey(article);
            if (!groupMap.has(groupKey)) {
                groupMap.set(groupKey, groupIndex++);
            }
            const rowGroupIndex = groupMap.get(groupKey);
            tbody.appendChild(this.createTableRow(article, rowGroupIndex));
        });

        // Pagination en bas (en dehors du scrollContainer)
        if (this.articles.length > 0) {
            const pagination = this.createPagination();
            this.container.appendChild(pagination);

            // Ajouter les écouteurs d'événements pour la pagination du bas
            const buttons = pagination.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    if (button.textContent.includes('Précédent') && this.currentPage > 1) {
                        this.currentPage--;
                        this.render();
                    } else if (button.textContent.includes('Suivant') && this.currentPage < this.totalPages) {
                        this.currentPage++;
                        this.render();
                    } else if (!isNaN(parseInt(button.textContent))) {
                        this.currentPage = parseInt(button.textContent);
                        this.render();
                    }
                });
            });
        }

        // Ajouter le bouton de configuration des colonnes
        const configButton = this.createColumnConfigButton();
        this.container.appendChild(configButton);
    }

    createTableHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        this.columns.forEach(column => {
            if (column.visible) {
                const th = document.createElement('th');
                th.className = 'px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-white z-10 border-b';
                let label = column.label;
                // Ajouter l'indicateur d'ordre de tri dans une bulle bleue en exposant
                let sortNumber = '';
                if (column.id === 'marche') sortNumber = '1';
                else if (column.id === 'dateDepart') sortNumber = '2';
                else if (column.id === 'dateDebutValidite') sortNumber = '3';
                else if (column.id === 'nature') sortNumber = '4';
                if (sortNumber) {
                    label += ` <sup class=\"align-super\"><span class=\"inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs font-bold\">${sortNumber}</span></sup>`;
                }
                th.innerHTML = label;
                headerRow.appendChild(th);
            }
        });
        thead.appendChild(headerRow);
        return thead;
    }

    updateTable(articles) {
        if (!Array.isArray(articles)) {
            console.error('Articles doit être un tableau');
            return;
        }

        this.articles = articles.map(eci => {
            if (!eci?.a1) {
                console.error('Structure ECI invalide:', eci);
                return null;
            }

            const a1 = eci.a1;
            return {
                ...a1,
                empreinte: eci.ae ? eci.ae.empreinte : null
            };
        }).filter(article => article !== null);

        this.filteredArticles = [...this.articles];
        this.currentPage = 1;
        this.renderTable();
    }
} 
class ECITableView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.table = null;
        this.articles = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.totalPages = 0;
    }

    setArticles(articles) {
        this.articles = articles;
        this.currentPage = 1;
        this.totalPages = Math.ceil(articles.length / this.itemsPerPage);
        this.render();
    }

    createTable() {
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        
        // En-tête du tableau
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50';
        thead.innerHTML = `
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Article</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marché</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Départ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure Départ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clé Appariement</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GUID ECI</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début Validité</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nature</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type ECI</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GUID PH</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GUID PCT</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Famille</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GUID ECI à Supprimer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Annuel</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empreinte Circulation</th>
            </tr>
        `;
        table.appendChild(thead);

        // Corps du tableau
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        table.appendChild(tbody);

        return table;
    }

    createTableRow(article) {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        
        const cells = [
            article.typeArticle,
            article.marche,
            article.dateDepart,
            article.heureDepart,
            article.cleAppariement,
            article.guidECI,
            article.dateDebutValidite,
            article.nature,
            article.typeECI,
            article.guidPH,
            article.guidPCT,
            article.famille,
            article.guidECIASupprimer,
            article.serviceAnnuel,
            article.typeECI === 'P' ? (article.empreinte_circulation || 'Non trouvée') : 'Non applicable'
        ];

        cells.forEach(cell => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            td.textContent = cell;
            tr.appendChild(td);
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
        desktopPagination.innerHTML = `
            <div>
                <p class="text-sm text-gray-700">
                    Affichage de <span class="font-medium">${(this.currentPage - 1) * this.itemsPerPage + 1}</span> à 
                    <span class="font-medium">${Math.min(this.currentPage * this.itemsPerPage, this.articles.length)}</span> sur 
                    <span class="font-medium">${this.articles.length}</span> résultats
                </p>
            </div>
            <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    ${this.createPaginationButtons()}
                </nav>
            </div>
        `;
        pagination.appendChild(desktopPagination);

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
        return this.articles.slice(start, end);
    }

    render() {
        // Nettoyer le conteneur
        this.container.innerHTML = '';

        // Créer le conteneur de défilement
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'overflow-x-auto';
        this.container.appendChild(scrollContainer);

        // Créer et ajouter le tableau
        this.table = this.createTable();
        scrollContainer.appendChild(this.table);

        // Ajouter les lignes
        const tbody = this.table.querySelector('tbody');
        const currentPageItems = this.getCurrentPageItems();
        currentPageItems.forEach(article => {
            tbody.appendChild(this.createTableRow(article));
        });

        if (this.articles.length > 0) {
            const pagination = this.createPagination();
            this.container.appendChild(pagination);

            // Ajouter les écouteurs d'événements pour la pagination
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
    }
} 
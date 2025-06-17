(function(global) {
    function renderTable(rows, currentPage = 1, itemsPerPage = 25) {
        if (!rows || rows.length === 0) {
            return '<div class="text-gray-400 italic">Aucune donnée</div>';
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageRows = rows.slice(start, end);
        const totalPages = Math.ceil(rows.length / itemsPerPage);

        const headers = Object.keys(rows[0]);
        let html = `
            <div class="px-6 py-4 space-y-4 h-full flex flex-col">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-700">
                        Affichage de ${start + 1} à ${Math.min(end, rows.length)} sur ${rows.length} enregistrements
                    </div>
                    <div class="flex items-center space-x-2">
                        <select class="items-per-page px-3 py-1 border rounded text-sm">
                            ${[25, 50, 100, 250].map(n => 
                                `<option value="${n}" ${n === itemsPerPage ? 'selected' : ''}>${n} par page</option>`
                            ).join('')}
                        </select>
                        <div class="flex space-x-2">
                            <button class="prev-page px-3 py-1 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}" 
                                    ${currentPage === 1 ? 'disabled' : ''}>
                                Précédent
                            </button>
                            <span class="px-3 py-1 text-sm">
                                Page ${currentPage} sur ${totalPages}
                            </span>
                            <button class="next-page px-3 py-1 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}"
                                    ${currentPage === totalPages ? 'disabled' : ''}>
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
                <div class="flex-1 overflow-auto min-h-0">
                    <table class="min-w-full text-sm border-separate border-spacing-0">
                        <thead class="sticky top-0 bg-white shadow-sm">
                            <tr>`;

        headers.forEach(h => {
            html += `<th class="px-4 py-2 text-left font-semibold text-gray-700 bg-gray-50 border-b">${h}</th>`;
        });

        html += '</tr></thead><tbody>';
        pageRows.forEach((row, idx) => {
            html += `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50">`;
            headers.forEach(h => {
                let cellContent = row[h] ?? '';
                let cellClass = 'px-4 py-2 border-b border-gray-200 whitespace-nowrap';
                let cellAttrs = '';
                
                // Traitement spécial pour le régime binaire
                if (h === 'regime_binaire' && cellContent) {
                    const onesCount = (cellContent.match(/1/g) || []).length;
                    const firstFour = cellContent.substring(0, 4);
                    const lastFour = cellContent.substring(cellContent.length - 4);
                    cellContent = `${onesCount} jour(s) ${firstFour}....${lastFour}`;
                    cellClass += ' cursor-pointer text-blue-600 hover:text-blue-800';
                    cellAttrs = `data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}'`;
                }
                
                html += `<td class="${cellClass}" ${cellAttrs}>${cellContent}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';
        return html;
    }

    function showRegimeDetails(row) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[60]';
        modal.id = 'regimeDetailsModal';

        const dds = construireDDS(row.service_annuel);
        // const formattedDDS = `${dds.substring(6, 8)}/${dds.substring(4, 6)}/${dds.substring(0, 4)}`;

        // Formatage de l'heure au format HH:MM:SS
        let heure = row.heure_depart || '';
        let formattedHeure = '';
        if (heure.length === 6) {
            formattedHeure = `${heure.substring(0,2)}:${heure.substring(2,4)}:${heure.substring(4,6)}`;
        } else if (heure.length === 4) {
            formattedHeure = `${heure.substring(0,2)}:${heure.substring(2,4)}:00`;
        } else {
            formattedHeure = heure;
        }

        // Convertir le régime binaire en dates actives
        const datesActives = [];
        const ddsDate = new Date(
            parseInt(dds.substring(0, 4)),
            parseInt(dds.substring(4, 6)) - 1,
            parseInt(dds.substring(6, 8))
        );
        for (let i = 0; i < row.regime_binaire.length; i++) {
            if (row.regime_binaire[i] === '1') {
                const date = new Date(ddsDate);
                date.setDate(date.getDate() + i);
                datesActives.push(date);
            }
        }

        // Générer les 13 mois à partir de la DDS
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        let calendarHTML = '';
        const monthsToShow = 13;
        for (let i = 0; i < monthsToShow; i++) {
            const currentDate = new Date(ddsDate);
            currentDate.setMonth(ddsDate.getMonth() + i);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            calendarHTML += `
                <div class="mb-2 bg-white rounded shadow-sm border border-gray-200 p-1 min-w-[120px] max-w-[130px]">
                    <div class="text-xs font-semibold text-center mb-1">${monthNames[month]} ${year}</div>
                    <div class="grid grid-cols-7 gap-[1px] text-[10px]">
                        <div class="text-center font-semibold text-gray-600">D</div>
                        <div class="text-center font-semibold text-gray-600">L</div>
                        <div class="text-center font-semibold text-gray-600">M</div>
                        <div class="text-center font-semibold text-gray-600">M</div>
                        <div class="text-center font-semibold text-gray-600">J</div>
                        <div class="text-center font-semibold text-gray-600">V</div>
                        <div class="text-center font-semibold text-gray-600">S</div>
                        ${Array(firstDayOfMonth).fill().map(() => '<div></div>').join('')}
                        ${Array(daysInMonth).fill().map((_, i) => {
                            const day = i + 1;
                            const date = new Date(year, month, day);
                            const isActive = datesActives.some(d =>
                                d.getDate() === date.getDate() &&
                                d.getMonth() === date.getMonth() &&
                                d.getFullYear() === date.getFullYear()
                            );
                            return `<div class="text-center p-[2px] border rounded ${isActive ? 'bg-blue-200 border-blue-400 font-bold text-blue-900' : 'border-gray-200'}">${day}</div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Titre personnalisé
        const titre = `Détail du régime de la marche : ${row.marche_depart} de ${formattedHeure} Nature : ${row.nature} (SA${row.service_annuel})`;

        // Contenu principal de la modale
        modal.innerHTML = `
            <div id="regimeModalContent" class="bg-white rounded-t-2xl shadow-xl w-full max-w-6xl mx-4 flex flex-col h-[90vh] transition-all">
                <div class="sticky top-0 z-10 bg-blue-50 pb-2 pt-4 px-6 flex flex-col gap-2 border-b border-blue-200 rounded-t-2xl">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-semibold text-blue-900">${titre}</h3>
                        <div class="flex gap-2">
                            <button id="fullscreenRegimeBtn" class="text-gray-400 hover:text-gray-600" title="Plein écran">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                                </svg>
                            </button>
                            <button class="text-gray-400 hover:text-gray-500" onclick="document.getElementById('regimeDetailsModal').remove()" title="Fermer">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-row items-center text-xs mb-1">
                        <span class="font-medium text-blue-800 mr-2">Empreinte</span>
                        <span class="break-all text-gray-700">${row.empreinte_circulation || 'Non définie'}</span>
                    </div>
                    <div class="pt-2 text-sm font-medium text-blue-800">Calendrier des jours actifs</div>
                </div>
                <div id="regimeCalendarsScroll" class="flex-1 overflow-y-auto px-6 py-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-[6px] justify-items-center">
                        ${calendarHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Gestion du bouton plein écran
        const modalContent = modal.querySelector('#regimeModalContent');
        const fullscreenBtn = modal.querySelector('#fullscreenRegimeBtn');
        let isFullscreen = false;
        fullscreenBtn.addEventListener('click', () => {
            isFullscreen = !isFullscreen;
            if (isFullscreen) {
                modalContent.classList.remove('max-w-6xl', 'h-[90vh]', 'mx-4', 'rounded-t-2xl');
                modalContent.classList.add('w-screen', 'h-screen', 'm-0', 'rounded-none');
            } else {
                modalContent.classList.add('max-w-6xl', 'h-[90vh]', 'mx-4', 'rounded-t-2xl');
                modalContent.classList.remove('w-screen', 'h-screen', 'm-0', 'rounded-none');
            }
        });
    }

    function construireDDS(serviceAnnuel) {
        // Extraire l'année du service (xxxx)
        const annee = parseInt(serviceAnnuel);
        const anneePrecedente = annee - 1;
        
        // Créer le 1er décembre de l'année précédente
        const premierDecembre = new Date(anneePrecedente, 11, 1);
        
        // Trouver le premier samedi
        let premierSamedi = new Date(premierDecembre);
        while (premierSamedi.getDay() !== 6) {
            premierSamedi.setDate(premierSamedi.getDate() + 1);
        }
        
        // Trouver le deuxième samedi
        const deuxiemeSamedi = new Date(premierSamedi);
        deuxiemeSamedi.setDate(deuxiemeSamedi.getDate() + 7);
        
        // La DDS est le dimanche suivant le deuxième samedi
        const dds = new Date(deuxiemeSamedi);
        dds.setDate(dds.getDate() + 1);
        
        // Formater la date en YYYYMMDD
        return dds.getFullYear().toString() +
            String(dds.getMonth() + 1).padStart(2, '0') +
            String(dds.getDate()).padStart(2, '0');
    }

    function showECIDatabaseModal() {
        // Supprimer une ancienne modale si elle existe
        const oldModal = document.getElementById('dbModal');
        if (oldModal) oldModal.remove();

        // Variables de pagination pour chaque table
        const paginationState = {
            cireg: { currentPage: 1, itemsPerPage: 25, data: [] },
            ciregJour: { currentPage: 1, itemsPerPage: 25, data: [] }
        };

        // Créer la modale
        const modal = document.createElement('div');
        modal.id = 'dbModal';
        modal.className = 'fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-[95vw] mx-4 p-0 relative flex flex-col h-[90vh]">
                <!-- Header avec titre et boutons -->
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
                                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
                                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
                            </svg>
                            <h2 class="text-xl font-semibold ml-2">Consultation de la base</h2>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button id="exportDbBtn" class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                </svg>
                                Exporter
                            </button>
                            <label class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                </svg>
                                Importer
                                <input id="importDbInput" type="file" accept=".sqlite,.db,.bin" class="hidden" />
                            </label>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button id="fullscreenDbModal" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                            </svg>
                        </button>
                        <button id="closeDbModal" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Onglets -->
                <div class="border-b border-gray-200 bg-gray-50">
                    <ul class="flex -mb-px px-6" role="tablist">
                        <li class="mr-2" role="presentation">
                            <button class="inline-flex items-center px-4 py-2 border-b-2 rounded-t-lg tab-button active" 
                                    id="tab-cireg" 
                                    data-target="content-cireg"
                                    role="tab">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"/>
                                </svg>
                                pdt_cireg
                            </button>
                        </li>
                        <li class="mr-2" role="presentation">
                            <button class="inline-flex items-center px-4 py-2 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 tab-button" 
                                    id="tab-cireg-jour" 
                                    data-target="content-cireg-jour"
                                    role="tab">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"/>
                                </svg>
                                pdt_cireg_jour
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Contenu des onglets -->
                <div class="flex-1 overflow-hidden">
                    <div class="tab-content h-full">
                        <div id="content-cireg" class="tab-pane active h-full">
                            <div id="tableCireg" class="h-full"></div>
                        </div>
                        <div id="content-cireg-jour" class="tab-pane hidden h-full">
                            <div id="tableCiregJour" class="h-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Gestion du mode plein écran
        let isFullscreen = false;
        const modalContent = modal.querySelector('.bg-white');
        const fullscreenBtn = modal.querySelector('#fullscreenDbModal');
        
        fullscreenBtn.addEventListener('click', () => {
            isFullscreen = !isFullscreen;
            if (isFullscreen) {
                modalContent.classList.remove('max-w-[95vw]', 'h-[90vh]', 'mx-4');
                modalContent.classList.add('w-screen', 'h-screen', 'm-0', 'rounded-none');
                fullscreenBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 16h12M6 8h12M2 12h20"/>
                    </svg>
                `;
            } else {
                modalContent.classList.add('max-w-[95vw]', 'h-[90vh]', 'mx-4', 'rounded-lg');
                modalContent.classList.remove('w-screen', 'h-screen', 'm-0', 'rounded-none');
                fullscreenBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                    </svg>
                `;
            }
            // Force le rafraîchissement de l'affichage
            const activeTableId = document.querySelector('.tab-button.active').getAttribute('data-target').replace('content-', '');
            updateTable(activeTableId);
        });

        // Gestion des onglets
        const tabButtons = modal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Désactiver tous les onglets
                tabButtons.forEach(btn => {
                    btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
                    btn.classList.add('border-transparent');
                });
                // Cacher tous les contenus
                modal.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.add('hidden');
                });
                
                // Activer l'onglet cliqué
                button.classList.add('active', 'border-blue-600', 'text-blue-600');
                button.classList.remove('border-transparent');
                
                // Afficher le contenu correspondant
                const targetId = button.getAttribute('data-target');
                const targetPane = modal.querySelector(`#${targetId}`);
                targetPane.classList.remove('hidden');
            });
        });

        // Activer le premier onglet par défaut
        tabButtons[0].classList.add('border-blue-600', 'text-blue-600');

        // Charger les données
        if (!window.eciDb) {
            window.eciDb = new window.ECIDatabase();
            window.eciDb.init().then(updateTables);
        } else {
            updateTables();
        }

        function updateTables() {
            const rowsJour = window.eciDb.select('SELECT * FROM pdt_cireg_jour');
            const rowsCireg = window.eciDb.select('SELECT * FROM pdt_cireg');
            
            // Stocker les données complètes
            paginationState.cireg.data = rowsCireg;
            paginationState.ciregJour.data = rowsJour;

            // Mettre à jour les deux tables
            updateTable('cireg');
            updateTable('ciregJour');
        }

        function attachEventHandlers(tableId) {
            const table = document.getElementById(`table${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`);
            if (!table) return;

            // Gestionnaire pour le régime binaire
            table.querySelectorAll('td[data-row]').forEach(cell => {
                cell.addEventListener('click', () => {
                    try {
                        const rowData = JSON.parse(cell.dataset.row);
                        showRegimeDetails(rowData);
                    } catch (error) {
                        console.error('Erreur lors du parsing des données:', error);
                    }
                });
            });

            // Gestionnaire pour "précédent"
            const prevButton = table.querySelector('.prev-page');
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    if (paginationState[tableId].currentPage > 1) {
                        paginationState[tableId].currentPage--;
                        updateTable(tableId);
                    }
                });
            }

            // Gestionnaire pour "suivant"
            const nextButton = table.querySelector('.next-page');
            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    const totalPages = Math.ceil(paginationState[tableId].data.length / paginationState[tableId].itemsPerPage);
                    if (paginationState[tableId].currentPage < totalPages) {
                        paginationState[tableId].currentPage++;
                        updateTable(tableId);
                    }
                });
            }

            // Gestionnaire pour "items par page"
            const itemsPerPageSelect = table.querySelector('.items-per-page');
            if (itemsPerPageSelect) {
                itemsPerPageSelect.addEventListener('change', (e) => {
                    paginationState[tableId].itemsPerPage = parseInt(e.target.value);
                    paginationState[tableId].currentPage = 1;
                    updateTable(tableId);
                });
            }
        }

        function updateTable(tableId) {
            const state = paginationState[tableId];
            const tableElement = document.getElementById(`table${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`);
            if (tableElement) {
                tableElement.innerHTML = renderTable(state.data, state.currentPage, state.itemsPerPage);
                attachEventHandlers(tableId);
            }
        }

        // Fermeture de la modale
        modal.querySelector('#closeDbModal').addEventListener('click', () => {
            modal.remove();
        });

        // Exporter la base
        modal.querySelector('#exportDbBtn').addEventListener('click', () => {
            if (window.eciDb && window.eciDb.db) {
                const data = window.eciDb.db.export();
                const blob = new Blob([data], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'eciprocess.sqlite';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }
        });

        // Importer la base
        modal.querySelector('#importDbInput').addEventListener('click', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                if (!window.eciDb) {
                    window.eciDb = new window.ECIDatabase();
                    await window.eciDb.init();
                }
                window.eciDb.db = new window.eciDb.SQL.Database(new Uint8Array(arrayBuffer));
                updateTables();
            }
        });
    }

    // Export global
    global.showECIDatabaseModal = showECIDatabaseModal;
})(window); 
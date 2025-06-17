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
                html += `<td class="px-4 py-2 border-b border-gray-200 whitespace-nowrap">${row[h] ?? ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div></div>';
        return html;
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

            // Rendre les tables avec pagination
            document.getElementById('tableCiregJour').innerHTML = renderTable(
                rowsJour, 
                paginationState.ciregJour.currentPage, 
                paginationState.ciregJour.itemsPerPage
            );
            document.getElementById('tableCireg').innerHTML = renderTable(
                rowsCireg, 
                paginationState.cireg.currentPage, 
                paginationState.cireg.itemsPerPage
            );

            // Ajouter les gestionnaires d'événements pour la pagination
            ['cireg', 'ciregJour'].forEach(tableId => {
                const table = document.getElementById(`table${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`);
                if (!table) return;

                // Gestionnaire pour "précédent"
                table.querySelector('.prev-page')?.addEventListener('click', () => {
                    if (paginationState[tableId].currentPage > 1) {
                        paginationState[tableId].currentPage--;
                        updateTable(tableId);
                    }
                });

                // Gestionnaire pour "suivant"
                table.querySelector('.next-page')?.addEventListener('click', () => {
                    const totalPages = Math.ceil(paginationState[tableId].data.length / paginationState[tableId].itemsPerPage);
                    if (paginationState[tableId].currentPage < totalPages) {
                        paginationState[tableId].currentPage++;
                        updateTable(tableId);
                    }
                });

                // Gestionnaire pour "items par page"
                table.querySelector('.items-per-page')?.addEventListener('change', (e) => {
                    paginationState[tableId].itemsPerPage = parseInt(e.target.value);
                    paginationState[tableId].currentPage = 1; // Retour à la première page
                    updateTable(tableId);
                });
            });
        }

        function updateTable(tableId) {
            const state = paginationState[tableId];
            document.getElementById(`table${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`).innerHTML = 
                renderTable(state.data, state.currentPage, state.itemsPerPage);
            
            // Réattacher les gestionnaires d'événements
            const table = document.getElementById(`table${tableId.charAt(0).toUpperCase() + tableId.slice(1)}`);
            
            table.querySelector('.prev-page')?.addEventListener('click', () => {
                if (state.currentPage > 1) {
                    state.currentPage--;
                    updateTable(tableId);
                }
            });

            table.querySelector('.next-page')?.addEventListener('click', () => {
                const totalPages = Math.ceil(state.data.length / state.itemsPerPage);
                if (state.currentPage < totalPages) {
                    state.currentPage++;
                    updateTable(tableId);
                }
            });

            table.querySelector('.items-per-page')?.addEventListener('change', (e) => {
                state.itemsPerPage = parseInt(e.target.value);
                state.currentPage = 1;
                updateTable(tableId);
            });
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
        modal.querySelector('#importDbInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                if (!window.eciDb) {
                    window.eciDb = new window.ECIDatabase();
                    await window.eciDb.init();
                }
                // Remplacer la base actuelle par celle importée
                window.eciDb.db = new window.eciDb.SQL.Database(new Uint8Array(arrayBuffer));
                updateTables();
            }
        });
    }

    // Export global
    global.showECIDatabaseModal = showECIDatabaseModal;
})(window); 
(function(global) {
    function renderTable(rows) {
        if (!rows || rows.length === 0) {
            return '<div class="text-gray-400 italic">Aucune donnée</div>';
        }
        const headers = Object.keys(rows[0]);
        let html = '<table class="min-w-full text-xs text-left border border-gray-200"><thead><tr>';
        headers.forEach(h => {
            html += `<th class="px-2 py-1 border-b bg-gray-100">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            headers.forEach(h => {
                html += `<td class="px-2 py-1 border-b">${row[h] ?? ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    function showECIDatabaseModal() {
        // Supprimer une ancienne modale si elle existe
        const oldModal = document.getElementById('dbModal');
        if (oldModal) oldModal.remove();

        // Créer la modale
        const modal = document.createElement('div');
        modal.id = 'dbModal';
        modal.className = 'fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 relative overflow-auto max-h-[90vh]">
                <button id="closeDbModal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                <div class="flex gap-4 mb-4">
                    <button id="exportDbBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition-colors">Exporter la base</button>
                    <label class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-colors cursor-pointer">
                        Importer la base
                        <input id="importDbInput" type="file" accept=".sqlite,.db,.bin" class="hidden" />
                    </label>
                </div>
                <h2 class="text-xl font-bold mb-4">Consultation de la base</h2>
                
                <!-- Onglets -->
                <div class="mb-4 border-b border-gray-200">
                    <ul class="flex flex-wrap -mb-px" role="tablist">
                        <li class="mr-2" role="presentation">
                            <button class="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 tab-button active" 
                                    id="tab-cireg" 
                                    data-target="content-cireg"
                                    role="tab">
                                Table pdt_cireg
                            </button>
                        </li>
                        <li class="mr-2" role="presentation">
                            <button class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 tab-button" 
                                    id="tab-cireg-jour" 
                                    data-target="content-cireg-jour"
                                    role="tab">
                                Table pdt_cireg_jour
                            </button>
                        </li>
                    </ul>
                </div>

                <!-- Contenu des onglets -->
                <div class="tab-content">
                    <div id="content-cireg" class="tab-pane active">
                        <div id="tableCireg" class="overflow-x-auto"></div>
                    </div>
                    <div id="content-cireg-jour" class="tab-pane hidden">
                        <div id="tableCiregJour" class="overflow-x-auto"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

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
            document.getElementById('tableCiregJour').innerHTML = renderTable(rowsJour);
            document.getElementById('tableCireg').innerHTML = renderTable(rowsCireg);
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
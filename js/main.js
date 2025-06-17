document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation de l\'application...');
    
    const fileInput = document.getElementById('eciFile');
    const eciParser = new ECIParser();
    const eciTableView = new ECITableView('fileContent');
    const progressModal = new IntegrationProgressModal();
    let articlesCharges = null;
    
    // Initialiser la base de données
    if (!window.eciDb) {
        console.log('Initialisation de la base de données...');
        window.eciDb = new window.ECIDatabase();
        await window.eciDb.init();
        console.log('Base de données initialisée');
    }
    
    // Créer le processeur ECI
    const eciProcessor = new ECIProcessor(window.eciDb);

    // Configurer le gestionnaire de progression
    eciProcessor.onProgress = (progressInfo) => {
        if (progressInfo.phase === 'début') {
            progressModal.show();
            progressModal.updateProgress(progressInfo.message, 0);
        } else if (progressInfo.phase === 'progression') {
            progressModal.updateProgress(progressInfo.message, progressInfo.progress);
        } else if (progressInfo.phase === 'fin') {
            progressModal.updateProgress(progressInfo.message, 100);
            setTimeout(() => {
                progressModal.hide();
            }, 1000);
        }
    };

    fileInput.addEventListener('change', async (event) => {
        console.log('Sélection d\'un fichier ECI');
        const file = event.target.files[0];
        
        if (!file) {
            console.log('Aucun fichier sélectionné');
            return;
        }

        try {
            // Afficher un message de chargement
            document.getElementById('fileContent').innerHTML = `
                <div class="flex items-center justify-center p-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                    <span class="text-gray-600">Lecture du fichier en cours...</span>
                </div>
            `;

            console.log('Lecture du fichier:', file.name);
            await eciParser.readFile(file);
            
            console.log('Parsing des articles...');
            const articles = eciParser.parseArticles();
            
            if (!articles || articles.length === 0) {
                document.getElementById('fileContent').innerHTML = `
                    <div class="text-center text-gray-400 py-8">
                        Aucun article A1 trouvé dans le fichier.
                    </div>`;
                return;
            }

            // Stocker les articles pour traitement ultérieur
            articlesCharges = articles;

            // Créer un conteneur pour le résumé et le bouton
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'mb-6';
            summaryDiv.innerHTML = `
                <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                    <p class="font-bold">Fichier chargé avec succès</p>
                    <p>- ${articles.length} articles trouvés</p>
                    <p>- Fichier : ${file.name}</p>
                </div>
                <div class="mt-4 flex justify-center">
                    <button id="processEciBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Lancer l'intégration en base de données
                    </button>
                </div>`;

            // Vider le conteneur fileContent et ajouter le résumé
            const fileContent = document.getElementById('fileContent');
            fileContent.innerHTML = '';
            fileContent.appendChild(summaryDiv);

            // Créer un nouveau conteneur pour la table
            const tableDiv = document.createElement('div');
            tableDiv.id = 'tableContainer';
            fileContent.appendChild(tableDiv);

            // Afficher la table des données
            const tableView = new ECITableView('tableContainer');
            tableView.setArticles(articles);

            // Ajouter l'écouteur d'événement pour le bouton de traitement
            document.getElementById('processEciBtn').addEventListener('click', async () => {
                try {
                    // Désactiver le bouton pendant le traitement
                    const btn = document.getElementById('processEciBtn');
                    btn.disabled = true;
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                    btn.textContent = 'Traitement en cours...';

                    await eciProcessor.traiterFichierECI(articlesCharges);
                    
                    // Rafraîchir l'affichage avec les données de la base
                    const rowsCireg = window.eciDb.select('SELECT * FROM pdt_cireg');
                    const rowsCiregJour = window.eciDb.select('SELECT * FROM pdt_cireg_jour');
                    
                    // Mettre à jour uniquement la partie supérieure, garder la table
                    summaryDiv.innerHTML = `
                        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                            <p class="font-bold">Traitement terminé avec succès</p>
                            <p>- ${rowsCireg.length} variantes créées/mises à jour</p>
                            <p>- ${rowsCiregJour.length} circulations jour traitées</p>
                        </div>
                        <div class="mt-4">
                            <p class="text-gray-600 mb-2">Pour consulter les données en base, utilisez le bouton "Consulter la base".</p>
                        </div>`;
                    
                } catch (error) {
                    console.error('Erreur lors du traitement des ECI:', error);
                    summaryDiv.innerHTML = `
                        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                            <p class="font-bold">Erreur lors du traitement</p>
                            <p>${error.message}</p>
                        </div>`;
                } finally {
                    // Réactiver le bouton
                    const btn = document.getElementById('processEciBtn');
                    if (btn) {
                        btn.disabled = false;
                        btn.classList.remove('opacity-50', 'cursor-not-allowed');
                        btn.textContent = 'Lancer l\'intégration en base de données';
                    }
                }
            });

        } catch (error) {
            console.error('Erreur lors de la lecture du fichier:', error);
            document.getElementById('fileContent').innerHTML = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                    <p class="font-bold">Erreur lors de la lecture du fichier</p>
                    <p>${error.message}</p>
                </div>`;
        }
    });
}); 
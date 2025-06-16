document.addEventListener('DOMContentLoaded', () => {
    console.log('Script main.js chargé');
    const fileInput = document.getElementById('eciFile');
    console.log('Element fileInput trouvé:', fileInput);
    const eciParser = new ECIParser();
    const eciTableView = new ECITableView('fileContent');

    if (!fileInput) {
        console.error('Element fileInput non trouvé!');
        return;
    }

    fileInput.addEventListener('change', async (event) => {
        console.log('Handler de chargement de fichier déclenché');
        const file = event.target.files[0];
        if (file) {
            console.log('Fichier sélectionné:', file.name);
            
            try {
                await eciParser.readFile(file);
                console.log('Contenu du fichier:', eciParser.content ? eciParser.content.substring(0, 200) : 'vide');
                
                const articles = eciParser.parseArticles();
                console.log('Articles parsés:', articles.length);
                
                if (!articles || articles.length === 0) {
                    document.getElementById('fileContent').innerHTML = '<div class="text-center text-gray-400 py-8">Aucun article A1 trouvé dans le fichier.</div>';
                    return;
                }
                
                eciTableView.setArticles(articles);
                console.log('Tableau mis à jour');
            } catch (error) {
                console.error('Erreur lors du traitement du fichier:', error);
                document.getElementById('fileContent').innerHTML = `<div class="text-center text-red-500 py-8">Erreur lors du traitement du fichier: ${error.message}</div>`;
            }
        } else {
            console.log('Aucun fichier sélectionné');
        }
    });
}); 
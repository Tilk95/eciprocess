document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('eciFile');
    const eciParser = new ECIParser();
    const eciTableView = new ECITableView('fileContent');

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Fichier sélectionné:', file.name);
            
            try {
                await eciParser.readFile(file);
                console.log('Fichier lu avec succès');
                
                const articles = eciParser.parseArticles();
                console.log('Articles parsés:', articles.length);
                
                eciTableView.setArticles(articles);
                console.log('Tableau mis à jour');
            } catch (error) {
                console.error('Erreur lors du traitement du fichier:', error);
                alert(`Erreur lors du traitement du fichier: ${error.message}`);
            }
        } else {
            console.log('Aucun fichier sélectionné');
        }
    });
}); 
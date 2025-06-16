class ECIReader {
    constructor() {
        this.content = null;
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                this.content = event.target.result;
                console.log('Fichier lu avec succès:', this.content.substring(0, 100) + '...');
                resolve(this.content);
            };
            
            reader.onerror = (error) => {
                console.error('Erreur lors de la lecture du fichier:', error);
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }

    getContent() {
        return this.content;
    }

    extractField(line, start, length) {
        return line.substring(start, start + length).trim();
    }

    parseA1Article(line) {
        console.log('Tentative de parsing A1:', line);
        
        try {
            const article = {
                type: 'A1',
                typeArticle: this.extractField(line, 0, 2),
                marche: this.extractField(line, 2, 6),
                dateDepart: this.extractField(line, 8, 8),
                heureDepart: this.extractField(line, 16, 6),
                cleAppariement: this.extractField(line, 22, 12),
                guidECI: this.extractField(line, 34, 32),
                dateDebutValidite: this.extractField(line, 66, 14),
                nature: this.extractField(line, 80, 1),
                typeECI: this.extractField(line, 81, 1),
                guidPH: this.extractField(line, 82, 32),
                guidPCT: this.extractField(line, 114, 32),
                famille: this.extractField(line, 146, 2),
                guidECIASupprimer: this.extractField(line, 148, 32),
                serviceAnnuel: this.extractField(line, 180, 4),
                empreinte_circulation: null // Une seule empreinte possible
            };
            console.log('Article A1 parsé avec succès:', article);
            return article;
        } catch (error) {
            console.error('Erreur lors du parsing de l\'article A1:', error);
            return null;
        }
    }

    parseAEArticle(line) {
        console.log('Tentative de parsing AE:', line);
        
        try {
            const article = {
                type: 'AE',
                typeArticle: this.extractField(line, 0, 2),
                empreinte: this.extractField(line, 2, 64)
            };
            console.log('Article AE parsé avec succès:', article);
            return article;
        } catch (error) {
            console.error('Erreur lors du parsing de l\'article AE:', error);
            return null;
        }
    }

    filterAndParseArticles() {
        if (!this.content) {
            console.warn('Aucun contenu à parser');
            return [];
        }
        
        console.log('Début du parsing des articles...');
        const lines = this.content.split('\n');
        console.log('Nombre total de lignes:', lines.length);
        
        const parsedArticles = [];
        let currentA1 = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Ignorer les lignes vides
            
            if (line.startsWith('A1')) {
                const parsedArticle = this.parseA1Article(line);
                if (parsedArticle) {
                    currentA1 = parsedArticle;
                    parsedArticles.push(parsedArticle);
                }
            } else if (line.startsWith('AE')) {
                const parsedArticle = this.parseAEArticle(line);
                if (parsedArticle && currentA1 && currentA1.typeECI === 'P') {
                    // Un seul AE possible par A1, et uniquement si typeECI = 'P'
                    currentA1.empreinte_circulation = parsedArticle.empreinte;
                }
            }
        }
        
        console.log('Nombre d\'articles A1 parsés:', parsedArticles.length);
        return parsedArticles;
    }

    formatArticleForDisplay(article) {
        if (!article) {
            console.warn('Tentative de formatage d\'un article null');
            return '';
        }

        if (article.type === 'A1') {
            let empreinte = '';
            if (article.typeECI === 'P') {
                empreinte = article.empreinte_circulation 
                    ? `\nEmpreinte de circulation: ${article.empreinte_circulation}`
                    : '\nAucune empreinte de circulation associée (typeECI = P mais pas d\'empreinte trouvée)';
            } else {
                empreinte = '\nPas d\'empreinte de circulation (typeECI ≠ P)';
            }

            return [
                '=== Article A1 ===',
                `Type Article: ${article.typeArticle || 'N/A'}`,
                `Marché: ${article.marche || 'N/A'}`,
                `Date Départ: ${article.dateDepart || 'N/A'}`,
                `Heure Départ: ${article.heureDepart || 'N/A'}`,
                `Clé Appariement: ${article.cleAppariement || 'N/A'}`,
                `GUID ECI: ${article.guidECI || 'N/A'}`,
                `Date Début Validité: ${article.dateDebutValidite || 'N/A'}`,
                `Nature: ${article.nature || 'N/A'}`,
                `Type ECI: ${article.typeECI || 'N/A'}`,
                `GUID PH: ${article.guidPH || 'N/A'}`,
                `GUID PCT: ${article.guidPCT || 'N/A'}`,
                `Famille: ${article.famille || 'N/A'}`,
                `GUID ECI à Supprimer: ${article.guidECIASupprimer || 'N/A'}`,
                `Service Annuel: ${article.serviceAnnuel || 'N/A'}`,
                empreinte
            ].join('\n');
        }
        return '';
    }

    getFormattedContent() {
        console.log('Génération du contenu formaté...');
        const articles = this.filterAndParseArticles();
        console.log('Articles à formater:', articles.length);
        
        if (articles.length === 0) {
            return 'Aucun article A1 trouvé dans le fichier.';
        }
        
        const formattedContent = articles.map(article => this.formatArticleForDisplay(article)).join('\n\n');
        console.log('Contenu formaté généré:', formattedContent.substring(0, 100) + '...');
        return formattedContent;
    }
} 
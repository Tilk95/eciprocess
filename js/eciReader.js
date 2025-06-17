class ECIReader {
    constructor() {
        this.parser = new ECIParser();
        this.processor = new ECIProcessor();
    }

    async readFile(file) {
        try {
            // Lecture et parsing du fichier
            const ecis = await this.parser.parseFile(file);
            if (!ecis || ecis.length === 0) {
                console.error('Erreur: Aucun ECI trouvé dans le fichier');
                return;
            }

            // Traitement des ECIs
            await this.processor.traiterFichierECI(ecis);

        } catch (error) {
            console.error('Erreur lors de la lecture du fichier:', error);
            throw error;
        }
    }

    getContent() {
        return this.content;
    }

    extractField(line, start, length) {
        return line.substring(start, start + length).trim();
    }

    parseA1Article(line) {
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
            return article;
        } catch (error) {
            console.error('Erreur lors du parsing de l\'article A1:', error);
            return null;
        }
    }

    parseAEArticle(line) {
        try {
            const article = {
                type: 'AE',
                typeArticle: this.extractField(line, 0, 2),
                empreinte: this.extractField(line, 2, 64)
            };
            return article;
        } catch (error) {
            console.error('Erreur lors du parsing de l\'article AE:', error);
            return null;
        }
    }

    filterAndParseArticles() {
        if (!this.content) {
            return [];
        }
        
        const lines = this.content.split('\n');
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
        
        return parsedArticles;
    }

    formatArticleForDisplay(article) {
        if (!article) {
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
        const articles = this.filterAndParseArticles();
        
        if (articles.length === 0) {
            return 'Aucun article A1 trouvé dans le fichier.';
        }
        
        const formattedContent = articles.map(article => this.formatArticleForDisplay(article)).join('\n\n');
        return formattedContent;
    }
} 
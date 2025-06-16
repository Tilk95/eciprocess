class ECIParser {
    constructor() {
        this.content = null;
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                this.content = event.target.result;
                resolve(this.content);
            };
            
            reader.onerror = (error) => {
                reject(error);
            };
            
            reader.readAsText(file);
        });
    }

    extractField(line, start, length) {
        return line.substring(start, start + length).trim();
    }

    parseA1Article(line) {
        try {
            return {
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
                empreinte_circulation: null
            };
        } catch (error) {
            return null;
        }
    }

    parseAEArticle(line) {
        try {
            return {
                type: 'AE',
                typeArticle: this.extractField(line, 0, 2),
                empreinte: this.extractField(line, 2, 64)
            };
        } catch (error) {
            return null;
        }
    }

    parseArticles() {
        if (!this.content) return [];
        
        const lines = this.content.split('\n');
        const parsedArticles = [];
        let currentA1 = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            if (line.startsWith('A1')) {
                const parsedArticle = this.parseA1Article(line);
                if (parsedArticle) {
                    currentA1 = parsedArticle;
                    parsedArticles.push(parsedArticle);
                }
            } else if (line.startsWith('AE')) {
                const parsedArticle = this.parseAEArticle(line);
                if (parsedArticle && currentA1 && currentA1.typeECI === 'P') {
                    currentA1.empreinte_circulation = parsedArticle.empreinte;
                }
            }
        }
        
        return parsedArticles;
    }
} 
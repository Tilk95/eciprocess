class ECIParser {
    constructor() {
        this.content = null;
    }

    async parseFile(file) {
        try {
            // Lire le contenu du fichier
            const content = await this.readFile(file);
            if (!content) {
                console.error('Erreur: Fichier vide');
                return null;
            }

            // Découper le contenu en lignes
            const lines = content.split('\n');
            if (lines.length === 0) {
                console.error('Erreur: Aucune ligne trouvée dans le fichier');
                return null;
            }

            // Parser les ECIs
            return this.parseECIs(lines);
        } catch (error) {
            console.error('Erreur lors du parsing du fichier:', error);
            throw error;
        }
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

    parseECIs(lines) {
        const ecis = [];
        let currentECI = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const articleType = line.substring(0, 2);

            switch (articleType) {
                case 'A1':
                    if (currentECI) {
                        ecis.push(currentECI);
                    }
                    currentECI = { a1: this.parseA1Article(line) };
                    break;
                case 'AE':
                    if (currentECI) {
                        currentECI.ae = this.parseAEArticle(line);
                        if (currentECI.a1 && currentECI.ae && currentECI.a1.typeECI === 'P') {
                            currentECI.a1.empreinte_circulation = currentECI.ae.empreinte;
                        }
                    }
                    break;
                case 'B1':
                    if (!currentECI.b1) currentECI.b1 = [];
                    currentECI.b1.push(this.parseB1(line));
                    break;
                case 'C1':
                    if (!currentECI.c1) currentECI.c1 = [];
                    currentECI.c1.push(this.parseC1(line));
                    break;
            }
        }

        if (currentECI) {
            ecis.push(currentECI);
        }

        return ecis;
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
                dateHeureValidite: this.extractField(line, 66, 14),
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
            console.error('Erreur lors du parsing de l\'article A1:', error);
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
            console.error('Erreur lors du parsing de l\'article AE:', error);
            return null;
        }
    }

    parseB1(line) {
        return {
            data: line.substring(2)
        };
    }

    parseC1(line) {
        return {
            data: line.substring(2)
        };
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
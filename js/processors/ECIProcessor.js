class ECIProcessor {
    constructor(database) {
        if (!database) {
            throw new Error('La base de données est requise pour ECIProcessor');
        }
        this.database = database;
    }

    async verifierBaseDeDonnees() {
        if (!this.database || !this.database.db) {
            throw new Error('La base de données n\'est pas initialisée');
        }
    }

    /**
     * Calcule la Date de Début de Service (DDS) pour un service annuel donné
     * @param {string} serviceAnnuel - Le service annuel au format 'SAxxxx'
     * @returns {string} - La DDS au format 'YYYYMMDD'
     */
    construireDDS(serviceAnnuel) {
        console.log(`\n📅 Calcul DDS pour service annuel: ${serviceAnnuel}`);
        
        // Extraire l'année du service (xxxx de SAxxxx)
        const annee = parseInt(serviceAnnuel);
        const anneePrecedente = annee - 1;
        console.log(`   Année extraite: ${annee}, Année précédente: ${anneePrecedente}`);
        
        // Créer le 1er décembre de l'année précédente
        const premierDecembre = new Date(anneePrecedente, 11, 1); // Mois 11 = décembre
        console.log(`   Premier décembre: ${premierDecembre.toISOString().split('T')[0]}`);
        
        // Trouver le premier samedi
        let premierSamedi = new Date(premierDecembre);
        while (premierSamedi.getDay() !== 6) { // 6 = samedi
            premierSamedi.setDate(premierSamedi.getDate() + 1);
        }
        console.log(`   Premier samedi: ${premierSamedi.toISOString().split('T')[0]}`);
        
        // Trouver le deuxième samedi
        const deuxiemeSamedi = new Date(premierSamedi);
        deuxiemeSamedi.setDate(deuxiemeSamedi.getDate() + 7);
        console.log(`   Deuxième samedi: ${deuxiemeSamedi.toISOString().split('T')[0]}`);
        
        // La DDS est le dimanche suivant le deuxième samedi
        const dds = new Date(deuxiemeSamedi);
        dds.setDate(dds.getDate() + 1);
        console.log(`   DDS (dimanche): ${dds.toISOString().split('T')[0]}`);
        
        // Formater la date en YYYYMMDD
        const ddsFormatted = dds.getFullYear().toString() +
               String(dds.getMonth() + 1).padStart(2, '0') +
               String(dds.getDate()).padStart(2, '0');
        
        console.log(`   DDS formatée: ${ddsFormatted}`);
        
        return ddsFormatted;
    }

    /**
     * Calcule le quantième (nombre de jours depuis la DDS) pour une date donnée
     * @param {string} serviceAnnuel - Le service annuel
     * @param {string} dateDepart - La date au format 'YYYYMMDD'
     * @returns {number} - Le quantième (position dans le régime binaire)
     */
    calculerQuantieme(serviceAnnuel, dateDepart) {
        const dds = this.construireDDS(serviceAnnuel);
        
        // Convertir les dates en objets Date
        const dateDebut = new Date(
            parseInt(dds.substring(0, 4)),
            parseInt(dds.substring(4, 6)) - 1,
            parseInt(dds.substring(6, 8))
        );
        
        const dateFin = new Date(
            parseInt(dateDepart.substring(0, 4)),
            parseInt(dateDepart.substring(4, 6)) - 1,
            parseInt(dateDepart.substring(6, 8))
        );
        
        // Calculer la différence en jours
        const diffTime = Math.abs(dateFin - dateDebut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const quantieme = diffDays + 1; // +1 car le premier jour est le quantième 1
        
        return quantieme;
    }

    /**
     * Vérifie si un ECI doit être traité
     * @param {Object} a1 - L'article A1 de l'ECI
     * @returns {Promise<[boolean, number|null]>} - [isCandidat, idCiregJour]
     */
    async isECICandidat(a1) {
        let isCandidat = false;
        let idCiregJour = null;

        try {
            if (!a1 || typeof a1 !== 'object') {
                return [false, null];
            }

            const propriétésRequises = ['serviceAnnuel', 'marche', 'dateDepart'];
            if (a1.typeECI === 'P') {
                propriétésRequises.push('nature');
            }
            
            const propriétésManquantes = propriétésRequises.filter(prop => !a1[prop]);
            
            if (propriétésManquantes.length > 0) {
                return [false, null];
            }

            if (a1.typeECI === 'S') {
                return [true, null];
            }

            const ciregJour = await this.database.select(
                `SELECT id_int_cireg_jour, date_heure_validite, marche_depart, date_depart, guid_eci 
                 FROM pdt_cireg_jour 
                 WHERE service_annuel = ? 
                 AND marche_depart = ? 
                 AND date_depart = ? 
                 AND nature = ?`,
                [a1.serviceAnnuel, a1.marche, a1.dateDepart, a1.nature]
            );

            if (ciregJour.length > 0) {
                if (ciregJour[0].date_heure_validite < a1.dateHeureValidite) {
                    isCandidat = true;
                    idCiregJour = ciregJour[0].id_int_cireg_jour;
                }
            } else {
                isCandidat = true;
            }

            return [isCandidat, idCiregJour];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Supprime une circulation jour et optionnellement met à jour le régime binaire
     * @param {number} idCiregJour - ID de la circulation jour à supprimer
     * @param {boolean} updateRegime - Si true, met à jour le régime binaire
     * @returns {Promise<void>}
     */
    async supprimerUneCirculationJour(idCiregJour, updateRegime = false) {
        // Récupérer la circulation jour
        const ciregJour = await this.database.select(
            'SELECT * FROM pdt_cireg_jour WHERE id_int_cireg_jour = ?',
            [idCiregJour]
        );

        if (ciregJour.length > 0) {
            if (updateRegime) {
                // Récupérer la variante (pdt_cireg)
                const cireg = await this.database.select(
                    'SELECT * FROM pdt_cireg WHERE id_int_cireg = ?',
                    [ciregJour[0].id_int_cireg]
                );

                if (cireg.length > 0) {
                    // Calculer le quantième et mettre à jour le régime
                    const quantieme = this.calculerQuantieme(
                        cireg[0].service_annuel,
                        ciregJour[0].date_depart
                    );

                    // Convertir le régime en tableau de caractères pour modification
                    let regimeArray = cireg[0].regime_binaire.split('');
                    regimeArray[quantieme - 1] = '0';
                    const nouveauRegime = regimeArray.join('');

                    // Mettre à jour le régime
                    await this.database.run(
                        'UPDATE pdt_cireg SET regime_binaire = ? WHERE id_int_cireg = ?',
                        [nouveauRegime, cireg[0].id_int_cireg]
                    );
                }
            }

            // Supprimer la circulation jour
            await this.database.run(
                'DELETE FROM pdt_cireg_jour WHERE id_int_cireg_jour = ?',
                [idCiregJour]
            );
        }
    }

    /**
     * Crée une nouvelle variante de circulation
     * @param {Object} eci - L'ECI contenant l'article A1
     * @returns {Promise<number|null>} - L'ID de la nouvelle variante ou null si échec
     */
    async creerVariante(eci) {
        try {
            await this.verifierBaseDeDonnees();
            
            if (!eci || !eci.a1) {
                return null;
            }

            const champsRequis = ['serviceAnnuel', 'marche', 'heureDepart', 'nature'];
            for (const champ of champsRequis) {
                if (!eci.a1[champ]) {
                    return null;
                }
            }

            const regimeBinaire = '0'.repeat(400);

            const params = [
                eci.a1.serviceAnnuel,
                eci.a1.marche,
                eci.a1.heureDepart,
                eci.a1.nature,
                regimeBinaire,
                eci.ae ? eci.ae.empreinte : null
            ];

            await this.database.run(
                `INSERT INTO pdt_cireg (
                    service_annuel,
                    marche_depart,
                    heure_depart,
                    nature,
                    regime_binaire,
                    empreinte_circulation
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                params
            );

            const result = await this.database.select(
                'SELECT last_insert_rowid() as lastId'
            );

            if (!result || result.length === 0) {
                return null;
            }

            return result[0].lastId;

        } catch (error) {
            return null;
        }
    }

    /**
     * Ajoute une circulation jour et met à jour le régime binaire
     * @param {Object} eci - L'ECI contenant l'article A1
     * @param {number} idCireg - L'ID de la variante
     * @returns {Promise<number|null>} - L'ID de la nouvelle circulation jour ou null si échec
     */
    async ajouterUneCirculationJour(eci, idCireg) {
        try {
            await this.verifierBaseDeDonnees();

            if (!eci || !eci.a1) {
                return null;
            }

            const champsRequis = {
                'serviceAnnuel': eci.a1.serviceAnnuel,
                'marche': eci.a1.marche,
                'dateDepart': eci.a1.dateDepart,
                'nature': eci.a1.nature,
                'guidECI': eci.a1.guidECI,
                'dateHeureValidite': eci.a1.dateHeureValidite
            };

            for (const [champ, valeur] of Object.entries(champsRequis)) {
                if (valeur === undefined || valeur === null) {
                    return null;
                }
            }

            const cireg = await this.database.select(
                'SELECT * FROM pdt_cireg WHERE id_int_cireg = ?',
                [idCireg]
            );

            if (cireg.length === 0) {
                return null;
            }

            const params = [
                idCireg,
                String(eci.a1.serviceAnnuel),
                String(eci.a1.marche),
                String(eci.a1.dateDepart),
                String(eci.a1.nature),
                String(eci.a1.guidECI),
                String(eci.a1.dateHeureValidite)
            ];

            await this.database.run(
                `INSERT INTO pdt_cireg_jour (
                    id_int_cireg,
                    service_annuel,
                    marche_depart,
                    date_depart,
                    nature,
                    guid_eci,
                    date_heure_validite
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                params
            );

            const result = await this.database.select(
                'SELECT last_insert_rowid() as lastId'
            );

            if (!result || result.length === 0) {
                return null;
            }

            const lastId = result[0].lastId;

            const quantieme = this.calculerQuantieme(
                cireg[0].service_annuel,
                eci.a1.dateDepart
            );

            let regimeArray = cireg[0].regime_binaire.split('');
            regimeArray[quantieme - 1] = '1';
            const nouveauRegime = regimeArray.join('');

            await this.database.run(
                'UPDATE pdt_cireg SET regime_binaire = ? WHERE id_int_cireg = ?',
                [nouveauRegime, idCireg]
            );

            return lastId;
        } catch (error) {
            return null;
        }
    }

    /**
     * Traite un ECI de type Supprimé
     * @param {string} guidASupprimer - Le GUID de l'ECI à supprimer
     * @returns {Promise<void>}
     */
    async traiterECITypeSupprime(guidASupprimer) {
        // Rechercher si le guidASupprimer existe
        const ciregJour = await this.database.select(
            'SELECT id_int_cireg_jour FROM pdt_cireg_jour WHERE guid_eci = ?',
            [guidASupprimer]
        );

        if (ciregJour.length > 0) {
            // On a trouvé le guidEci à supprimer
            await this.supprimerUneCirculationJour(ciregJour[0].id_int_cireg_jour, true);
        }
    }

    /**
     * Traite un ECI de type Planifié
     * @param {Object} eci - L'ECI complet avec articles A1 et AE
     * @param {Object} contexte - Le contexte contenant l'ID du doublon éventuel
     * @returns {Promise<void>}
     */
    async traiterECITypePlanifie(eci, contexte) {
        /* etape 1 : vérification présence de doublon */
        if (contexte.a_id_int_cireg_jour) {
            /* on supprime cette circulation jour de pdt_cireg_jour pour éviter les doublons */
            await this.supprimerUneCirculationJour(contexte.a_id_int_cireg_jour, true);
        }

        /* etape 2 : recherche d'une variante existante avec la même empreinte */
        const cireg = await this.database.select(
            `SELECT id_int_cireg 
             FROM pdt_cireg 
             WHERE service_annuel = ? 
             AND empreinte_circulation = ?`,
            [eci.a1.serviceAnnuel, eci.ae ? eci.ae.empreinte : null]
        );

        let idCireg;
        if (cireg.length > 0) {
            /* une variante existe pour cet ECI */
            idCireg = cireg[0].id_int_cireg;
        } else {
            /* pas de variante, on en crée une nouvelle */
            idCireg = await this.creerVariante(eci);
        }

        if (idCireg) {
            /* ajouter la circulation jour */
            await this.ajouterUneCirculationJour(eci, idCireg);
        }
    }

    /**
     * Traite un bloc d'ECI
     * @param {Array<Object>} bloc - Le bloc d'ECI à traiter
     * @returns {Promise<void>}
     */
    async traiterBlocECI(bloc) {
        await this.verifierBaseDeDonnees();
        
        try {
            await this.database.run('BEGIN TRANSACTION');

            for (const eci of bloc) {
                const article = eci.a1 || eci;
                const eciNormalise = {
                    a1: article
                };
                
                const [isCandidat, idCiregJour] = await this.isECICandidat(eciNormalise.a1);

                if (isCandidat) {
                    const contexte = {
                        a_id_int_cireg_jour: idCiregJour
                    };

                    if (article.typeECI === 'P') {
                        await this.traiterECITypePlanifie(eciNormalise, contexte);
                    } else if (article.typeECI === 'S') {
                        await this.traiterECITypeSupprime(article.guidECIASupprimer);
                    }
                }
            }

            await this.database.run('COMMIT');
        } catch (error) {
            await this.database.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Traite un fichier ECI complet
     * @param {Array<Object>} ecis - Liste des ECI parsés
     * @returns {Promise<void>}
     */
    async traiterFichierECI(ecis) {
        // Regrouper les ECI par bloc (même marche/date/nature)
        const blocs = this.regrouperEnBlocs(ecis);
        
        // Traiter chaque bloc
        for (const bloc of blocs) {
            await this.traiterBlocECI(bloc);
        }
    }

    /**
     * Regroupe les ECI en blocs par marche/date Depart/date Heure Validite/nature
     * @param {Array<Object>} ecis - Liste des ECI à regrouper
     * @returns {Array<Array<Object>>} - Liste des blocs d'ECI
     */
    regrouperEnBlocs(ecis) {
        const blocs = [];
        let blocCourant = [];
        let derniereCle = '';

        if (!Array.isArray(ecis) || ecis.length === 0) {
            return blocs;
        }

        const ecisTries = [...ecis].sort((a, b) => {
            const a1A = a.a1 || a;
            const a1B = b.a1 || b;
            
            if (!a1A.marche || !a1B.marche) {
                return 0;
            }
            
            if (a1A.marche !== a1B.marche) {
                return a1A.marche.localeCompare(a1B.marche);
            }
            
            if (a1A.dateDepart !== a1B.dateDepart) {
                return a1A.dateDepart.localeCompare(a1B.dateDepart);
            }

            if (a1A.dateHeureValidite !== a1B.dateHeureValidite) {
                return a1A.dateHeureValidite.localeCompare(a1B.dateHeureValidite);
            }
            
            return (a1A.nature || '').localeCompare(a1B.nature || '');
        });

        for (const eci of ecisTries) {
            const article = eci.a1 || eci;
            
            if (!article.marche || !article.dateDepart) {
                continue;
            }
            
            const cleCourante = `${article.marche}_${article.dateDepart}`;
            
            if (cleCourante !== derniereCle && blocCourant.length > 0) {
                blocs.push(blocCourant);
                blocCourant = [];
            }
            
            blocCourant.push(eci);
            derniereCle = cleCourante;
        }

        if (blocCourant.length > 0) {
            blocs.push(blocCourant);
        }

        return blocs;
    }
}

// Export global
window.ECIProcessor = ECIProcessor; 
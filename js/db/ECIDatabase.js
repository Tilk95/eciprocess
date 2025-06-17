class ECIDatabase {
    constructor() {
        this.db = null;
        this.SQL = null;
    }

    async init() {
        if (!this.SQL) {
            this.SQL = await window.initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
        }
        this.db = new this.SQL.Database();
        this.createTables();
    }

    createTables() {
        // Suppression des tables si elles existent pour recréer avec les bonnes contraintes
        this.db.run(`DROP TABLE IF EXISTS pdt_cireg_jour;`);
        this.db.run(`DROP TABLE IF EXISTS pdt_cireg;`);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS pdt_cireg_jour (
                id_int_cireg_jour INTEGER PRIMARY KEY AUTOINCREMENT,
                id_int_cireg INTEGER NOT NULL,
                service_annuel CHAR(4) NOT NULL,
                marche_depart CHAR(6) NOT NULL,
                date_depart CHAR(8) NOT NULL,
                nature CHAR(1) NOT NULL,
                guid_eci CHAR(32) NOT NULL,
                date_heure_validite CHAR(14) NOT NULL,
                FOREIGN KEY (id_int_cireg) REFERENCES pdt_cireg(id_int_cireg)
            );
        `);

        // Index pour pdt_cireg_jour
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_cireg_jour_search 
            ON pdt_cireg_jour(service_annuel, marche_depart, date_depart, nature);`);
        
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_cireg_jour_guid 
            ON pdt_cireg_jour(guid_eci);`);
        
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_cireg_jour_foreign_key 
            ON pdt_cireg_jour(id_int_cireg);`);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS pdt_cireg (
                id_int_cireg INTEGER PRIMARY KEY AUTOINCREMENT,
                service_annuel CHAR(4) NOT NULL,
                marche_depart CHAR(6) NOT NULL,
                heure_depart CHAR(6) NOT NULL,
                nature CHAR(1) NOT NULL,
                regime_binaire CHAR(400) NOT NULL,
                empreinte_circulation CHAR(64)
            );
        `);

        // Index pour pdt_cireg
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_cireg_empreinte 
            ON pdt_cireg(service_annuel, empreinte_circulation);`);
        
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_cireg_marche 
            ON pdt_cireg(marche_depart);`);
    }

    clearTables() {
        this.db.run('DELETE FROM pdt_cireg_jour;');
        this.db.run('DELETE FROM pdt_cireg;');
    }

    exec(sql, params = []) {
        return this.db.exec(sql, params);
    }

    run(sql, params = []) {
        return this.db.run(sql, params);
    }

    // Pour les requêtes SELECT qui retournent des lignes
    select(sql, params = []) {
        const stmt = this.db.prepare(sql, params);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
}

// Export global pour usage ailleurs
window.ECIDatabase = ECIDatabase; 
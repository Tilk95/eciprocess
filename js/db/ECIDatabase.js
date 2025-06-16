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
        this.db.run(`
            CREATE TABLE IF NOT EXISTS pdt_cireg_jour (
                id_int_cireg_jour INTEGER PRIMARY KEY AUTOINCREMENT,
                id_int_cireg INTEGER,
                service_annuel TEXT,
                marche_depart TEXT,
                date_depart TEXT,
                nature TEXT,
                guid_eci TEXT,
                date_heure_validite TEXT
            );
        `);
        this.db.run(`
            CREATE TABLE IF NOT EXISTS pdt_cireg (
                id_int_cireg INTEGER PRIMARY KEY AUTOINCREMENT,
                service_annuel TEXT,
                marche_depart TEXT,
                heure_depart TEXT,
                nature TEXT,
                regime_binaire TEXT,
                empreinte_circulation TEXT
            );
        `);
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
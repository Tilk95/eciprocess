CREATE TABLE article_a1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    typeArticle TEXT,
    marche TEXT,
    DateDepart TEXT,
    heureDepart TEXT,
    CleAppariement TEXT,
    guidECI TEXT,
    dateDebutValidité TEXT,
    nature TEXT,
    typeECI TEXT,
    guidPH TEXT,
    guidPCT TEXT,
    famille TEXT,
    guidECIASupprimer TEXT,
    serviceAnnuel TEXT,
    raw_line TEXT
);

CREATE TABLE article_a2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    TCT TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a3 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    UI TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a4 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    indiceComposition TEXT,
    mnemoEngRef TEXT,
    tonnageEngRef TEXT,
    nombreEngRef TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a5 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    A TEXT,
    rangModele TEXT,
    demande TEXT,
    VDS TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a6 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    VCO TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a7 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    signeConventionnel TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a8 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModeleDebut TEXT,
    rangModeleFin TEXT,
    FH TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_a9 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    rangModeleDebut TEXT,
    rangModeleFin TEXT,
    codeRenvoi TEXT,
    libelleStandard TEXT,
    libelleLibre TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);

CREATE TABLE article_ae (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    a1_id INTEGER,
    typeArticle TEXT,
    empreinte TEXT,
    raw_line TEXT,
    FOREIGN KEY (a1_id) REFERENCES article_a1(id)
);


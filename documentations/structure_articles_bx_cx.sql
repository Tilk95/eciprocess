CREATE TABLE article_b1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    typeArticle TEXT,
    guidPH TEXT,
    serviceAnnuel TEXT,
    raw_line TEXT
);

CREATE TABLE article_b2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    b1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    codeCI TEXT,
    codeCH TEXT,
    tempsDepuisOrigine TEXT,
    changementParite TEXT,
    natureArret TEXT,
    margeTheorique TEXT,
    margeReelle TEXT,
    rangVoie TEXT,
    raw_line TEXT,
    FOREIGN KEY (b1_id) REFERENCES article_b1(id)
);

CREATE TABLE article_c1 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    typeArticle TEXT,
    guidPCT TEXT,
    serviceAnnuel TEXT,
    raw_line TEXT
);

CREATE TABLE article_c2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    c1_id INTEGER,
    typeArticle TEXT,
    rangModele TEXT,
    voieEntree TEXT,
    voieVia TEXT,
    voieSortie TEXT,
    AKM TEXT,
    raw_line TEXT,
    FOREIGN KEY (c1_id) REFERENCES article_c1(id)
);


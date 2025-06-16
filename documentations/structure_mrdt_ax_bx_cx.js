/*
# Format de chaque tuple : (field, start, length, type, range, exportName,expIndex,label)
*/

window.structure_article_A1 = [
    ["typeArticle",         0,   2, "String", "", "", "", "A1"],
    ["marche",              2,   6, "String", "", "", "", ""],
    ["DateDepart",          8,   8, "string",   "", "", "", "AAAAMMJJ"],
    ["heureDepart",        16,   6, "string",   "", "", "", "HHMMSS"],
    ["CleAppariement",     22,  12, "String", "", "", "", ""],
    ["guidECI",            34,  32, "String", "", "", "", ""],
    ["dateDebutValidité",  66,  14, "String", "", "", "", ""],
    ["nature",             80,   1, "String", "", "", "", ""],
    ["typeECI",            81,   1, "String", "", "", "", ""],
    ["guidPH",             82,  32, "String", "", "", "", ""],
    ["guidPCT",           114,  32, "String", "", "", "", ""],
    ["famille",           146,   2, "String", "", "", "", ""],
    ["guidECIASupprimer",148,  32, "String", "", "", "", ""],
    ["serviceAnnuel",     180,   4, "String", "", "", "", ""]
];

window.structure_article_A2 = [
    ["typeArticle",  0, 2, "String", "", "", "", "A2"],
    ["rangModele",   2, 3, "String", "", "", "", ""],
    ["TCT",          5, 3, "String", "", "", "", ""]
];

window.structure_article_A3 = [
    ["typeArticle",  0, 2, "String", "", "", "", "A3"],
    ["rangModele",   2, 3, "String", "", "", "", ""],
    ["UI",           5, 3, "String", "", "", "", ""]
];

window.structure_article_A4 = [
    ["typeArticle",        0, 2, "String", "", "", "", "A4"],
    ["rangModele",         2, 3, "String", "", "", "", ""],
    ["indiceComposition",  5, 5, "String", "", "", "", ""],
    ["mnemoEngRef",       10, 6, "String", "", "", "", ""],
    ["tonnageEngRef",     16, 6, "String", "", "", "", ""],
    ["nombreEngRef",      22, 1, "String", "", "", "", ""]
];

window.structure_article_A5 = [
    ["A",           0, 2, "String", "", "", "", "A5"],
    ["rangModele",  2, 3, "String", "", "", "", ""],
    ["demande",     5, 6, "String", "", "", "", ""],
    ["VDS",        11, 28, "String", "", "", "", ""]
];

window.structure_article_A6 = [
    ["typeArticle",  0, 2, "String", "", "", "", "A6"],
    ["rangModele",   2, 3, "String", "", "", "", ""],
    ["VCO",          5,10, "String", "", "", "", ""]
];

window.structure_article_A7 = [
    ["typeArticle",         0, 2, "String", "", "", "", "A7"],
    ["rangModele",          2, 3, "String", "", "", "", ""],
    ["signeConventionnel",  5, 3, "String", "", "", "", ""]
];

window.structure_article_A8 = [
    ["typeArticle",       0, 2, "String", "", "", "", "A8"],
    ["rangModeleDebut",   2, 3, "String", "", "", "", ""],
    ["rangModeleFin",     5, 3, "String", "", "", "", ""],
    ["FH",                8, 4, "String", "", "", "", ""]
];

window.structure_article_A9 = [
    ["typeArticle",       0,   2, "String", "", "", "", "A9"],
    ["rangModeleDebut",   2,   3, "String", "", "", "", ""],
    ["rangModeleFin",     5,   3, "String", "", "", "", ""],
    ["codeRenvoi",        8,   4, "String", "", "", "", ""],
    ["libelleStandard",  12,  70, "String", "", "", "", ""],
    ["libelleLibre",     82, 512, "String", "", "", "", ""]
];

window.structure_article_AE = [
    ["typeArticle", 0,  2, "String", "", "", "", "AE"],
    ["empreinte",   2, 64, "String", "", "", "", ""]
];

window.structure_article_B1 = [
    ["typeArticle",    0,  2, "String", "", "", "", "B1"],
    ["guidPH",         2, 32, "String", "", "", "", ""],
    ["serviceAnnuel", 34,  4, "String", "", "", "", ""]
];

window.structure_article_B2 = [
    ["typeArticle",        0,  2, "String", "", "", "", "B2"],
    ["rangModele",         2,  3, "String", "", "", "", ""],
    ["codeCI",             5,  6, "String", "", "", "", ""],
    ["codeCH",            11,  2, "String", "", "", "", ""],
    ["tempsDepuisOrigine",13,  6, "String", "", "", "", ""],
    ["changementParite",  19,  1, "String", "", "", "", ""],
    ["natureArret",       20,  1, "String", "", "", "", ""],
    ["margeTheorique",    21,  9, "String", "", "", "", ""],
    ["margeReelle",       30,  9, "String", "", "", "", ""],
    ["rangVoie",          39,  3, "String", "", "", "", ""]
];

window.structure_article_C1 = [
    ["typeArticle",    0,  2, "String", "", "", "", "C1"],
    ["guidPCT",        2, 32, "String", "", "", "", ""],
    ["serviceAnnuel", 34,  4, "String", "", "", "", ""]
];

window.structure_article_C2 = [
    ["typeArticle",  0,  2, "String", "", "", "", "C2"],
    ["rangModele",   2,  3, "String", "", "", "", ""],
    ["voieEntree",   5,  3, "String", "", "", "", ""],
    ["voieVia",      8,  3, "String", "", "", "", ""],
    ["voieSortie",  11,  3, "String", "", "", "", ""],
    ["AKM",         14,  8, "String", "", "", "", ""]
];

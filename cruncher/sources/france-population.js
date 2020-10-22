// Extracted from https://www.insee.fr/fr/statistiques/1893198

const population = {
  Ain: 656955,
  Aisne: 526050,
  Allier: 331315,
  'Alpes-de-Haute-Provence': 165197,
  'Hautes-Alpes': 141756,
  'Alpes-Maritimes': 1079396,
  Ardèche: 326875,
  Ardennes: 265531,
  Ariège: 152398,
  Aube: 309907,
  Aude: 372705,
  Aveyron: 278360,
  'Bouches-du-Rhône': 2034469,
  Calvados: 691453,
  Cantal: 142811,
  Charente: 348180,
  'Charente-Maritime': 647080,
  Cher: 296404,
  Corrèze: 240336,
  'Corse-du-Sud': 162421,
  'Haute-Corse': 182258,
  "Côte-d'Or": 532886,
  "Côtes d'Armor": 596186,
  Creuse: 116270,
  Dordogne: 408393,
  Doubs: 539449,
  Drôme: 520560,
  Eure: 600687,
  'Eure-et-Loir': 429425,
  Finistère: 906554,
  Gard: 748468,
  'Haute-Garonne': 1400935,
  Gers: 190040,
  Gironde: 1633440,
  Hérault: 1176145,
  'Ille-et-Vilaine': 1082073,
  Indre: 217139,
  'Indre-et-Loire': 605380,
  Isère: 1264979,
  Jura: 257849,
  Landes: 411979,
  'Loir-et-Cher': 327835,
  Loire: 764737,
  'Haute-Loire': 226901,
  'Loire-Atlantique': 1437137,
  Loiret: 682890,
  Lot: 173166,
  'Lot-et-Garonne': 330336,
  Lozère: 76286,
  'Maine-et-Loire': 815881,
  Manche: 490669,
  Marne: 563823,
  'Haute-Marne': 169250,
  Mayenne: 305365,
  'Meurthe-et-Moselle': 730398,
  Meuse: 181641,
  Morbihan: 755566,
  Moselle: 1035866,
  Nièvre: 199596,
  Nord: 2588988,
  Oise: 825077,
  Orne: 276903,
  'Pas-de-Calais': 1452778,
  'Puy-de-Dôme': 660240,
  'Pyrénées-Atlantiques': 683169,
  'Hautes-Pyrénées': 226839,
  'Pyrénées-Orientales': 479000,
  'Bas-Rhin': 1132607,
  'Haut-Rhin': 763204,
  Rhône: 1876051,
  'Haute-Saône': 233194,
  'Saône-et-Loire': 547824,
  Sarthe: 560227,
  Savoie: 432548,
  'Haute-Savoie': 828405,
  Paris: 2148271,
  'Seine-Maritime': 1243788,
  'Seine-et-Marne': 1423607,
  Yvelines: 1448625,
  'Deux-Sèvres': 372627,
  Somme: 569769,
  Tarn: 387898,
  'Tarn-et-Garonne': 262618,
  Var: 1073836,
  Vaucluse: 560997,
  Vendée: 683187,
  Vienne: 437398,
  'Haute-Vienne': 370774,
  Vosges: 359520,
  Yonne: 332096,
  'Territoire-de-Belfort': 140145,
  Essonne: 1319401,
  'Hauts-de-Seine': 1613762,
  'Seine-Saint-Denis': 1670149,
  'Val-de-Marne': 1406041,
  "Val-D'Oise": 1248354,
  Guadeloupe: 376879,
  Martinique: 358749,
  Guyane: 290691,
  'La Réunion': 859959,
  Mayotte: 279471
}

// Extracted from Wikipedia

Object.assign(population, {
  'Saint-Pierre-et-Miquelon': 6274,
  'Saint-Barthélémy': 9793,
  'Saint-Martin': 35334,
  'Polynésie française': 290218,
  'Île de Clipperton': 0,
  'Wallis-et-Futuna': 11558,
  'Nouvelle-Calédonie': 217407,
  'Terres australes et antarctiques françaises': 196
})

export default population

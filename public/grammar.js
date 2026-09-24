import { WORDS } from './vocabulary.js';
import { EXTRA_RULES } from './grammar-topics.js';
import { MORE_RULES } from './grammar-more.js';
import { EXTRA_BANKS, MODAL_MEANINGS } from './grammar-extra.js';

// Each tuple is [prompt, correct answer, distractors]. Templates vary subjects
// and contexts. Curated subsets below keep coverage without padding every topic to 80.
const question = (prompt, answer, choices) => [prompt, answer, [...new Set(choices)].filter(value => value !== answer)];
// Two exercises per item, spread over the round: the first pass alternates the two variants
// (even items get variant A), the second pass gives every item its other variant.
const twoPasses = (items, make) => [0, 1].flatMap(pass => items.map((item, i) => make(item, i, (i + pass) % 2 === 1)));
const subjects = ['Ich', 'Du', 'Er', 'Wir', 'Ihr', 'Die Kinder', 'Anna', 'Anna und Paul'];
const PERSON_ENDINGS = ['e', 'st', 't', 'en', 't', 'en'];
const seinScenarios = [
  ['Ich ___ nach der langen Reise müde.', 'bin'],
  ['Du ___ heute für das Abendessen verantwortlich.', 'bist'],
  ['Der Supermarkt ___ bis acht Uhr geöffnet.', 'ist'],
  ['Wir ___ mit dem Zug in Berlin.', 'sind'],
  ['Ihr ___ als Nächste an der Reihe.', 'seid'],
  ['Die Kinder ___ auf dem Spielplatz.', 'sind'],
  ['Anna ___ Ärztin im Krankenhaus.', 'ist'],
  ['Meine Eltern ___ seit Montag im Urlaub.', 'sind'],
  ['Ich ___ neu in dieser Stadt.', 'bin'],
  ['Du ___ ein guter Freund.', 'bist'],
  ['Der Kaffee ___ noch sehr heiß.', 'ist'],
  ['Wir ___ am Eingang des Museums.', 'sind'],
  ['Ihr ___ zu früh für den Termin.', 'seid'],
  ['Paul und Mia ___ Geschwister.', 'sind'],
  ['Meine Jacke ___ im Auto.', 'ist'],
  ['Die Geschäfte ___ am Sonntag geschlossen.', 'sind'],
  ['Ich ___ 24 Jahre alt.', 'bin'],
  ['Du ___ mit deiner Antwort richtig.', 'bist'],
  ['Unser Hotel ___ direkt am Bahnhof.', 'ist'],
  ['Wir ___ bereit für die Prüfung.', 'sind'],
  ['Ihr ___ gute Gäste.', 'seid'],
  ['Die Bücher ___ in meinem Rucksack.', 'sind'],
  ['Heute ___ Annas Geburtstag.', 'ist'],
  ['Die Nachbarn ___ sehr freundlich.', 'sind'],
  ['Ich ___ froh über die Nachricht.', 'bin'],
  ['Du ___ zu spät für den Bus.', 'bist'],
  ['Das Wetter ___ heute wunderbar.', 'ist'],
  ['Wir ___ Gäste auf einer Hochzeit.', 'sind'],
  ['Ihr ___ am Wochenende in Köln.', 'seid'],
  ['Meine Schlüssel ___ auf dem Küchentisch.', 'sind'],
  ['Der nächste Termin ___ am Dienstag.', 'ist'],
  ['Anna und Paul ___ Eltern von zwei Kindern.', 'sind'],
];
// [subject, person, stem, rest]: regular verbs whose endings attach directly to the stem
// (no -t/-d stems, -s/-z stems or vowel changes). Each verb appears at most twice.
// Person index: 0 ich, 1 du, 2 er / sie / es, 3 wir, 4 ihr, 5 sie (plural).
const presentSentences = [
  ['Ich', 0, 'lern', 'Deutsch'], ['Du', 1, 'wohn', 'in Berlin'], ['Anna', 2, 'mach', 'eine Pause'], ['Wir', 3, 'kauf', 'Brot'],
  ['Ihr', 4, 'spiel', 'Tennis'], ['Die Kinder', 5, 'hör', 'Musik'], ['Tom', 2, 'such', 'den Schlüssel'], ['Meine Eltern', 5, 'brauch', 'Hilfe'],
  ['Ich', 0, 'frag', 'den Lehrer'], ['Du', 1, 'schreib', 'eine E-Mail'], ['Mein Bruder', 2, 'schwimm', 'im See'], ['Wir', 3, 'sing', 'ein Lied'],
  ['Ihr', 4, 'koch', 'das Abendessen'], ['Die Studenten', 5, 'trink', 'viel Kaffee'], ['Frau Weber', 2, 'mal', 'ein Bild'], ['Anna und Paul', 5, 'bezahl', 'die Rechnung'],
  ['Ich', 0, 'frier', 'im Winter'], ['Du', 1, 'hol', 'Brötchen vom Bäcker'], ['Das Kind', 2, 'bleib', 'heute zu Hause'], ['Wir', 3, 'kenn', 'den Weg'],
  ['Ihr', 4, 'denk', 'oft an den Urlaub'], ['Die Nachbarn', 5, 'glaub', 'das nicht'], ['Der Lehrer', 2, 'sag', '„Guten Morgen“'], ['Die Gäste', 5, 'zeig', 'die Fotos'],
  ['Ich', 0, 'steh', 'an der Haltestelle'], ['Du', 1, 'lieg', 'noch im Bett'], ['Opa', 2, 'leg', 'die Zeitung auf den Tisch'], ['Wir', 3, 'stell', 'eine Frage'],
  ['Ihr', 4, 'beginn', 'um acht Uhr'], ['Die Schüler', 5, 'lach', 'oft'], ['Das Baby', 2, 'wein', 'in der Nacht'], ['Tom und Lena', 5, 'bring', 'den Salat'],
  ['Ich', 0, 'rauch', 'nicht'], ['Du', 1, 'besuch', 'die Oma'], ['Mein Vater', 2, 'bestell', 'eine Pizza'], ['Wir', 3, 'flieg', 'nach Wien'],
  ['Ihr', 4, 'frühstück', 'um sieben Uhr'], ['Viele Leute', 5, 'lieb', 'Schokolade'], ['Meine Schwester', 2, 'studier', 'Medizin'], ['Die Kinder', 5, 'telefonier', 'mit der Oma'],
  ['Ich', 0, 'versteh', 'die Frage nicht'], ['Du', 1, 'wiederhol', 'den Satz'], ['Die Sekretärin', 2, 'buchstabier', 'den Namen'], ['Wir', 3, 'bekomm', 'ein Geschenk'],
  ['Ihr', 4, 'schick', 'eine Nachricht'], ['Meine Freunde', 5, 'verkauf', 'das Auto'], ['Paul', 2, 'dusch', 'am Morgen'], ['Meine Großeltern', 5, 'leb', 'in der Schweiz'],
  ['Ich', 0, 'spül', 'das Geschirr'], ['Du', 1, 'üb', 'die Wörter'], ['Die Kassiererin', 2, 'zähl', 'das Geld'], ['Wir', 3, 'hoff', 'auf gutes Wetter'],
  ['Ihr', 4, 'fehl', 'heute im Kurs'], ['Die Kinder', 5, 'schenk', 'der Mutter Blumen'], ['Oma', 2, 'erzähl', 'eine Geschichte'], ['Die Mechaniker', 5, 'reparier', 'den Bus'],
  ['Ich', 0, 'park', 'vor dem Haus'], ['Du', 1, 'probier', 'den Kuchen'], ['Frau Klein', 2, 'buch', 'ein Hotel'], ['Wir', 3, 'jogg', 'im Park'],
  ['Ihr', 4, 'fotografier', 'die Kirche'], ['Die Gäste', 5, 'komm', 'aus Italien'], ['Lena', 2, 'geh', 'zu Fuß zur Arbeit'], ['Die Schüler', 5, 'mach', 'die Hausaufgaben'],
  ['Ich', 0, 'lern', 'für die Prüfung'], ['Du', 1, 'kauf', 'ein neues Handy'], ['Der Nachbar', 2, 'hör', 'laut Radio'], ['Wir', 3, 'such', 'eine Wohnung'],
  ['Ihr', 4, 'spiel', 'Gitarre'], ['Meine Eltern', 5, 'trink', 'Tee ohne Zucker'], ['Das Mädchen', 2, 'sing', 'im Chor'], ['Die Touristen', 5, 'besuch', 'das Museum'],
  ['Ich', 0, 'bestell', 'zwei Kaffee'], ['Du', 1, 'komm', 'heute später'], ['Herr Braun', 2, 'wohn', 'allein'], ['Wir', 3, 'koch', 'Nudeln'],
  ['Ihr', 4, 'schreib', 'einen Brief'], ['Die Kinder', 5, 'schwimm', 'gern'], ['Anna', 2, 'brauch', 'einen neuen Pass'], ['Meine Freunde', 5, 'hol', 'die Getränke'],
];

// [frame, gender, noun, sentence end]: every noun keeps its singular form (no weak nouns),
// and each frame pairs a fitting verb with its object.
const accusativePairs = [
  ['Ich trinke', 'der', 'Saft'], ['Du isst', 'das', 'Ei'], ['Wir kaufen', 'der', 'Kühlschrank'], ['Anna trägt', 'der', 'Rock'],
  ['Paul sucht', 'der', 'Kuli'], ['Ich brauche', 'der', 'Regenschirm'], ['Die Kinder möchten', 'der', 'Ball'], ['Lena packt', 'der', 'Koffer'],
  ['Wir bestellen', 'der', 'Tee'], ['Mein Opa liest', 'das', 'Buch'], ['Du hast', 'der', 'Pass'], ['Ich nehme', 'der', 'Löffel'],
  ['Tom öffnet', 'die', 'Flasche'], ['Wir mieten', 'das', 'Auto'], ['Ich finde', 'der', 'Stift'], ['Meine Schwester kauft', 'der', 'Pullover'],
  ['Du siehst', 'der', 'Bahnhof'], ['Wir besuchen', 'der', 'Onkel'], ['Ich habe', 'der', 'Termin'], ['Frau Weber fragt', 'der', 'Lehrer'],
  ['Die Studenten brauchen', 'der', 'Computer'], ['Wir tragen', 'der', 'Tisch'], ['Anna schreibt', 'die', 'Postkarte'], ['Du nimmst', 'die', 'Tasse'],
  ['Ich spüle', 'das', 'Glas'], ['Paul malt', 'der', 'Baum'], ['Wir hören', 'das', 'Lied'], ['Opa repariert', 'der', 'Stuhl'],
  ['Ich suche', 'der', 'Schrank'], ['Die Kinder essen', 'die', 'Banane'], ['Lena backt', 'die', 'Pizza'], ['Kennst du', 'der', 'Mann', '?'],
  ['Ich schenke Anna', 'der', 'Hut'], ['Wir sehen', 'das', 'Haus'], ['Tom holt', 'der', 'Rucksack'], ['Ich verkaufe', 'der', 'Fernseher'],
  ['Meine Eltern haben', 'der', 'Garten'], ['Hast du', 'der', 'Bleistift', '?'], ['Wir suchen', 'der', 'Teppich'], ['Paul bringt', 'die', 'Gabel'],
];
function accusativeQuestions() {
  return twoPasses(accusativePairs, ([frame, article, noun, end = '.'], i, indefinite) => {
    const definite = !indefinite;
    const forms = definite ? { der: 'den', die: 'die', das: 'das' } : { der: 'einen', die: 'eine', das: 'ein' };
    const choices = definite ? ['der', 'die', 'das', 'den', 'dem'] : ['ein', 'eine', 'einen', 'einem', 'einer'];
    return question(`${frame} ___ ${noun}${end} (${definite ? 'the' : 'a / an'})`, forms[article], choices);
  });
}

const dativeVerbs = {
  fahren: ['fahre', 'fährst', 'fahren', 'fahrt'],
  sprechen: ['spreche', 'sprichst', 'sprechen', 'sprecht'],
  helfen: ['helfe', 'hilfst', 'helfen', 'helft'],
  geben: ['gebe', 'gibst', 'geben', 'gebt'],
  wohnen: ['wohne', 'wohnst', 'wohnen', 'wohnt'],
  gehen: ['gehe', 'gehst', 'gehen', 'geht'],
  kommen: ['komme', 'kommst', 'kommen', 'kommt'],
  warten: ['warte', 'wartest', 'warten', 'wartet'],
  stehen: ['stehe', 'stehst', 'stehen', 'steht'],
  sitzen: ['sitze', 'sitzt', 'sitzen', 'sitzt'],
  schreiben: ['schreibe', 'schreibst', 'schreiben', 'schreibt'],
  schenken: ['schenke', 'schenkst', 'schenken', 'schenkt'],
  zeigen: ['zeige', 'zeigst', 'zeigen', 'zeigt'],
  bringen: ['bringe', 'bringst', 'bringen', 'bringt'],
  erklären: ['erkläre', 'erklärst', 'erklären', 'erklärt'],
  danken: ['danke', 'dankst', 'danken', 'dankt'],
  antworten: ['antworte', 'antwortest', 'antworten', 'antwortet'],
  gratulieren: ['gratuliere', 'gratulierst', 'gratulieren', 'gratuliert'],
  spielen: ['spiele', 'spielst', 'spielen', 'spielt'],
  liegen: ['liege', 'liegst', 'liegen', 'liegt'],
  arbeiten: ['arbeite', 'arbeitest', 'arbeiten', 'arbeitet'],
  essen: ['esse', 'isst', 'essen', 'esst'],
  telefonieren: ['telefoniere', 'telefonierst', 'telefonieren', 'telefoniert'],
};
const dativeContexts = [
  ['fahren', 'mit ___ Bus', 'der'], ['fahren', 'mit ___ Zug', 'der'],
  ['sprechen', 'mit ___ Frau', 'die'], ['sprechen', 'mit ___ Arzt', 'der'],
  ['helfen', '___ Kind', 'das'], ['helfen', '___ Freundin', 'die'],
  ['geben', '___ Mann ein Buch', 'der'], ['geben', '___ Frau den Schlüssel', 'die'],
  ['wohnen', 'bei ___ Familie', 'die'], ['wohnen', 'bei ___ Freund', 'der'],
  ['gehen', 'zu ___ Bahnhof', 'der'], ['gehen', 'zu ___ Schule', 'die'],
  ['kommen', 'aus ___ Haus', 'das'], ['kommen', 'aus ___ Küche', 'die'],
  ['kommen', 'von ___ Ausstellung', 'die'], ['warten', 'vor ___ Kino', 'das'],
  ['stehen', 'neben ___ Tisch', 'der'], ['stehen', 'hinter ___ Tür', 'die'],
  ['sitzen', 'auf ___ Stuhl', 'der'], ['sitzen', 'neben ___ Fenster', 'das'],
  ['schreiben', '___ Freund einen Brief', 'der'], ['schenken', '___ Mutter Blumen', 'die'],
  ['zeigen', '___ Gast das Zimmer', 'der'], ['bringen', '___ Kind ein Glas Wasser', 'das'],
  ['erklären', '___ Schülerin die Aufgabe', 'die'], ['danken', '___ Lehrer', 'der'],
  ['antworten', '___ Kollegin', 'die'], ['gratulieren', '___ Nachbarin', 'die'],
  ['fahren', 'mit ___ Taxi', 'das'], ['spielen', 'mit ___ Hund', 'der'],
  ['sprechen', 'mit ___ Verkäuferin', 'die'], ['kommen', 'aus ___ Büro', 'das'],
  ['sitzen', 'unter ___ Baum', 'der'], ['warten', 'vor ___ Bäckerei', 'die'],
  ['stehen', 'vor ___ Supermarkt', 'der'], ['wohnen', 'neben ___ Kirche', 'die'],
  ['liegen', 'auf ___ Sofa', 'das'], ['arbeiten', 'in ___ Firma', 'die'],
  ['essen', 'mit ___ Löffel', 'der'], ['telefonieren', 'mit ___ Ärztin', 'die'],
];

const MODAL_FORMS = {
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können', 'kann', 'können'],
  müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen', 'muss', 'müssen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen', 'will', 'wollen'],
};
// Every activity appears once; the subject cycles through all eight persons.
const modalActivities = {
  können: ['Deutsch sprechen', 'gut schwimmen', 'heute nicht kommen', 'Gitarre spielen', 'schnell laufen', 'sehr gut kochen', 'Auto fahren',
    'hier warten', 'morgen helfen', 'den Text lesen', 'gut singen', 'Ski fahren', 'das Wort buchstabieren', 'leider nicht bleiben', 'gut tanzen',
    'Fußball spielen', 'Kuchen backen', 'das Formular ausfüllen', 'bis hundert zählen', 'ein Pferd malen', 'den Weg finden', 'Englisch verstehen',
    'die Tür öffnen', 'gut zeichnen', 'am Montag arbeiten', 'die Rechnung bezahlen', 'heute Abend telefonieren'],
  müssen: ['früh aufstehen', 'heute arbeiten', 'jetzt gehen', 'zum Arzt gehen', 'viel lernen', 'die Hausaufgaben machen', 'den Bus nehmen',
    'die Küche putzen', 'lange warten', 'Tabletten nehmen', 'das Zimmer aufräumen', 'die Oma besuchen', 'heute kochen', 'den Schlüssel suchen',
    'eine E-Mail schreiben', 'zur Schule gehen', 'pünktlich sein', 'leise sein', 'die Wörter wiederholen', 'eine Pause machen',
    'das Fahrrad reparieren', 'im Büro bleiben', 'Brot kaufen', 'die Miete bezahlen', 'den Müll wegbringen', 'das Formular unterschreiben',
    'das Fenster schließen'],
  wollen: ['Pizza essen', 'nach Berlin fahren', 'ein Eis kaufen', 'ins Kino gehen', 'am Samstag tanzen', 'eine Reise machen', 'im Garten spielen',
    'ein Haus kaufen', 'Tennis spielen', 'einen Hund haben', 'heute Abend fernsehen', 'nach Hause gehen', 'Freunde treffen', 'ein Buch lesen',
    'Spanisch lernen', 'im See schwimmen', 'Musik hören', 'am Meer wohnen', 'lange schlafen', 'eine Wohnung mieten', 'neue Schuhe kaufen',
    'die Oma anrufen', 'ein Foto machen', 'Tee trinken', 'eine Party feiern', 'mit dem Zug fahren'],
};
// Rotate können → müssen → wollen so neighbouring exercises use different modals.
const modalSentences = Array.from({ length: 80 }, (_, i) => {
  const verb = ['können', 'müssen', 'wollen'][i % 3];
  return [verb, modalActivities[verb][Math.floor(i / 3)]];
});

// Explicit subjects avoid the ambiguous singular/plural "sie".
const clauses = [
  ['ich', 'lerne', 'Deutsch', 'lernen'], ['du', 'kaufst', 'Brot', 'kaufen'],
  ['Anna', 'trinkt', 'Tee', 'trinken'], ['wir', 'spielen', 'Tennis', 'spielen'],
  ['ihr', 'kocht', 'Suppe', 'kochen'], ['Paul', 'liest', 'ein Buch', 'lesen'],
  ['die Kinder', 'machen', 'eine Pause', 'machen'], ['ich', 'höre', 'Musik', 'hören'],
  ['du', 'suchst', 'den Schlüssel', 'suchen'], ['Anna', 'braucht', 'Hilfe', 'brauchen'],
  ['wir', 'besuchen', 'das Museum', 'besuchen'], ['ihr', 'schreibt', 'einen Brief', 'schreiben'],
  ['Paul', 'öffnet', 'das Fenster', 'öffnen'], ['die Kinder', 'essen', 'Obst', 'essen'],
  ['ich', 'sehe', 'den Bus', 'sehen'], ['du', 'findest', 'die Tasche', 'finden'],
  ['Anna', 'macht', 'Kaffee', 'machen'], ['wir', 'sehen', 'einen Film', 'sehen'],
  ['ihr', 'übt', 'Deutsch', 'üben'], ['Paul', 'holt', 'das Fahrrad', 'holen'],
  ['du', 'spielst', 'Gitarre', 'spielen'], ['Anna', 'fährt', 'nach Hamburg', 'fahren'],
  ['wir', 'kochen', 'Nudeln', 'kochen'], ['ihr', 'besucht', 'die Oma', 'besuchen'],
  ['die Kinder', 'spielen', 'im Garten', 'spielen'], ['ich', 'schreibe', 'eine Postkarte', 'schreiben'],
  ['du', 'kaufst', 'Blumen', 'kaufen'], ['Anna', 'schwimmt', 'im See', 'schwimmen'],
  ['wir', 'fliegen', 'nach Spanien', 'fliegen'], ['ihr', 'tanzt', 'im Club', 'tanzen'],
  ['Paul', 'repariert', 'das Auto', 'reparieren'], ['die Kinder', 'schlafen', 'sehr lange', 'schlafen'],
  ['ich', 'bezahle', 'die Rechnung', 'bezahlen'], ['du', 'wartest', 'auf den Bus', 'warten'],
  ['Anna', 'singt', 'im Chor', 'singen'], ['wir', 'bleiben', 'zu Hause', 'bleiben'],
  ['ihr', 'lernt', 'für den Test', 'lernen'], ['Paul', 'arbeitet', 'im Büro', 'arbeiten'],
  ['die Kinder', 'malen', 'ein Bild', 'malen'], ['ich', 'gehe', 'ins Kino', 'gehen'],
];
// Each clause appears with two different time phrases.
const timePhrases = ['Heute', 'Am Montag', 'Am Abend', 'Morgen', 'Jetzt', 'Am Wochenende', 'Um acht Uhr', 'Im Sommer', 'Danach'];

// [infinitive, participle, auxiliary, context, first-person present, preterite]
const perfectVerbs = [
  ['lernen', 'gelernt', 'haben', 'Deutsch', 'lerne', 'lernte'],
  ['kaufen', 'gekauft', 'haben', 'Brot', 'kaufe', 'kaufte'],
  ['machen', 'gemacht', 'haben', 'eine Pause', 'mache', 'machte'],
  ['spielen', 'gespielt', 'haben', 'Tennis', 'spiele', 'spielte'],
  ['kochen', 'gekocht', 'haben', 'Suppe', 'koche', 'kochte'],
  ['hören', 'gehört', 'haben', 'Musik', 'höre', 'hörte'],
  ['suchen', 'gesucht', 'haben', 'den Schlüssel', 'suche', 'suchte'],
  ['arbeiten', 'gearbeitet', 'haben', 'im Büro', 'arbeite', 'arbeitete'],
  ['trinken', 'getrunken', 'haben', 'Tee', 'trinke', 'trank'],
  ['essen', 'gegessen', 'haben', 'Obst', 'esse', 'aß'],
  ['lesen', 'gelesen', 'haben', 'ein Buch', 'lese', 'las'],
  ['schreiben', 'geschrieben', 'haben', 'einen Brief', 'schreibe', 'schrieb'],
  ['sehen', 'gesehen', 'haben', 'einen Film', 'sehe', 'sah'],
  ['finden', 'gefunden', 'haben', 'die Tasche', 'finde', 'fand'],
  ['besuchen', 'besucht', 'haben', 'das Museum', 'besuche', 'besuchte'],
  ['gehen', 'gegangen', 'sein', 'nach Hause', 'gehe', 'ging'],
  ['fahren', 'gefahren', 'sein', 'nach Berlin', 'fahre', 'fuhr'],
  ['kommen', 'gekommen', 'sein', 'zu spät', 'komme', 'kam'],
  ['bleiben', 'geblieben', 'sein', 'zu Hause', 'bleibe', 'blieb'],
  ['aufstehen', 'aufgestanden', 'sein', 'früh', 'stehe auf', 'stand auf'],
  ['tanzen', 'getanzt', 'haben', 'im Club', 'tanze', 'tanzte'],
  ['wohnen', 'gewohnt', 'haben', 'in Wien', 'wohne', 'wohnte'],
  ['bezahlen', 'bezahlt', 'haben', 'die Rechnung', 'bezahle', 'bezahlte'],
  ['fragen', 'gefragt', 'haben', 'den Lehrer', 'frage', 'fragte'],
  ['warten', 'gewartet', 'haben', 'lange', 'warte', 'wartete'],
  ['schlafen', 'geschlafen', 'haben', 'gut', 'schlafe', 'schlief'],
  ['sprechen', 'gesprochen', 'haben', 'mit dem Lehrer', 'spreche', 'sprach'],
  ['nehmen', 'genommen', 'haben', 'den Bus', 'nehme', 'nahm'],
  ['helfen', 'geholfen', 'haben', 'der Nachbarin', 'helfe', 'half'],
  ['singen', 'gesungen', 'haben', 'ein Lied', 'singe', 'sang'],
  ['bringen', 'gebracht', 'haben', 'Blumen', 'bringe', 'brachte'],
  ['anrufen', 'angerufen', 'haben', 'die Oma', 'rufe an', 'rief an'],
  ['einkaufen', 'eingekauft', 'haben', 'im Supermarkt', 'kaufe ein', 'kaufte ein'],
  ['fliegen', 'geflogen', 'sein', 'nach Rom', 'fliege', 'flog'],
  ['laufen', 'gelaufen', 'sein', 'in den Park', 'laufe', 'lief'],
  ['ankommen', 'angekommen', 'sein', 'spät', 'komme an', 'kam an'],
  ['reisen', 'gereist', 'sein', 'nach Italien', 'reise', 'reiste'],
  ['wandern', 'gewandert', 'sein', 'in den Bergen', 'wandere', 'wanderte'],
  ['einschlafen', 'eingeschlafen', 'sein', 'sofort', 'schlafe ein', 'schlief ein'],
  ['aufwachen', 'aufgewacht', 'sein', 'früh', 'wache auf', 'wachte auf'],
];

// [subject, rest, verb, wrong verb form, main clause for weil]. Each clause is practised once as a
// reported statement (dass) and once as a reason whose main clause it actually explains.
const reasons = [
  ['ich', 'müde', 'bin', 'bist', 'Ich gehe ins Bett'], ['du', 'krank', 'bist', 'bin', 'Du bleibst zu Hause'],
  ['Anna', 'Hunger', 'hat', 'habe', 'Anna geht in die Küche'], ['wir', 'Zeit', 'haben', 'hat', 'Wir gehen spazieren'],
  ['ihr', 'Hilfe', 'braucht', 'brauchen', 'Ich komme zu euch'], ['Paul', 'Deutsch', 'lernt', 'lernen', 'Paul kauft ein Wörterbuch'],
  ['die Kinder', 'zu Hause', 'sind', 'ist', 'Es ist laut'], ['ich', 'Kaffee', 'trinke', 'trinkt', 'Ich bin wach'],
  ['du', 'in Berlin', 'wohnst', 'wohnen', 'Wir fahren nach Berlin'], ['Anna', 'heute', 'arbeitet', 'arbeiten', 'Anna hat keine Zeit'],
  ['wir', 'Brot', 'kaufen', 'kauft', 'Wir gehen zum Bäcker'], ['ihr', 'Musik', 'hört', 'hören', 'Ihr hört mich nicht'],
  ['Paul', 'Suppe', 'kocht', 'kochen', 'Es riecht gut'], ['die Kinder', 'Tennis', 'spielen', 'spielt', 'Die Kinder sind im Park'],
  ['ich', 'den Schlüssel', 'suche', 'sucht', 'Ich komme zu spät'], ['du', 'eine Pause', 'brauchst', 'brauchen', 'Du setzt dich hin'],
  ['Anna', 'ein Buch', 'liest', 'lesen', 'Anna ist ganz leise'], ['wir', 'einen Brief', 'schreiben', 'schreibt', 'Wir brauchen eine Briefmarke'],
  ['ihr', 'heute', 'kommt', 'kommen', 'Ich koche viel'], ['Paul', 'den Bus', 'nimmt', 'nehmen', 'Paul ist pünktlich'],
  ['ich', 'keine Zeit', 'habe', 'hat', 'Ich komme nicht mit'], ['du', 'heute Geburtstag', 'hast', 'habe', 'Ich backe einen Kuchen'],
  ['Anna', 'in Wien', 'wohnt', 'wohnen', 'Anna spricht Deutsch'], ['wir', 'müde', 'sind', 'ist', 'Wir gehen früh schlafen'],
  ['ihr', 'jeden Tag', 'übt', 'üben', 'Ihr spielt sehr gut'], ['Paul', 'krank', 'ist', 'sind', 'Paul geht zum Arzt'],
  ['die Kinder', 'Durst', 'haben', 'hat', 'Ich kaufe Wasser'], ['ich', 'am Wochenende', 'arbeite', 'arbeitet', 'Ich habe am Montag frei'],
  ['du', 'gern', 'tanzt', 'tanzen', 'Du gehst oft in den Club'], ['Anna', 'viel', 'schläft', 'schlafen', 'Anna ist nie müde'],
  ['wir', 'heute', 'feiern', 'feiert', 'Wir kaufen Getränke'], ['ihr', 'im Park', 'joggt', 'joggen', 'Ihr seid fit'],
  ['Paul', 'schnell', 'fährt', 'fahren', 'Paul ist schon da'], ['die Kinder', 'draußen', 'spielen', 'spielt', 'Die Kinder sind glücklich'],
  ['ich', 'oft Termine', 'vergesse', 'vergisst', 'Ich schreibe alles auf'], ['du', 'die Antwort', 'weißt', 'weiß', 'Du hebst die Hand'],
  ['Anna', 'einen Hund', 'hat', 'haben', 'Anna geht oft spazieren'], ['wir', 'den Zug', 'nehmen', 'nimmt', 'Wir brauchen kein Auto'],
  ['ihr', 'zu spät', 'kommt', 'kommen', 'Der Lehrer ist böse'], ['die Kinder', 'Ferien', 'haben', 'hat', 'Die Schule ist leer'],
];
const dassFrames = ['Ich weiß, dass', 'Es stimmt, dass', 'Ich glaube, dass', 'Er sagt, dass'];

// [base, comparative, superlative, comparative context, superlative context]
const comparisons = [
  ['groß', 'größer', 'am größten', 'Dieses Haus ist ___ als das andere.', 'Von allen Häusern ist dieses ___.'],
  ['klein', 'kleiner', 'am kleinsten', 'Dieses Zimmer ist ___ als das andere.', 'Von allen Zimmern ist dieses ___.'],
  ['alt', 'älter', 'am ältesten', 'Paul ist ___ als Anna.', 'Von allen Kindern ist Paul ___.'],
  ['jung', 'jünger', 'am jüngsten', 'Anna ist ___ als Paul.', 'Von allen Kindern ist Anna ___.'],
  ['schnell', 'schneller', 'am schnellsten', 'Dieser Zug fährt ___ als der Bus.', 'Von allen Zügen fährt dieser ___.'],
  ['langsam', 'langsamer', 'am langsamsten', 'Dieser Bus fährt ___ als der Zug.', 'Von allen Bussen fährt dieser ___.'],
  ['warm', 'wärmer', 'am wärmsten', 'Heute ist es ___ als gestern.', 'Von allen Zimmern ist dieses ___.'],
  ['kalt', 'kälter', 'am kältesten', 'Heute ist es ___ als gestern.', 'Von allen Zimmern ist dieses ___.'],
  ['heiß', 'heißer', 'am heißesten', 'Dieser Tee ist ___ als der Kaffee.', 'Von allen Getränken ist dieser Tee ___.'],
  ['lang', 'länger', 'am längsten', 'Dieser Weg ist ___ als der andere.', 'Von allen Wegen ist dieser ___.'],
  ['kurz', 'kürzer', 'am kürzesten', 'Dieser Weg ist ___ als der andere.', 'Von allen Wegen ist dieser ___.'],
  ['leicht', 'leichter', 'am leichtesten', 'Diese Tasche ist ___ als der Koffer.', 'Von allen Taschen ist diese ___.'],
  ['schwer', 'schwerer', 'am schwersten', 'Dieser Koffer ist ___ als die Tasche.', 'Von allen Koffern ist dieser ___.'],
  ['billig', 'billiger', 'am billigsten', 'Dieses Buch ist ___ als das andere.', 'Von allen Büchern ist dieses ___.'],
  ['teuer', 'teurer', 'am teuersten', 'Dieses Auto ist ___ als das andere.', 'Von allen Autos ist dieses ___.'],
  ['gut', 'besser', 'am besten', 'Dieses Brot schmeckt ___ als das andere.', 'Von allen Broten schmeckt dieses ___.'],
  ['hoch', 'höher', 'am höchsten', 'Dieser Berg ist ___ als der andere.', 'Von allen Bergen ist dieser ___.'],
  ['nah', 'näher', 'am nächsten', 'Die Schule ist ___ als der Bahnhof.', 'Von allen Schulen ist diese ___.'],
  ['stark', 'stärker', 'am stärksten', 'Dieser Kaffee ist ___ als der Tee.', 'Von allen Kaffees ist dieser ___.'],
  ['oft', 'öfter', 'am häufigsten', 'Anna übt ___ als Paul.', 'Von allen Kindern übt Anna ___.'],
];

const banks = {
  sein: seinScenarios.map(([prompt, answer]) => question(prompt, answer, ['bin', 'bist', 'ist', 'sind', 'seid'])),
  present: presentSentences.map(([subject, person, stem, rest]) => question(`${subject} ${stem}___ ${rest}.`, PERSON_ENDINGS[person], ['e', 'st', 't', 'en'])),
  articles: WORDS.filter(word => word.pos === 'noun').slice(0, 80).map(word => {
    const [article, ...noun] = word.de.split(' ');
    return question(`___ ${noun.join(' ')} (nominative: the)`, article, ['der', 'die', 'das', 'den']);
  }),
  accusative: accusativeQuestions(),
  modal: modalSentences.map(([verb, activity], i) => question(`${subjects[i % 8]} ___ ${activity}. (${MODAL_MEANINGS[verb]})`, MODAL_FORMS[verb][i % 8], MODAL_FORMS[verb])),
  // Each clause appears twice, once per half of the round, with a different time phrase.
  wordorder: twoPasses(clauses, ([subject, verb, rest], i, second) => {
    const time = timePhrases[(2 * i + (second ? 1 : 0)) % timePhrases.length];
    return question(
      // Only the sentence-initial capital is dropped: am Montag, not am montag.
      `Choose the correct statement: ${time[0].toLowerCase()}${time.slice(1)} / ${subject} / ${verb} / ${rest}`,
      `${time} ${verb} ${subject} ${rest}.`,
      [`${time} ${subject} ${verb} ${rest}.`, `${time} ${subject} ${rest} ${verb}.`, `${time} ${rest} ${subject} ${verb}.`],
    );
  }),
  // Each verb gets one auxiliary item and one participle item, in separate halves of the round.
  perfect: twoPasses(perfectVerbs, ([infinitive, participle, auxiliary, context, present, past], i, participleItem) => {
    const sein = auxiliary === 'sein';
    if (participleItem) return i % 2 === 0
      ? question(`Anna ${sein ? 'ist' : 'hat'} ${context} ___. (${infinitive}, Perfekt)`, participle, [infinitive, present, past])
      : question(`Du ${sein ? 'bist' : 'hast'} ${context} ___. (${infinitive}, Perfekt)`, participle, [infinitive, present, past]);
    return i % 2 === 0
      ? question(`Ich ___ ${context} ${participle}. (Perfekt)`, sein ? 'bin' : 'habe', ['bin', 'habe', 'ist', 'hat'])
      : question(`Wir ___ ${context} ${participle}. (Perfekt)`, sein ? 'sind' : 'haben', ['sind', 'haben', 'seid', 'habt']);
  }),
  // Each context appears once with the (ich / du) and once with a / an (wir / ihr).
  dative: twoPasses(dativeContexts, ([verb, context, article], c, indefinite) => {
    const i = (indefinite ? 2 : 0) + Math.floor(c / 2) % 2, subject = ['Ich', 'Du', 'Wir', 'Ihr'][i];
    const definite = i < 2;
    const forms = definite ? { der: 'dem', die: 'der', das: 'dem' } : { der: 'einem', die: 'einer', das: 'einem' };
    return question(`${subject} ${dativeVerbs[verb][i]} ${context}. (${definite ? 'the' : 'a / an'})`, forms[article],
      definite ? ['der', 'die', 'das', 'den', 'dem'] : ['ein', 'eine', 'einen', 'einem', 'einer']);
  }),
  // First pass: even clauses with dass, odd with weil; the second pass swaps them.
  because: twoPasses(reasons, ([subject, rest, verb, wrongVerb, mainClause], i, useWeil) => question(
    `${useWeil ? `${mainClause}, weil` : dassFrames[i % dassFrames.length]} ___. (${subject} / ${verb} / ${rest})`, `${subject} ${rest} ${verb}`,
    [`${subject} ${verb} ${rest}`, `${verb} ${subject} ${rest}`, `${subject} ${rest} ${wrongVerb}`],
  )),
  comparative: comparisons.flatMap(([base, comparative, superlative, comparativeContext, superlativeContext]) => [
    question(`Choose the comparative of “${base}”.`, comparative, [base, superlative, `${comparative}e`]),
    question(`Choose the superlative with “am” of “${base}”.`, superlative, [base, comparative, `am ${comparative}`]),
    question(`${comparativeContext} (${base})`, comparative, [base, superlative, `${comparative}e`]),
    question(`${superlativeContext} (${base}; superlative)`, superlative, [base, comparative, `am ${comparative}`]),
  ]),
};

export const RULES = [
  { id: 'sein', level: 'A1', title: 'sein — to be', desc: 'ich bin, du bist, er/sie ist…', tip: 'Choose the form of sein that matches the subject.' },
  { id: 'present', level: 'A1', title: 'Verbkonjugation — present tense', desc: 'Regular verb endings; sein and modals have their own rules', tip: 'Remove -en and add: -e, -st, -t, -en, -t, -en. After -t, -d or consonant + n add an e (du arbeitest, er öffnet); after -s, -ß or -z, du adds only -t (du heißt).' },
  { id: 'articles', level: 'A1', title: 'Articles: der, die, das', desc: 'Gender and definite articles', tip: 'Choose the nominative article. Learn every noun together with its article.' },
  { id: 'accusative', level: 'A1', title: 'Accusative case', desc: 'Direct objects and einen', tip: 'Only masculine articles change: der → den, ein → einen. Use the / a hint to select the article type.' },
  { id: 'modal', level: 'A1', title: 'Modal verbs', desc: 'können, müssen, wollen, dürfen, sollen, möchten', tip: 'Conjugate the modal verb for the subject; the other verb stays in the infinitive at the end. The English cue names the modal.' },
  { id: 'wordorder', level: 'A1', title: 'Word order', desc: 'Verb in position 2', tip: 'In a statement, the conjugated verb stays in the second position.' },
  { id: 'perfect', level: 'A2', title: 'Perfect tense', desc: 'haben/sein + past participle', tip: 'Use sein for going, coming, travelling and staying; otherwise these exercises use haben.' },
  { id: 'dative', level: 'A2', title: 'Dative case', desc: 'Indirect objects, prepositions and locations', tip: 'Dative articles: dem / der / dem. Use dative after helfen, for recipients with geben, after mit / bei / zu / aus / von, and for static locations.' },
  { id: 'because', level: 'A2', title: 'Kausalsätze & dass', desc: 'Reasons with weil; statements with dass', tip: 'After weil or dass, put the conjugated verb at the end.' },
  { id: 'comparative', level: 'A2', title: 'Komparativ & Superlativ', desc: 'größer, besser, am besten', tip: 'Use the comparative with als, and am + superlative for the highest degree.' },
].map(rule => {
  const retained = (_, i) => ({
  sein: i < 32, articles: i < 48, comparative: i % 4 >= 2,
  })[rule.id];
  const previous = banks[rule.id].filter(retained);
  // Keep the existing sequence first so unfinished first cycles resume in place.
  return { ...rule, qs: rule.id === 'sein' ? previous : previous.concat(banks[rule.id].filter((q, i) => !retained(q, i))) };
}).concat(EXTRA_RULES, MORE_RULES).map(rule => ({ ...rule, extra: EXTRA_BANKS[rule.id] || [] }));

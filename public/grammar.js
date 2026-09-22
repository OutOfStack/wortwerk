import { WORDS } from './vocabulary.js';
import { EXTRA_RULES } from './grammar-topics.js';
import { MORE_RULES } from './grammar-more.js';
import { EXTRA_BANKS } from './grammar-extra.js';

// Each tuple is [prompt, correct answer, distractors]. Templates vary subjects
// and contexts. Curated subsets below keep coverage without padding every topic to 80.
const question = (prompt, answer, choices) => [prompt, answer, [...new Set(choices)].filter(value => value !== answer)];
const subjects = ['Ich', 'Du', 'Er', 'Wir', 'Ihr', 'Die Kinder', 'Anna', 'Anna und Paul'];
const endings = ['e', 'st', 't', 'en', 't', 'en', 't', 'en'];
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
const regularVerbs = [
  ['lern', 'Deutsch'], ['wohn', 'in Berlin'], ['mach', 'eine Pause'], ['kauf', 'Brot'],
  ['spiel', 'Tennis'], ['koch', 'Suppe'], ['hör', 'Musik'], ['such', 'den Schlüssel'],
  ['brauch', 'Hilfe'], ['frag', 'den Lehrer'],
];

// Singular, non-weak nouns: noun endings remain stable in these article exercises.
const caseNouns = [
  ['der', 'Tisch'], ['die', 'Tasche'], ['das', 'Buch'], ['der', 'Stuhl'],
  ['die', 'Lampe'], ['das', 'Fenster'], ['der', 'Schrank'], ['die', 'Jacke'],
  ['das', 'Auto'], ['der', 'Ball'], ['die', 'Uhr'], ['das', 'Bild'],
  ['der', 'Mantel'], ['die', 'Tür'], ['das', 'Fahrrad'], ['der', 'Schlüssel'],
  ['die', 'Brille'], ['das', 'Hemd'], ['der', 'Hut'], ['die', 'Zeitung'],
];
const accusativeFrames = ['Ich sehe', 'Wir brauchen', 'Anna sucht', 'Paul findet'];
function accusativeQuestions() {
  return caseNouns.flatMap(([article, noun]) => accusativeFrames.map((frame, index) => {
    const definite = index % 2 === 0;
    const forms = definite ? { der: 'den', die: 'die', das: 'das' } : { der: 'einen', die: 'eine', das: 'ein' };
    const choices = definite ? ['der', 'die', 'das', 'den', 'dem'] : ['ein', 'eine', 'einen', 'einem', 'einer'];
    return question(`${frame} ___ ${noun}. (${definite ? 'the' : 'a / an'})`, forms[article], choices);
  }));
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
];

const modals = [
  { verb: 'können', forms: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können', 'kann', 'können'], contexts: ['Deutsch sprechen', 'heute kommen', 'gut schwimmen', 'hier warten'] },
  { verb: 'müssen', forms: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen', 'muss', 'müssen'], contexts: ['früh aufstehen', 'heute arbeiten', 'jetzt gehen'] },
  { verb: 'wollen', forms: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen', 'will', 'wollen'], contexts: ['Pizza essen', 'Deutsch lernen', 'nach Berlin fahren'] },
];

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
];
const timePhrases = ['Heute', 'Am Montag', 'Am Abend', 'Morgen'];

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
];

// All scenarios use clauses that are grammatical both as reported statements
// (dass) and as reasons (weil); the task selects a complete subordinate clause.
const reasons = [
  ['ich', 'müde', 'bin', 'bist'], ['du', 'krank', 'bist', 'bin'],
  ['Anna', 'Hunger', 'hat', 'habe'], ['wir', 'Zeit', 'haben', 'hat'],
  ['ihr', 'Hilfe', 'braucht', 'brauchen'], ['Paul', 'Deutsch', 'lernt', 'lernen'],
  ['die Kinder', 'zu Hause', 'sind', 'ist'], ['ich', 'Kaffee', 'trinke', 'trinkt'],
  ['du', 'in Berlin', 'wohnst', 'wohnen'], ['Anna', 'heute', 'arbeitet', 'arbeiten'],
  ['wir', 'Brot', 'kaufen', 'kauft'], ['ihr', 'Musik', 'hört', 'hören'],
  ['Paul', 'Suppe', 'kocht', 'kochen'], ['die Kinder', 'Tennis', 'spielen', 'spielt'],
  ['ich', 'den Schlüssel', 'suche', 'sucht'], ['du', 'eine Pause', 'brauchst', 'brauchen'],
  ['Anna', 'ein Buch', 'liest', 'lesen'], ['wir', 'einen Brief', 'schreiben', 'schreibt'],
  ['ihr', 'heute', 'kommt', 'kommen'], ['Paul', 'den Bus', 'nimmt', 'nehmen'],
];
const subordinateFrames = ['Ich weiß, dass', 'Es stimmt, dass', 'Das ist wichtig, weil', 'Ich freue mich, weil'];

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
  present: regularVerbs.flatMap(([stem, rest]) => subjects.map((subject, i) => question(`${subject} ${stem}___ ${rest}.`, endings[i], ['e', 'st', 't', 'en']))),
  articles: WORDS.filter(word => word.pos === 'noun').slice(0, 80).map(word => {
    const [article, ...noun] = word.de.split(' ');
    return question(`___ ${noun.join(' ')} (nominative: the)`, article, ['der', 'die', 'das', 'den']);
  }),
  accusative: accusativeQuestions(),
  modal: modals.flatMap(modal => modal.contexts.flatMap(context => subjects.map((subject, i) => question(`${subject} ___ ${context}. (${modal.verb})`, modal.forms[i], modal.forms)))),
  wordorder: clauses.flatMap(([subject, verb, rest]) => timePhrases.map(time => question(
    // Only the sentence-initial capital is dropped: am Montag, not am montag.
    `Choose the correct statement: ${time[0].toLowerCase()}${time.slice(1)} / ${subject} / ${verb} / ${rest}`,
    `${time} ${verb} ${subject} ${rest}.`,
    [`${time} ${subject} ${verb} ${rest}.`, `${time} ${subject} ${rest} ${verb}.`, `${time} ${rest} ${subject} ${verb}.`],
  ))),
  perfect: perfectVerbs.flatMap(([infinitive, participle, auxiliary, context, present, past]) => [
    question(`Ich ___ ${context} ${participle}. (Perfekt)`, auxiliary === 'sein' ? 'bin' : 'habe', ['bin', 'habe', 'ist', 'hat']),
    question(`Wir ___ ${context} ${participle}. (Perfekt)`, auxiliary === 'sein' ? 'sind' : 'haben', ['sind', 'haben', 'seid', 'habt']),
    question(`Anna ${auxiliary === 'sein' ? 'ist' : 'hat'} ${context} ___. (${infinitive}, Perfekt)`, participle, [infinitive, present, past]),
    question(`Du ${auxiliary === 'sein' ? 'bist' : 'hast'} ${context} ___. (${infinitive}, Perfekt)`, participle, [infinitive, present, past]),
  ]),
  dative: dativeContexts.flatMap(([verb, context, article]) => ['Ich', 'Du', 'Wir', 'Ihr'].map((subject, i) => {
    const definite = i < 2;
    const forms = definite ? { der: 'dem', die: 'der', das: 'dem' } : { der: 'einem', die: 'einer', das: 'einem' };
    return question(`${subject} ${dativeVerbs[verb][i]} ${context}. (${definite ? 'the' : 'a / an'})`, forms[article],
      definite ? ['der', 'die', 'das', 'den', 'dem'] : ['ein', 'eine', 'einen', 'einem', 'einer']);
  })),
  because: reasons.flatMap(([subject, rest, verb, wrongVerb]) => subordinateFrames.map(frame => question(
    `${frame} ___. (${subject} / ${verb} / ${rest})`, `${subject} ${rest} ${verb}`,
    [`${subject} ${verb} ${rest}`, `${verb} ${subject} ${rest}`, `${subject} ${rest} ${wrongVerb}`],
  ))),
  comparative: comparisons.flatMap(([base, comparative, superlative, comparativeContext, superlativeContext]) => [
    question(`Choose the comparative of “${base}”.`, comparative, [base, superlative, `${comparative}e`]),
    question(`Choose the superlative with “am” of “${base}”.`, superlative, [base, comparative, `am ${comparative}`]),
    question(`${comparativeContext} (${base})`, comparative, [base, superlative, `${comparative}e`]),
    question(`${superlativeContext} (${base}; superlative)`, superlative, [base, comparative, `am ${comparative}`]),
  ]),
};

export const RULES = [
  { id: 'sein', level: 'A1', title: 'sein — to be', desc: 'ich bin, du bist, er/sie ist…', tip: 'Choose the form of sein that matches the subject.' },
  { id: 'present', level: 'A1', title: 'Verbkonjugation — present tense', desc: 'Regular verb endings; sein and modals have their own rules', tip: 'Remove -en and add: -e, -st, -t, -en, -t, -en.' },
  { id: 'articles', level: 'A1', title: 'Articles: der, die, das', desc: 'Gender and definite articles', tip: 'Choose the nominative article. Learn every noun together with its article.' },
  { id: 'accusative', level: 'A1', title: 'Accusative case', desc: 'Direct objects and einen', tip: 'Only masculine articles change: der → den, ein → einen. Use the / a hint to select the article type.' },
  { id: 'modal', level: 'A1', title: 'Modal verbs', desc: 'können, müssen, wollen, dürfen, sollen, möchten', tip: 'Conjugate the modal verb in brackets; the other verb stays in the infinitive at the end.' },
  { id: 'wordorder', level: 'A1', title: 'Word order', desc: 'Verb in position 2', tip: 'In a statement, the conjugated verb stays in the second position.' },
  { id: 'perfect', level: 'A2', title: 'Perfect tense', desc: 'haben/sein + past participle', tip: 'Use sein for going, coming, travelling and staying; otherwise these exercises use haben.' },
  { id: 'dative', level: 'A2', title: 'Dative case', desc: 'Indirect objects, prepositions and locations', tip: 'Dative articles: dem / der / dem. Use dative after helfen, for recipients with geben, after mit / bei / zu / aus / von, and for static locations.' },
  { id: 'because', level: 'A2', title: 'Kausalsätze & dass', desc: 'Reasons with weil; statements with dass', tip: 'After weil or dass, put the conjugated verb at the end.' },
  { id: 'comparative', level: 'A2', title: 'Komparativ & Superlativ', desc: 'größer, besser, am besten', tip: 'Use the comparative with als, and am + superlative for the highest degree.' },
].map(rule => {
  const retained = (_, i) => ({
  sein: i < 32, present: i < 48, articles: i < 48,
  accusative: i % 4 < 2, modal: i < 16 || (i >= 32 && i < 48) || (i >= 56 && i < 72),
  wordorder: i % 4 < 2, perfect: i % 4 === 0 || i % 4 === 2,
  dative: i % 4 === 0 || i % 4 === 2, because: i % 4 === 0 || i % 4 === 2,
  comparative: i % 4 >= 2,
  })[rule.id];
  const previous = banks[rule.id].filter(retained);
  // Keep the existing sequence first so unfinished first cycles resume in place.
  return { ...rule, qs: rule.id === 'sein' ? previous : previous.concat(banks[rule.id].filter((q, i) => !retained(q, i))) };
}).concat(EXTRA_RULES, MORE_RULES).map(rule => ({ ...rule, extra: EXTRA_BANKS[rule.id] || [] }));

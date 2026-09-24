// Additional exercises mixed into later practice cycles. The first cycle of each
// topic keeps its curated order; these banks widen the people, nouns, verbs and
// sentence patterns without changing any topic's window size or progress keys.
import { WORDS } from './vocabulary.js';

const key = value => value.toLowerCase().trim();
const cap = value => value[0].toUpperCase() + value.slice(1);
const q = (prompt, answer, choices) => {
  const options = [...new Map(choices.map(value => [key(value), value])).values()].filter(value => key(value) !== key(answer));
  // Sentence-initial capitalization must not reveal the correct option.
  return [prompt, answer, prompt.startsWith('___') ? options.map(cap) : options];
};
// Person index: 0 ich, 1 du, 2 er / sie / es, 3 wir, 4 ihr, 5 sie / Sie.
const SEIN = ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'];
const HABEN = ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'];
const definite = ['der', 'die', 'das', 'den', 'dem'];
const indefinite = ['ein', 'eine', 'einen', 'einem', 'einer'];
const demonstratives = ['dieser', 'diese', 'dieses', 'diesen', 'diesem'];
const pick = (list, index) => list[index % list.length];
// Separable verbs: verb … prefix in two gaps; "—" leaves a gap empty.
const gaps = (verb, end = '—') => `${verb} … ${end}`;

const seinSubjects = [
  ['Mein Bruder', 2], ['Meine Eltern', 5], ['Frau Weber', 2], ['Lena und ich', 3], ['Du und Tom', 4],
  ['Ich', 0], ['Du', 1], ['Herr Klein', 2], ['Die Nachbarn', 5], ['Wir', 3],
];
const seinPredicates = ['krank', 'verheiratet', 'aus Österreich', 'im Urlaub', 'glücklich', 'heute beschäftigt', 'noch im Kino', 'sehr sportlich'];
const sein = [
  ...seinSubjects.flatMap(([subject, person], i) => [0, 1].map(k =>
    q(`${subject} ___ ${pick(seinPredicates, i * 3 + k)}.`, SEIN[person], SEIN))),
  q('___ du müde?', 'Bist', SEIN), q('Wo ___ ihr?', 'seid', SEIN), q('Woher ___ Sie, Frau Weber?', 'sind', SEIN),
  q('___ das dein Handy?', 'Ist', SEIN), q('Wie alt ___ deine Kinder?', 'sind', SEIN), q('Wie ___ das Wetter heute?', 'ist', SEIN),
  q('___ ihr schon fertig?', 'Seid', SEIN), q('Heute ___ ich sehr müde.', 'bin', SEIN), q('Morgen ___ wir in Hamburg.', 'sind', SEIN),
  q('Warum ___ du so traurig?', 'bist', SEIN), q('Leider ___ der Zug zu spät.', 'ist', SEIN), q('___ Sie Herr Klein?', 'Sind', SEIN),
];

// Later rounds add the two regular spelling patterns: an extra e after -t / -d / consonant + n
// (du arbeitest, er öffnet), and only -t for du after -s / -ß / -z (du heißt, du tanzt).
// [sentence with ___ after the stem, ending, distractors]
const presentSpelling = [
  ['Du arbeit___ im Büro.', 'est', ['st', 'et', 't', 'e']], ['Frau Klein arbeit___ heute lange.', 'et', ['t', 'est', 'en', 'e']],
  ['Ihr wart___ auf den Bus.', 'et', ['t', 'est', 'en', 'e']], ['Ich wart___ vor dem Kino.', 'e', ['est', 'et', 'en', 'st']],
  ['Die Kinder antwort___ schnell.', 'en', ['et', 'e', 'est', 't']], ['Du antwort___ nicht.', 'est', ['st', 'et', 't', 'e']],
  ['Tom find___ den Film gut.', 'et', ['t', 'est', 'en', 'e']], ['Wir find___ die Idee super.', 'en', ['et', 'e', 'est', 't']],
  ['Du öffn___ das Fenster.', 'est', ['st', 'et', 't', 'e']], ['Der Kellner öffn___ die Tür.', 'et', ['t', 'est', 'en', 'e']],
  ['Die Schüler rechn___ im Kopf.', 'en', ['et', 'e', 'est', 't']], ['Du rechn___ sehr schnell.', 'est', ['st', 'et', 't', 'e']],
  ['Ihr red___ zu viel.', 'et', ['t', 'est', 'en', 'e']], ['Lena bad___ am Abend.', 'et', ['t', 'est', 'en', 'e']],
  ['Die Jacke kost___ fünfzig Euro.', 'et', ['t', 'est', 'en', 'e']], ['Du miet___ eine Wohnung.', 'est', ['st', 'et', 't', 'e']],
  ['Du heiß___ Anna, oder?', 't', ['st', 'est', 'e', 'en']], ['Wie heiß___ ihr?', 't', ['st', 'est', 'e', 'en']],
  ['Ich heiß___ Tom.', 'e', ['st', 't', 'en', 'est']], ['Du tanz___ sehr gut.', 't', ['st', 'est', 'e', 'en']],
  ['Wir tanz___ gern Salsa.', 'en', ['e', 't', 'st', 'et']], ['Du sitz___ am Fenster.', 't', ['st', 'est', 'e', 'en']],
  ['Die Katze sitz___ auf dem Sofa.', 't', ['st', 'est', 'e', 'en']], ['Du reis___ gern.', 't', ['st', 'est', 'e', 'en']],
  ['Meine Eltern reis___ nach Italien.', 'en', ['e', 't', 'st', 'et']], ['Du schließ___ die Tür.', 't', ['st', 'est', 'e', 'en']],
  ['Ich schließ___ das Fenster.', 'e', ['st', 't', 'en', 'est']], ['Du putz___ das Bad.', 't', ['st', 'est', 'e', 'en']],
  ['Ihr putz___ die Küche.', 't', ['st', 'est', 'e', 'en']], ['Du benutz___ das Wörterbuch.', 't', ['st', 'est', 'e', 'en']],
  ['Du grüß___ die Nachbarn.', 't', ['st', 'est', 'e', 'en']], ['Die Gäste grüß___ freundlich.', 'en', ['e', 't', 'st', 'et']],
];
const present = [
  ...presentSpelling.map(([prompt, answer, others]) => q(prompt, answer, [answer, ...others])),
  q('___ du gern Tennis? (to play)', 'Spielst', ['Spiele', 'Spielt', 'Spielen']),
  q('Wo ___ ihr? (to live)', 'wohnt', ['wohne', 'wohnst', 'wohnen']),
  q('Was ___ Sie beruflich? (to do)', 'machen', ['mache', 'machst', 'macht']),
  q('Wann ___ der Kurs? (to begin)', 'beginnt', ['beginne', 'beginnst', 'beginnen']),
  q('Wie ___ du? (to be called)', 'heißt', ['heiße', 'heißst', 'heißen']),
  q('Was ___ wir heute? (to cook)', 'kochen', ['koche', 'kochst', 'kocht']),
  q('___ ihr heute Abend? (to come)', 'Kommt', ['Komme', 'Kommst', 'Kommen']),
  q('Wie lange ___ du schon Deutsch? (to learn)', 'lernst', ['lerne', 'lernt', 'lernen']),
];

// Nouns beyond the first-cycle article drill, with the English meaning as a cue.
const articles = WORDS.filter(word => word.pos === 'noun').slice(80).filter((_, i) => i % 4 === 1).map(word => {
  const [article, ...noun] = word.de.split(' ');
  return q(`___ ${noun.join(' ')} (the ${word.en})`, article, ['der', 'die', 'das', 'den']);
});

// [frame, gender, noun, sentence end]; all nouns keep their singular form in the accusative.
const accusativePairs = [
  ['Ich trinke', 'der', 'Kaffee'], ['Wir bestellen', 'die', 'Suppe'], ['Lena isst', 'der', 'Apfel'],
  ['Tom kauft', 'das', 'Brot'], ['Ich besuche', 'der', 'Freund'], ['Wir fragen', 'die', 'Lehrerin'],
  ['Kennst du', 'der', 'Arzt', '?'], ['Hast du', 'der', 'Schlüssel', '?'], ['Meine Mutter backt', 'der', 'Kuchen'],
  ['Ich brauche', 'das', 'Handy'], ['Die Kinder möchten', 'der', 'Hund'], ['Wir mieten', 'die', 'Wohnung'],
  ['Herr Braun liest', 'die', 'Zeitung'], ['Ich nehme', 'der', 'Bus'], ['Siehst du', 'der', 'Vogel', '?'],
  ['Lena schreibt', 'der', 'Brief'], ['Wir suchen', 'der', 'Parkplatz'], ['Ich bezahle', 'die', 'Rechnung'],
  ['Tom repariert', 'das', 'Fahrrad'], ['Wir sehen', 'der', 'Film'],
];
const accusative = accusativePairs.flatMap(([frame, article, noun, end = '.']) => [true, false].map(isDefinite => {
  const forms = isDefinite ? { der: 'den', die: 'die', das: 'das' } : { der: 'einen', die: 'eine', das: 'ein' };
  return q(`${frame} ___ ${noun}${end} (${isDefinite ? 'the' : 'a / an'})`, forms[article], isDefinite ? definite : indefinite);
}));

const MODALS = {
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'],
  müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'],
  dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'],
  sollen: ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'],
  möchten: ['möchte', 'möchtest', 'möchte', 'möchten', 'möchtet', 'möchten'],
};
// English cues: the German infinitive would reveal the wir / sie form.
export const MODAL_MEANINGS = { können: 'can', müssen: 'have to', wollen: 'want to', dürfen: 'be allowed to', sollen: 'be supposed to', möchten: 'would like to' };
const modalContexts = [
  ['dürfen', 'hier nicht parken'], ['dürfen', 'heute länger aufbleiben'], ['dürfen', 'im Park Fußball spielen'],
  ['sollen', 'mehr Wasser trinken'], ['sollen', 'den Arzt anrufen'], ['sollen', 'um acht Uhr da sein'],
  ['möchten', 'einen Kaffee trinken'], ['möchten', 'ins Kino gehen'], ['möchten', 'ein Zimmer reservieren'],
  ['können', 'Gitarre spielen'], ['können', 'sehr gut kochen'], ['müssen', 'die Hausaufgaben machen'],
  ['müssen', 'morgen zum Arzt gehen'], ['wollen', 'ein Auto kaufen'], ['wollen', 'im Sommer nach Spanien fliegen'],
];
const modalSubjects = [['Ich', 0], ['Du', 1], ['Mein Vater', 2], ['Wir', 3], ['Ihr', 4], ['Meine Freunde', 5], ['Lena', 2], ['Tom und ich', 3]];
const modal = [
  ...modalContexts.flatMap(([verb, context], i) => [0, 1, 2].map(k => {
    const [subject, person] = pick(modalSubjects, i * 3 + k);
    return q(`${subject} ___ ${context}. (${MODAL_MEANINGS[verb]})`, MODALS[verb][person], MODALS[verb]);
  })),
  q('___ du morgen kommen? (can)', 'Kannst', MODALS.können), q('___ ich hier rauchen? (be allowed to)', 'Darf', MODALS.dürfen),
  q('Was ___ ihr trinken? (would like to)', 'möchtet', MODALS.möchten), q('Wann ___ wir da sein? (be supposed to)', 'sollen', MODALS.sollen),
  q('___ Sie mir helfen? (can)', 'Können', MODALS.können), q('Wohin ___ du im Urlaub fahren? (want to)', 'willst', MODALS.wollen),
];

const lowerFirst = value => value[0].toLowerCase() + value.slice(1);
const inversionClauses = [
  ['mein Bruder', 'spielt', 'Fußball'], ['Lena', 'kocht', 'das Abendessen'], ['wir', 'besuchen', 'die Oma'],
  ['ich', 'trinke', 'einen Tee'], ['die Kinder', 'spielen', 'im Garten'], ['Herr Weber', 'arbeitet', 'im Büro'],
  ['du', 'hast', 'keine Zeit'], ['ihr', 'seht', 'einen Film'],
];
const fronts = ['Jetzt', 'Am Wochenende', 'Nach der Arbeit', 'Im Sommer', 'Leider', 'Oft'];
// [front, modal, subject, middle, infinitive]
const bracketClauses = [
  ['Heute', 'muss', 'ich', 'lange', 'arbeiten'], ['Morgen', 'will', 'Lena', 'ein Kleid', 'kaufen'],
  ['Am Abend', 'können', 'wir', 'zusammen', 'kochen'], ['Jetzt', 'möchte', 'Tom', 'einen Kaffee', 'trinken'],
  ['Am Samstag', 'wollen', 'die Kinder', 'ins Kino', 'gehen'], ['Leider', 'kann', 'ich', 'nicht', 'kommen'],
];
const yesNo = [['du', 'kommst', 'morgen'], ['ihr', 'habt', 'Hunger'], ['Tom', 'spielt', 'Gitarre'], ['Sie', 'sprechen', 'Englisch'], ['die Kinder', 'schlafen', 'schon'], ['du', 'kannst', 'schwimmen']];
const wOrder = [['wann', 'kommt', 'der Zug', ''], ['wo', 'wohnt', 'deine Schwester', ''], ['was', 'kochst', 'du', ' heute'], ['wohin', 'fahrt', 'ihr', ' im Sommer'], ['warum', 'lernst', 'du', ' Deutsch'], ['wie lange', 'bleibt', 'Tom', ' in Berlin']];
const wordorder = [
  ...inversionClauses.flatMap(([subject, verb, rest], i) => [0, 1].map(k => {
    const front = pick(fronts, i * 2 + k);
    return q(`Choose the correct statement: ${lowerFirst(front)} / ${subject} / ${verb} / ${rest}`, `${front} ${verb} ${subject} ${rest}.`,
      [`${front} ${subject} ${verb} ${rest}.`, `${front} ${subject} ${rest} ${verb}.`, `${front} ${rest} ${subject} ${verb}.`]);
  })),
  ...bracketClauses.map(([front, verb, subject, middle, infinitive]) => q(
    `Choose the correct statement: ${lowerFirst(front)} / ${subject} / ${verb} / ${middle} / ${infinitive}`,
    `${front} ${verb} ${subject} ${middle} ${infinitive}.`,
    [`${front} ${subject} ${verb} ${middle} ${infinitive}.`, `${front} ${verb} ${subject} ${infinitive} ${middle}.`, `${front} ${subject} ${middle} ${infinitive} ${verb}.`],
  )),
  // Statement order with rising intonation is possible in speech, so it is never a distractor.
  ...yesNo.map(([subject, verb, rest]) => q(
    `Choose the correct yes/no question: ${subject} / ${verb} / ${rest}`, `${cap(verb)} ${subject} ${rest}?`,
    [`${cap(subject)} ${rest} ${verb}?`, `${cap(rest)} ${subject} ${verb}?`],
  )),
  ...wOrder.map(([word, verb, subject, rest]) => q(
    `Choose the correct question: ${word} / ${verb} / ${subject}${rest ? ` / ${rest.trim()}` : ''}`, `${cap(word)} ${verb} ${subject}${rest}?`,
    [`${cap(word)} ${subject} ${verb}${rest}?`, `${cap(word)} ${subject}${rest} ${verb}?`, `${cap(verb)} ${word} ${subject}${rest}?`],
  )),
];

// [infinitive, participle, auxiliary, context, first-person present, preterite]
const perfectVerbs = [
  ['schlafen', 'geschlafen', 'haben', 'lange', 'schlafe', 'schlief'],
  ['sprechen', 'gesprochen', 'haben', 'mit dem Chef', 'spreche', 'sprach'],
  ['nehmen', 'genommen', 'haben', 'den Zug', 'nehme', 'nahm'],
  ['helfen', 'geholfen', 'haben', 'der Nachbarin', 'helfe', 'half'],
  ['bringen', 'gebracht', 'haben', 'Blumen', 'bringe', 'brachte'],
  ['fliegen', 'geflogen', 'sein', 'nach Spanien', 'fliege', 'flog'],
  ['laufen', 'gelaufen', 'sein', 'in den Park', 'laufe', 'lief'],
  ['reisen', 'gereist', 'sein', 'nach Italien', 'reise', 'reiste'],
  ['verstehen', 'verstanden', 'haben', 'die Frage', 'verstehe', 'verstand'],
  ['bezahlen', 'bezahlt', 'haben', 'die Rechnung', 'bezahle', 'bezahlte'],
  ['anrufen', 'angerufen', 'haben', 'die Oma', 'rufe an', 'rief an'],
  ['einladen', 'eingeladen', 'haben', 'Freunde', 'lade ein', 'lud ein'],
  ['umziehen', 'umgezogen', 'sein', 'nach München', 'ziehe um', 'zog um'],
  ['einschlafen', 'eingeschlafen', 'sein', 'sofort', 'schlafe ein', 'schlief ein'],
  ['treffen', 'getroffen', 'haben', 'einen Freund', 'treffe', 'traf'],
  ['wandern', 'gewandert', 'sein', 'in den Bergen', 'wandere', 'wanderte'],
];
const perfectSubjects = [['Mein Bruder', 2], ['Ihr', 4], ['Die Kinder', 5], ['Herr Weber', 2], ['Du', 1], ['Lena und ich', 3]];
const perfect = perfectVerbs.flatMap(([infinitive, participle, auxiliary, context, present, past], i) => {
  const [subject, person] = pick(perfectSubjects, i);
  const [other, otherPerson] = pick(perfectSubjects, i + 3);
  const [forms, wrong] = auxiliary === 'sein' ? [SEIN, HABEN] : [HABEN, SEIN];
  const nearby = person === 2 ? 3 : 2;
  return [
    q(`${subject} ___ ${context} ${participle}. (Perfekt)`, forms[person], [wrong[person], forms[nearby], wrong[nearby]]),
    q(`${other} ${forms[otherPerson]} ${context} ___. (${infinitive}, Perfekt)`, participle, [infinitive, present, past]),
  ];
});

// Sentences with ___ before a singular noun of the given gender.
const dativeSentences = [
  ['Ich danke ___ Lehrerin.', 'die'], ['Das Buch gehört ___ Mann.', 'der'], ['Wir gratulieren ___ Kind.', 'das'],
  ['Die Jacke gefällt ___ Frau.', 'die'], ['Ich schenke ___ Freund ein Buch.', 'der'], ['Tom zeigt ___ Gast das Zimmer.', 'der'],
  ['Wir fahren mit ___ Fahrrad.', 'das'], ['Lena kommt aus ___ Supermarkt.', 'der'], ['Ich wohne bei ___ Tante.', 'die'],
  ['Die Kinder spielen mit ___ Ball.', 'der'], ['Er antwortet ___ Kollegin.', 'die'], ['Wir warten neben ___ Auto.', 'das'],
  ['Das Handy liegt unter ___ Zeitung.', 'die'], ['Ich spreche mit ___ Verkäufer.', 'der'], ['Meine Mutter hilft ___ Nachbarin.', 'die'],
  ['Wir sitzen in ___ Café.', 'das'],
];
const dative = dativeSentences.flatMap(([sentence, article]) => [true, false].map(isDefinite => {
  const forms = isDefinite ? { der: 'dem', die: 'der', das: 'dem' } : { der: 'einem', die: 'einer', das: 'einem' };
  return q(`${sentence} (${isDefinite ? 'the' : 'a / an'})`, forms[article], isDefinite ? definite : indefinite);
}));

// [main clause, subject, middle, verb, wrong verb form, optional main-clause order for separable verbs]
const reasonClauses = [
  ['Ich bleibe heute zu Hause, weil', 'ich', 'Fieber', 'habe', 'hat'],
  ['Tom lernt Deutsch, weil', 'er', 'in Berlin', 'arbeitet', 'arbeiten'],
  ['Wir gehen nicht spazieren, weil', 'es', 'stark', 'regnet', 'regnen'],
  ['Anna ist glücklich, weil', 'sie', 'eine neue Wohnung', 'hat', 'haben'],
  ['Ich glaube, dass', 'der Film', 'um acht Uhr', 'beginnt', 'beginnen'],
  ['Wir hoffen, dass', 'ihr', 'morgen', 'kommt', 'kommen'],
  ['Lena sagt, dass', 'der Kaffee', 'sehr gut', 'schmeckt', 'schmecken'],
  ['Es ist schade, dass', 'du', 'keine Zeit', 'hast', 'hat'],
  ['Ich weiß, dass', 'die Geschäfte', 'am Sonntag geschlossen', 'sind', 'ist'],
  ['Die Kinder sind müde, weil', 'sie', 'den ganzen Tag', 'spielen', 'spielt'],
  ['Ich komme später, weil', 'ich', 'noch arbeiten', 'muss', 'müssen'],
  ['Tom sagt, dass', 'er', 'gut kochen', 'kann', 'können'],
  ['Ich bin froh, dass', 'ich', 'die Prüfung bestanden', 'habe', 'hat'],
  ['Anna ist müde, weil', 'sie', 'schlecht geschlafen', 'hat', 'ist'],
  ['Wir warten, weil', 'der Zug', 'erst um neun', 'abfährt', 'abfahren', 'der Zug fährt erst um neun ab'],
  ['Ich weiß, dass', 'du', 'jeden Tag früh', 'aufstehst', 'aufstehen', 'du stehst jeden Tag früh auf'],
];
const because = reasonClauses.map(([frame, subject, middle, verb, wrongVerb, mainOrder]) => q(
  `${frame} ___. (${subject} / ${verb} / ${middle})`, `${subject} ${middle} ${verb}`,
  [mainOrder || `${subject} ${verb} ${middle}`, `${verb} ${subject} ${middle}`, `${subject} ${middle} ${wrongVerb}`],
));

const comparative = [
  q('Ich trinke ___ Tee als Kaffee. (gern)', 'lieber', ['gerner', 'gern', 'am liebsten']),
  q('Am ___ esse ich Pizza. (gern; superlative)', 'liebsten', ['gernsten', 'lieber', 'gernste']),
  q('Lena liest ___ als Tom. (viel)', 'mehr', ['vieler', 'viel', 'am meisten']),
  q('Wer arbeitet am ___? (viel; superlative)', 'meisten', ['vielsten', 'mehr', 'viel']),
  q('Das Buch ist ___ als der Film. (interessant)', 'interessanter', ['interessant', 'am interessantesten', 'interessanterer']),
  q('In Spanien ist der Sommer ___ als in Deutschland. (warm)', 'wärmer', ['warmer', 'warm', 'am wärmsten']),
  q('Mein Bruder ist ___ als ich. (klug)', 'klüger', ['kluger', 'klug', 'am klügsten']),
  q('Im Winter ist es abends ___ als im Sommer. (dunkel)', 'dunkler', ['dunkeler', 'dunkel', 'am dunkelsten']),
  q('Die Musik ist jetzt ___ als vorher. (laut)', 'lauter', ['laut', 'läuter', 'am lautesten']),
  q('Sprich bitte ___! Das Baby schläft. (leise)', 'leiser', ['leise', 'leisere', 'am leisesten']),
  q('Diese Übung ist ___ als die erste. (einfach)', 'einfacher', ['einfach', 'einfacherer', 'am einfachsten']),
  q('Die Prüfung war ___ als der Test. (schwierig)', 'schwieriger', ['schwierig', 'schwierigerer', 'am schwierigsten']),
  q('Am Wochenende stehe ich ___ auf als in der Woche. (spät)', 'später', ['spät', 'späterer', 'am spätesten']),
  q('Tom ist so ___ wie Ben. (groß; equal)', 'groß', ['größer', 'am größten', 'größte']),
  q('Heute ist es so ___ wie gestern. (kalt; equal)', 'kalt', ['kälter', 'am kältesten', 'kälteste']),
  q('Mein Handy ist nicht so ___ wie dein Handy. (teuer; equal)', 'teuer', ['teurer', 'teuerer', 'am teuersten']),
  q('Anna ist älter ___ Paul. (comparison word)', 'als', ['wie', 'so', 'dann']),
  q('Anna ist so alt ___ Paul. (comparison word)', 'wie', ['als', 'so', 'dann']),
  q('Dieses Café ist gemütlicher ___ das andere. (comparison word)', 'als', ['wie', 'so', 'dann']),
  q('Der Bus ist genauso schnell ___ die Straßenbahn. (comparison word)', 'wie', ['als', 'so', 'dann']),
  q('Von allen Jacken ist diese am ___. (schön; superlative)', 'schönsten', ['schönen', 'schöner', 'schönste']),
  q('Im Dezember sind die Tage am ___. (kurz; superlative)', 'kürzesten', ['kurzesten', 'kürzer', 'kürzeste']),
];

// [singular, plural, sentence]
const pluralNouns = [
  ['der Hund', 'Hunde', 'Meine Nachbarn haben zwei ___.'], ['die Katze', 'Katzen', 'Im Garten spielen drei ___.'],
  ['der Baum', 'Bäume', 'Im Park stehen viele ___.'], ['die Blume', 'Blumen', 'Ich kaufe fünf ___ für meine Mutter.'],
  ['das Glas', 'Gläser', 'Wir brauchen sechs ___ für die Party.'], ['der Teller', 'Teller', 'Auf dem Tisch stehen vier ___.'],
  ['die Tasse', 'Tassen', 'Ich spüle die ___.'], ['der Löffel', 'Löffel', 'In der Schublade liegen zehn ___.'],
  ['das Messer', 'Messer', 'Die ___ sind sehr scharf.'], ['der Schuh', 'Schuhe', 'Diese ___ sind zu klein.'],
  ['das Kleid', 'Kleider', 'Im Schrank hängen viele ___.'], ['die Hose', 'Hosen', 'Ich habe drei ___.'],
  ['das Handy', 'Handys', 'Alle Schüler haben ___.'], ['die Nacht', 'Nächte', 'Wir bleiben zwei ___ im Hotel.'],
  ['die Hand', 'Hände', 'Wasch dir bitte die ___!'], ['der Fuß', 'Füße', 'Meine ___ tun weh.'],
  ['das Auge', 'Augen', 'Anna hat blaue ___.'], ['das Land', 'Länder', 'Tom hat schon viele ___ besucht.'],
  ['die Wohnung', 'Wohnungen', 'In diesem Haus gibt es acht ___.'], ['der Garten', 'Gärten', 'Die ___ hier sind sehr schön.'],
  ['das Wort', 'Wörter', 'Wir lernen heute zwanzig neue ___.'], ['der Stift', 'Stifte', 'Hast du zwei ___ für mich?'],
  ['die Idee', 'Ideen', 'Lena hat viele gute ___.'], ['der Brief', 'Briefe', 'Opa bekommt heute zwei ___.'],
  ['das Problem', 'Probleme', 'Wir haben keine ___.'], ['der Name', 'Namen', 'Ich vergesse oft ___.'],
  ['die Straße', 'Straßen', 'Die ___ in der Altstadt sind eng.'], ['der Kuchen', 'Kuchen', 'Oma backt zwei ___.'],
  ['die Nudel', 'Nudeln', 'Die Kinder essen gern ___.'], ['das Ticket', 'Tickets', 'Wir kaufen vier ___ für das Konzert.'],
];
const plural = pluralNouns.flatMap(([singular, pluralForm, sentence]) => {
  const noun = singular.split(' ')[1];
  const wrong = [noun, `${noun}e`, `${noun}en`, `${noun}s`, `${noun}er`];
  return [q(`Choose the plural of “${singular}”.`, pluralForm, wrong), q(`${sentence} (${singular})`, pluralForm, wrong)];
});

const indefiniteNouns = [['der', 'Hund'], ['die', 'Katze'], ['das', 'Handy'], ['der', 'Computer'], ['die', 'Wohnung'], ['das', 'Geschenk'], ['der', 'Termin'], ['die', 'Frage'], ['das', 'Problem'], ['der', 'Garten']];
const indefinite_ = indefiniteNouns.flatMap(([article, noun]) => [
  q(`Das ist ___ ${noun}. (a / an)`, article === 'die' ? 'eine' : 'ein', indefinite),
  q(`Ich habe ___ ${noun}. (a / an)`, { der: 'einen', die: 'eine', das: 'ein' }[article], indefinite),
  q(`Hast du ___ ${noun}? (a / an)`, { der: 'einen', die: 'eine', das: 'ein' }[article], indefinite),
]);

const personalReferences = [
  ['der Tisch', 'er', 'ist neu'], ['die Lampe', 'sie', 'ist kaputt'], ['das Auto', 'es', 'ist rot'], ['die Autos', 'sie', 'sind neu'],
  ['mein Vater', 'er', 'arbeitet heute'], ['meine Mutter', 'sie', 'kocht gern'], ['Tom und Lena', 'sie', 'kommen morgen'],
  ['du und Tom', 'ihr', 'habt Zeit'], ['Lena und ich', 'wir', 'gehen ins Kino'], ['der Computer', 'er', 'ist teuer'],
  ['die Stadt', 'sie', 'ist schön'], ['die Kinder', 'sie', 'schlafen schon'], ['I am talking about myself', 'ich', 'lerne Deutsch'],
  ['I am talking to one friend', 'du', 'hast recht'], ['I am addressing an adult formally', 'Sie', 'sprechen gut Deutsch'],
  ['der Zug', 'er', 'kommt pünktlich'], ['die Milch', 'sie', 'ist frisch'], ['das Wetter', 'es', 'ist schön'], ['Herr Weber', 'er', 'wohnt hier'],
];
const personal = personalReferences.map(([reference, pronoun, rest]) =>
  q(`Use a subject pronoun for “${reference}”: ___ ${rest}.`, pronoun, ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr']));

const owners = [
  { stem: 'mein', article: 'my', pronoun: 'mine', neuter: 'meins' },
  { stem: 'dein', article: 'your (one friend)', pronoun: 'yours (one friend)', neuter: 'deins' },
  { stem: 'sein', article: 'his', pronoun: 'his', neuter: 'seins' },
  { stem: 'ihr', article: 'her', pronoun: 'hers', neuter: 'ihres' },
  { stem: 'unser', article: 'our', pronoun: 'ours', neuter: 'unseres' },
  { stem: 'euer', article: 'your (several friends)', pronoun: 'yours (several friends)', neuter: 'eures' },
  { stem: 'ihr', article: 'their', pronoun: 'theirs', neuter: 'ihres' },
  { stem: 'Ihr', article: 'your (formal)', pronoun: 'yours (formal)', neuter: 'Ihres' },
];
const possessiveNouns = [['der', 'Hund'], ['die', 'Wohnung'], ['das', 'Handy'], ['der', 'Garten'], ['die', 'Katze'], ['das', 'Fahrrad']];
const possessiveFrames = [['Das ist', '.'], ['Ist das', '?'], ['Hier ist', '.']];
const possessive = possessiveNouns.flatMap(([article, noun], n) => [0, 1, 2, 3].flatMap(k => {
  const owner = pick(owners, n * 3 + k * 2);
  const stem = owner.stem === 'euer' ? 'eur' : owner.stem;
  const beforeNoun = article === 'die' ? `${stem}e` : owner.stem;
  const standalone = article === 'der' ? `${stem}er` : article === 'die' ? `${stem}e` : owner.neuter;
  const forms = [owner.stem, `${stem}e`, `${stem}er`, `${stem}en`, `${stem}em`, owner.neuter];
  const [frame, end] = pick(possessiveFrames, n + k);
  return [
    q(`${frame} ___ ${noun}${end} (${owner.article})`, beforeNoun, forms),
    q(`Wem gehört ${article} ${noun}? — Das ist ___. (${owner.pronoun})`, standalone, forms),
  ];
}));

const nominativeSubjects = [
  ['der', 'Zug', 'kommt um acht Uhr.'], ['die', 'Katze', 'schläft auf dem Sofa.'], ['das', 'Wetter', 'ist heute schön.'],
  ['der', 'Kaffee', 'ist zu heiß.'], ['die', 'Suppe', 'schmeckt gut.'], ['das', 'Kind', 'spielt im Garten.'],
  ['der', 'Film', 'beginnt gleich.'], ['die', 'Stadt', 'ist sehr alt.'], ['das', 'Handy', 'klingelt.'], ['der', 'Hund', 'bellt.'],
];
// The subject is not always first; these sentences are unambiguous through case endings or meaning.
const nominativePhrases = [
  ['Heute kocht der Vater.', 'der Vater', ['Heute', 'kocht']], ['Den Kaffee trinkt mein Opa.', 'mein Opa', ['Den Kaffee', 'trinkt']],
  ['Im Garten spielt ein Kind.', 'ein Kind', ['Im Garten', 'spielt']], ['Morgen besucht uns die Tante.', 'die Tante', ['uns', 'Morgen']],
  ['Den Hund sucht der Junge.', 'der Junge', ['Den Hund', 'sucht']], ['Dem Kind hilft die Lehrerin.', 'die Lehrerin', ['Dem Kind', 'hilft']],
  ['Jeden Morgen trinkt Tom einen Tee.', 'Tom', ['einen Tee', 'Jeden Morgen']], ['Um acht Uhr beginnt der Unterricht.', 'der Unterricht', ['Um acht Uhr', 'beginnt']],
  ['Mir gefällt der Film.', 'der Film', ['Mir', 'gefällt']],
];
const nominative = [
  ...nominativeSubjects.map(([article, noun, rest]) => q(`___ ${noun} ${rest} (the; subject)`, cap(article), definite)),
  ...nominativePhrases.map(([sentence, answer, others]) => q(`Which phrase is nominative? “${sentence}”`, answer, others)),
  q('Herr Weber ist ___ neue Chef. (the; after sein)', 'der', definite),
  q('Frau Klein ist ___ neue Nachbarin. (the; after sein)', 'die', definite),
  q('Das ist ___ beste Café der Stadt. (the; after sein)', 'das', definite),
];

const welcher = ['Welcher', 'Welche', 'Welches', 'Welchen', 'Welchem'];
const demonstrative = [
  q('___ Film ist super. (this; subject)', 'Dieser', demonstratives), q('___ Jacke ist zu teuer. (this; subject)', 'Diese', demonstratives),
  q('___ Restaurant ist neu. (this; subject)', 'Dieses', demonstratives), q('Ich kaufe ___ Jacke. (this)', 'diese', demonstratives),
  q('Kennst du ___ Mann? (this)', 'diesen', demonstratives), q('Wir nehmen ___ Zimmer. (this)', 'dieses', demonstratives),
  q('Ich finde ___ Film langweilig. (this)', 'diesen', demonstratives), q('Wir wohnen in ___ Haus. (this; location)', 'diesem', demonstratives),
  q('Mit ___ Zug fahre ich nach Hause. (this)', 'diesem', demonstratives), q('Ich helfe ___ Frau. (this)', 'dieser', demonstratives),
  q('In ___ Straße gibt es viele Cafés. (this; location)', 'dieser', demonstratives), q('Das Buch gehört ___ Kind. (this)', 'diesem', demonstratives),
  q('___ Schuhe sind bequem. (these; subject)', 'Diese', demonstratives), q('Ich mag ___ Blumen. (these)', 'diese', demonstratives),
  q('Mit ___ Kindern spiele ich oft. (these; dative plural)', 'diesen', demonstratives),
  q('___ Bus fährt zum Bahnhof? (which; subject)', 'Welcher', welcher), q('___ Zimmer ist frei? (which; subject)', 'Welches', welcher),
  q('___ Jacke nimmst du? (which)', 'Welche', welcher), q('___ Film siehst du heute? (which)', 'Welchen', welcher),
];

// [sentence after a name, answer, English cue, distractors]
const prepositionContexts = [
  ['wartet ___ den Bus.', 'auf', 'waiting for the bus', ['für', 'an', 'nach']],
  ['fährt ___ Österreich.', 'nach', 'to Austria', ['zu', 'in', 'aus']],
  ['fliegt ___ die Schweiz.', 'in', 'to Switzerland, a country with an article', ['nach', 'zu', 'an']],
  ['wohnt ___ drei Jahren in Wien.', 'seit', 'for three years, continuing now', ['vor', 'ab', 'für']],
  ['arbeitet von neun ___ fünf Uhr.', 'bis', 'until five o’clock', ['nach', 'zu', 'um']],
  ['trifft Freunde ___ Wochenende.', 'am', 'at the weekend', ['im', 'um', 'zu']],
  ['fährt ___ Sommer ans Meer.', 'im', 'in summer', ['am', 'um', 'seit']],
  ['hat ___ halb acht einen Termin.', 'um', 'at half past seven', ['am', 'im', 'seit']],
  ['geht ___ die Brücke.', 'über', 'across the bridge', ['durch', 'um', 'an']],
  ['kommt gerade ___ der Arbeit.', 'von', 'from work', ['nach', 'mit', 'bei']],
  ['geht jetzt ___ Hause.', 'nach', 'home, as a destination', ['zu', 'bei', 'in']],
  ['ist heute ___ Hause.', 'zu', 'at home', ['nach', 'bei', 'in']],
  ['spricht ___ dem Chef.', 'mit', 'with the boss', ['bei', 'zu', 'von']],
  ['lernt ___ die Prüfung.', 'für', 'for the exam', ['auf', 'gegen', 'um']],
  ['trinkt Kaffee ___ Milch.', 'mit', 'with milk', ['ohne', 'bei', 'von']],
  ['geht ___ dem Hund spazieren.', 'mit', 'with the dog', ['bei', 'von', 'für']],
  ['kauft Blumen ___ die Oma.', 'für', 'for grandma', ['gegen', 'mit', 'zu']],
  ['kommt ___ Italien.', 'aus', 'from Italy (origin)', ['von', 'nach', 'bei']],
  ['fährt heute ___ Arzt.', 'zum', 'to the doctor (zu + dem)', ['beim', 'im', 'nach']],
  ['macht ___ dem Frühstück einen Spaziergang.', 'nach', 'after breakfast', ['vor', 'seit', 'bis']],
  ['ist ___ einer Woche krank.', 'seit', 'for a week, continuing now', ['vor', 'für', 'ab']],
  ['bleibt ___ Sonntag bei uns.', 'bis', 'until Sunday', ['seit', 'ab', 'um']],
];
const people = ['Lena', 'Tom', 'Mia', 'Ben', 'Frau Weber', 'Herr Klein'];
const prepositions = prepositionContexts.map(([sentence, answer, hint, others], i) => q(`${pick(people, i)} ${sentence} (${hint})`, answer, others));

const local = [
  ...[
    ['Das Bild hängt an ___ Wand. (Wo?)', 'der'], ['Ich hänge das Bild an ___ Wand. (Wohin?)', 'die'],
    ['Die Katze liegt unter ___ Sofa. (Wo?)', 'dem'], ['Die Katze springt auf ___ Sofa. (Wohin?)', 'das'],
    ['Das Buch liegt auf ___ Schreibtisch. (Wo?)', 'dem'], ['Ich lege das Buch auf ___ Schreibtisch. (Wohin?)', 'den'],
    ['Die Flasche steht in ___ Kühlschrank. (Wo?)', 'dem'], ['Ich stelle die Milch in ___ Kühlschrank. (Wohin?)', 'den'],
    ['Tom sitzt neben ___ Lehrerin. (Wo?)', 'der'], ['Tom setzt sich neben ___ Lehrerin. (Wohin?)', 'die'],
    ['Wir warten vor ___ Kino. (Wo?)', 'dem'], ['Das Taxi fährt vor ___ Hotel. (Wohin?)', 'das'],
    ['Der Spiegel hängt über ___ Waschbecken. (Wo?)', 'dem'], ['Ich hänge den Spiegel über ___ Waschbecken. (Wohin?)', 'das'],
    ['Die Kinder spielen hinter ___ Haus. (Wo?)', 'dem'], ['Der Ball fliegt hinter ___ Garage. (Wohin?)', 'die'],
    ['Die Schuhe stehen unter ___ Bett. (Wo?)', 'dem'], ['Ich stelle die Schuhe unter ___ Bett. (Wohin?)', 'das'],
    ['Wir gehen in ___ Park. (Wohin?)', 'den'], ['Wir joggen in ___ Park. (Wo? Running around inside it.)', 'dem'],
    ['Die Tasse steht zwischen ___ Teller und dem Glas. (Wo?)', 'dem'], ['Ich stelle die Tasse zwischen ___ Teller und das Glas. (Wohin?)', 'den'],
  ].map(([prompt, answer]) => q(prompt, answer, definite)),
  q('Das Bild hängt ___ der Wand. (at / against the vertical surface)', 'an', ['auf', 'in', 'über']),
  q('Der Hund schläft ___ dem Tisch. (under)', 'unter', ['über', 'auf', 'an']),
  q('Die Apotheke ist ___ der Bank und der Post. (between)', 'zwischen', ['neben', 'hinter', 'unter']),
];

const wquestions = [
  ['___ kostet die Jacke? — 50 Euro.', 'Wie viel', ['Wie viele', 'Wann', 'Wie oft']],
  ['___ Farbe hat dein Auto? — Blau.', 'Welche', ['Welcher', 'Welches', 'Wie']],
  ['___ Tag ist heute? — Montag.', 'Welcher', ['Welche', 'Welches', 'Wann']],
  ['___ fährt der nächste Zug? — Um zehn Uhr.', 'Wann', ['Wo', 'Wohin', 'Wie viel']],
  ['___ geht es dir? — Gut, danke.', 'Wie', ['Wo', 'Was', 'Wer']],
  ['___ gehört der Schlüssel? — Mir.', 'Wem', ['Wer', 'Wen', 'Wessen']],
  ['___ ruft dich an? — Meine Mutter.', 'Wer', ['Wen', 'Wem', 'Was']],
  ['___ suchst du? — Meinen Schlüssel.', 'Was', ['Wer', 'Wem', 'Wo']],
  ['___ lange dauert der Film? — Zwei Stunden.', 'Wie', ['Wo', 'Was', 'Wann']],
  ['___ Geschwister hast du? — Zwei.', 'Wie viele', ['Wie viel', 'Wie oft', 'Wann']],
  ['___ hast du Geburtstag? — Im Mai.', 'Wann', ['Wo', 'Wie', 'Wohin']],
  ['___ gehst du? — Zum Arzt.', 'Wohin', ['Wo', 'Woher', 'Wann']],
  ['___ ist die Toilette? — Da hinten.', 'Wo', ['Wohin', 'Woher', 'Wann']],
  ['___ kommst du so spät? — Der Bus hatte Verspätung.', 'Warum', ['Wo', 'Wer', 'Wohin']],
  ['___ schreibst du? — Meiner Oma.', 'Wem', ['Wen', 'Wer', 'Wessen']],
  ['___ fragst du? — Den Lehrer.', 'Wen', ['Wer', 'Wem', 'Wessen']],
  ['___ machst du am Wochenende? — Ich besuche Freunde.', 'Was', ['Wer', 'Wo', 'Wie viel']],
  ['___ sprichst du? — Mit meinem Bruder.', 'Mit wem', ['Für wen', 'Wem', 'Woher']],
  ['___ Auto ist das? — Toms Auto.', 'Wessen', ['Wer', 'Wem', 'Wen']],
  ['___ gehst du schwimmen? — Zweimal pro Woche.', 'Wie oft', ['Wie lange', 'Wie viel', 'Woher']],
  ['___ schreibst du? — Mit einem Kuli.', 'Womit', ['Wem', 'Woher', 'Wohin']],
  ['___ kommt ihr? — Aus der Türkei.', 'Woher', ['Wohin', 'Wo', 'Wann']],
  ['___ heißt du? — Ich heiße Mia.', 'Wie', ['Was', 'Wer', 'Wo']],
  ['___ spät ist es? — Halb drei.', 'Wie', ['Was', 'Wann', 'Welche']],
].map(([prompt, answer, choices]) => q(prompt, answer, choices));

const localadverbs = [
  ['Ich warte ___ auf dich. (downstairs; position)', 'unten', ['oben', 'hinunter', 'herunter']],
  ['Das Badezimmer ist ___ im ersten Stock. (upstairs; position)', 'oben', ['unten', 'herauf', 'hinauf']],
  ['Wir wohnen ___, direkt neben dem Park. (here)', 'hier', ['hierher', 'dorthin', 'woher']],
  ['Die Bäckerei ist ___, auf der anderen Straßenseite. (over there)', 'dort', ['dorthin', 'hierher', 'hinein']],
  ['Fahr an der Kreuzung nach ___. (left)', 'links', ['rechts', 'geradeaus', 'hinten']],
  ['Das Kind sitzt im Auto ___. (at the back)', 'hinten', ['vorn', 'oben', 'draußen']],
  ['Es ist kalt. Die Katze bleibt ___. (inside; position)', 'drinnen', ['draußen', 'hinein', 'herein']],
  ['Die Sonne scheint. Wir essen heute ___. (outside; position)', 'draußen', ['drinnen', 'hinaus', 'heraus']],
  ['Ich finde meine Brille ___. (nowhere)', 'nirgendwo', ['irgendwo', 'überall', 'dorthin']],
  ['Im Sommer sind ___ Touristen. (everywhere)', 'überall', ['nirgendwo', 'irgendwo', 'dorthin']],
  ['Ich bin im Büro. Kommen Sie bitte ___! (in, toward the speaker)', 'herein', ['hinein', 'hinaus', 'drinnen']],
  ['Wir sind unten. Die Kinder kommen gleich ___. (down, toward the speaker)', 'herunter', ['hinunter', 'herauf', 'unten']],
  ['Ich bin im Garten. Kommt doch ___! (out, toward the speaker)', 'heraus', ['hinaus', 'herein', 'draußen']],
].map(([prompt, answer, choices]) => q(prompt, answer, choices));

// [infinitive, prefix, ich form, du form, er form, context, English meaning]
const separableVerbs = [
  ['ausgehen', 'aus', 'gehe', 'gehst', 'geht', 'am Samstag', 'go out'],
  ['anfangen', 'an', 'fange', 'fängst', 'fängt', 'um neun Uhr', 'start'],
  ['zurückkommen', 'zurück', 'komme', 'kommst', 'kommt', 'am Sonntag', 'come back'],
  ['einladen', 'ein', 'lade', 'lädst', 'lädt', 'Freunde', 'invite friends'],
  ['abholen', 'ab', 'hole', 'holst', 'holt', 'die Kinder', 'pick up the children'],
  ['ausmachen', 'aus', 'mache', 'machst', 'macht', 'das Licht', 'switch off the light'],
  ['anziehen', 'an', 'ziehe', 'ziehst', 'zieht', 'die Jacke', 'put on the jacket'],
  ['vorbereiten', 'vor', 'bereite', 'bereitest', 'bereitet', 'das Essen', 'prepare the meal'],
  ['zuhören', 'zu', 'höre', 'hörst', 'hört', 'gut', 'listen carefully'],
  ['mitbringen', 'mit', 'bringe', 'bringst', 'bringt', 'einen Kuchen', 'bring a cake'],
];
const separable = separableVerbs.flatMap(([infinitive, prefix, ich, , er, context, meaning], i) => {
  const rest = infinitive.slice(prefix.length);
  const name = pick(['Lena', 'Tom', 'Mia', 'Ben'], i);
  // Every option uses the same person, so only the word order and the split decide the answer.
  const separated = (subject, form) =>
    q(`${subject} ___ ${context} ___. (${infinitive})`, gaps(form, prefix), [gaps(`${prefix}${form}`), gaps('—', `${prefix}${form}`), gaps(form)]);
  return [
    separated('Ich', ich),
    separated(name, er),
    q(`Ich möchte ${context} ___. (${meaning})`, infinitive, [`${ich} ${prefix}`, `${prefix}${ich}`, `${prefix}zu${rest}`]),
    q(`Ich glaube, dass ${name} ${context} ___. (${infinitive})`, `${prefix}${er}`, [`${er} ${prefix}`, `${prefix} ${er}`, infinitive]),
  ];
});

// -ern verbs (kümmern) drop the e of the -en ending; -ieren verbs keep it.
const reflexiveVerbs = [['kümmer', 'um die Katze', true], ['verlieb', 'in Paris'], ['gewöhn', 'an das Wetter'], ['konzentrier', 'auf die Arbeit'], ['entschuldig', 'bei der Lehrerin'], ['informier', 'über den Kurs']];
const reflexiveSubjects = [['Mein Bruder', 't', 'sich'], ['Lena und ich', 'en', 'uns'], ['Du und Tom', 't', 'euch'], ['Meine Eltern', 'en', 'sich'], ['Ich', 'e', 'mich'], ['Du', 'st', 'dich']];
const reflexive = [
  // Two subjects per verb keep later rounds from repeating one sentence six times.
  ...reflexiveVerbs.flatMap(([stem, context, ern], i) => [0, 1].map(k => {
    const [subject, ending, pronoun] = pick(reflexiveSubjects, i * 2 + k);
    return q(`${subject} ${stem}${ern && ending === 'en' ? 'n' : ending} ___ ${context}. (reflexive)`, pronoun, ['mich', 'dich', 'sich', 'uns', 'euch']);
  })),
  q('Ich wünsche ___ ein Fahrrad. (for myself)', 'mir', ['mich', 'dir', 'sich']),
  q('Du wünschst ___ einen Hund. (for yourself)', 'dir', ['dich', 'mir', 'sich']),
  q('Ich ziehe ___ die Jacke an. (my own jacket)', 'mir', ['mich', 'dir', 'sich']),
  q('Du kämmst ___ die Haare. (your own hair)', 'dir', ['dich', 'mir', 'sich']),
  q('Ich sehe ___ den Film an. (I watch it)', 'mir', ['mich', 'dir', 'sich']),
  q('Wir waschen ___ die Hände. (our own hands)', 'uns', ['euch', 'sich', 'mir']),
];

// [infinitive, participle, sentence]
const participleVerbs = [
  ['schwimmen', 'geschwommen', 'Wir sind im See ___.'], ['fliegen', 'geflogen', 'Lena ist nach Rom ___.'],
  ['verstehen', 'verstanden', 'Hast du die Aufgabe ___?'], ['beginnen', 'begonnen', 'Der Kurs hat schon ___.'],
  ['treffen', 'getroffen', 'Ich habe Tom im Café ___.'], ['waschen', 'gewaschen', 'Mama hat die Wäsche ___.'],
  ['tragen', 'getragen', 'Tom hat den Koffer ___.'], ['laufen', 'gelaufen', 'Die Kinder sind nach Hause ___.'],
  ['sitzen', 'gesessen', 'Wir haben lange im Garten ___.'], ['singen', 'gesungen', 'Der Chor hat ein Lied ___.'],
  ['wissen', 'gewusst', 'Das habe ich nicht ___.'], ['kennen', 'gekannt', 'Ich habe ihn schon lange ___.'],
  ['erklären', 'erklärt', 'Die Lehrerin hat die Regel ___.'], ['verlieren', 'verloren', 'Ich habe meinen Schlüssel ___.'],
  ['einladen', 'eingeladen', 'Wir haben Freunde ___.'], ['abholen', 'abgeholt', 'Papa hat die Kinder ___.'],
  ['mitbringen', 'mitgebracht', 'Lena hat Kuchen ___.'], ['probieren', 'probiert', 'Hast du die Suppe ___?'],
  ['regnen', 'geregnet', 'Gestern hat es ___.'], ['zeigen', 'gezeigt', 'Tom hat mir die Stadt ___.'],
  ['schenken', 'geschenkt', 'Wir haben Oma Blumen ___.'], ['wandern', 'gewandert', 'Wir sind am Wochenende ___.'],
  ['passieren', 'passiert', 'Was ist ___?'],
];
const participle = participleVerbs.flatMap(([infinitive, form, sentence]) => {
  const stem = infinitive.slice(0, -2);
  const wrong = [infinitive, `ge${stem}t`, `ge${infinitive}`, `${stem}ten`];
  return [q(`Choose the Partizip II of “${infinitive}”.`, form, wrong), q(`${sentence} (${infinitive}, Perfekt)`, form, wrong)];
});

const countable = [
  q('Ich habe nur ___ Zeit. (a little of it as a whole)', 'wenig', ['wenige', 'viele', 'ein']),
  q('Es gibt nur ___ Äpfel. (few individual objects)', 'wenige', ['wenig', 'viel', 'etwas']),
  q('Wir haben ___ Geld. (a lot of it as a whole)', 'viel', ['viele', 'mehrere', 'ein']),
  q('Im Park sind ___ Kinder. (many individual people)', 'viele', ['viel', 'etwas', 'ein']),
  q('Möchtest du ___ Milch? (some; an indefinite amount)', 'etwas', ['einige', 'viele', 'eine']),
  q('Ich kaufe ___ Tomaten. (several individual objects)', 'einige', ['etwas', 'viel', 'eine']),
  q('Ich möchte zwei ___ Wasser. (bottles)', 'Flaschen', ['Flasche', 'Wasser', 'Wassers']),
  q('Ich trinke eine ___ Tee. (cup)', 'Tasse', ['Tassen', 'Tee', 'Tees']),
  q('Wir brauchen ein ___ Mehl. (1,000 grams)', 'Kilo', ['Kilos', 'Mehl', 'Mehle']),
  q('Zwei ___ Brot, bitte. (slices)', 'Scheiben', ['Scheibe', 'Brote', 'Brots']),
  q('“Honig” as a substance. Is it countable here?', 'Unzählbar', ['Zählbar']),
  q('“die Banane” — one individual fruit. Is it countable here?', 'Zählbar', ['Unzählbar']),
  q('“Geld” as an amount. Is it countable here?', 'Unzählbar', ['Zählbar']),
  q('“der Stift” — one individual object. Is it countable here?', 'Zählbar', ['Unzählbar']),
  q('Im Winter liegt ___ Schnee. (a lot of it as a whole)', 'viel', ['viele', 'mehrere', 'ein']),
  q('Anna hat ___ Freunde. (many individual people)', 'viele', ['viel', 'etwas', 'ein']),
];

export const EXTRA_BANKS = {
  sein, present, articles, accusative, modal, wordorder, perfect, dative, because, comparative,
  plural, indefinite: indefinite_, personal, possessive, nominative, demonstrative, prepositions,
  local, wquestions, localadverbs, separable, reflexive, participle, countable,
};

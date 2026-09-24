const q = (prompt, answer, choices) => [prompt, answer, [...new Set(choices)].filter(option => option !== answer)];

const localAdverbs = [
  ['Bleib ___. (here, where I am)', 'hier', ['dort', 'dorthin', 'woher']],
  ['Paul ist ___. (there, away from me)', 'dort', ['hierher', 'wohin', 'heraus']],
  ['Komm zu mir ___. (to here)', 'hierher', ['hier', 'woher', 'dort']],
  ['Geh zu Paul ___. (to there)', 'dorthin', ['dort', 'hierher', 'woher']],
  ['Es regnet. Wir bleiben ___. (inside; position)', 'drinnen', ['draußen', 'hinein', 'hinaus']],
  ['Die Kinder spielen im Garten ___. (outside; position)', 'draußen', ['drinnen', 'hinein', 'heraus']],
  ['Ich stehe vor dem Haus und gehe ___. (in, away from the speaker outside)', 'hinein', ['drinnen', 'hinaus', 'heraus']],
  ['Ich bin im Haus und gehe ___. (out, away from the speaker inside)', 'hinaus', ['draußen', 'hinein', 'herein']],
  ['Ich bin im Haus. Komm zu mir ___. (in, toward the speaker)', 'herein', ['hinein', 'hinaus', 'drinnen']],
  ['Ich bin draußen. Komm zu mir ___. (out, toward the speaker)', 'heraus', ['hinaus', 'herein', 'draußen']],
  ['Die Wohnung liegt im obersten Stock, ganz ___. (upstairs / at the top)', 'oben', ['unten', 'hinauf', 'herunter']],
  ['Der Keller ist ganz ___. (downstairs / at the bottom)', 'unten', ['oben', 'hinunter', 'herauf']],
  ['Ich stehe unten und gehe die Treppe ___. (up, away from the speaker below)', 'hinauf', ['oben', 'hinunter', 'herunter']],
  ['Ich stehe oben und gehe die Treppe ___. (down, away from the speaker above)', 'hinunter', ['unten', 'hinauf', 'herauf']],
  ['Ich stehe oben. Komm zu mir ___. (up, toward the speaker above)', 'herauf', ['hinauf', 'herunter', 'oben']],
  ['Ich stehe unten. Komm zu mir ___. (down, toward the speaker below)', 'herunter', ['hinunter', 'herauf', 'unten']],
  ['Biege an der Ampel ___ ab. (left)', 'links', ['rechts', 'geradeaus', 'oben']],
  ['Biege an der Kreuzung ___ ab. (right)', 'rechts', ['links', 'geradeaus', 'unten']],
  ['Geh immer ___. Nicht abbiegen! (straight ahead)', 'geradeaus', ['links', 'rechts', 'zurück']],
  ['Du hast den Schlüssel vergessen. Geh ___. (back)', 'zurück', ['geradeaus', 'hinauf', 'hinaus']],
  ['Der Fahrer sitzt im Bus ___. (at the front)', 'vorn', ['hinten', 'oben', 'draußen']],
  ['Wir sitzen in der letzten Reihe, ganz ___. (at the back)', 'hinten', ['vorn', 'drinnen', 'oben']],
  ['Der Schlüssel kann ___ im Zimmer liegen. (anywhere / somewhere, unspecified)', 'irgendwo', ['nirgendwo', 'überall', 'wohin']],
  ['Ich habe alles abgesucht. Der Schlüssel ist ___. (nowhere)', 'nirgendwo', ['irgendwo', 'überall', 'hierher']],
];

// [infinitive, prefix, ich form, du form, context, English meaning]
const separableVerbs = [
  ['aufstehen', 'auf', 'stehe', 'stehst', 'um sieben Uhr', 'get up'],
  ['ankommen', 'an', 'komme', 'kommst', 'morgen', 'arrive'],
  ['einkaufen', 'ein', 'kaufe', 'kaufst', 'heute', 'shop'],
  ['anrufen', 'an', 'rufe', 'rufst', 'Anna', 'call Anna'],
  ['aufräumen', 'auf', 'räume', 'räumst', 'das Zimmer', 'tidy the room'],
  ['mitkommen', 'mit', 'komme', 'kommst', 'heute', 'come along'],
  ['abfahren', 'ab', 'fahre', 'fährst', 'um acht Uhr', 'depart'],
  ['aufmachen', 'auf', 'mache', 'machst', 'die Tür', 'open the door'],
  ['zumachen', 'zu', 'mache', 'machst', 'das Fenster', 'close the window'],
  ['fernsehen', 'fern', 'sehe', 'siehst', 'abends', 'watch television'],
  ['aufhören', 'auf', 'höre', 'hörst', 'um fünf Uhr', 'stop'],
  ['ausfüllen', 'aus', 'fülle', 'füllst', 'das Formular', 'fill in the form'],
  ['einsteigen', 'ein', 'steige', 'steigst', 'in den Bus', 'get on the bus'],
  ['aussteigen', 'aus', 'steige', 'steigst', 'am Bahnhof', 'get off at the station'],
  ['umsteigen', 'um', 'steige', 'steigst', 'in Köln', 'change trains in Cologne'],
  ['aufwachen', 'auf', 'wache', 'wachst', 'früh', 'wake up early'],
  ['einschlafen', 'ein', 'schlafe', 'schläfst', 'schnell', 'fall asleep quickly'],
  ['mitnehmen', 'mit', 'nehme', 'nimmst', 'einen Regenschirm', 'take an umbrella'],
  ['kennenlernen', 'kennen', 'lerne', 'lernst', 'neue Leute', 'meet new people'],
  ['anmachen', 'an', 'mache', 'machst', 'den Fernseher', 'switch on the TV'],
];

// [subject, conjugated verb, rest]: the pronoun goes in the gap; the answer follows the subject.
const REFLEXIVE = { Ich: 'mich', Du: 'dich', Wir: 'uns', Ihr: 'euch' };
const reflexiveSentences = [
  ['Ich', 'freue', 'auf das Wochenende'], ['Du', 'beeilst', ', um den Bus zu erreichen'], ['Anna', 'entspannt', 'zu Hause'],
  ['Wir', 'erinnern', 'an den Termin'], ['Ihr', 'interessiert', 'für Musik'], ['Die Kinder', 'fühlen', 'heute gut'],
  ['Ich', 'ärgere', 'über den Lärm'], ['Du', 'beschäftigst', 'mit Musik'], ['Tom', 'bedankt', 'bei der Lehrerin'],
  ['Wir', 'rasieren', 'jeden Morgen'], ['Ihr', 'duscht', 'nach dem Sport'], ['Meine Eltern', 'erholen', 'im Urlaub'],
  ['Ich', 'setze', 'auf den Stuhl'], ['Du', 'kämmst', 'vor dem Spiegel'], ['Mein Bruder', 'entschuldigt', 'bei Anna'],
  ['Wir', 'verabreden', 'für Samstag'], ['Ihr', 'langweilt', 'im Unterricht'], ['Die Gäste', 'beschweren', 'über das Essen'],
  ['Ich', 'verliebe', 'in Paris'], ['Du', 'gewöhnst', 'an den Lärm'], ['Lena', 'kümmert', 'um die Katze'],
  ['Wir', 'konzentrieren', 'auf die Arbeit'], ['Ihr', 'informiert', 'über den Kurs'], ['Die Schüler', 'melden', 'für den Kurs an'],
  ['Ich', 'ziehe', 'schnell an'], ['Du', 'stellst', 'der Gruppe vor'], ['Paul', 'zieht', 'für die Party um'],
  ['Wir', 'ruhen', 'nach dem Essen aus'], ['Ihr', 'legt', 'kurz hin'], ['Die Kinder', 'waschen', 'vor dem Essen'],
  ['Ich', 'treffe', 'mit Freunden'], ['Du', 'unterhältst', 'mit dem Nachbarn'], ['Frau Weber', 'irrt', ''],
  ['Wir', 'bewegen', 'zu wenig'], ['Ihr', 'versteckt', 'hinter dem Baum'], ['Meine Freunde', 'freuen', 'über das Geschenk'],
  ['Ich', 'wasche', 'jeden Abend'], ['Du', 'verletzt', 'beim Sport'], ['Opa', 'fühlt', 'heute müde'],
  ['Wir', 'treffen', 'vor dem Kino'], ['Ihr', 'beeilt', 'heute sehr'], ['Die Studenten', 'bewerben', 'um eine Stelle'],
  ['Ich', 'erinnere', 'an den Urlaub'], ['Du', 'interessierst', 'für Sport'], ['Die Katze', 'versteckt', 'unter dem Bett'],
  ['Wir', 'setzen', 'an den Tisch'], ['Ihr', 'ärgert', 'über den Regen'], ['Die Nachbarn', 'entschuldigen', 'für den Lärm'],
  ['Ich', 'dusche', 'nach der Arbeit'], ['Du', 'ziehst', 'warm an'], ['Das Kind', 'freut', 'auf Weihnachten'],
  ['Wir', 'entspannen', 'am Wochenende'], ['Ihr', 'erholt', 'am Meer'], ['Die Touristen', 'informieren', 'im Hotel'],
  ['Ich', 'melde', 'morgen wieder'], ['Du', 'langweilst', 'nie'], ['Herr Braun', 'rasiert', 'jeden Morgen'],
  ['Wir', 'kümmern', 'um den Garten'], ['Ihr', 'konzentriert', 'auf den Test'], ['Meine Eltern', 'verabschieden', 'am Bahnhof'],
  ['Ich', 'beschäftige', 'mit Geschichte'], ['Du', 'bedankst', 'für die Hilfe'], ['Mia', 'gewöhnt', 'an die neue Schule'],
  ['Wir', 'stellen', 'kurz vor'], ['Ihr', 'zieht', 'nächste Woche um'], ['Die Kinder', 'streiten', 'oft'],
  ['Ich', 'lege', 'auf das Sofa'], ['Du', 'verliebst', 'schnell'], ['Lena', 'beschwert', 'beim Chef'],
  ['Wir', 'verspäten', 'leider'], ['Ihr', 'trefft', 'im Park'], ['Die Freunde', 'verabreden', 'zum Kaffee'],
];
const reflexiveQuestion = ([subject, verb, rest]) =>
  q(`${subject} ${verb} ___${rest.startsWith(',') || !rest ? '' : ' '}${rest}. (reflexive)`, REFLEXIVE[subject] || 'sich', ['mich', 'dich', 'sich', 'uns', 'euch']);

const participles = [
  ['lernen', 'gelernt'], ['kaufen', 'gekauft'], ['machen', 'gemacht'], ['spielen', 'gespielt'],
  ['kochen', 'gekocht'], ['hören', 'gehört'], ['suchen', 'gesucht'], ['arbeiten', 'gearbeitet'],
  ['antworten', 'geantwortet'], ['warten', 'gewartet'], ['öffnen', 'geöffnet'], ['reisen', 'gereist'],
  ['trinken', 'getrunken'], ['essen', 'gegessen'], ['lesen', 'gelesen'], ['schreiben', 'geschrieben'],
  ['sehen', 'gesehen'], ['finden', 'gefunden'], ['gehen', 'gegangen'], ['fahren', 'gefahren'],
  ['kommen', 'gekommen'], ['bleiben', 'geblieben'], ['schlafen', 'geschlafen'], ['sprechen', 'gesprochen'],
  ['nehmen', 'genommen'], ['helfen', 'geholfen'], ['bringen', 'gebracht'], ['denken', 'gedacht'],
  ['besuchen', 'besucht'], ['bezahlen', 'bezahlt'], ['erzählen', 'erzählt'], ['verkaufen', 'verkauft'],
  ['aufstehen', 'aufgestanden'], ['einkaufen', 'eingekauft'], ['anrufen', 'angerufen'], ['aufräumen', 'aufgeräumt'],
  ['studieren', 'studiert'], ['telefonieren', 'telefoniert'], ['reparieren', 'repariert'], ['fotografieren', 'fotografiert'],
];

const countNouns = [
  ['das Buch', 'Bücher'], ['der Apfel', 'Äpfel'], ['der Stuhl', 'Stühle'], ['das Auto', 'Autos'],
  ['die Flasche', 'Flaschen'], ['das Ticket', 'Tickets'], ['das Ei', 'Eier'], ['die Tasche', 'Taschen'],
];
const massNouns = ['Wasser', 'Milch', 'Mehl', 'Zucker', 'Salz', 'Reis', 'Öl', 'Butter'];

// Sentence practice complements direct participle recall, including auxiliaries
// supplied in the prompt so this topic still tests participle formation.
const participleContexts = [
  'habe Deutsch', 'habe Brot', 'habe eine Pause', 'habe Tennis',
  'habe Suppe', 'habe Musik', 'habe den Schlüssel', 'habe im Büro',
  'habe auf die Frage', 'habe auf den Bus', 'habe das Fenster', 'bin nach Berlin',
  'habe Tee', 'habe einen Apfel', 'habe ein Buch', 'habe einen Brief',
  'habe einen Film', 'habe die Tasche', 'bin nach Hause', 'bin nach Berlin',
  'bin zu spät', 'bin zu Hause', 'habe gut', 'habe mit Anna',
  'habe den Bus', 'habe dem Kind', 'habe das Buch', 'habe an dich',
  'habe das Museum', 'habe die Rechnung', 'habe eine Geschichte', 'habe das Auto',
  'bin früh', 'habe im Supermarkt', 'habe Anna', 'habe das Zimmer',
  'habe Medizin', 'habe mit Paul', 'habe das Fahrrad', 'habe den Garten',
];

// Two gaps, verb then prefix: the infinitive cue cannot give away the answer,
// because the task is where each part goes. "—" leaves a gap empty.
const gaps = (verb, end = '—') => `${verb} … ${end}`;
// Main clause: the verb goes in the first gap and the prefix at the end. Every option
// uses the same person, so only the word order and the split decide the answer.
const separated = (subject, context, infinitive, prefix, form) =>
  q(`${subject} ___ ${context} ___. (${infinitive})`, gaps(form, prefix), [gaps(`${prefix}${form}`), gaps('—', `${prefix}${form}`), gaps(form)]);

const banks = {
  localadverbs: localAdverbs.map(([prompt, answer, choices]) => q(prompt, answer, choices)),
  // Each verb gets four exercises; verbs alternate between two sets of subjects and clause types.
  separable: separableVerbs.flatMap(([infinitive, prefix, ich, du, context, meaning], i) => {
    const plural = infinitive.slice(prefix.length);
    return i % 2 === 0 ? [
      separated('Ich', context, infinitive, prefix, ich),
      separated('Du', context, infinitive, prefix, du),
      q(`Ich muss ${context} ___. (${meaning})`, infinitive, [`${ich} ${prefix}`, `${prefix}${ich}`, `${prefix}zu${plural}`]),
      q(`Ich sage, dass ich ${context} ___. (${infinitive})`, `${prefix}${ich}`, [`${ich} ${prefix}`, `${prefix} ${ich}`, infinitive]),
    ] : [
      separated('Paul', context, infinitive, prefix, du.replace(/st$/, 't')),
      separated('Wir', context, infinitive, prefix, plural),
      q(`Du willst ${context} ___. (${meaning})`, infinitive, [`${du} ${prefix}`, `${prefix}${du}`, `${prefix}zu${plural}`]),
      q(`Ich weiß, dass du ${context} ___. (${infinitive})`, `${prefix}${du}`, [`${du} ${prefix}`, `${prefix} ${du}`, infinitive]),
    ];
  }),
  reflexive: [
    ...reflexiveSentences.slice(0, 36).map(reflexiveQuestion),
    q('Ich wasche ___ die Hände. (my own hands)', 'mir', ['mich', 'dir', 'sich']),
    q('Du wäschst ___ die Hände. (your own hands)', 'dir', ['dich', 'mir', 'sich']),
    q('Ich putze ___ die Zähne. (my own teeth)', 'mir', ['mich', 'dir', 'sich']),
    q('Du putzt ___ die Zähne. (your own teeth)', 'dir', ['dich', 'mir', 'sich']),
  ],
  participle: participles.map(([infinitive, participle]) => {
    const stem = infinitive.slice(0, -2);
    return q(`Choose the Partizip II of “${infinitive}”.`, participle, [infinitive, `${stem}t`, `ge${infinitive}`, `${stem}ten`]);
  }),
  countable: [
    ...countNouns.flatMap(([singular, plural]) => [
      q(`“${singular}” — one individual object. Is it countable here?`, 'Zählbar', ['Unzählbar']),
      q(`Ich sehe ___ ${plural}. (many individual objects)`, 'viele', ['viel', 'etwas', 'ein']),
    ]),
    ...massNouns.flatMap(noun => [
      q(`“${noun}” as a substance, not portions or varieties. Is it countable here?`, 'Unzählbar', ['Zählbar']),
      q(`Wir haben ___ ${noun}. (a lot of the substance, not portions)`, 'viel', ['viele', 'mehrere', 'ein']),
    ]),
  ],
};

banks.reflexive.push(
  ...reflexiveSentences.slice(36).map(reflexiveQuestion),
  q('Ich kaufe ___ ein Buch. (for myself)', 'mir', ['mich', 'dir', 'sich']),
  q('Du kaufst ___ ein Buch. (for yourself)', 'dir', ['dich', 'mir', 'sich']),
  q('Ich merke ___ die Adresse. (I memorize it)', 'mir', ['mich', 'dir', 'sich']),
  q('Du merkst ___ die Adresse. (you memorize it)', 'dir', ['dich', 'mir', 'sich']),
);
banks.participle.push(...participles.map(([infinitive, participle], i) => {
  const stem = infinitive.slice(0, -2);
  return q(`Ich ${participleContexts[i]} ___. (${infinitive}, Perfekt)`, participle, [infinitive, `${stem}t`, `ge${infinitive}`, `${stem}ten`]);
}));

export const MORE_RULES = [
  { id: 'localadverbs', level: 'A2', title: 'Lokaladverbien', desc: 'hier, dort, drinnen, hinaus and more', tip: 'Position answers Wo? Direction answers Wohin? Her- points toward the speaker; hin- points away.' },
  { id: 'separable', level: 'A1', title: 'Trennbare Verben', desc: 'aufstehen, anrufen, einkaufen…', tip: 'In a main clause, the prefix goes to the end. Keep the verb together after a modal or at the end of a dass-clause.' },
  { id: 'reflexive', level: 'A2', title: 'Reflexive Verben', desc: 'mich, dich, sich, uns, euch; mir and dir', tip: 'Match the reflexive pronoun to the subject. With a separate accusative object such as die Hände, use dative mir / dir.' },
  { id: 'participle', level: 'A2', title: 'Partizip II — Partizip Perfekt', desc: 'Regular, irregular, prefixed and -ieren verbs', tip: 'Learn irregular participles. Separable prefixes place ge in the middle; inseparable prefixes and -ieren verbs normally have no ge.' },
  { id: 'countable', level: 'A1', title: 'Zählbare & unzählbare Nomen', desc: 'viele Bücher, viel Wasser', tip: 'Count individual objects with numbers and viele. For substances as a whole, use viel or a measure such as ein Glas Wasser.' },
].map(rule => ({ ...rule, qs: banks[rule.id] }));

export const MORE_THEORY = {
  localadverbs: {
    explanation: 'Local adverbs describe a place or direction without needing a following noun phrase. Compare dort (there) with dorthin (to there). The perspective of the speaker matters for her- and hin-.',
    headers: ['Use', 'Examples'], rows: [['Position', 'hier, dort, drinnen, draußen, oben, unten'], ['Destination', 'hierher, dorthin, hinein, hinaus'], ['Toward the speaker', 'herein, heraus, herauf, herunter'], ['Away from the speaker', 'hinein, hinaus, hinauf, hinunter'], ['Orientation', 'links, rechts, vorn, hinten, geradeaus'], ['Unspecified / absent location', 'irgendwo / nirgendwo']],
    examples: [['Ich bin drinnen. Komm herein!', 'I am inside. Come in toward me!'], ['Ich bin unten. Komm herunter!', 'I am downstairs. Come down toward me!'], ['Geh geradeaus und dann nach links.', 'Go straight ahead and then to the left.']],
    note: 'Wo? asks for a position, wohin? for a destination, and woher? for an origin. Informal forms such as rein and raus often leave the hin/her distinction implicit.',
  },
  separable: {
    explanation: 'Some verbs have a separable prefix. In a normal main clause, conjugate the main part of the verb and place the prefix at the end. In a subordinate clause, the complete conjugated verb comes last. With a modal, the complete infinitive comes last.',
    headers: ['Structure', 'Example'], rows: [['Main clause', 'Ich rufe Anna an.'], ['Modal + infinitive', 'Ich muss Anna anrufen.'], ['Subordinate clause', 'Ich sage, dass ich Anna anrufe.'], ['Perfekt', 'Ich habe Anna angerufen.']],
    examples: [['Du stehst früh auf.', 'You get up early.'], ['Wir kaufen heute ein.', 'We shop today.'], ['Paul sagt, dass er heute mitkommt.', 'Paul says that he is coming along today.']],
    note: 'Common separable prefixes include ab-, an-, auf-, aus-, ein-, mit- and zu-. Be-, emp-, ent-, er-, ge-, miss-, ver- and zer- are normally inseparable. Some other prefixes have both uses, depending on meaning and stress.',
  },
  reflexive: {
    explanation: 'A reflexive pronoun refers back to the subject. Some verbs regularly require it, such as sich beeilen or sich interessieren. Most examples here use accusative pronouns. With a separate accusative object, body-care expressions often use a dative reflexive pronoun.',
    headers: ['Subject', 'Accusative reflexive', 'Dative reflexive'], rows: [['ich', 'mich', 'mir'], ['du', 'dich', 'dir'], ['er / sie / es', 'sich', 'sich'], ['wir', 'uns', 'uns'], ['ihr', 'euch', 'euch'], ['sie / Sie', 'sich', 'sich']],
    examples: [['Ich freue mich auf den Urlaub.', 'I am looking forward to the holiday.'], ['Wir interessieren uns für Musik.', 'We are interested in music.'], ['Ich wasche mich. Ich wasche mir die Hände.', 'I wash myself. I wash my hands.']],
    note: 'Learn required prepositions with the verb: sich freuen auf, sich erinnern an, sich interessieren für. German and English do not always use reflexive forms in the same expressions.',
  },
  participle: {
    explanation: 'The Partizip II is the form used with haben or sein to build the Perfekt. This topic focuses on forming and recognizing the participle; the Perfekt topic also practises auxiliaries and sentence structure.',
    headers: ['Pattern', 'Infinitive', 'Partizip II'], rows: [['Regular', 'lernen', 'gelernt'], ['Extra e after the stem', 'arbeiten', 'gearbeitet'], ['Strong, often with a vowel change', 'trinken', 'getrunken'], ['Mixed', 'bringen', 'gebracht'], ['Separable prefix', 'anrufen', 'angerufen'], ['Inseparable prefix', 'besuchen', 'besucht'], ['-ieren', 'studieren', 'studiert']],
    examples: [['Ich habe Deutsch gelernt.', 'I studied German.'], ['Anna ist früh aufgestanden.', 'Anna got up early.'], ['Wir haben telefoniert.', 'We spoke on the telephone.']],
    note: 'Do not infer every participle from the infinitive: sehen → gesehen, nehmen → genommen, denken → gedacht. Learn the participle and auxiliary together for irregular verbs.',
  },
  countable: {
    explanation: 'Countability depends on meaning and context. Individual objects can usually be counted: ein Buch, zwei Bücher. Substances used as a whole are usually uncountable: Wasser, Milch, Mehl. These exercises explicitly distinguish objects from substances.',
    headers: ['Use', 'Countable objects', 'Substances as a whole'], rows: [['A large quantity', 'viele Bücher', 'viel Wasser'], ['A small quantity', 'wenige Bücher', 'wenig Wasser'], ['Number / measure', 'zwei Bücher', 'zwei Gläser Wasser'], ['Indefinite quantity', 'einige Bücher', 'etwas Wasser']],
    examples: [['Ich habe viele Bücher.', 'I have many books.'], ['Wir brauchen viel Mehl.', 'We need a lot of flour.'], ['Zwei Flaschen Wasser, bitte.', 'Two bottles of water, please.']],
    note: 'A substance can become countable when you mean portions or varieties: zwei Kaffee can mean two coffees in a café. In this topic, the substance questions exclude that meaning. German countability may differ from English.',
  },
};

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
];

const reflexiveVerbs = [
  ['freu', 'auf den Urlaub'], ['beeil', ', um den Bus zu erreichen'],
  ['entspann', 'zu Hause'], ['erinner', 'an den Termin'],
  ['interessier', 'für Musik'], ['fühl', 'heute gut'],
];
const reflexiveSubjects = [
  ['Ich', 'e', 'mich'], ['Du', 'st', 'dich'], ['Anna', 't', 'sich'],
  ['Wir', 'en', 'uns'], ['Ihr', 't', 'euch'], ['Die Kinder', 'en', 'sich'],
];

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

const banks = {
  localadverbs: localAdverbs.map(([prompt, answer, choices]) => q(prompt, answer, choices)),
  separable: separableVerbs.flatMap(([infinitive, prefix, ich, du, context, meaning]) => [
    q(`Ich ${ich} ${context} ___. (${infinitive})`, prefix, ['auf', 'an', 'ein', 'aus', 'ab', 'mit', 'zu', 'fern'].filter(value => value !== prefix).slice(0, 3)),
    q(`Du ___ ${context} ${prefix}. (${infinitive})`, du, [ich, infinitive, `${ich}n`]),
    q(`Ich muss ${context} ___. (${meaning})`, infinitive, [`${ich} ${prefix}`, `${prefix}zu${infinitive.slice(prefix.length)}`, `${prefix}${du}`]),
    q(`Ich sage, dass ich ${context} ___. (${infinitive})`, `${prefix}${ich}`, [`${ich} ${prefix}`, infinitive, `${prefix}${du}`]),
  ]),
  reflexive: [
    ...reflexiveVerbs.flatMap(([stem, context]) => reflexiveSubjects.map(([subject, ending, pronoun]) =>
      q(`${subject} ${stem}${stem==='erinner'&&ending==='en'?'n':ending} ___${context.startsWith(',') ? '' : ' '}${context}. (reflexive)`, pronoun, ['mich', 'dich', 'sich', 'uns', 'euch']))),
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

// Append drills to preserve the existing first-cycle exercise order.
banks.separable.push(...separableVerbs.flatMap(([infinitive, prefix, ich, du, context, meaning]) => {
  const plural = infinitive.slice(prefix.length);
  return [
    q(`Wir ___ ${context} ${prefix}. (${infinitive})`, plural, [ich, du, infinitive]),
    q(`Wir ${plural} ${context} ___. (${infinitive})`, prefix, ['auf', 'an', 'ein', 'aus', 'ab', 'mit', 'zu', 'fern'].filter(value => value !== prefix).slice(0, 3)),
    q(`Du willst ${context} ___. (${meaning})`, infinitive, [`${du} ${prefix}`, `${prefix}${ich}`, `${prefix}${du}`]),
    q(`Ich weiß, dass du ${context} ___. (${infinitive})`, `${prefix}${du}`, [`${du} ${prefix}`, infinitive, `${prefix}${ich}`]),
  ];
}));
banks.reflexive.push(
  ...[
    ['ärger', 'über den Lärm'], ['beschäftig', 'mit Musik'], ['bedank', 'bei Anna'],
    ['rasier', 'jeden Morgen'], ['dusch', 'nach dem Sport'], ['erhol', 'im Urlaub'],
  ].flatMap(([stem, context]) => reflexiveSubjects.map(([subject, ending, pronoun]) =>
    q(`${subject} ${stem}${stem.endsWith('er') && ending === 'en' ? 'n' : ending} ___ ${context}. (reflexive)`, pronoun, ['mich', 'dich', 'sich', 'uns', 'euch']))),
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

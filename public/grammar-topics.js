// Additional A1–A2 topics, with a curated exercise count for each topic.
const key = value => value.toLowerCase().trim();
const q = (prompt, answer, choices) => {
  const options = [...new Map(choices.map(value => [key(value), value])).values()].filter(value => key(value) !== key(answer));
  // Sentence-initial capitalization must not reveal the correct option.
  return [prompt, answer, prompt.startsWith('___') ? options.map(value => value[0].toUpperCase() + value.slice(1)) : options];
};
const nouns = [
  ['der', 'Tisch'], ['die', 'Tasche'], ['das', 'Buch'], ['der', 'Stuhl'],
  ['die', 'Lampe'], ['das', 'Fenster'], ['der', 'Schrank'], ['die', 'Jacke'],
  ['das', 'Auto'], ['der', 'Ball'], ['die', 'Uhr'], ['das', 'Bild'],
  ['der', 'Mantel'], ['die', 'Tür'], ['das', 'Fahrrad'], ['der', 'Schlüssel'],
  ['die', 'Brille'], ['das', 'Hemd'], ['der', 'Hut'], ['die', 'Zeitung'],
];
const pluralNouns = [
  ['der Apfel', 'Äpfel'], ['das Brot', 'Brote'], ['das Buch', 'Bücher'], ['das Haus', 'Häuser'],
  ['das Kind', 'Kinder'], ['der Mann', 'Männer'], ['die Frau', 'Frauen'], ['der Tisch', 'Tische'],
  ['der Stuhl', 'Stühle'], ['das Fenster', 'Fenster'], ['die Tür', 'Türen'], ['das Bett', 'Betten'],
  ['das Zimmer', 'Zimmer'], ['die Küche', 'Küchen'], ['die Lampe', 'Lampen'], ['die Tasche', 'Taschen'],
  ['das Auto', 'Autos'], ['das Foto', 'Fotos'], ['das Sofa', 'Sofas'], ['das Hotel', 'Hotels'],
  ['der Lehrer', 'Lehrer'], ['der Schüler', 'Schüler'], ['der Bruder', 'Brüder'], ['die Schwester', 'Schwestern'],
  ['die Mutter', 'Mütter'], ['der Vater', 'Väter'], ['die Tochter', 'Töchter'], ['der Sohn', 'Söhne'],
  ['der Freund', 'Freunde'], ['die Freundin', 'Freundinnen'], ['die Stadt', 'Städte'], ['der Zug', 'Züge'],
  ['der Bus', 'Busse'], ['das Fahrrad', 'Fahrräder'], ['der Tag', 'Tage'], ['die Woche', 'Wochen'],
  ['der Monat', 'Monate'], ['das Jahr', 'Jahre'], ['die Uhr', 'Uhren'], ['das Ei', 'Eier'],
];

const personalReferences = [
  ['I am talking about myself', 'ich', 'bin'], ['I am talking to one friend', 'du', 'bist'],
  ['Paul', 'er', 'ist'], ['Anna', 'sie', 'ist'], ['das Kind', 'es', 'ist'],
  ['Paul und ich', 'wir', 'sind'], ['Anna und du', 'ihr', 'seid'], ['die Kinder', 'sie', 'sind'],
  ['das Buch', 'es', 'ist'], ['I am addressing an adult formally', 'Sie', 'sind'],
];
// All predicates also make sense for the book (gender agreement uses es).
const personalPlaces = ['hier', 'dort', 'im Haus', 'im Garten', 'in Berlin', 'im Büro', 'in der Schule', 'zu Hause'];
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
const definite = ['der', 'die', 'das', 'den', 'dem'];
const indefinite = ['ein', 'eine', 'einen', 'einem', 'einer'];
const demonstratives = ['dieser', 'diese', 'dieses', 'diesen', 'diesem'];
const names = ['Anna', 'Paul', 'Lea', 'Tom'];

// English cues disambiguate prepositions that could otherwise fit a sentence.
const prepositionContexts = [
  ['fährt ___ dem Bus.', 'mit', 'by bus'], ['trinkt Tee ___ Zucker.', 'ohne', 'without sugar'],
  ['kauft ein Geschenk ___ die Mutter.', 'für', 'for the mother'], ['geht ___ den Park.', 'durch', 'through the park'],
  ['spielt ___ eine andere Mannschaft.', 'gegen', 'against another team'], ['läuft ___ das Haus herum.', 'um', 'around the house'],
  ['kommt ___ Spanien.', 'aus', 'from Spain (origin)'], ['wohnt ___ den Eltern.', 'bei', 'at the parents’ home'],
  ['fährt ___ Berlin.', 'nach', 'to Berlin'], ['geht ___ der Ärztin.', 'zu', 'to the doctor'],
  ['bekommt einen Brief ___ der Freundin.', 'von', 'from the friend'], ['lernt ___ einem Jahr Deutsch.', 'seit', 'for a year, continuing now'],
  ['bleibt ___ Freitag.', 'bis', 'until Friday'], ['arbeitet ___ Montag wieder.', 'ab', 'starting Monday'],
  ['kommt ___ acht Uhr.', 'um', 'at eight o’clock'], ['kommt ___ Montag.', 'am', 'on Monday'],
  ['kommt ___ Juli.', 'im', 'in July'], ['kommt ___ dem Essen.', 'nach', 'after the meal'],
  ['wartet ___ dem Haus.', 'vor', 'in front of the house'], ['wohnt ___ Berlin.', 'in', 'in Berlin'],
];

// Static location versus a new destination with all nine Wechselpräpositionen.
// Between-contexts supply the second noun separately for each case.
const localPlaces = [
  ['in', 'der', 'Schrank'], ['in', 'das', 'Zimmer'], ['in', 'die', 'Küche'],
  ['auf', 'der', 'Tisch'], ['auf', 'das', 'Sofa'], ['auf', 'die', 'Bank'],
  ['unter', 'der', 'Tisch'], ['unter', 'das', 'Bett'], ['unter', 'die', 'Bank'],
  ['neben', 'der', 'Schrank'], ['neben', 'das', 'Fenster'], ['neben', 'die', 'Tür'],
  ['vor', 'das', 'Haus'], ['hinter', 'die', 'Tür'], ['über', 'der', 'Tisch'], ['an', 'die', 'Wand'],
  ['vor', 'der', 'Schrank'], ['hinter', 'das', 'Sofa'],
  ['zwischen', 'der', 'Stuhl', ' und dem Tisch', ' und den Tisch'],
  ['zwischen', 'das', 'Fenster', ' und der Tür', ' und die Tür'],
];
const localMeanings = { in: 'inside', auf: 'on top of', unter: 'under', neben: 'next to', vor: 'in front of', hinter: 'behind', über: 'above', an: 'at / against the vertical surface of', zwischen: 'between' };

const wQuestions = [
  ['___ wohnt {name}? — In Berlin.', 'Wo', ['Wann', 'Wer', 'Wohin']],
  ['___ kommt {name}? — Aus Spanien.', 'Woher', ['Wohin', 'Wann', 'Wer']],
  ['___ fährt {name}? — Nach Hamburg.', 'Wohin', ['Woher', 'Wer', 'Wie oft']],
  ['___ kommt {name}? — Morgen.', 'Wann', ['Wo', 'Wer', 'Woher']],
  ['___ bleibt {name} zu Hause? — Weil es regnet.', 'Warum', ['Wo', 'Wer', 'Wohin']],
  ['___ heißt die Person auf {name}s Foto? — Alex.', 'Wie', ['Wo', 'Wann', 'Wohin']],
  ['___ alt ist {name}? — Zwanzig Jahre.', 'Wie', ['Wer', 'Wo', 'Wann']],
  ['___ bezahlt {name}? — Zwölf Euro.', 'Wie viel', ['Wie viele', 'Wie oft', 'Wie lange']],
  ['___ Bücher hat {name}? — Drei.', 'Wie viele', ['Wie viel', 'Wie lange', 'Wann']],
  ['___ kocht heute? — {name}.', 'Wer', ['Wen', 'Wem', 'Wann']],
  ['___ liest {name}? — Ein Buch.', 'Was', ['Wer', 'Wem', 'Wohin']],
  ['___ besucht {name}? — Den Bruder.', 'Wen', ['Wer', 'Wem', 'Wessen']],
  ['___ hilft {name}? — Der Schwester.', 'Wem', ['Wer', 'Wen', 'Wessen']],
  ['___ Tasche ist das? — {name}s Tasche.', 'Wessen', ['Wer', 'Wem', 'Wen']],
  ['___ bleibt {name}? — Zwei Wochen.', 'Wie lange', ['Wie oft', 'Woher', 'Wohin']],
  ['___ übt {name}? — Jeden Tag.', 'Wie oft', ['Wie lange', 'Woher', 'Wohin']],
  ['___ fährt {name} zur Arbeit? — Mit dem Bus.', 'Womit', ['Wohin', 'Wer', 'Wem']],
  ['___ lernt {name}? — Mit Alex.', 'Mit wem', ['Für wen', 'Wessen', 'Woher']],
  ['___ kocht {name}? — Für Alex.', 'Für wen', ['Mit wem', 'Wessen', 'Woher']],
  ['___ Sprache lernt {name}? — Deutsch.', 'Welche', ['Welcher', 'Welches', 'Welchem']],
];

const banks = {
  plural: pluralNouns.flatMap(([singular, plural]) => {
    const noun = singular.split(' ').slice(1).join(' ');
    const wrong = [noun, `${noun}e`, `${noun}en`, `${noun}s`, `${noun}er`];
    return [q(`Choose the plural of “${singular}”.`, plural, wrong), q(`Ich sehe zwei ___. (${singular})`, plural, wrong)];
  }),
  indefinite: nouns.flatMap(([article, noun]) => ['Das ist', 'Hier ist', 'Dort ist', 'Ich sehe'].map((frame, i) => {
    const answer = article === 'die' ? 'eine' : article === 'der' && i === 3 ? 'einen' : 'ein';
    return q(`${frame} ___ ${noun}. (a / an)`, answer, indefinite);
  })),
  personal: personalReferences.flatMap(([reference, pronoun, verb]) => personalPlaces.map(place =>
    q(`Use a subject pronoun for “${reference}”: ___ ${verb} ${place}.`, pronoun, ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr']))),
  possessive: nouns.slice(0, 5).flatMap(([article, noun]) => owners.flatMap(owner => {
    const inflectedStem = owner.stem === 'euer' ? 'eur' : owner.stem;
    const beforeNoun = article === 'die' ? `${inflectedStem}e` : owner.stem;
    const standalone = article === 'der' ? `${inflectedStem}er` : article === 'die' ? `${inflectedStem}e` : owner.neuter;
    const forms = [owner.stem, `${inflectedStem}e`, `${inflectedStem}er`, `${inflectedStem}en`, `${inflectedStem}em`, owner.neuter];
    return [
      q(`Das ist ___ ${noun}. (${owner.article})`, beforeNoun, forms),
      q(`Wem gehört ${article} ${noun}? — Das ist ___. (${owner.pronoun})`, standalone, forms),
    ];
  })),
  nominative: nouns.flatMap(([article, noun]) => {
    const capitalized = article[0].toUpperCase() + article.slice(1);
    return [
      q(`___ ${noun} ist hier. (the; subject)`, capitalized, definite),
      q(`___ ${noun} ist dort. (a / an; subject)`, article === 'die' ? 'Eine' : 'Ein', indefinite),
      q(`Which phrase is nominative? “${capitalized} ${noun} ist vor dem Haus.”`, `${capitalized} ${noun}`, ['dem Haus', 'vor dem Haus', 'ist']),
      q(`Das ist ___ ${noun}. (the; after sein)`, article, definite),
    ];
  }),
  demonstrative: nouns.flatMap(([article, noun]) => {
    const nom = { der: 'dieser', die: 'diese', das: 'dieses' }[article];
    const acc = { der: 'diesen', die: 'diese', das: 'dieses' }[article];
    const dat = article === 'die' ? 'dieser' : 'diesem';
    const which = { der: 'Welchen', die: 'Welche', das: 'Welches' }[article];
    return [
      q(`___ ${noun} ist hier. (this; subject)`, nom[0].toUpperCase() + nom.slice(1), demonstratives),
      q(`Ich sehe ___ ${noun}. (this)`, acc, demonstratives),
      q(`Ich stehe bei ___ ${noun}. (this)`, dat, demonstratives),
      q(`${which} ${noun} meinst du? — Ich meine ___. (this one)`, acc, demonstratives),
    ];
  }),
  prepositions: prepositionContexts.flatMap(([sentence, answer, hint]) => names.map(name =>
    q(`${name} ${sentence} (${hint})`, answer, ['mit', 'ohne', 'für', 'durch', 'gegen', 'um', 'aus', 'bei', 'nach', 'zu', 'von', 'seit', 'bis', 'ab', 'am', 'im', 'vor', 'in'].filter(value => value !== answer).slice(0, 3)))),
  local: localPlaces.flatMap(([prep, article, noun, datTail = '', accTail = '']) => {
    const dat = article === 'die' ? 'der' : 'dem';
    const acc = article === 'der' ? 'den' : article;
    const hint = localMeanings[prep];
    const options = Object.keys(localMeanings).filter(value => value !== prep).slice(0, 3);
    return [
      q(`Die Lampe ist ${prep} ___ ${noun}${datTail}. (Wo?)`, dat, definite),
      q(`Ich stelle die Lampe ${prep} ___ ${noun}${accTail}. (Wohin? New position.)`, acc, definite),
      q(`Die Lampe ist ___ ${dat} ${noun}${datTail}. (${hint}; location)`, prep, options),
      q(`Ich stelle die Lampe ___ ${acc} ${noun}${accTail}. (${hint}; destination)`, prep, options),
    ];
  }),
  wquestions: wQuestions.flatMap(([prompt, answer, choices]) => names.map(name => q(prompt.replaceAll('{name}', name), answer, choices))),
};

export const EXTRA_RULES = [
  { id: 'plural', level: 'A1', title: 'Pluralformen', desc: 'Plural endings, umlauts and unchanged forms', tip: 'Learn the plural with each noun. Common patterns include -e, -(e)n, -er, -s and no ending.' },
  { id: 'indefinite', level: 'A1', title: 'Unbestimmte Artikel', desc: 'ein, eine and einen', tip: 'Nominative: ein / eine / ein. In the accusative only masculine ein changes to einen.' },
  { id: 'personal', level: 'A1', title: 'Personalpronomen', desc: 'ich, du, er, sie, es, wir, ihr, Sie', tip: 'Choose the subject pronoun for the reference. Formal Sie uses the same verb forms as plural sie.' },
  { id: 'possessive', level: 'A1', title: 'Possessivpronomen', desc: 'mein Buch, meine Tasche; das ist meins', tip: 'Choose the stem for the owner, then the ending for the noun’s gender. Before a noun and standing alone can require different forms.' },
  { id: 'nominative', level: 'A1', title: 'Nominativ', desc: 'Subjects and nouns after sein', tip: 'The subject is nominative. A noun identifying the subject after sein is also nominative.' },
  { id: 'demonstrative', level: 'A2', title: 'Demonstrativpronomen', desc: 'dieser, diese, dieses and their case forms', tip: 'Dieser points to a specific person or thing. Its ending follows gender and case, like a definite article.' },
  { id: 'prepositions', level: 'A1', title: 'Präpositionen', desc: 'Time, origin, destination and relationships', tip: 'Use the English cue to choose the relationship. Learn each preposition with its case and context.' },
  { id: 'local', level: 'A2', title: 'Lokalpräpositionen', desc: 'Wo? versus Wohin?', tip: 'With these nine two-way prepositions, location (Wo?) takes dative; a new destination (Wohin?) takes accusative.' },
  { id: 'wquestions', level: 'A1', title: 'W-Fragen', desc: 'wer, was, wo, wann, warum and more', tip: 'Choose the question word that matches the answer. Wer is a subject; wen is accusative; wem is dative.' },
].map(rule => {
  const retained = (_, i) => ({
  plural: i % 2 === 0, indefinite: i % 4 === 0 || i % 4 === 3,
  personal: i % 8 < 2, possessive: i < 48, nominative: i < 32,
  demonstrative: i < 40, prepositions: i % 4 === 0,
  local: i % 4 < 2, wquestions: i % 4 === 0,
  })[rule.id];
  const previous = banks[rule.id].filter(retained);
  const expanded = ['plural', 'possessive', 'demonstrative', 'local'].includes(rule.id);
  return { ...rule, qs: expanded ? previous.concat(banks[rule.id].filter((q, i) => !retained(q, i))) : previous };
});

export const EXTRA_THEORY = {
  plural: {
    explanation: 'German nouns have several plural patterns. The nominative plural article is always die, regardless of singular gender. Some plurals add an umlaut; others keep the same form. Learn the singular and plural together.',
    headers: ['Pattern', 'Singular', 'Plural'], rows: [['-e', 'der Tisch', 'die Tische'], ['Umlaut + -e', 'der Stuhl', 'die Stühle'], ['-(e)n', 'die Frau', 'die Frauen'], ['Umlaut + -er', 'das Buch', 'die Bücher'], ['-s', 'das Auto', 'die Autos'], ['Unchanged', 'das Fenster', 'die Fenster']],
    examples: [['Das ist ein Buch. Hier sind zwei Bücher.', 'That is a book. Here are two books.'], ['Ich sehe drei Kinder.', 'I see three children.']],
    note: 'An unchanged plural still uses plural agreement: das Fenster ist offen; die Fenster sind offen. There is no plural form of ein meaning “a/an”.',
  },
  indefinite: {
    explanation: 'Ein and eine introduce one nonspecific person or thing, like “a” or “an”. The ending depends on gender and case. These exercises contrast a nominative subject or complement with an accusative direct object.',
    headers: ['Gender', 'Nominative', 'Accusative'], rows: [['Masculine', 'ein Tisch', 'einen Tisch'], ['Feminine', 'eine Tasche', 'eine Tasche'], ['Neuter', 'ein Buch', 'ein Buch']],
    examples: [['Das ist ein Tisch.', 'That is a table.'], ['Ich sehe einen Tisch.', 'I see a table.'], ['Hier ist eine Tasche.', 'Here is a bag.']],
    note: 'The indefinite article has no plural: ein Buch → Bücher. Kein means “not a / no” and follows similar endings, but it is not the affirmative article asked for here.',
  },
  personal: {
    explanation: 'Personal pronouns replace a person or noun. A subject pronoun is nominative. For a noun, use grammatical gender: der Tisch → er, die Tasche → sie, das Buch → es. People addressed directly use du, ihr or formal Sie.',
    headers: ['Reference', 'Subject pronoun', 'sein'], rows: [['Myself', 'ich', 'bin'], ['One friend addressed', 'du', 'bist'], ['Masculine / feminine / neuter', 'er / sie / es', 'ist'], ['A group including me', 'wir', 'sind'], ['Several friends addressed', 'ihr', 'seid'], ['Other people / things', 'sie', 'sind'], ['Formal address', 'Sie', 'sind']],
    examples: [['Paul ist hier. Er ist hier.', 'Paul is here. He is here.'], ['Das Buch ist dort. Es ist dort.', 'The book is there. It is there.'], ['Anna und ich sind hier. Wir sind hier.', 'Anna and I are here. We are here.']],
    note: 'Lowercase sie can mean “she” or “they”; the verb and context show which. Formal Sie is capitalized. Object forms such as mich and mir belong to other cases.',
  },
  possessive: {
    explanation: 'Possessive words identify an owner. Before a noun they act as possessive articles; alone they replace the noun. Choose the stem for the owner, then the ending for the gender and case of what is owned. These exercises use nominative forms.',
    headers: ['Owner', 'Before masculine / feminine / neuter noun', 'Alone: masculine / feminine / neuter'], rows: [['I', 'mein / meine / mein', 'meiner / meine / meins'], ['You (one friend)', 'dein / deine / dein', 'deiner / deine / deins'], ['He', 'sein / seine / sein', 'seiner / seine / seins'], ['She / they', 'ihr / ihre / ihr', 'ihrer / ihre / ihres'], ['We', 'unser / unsere / unser', 'unserer / unsere / unseres'], ['You (several friends)', 'euer / eure / euer', 'eurer / eure / eures'], ['You (formal)', 'Ihr / Ihre / Ihr', 'Ihrer / Ihre / Ihres']],
    examples: [['Das ist mein Buch. Das ist meins.', 'That is my book. That is mine.'], ['Das ist unsere Tasche. Das ist unsere.', 'That is our bag. That is ours.']],
    note: 'The ending follows the thing owned, not the owner’s gender: Paul has seine Tasche but sein Buch. Euer usually drops its second e before an ending: eure, eurer. Formal Ihr is capitalized.',
  },
  nominative: {
    explanation: 'The nominative marks the subject: who or what performs the action or has the stated quality. It also appears with nouns that identify the subject after sein. Word position alone does not determine the case.',
    headers: ['Gender / number', 'Definite', 'Indefinite'], rows: [['Masculine', 'der', 'ein'], ['Feminine', 'die', 'eine'], ['Neuter', 'das', 'ein'], ['Plural', 'die', 'No article']],
    examples: [['Der Tisch ist hier.', 'The table is here. Der Tisch is the subject.'], ['Das ist ein Tisch.', 'That is a table. Ein Tisch is nominative after sein.'], ['Den Mann sieht der Hund.', 'The dog sees the man. Der Hund is the nominative subject even though it comes later.']],
    note: 'Ask wer? or was? to find the subject. An object is different: Der Mann sieht den Hund — der Mann is nominative, den Hund is accusative.',
  },
  demonstrative: {
    explanation: 'Demonstratives point to a particular person or thing. Dieser can stand before a noun or replace it, like “this” or “this one”. These exercises practise its nominative, accusative and dative forms.',
    headers: ['Case', 'Masculine', 'Feminine', 'Neuter'], rows: [['Nominative', 'dieser', 'diese', 'dieses'], ['Accusative', 'diesen', 'diese', 'dieses'], ['Dative', 'diesem', 'dieser', 'diesem']],
    examples: [['Dieser Tisch ist neu.', 'This table is new.'], ['Ich sehe diesen Tisch.', 'I see this table.'], ['Welchen Tisch meinst du? Diesen.', 'Which table do you mean? This one.']],
    note: 'These endings resemble the definite article: der → dieser, den → diesen, dem → diesem. Dies- points to the item; the ending shows its grammatical role.',
  },
  prepositions: {
    explanation: 'Prepositions express relationships such as time, place, origin, purpose or company. They often require a particular case. Use the meaning cue and the noun phrase together; several prepositions may otherwise fit the same sentence.',
    headers: ['Use', 'Examples', 'Case / pattern'], rows: [['Company / origin', 'mit, aus, von', 'Dative'], ['Recipient / person or place', 'zu, bei', 'Dative'], ['Purpose / route / absence', 'für, durch, ohne, gegen, um', 'Accusative'], ['Continuing since', 'seit einem Jahr', 'Dative'], ['Clock time', 'um acht Uhr', 'um + time'], ['Days / months', 'am Montag / im Juli', 'am = an dem; im = in dem']],
    examples: [['Ich fahre mit dem Bus.', 'I travel by bus.'], ['Anna lernt seit einem Jahr Deutsch.', 'Anna has been learning German for a year.'], ['Paul fährt nach Berlin.', 'Paul is travelling to Berlin.']],
    note: 'Nach works for cities and most countries without an article; zu is used for many people and destinations. Bis marks an endpoint, ab a starting point. Spatial two-way prepositions have their own topic.',
  },
  local: {
    explanation: 'The nine two-way prepositions are an, auf, hinter, in, neben, über, unter, vor and zwischen. Use dative to describe a location (Wo?), and accusative to describe a new destination (Wohin?). These exercises keep full articles visible rather than contractions.',
    headers: ['Meaning', 'Location: dative', 'Destination: accusative'], rows: [['Inside', 'in dem Zimmer', 'in das Zimmer'], ['On top of', 'auf dem Tisch', 'auf den Tisch'], ['Next to', 'neben der Tür', 'neben die Tür'], ['At a vertical surface', 'an der Wand', 'an die Wand'], ['Between', 'zwischen dem Stuhl und dem Tisch', 'zwischen den Stuhl und den Tisch']],
    examples: [['Die Lampe ist auf dem Tisch.', 'The lamp is on the table.'], ['Ich stelle die Lampe auf den Tisch.', 'I put the lamp onto the table.'], ['Ich laufe im Park.', 'I run within the park: movement, but still a location.']],
    note: 'Movement alone does not imply accusative. Compare im Park laufen (within the park) with in den Park laufen (into the park). Common contractions are im, ins, am and ans.',
  },
  wquestions: {
    explanation: 'A W-question asks for a specific missing piece of information. Usually the question phrase comes first, followed by the conjugated verb and the subject. If wer is itself the subject, do not add another subject.',
    headers: ['Information', 'Question word'], rows: [['Person: subject / accusative / dative', 'wer / wen / wem'], ['Possessor / thing', 'wessen / was'], ['Place / destination / origin', 'wo / wohin / woher'], ['Time / reason', 'wann / warum'], ['Method / means', 'wie / womit'], ['Amount / count', 'wie viel / wie viele'], ['Duration / frequency', 'wie lange / wie oft']],
    examples: [['Wo wohnst du? In Berlin.', 'Where do you live? In Berlin.'], ['Wem hilfst du? Meiner Schwester.', 'Whom do you help? My sister.'], ['Wie viele Bücher hast du? Drei.', 'How many books do you have? Three.']],
    note: 'Read the answer to choose the question: aus Berlin answers woher, nach Berlin answers wohin. Wie viel asks an amount; wie viele accompanies a countable plural noun.',
  },
};

import { EXTRA_THEORY } from './grammar-topics.js';
import { MORE_THEORY } from './grammar-more.js';

const BASE_THEORY={
 sein:{
  explanation:'Sein means “to be”. Use it to say who someone is, how they feel, or where they are. It is irregular: learn each form rather than adding regular verb endings.',
  headers:['Subject','Form of sein'],rows:[['ich','bin'],['du','bist'],['er / sie / es','ist'],['wir','sind'],['ihr','seid'],['sie / Sie','sind']],
  examples:[['Ich bin müde.','I am tired.'],['Anna ist in Berlin.','Anna is in Berlin.'],['Sind Sie Lehrerin?','Are you a teacher? (formal, to a woman)']],
  note:'Lowercase sie can mean “she” or “they”: sie ist = she is; sie sind = they are. Capitalized Sie is the formal “you” and takes sind.'
 },
 present:{
  explanation:'For most regular verbs, remove -en from the infinitive and add the ending for the subject. Lernen → lern-. The present tense can mean both “I learn” and “I am learning”; German does not need a separate continuous form.',
  headers:['Subject','Ending','Example'],rows:[['ich','-e','lerne'],['du','-st','lernst'],['er / sie / es','-t','lernt'],['wir','-en','lernen'],['ihr','-t','lernt'],['sie / Sie','-en','lernen']],
  examples:[['Ich lerne Deutsch.','I am learning German.'],['Wir kaufen Brot.','We buy bread.'],['Du arbeitest heute.','You are working today.']],
  note:'Stems ending in -t or -d usually need an extra e: du arbeitest, er arbeitet. After -s, -ß, -x or -z, du usually takes -t: du heißt. Some common verbs change their vowel: du sprichst, er spricht.'
 },
 articles:{
  explanation:'Every German noun has a grammatical gender. Learn the noun with its article and plural form. These are the definite articles in the nominative case, used for the subject of a sentence.',
  headers:['Gender / number','“The”','“A / an”'],rows:[['Masculine','der','ein'],['Feminine','die','eine'],['Neuter','das','ein'],['Plural (all genders)','die','No indefinite article']],
  examples:[['Der Tisch ist groß.','The table is big.'],['Die Küche ist klein.','The kitchen is small.'],['Das Fenster ist offen.','The window is open.'],['Die Fenster sind offen.','The windows are open.']],
  note:'Grammatical gender is not always natural gender: das Mädchen = the girl. Capitalize nouns. Articles can change with case: der Tisch becomes den Tisch when it is a direct object.'
 },
 accusative:{
  explanation:'The accusative often marks the direct object: the person or thing that someone sees, buys, has, or needs. Ask “whom?” or “what?” after the verb. The subject stays in the nominative.',
  headers:['Gender / number','Nominative','Accusative'],rows:[['Masculine','der / ein','den / einen'],['Feminine','die / eine','die / eine'],['Neuter','das / ein','das / ein'],['Plural','die','die']],
  examples:[['Der Mann kauft einen Apfel.','The man buys an apple. (Der Mann = subject; einen Apfel = object.)'],['Ich habe eine Katze.','I have a cat.'],['Wir brauchen das Buch.','We need the book.']],
  note:'Among these articles, only the masculine forms change. Pronouns also change: ich → mich, du → dich, er → ihn. The prepositions für, ohne, durch, gegen and um take the accusative too.'
 },
 modal:{
  explanation:'A modal verb adds meaning such as ability (können), necessity (müssen), or intention (wollen). Conjugate the modal verb for the subject. Put the other verb in its infinitive form at the end of the clause.',
  headers:['Subject','können','müssen','wollen'],rows:[['ich','kann','muss','will'],['du','kannst','musst','willst'],['er / sie / es','kann','muss','will'],['wir','können','müssen','wollen'],['ihr','könnt','müsst','wollt'],['sie / Sie','können','müssen','wollen']],
  examples:[['Ich kann Deutsch sprechen.','I can speak German.'],['Du musst heute arbeiten.','You have to work today.'],['Könnt ihr kommen?','Can you come? (informal plural)']],
  note:'Do not conjugate both verbs: ich kann sprechen, not ich kann spreche. Do not add zu after these modals. Nicht müssen means “not have to”; “must not” is nicht dürfen.'
 },
 wordorder:{
  explanation:'In a normal statement, the conjugated verb is the second sentence element. The first element can be the subject, a time phrase, or a place phrase. A phrase such as am Montag counts as one element, even though it contains two words.',
  headers:['First element','Conjugated verb','Rest of the sentence'],rows:[['Ich','lerne','heute Deutsch.'],['Heute','lerne','ich Deutsch.'],['Am Montag','haben','wir frei.']],
  examples:[['Heute lerne ich Deutsch.','Today I am learning German.'],['Wann lernst du Deutsch?','When do you study German?'],['Lernst du Deutsch?','Are you learning German?']],
  note:'When something other than the subject comes first, put the subject after the verb: heute lerne ich. In yes/no questions the verb comes first. In questions with a question word, it normally comes second.'
 },
 perfect:{
  explanation:'The Perfekt is commonly used to talk about completed past events, especially in conversation. Use a present-tense form of haben or sein plus a past participle at the end. Most verbs use haben. Many intransitive verbs describing a change of place or state use sein; sein and bleiben also use sein.',
  headers:['Verb pattern','Infinitive','Past participle'],rows:[['Regular: ge- + stem + -t','lernen','gelernt'],['Often irregular: ge- … -en','trinken','getrunken'],['Separable prefix: ge in the middle','einkaufen','eingekauft'],['Inseparable prefix: no ge','besuchen','besucht'],['Verbs in -ieren: no ge','studieren','studiert']],
  examples:[['Ich habe Kaffee getrunken.','I drank coffee.'],['Wir sind nach Berlin gefahren.','We travelled to Berlin.'],['Sie ist spät gekommen.','She arrived late.'],['Er hat Deutsch gelernt.','He studied German.']],
  note:'Match the auxiliary to the subject: ich habe, du hast, wir haben; ich bin, du bist, wir sind. The participle stays the same. Movement alone is not a reliable test: learn the auxiliary together with each verb.'
 },
 dative:{
  explanation:'The dative often marks the recipient of something. It is also required by verbs such as helfen and danken and by the prepositions aus, bei, mit, nach, seit, von and zu. For static locations, auf, neben, vor and hinter take the dative when answering “where?”, rather than movement toward a destination.',
  headers:['Gender / number','Definite article','Indefinite article'],rows:[['Masculine','dem','einem'],['Feminine','der','einer'],['Neuter','dem','einem'],['Plural','den','No indefinite article']],
  examples:[['Er gibt dem Mann das Buch.','He gives the man the book. (Recipient: dem Mann; direct object: das Buch.)'],['Ich fahre mit dem Bus.','I travel by bus.'],['Wir helfen dem Kind.','We help the child.'],['Ich wohne bei meinen Eltern.','I live with my parents.']],
  note:'Dative plural nouns usually add -n unless the plural already ends in -n or -s: mit den Kindern, mit den Eltern, mit den Autos. Common contractions: zu dem → zum, zu der → zur, bei dem → beim.'
 },
 because:{
  explanation:'Weil means “because” and gives a reason. Dass means “that” and introduces what someone says, thinks, or knows. Both introduce a subordinate clause. In standard written German, the conjugated verb goes at the end of that clause. Separate it from the main clause with a comma.',
  headers:['Main clause','Connector','Subordinate clause'],rows:[['Ich bleibe hier,','weil','ich müde bin.'],['Sie sagt,','dass','sie Deutsch lernt.'],['Ich weiß,','dass','er kommen kann.']],
  examples:[['Ich bleibe hier, weil ich müde bin.','I am staying here because I am tired.'],['Sie sagt, dass sie Deutsch lernt.','She says that she is learning German.'],['Weil ich müde bin, bleibe ich hier.','Because I am tired, I am staying here.']],
  note:'With a modal, the conjugated modal comes last: weil ich arbeiten muss. If the subordinate clause comes first, the main clause starts with its verb: Weil …, bleibe ich … . Do not confuse dass (“that”) with das (“the” / “that” as a pronoun).'
 },
 comparative:{
  explanation:'Use the comparative to compare two things: usually adjective + -er, followed by als (“than”). Use the superlative for the highest degree. When describing how someone does something, or after sein without a following noun, use am …-sten. Before a noun, use a superlative stem with the appropriate adjective ending.',
  headers:['Base form','Comparative','Superlative with am'],rows:[['schnell','schneller','am schnellsten'],['groß','größer','am größten'],['kurz','kürzer','am kürzesten'],['gut','besser','am besten'],['viel','mehr','am meisten'],['gern (gladly)','lieber','am liebsten']],
  examples:[['Berlin ist größer als Bonn.','Berlin is bigger than Bonn.'],['Anna läuft am schnellsten.','Anna runs fastest.'],['Das ist der kürzeste Weg.','That is the shortest route.'],['Anna ist so groß wie ich.','Anna is as tall as I am.']],
  note:'Some short adjectives add an umlaut (groß → größer), but not all do. Some superlatives need -est- (kurz → kürzest-). Use als for unequal comparisons and so … wie for equal ones. Learn irregular forms such as gut → besser → am besten.'
 }
};

export const THEORY = { ...BASE_THEORY, ...EXTRA_THEORY, ...MORE_THEORY };

const WORDS=[
['der Apfel','apple','A1','Food'],['das Brot','bread','A1','Food'],['der Käse','cheese','A1','Food'],['das Wasser','water','A1','Food'],['der Kaffee','coffee','A1','Food'],['die Kartoffel','potato','A1','Food'],['der Fisch','fish','A1','Food'],['das Gemüse','vegetables','A1','Food'],
['das Haus','house','A1','Home'],['das Zimmer','room','A1','Home'],['der Tisch','table','A1','Home'],['der Stuhl','chair','A1','Home'],['das Fenster','window','A1','Home'],['die Küche','kitchen','A1','Home'],['das Bett','bed','A1','Home'],['die Tür','door','A1','Home'],
['gehen','to go','A1','Verbs'],['kommen','to come','A1','Verbs'],['machen','to do / make','A1','Verbs'],['lernen','to learn','A1','Verbs'],['sprechen','to speak','A1','Verbs'],['wohnen','to live','A1','Verbs'],['kaufen','to buy','A1','Verbs'],['brauchen','to need','A1','Verbs'],
['der Bahnhof','train station','A1','City'],['die Straße','street','A1','City'],['der Supermarkt','supermarket','A1','City'],['die Apotheke','pharmacy','A1','City'],['der Park','park','A1','City'],['die Schule','school','A1','City'],
['die Erfahrung','experience','A2','Life'],['die Einladung','invitation','A2','Life'],['die Reise','trip','A2','Travel'],['die Unterkunft','accommodation','A2','Travel'],['der Fahrplan','timetable','A2','Travel'],['umsteigen','to change trains','A2','Travel'],['vereinbaren','to arrange','A2','Verbs'],['erklären','to explain','A2','Verbs'],['vergessen','to forget','A2','Verbs'],['passieren','to happen','A2','Verbs'],['pünktlich','punctual','A2','Adjectives'],['gemütlich','cosy','A2','Adjectives'],['wahrscheinlich','probably','A2','Adverbs'],['deshalb','therefore','A2','Connectors']
].map((w,i)=>({id:i,de:w[0],en:w[1],level:w[2],topic:w[3]}));

const RULES=[
 {id:'sein',level:'A1',title:'sein — to be',desc:'ich bin, du bist, er/sie ist…',tip:'Choose the form of sein that matches the subject.',qs:[['Ich ___ müde.','bin',['bist','ist','sind']],['Du ___ nett.','bist',['bin','seid','sind']],['Wir ___ hier.','sind',['seid','ist','bin']],['Ihr ___ spät.','seid',['sind','bist','ist']],['Anna ___ in Berlin.','ist',['bin','seid','sind']]]},
 {id:'present',level:'A1',title:'Present tense endings',desc:'Regular verbs in the present tense',tip:'Remove -en and add: -e, -st, -t, -en, -t, -en.',qs:[['Ich lern___ Deutsch.','e',['st','t','en']],['Du wohn___ in Limassol.','st',['e','t','en']],['Er mach___ Kaffee.','t',['e','st','en']],['Wir kauf___ Brot.','en',['e','st','t']],['Ihr spiel___ heute.','t',['e','st','en']]]},
 {id:'articles',level:'A1',title:'Articles: der, die, das',desc:'Gender and definite articles',tip:'Learn every noun together with its article.',qs:[['___ Tisch','der',['die','das','den']],['___ Küche','die',['der','das','den']],['___ Fenster','das',['der','die','den']],['___ Bahnhof','der',['die','das','den']],['___ Straße','die',['der','das','den']]]},
 {id:'accusative',level:'A1',title:'Accusative case',desc:'Direct objects and einen',tip:'Only masculine articles change: der → den, ein → einen.',qs:[['Ich kaufe ___ Apfel.','einen',['ein','eine','einem']],['Er sieht ___ Mann.','den',['der','dem','die']],['Wir brauchen ___ Tisch.','einen',['ein','eine','einer']],['Sie trinkt ___ Kaffee.','den',['der','dem','das']],['Ich habe ___ Katze.','eine',['einen','ein','einem']]]},
 {id:'modal',level:'A1',title:'Modal verbs',desc:'können, müssen, wollen',tip:'The modal verb is conjugated; the other verb goes to the end.',qs:[['Ich ___ Deutsch sprechen.','kann',['könne','kannst','könnt']],['Du ___ heute arbeiten.','musst',['muss','müssen','müsst']],['Wir ___ Pizza essen.','wollen',['will','wollt','willst']],['___ ihr kommen?','Könnt',['Kann','Können','Kannst']],['Er ___ früh schlafen.','muss',['musst','müssen','müsst']]]},
 {id:'wordorder',level:'A1',title:'Word order',desc:'Verb in position 2',tip:'In a statement, the conjugated verb stays in the second position.',qs:[['Heute ___ ich Deutsch.','lerne',['ich lerne','lernen','lernst']],['Am Montag ___ wir frei.','haben',['wir haben','hat','habt']],['Dann ___ er nach Hause.','geht',['er geht','gehen','gehst']],['In Berlin ___ sie.','wohnt',['sie wohnt','wohnen','wohnst']],['Morgen ___ ich Kaffee.','kaufe',['ich kaufe','kaufen','kauft']]]},
 {id:'perfect',level:'A2',title:'Perfect tense',desc:'haben/sein + past participle',tip:'Use sein mainly with movement/change; otherwise usually haben.',qs:[['Ich ___ Kaffee getrunken.','habe',['bin','hat','haben']],['Wir ___ nach Berlin gefahren.','sind',['haben','seid','ist']],['Er hat Deutsch ___.','gelernt',['lernen','lernte','gelernen']],['Sie ___ spät gekommen.','ist',['hat','sind','haben']],['Du hast das Buch ___.','gekauft',['kaufen','gekaufen','kaufte']]]},
 {id:'dative',level:'A2',title:'Dative case',desc:'Indirect objects and key prepositions',tip:'mit, nach, aus, zu, von and bei always take dative.',qs:[['Ich fahre mit ___ Bus.','dem',['den','der','das']],['Sie spricht mit ___ Frau.','der',['die','den','das']],['Wir helfen ___ Kind.','dem',['das','den','der']],['Er gibt ___ Mann das Buch.','dem',['den','der','die']],['Ich wohne bei ___ Eltern.','meinen',['meine','meiner','mein']]]},
 {id:'because',level:'A2',title:'weil and dass',desc:'The verb moves to the end',tip:'After weil or dass, put the conjugated verb at the end.',qs:[['Ich bleibe hier, weil ich müde ___.','bin',['ich bin','bist','sein']],['Sie sagt, dass sie Deutsch ___.','lernt',['sie lernt','lernen','lerne']],['Wir gehen, weil es spät ___.','ist',['es ist','sein','sind']],['Ich weiß, dass er heute ___.','kommt',['er kommt','kommen','komme']],['Er kocht, weil er Hunger ___.','hat',['er hat','haben','habe']]]},
 {id:'comparative',level:'A2',title:'Comparatives',desc:'größer, besser, am besten',tip:'Most comparatives add -er; superlatives use am …-sten.',qs:[['Berlin ist ___ als Bonn.','größer',['groß','am größten','größte']],['Kaffee ist ___ als Tee.','stärker',['stark','am stärksten','stärkste']],['Heute geht es mir ___.','besser',['gut','am besten','guter']],['Das ist ___ Weg.','der kürzeste',['kürzer','am kürzesten','kurz']],['Anna läuft ___ als ich.','schneller',['schnell','am schnellsten','schnelle']]]}
];

const THEORY={
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
  explanation:'The dative often marks the recipient of something. It is also required by verbs such as helfen and danken and by the prepositions aus, bei, mit, nach, seit, von and zu. The verb or preposition determines the case.',
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

function ruleTheory(rule){const t=THEORY[rule.id];return `<details class="rule-theory"><summary>Theory &amp; examples<span class="theory-rule-name"> · ${esc(rule.title)}</span></summary><div class="theory-body"><p>${esc(t.explanation)}</p><div class="theory-table" role="region" aria-label="${esc(rule.title)} forms" tabindex="0"><table><thead><tr>${t.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td lang="de">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>Examples</h4><ul class="theory-examples">${t.examples.map(([de,en])=>`<li><strong lang="de">${esc(de)}</strong><span>${esc(en)}</span></li>`).join('')}</ul><p class="theory-note"><strong>Remember:</strong> ${esc(t.note)}</p></div></details>`}

const defaultState={xp:0,answered:0,correct:0,wordMastery:{},ruleMastery:{},streak:1,sound:true,activity:[0,0,0,0,0,0,0]};
let state=structuredClone(defaultState);
let currentView='today', session=null;
const $=s=>document.querySelector(s), content=$('#content');
let account=null, ready=false, revision=0, dirty=false, saving=null, changeNumber=0, syncBlocked=false;
const save=()=>{updateChrome();if(account){dirty=true;changeNumber++;void flushProgress()}else{try{localStorage.setItem('wortwerk-guest-progress',JSON.stringify(state))}catch{syncNotice('This browser cannot save guest progress. Sign in to save it.')}}};
function syncNotice(message,retry=false){const box=$('#syncStatus');box.textContent=message;if(retry){const b=document.createElement('button');b.textContent='Retry';b.onclick=()=>void flushProgress();box.append(b)}}
function flushProgress(){
  if(saving)return saving;
  if(!account||!ready||!dirty||syncBlocked)return Promise.resolve(!dirty);
  saving=(async()=>{
    while(dirty){
      const version=changeNumber;
      const payload={userId:account.id,revision,progress:structuredClone(state)};
      try{
        const response=await fetch('/api/progress',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),keepalive:true});
        const result=await response.json();
        if(!response.ok){if(response.status===401||response.status===409)syncBlocked=true;throw new Error(result.error||'Could not save progress.')}
        revision=result.revision;
        if(version===changeNumber)dirty=false;
        syncNotice('');
      }catch(error){syncNotice((error.message||'Connection lost.')+' Your unsaved progress remains in this tab.',!syncBlocked);return false}
    }
    return true;
  })().finally(()=>{saving=null});
  return saving;
}
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function updateChrome(){const mastered=Object.values(state.ruleMastery).filter(x=>x>=85).length;$('#levelPct').textContent=Math.min(100,Math.round(state.xp/5))+'%';$('#totalMastery').textContent=mastered+' skills mastered';$('#streakCount').textContent=state.streak}
function go(view){if(!ready)return;currentView=view;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('.sidebar').classList.remove('open');({today:renderToday,words:renderWords,grammar:renderGrammar,progress:renderProgress}[view]||renderToday)()}
function renderToday(){const accuracy=state.answered?Math.round(state.correct/state.answered*100):0;content.innerHTML=`<section class="page"><span class="eyebrow">Your German workshop</span><h1>Guten Tag.</h1><p class="intro">Build useful German through short, repeated practice. Grammar unlocks at 85% mastery—because recognising a rule once is not the same as knowing it.</p><div class="stats"><div class="stat"><strong>${state.xp}</strong><small>total XP</small></div><div class="stat"><strong>${accuracy}%</strong><small>answer accuracy</small></div><div class="stat"><strong>${Object.keys(state.wordMastery).length}</strong><small>words practised</small></div></div><div class="section-head"><div><span class="eyebrow">Continue</span><h2>Today’s practice</h2></div><p>About 8 minutes</p></div><div class="lesson-grid"><button class="lesson-card" data-start="words"><span class="lesson-icon">Aa</span><span><h3>Mixed vocabulary</h3><p>Translation, recall and letter building</p></span><span class="score">+10 XP</span></button><button class="lesson-card" data-rule="${nextRule().id}"><span class="lesson-icon">§</span><span><h3>${nextRule().title}</h3><p>${nextRule().desc}</p></span><span class="score">${state.ruleMastery[nextRule().id]||0}%</span></button></div><div class="mastery-note"><strong>The mastery loop</strong><br>Each grammar round mixes five questions. Missed patterns return in later rounds until your rolling score reaches 85%.</div></section>`;bindLessonButtons()}
function nextRule(){return RULES.find(r=>(state.ruleMastery[r.id]||0)<85)||RULES[0]}
function renderWords(level='all'){const list=level==='all'?WORDS:WORDS.filter(w=>w.level===level);content.innerHTML=`<section class="page"><span class="eyebrow">Vocabulary</span><h1>Words in motion.</h1><p class="intro">Practise both directions and rebuild German words from letters. Articles always stay attached to nouns.</p><div class="filters">${['all','A1','A2'].map(x=>`<button class="filter ${x===level?'active':''}" data-level="${x}">${x==='all'?'All levels':x}</button>`).join('')}</div><div class="section-head"><h2>${list.length} useful words</h2><button class="primary" data-start="words" data-word-level="${level}">Start mixed practice</button></div><div class="lesson-grid">${Object.entries(groupBy(list,'topic')).map(([topic,arr])=>`<button class="lesson-card" data-topic="${topic}"><span class="lesson-icon">${topic.slice(0,1)}</span><span><h3>${topic}</h3><p>${arr.length} words · ${arr.map(x=>x.level).includes('A2')?'A1–A2':'A1'}</p></span><span class="score">→</span></button>`).join('')}</div></section>`;document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>renderWords(b.dataset.level));bindLessonButtons();document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>startWords(WORDS.filter(w=>w.topic===b.dataset.topic)))}
function groupBy(a,k){return a.reduce((o,x)=>((o[x[k]]??=[]).push(x),o),{})}
function renderGrammar(level='all'){const list=level==='all'?RULES:RULES.filter(r=>r.level===level);content.innerHTML=`<section class="page"><span class="eyebrow">Grammar gym</span><h1>Repeat until it sticks.</h1><p class="intro">Every rule has a rolling mastery score. Keep completing rounds until you reach 85% and master the rule.</p><div class="filters">${['all','A1','A2'].map(x=>`<button class="filter ${x===level?'active':''}" data-level="${x}">${x==='all'?'All rules':x}</button>`).join('')}</div><div class="rule-list">${list.map(r=>{let m=state.ruleMastery[r.id]||0;return `<article class="rule"><div><span class="eyebrow">${r.level} · ${m>=85?'Mastered':'In progress'}</span><h3>${r.title}</h3><div class="meta">${r.desc}</div><div class="bar"><span style="width:${m}%"></span></div></div><button class="${m?'secondary':'primary'}" data-rule="${r.id}">${m?'Practise again':'Start rule'}</button>${ruleTheory(r)}</article>`}).join('')}</div></section>`;document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>renderGrammar(b.dataset.level));bindLessonButtons()}
function renderProgress(){const acc=state.answered?Math.round(state.correct/state.answered*100):0;const mastered=Object.values(state.ruleMastery).filter(x=>x>=85).length;const max=Math.max(...state.activity,1);content.innerHTML=`<section class="page"><span class="eyebrow">Learning record</span><h1>Your progress.</h1><div class="stats"><div class="stat"><strong>${mastered}/${RULES.length}</strong><small>grammar rules mastered</small></div><div class="stat"><strong>${acc}%</strong><small>all-time accuracy</small></div><div class="stat"><strong>${state.xp}</strong><small>experience points</small></div></div><div class="progress-grid"><div class="chart"><h3>Last 7 practice days</h3><div class="bars">${state.activity.map((v,i)=>`<span class="daybar" style="height:${Math.max(5,v/max*100)}%"><small>${['M','T','W','T','F','S','S'][i]}</small></span>`).join('')}</div></div><div class="summary-card"><span class="eyebrow">Strongest rule</span><h2>${bestRule()?.title||'Start practising'}</h2><p class="intro">${bestRule()?`${state.ruleMastery[bestRule().id]}% rolling mastery`:'Your first completed round will appear here.'}</p><button class="secondary" id="resetBtn">Reset progress</button></div></div></section>`;$('#resetBtn').onclick=()=>{if(confirm(account?'Reset all saved progress for this account?':'Reset all guest progress on this device?')){state={...defaultState,wordMastery:{},ruleMastery:{},activity:[0,0,0,0,0,0,0]};save();renderProgress()}}}
function bestRule(){return RULES.slice().sort((a,b)=>(state.ruleMastery[b.id]||0)-(state.ruleMastery[a.id]||0))[0]&&Object.keys(state.ruleMastery).length?RULES.slice().sort((a,b)=>(state.ruleMastery[b.id]||0)-(state.ruleMastery[a.id]||0))[0]:null}
function bindLessonButtons(){document.querySelectorAll('[data-start="words"]').forEach(b=>b.onclick=()=>startWords(b.dataset.wordLevel&&b.dataset.wordLevel!=='all'?WORDS.filter(w=>w.level===b.dataset.wordLevel):WORDS));document.querySelectorAll('[data-rule]').forEach(b=>b.onclick=()=>startRule(b.dataset.rule))}
function startWords(pool=WORDS){let items=shuffle(pool).slice(0,8);session={type:'words',items,index:0,roundCorrect:0};renderWordQuestion()}
function wordForm(w,i){let mode=i%3;if(mode===0){let opts=shuffle([w.en,...shuffle(WORDS.filter(x=>x.id!==w.id)).slice(0,3).map(x=>x.en)]);return {label:'Choose the English meaning',prompt:w.de,answer:w.en,kind:'choice',opts}}if(mode===1)return {label:'Type the German translation',prompt:w.en,answer:w.de,kind:'type'};let clean=w.de.replace(/^(der|die|das) /,'');return {label:'Build the German word',prompt:w.en,answer:clean,kind:'letters',opts:shuffle(clean.split(''))}}
function practiceShell(inner){content.innerHTML=`<div class="practice-wrap"><section class="practice"><div class="practice-top"><button class="secondary" id="quit">Exit</button><div class="bar"><span style="width:${session.index/session.items.length*100}%"></span></div><strong>${session.index+1}/${session.items.length}</strong></div>${inner}<div id="feedback" class="feedback hidden"></div></section></div>`;$('#quit').onclick=()=>go(session.type==='words'?'words':'grammar')}
function renderWordQuestion(){if(session.index>=session.items.length)return finishSession();let w=session.items[session.index],q=wordForm(w,session.index);session.current={...q,word:w};let body=`<div class="prompt-label">${q.label}</div><div class="prompt">${esc(q.prompt)}</div>`;if(q.kind==='choice')body+=`<div class="choices">${q.opts.map(o=>`<button class="choice" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;if(q.kind==='type')body+=`<form class="type-row" id="answerForm"><input id="typed" autocomplete="off" placeholder="Type in German…" aria-label="Your answer" aria-describedby="answerHint"><button class="primary">Check</button></form><p class="answer-hint" id="answerHint">Articles are optional. Uppercase or lowercase is fine; ä/ö/ü can be a/o/u or ae/oe/ue, and ß can be ss.</p>`;if(q.kind==='letters')body+=`<div class="answer-slots" id="built"></div><div class="letters">${q.opts.map((o,i)=>`<button class="letter" data-letter="${esc(o)}" data-i="${i}">${esc(o)}</button>`).join('')}</div><button class="primary" id="checkBuilt">Check</button>`;practiceShell(body);if(q.kind==='choice')document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b));if(q.kind==='type')$('#answerForm').onsubmit=e=>{e.preventDefault();answer($('#typed').value)};if(q.kind==='letters'){let built='';document.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{built+=b.dataset.letter;b.disabled=true;$('#built').textContent=built});$('#checkBuilt').onclick=()=>answer(built)}}
function startRule(id){let rule=RULES.find(r=>r.id===id);session={type:'grammar',rule,items:shuffle(rule.qs),index:0,roundCorrect:0};renderRuleQuestion()}
function renderRuleQuestion(){if(session.index>=session.items.length)return finishSession();let q=session.items[session.index],opts=shuffle([q[1],...q[2]]);session.current={answer:q[1]};practiceShell(`<div class="prompt-label">${session.rule.title}</div><div class="prompt">${esc(q[0])}</div><div class="choices">${opts.map(o=>`<button class="choice" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="mastery-note"><strong>Rule</strong> — ${session.rule.tip}</div>${ruleTheory(session.rule)}`);document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b))}
function normalise(s){return s.normalize('NFC').toLowerCase().trim().replace(/[.!?]/g,'').replace(/\s+/g,' ')}
function normaliseWord(s){return normalise(s).replace(/^(der|die|das)\s+/,'').replace(/ß/g,'ss')}
function matchesAnswer(value){
 if(session.type!=='words'||session.current.kind==='choice')return normalise(value)===normalise(session.current.answer);
 const variants=[...normaliseWord(session.current.answer)].reduce((forms,char)=>forms.flatMap(form=>({ä:['ä','a','ae'],ö:['ö','o','oe'],ü:['ü','u','ue']}[char]||[char]).map(letter=>form+letter)),['']);
 return variants.includes(normaliseWord(value));
}
function answerFeedback(ok){
 if(session.type==='words'){const word=session.current.word;return `${ok?'':'Correct answer: '}<span lang="de">${esc(word.de)}</span> — ${esc(word.en)}`}
 return ok?'Well done.':'Correct answer: '+esc(session.current.answer);
}
function answer(value,button){if(session.locked)return;session.locked=true;let ok=matchesAnswer(value);state.answered++;if(ok){state.correct++;session.roundCorrect++;state.xp+=10}else state.xp+=2;state.activity[new Date().getDay()?new Date().getDay()-1:6]++;if(session.type==='words'){let id=session.current.word.id,old=state.wordMastery[id]||0;state.wordMastery[id]=Math.min(100,Math.round(old*.65+(ok?100:0)*.35))}if(button){button.classList.add(ok?'correct':'wrong');document.querySelectorAll('.choice').forEach(b=>{if(matchesAnswer(b.dataset.answer))b.classList.add('correct');b.disabled=true})}let f=$('#feedback');f.className='feedback '+(ok?'good':'bad');f.innerHTML=`<div><strong>${ok?'Richtig!':'Not quite'}</strong><br>${answerFeedback(ok)}</div><button class="primary" id="next">Continue</button>`;save();$('#next').onclick=()=>{session.index++;session.locked=false;session.type==='words'?renderWordQuestion():renderRuleQuestion()}}
function finishSession(){let pct=Math.round(session.roundCorrect/session.items.length*100);if(session.type==='grammar'){let old=state.ruleMastery[session.rule.id]||0;state.ruleMastery[session.rule.id]=Math.round(old*.55+pct*.45);save()}content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">Round complete</span><h1>${pct>=80?'Sehr gut!':'Keep building.'}</h1><p class="intro">You answered ${session.roundCorrect} of ${session.items.length} correctly.</p><div class="stats"><div class="stat"><strong>${pct}%</strong><small>this round</small></div><div class="stat"><strong>+${session.roundCorrect*10+(session.items.length-session.roundCorrect)*2}</strong><small>XP earned</small></div>${session.type==='grammar'?`<div class="stat"><strong>${state.ruleMastery[session.rule.id]}%</strong><small>rolling mastery</small></div>`:`<div class="stat"><strong>${session.items.length}</strong><small>words reviewed</small></div>`}</div><div class="type-row"><button class="primary" id="again">Practise again</button><button class="secondary" id="done">Done</button></div></section></div>`;$('#again').onclick=()=>session.type==='words'?startWords():startRule(session.rule.id);$('#done').onclick=()=>go(session.type==='words'?'words':'grammar')}
function toast(msg){let t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
async function loadAccount(){
  try{
    const response=await fetch('/api/auth/me',{cache:'no-store'});
    if(!response.ok)throw new Error('Cannot load your account.');
    account=(await response.json()).user;
    if(account){
      const response=await fetch('/api/progress',{cache:'no-store'});
      if(!response.ok)throw new Error('Cannot load your saved progress.');
      const data=await response.json();
      if(data.userId!==account.id)throw new Error('The signed-in account changed. Reload this page.');
      state=data.progress||structuredClone(defaultState);revision=data.revision;
      const name=document.createElement('span');name.textContent=account.email;
      const button=document.createElement('button');button.className='sound-toggle';button.textContent='Sign out';button.onclick=signOut;
      $('#account').replaceChildren(name,button);
    }else{
      try{state={...structuredClone(defaultState),...JSON.parse(localStorage.getItem('wortwerk-guest-progress')||'{}')}}catch{state=structuredClone(defaultState)}
      $('#account').innerHTML='<a class="sound-toggle" href="/sign-in">Sign in / Register</a>';
    }
    ready=true;syncNotice('');updateChrome();go(currentView);
  }catch(error){content.innerHTML='<section class="page"><h2>Unable to load your progress</h2><p>Please try again before starting a practice round.</p><button id="retryLoad" class="primary">Retry</button></section>';$('#retryLoad').onclick=loadAccount;syncNotice(error.message)}
}
async function signOut(){
  if(!await flushProgress()){syncNotice('Progress has not been saved yet. Resolve the sync error before signing out.',!syncBlocked);return}
  ready=false;
  try{const response=await fetch('/api/auth/logout',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});if(!response.ok)throw new Error('Sign out failed. Please retry.');state=structuredClone(defaultState);account=null;location.assign('/')}
  catch(error){ready=true;syncNotice(error.message)}
}
function registerLearningTool(){const context=document.modelContext;if(!context?.registerTool)return;Promise.resolve(context.registerTool({name:'start_german_practice',title:'Start German practice',description:'Open a vocabulary round or a specific A1–A2 grammar rule in Wortwerk.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['words','grammar']},ruleId:{type:'string'}},required:['kind'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!ready)throw new Error('Wait until your account and progress have loaded.');if(!input||!['words','grammar'].includes(input.kind))throw new Error('kind must be words or grammar');if(input.kind==='words'){startWords();return{started:'words',questions:8}}const rule=RULES.find(r=>r.id===input.ruleId);if(!rule)throw new Error('Provide a valid ruleId: '+RULES.map(r=>r.id).join(', '));startRule(rule.id);return{started:'grammar',ruleId:rule.id,title:rule.title,questions:rule.qs.length}}})).catch(()=>{});}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>go(b.dataset.view));$('#menuBtn').onclick=()=>$('.sidebar').classList.toggle('open');
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
window.addEventListener('online',()=>void flushProgress());
loadAccount().then(registerLearningTool);

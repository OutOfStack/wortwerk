import { WORDS, VOCABULARY_VERSION } from './vocabulary.js';
import { RULES } from './grammar.js';
import { THEORY } from './grammar-theory.js';
import { GRAMMAR_VERSION, grammarStatus, recordGrammarAnswer } from './grammar-progress.js';
import { RANK_TITLES, xpForLevel, rankTitle, levelProgress, XP_REWARDS, XP_VERSION, upgradeProgress } from './levels.js';


function ruleTheory(rule){const t=THEORY[rule.id];return `<details class="rule-theory"><summary>Theory &amp; examples<span class="theory-rule-name"> · ${esc(rule.title)}</span></summary><div class="theory-body"><p>${esc(t.explanation)}</p><div class="theory-table" role="region" aria-label="${esc(rule.title)} forms" tabindex="0"><table><thead><tr>${t.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td lang="de">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>Examples</h4><ul class="theory-examples">${t.examples.map(([de,en])=>`<li><strong lang="de">${esc(de)}</strong><span>${esc(en)}</span></li>`).join('')}</ul><p class="theory-note"><strong>Remember:</strong> ${esc(t.note)}</p></div></details>`}

const WORD_TARGET=8;
const defaultState={xp:0,xpVersion:XP_VERSION,answered:0,correct:0,wordMastery:{},wordCorrectCounts:{},vocabularyVersion:VOCABULARY_VERSION,knownWordIds:[],grammarVersion:GRAMMAR_VERSION,grammarProgress:{},streak:1,sound:true,activity:[0,0,0,0,0,0,0]};
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
function shuffle(values){
 const result=[...values];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 return result;
}
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function updateChrome(){
 const rank=levelProgress(state.xp);
 const mastered=RULES.filter(rule=>ruleStatus(rule.id).passed).length;
 $('#levelNumber').textContent=rank.level;
 $('#rankName').textContent=rank.title;
 $('#rankProgress').textContent=`${rank.earned} / ${rank.required} XP · Level ${rank.level}`;
 const ring=$('#levelRing');
 ring.style.setProperty('--rank-progress',`${rank.percent}%`);
 ring.setAttribute('aria-label',`Level ${rank.level}: ${rank.title}. ${rank.remaining} XP to level ${rank.level+1}.`);
 $('#totalMastery').textContent=mastered+' grammar rules passed';
 $('#streakCount').textContent=state.streak;
}
function rankOverview(){
 const rank=levelProgress(state.xp);
 return `<section class="rank-card" aria-label="Practice rank"><span class="eyebrow">Practice rank · Level ${rank.level}</span><h2>${esc(rank.title)}</h2><p>${rank.remaining} XP to <strong>Level ${rank.level+1} · ${esc(rank.nextTitle)}</strong></p><progress class="rank-meter" value="${rank.earned}" max="${rank.required}" aria-label="Progress to the next level"></progress><p class="rank-caption">${rank.earned} / ${rank.required} XP toward the next level · ${rank.xp} total XP</p><details class="rank-ladder"><summary>All ranks &amp; XP requirements</summary><p>Earn ${XP_REWARDS.words} XP per correct vocabulary answer and ${XP_REWARDS.grammar} XP per correct grammar answer. Mistakes earn 0 XP. These military-inspired ranks track practice, not your German proficiency.</p><ol>${RANK_TITLES.map((title,index)=>`<li class="${index+1===rank.level?'current':index+1<rank.level?'earned':''}" ${index+1===rank.level?'aria-current="step"':''}><span>Level ${index+1} · ${esc(title)}</span><strong>${xpForLevel(index+1).toLocaleString('en')} XP</strong></li>`).join('')}</ol><p>After Level ${RANK_TITLES.length}, continue as ${esc(rankTitle(RANK_TITLES.length+1))}, ${esc(rankTitle(RANK_TITLES.length+2))}, and beyond. Each next level takes 50% more XP than the previous step, rounded to a whole XP. Your total XP is never reset.</p></details></section>`;
}
function go(view){if(!ready)return;currentView=view;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('.sidebar').classList.remove('open');({today:renderToday,words:renderWords,grammar:renderGrammar,progress:renderProgress}[view]||renderToday)()}
function renderToday(){const accuracy=state.answered?Math.round(state.correct/state.answered*100):0;content.innerHTML=`<section class="page"><span class="eyebrow">Your German workshop</span><h1>Guten Tag.</h1><p class="intro">Build useful German through short, repeated practice. Pass each grammar topic by reaching its target score in your latest answers.</p><div class="stats"><div class="stat"><strong>${state.xp}</strong><small>total XP</small></div><div class="stat"><strong>${accuracy}%</strong><small>answer accuracy</small></div><div class="stat"><strong>${Object.keys(state.wordMastery).length}</strong><small>words practised</small></div></div><div class="section-head"><div><span class="eyebrow">Continue</span><h2>Today’s practice</h2></div><p>About 8 minutes</p></div><div class="lesson-grid"><button class="lesson-card" data-start="words"><span class="lesson-icon">Aa</span><span><h3>Mixed vocabulary</h3><p>Translation, recall and letter building</p></span><span class="score">+${XP_REWARDS.words} XP / correct</span></button><button class="lesson-card" data-rule="${nextRule().id}"><span class="lesson-icon">§</span><span><h3>${nextRule().title}</h3><p>${nextRule().desc}</p></span><span class="score">${ruleStatus(nextRule().id).correct}/${ruleStatus(nextRule().id).size}</span></button></div><div class="mastery-note"><strong>The mastery loop</strong><br>Each topic has a focused set of exercises and its own passing target. Complete one full set, then keep improving your latest answers. Practice loops without clearing your score.</div></section>`;bindLessonButtons()}
function ruleStatus(id){return grammarStatus(state.grammarProgress?.[id],id)}
function nextRule(){return RULES.find(r=>!ruleStatus(r.id).passed)||RULES[0]}
function renderWords(level='all'){const list=level==='all'?WORDS:WORDS.filter(w=>w.level===level);content.innerHTML=`<section class="page"><span class="eyebrow">Vocabulary</span><h1>Words in motion.</h1><p class="intro">Each word leaves practice after 8 correct answers. Already familiar? Choose “I know this” to hide it without earning XP. Restore marked words from Progress. Mistakes do not add to the count. Practise both directions and build words from letters; your counts are saved as you go.</p><div class="filters">${['all','A1','A2'].map(x=>`<button class="filter ${x===level?'active':''}" data-level="${x}">${x==='all'?'All levels':x}</button>`).join('')}</div><div class="section-head word-section"><div><h2>${list.length-pendingWords(list).length}/${list.length} words complete</h2><p>Learned through practice or marked known</p></div><button class="primary" data-start="words" data-word-level="${level}">Start mixed practice</button></div><div class="lesson-grid">${Object.entries(groupBy(list,'topic')).map(([topic,arr])=>`<button class="lesson-card" data-topic="${topic}"><span class="lesson-icon">${topic.slice(0,1)}</span><span><h3>${topic}</h3><p>${arr.length-pendingWords(arr).length}/${arr.length} complete · ${[...new Set(arr.map(x=>x.level))].join(' / ')}</p></span><span class="score">→</span></button>`).join('')}</div></section>`;document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>renderWords(b.dataset.level));bindLessonButtons();document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>startWords(list.filter(w=>w.topic===b.dataset.topic)))}
function groupBy(a,k){return a.reduce((o,x)=>((o[x[k]]??=[]).push(x),o),{})}
function renderGrammar(level='all'){
 const list=level==='all'?RULES:RULES.filter(r=>r.level===level);
 content.innerHTML=`<section class="page"><span class="eyebrow">Grammar gym</span><h1>Repeat until it sticks.</h1><p class="intro">Choose a topic and practise at your own pace. Your place is saved after every answer.</p><div class="filters">${['all','A1','A2'].map(x=>`<button class="filter ${x===level?'active':''}" data-level="${x}">${x==='all'?'All rules':x}</button>`).join('')}</div><div class="rule-list">${list.map(r=>{
  const progress=ruleStatus(r.id);
  return `<article class="rule"><div><span class="eyebrow">${r.level} · ${progress.passed?'Passed':progress.attempts?'In progress':'Not started'}</span><h3>${r.title}</h3><div class="meta">${r.desc}</div><p class="grammar-score">${progress.correct} / ${progress.size} correct · ${progress.target} to pass</p><div class="bar"><span style="width:${progress.correct/progress.size*100}%"></span></div><p class="meta">${progress.answered} / ${progress.size} answers recorded · Next exercise ${progress.next+1} / ${progress.size}</p></div><button class="${progress.attempts?'secondary':'primary'}" data-rule="${r.id}">${progress.passed?'Practise again':progress.attempts?'Continue rule':'Start rule'}</button>${ruleTheory(r)}</article>`;
 }).join('')}</div></section>`;
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>renderGrammar(b.dataset.level));bindLessonButtons();
}
function wordProgress(){return `<details class="rule-theory word-record"><summary>Your word progress</summary><div class="theory-table" role="region" aria-label="Word learning progress" tabindex="0"><table><thead><tr><th scope="col">German</th><th scope="col">English</th><th scope="col">Correct answers</th></tr></thead><tbody>${WORDS.filter(w=>wordCorrect(w)>0).map(w=>`<tr><th scope="row" lang="de">${esc(w.de)}</th><td>${esc(w.en)}</td><td>${wordCorrect(w)}/${WORD_TARGET}${isWordKnown(w)?' · Marked known':wordCorrect(w)>=WORD_TARGET?' · Learned':''}</td></tr>`).join('')||'<tr><td colspan="3">No word progress yet. Answer a word correctly to add it here.</td></tr>'}</tbody></table></div></details>`}
function renderProgress(){const best=bestRule();const acc=state.answered?Math.round(state.correct/state.answered*100):0;const mastered=RULES.filter(rule=>ruleStatus(rule.id).passed).length;const max=Math.max(...state.activity,1);content.innerHTML=`<section class="page"><span class="eyebrow">Learning record</span><h1>Your progress.</h1>${rankOverview()}<div class="stats"><div class="stat"><strong>${mastered}/${RULES.length}</strong><small>grammar rules passed</small></div><div class="stat"><strong>${acc}%</strong><small>all-time accuracy</small></div><div class="stat"><strong>${state.xp}</strong><small>experience points</small></div></div>${wordProgress()}${knownWords()}<div class="progress-grid"><div class="chart"><h3>Last 7 practice days</h3><div class="bars">${state.activity.map((v,i)=>`<span class="daybar" style="height:${Math.max(5,v/max*100)}%"><small>${['M','T','W','T','F','S','S'][i]}</small></span>`).join('')}</div></div><div class="summary-card"><span class="eyebrow">Strongest rule</span><h2>${best?.title||'Start practising'}</h2><p class="intro">${best?`${ruleStatus(best.id).correct} / ${ruleStatus(best.id).size} correct in the latest ${ruleStatus(best.id).answered} answers${ruleStatus(best.id).passed?' · Passed':''}`:'Your first grammar answer will appear here.'}</p><button class="secondary" id="resetBtn">Reset progress</button></div></div></section>`;document.querySelectorAll('[data-restore-word]').forEach(b=>b.onclick=()=>restoreWord(b.dataset.restoreWord));$('#resetBtn').onclick=()=>{if(confirm(account?'Reset all saved progress for this account?':'Reset all guest progress on this device?')){state=structuredClone(defaultState);save();renderProgress()}}}
function bestRule(){return RULES.filter(rule=>ruleStatus(rule.id).attempts>0).sort((a,b)=>ruleStatus(b.id).correct/ruleStatus(b.id).size-ruleStatus(a.id).correct/ruleStatus(a.id).size)[0]}
function bindLessonButtons(){document.querySelectorAll('[data-start="words"]').forEach(b=>b.onclick=()=>startWords(b.dataset.wordLevel&&b.dataset.wordLevel!=='all'?WORDS.filter(w=>w.level===b.dataset.wordLevel):WORDS));document.querySelectorAll('[data-rule]').forEach(b=>b.onclick=()=>startRule(b.dataset.rule))}
function wordCorrect(word){return state.wordCorrectCounts?.[word.id]||0}
function isWordKnown(word){return (state.knownWordIds||[]).includes(String(word.id))}
function pendingWords(pool){return pool.filter(word=>wordCorrect(word)<WORD_TARGET&&!isWordKnown(word))}
function knownWords(){
 const words=WORDS.filter(isWordKnown);
 return `<details class="rule-theory word-record"><summary>Words marked known (${words.length})</summary><p class="meta">These words are excluded from practice. Marking a word known awards no XP and leaves its answer count unchanged.</p><ul class="known-words">${words.map(w=>`<li><span><strong lang="de">${esc(w.de)}</strong><br>${esc(w.en)}</span><button class="secondary" data-restore-word="${w.id}" aria-label="Practise ${esc(w.de)} again">Practise again</button></li>`).join('')||'<li>No words marked known yet.</li>'}</ul></details>`;
}
function restoreWord(id){
 state.knownWordIds=(state.knownWordIds||[]).filter(known=>known!==String(id));
 save();renderProgress();
}
function markWordKnown(){
 if(!session||session.type!=='words'||session.locked)return;
 session.locked=true;
 const word=session.current.word;
 state.knownWordIds=[...new Set([...(state.knownWordIds||[]),String(word.id)])];
 session.skipped=(session.skipped||0)+1;
 document.querySelectorAll('.choice,.letter,#checkBuilt,#answerForm button,#typed,#knowWord').forEach(b=>b.disabled=true);
 const feedback=$('#feedback');feedback.className='feedback good';
 feedback.innerHTML=`<div><strong>Marked known</strong><br><span lang="de">${esc(word.de)}</span> — ${esc(word.en)}<br>This word leaves practice. Restore it from Progress. No XP awarded.</div><button class="primary" id="next">Continue</button>`;
 save();$('#next').onclick=()=>{session.index++;session.locked=false;renderWordQuestion()};
}
function startWords(pool=WORDS){
 const items=shuffle(pendingWords(pool)).slice(0,8);
 if(!items.length){session=null;content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">Vocabulary complete</span><h1>All words complete.</h1><p class="intro">Every word in this selection has been answered correctly ${WORD_TARGET} times or marked known. These words will no longer appear in practice.</p><button class="primary" id="backToWords">Back to vocabulary</button></section></div>`;$('#backToWords').onclick=()=>go('words');return}
 session={type:'words',pool,items,index:0,roundCorrect:0,roundAnswered:0,skipped:0};renderWordQuestion();
}
function wordChoices(word){
 // Prefer related words, but never fill a gap with a different part of speech.
 const priority=other=>(other.topic===word.topic?0:2)+(other.level===word.level?0:1);
 const candidates=shuffle(WORDS.filter(other=>other.id!==word.id&&other.pos===word.pos))
  .sort((a,b)=>priority(a)-priority(b));
 const meanings=english=>english.split(' / ').map(value=>word.pos==='verb'?normalise(value).replace(/^to /,''):normalise(value));
 const used=new Set(meanings(word.en)), options=[word.en];
 for(const other of candidates){
  const alternatives=meanings(other.en);
  if(alternatives.some(meaning=>used.has(meaning)))continue;
  alternatives.forEach(meaning=>used.add(meaning));
  options.push(other.en);
  if(options.length===4)break;
 }
 return shuffle(options);
}
function wordForm(word,correctCount){
 const mode=correctCount%3;
 if(mode===0){
  const opts=wordChoices(word);
  if(opts.length===4)return {label:'Choose the English meaning',prompt:word.de,answer:word.en,kind:'choice',opts};
 }
 // Sparse future categories use recall instead of obvious or duplicate options.
 if(mode!==2)return {label:'Type the German translation',prompt:word.en,answer:word.de,kind:'type'};
 const clean=word.de.replace(/^(der|die|das) /,'');
 return {label:'Build the German word',prompt:word.en,answer:clean,kind:'letters',opts:shuffle(clean.split(''))};
}
function practiceShell(inner,hasFeedback=false){content.innerHTML=`<div class="practice-wrap"><section class="practice"><div class="practice-top"><button class="secondary" id="quit">Exit</button><div class="bar"><span style="width:${session.index/session.items.length*100}%"></span></div><strong>${session.index+1}/${session.items.length}</strong></div>${inner}${hasFeedback?'':'<div id="feedback" class="feedback hidden"></div>'}</section></div>`;$('#quit').onclick=()=>go(session.type==='words'?'words':'grammar')}
function renderWordQuestion(){if(session.index>=session.items.length)return finishSession();let w=session.items[session.index],q=wordForm(w,wordCorrect(w));session.current={...q,word:w};let body=`<div class="prompt-label">${q.label} · ${wordCorrect(w)}/${WORD_TARGET} correct</div><div class="prompt">${esc(q.prompt)}</div>`;if(q.kind==='choice')body+=`<div class="choices">${q.opts.map(o=>`<button class="choice" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;if(q.kind==='type')body+=`<form class="type-row" id="answerForm"><input id="typed" autocomplete="off" placeholder="Type in German…" aria-label="Your answer" aria-describedby="answerHint"><button class="primary">Check</button></form><p class="answer-hint" id="answerHint">Articles are optional. Uppercase or lowercase is fine; ä/ö/ü can be a/o/u or ae/oe/ue, and ß can be ss.</p>`;if(q.kind==='letters')body+=`<div class="answer-slots" id="built"></div><div class="letters">${q.opts.map((o,i)=>`<button class="letter" data-letter="${esc(o)}" data-i="${i}">${esc(o)}</button>`).join('')}</div><button class="primary" id="checkBuilt">Check</button>`;body+=`<div class="word-actions"><button class="secondary" id="knowWord">I know this</button><span>Hide this word from practice · no XP</span></div>`;practiceShell(body);$('#knowWord').onclick=markWordKnown;if(q.kind==='choice')document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b));if(q.kind==='type')$('#answerForm').onsubmit=e=>{e.preventDefault();answer($('#typed').value)};if(q.kind==='letters'){let built='';document.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{built+=b.dataset.letter;b.disabled=true;$('#built').textContent=built});$('#checkBuilt').onclick=()=>answer(built)}}
function startRule(id){
 const rule=RULES.find(r=>r.id===id);
 session={type:'grammar',rule,items:rule.qs,index:ruleStatus(id).next,roundCorrect:0,answered:0};
 renderRuleQuestion();
}
function grammarScore(id){
 const progress=ruleStatus(id);
 return `${progress.correct} / ${progress.size} correct · ${progress.target} to pass${progress.passed?' · Passed':''}<br><span class="meta">${progress.answered} / ${progress.size} answers recorded. Each new answer replaces the oldest once the window is full.</span>`;
}
function renderRuleQuestion(){
 if(session.justPassed||session.index>=session.items.length)return finishGrammar();
 const q=session.items[session.index],opts=shuffle([q[1],...q[2]]);
 session.current={answer:q[1]};
 practiceShell(`<div class="prompt-label">${esc(session.rule.title)} · +${XP_REWARDS.grammar} XP / correct</div><p class="grammar-score" id="grammarScore" role="status">${grammarScore(session.rule.id)}</p><div class="prompt">${esc(q[0])}</div><div class="choices">${opts.map(o=>`<button class="choice" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="feedback" class="feedback hidden"></div><div class="mastery-note"><strong>Rule</strong> — ${esc(session.rule.tip)}</div>${ruleTheory(session.rule)}`,true);
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b));
}
function finishGrammar(){
 const progress=ruleStatus(session.rule.id);
 content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">${esc(session.rule.title)}</span><h1>${session.justPassed?'Rule passed!':progress.passed?'Practice complete.':'Keep going.'}</h1><p class="intro">${progress.passed?`You reached the passing target of ${progress.target} correct in a full window of ${progress.size}. This rule stays passed.`:`The ${progress.size} exercises are complete. Continue from exercise 1 with your score carried over; each new answer replaces the oldest.`}</p><div class="stats"><div class="stat"><strong>${progress.correct} / ${progress.size}</strong><small>correct in your latest ${progress.size} answers</small></div><div class="stat"><strong>+${session.roundCorrect*XP_REWARDS.grammar}</strong><small>XP earned this visit</small></div></div><div class="type-row"><button class="primary" id="again">${progress.passed?'Practise again':'Continue practice'}</button><button class="secondary" id="done">Back to grammar</button></div></section></div>`;
 $('#again').onclick=()=>startRule(session.rule.id);$('#done').onclick=()=>go('grammar');
}
function normalise(s){return s.normalize('NFC').toLowerCase().trim().replace(/[.!?]/g,'').replace(/\s+/g,' ')}
function normaliseWord(s){return normalise(s).replace(/^(der|die|das)\s+/,'').replace(/ß/g,'ss')}
function matchesAnswer(value){
 if(session.type!=='words'||session.current.kind==='choice')return normalise(value)===normalise(session.current.answer);
 const variants=[...normaliseWord(session.current.answer)].reduce((forms,char)=>forms.flatMap(form=>({ä:['ä','a','ae'],ö:['ö','o','oe'],ü:['ü','u','ue']}[char]||[char]).map(letter=>form+letter)),['']);
 return variants.includes(normaliseWord(value));
}
function answerFeedback(ok){
 if(session.type==='words'){const word=session.current.word;return `${ok?'':'Correct answer: '}<span lang="de">${esc(word.de)}</span> — ${esc(word.en)}<br><span class="word-progress">${wordCorrect(word)}/${WORD_TARGET} correct${wordCorrect(word)>=WORD_TARGET?' · Learned! This word leaves your practice pool.':''}</span>`}
 return (ok?'Well done.':'Correct answer: '+esc(session.current.answer))+(session.justPassed?`<br><strong>Rule passed! At least ${ruleStatus(session.rule.id).target} correct in your latest ${ruleStatus(session.rule.id).size} answers.</strong>`:'');
}
function answer(value,button){if(session.locked)return;session.locked=true;let ok=matchesAnswer(value);state.answered++;if(ok){state.correct++;session.roundCorrect++;state.xp+=XP_REWARDS[session.type]};state.activity[new Date().getDay()?new Date().getDay()-1:6]++;if(session.type==='words'){$('#knowWord').disabled=true;session.roundAnswered=(session.roundAnswered||0)+1;let id=session.current.word.id;state.wordCorrectCounts??={};if(ok)state.wordCorrectCounts[id]=Math.min(WORD_TARGET,wordCorrect(session.current.word)+1);state.wordMastery[id]=Math.round(wordCorrect(session.current.word)/WORD_TARGET*100)}else{const id=session.rule.id;const wasPassed=ruleStatus(id).passed;state.grammarProgress??={};state.grammarProgress[id]=recordGrammarAnswer(state.grammarProgress[id],ok,id);session.answered=(session.answered||0)+1;session.justPassed=!wasPassed&&ruleStatus(id).passed;$('#grammarScore').innerHTML=grammarScore(id)}if(button){button.classList.add(ok?'correct':'wrong');document.querySelectorAll('.choice').forEach(b=>{if(matchesAnswer(b.dataset.answer))b.classList.add('correct');b.disabled=true})}let f=$('#feedback');f.className='feedback '+(ok?'good':'bad');f.innerHTML=`<div><strong>${ok?'Richtig!':'Not quite'}</strong><br>${answerFeedback(ok)}</div><button class="primary" id="next">Continue</button>`;save();$('#next').onclick=()=>{session.index++;session.locked=false;if(session.type==='words')renderWordQuestion();else renderRuleQuestion()}}
function finishSession(){
 if(session.type==='grammar')return finishGrammar();
 const attempted=session.roundAnswered??session.items.length;
 const pct=attempted?Math.round(session.roundCorrect/attempted*100):0;
 content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">Round complete</span><h1>${!attempted?'All set.':pct>=80?'Sehr gut!':'Keep building.'}</h1><p class="intro">${attempted?`You answered ${session.roundCorrect} of ${attempted} correctly.`:'No answers submitted.'}${session.skipped?` ${session.skipped} marked known without XP.`:''}</p><div class="stats"><div class="stat"><strong>${attempted?`${pct}%`:'—'}</strong><small>this round</small></div><div class="stat"><strong>+${session.roundCorrect*XP_REWARDS.words}</strong><small>XP earned</small></div><div class="stat"><strong>${attempted}</strong><small>words reviewed</small></div></div><div class="type-row"><button class="primary" id="again">Practise again</button><button class="secondary" id="done">Done</button></div></section></div>`;
 $('#again').onclick=()=>startWords(session.pool);$('#done').onclick=()=>go('words');
}
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
      state=data.progress?upgradeProgress(data.progress):structuredClone(defaultState);revision=data.revision;
      const name=document.createElement('span');name.textContent=account.email;
      const button=document.createElement('button');button.className='sound-toggle';button.textContent='Sign out';button.onclick=signOut;
      $('#account').replaceChildren(name,button);
    }else{
      try{
        const stored=JSON.parse(localStorage.getItem('wortwerk-guest-progress')||'null');
        state=stored?{...structuredClone(defaultState),...upgradeProgress(stored)}:structuredClone(defaultState);
        // Persist the upgrade through the normal save path so storage failures surface once.
        if(stored&&(stored.xpVersion!==XP_VERSION||stored.grammarVersion!==GRAMMAR_VERSION||stored.vocabularyVersion!==VOCABULARY_VERSION))save();
      }catch{state=structuredClone(defaultState)}
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

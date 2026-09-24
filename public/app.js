import { WORDS, VOCABULARY_VERSION } from './vocabulary.js';
import { RULES } from './grammar.js';
import { THEORY } from './grammar-theory.js';
import { GRAMMAR_VERSION, grammarStatus, recordGrammarAnswer, exerciseDeck } from './grammar-progress.js';
import { RANK_TITLES, MAX_LEVEL, xpForLevel, rankTitle, rankMeaning, levelProgress, XP_REWARDS, XP_VERSION, upgradeProgress } from './levels.js';


function ruleTheory(rule){const t=THEORY[rule.id];return `<details class="rule-theory"><summary>Theory &amp; examples<span class="theory-rule-name"> · ${esc(rule.title)}</span></summary><div class="theory-body"><p>${esc(t.explanation)}</p><div class="theory-table" role="region" aria-label="${esc(rule.title)} forms" tabindex="0"><table><thead><tr>${t.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td lang="de">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>Examples</h4><ul class="theory-examples">${t.examples.map(([de,en])=>`<li><strong lang="de">${esc(de)} ${speakButton(de)}</strong><span>${esc(en)}</span></li>`).join('')}</ul><p class="theory-note"><strong>Remember:</strong> ${esc(t.note)}</p></div></details>`}

const WORD_TARGET=8;
// A grammar visit is a short set; the topic's full round continues on the next visit.
const GRAMMAR_SET=10;
const ACTIVITY_DAYS=60;
const defaultState={xp:0,xpVersion:XP_VERSION,answered:0,correct:0,wordMastery:{},wordCorrectCounts:{},vocabularyVersion:VOCABULARY_VERSION,knownWordIds:[],grammarVersion:GRAMMAR_VERSION,grammarProgress:{},streak:1,sound:true,activity:[0,0,0,0,0,0,0],activityLog:{}};
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
// Gender colour is a learning aid; the article stays visible as text.
function germanWord(de){const article=de.match(/^(der|die|das) /)?.[1];return `<span lang="de"${article?` class="g-${article}"`:''}>${esc(de)}</span>`}

// Pronunciation uses the browser's built-in speech synthesis: no API or audio files.
// Buttons hide when the browser has no speech support or reports no German voice.
const speech=window.speechSynthesis&&window.SpeechSynthesisUtterance?window.speechSynthesis:null;
let germanVoice=null;
function loadVoices(){
 if(!speech)return;
 const voices=speech.getVoices(),german=voices.filter(voice=>/^de([-_]|$)/i.test(voice.lang));
 // Online and "natural" voices usually sound better than the basic local ones.
 germanVoice=german.find(voice=>/de[-_]DE/i.test(voice.lang)&&/natural|online|google/i.test(voice.name))||german.find(voice=>/de[-_]DE/i.test(voice.lang))||german[0]||null;
 document.documentElement?.classList.toggle('no-speech',voices.length>0&&!germanVoice);
}
function speak(text){
 if(!speech||!text)return;
 speech.cancel();
 const utterance=new window.SpeechSynthesisUtterance(text);
 utterance.lang=germanVoice?.lang||'de-DE';
 if(germanVoice)utterance.voice=germanVoice;
 utterance.rate=0.9;
 speech.speak(utterance);
}
function speakButton(text){return speech&&text?`<button type="button" class="speak" data-speak="${esc(text)}" aria-label="Listen: ${esc(text)}" title="Listen">🔊</button>`:''}
// English translation on request: Chrome's on-device Translator API when present,
// otherwise a Google Translate link. Nothing is translated until the learner asks.
const translations=new Map();let translatorReady=null,translatorBroken=false;
function googleTranslate(text){return `https://translate.google.com/?sl=de&tl=en&op=translate&text=${encodeURIComponent(text)}`}
function translateButton(text){
 if(!text)return '';
 return window.Translator&&!translatorBroken?`<button type="button" class="translate" data-translate="${esc(text)}" aria-label="Show English translation" title="Show English translation">EN</button>`:`<a class="translate" href="${esc(googleTranslate(text))}" target="_blank" rel="noopener" aria-label="Translate to English in a new tab" title="Translate to English (opens Google Translate)">EN ↗</a>`;
}
// Some Chromium builds expose the API but never answer, so every step has a deadline.
function withTimeout(promise,ms){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),ms))])}
async function translate(text,onProgress){
 if(translations.has(text))return translations.get(text);
 translatorReady??=(async()=>{
  const languages={sourceLanguage:'de',targetLanguage:'en'},availability=await withTimeout(window.Translator.availability(languages),5000);
  if(availability==='unavailable')throw new Error('unavailable');
  // A language pack download can take a while; it reports progress instead.
  const created=window.Translator.create({...languages,monitor:m=>m.addEventListener('downloadprogress',event=>onProgress(event.loaded))});
  return availability==='available'?withTimeout(created,10000):created;
 })().catch(error=>{translatorReady=null;translatorBroken=true;throw error});
 const english=await withTimeout((await translatorReady).translate(text),10000);
 translations.set(text,english);return english;
}
async function showTranslation(button){
 const text=button.dataset.translate,out=document.createElement('span');
 out.className='translation';out.lang='en';out.textContent='Translating…';button.replaceWith(out);
 try{out.textContent=await translate(text,loaded=>{out.textContent=`Downloading the translator… ${Math.round(loaded*100)}%`})}
 catch{out.innerHTML=`Translation unavailable here. <a href="${esc(googleTranslate(text))}" target="_blank" rel="noopener">Open Google Translate ↗</a>`}
}
function autoSpeak(text){if(state.sound)speak(text)}
function updateSoundButton(){
 const button=$('#soundBtn');
 button.hidden=!speech;
 button.textContent=state.sound?'🔊':'🔇';
 button.setAttribute('aria-pressed',String(Boolean(state.sound)));
 button.setAttribute('aria-label',`Read German answers aloud: ${state.sound?'on':'off'}`);
 button.title=state.sound?'Auto-play pronunciation is on':'Auto-play pronunciation is off';
}

// Activity is logged per local calendar day so streaks follow the learner's clock.
function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function daysAgo(count){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-count);return date}
function answersOn(date){return state.activityLog?.[dayKey(date)]||0}
function recordActivity(){
 const log=state.activityLog??={};
 const today=dayKey();
 if(!log[today])state.streak=answersOn(daysAgo(1))?(state.streak||0)+1:1;
 log[today]=(log[today]||0)+1;
 for(const old of Object.keys(log).sort().slice(0,-ACTIVITY_DAYS))delete log[old];
}
// A streak stays alive until a full calendar day passes without practice.
function currentStreak(){return answersOn(daysAgo(0))||answersOn(daysAgo(1))?state.streak||0:0}

function updateChrome(){
 const rank=levelProgress(state.xp);
 const mastered=RULES.filter(rule=>ruleStatus(rule.id).passed).length;
 $('#levelNumber').textContent=rank.level;
 $('#rankName').textContent=rank.title;
 $('#rankProgress').textContent=rank.maxed?`${rank.xp.toLocaleString('en')} XP · Top level`:`${rank.earned} / ${rank.required} XP · Level ${rank.level}`;
 const ring=$('#levelRing');
 ring.style.setProperty('--rank-progress',`${rank.percent}%`);
 ring.setAttribute('aria-label',`Level ${rank.level}: ${rank.title}. ${rank.maxed?'Top level reached.':`${rank.remaining} XP to level ${rank.level+1}.`}`);
 $('#totalMastery').textContent=mastered+' grammar rules passed';
 $('#streakCount').textContent=currentStreak();
 updateSoundButton();
}
function rankOverview(){
 const rank=levelProgress(state.xp);
 const next=rank.maxed?`<p>Top level reached · ${rank.xp.toLocaleString('en')} total XP</p><progress class="rank-meter" value="1" max="1" aria-label="Top level reached"></progress>`:`<p>${rank.remaining.toLocaleString('en')} XP to <strong>Level ${rank.level+1} · ${esc(rank.nextTitle)}</strong></p><progress class="rank-meter" value="${rank.earned}" max="${rank.required}" aria-label="Progress to the next level"></progress><p class="rank-caption">${rank.earned.toLocaleString('en')} / ${rank.required.toLocaleString('en')} XP toward the next level · ${rank.xp.toLocaleString('en')} total XP</p>`;
 return `<section class="rank-card" aria-label="Practice rank"><span class="eyebrow">Practice rank · Level ${rank.level}</span><h2>${esc(rank.title)} <small class="rank-meaning">${esc(rankMeaning(rank.level))}</small></h2>${next}<details class="rank-ladder"><summary>All ranks &amp; XP requirements</summary><ol>${RANK_TITLES.map((title,index)=>`<li class="${index+1===rank.level?'current':index+1<rank.level?'earned':''}" ${index+1===rank.level?'aria-current="step"':''}><span>Level ${index+1} · ${esc(title)} <small lang="en">${esc(rankMeaning(index+1))}</small></span><strong>${xpForLevel(index+1).toLocaleString('en')} XP</strong></li>`).join('')}</ol><p class="meta">How XP and levels work: see <button class="link" data-view-link="help">Help</button>.</p></details></section>`;
}
function go(view){if(!ready)return;session=null;speech?.cancel();currentView=view;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('.sidebar').classList.remove('open');({today:renderToday,words:renderWords,grammar:renderGrammar,progress:renderProgress,help:renderHelp}[view]||renderToday)();window.scrollTo?.(0,0)}
// Revisit familiar words, then introduce A1 words before moving on to A2.
function guidedWords(){
 const pending=pendingWords(WORDS);
 const reviews=shuffle(pending.filter(wasPractised));
 const fresh=shuffle(pending.filter(word=>!wasPractised(word))).sort((a,b)=>a.level.localeCompare(b.level));
 return [...reviews.slice(0,4),...fresh,...reviews.slice(4)].slice(0,8);
}
function startGuidedRound(){
 const items=guidedWords();
 if(items.length)startWordRound(items,WORDS,{guided:true});
 else startRule(nextRule().id);
}
function wasPractised(word){return wordCorrect(word)>0||Object.hasOwn(state.wordMastery,word.id)}
function renderToday(){
 const accuracy=state.answered?`${percent(state.correct,state.answered)}%`:'—';
 const today=answersOn(daysAgo(0)),streak=currentStreak(),items=guidedWords(),rule=nextRule(),progress=ruleStatus(rule.id);
 const reviews=items.filter(wasPractised).length,newWords=items.filter(word=>!wasPractised(word));
 const plan=items.length?[reviews?`${reviews} to revisit`:'',newWords.length?`${newWords.length} new ${newWords.every(word=>word.level==='A1')?'A1 ':''}words`:'','a few minutes'].filter(Boolean).join(' · '):`Continue ${rule.title} · your place is saved`;
 content.innerHTML=`<section class="page"><span class="eyebrow">Your German workshop</span><h1>Guten Tag.</h1><p class="intro">A little German, a little more confidence. Let’s take the next step.</p>
 <section class="guided-practice" aria-labelledby="guidedTitle"><div><span class="eyebrow">Picked for you</span><h2 id="guidedTitle">${items.length?'Your next small win.':'Keep your German growing.'}</h2><p>${esc(plan)}</p></div><button class="primary" id="guidedStart">${items.length?'Start guided practice':'Continue grammar'} <span aria-hidden="true">→</span></button></section>
 <div class="stats"><div class="stat"><strong>${state.xp}</strong><small>total XP</small></div><div class="stat"><strong>${accuracy}</strong><small>answer accuracy</small></div><div class="stat"><strong>${Object.keys(state.wordMastery).length}</strong><small>words practised</small></div></div><div class="section-head"><div><span class="eyebrow">Explore</span><h2>Choose your practice</h2></div><p>${today?`${today} answer${today===1?'':'s'} today · ${streak}-day streak`:streak?`Practise today to keep your ${streak}-day streak`:'Answer once today to start a streak'}</p></div><div class="lesson-grid"><button class="lesson-card" data-start="words"><span class="lesson-icon">Aa</span><span><h3>Mixed vocabulary</h3><p>Meaning, recall, spelling and articles · 8 words</p></span><span class="score">→</span></button><button class="lesson-card" data-rule="${rule.id}"><span class="lesson-icon">§</span><span><h3>${rule.title}</h3><p>${rule.desc}</p><p>${progress.passed?'Passed':progress.answered?`${progress.answered}/${progress.size} first-round answers`:'Ready to start'}</p></span><span class="score" aria-hidden="true">→</span></button></div><div class="mastery-note"><strong>New here?</strong> Scores, XP, levels and streaks are explained in <button class="link" data-view-link="help">Help</button>.</div></section>`;
 $('#guidedStart').onclick=()=>items.length?startWordRound(items,WORDS,{guided:true}):startRule(rule.id);
 bindLessonButtons();
}
function renderHelp(){
 const levelRows=[2,5,10,15,20,25,MAX_LEVEL].map(level=>`<tr><th scope="row">Level ${level} · ${esc(rankTitle(level))}</th><td>${xpForLevel(level).toLocaleString('en')} XP</td></tr>`).join('');
 const card=(title,body)=>`<section class="help-card"><h2>${title}</h2>${body}</section>`;
 content.innerHTML=`<section class="page"><span class="eyebrow">Help</span><h1>How Wortwerk works.</h1><div class="help-grid">
${card('XP',`<table class="help-table"><tbody><tr><th scope="row">Choosing an option or building from letters</th><td>${XP_REWARDS.choice} XP</td></tr><tr><th scope="row">Typing the answer</th><td>${XP_REWARDS.typed} XP</td></tr><tr><th scope="row">Wrong answers and “I know this”</th><td>0 XP</td></tr></tbody></table><p>Every correct answer counts, including grammar topics you have already passed.</p>`)}
${card('Levels &amp; ranks',`<p>Level 2 takes 30 XP. Each further level takes 40% more XP than the previous step. Ranks climb through nine materials, from Holz (wood) to Diamant (diamond), three steps each.</p><table class="help-table"><tbody>${levelRows}</tbody></table><p>Level ${MAX_LEVEL} is the top level. XP keeps counting after that. Ranks measure practice, not your German level. The full ladder is on <button class="link" data-view-link="progress">Progress</button>.</p>`)}
${card('Vocabulary',`<p>Rounds have 8 words. A word leaves practice after ${WORD_TARGET} correct answers, which cycle through: choosing the English meaning, typing the German, building it from letters, choosing the German word and, for nouns, choosing the article.</p><p>“I know this” hides a word without XP. Bring it back from Progress or the word search.</p>`)}
${card('Grammar',`<p>Each topic has a round of 20–80 exercises, practised in sets of 10; your place is saved between sets. Scores show how many you got right, how many you have answered and how many a round has. Pass by reaching the topic’s required number of correct answers across a full round. A passed topic stays passed.</p><p>Later rounds shuffle in new sentences. Switch between <strong>Choose</strong> and <strong>Type</strong> during practice. With two gaps, “—” leaves a gap empty.</p>`)}
${card('Mistake retries',`<p>After a round, choose <strong>Practise mistakes again</strong> to retry only the items you missed. You can repeat this until you feel confident. Correct retries earn normal XP. Vocabulary retries count toward learning the word; grammar retries are extra practice and leave your topic assessment and saved place unchanged.</p>`)}
${card('Typing',`<p>Capitalization is flexible. You can type ä, ö, ü as ae, oe, ue and ß as ss. In vocabulary the article is optional; in grammar it counts.</p>`)}
${card('Keyboard',`<p><kbd>1</kbd>–<kbd>9</kbd> choose an answer · <kbd>Enter</kbd> continues. When building words, type letters and use <kbd>Backspace</kbd> to undo.</p>`)}
${card('Translation',`<p>After a grammar answer, <b>EN</b> shows the sentence in English. Chrome translates on your device (the first use downloads a small language pack); other browsers open Google Translate in a new tab.</p>`)}
${card('Pronunciation',`<p>🔊 reads German aloud with your browser’s German voice. The button in the top bar turns automatic read-aloud after each answer on or off. Voice quality depends on your device.</p>`)}
${card('Streaks &amp; saving',`<p>Your streak counts consecutive days with at least one answer, by your device’s calendar. Missing a whole day restarts it.</p><p>Guest progress stays on this device. Sign in to keep it in your account and use it on other devices.</p>`)}
</div></section>`;
}
function ruleStatus(id){return grammarStatus(state.grammarProgress?.[id],id)}
const percent=(part,size)=>Math.round(part/size*100);
// Plain counts, no percentages: correct answers, answers given, and the round size.
function ruleCounts({correct,answered,size}){return `${correct} correct · ${answered} answered · ${size} in a round`}
function ruleCompletion(progress){
 const {answered,size,target,passed}=progress;
 return `${passed?'Passed':`Pass with ${target} correct in a full round`}${answered>=size?` · counts your latest ${size} answers`:''}`;
}
function ruleScore(progress){
 return `${progress.answered?ruleCounts(progress):'No answers yet'}<span class="grammar-detail">${ruleCompletion(progress)}</span>`;
}
function nextRule(){return RULES.find(r=>!ruleStatus(r.id).passed)||RULES[0]}
function renderWords(level='all'){const list=level==='all'?WORDS:WORDS.filter(w=>w.level===level);content.innerHTML=`<section class="page"><span class="eyebrow">Vocabulary</span><h1>Words in motion.</h1><p class="intro">Each word leaves practice after 8 correct answers. Already know one? Choose “I know this”.</p><div class="word-search"><label for="wordQuery">Find a word</label><input id="wordQuery" type="search" placeholder="German or English, e.g. Käse or cheese" autocomplete="off" spellcheck="false"><div id="wordResults" aria-live="polite"></div></div><div class="filters">${['all','A1','A2'].map(x=>`<button class="filter ${x===level?'active':''}" data-level="${x}">${x==='all'?'All levels':x}</button>`).join('')}</div><div class="section-head word-section"><div><h2>${list.length-pendingWords(list).length}/${list.length} words complete</h2><p>Learned through practice or marked known · Colours show gender: <span class="g-der">der</span> · <span class="g-die">die</span> · <span class="g-das">das</span></p></div><button class="primary" data-start="words" data-word-level="${level}">Start mixed practice</button></div><div class="lesson-grid">${Object.entries(groupBy(list,'topic')).map(([topic,arr])=>{const done=arr.length-pendingWords(arr).length;return `<button class="lesson-card" data-topic="${topic}"><span class="lesson-icon">${topic.slice(0,1)}</span><span><h3>${topic}</h3><p>${done}/${arr.length} complete · ${[...new Set(arr.map(x=>x.level))].join(' / ')}</p><span class="bar topic-bar" aria-hidden="true"><span style="width:${done/arr.length*100}%"></span></span></span><span class="score">→</span></button>`}).join('')}</div></section>`;document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>renderWords(b.dataset.level));bindLessonButtons();document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>startWords(list.filter(w=>w.topic===b.dataset.topic)));$('#wordQuery').oninput=event=>renderWordResults(event.target.value)}
// Searching ignores articles, case and umlaut spelling, like typed answers do.
function searchKey(s){return normalise(s).replace(/^(der|die|das)\s+/,'').replace(/^to /,'').replace(/ß/g,'ss').replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u')}
function wordStatus(word){return isWordKnown(word)?'Marked known':wordCorrect(word)>=WORD_TARGET?'Learned':`${wordCorrect(word)}/${WORD_TARGET} correct`}
function renderWordResults(query){
 const box=$('#wordResults'),key=searchKey(query);
 if(!key){box.innerHTML='';return}
 const hits=WORDS.filter(w=>searchKey(w.de).includes(key)||w.en.split(' / ').some(en=>searchKey(en).includes(key)));
 box.innerHTML=hits.length?`<p class="meta">${hits.length>20?`First 20 of ${hits.length} matches`:`${hits.length} match${hits.length===1?'':'es'}`}</p><ul class="word-results">${hits.slice(0,20).map(w=>`<li><span><strong>${germanWord(w.de)}</strong> ${speakButton(w.de)} — ${esc(w.en)}<small>${esc(w.topic)} · ${w.level} · ${wordStatus(w)}</small></span>${isWordKnown(w)?`<button class="secondary" data-restore-search="${w.id}">Practise again</button>`:wordCorrect(w)<WORD_TARGET?`<button class="secondary" data-practise-word="${w.id}" aria-label="Practise ${esc(w.de)}">Practise</button>`:''}</li>`).join('')}</ul>`:'<p class="meta">No matching words. Try the English meaning or fewer letters.</p>';
 document.querySelectorAll('[data-practise-word]').forEach(b=>b.onclick=()=>startWords(WORDS.filter(w=>String(w.id)===b.dataset.practiseWord)));
 document.querySelectorAll('[data-restore-search]').forEach(b=>b.onclick=()=>{state.knownWordIds=(state.knownWordIds||[]).filter(known=>known!==b.dataset.restoreSearch);save();renderWordResults(query)});
}
function groupBy(a,k){return a.reduce((o,x)=>((o[x[k]]??=[]).push(x),o),{})}
function renderGrammar(level='all'){
 const list=level==='all'?RULES:RULES.filter(r=>r.level===level);
 content.innerHTML=`<section class="page"><span class="eyebrow">Grammar gym</span><h1>Repeat until it sticks.</h1><p class="intro">Choose a topic and practise at your own pace. Your place is saved after every answer.</p><div class="filters">${['all','A1','A2'].map(x=>`<button class="filter ${x===level?'active':''}" data-level="${x}">${x==='all'?'All rules':x}</button>`).join('')}</div><div class="rule-list">${list.map(r=>{
  const progress=ruleStatus(r.id);
  return `<article class="rule${progress.passed?' passed':''}"><div><span class="eyebrow">${r.level} · ${progress.passed?'<span class="passed-badge">✓ Passed</span>':progress.attempts?'In progress':'Not started'}</span><h3>${r.title}</h3><div class="meta">${r.desc}</div><p class="grammar-score">${ruleScore(progress)}</p><div class="bar" aria-hidden="true"><span style="width:${progress.answered/progress.size*100}%"></span></div><p class="meta">Next: exercise ${progress.next+1} of ${progress.size}</p></div><button class="${progress.attempts?'secondary':'primary'}" data-rule="${r.id}">${progress.passed?'Practise again':progress.attempts?'Continue rule':'Start rule'}</button>${ruleTheory(r)}</article>`;
 }).join('')}</div></section>`;
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>renderGrammar(b.dataset.level));bindLessonButtons();
}
function wordProgress(){return `<details class="rule-theory word-record"><summary>Your word progress</summary><div class="theory-table" role="region" aria-label="Word learning progress" tabindex="0"><table><thead><tr><th scope="col">German</th><th scope="col">English</th><th scope="col">Correct answers</th></tr></thead><tbody>${WORDS.filter(w=>wordCorrect(w)>0).map(w=>`<tr><th scope="row">${germanWord(w.de)}</th><td>${esc(w.en)}</td><td>${wordCorrect(w)}/${WORD_TARGET}${isWordKnown(w)?' · Marked known':wordCorrect(w)>=WORD_TARGET?' · Learned':''}</td></tr>`).join('')||'<tr><td colspan="3">No word progress yet. Answer a word correctly to add it here.</td></tr>'}</tbody></table></div></details>`}
function activityChart(){
 const days=[6,5,4,3,2,1,0].map(daysAgo).map(date=>({date,count:answersOn(date)}));
 const max=Math.max(...days.map(day=>day.count),1),week=days.reduce((sum,day)=>sum+day.count,0);
 return `<div class="chart"><h3>Last 7 days</h3><p class="meta">${week} answer${week===1?'':'s'} this week · ${currentStreak()}-day streak</p><div class="bars" role="list">${days.map(({date,count},i)=>{const label=date.toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'});return `<span class="daybar${i===6?' today':''}${count?'':' empty'}" role="listitem" style="height:${Math.max(5,count/max*100)}%" title="${label}: ${count} answers" aria-label="${label}: ${count} answers">${count?`<b>${count}</b>`:''}<small>${i===6?'Today':date.toLocaleDateString('en',{weekday:'short'})}</small></span>`}).join('')}</div></div>`;
}
function renderProgress(){const best=bestRule();const acc=state.answered?Math.round(state.correct/state.answered*100):0;const mastered=RULES.filter(rule=>ruleStatus(rule.id).passed).length;content.innerHTML=`<section class="page"><span class="eyebrow">Learning record</span><h1>Your progress.</h1>${rankOverview()}<div class="stats"><div class="stat"><strong>${mastered}/${RULES.length}</strong><small>grammar rules passed</small></div><div class="stat"><strong>${acc}%</strong><small>all-time accuracy</small></div><div class="stat"><strong>${state.xp}</strong><small>experience points</small></div></div>${wordProgress()}${knownWords()}<div class="progress-grid">${activityChart()}<div class="summary-card"><span class="eyebrow">Strongest rule</span><h2>${best?.title||'Start practising'}</h2><p class="intro">${best?ruleScore(ruleStatus(best.id)):'Your first grammar answer will appear here.'}</p><button class="secondary" id="resetBtn">Reset progress</button></div></div></section>`;document.querySelectorAll('[data-restore-word]').forEach(b=>b.onclick=()=>restoreWord(b.dataset.restoreWord));$('#resetBtn').onclick=()=>{if(confirm(account?'Reset all saved progress for this account?':'Reset all guest progress on this device?')){state=structuredClone(defaultState);save();renderProgress()}}}
function bestRule(){return RULES.filter(rule=>ruleStatus(rule.id).attempts>0).sort((a,b)=>ruleStatus(b.id).correct/ruleStatus(b.id).size-ruleStatus(a.id).correct/ruleStatus(a.id).size)[0]}
function bindLessonButtons(){document.querySelectorAll('[data-start="words"]').forEach(b=>b.onclick=()=>startWords(b.dataset.wordLevel&&b.dataset.wordLevel!=='all'?WORDS.filter(w=>w.level===b.dataset.wordLevel):WORDS));document.querySelectorAll('[data-rule]').forEach(b=>b.onclick=()=>startRule(b.dataset.rule))}
function wordCorrect(word){return state.wordCorrectCounts?.[word.id]||0}
function isWordKnown(word){return (state.knownWordIds||[]).includes(String(word.id))}
function pendingWords(pool){return pool.filter(word=>wordCorrect(word)<WORD_TARGET&&!isWordKnown(word))}
function knownWords(){
 const words=WORDS.filter(isWordKnown);
 return `<details class="rule-theory word-record"><summary>Words marked known (${words.length})</summary><p class="meta">These words are excluded from practice. Marking a word known awards no XP and leaves its answer count unchanged.</p><ul class="known-words">${words.map(w=>`<li><span><strong>${germanWord(w.de)}</strong> ${speakButton(w.de)}<br>${esc(w.en)}</span><button class="secondary" data-restore-word="${w.id}" aria-label="Practise ${esc(w.de)} again">Practise again</button></li>`).join('')||'<li>No words marked known yet.</li>'}</ul></details>`;
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
 document.querySelectorAll('.choice,.letter,#checkBuilt,#undoLetter,#clearLetters,#answerForm button,#typed,#knowWord').forEach(b=>b.disabled=true);
 const feedback=$('#feedback');feedback.className='feedback good';
 feedback.innerHTML=`<div><strong>Marked known</strong><br>${germanWord(word.de)} ${speakButton(word.de)} — ${esc(word.en)}<br>This word leaves practice. Restore it from Progress. No XP awarded.</div><button class="primary" id="next">Continue</button>`;
 save();$('#next').onclick=()=>{session.index++;session.locked=false;renderWordQuestion()};$('#next').focus?.();
}
function startWords(pool=WORDS){
 const items=shuffle(pendingWords(pool)).slice(0,8);
 if(!items.length){session=null;content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">Vocabulary complete</span><h1>All words complete.</h1><p class="intro">Every word in this selection has been answered correctly ${WORD_TARGET} times or marked known. These words will no longer appear in practice.</p><button class="primary" id="backToWords">Back to vocabulary</button></section></div>`;$('#backToWords').onclick=()=>go('words');return}
 startWordRound(items,pool);
}
function startWordRound(items,pool,options={}){
 session={type:'words',pool,items,index:0,roundCorrect:0,roundAnswered:0,skipped:0,missed:[],missedItems:[],...options};
 renderWordQuestion();
}
// Prefer related words, but never fill a gap with a different part of speech.
function relatedWords(word){
 const priority=other=>(other.topic===word.topic?0:2)+(other.level===word.level?0:1);
 return shuffle(WORDS.filter(other=>other.id!==word.id&&other.pos===word.pos)).sort((a,b)=>priority(a)-priority(b));
}
function meaningsOf(word,english){return english.split(' / ').map(value=>word.pos==='verb'?normalise(value).replace(/^to /,''):normalise(value))}
// Options never share a meaning, so exactly one of them is correct.
function distinctOptions(word,show){
 const used=new Set(meaningsOf(word,word.en)), options=[show(word)];
 for(const other of relatedWords(word)){
  const alternatives=meaningsOf(word,other.en);
  if(alternatives.some(meaning=>used.has(meaning)))continue;
  alternatives.forEach(meaning=>used.add(meaning));
  options.push(show(other));
  if(options.length===4)break;
 }
 return shuffle(options);
}
function wordChoices(word){return distinctOptions(word,other=>other.en)}
function germanChoices(word){return distinctOptions(word,other=>other.de)}
function wordForm(word,correctCount){
 const mode=correctCount%3;
 // The fourth correct answer recognises German from English; the sixth drills noun gender.
 if(correctCount===3){
  const opts=germanChoices(word);
  if(opts.length===4)return {label:'Choose the German word',prompt:word.en,answer:word.de,kind:'choice',opts,optsLang:'de'};
 }
 if(correctCount===5&&word.pos==='noun'){
  const [article,...noun]=word.de.split(' ');
  return {label:'Choose the article',prompt:`___ ${noun.join(' ')}`,promptLang:'de',hint:word.en,answer:article,kind:'choice',opts:['der','die','das'],optsLang:'de'};
 }
 if(mode===0){
  const opts=wordChoices(word);
  if(opts.length===4)return {label:'Choose the English meaning',prompt:word.de,promptLang:'de',answer:word.en,kind:'choice',opts};
 }
 // Sparse future categories use recall instead of obvious or duplicate options.
 if(mode!==2)return {label:'Type the German translation',prompt:word.en,answer:word.de,kind:'type'};
 const clean=word.de.replace(/^(der|die|das) /,'');
 return {label:'Build the German word',prompt:word.en,answer:clean,kind:'letters',opts:shuffle(clean.split(''))};
}
function setProgress(){
 if(!session.limit)return [session.index,session.items.length];
 const done=session.answered||0;
 return [done,Math.min(session.limit,done+session.items.length-session.index)];
}
function practiceShell(inner,after=''){const [done,total]=setProgress();content.innerHTML=`<div class="practice-wrap"><section class="practice"><div class="practice-top"><button class="secondary" id="quit">Exit</button><div class="bar"><span style="width:${done/total*100}%"></span></div><strong>${done+1}/${total}</strong></div>${inner}<div id="feedback" class="feedback hidden" role="status"></div>${after}</section></div>`;$('#quit').onclick=()=>go(session.type==='words'?'words':'grammar')}
function choiceButtons(opts,lang){return `<div class="choices">${opts.map((o,i)=>`<button class="choice" data-answer="${esc(o)}"${lang?` lang="${lang}"`:''}><span class="key" aria-hidden="true">${i+1}</span>${esc(o)}</button>`).join('')}</div>`}
function promptBox(text,lang,spoken=''){return `<div class="prompt${text.length>34?' long':''}"${lang?` lang="${lang}"`:''}>${esc(text)}${speakButton(spoken)}</div>`}
function renderWordQuestion(){if(session.index>=session.items.length)return finishSession();let w=session.items[session.index],q=wordForm(w,wordCorrect(w));session.current={...q,word:w};let body=`<div class="prompt-label">${session.retry?'Mistake retry · ':session.guided?'Guided practice · ':''}${q.label} · ${wordCorrect(w)}/${WORD_TARGET} correct</div>${promptBox(q.prompt,q.promptLang,q.promptLang==='de'?q.prompt.replace(/^___ /,''):'')}${q.hint?`<p class="prompt-hint">${esc(q.hint)}</p>`:''}`;if(q.kind==='choice')body+=choiceButtons(q.opts,q.optsLang);if(q.kind==='type')body+=`<form class="type-row" id="answerForm"><input id="typed" autocomplete="off" autocapitalize="off" spellcheck="false" lang="de" placeholder="Type in German…" aria-label="Your answer" aria-describedby="answerHint"><button class="primary">Check</button></form><p class="answer-hint" id="answerHint">Article optional · ae, oe, ue and ss accepted</p>`;if(q.kind==='letters')body+=`<div class="answer-slots" id="built" lang="de" aria-live="polite"></div><div class="letters">${q.opts.map((o,i)=>`<button class="letter" data-letter="${esc(o)}" data-i="${i}"${o===' '?' aria-label="space"':''}>${o===' '?'␣':esc(o)}</button>`).join('')}</div><div class="type-row letter-actions"><button class="primary" id="checkBuilt">Check</button><button class="secondary" id="undoLetter">Undo</button><button class="secondary" id="clearLetters">Clear</button></div>`;practiceShell(body,`<div class="word-actions"><button class="secondary" id="knowWord" title="Hide this word from practice · no XP">I know this</button></div>`);$('#knowWord').onclick=markWordKnown;if(q.kind==='choice')document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b));if(q.kind==='type'){$('#answerForm').onsubmit=e=>{e.preventDefault();answer($('#typed').value)};$('#typed').focus?.()}if(q.kind==='letters')bindLetters(q)}
function bindLetters(q){
 const picked=[];
 const show=()=>{$('#built').textContent=picked.map(i=>q.opts[i]).join('')};
 const undo=()=>{if(session.locked||!picked.length)return;const tile=document.querySelector(`[data-i="${picked.pop()}"]`);if(tile)tile.disabled=false;show()};
 document.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{if(session.locked||b.disabled)return;picked.push(Number(b.dataset.i));b.disabled=true;show()});
 $('#undoLetter').onclick=undo;
 $('#clearLetters').onclick=()=>{while(picked.length&&!session.locked)undo()};
 $('#checkBuilt').onclick=()=>answer(picked.map(i=>q.opts[i]).join(''));
 session.current.undo=undo;
}
function startRule(id){
 const rule=RULES.find(r=>r.id===id),progress=ruleStatus(id);
 const cycle=Math.floor(progress.attempts/progress.size);
 session={type:'grammar',rule,cycle,items:exerciseDeck(rule,cycle),index:progress.next,limit:GRAMMAR_SET,roundCorrect:0,answered:0,missed:[],missedItems:[]};
 renderRuleQuestion();
}
function grammarScore(id){
 const answered=session.answered||0;
 const visit=`${session.retry?'Retry':'This set'}: ${session.roundCorrect} correct · ${answered} answered`;
 const progress=ruleStatus(id);
 return `${visit}<span class="grammar-detail">${session.retry?'Extra practice · your topic progress stays unchanged.':`Topic: ${progress.answered?ruleCounts(progress):'no answers yet'} · ${ruleCompletion(progress)}`}</span>`;
}
// Typing suits short answers; sentence-order and two-option questions stay multiple choice.
function canType(q){return q[1].split(' ').length<=2&&q[2].length>=2}
function grammarInput(){try{return localStorage.getItem('wortwerk-grammar-input')==='type'?'type':'choice'}catch{return 'choice'}}
function setGrammarInput(mode){try{localStorage.setItem('wortwerk-grammar-input',mode)}catch{/* The choice still applies to this question. */}if(!session.locked)renderRuleQuestion(mode)}
function renderRuleQuestion(mode=grammarInput()){
 if(session.justPassed||session.index>=session.items.length||(session.limit&&session.answered>=session.limit))return finishGrammar();
 const q=session.items[session.index],typed=mode==='type'&&canType(q);
 session.current={answer:q[1],prompt:q[0],kind:typed?'type':'choice'};
 const input=typed?`<form class="type-row" id="answerForm"><input id="typed" autocomplete="off" autocapitalize="off" spellcheck="false" lang="de" placeholder="Type the missing part…" aria-label="Your answer" aria-describedby="answerHint"><button class="primary">Check</button></form><p class="answer-hint" id="answerHint">ae, oe, ue and ss accepted</p>`:choiceButtons(shuffle([q[1],...q[2]]),'de');
 const toggle=`<div class="input-toggle" role="group" aria-label="Answer mode"><button class="filter ${mode==='type'?'':'active'}" data-input="choice" aria-pressed="${mode!=='type'}">Choose</button><button class="filter ${mode==='type'?'active':''}" data-input="type" aria-pressed="${mode==='type'}">Type</button>${mode==='type'&&!typed?'<span>This one is multiple choice.</span>':''}</div>`;
 practiceShell(`<div class="prompt-label">${session.retry?'Mistake retry · ':''}${esc(session.rule.title)}${session.cycle?` · Round ${session.cycle+1}`:''}</div><p class="grammar-score" id="grammarScore" role="status">${grammarScore(session.rule.id)}</p>${toggle}${promptBox(q[0],'de')}${q[0].split('___').length===3?'<p class="prompt-hint">Fill both gaps; — leaves a gap empty.</p>':''}${input}`,`<div class="mastery-note"><strong>Rule</strong> — ${esc(session.rule.tip)}</div>${ruleTheory(session.rule)}`);
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b));
 document.querySelectorAll('[data-input]').forEach(b=>b.onclick=()=>setGrammarInput(b.dataset.input));
 if(typed){$('#answerForm').onsubmit=e=>{e.preventDefault();answer($('#typed').value)};$('#typed').focus?.()}
}
function reviewList(missed){return missed.length?`<details class="rule-theory review" open><summary>Review your mistakes (${missed.length})</summary><ul class="review-list">${missed.map(item=>`<li>${item}</li>`).join('')}</ul></details>`:''}
function retryButton(){
 const count=session.missedItems?.length||0;
 return count?`<button class="primary" id="retryMistakes">Practise ${count} mistake${count===1?'':'s'} again</button>`:'';
}
function bindRetry(){
 if(session.missedItems?.length){$('#retryMistakes').onclick=retryMistakes;$('#retryMistakes').focus?.()}
 else $('#again').focus?.();
}
function retryMistakes(){
 const previous=session,items=previous?.missedItems;
 if(!items?.length)return;
 speech?.cancel();
 if(previous.type==='words')startWordRound([...items],previous.pool,{retry:true,guided:previous.guided});
 else{
  session={type:'grammar',rule:previous.rule,cycle:previous.cycle,items:[...items],index:0,roundCorrect:0,answered:0,missed:[],missedItems:[],retry:true};
  renderRuleQuestion();
 }
}
function finishGrammar(){
 const progress=ruleStatus(session.rule.id),answered=session.answered||0;
 const title=session.retry?(session.missedItems.length?'Keep building.':'Mistakes revisited!'):session.justPassed?'Rule passed!':session.index<session.items.length?'Set complete.':progress.passed?'Practice complete.':'Round complete.';
 const intro=session.retry?`You answered ${session.roundCorrect} of ${answered} correctly on retry. Continue the topic from where you left off.`:session.index<session.items.length&&!session.justPassed?'Your place is saved. Continue for the next set of exercises.':progress.passed?'You earned a pass for this topic. It stays passed.':'Continue with your recent answers carried over; new answers replace the oldest.';
 content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">${session.retry?'Mistake retry · ':''}${esc(session.rule.title)}</span><h1>${title}</h1><p class="intro">${intro}</p><div class="stats"><div class="stat"><strong>${session.roundCorrect}/${answered}</strong><small>correct this ${session.retry?'retry':'set'}</small></div><div class="stat"><strong>+${session.roundXp||0}</strong><small>XP earned this set</small></div></div><p class="grammar-score">${session.retry?'<span class="grammar-detail">Topic assessment · unchanged by retries</span>':''}${ruleScore(progress)}</p><div class="session-actions">${retryButton()}<button class="${session.missedItems?.length?'secondary':'primary'}" id="again">${progress.passed?'Practise topic again':'Continue topic'}</button><button class="secondary" id="done">Back to grammar</button></div>${reviewList(session.missed||[])}</section></div>`;
 $('#again').onclick=()=>startRule(session.rule.id);$('#done').onclick=()=>go('grammar');bindRetry();
}
function normalise(s){return s.normalize('NFC').toLowerCase().trim().replace(/[.!?]/g,'').replace(/\s+/g,' ')}
function normaliseWord(s){return normalise(s).replace(/^(der|die|das)\s+/,'').replace(/ß/g,'ss')}
function spellingVariants(text){return [...text].reduce((forms,char)=>forms.flatMap(form=>({ä:['ä','a','ae'],ö:['ö','o','oe'],ü:['ü','u','ue']}[char]||[char]).map(letter=>form+letter)),[''])}
function matchesAnswer(value){
 const kind=session.current.kind;
 if(kind==='choice'||(session.type!=='words'&&kind!=='type'))return normalise(value)===normalise(session.current.answer);
 // Typed grammar answers keep their articles; vocabulary makes them optional.
 const clean=session.type==='words'?normaliseWord:s=>normalise(s).replace(/ß/g,'ss');
 return spellingVariants(clean(session.current.answer)).includes(clean(value));
}
// Fills the gaps so feedback shows the whole sentence, without the trailing cue.
// Two-gap answers are written "verb … prefix"; "—" leaves a gap empty.
// Returns [text, isAnswer] pieces, or null when the prompt is not a gap sentence.
function fillBlank(prompt,answer){
 const gaps=prompt.split('___').length-1;
 const fills=gaps===1?[answer]:gaps===2&&answer.includes(' … ')?answer.split(' … ').map(part=>part==='—'?'':part):null;
 if(!fills)return null;
 let text=prompt.replace(/\s*\((?:[^()]|\([^()]*\))*\)\s*$/,'');
 const colon=text.lastIndexOf(': ');
 if(colon>=0&&text.indexOf('___')>colon)text=text.slice(colon+2);
 const pieces=[];
 text.split('___').forEach((part,i)=>{
  if(i&&!fills[i-1])pieces[pieces.length-2][0]=pieces[pieces.length-2][0].trimEnd();
  pieces.push([part,false]);
  if(i<fills.length)pieces.push([fills[i],true]);
 });
 if(!pieces[0][0]&&pieces[1][0])pieces[1][0]=pieces[1][0][0].toUpperCase()+pieces[1][0].slice(1);
 return pieces;
}
function completedSentence(prompt,answer){
 const pieces=fillBlank(prompt,answer);
 return pieces?`<span class="solution" lang="de">${pieces.map(([text,filled])=>filled?(text?`<mark>${esc(text)}</mark>`:''):esc(text)).join('')}</span>`:'';
}
// What to read aloud after a grammar answer: the completed sentence, or a correct
// sentence chosen as a whole (word order); single words out of context are skipped.
function grammarSpeech(prompt,answer){
 const pieces=fillBlank(prompt,answer);
 if(pieces)return pieces.map(([text])=>text).join('').replace(/\s+/g,' ').trim();
 return answer.split(' ').length>=3?answer:'';
}
function answerFeedback(ok,value=''){
 if(session.type==='words'){const word=session.current.word;return `${ok?'':'Correct answer: '}${germanWord(word.de)} ${speakButton(word.de)} — ${esc(word.en)}<br><span class="word-progress">${wordCorrect(word)}/${WORD_TARGET} correct${wordCorrect(word)>=WORD_TARGET?' · Learned! This word leaves your practice pool.':''}</span>`}
 const {answer:correct,prompt=''}=session.current,sentence=completedSentence(prompt,correct);
 const exact=ok&&session.current.kind==='type'&&value.trim()!==correct?`<br>Exact form: <strong lang="de">${esc(correct)}</strong>`:'';
 const spoken=grammarSpeech(prompt,correct);
 return (ok?'Well done.':'Correct answer: <strong lang="de">'+esc(correct)+'</strong>')+exact+(sentence?`<br>${sentence} ${speakButton(spoken)}${translateButton(spoken)}`:spoken?` ${speakButton(spoken)}${translateButton(spoken)}`:'')+(session.justPassed?`<br><strong>Rule passed: ${ruleStatus(session.rule.id).correct} of ${ruleStatus(session.rule.id).size} correct!</strong>`:'');
}
function answer(value,button){
 if(session.locked)return;
 session.locked=true;
 const ok=matchesAnswer(value);
 state.answered++;
 if(ok){
  const reward=session.current.kind==='type'?XP_REWARDS.typed:XP_REWARDS.choice;
  state.correct++;session.roundCorrect++;session.roundXp=(session.roundXp||0)+reward;state.xp+=reward;
 }
 state.activity[new Date().getDay()?new Date().getDay()-1:6]++;recordActivity();
 if(session.type==='words'){
  $('#knowWord').disabled=true;
  session.roundAnswered=(session.roundAnswered||0)+1;
  const word=session.current.word;
  state.wordCorrectCounts??={};
  if(ok)state.wordCorrectCounts[word.id]=Math.min(WORD_TARGET,wordCorrect(word)+1);
  state.wordMastery[word.id]=Math.round(wordCorrect(word)/WORD_TARGET*100);
  if(!ok){
   session.missed?.push(`${germanWord(word.de)} ${speakButton(word.de)} — ${esc(word.en)}`);
   session.missedItems?.push(word);
  }
 }else{
  const id=session.rule.id;
  // Extra retries do not consume exercises in the saved assessment deck.
  if(!session.retry){
   const wasPassed=ruleStatus(id).passed;
   state.grammarProgress??={};
   state.grammarProgress[id]=recordGrammarAnswer(state.grammarProgress[id],ok,id);
   session.justPassed=!wasPassed&&ruleStatus(id).passed;
  }
  session.answered=(session.answered||0)+1;
  $('#grammarScore').innerHTML=grammarScore(id);
  if(!ok){
   const {prompt='',answer:correct}=session.current,completed=completedSentence(prompt,correct),spoken=grammarSpeech(prompt,correct);
   session.missed?.push(completed?`${completed} ${speakButton(spoken)}${translateButton(spoken)}`:`<span lang="de">${esc(prompt)}</span> → <strong lang="de">${esc(correct)}</strong>`);
   session.missedItems?.push(session.items[session.index]);
  }
 }
 if(button){
  button.classList.add(ok?'correct':'wrong');
  document.querySelectorAll('.choice').forEach(b=>{if(matchesAnswer(b.dataset.answer))b.classList.add('correct');b.disabled=true});
 }
 document.querySelectorAll('.letter,#checkBuilt,#undoLetter,#clearLetters,#answerForm button,#typed').forEach(b=>b.disabled=true);
 const feedback=$('#feedback');feedback.className='feedback '+(ok?'good':'bad');
 feedback.innerHTML=`<div><strong>${ok?'Richtig!':'Not quite'}</strong><br>${answerFeedback(ok,value)}</div><button class="primary" id="next" title="Enter">Continue</button>`;
 save();autoSpeak(session.type==='words'?session.current.word.de:grammarSpeech(session.current.prompt||'',session.current.answer));
 $('#next').onclick=()=>{session.index++;session.locked=false;if(session.type==='words')renderWordQuestion();else renderRuleQuestion()};
 $('#next').focus?.({preventScroll:true});feedback.scrollIntoView?.({block:'nearest',behavior:'smooth'});
}
function finishSession(){
 if(session.type==='grammar')return finishGrammar();
 const attempted=session.roundAnswered??session.items.length;
 const pct=attempted?Math.round(session.roundCorrect/attempted*100):0;
 content.innerHTML=`<div class="practice-wrap"><section class="practice"><span class="eyebrow">${session.retry?'Mistake retry complete':'Round complete'}</span><h1>${!attempted?'All set.':session.retry&&pct===100?'Mistakes revisited!':pct>=80?'Sehr gut!':'Keep building.'}</h1><p class="intro">${attempted?`You answered ${session.roundCorrect} of ${attempted} correctly.`:'No answers submitted.'}${session.skipped?` ${session.skipped} marked known without XP.`:''}</p><div class="stats"><div class="stat"><strong>${attempted?`${pct}%`:'—'}</strong><small>this round</small></div><div class="stat"><strong>+${session.roundXp||0}</strong><small>XP earned</small></div><div class="stat"><strong>${attempted}</strong><small>words reviewed</small></div></div><div class="session-actions">${retryButton()}<button class="${session.missedItems?.length?'secondary':'primary'}" id="again">${session.guided?'Another guided round':'Practise again'}</button><button class="secondary" id="done">Done</button></div>${reviewList(session.missed||[])}</section></div>`;
 $('#again').onclick=()=>session.guided?startGuidedRound():startWords(session.pool);$('#done').onclick=()=>go(session.guided?'today':'words');bindRetry();
}
// Keyboard shortcuts for practice: number keys answer, Enter continues, and
// letter-building accepts typed letters with Backspace to undo.
function practiceKeys(event){
 if(!session||event.ctrlKey||event.metaKey||event.altKey||event.defaultPrevented)return;
 const tag=event.target?.tagName;
 if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
 const next=document.querySelector('#next');
 if(event.key==='Enter'&&next&&tag!=='BUTTON'){event.preventDefault();next.click();return}
 if(session.locked)return;
 if(/^[1-9]$/.test(event.key)){const choice=document.querySelectorAll('.choice')[Number(event.key)-1];if(choice&&!choice.disabled){event.preventDefault();choice.click()}return}
 if(session.current?.kind!=='letters')return;
 if(event.key==='Backspace'){event.preventDefault();session.current.undo?.();return}
 if(event.key==='Enter'&&tag!=='BUTTON'){event.preventDefault();document.querySelector('#checkBuilt')?.click();return}
 if(event.key.length===1){const tile=[...document.querySelectorAll('.letter')].find(b=>!b.disabled&&b.dataset.letter.toLowerCase()===event.key.toLowerCase());if(tile){event.preventDefault();tile.click()}}
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
window.addEventListener('keydown',practiceKeys);
window.addEventListener('click',event=>{const button=event.target?.closest?.('[data-speak]');if(button){event.preventDefault();speak(button.dataset.speak)}const translation=event.target?.closest?.('[data-translate]');if(translation){event.preventDefault();showTranslation(translation)}const link=event.target?.closest?.('[data-view-link]');if(link){event.preventDefault();go(link.dataset.viewLink)}});
$('#soundBtn').onclick=()=>{state.sound=!state.sound;save();if(state.sound)speak('Ton an')};
if(speech){loadVoices();speech.addEventListener?.('voiceschanged',loadVoices)}
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
window.addEventListener('online',()=>void flushProgress());
loadAccount().then(registerLearningTool);

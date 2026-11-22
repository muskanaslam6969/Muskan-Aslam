const $=s=>document.querySelector(s);
const KEY='quizdeck_v1';
let db=JSON.parse(localStorage.getItem(KEY)||'{"quizzes":[],"results":[]}');
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}

function go(p){
  document.querySelectorAll('.page').forEach(e=>e.classList.remove('show'));
  $('#'+p).classList.add('show');
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));
  if(p!=='play')clearInterval(timerId);
  render();scrollTo(0,0);
}
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.p));

/* ---------- render ---------- */
function card(q){
  return `<div class="card"><span class="tag">${esc(q.subject||'General')}</span><b>${esc(q.title)}</b>
  <p>${q.questions.length} questions, ${q.time} min</p>
  <div class="row"><button class="btn gold sm" onclick="start('${q.id}')">Start</button>
  <button class="btn danger sm" onclick="delQuiz('${q.id}')">Delete</button></div></div>`;
}
function render(){
  const r=db.results,pcts=r.map(x=>x.pct);
  $('#sQ').textContent=db.quizzes.length;$('#sA').textContent=r.length;
  $('#sAvg').textContent=(r.length?Math.round(pcts.reduce((a,b)=>a+b,0)/r.length):0)+'%';
  $('#sBest').textContent=(r.length?Math.max(...pcts):0)+'%';
  const empty='<p class="muted">No quizzes yet. Create your first quiz to see it here.</p>';
  $('#latest').innerHTML=db.quizzes.slice(-3).reverse().map(card).join('')||empty;
  const f=($('#search').value||'').toLowerCase();
  const list=db.quizzes.filter(q=>(q.title+q.subject).toLowerCase().includes(f));
  $('#libList').innerHTML=list.map(card).join('')||empty;
  $('#resBody').innerHTML=r.slice().reverse().map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.quiz)}</td><td>${x.score}/${x.total} (${x.pct}%)</td><td>${x.date}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">No attempts yet.</td></tr>';
}
$('#search').oninput=render;
function delQuiz(id){if(confirm('Delete this quiz?')){db.quizzes=db.quizzes.filter(q=>q.id!==id);save();render();toast('Quiz deleted')}}

/* ---------- create ---------- */
let qn=0;
function addQ(){
  qn++;const d=document.createElement('div');d.className='qb';
  d.innerHTML=`<b>Question ${document.querySelectorAll('.qb').length+1}</b>
  <input class="in qt" placeholder="Type the question">
  ${[0,1,2,3].map(i=>`<div class="opt"><input type="radio" name="c${qn}" value="${i}" ${i?'':'checked'} aria-label="Correct answer"><input type="text" class="in qo" placeholder="Option ${String.fromCharCode(65+i)}"></div>`).join('')}
  <p class="muted">Select the circle next to the correct option.</p>
  <button class="btn danger sm" style="justify-self:start" onclick="this.parentElement.remove()">Remove</button>`;
  $('#qBox').appendChild(d);
}
function saveQuiz(){
  const title=$('#qTitle').value.trim();
  if(!title)return toast('Enter a quiz title');
  const qs=[...document.querySelectorAll('.qb')].map(b=>{
    const opts=[...b.querySelectorAll('.qo')].map(i=>i.value.trim());
    const c=b.querySelector('input[type=radio]:checked');
    return{q:b.querySelector('.qt').value.trim(),opts,ans:c?+c.value:0};
  });
  if(!qs.length)return toast('Add at least one question');
  if(qs.some(x=>!x.q||x.opts.some(o=>!o)))return toast('Fill in every question and option');
  db.quizzes.push({id:'q'+Date.now(),title,subject:$('#qSub').value.trim(),time:+$('#qTime').value||10,shuffle:$('#qShuf').value==='1',questions:qs});
  save();$('#qTitle').value='';$('#qSub').value='';$('#qBox').innerHTML='';
  toast('Quiz saved');go('library');
}

/* ---------- play ---------- */
let cur,qs,ans,idx,timerId,left;
function start(id){
  const name=prompt('Enter your name to begin:');
  if(!name||!name.trim())return;
  cur=db.quizzes.find(q=>q.id===id);cur._name=name.trim();
  qs=cur.questions.slice();if(cur.shuffle)qs.sort(()=>Math.random()-.5);
  ans=Array(qs.length).fill(null);idx=0;left=cur.time*60;
  $('#pTitle').textContent=cur.title;go('play');showQ();
  clearInterval(timerId);
  timerId=setInterval(()=>{left--;tick();if(left<=0)finish()},1000);tick();
}
function tick(){const m=String(Math.floor(left/60)).padStart(2,'0'),s=String(left%60).padStart(2,'0');$('#timer').textContent=m+':'+s}
function showQ(){
  const q=qs[idx];
  $('#pCount').textContent=`Question ${idx+1} of ${qs.length}`;
  $('#pQ').textContent=q.q;
  $('#prog').style.width=((idx+1)/qs.length*100)+'%';
  $('#pOpts').innerHTML=q.opts.map((o,i)=>`<button class="o ${ans[idx]===i?'sel':''}" onclick="pick(${i})">${esc(o)}</button>`).join('');
  $('#prev').style.visibility=idx?'visible':'hidden';
  $('#next').textContent=idx===qs.length-1?'Finish quiz':'Next';
}
function pick(i){ans[idx]=i;showQ()}
$('#prev').onclick=()=>{idx--;showQ()};
$('#next').onclick=()=>{if(idx===qs.length-1){if(ans.includes(null)&&!confirm('Some questions are unanswered. Finish anyway?'))return;finish()}else{idx++;showQ()}};
function finish(){
  clearInterval(timerId);
  const score=qs.filter((q,i)=>ans[i]===q.ans).length,pct=Math.round(score/qs.length*100);
  db.results.push({name:cur._name,quiz:cur.title,score,total:qs.length,pct,date:new Date().toLocaleDateString()});save();
  $('#dScore').textContent=pct+'%';
  $('#dText').textContent=`${cur._name}, you got ${score} out of ${qs.length} correct.`;
  $('#review').innerHTML=qs.map((q,i)=>{const ok=ans[i]===q.ans;
    return `<div class="rv ${ok?'ok':''}"><b>${i+1}. ${esc(q.q)}</b><br>Your answer: ${ans[i]===null?'Not answered':esc(q.opts[ans[i]])}${ok?'':`<br>Correct answer: ${esc(q.opts[q.ans])}`}</div>`}).join('');
  go('done');
}

/* ---------- data ---------- */
function exportCSV(){
  if(!db.results.length)return toast('No results to export');
  const rows=[['Name','Quiz','Score','Total','Percent','Date'],...db.results.map(r=>[r.name,r.quiz,r.score,r.total,r.pct,r.date])];
  dl('quizdeck-results.csv','text/csv',rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'));
}
function backup(){dl('quizdeck-backup.json','application/json',JSON.stringify(db,null,2));toast('Backup downloaded')}
function dl(n,t,c){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=n;a.click()}
$('#file').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.quizzes||!d.results)throw 0;db=d;save();render();toast('Backup restored')}catch{toast('That file is not a valid backup')}};
  r.readAsText(f);
};
function wipe(){if(confirm('Delete all quizzes and results? This cannot be undone.')){db={quizzes:[],results:[]};save();render();toast('All data deleted')}}

addQ();render();

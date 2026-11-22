// ---------- Add or edit your cards here ----------
const DECKS = {
  "Science": [
    ["What gas do plants absorb for photosynthesis?", "Carbon dioxide (CO₂)"],
    ["What is the powerhouse of the cell?", "Mitochondria"],
    ["What is the chemical symbol for water?", "H₂O"],
    ["Which force pulls objects towards Earth?", "Gravity"],
    ["What is the hardest natural substance?", "Diamond"]
  ],
  "Maths": [
    ["What is 12 × 12?", "144"],
    ["How many degrees are in a triangle?", "180°"],
    ["What is the square root of 81?", "9"],
    ["What is the value of π (2 decimals)?", "3.14"],
    ["How many sides does a hexagon have?", "6"]
  ],
  "World facts": [
    ["Capital of Pakistan?", "Islamabad"],
    ["Longest river in the world (commonly cited)?", "The Nile"],
    ["Largest ocean on Earth?", "Pacific Ocean"],
    ["Which continent is Egypt in?", "Africa"],
    ["Capital of Japan?", "Tokyo"]
  ],
  "Tech terms": [
    ["What does CPU stand for?", "Central Processing Unit"],
    ["What does HTML stand for?", "HyperText Markup Language"],
    ["What does RAM stand for?", "Random Access Memory"],
    ["What is the 'www' in a web address?", "World Wide Web"],
    ["What does URL stand for?", "Uniform Resource Locator"]
  ],
  "Vocabulary": [
    ["Benevolent", "Kind and generous"],
    ["Candid", "Honest and straightforward"],
    ["Diligent", "Hard-working and careful"],
    ["Ephemeral", "Lasting a very short time"],
    ["Resilient", "Able to recover quickly"]
  ],
  "History": [
    ["Year Pakistan became independent?", "1947"],
    ["Who was the first person on the Moon?", "Neil Armstrong"],
    ["Which year did World War II end?", "1945"],
    ["Who painted the Mona Lisa?", "Leonardo da Vinci"],
    ["Which wall fell in 1989?", "The Berlin Wall"]
  ]
};
// --------------------------------------------------

const $ = id => document.getElementById(id);
const deckSelect = $("deckSelect"), flip = $("flip"), qText = $("qText"), aText = $("aText");
const bar = $("bar"), stats = $("stats"), rate = $("rate"), done = $("done"), doneText = $("doneText");

let queue = [], total = 0, mastered = 0, misses = 0;

function best(deck){ try { return localStorage.getItem("dbc-best-" + deck); } catch(e){ return null; } }
function saveBest(deck, v){ try { localStorage.setItem("dbc-best-" + deck, v); } catch(e){} }

function shuffle(a){
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function startDeck(doShuffle){
  const cards = DECKS[deckSelect.value].map(c => ({ q:c[0], a:c[1] }));
  queue = doShuffle ? shuffle(cards) : cards;
  total = queue.length; mastered = 0; misses = 0;
  done.hidden = true; flip.style.display = ""; rate.style.display = "";
  showCard();
}

function showCard(){
  flip.classList.remove("flipped");
  if(!queue.length){ finish(); return; }
  setTimeout(() => { qText.textContent = queue[0].q; aText.textContent = queue[0].a; }, 150);
  update();
}

function update(){
  bar.style.width = (mastered / total * 100) + "%";
  const b = best(deckSelect.value);
  stats.textContent = `Mastered ${mastered} / ${total} · Left in pile ${queue.length} · Missed taps ${misses}` + (b ? ` · Best: ${b} misses` : "");
}

function finish(){
  bar.style.width = "100%";
  flip.style.display = "none"; rate.style.display = "none"; done.hidden = false;
  const b = best(deckSelect.value);
  let msg = `You mastered all ${total} cards with ${misses} missed ${misses === 1 ? "tap" : "taps"}.`;
  if(b === null || misses < Number(b)){ saveBest(deckSelect.value, misses); msg += " New best!"; }
  doneText.textContent = msg;
  update();
}

function toggle(){ if(queue.length) flip.classList.toggle("flipped"); }
function got(){ if(!queue.length) return; queue.shift(); mastered++; showCard(); }
function again(){ if(!queue.length) return; queue.push(queue.shift()); misses++; showCard(); }

Object.keys(DECKS).forEach(name => {
  const o = document.createElement("option"); o.value = o.textContent = name; deckSelect.appendChild(o);
});

flip.addEventListener("click", toggle);
$("gotBtn").addEventListener("click", got);
$("againBtn").addEventListener("click", again);
$("shuffleBtn").addEventListener("click", () => startDeck(true));
$("resetBtn").addEventListener("click", () => startDeck(false));
$("againDeck").addEventListener("click", () => startDeck(true));
deckSelect.addEventListener("change", () => startDeck(false));

document.addEventListener("keydown", e => {
  const tag = (e.target.tagName || "").toLowerCase();
  if(tag === "select") return;
  const inDemo = e.target === flip || e.target === document.body;
  if(!inDemo) return;
  if(e.code === "Space"){ e.preventDefault(); toggle(); }
  if(e.code === "ArrowRight") got();
  if(e.code === "ArrowLeft") again();
});

// mobile menu + footer year
$("menuBtn").addEventListener("click", () => $("menu").classList.toggle("open"));
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => $("menu").classList.remove("open")));
$("year").textContent = new Date().getFullYear();

startDeck(false);

/* =====================================================
   KEEPER OF THE WORD — game engine
   Phases I–III after Ong (1982); IV–V after Miner.
===================================================== */

/* ---------- particle engine: five environments ---------- */
const cv=document.getElementById('fx'), cx=cv.getContext('2d');
let W,H,parts=[],mode='ember';
const conferenceRequested=new URLSearchParams(location.search).get('conference')==='1';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
resize(); addEventListener('resize',resize);
const rnd=(a,b)=>a+Math.random()*(b-a);
const GLYPHS="01⟨⟩∴≋⌁§¶∞λΔ".split("");
function spawn(){
  if(mode==='ember') return {x:rnd(W*.2,W*.8), y:H+10, vx:rnd(-.3,.3), vy:rnd(-1.4,-.5), r:rnd(.8,2.4), life:1, decay:rnd(.003,.008), hue:rnd(20,40)};
  if(mode==='dust')  return {x:rnd(0,W), y:rnd(0,H), vx:rnd(-.12,.12), vy:rnd(.04,.18), r:rnd(.6,1.8), life:1, decay:rnd(.001,.003)};
  if(mode==='static')return {x:rnd(0,W), y:rnd(0,H), vx:0, vy:0, r:rnd(.5,1.4), life:1, decay:rnd(.06,.2)};
  if(mode==='blip')  return {x:rnd(0,W), y:rnd(0,H), vx:rnd(-.2,.2), vy:rnd(-.35,-.1), r:rnd(1.5,3.4), life:1, decay:rnd(.004,.01), pink:Math.random()<.5};
  if(mode==='glyph') return {x:rnd(0,W), y:-14, vx:0, vy:rnd(1.2,3.2), g:GLYPHS[Math.floor(Math.random()*GLYPHS.length)], size:rnd(9,15), life:1, decay:rnd(.002,.005), teal:Math.random()<.35};
  return null;
}
const density=conferenceRequested
  ? {ember:24,dust:20,static:32,blip:16,glyph:24}
  : {ember:90,dust:70,static:140,blip:46,glyph:80};
function tick(){
  cx.clearRect(0,0,W,H);
  if(!reduced){
    while(parts.length<density[mode])parts.push(spawn());
    parts=parts.filter(p=>p.life>0 && p.y>-30 && p.y<H+30);
    for(const p of parts){
      p.x+=p.vx; p.y+=p.vy; p.life-=p.decay;
      if(mode==='ember'){
        cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);
        cx.fillStyle=`hsla(${p.hue},85%,60%,${p.life*.7})`;
        cx.shadowBlur=8;cx.shadowColor='rgba(232,140,40,.8)';
        cx.fill();cx.shadowBlur=0;
      } else if(mode==='dust'){
        cx.beginPath();cx.arc(p.x,p.y,p.r,0,7);
        cx.fillStyle=`rgba(216,184,106,${p.life*.28})`;cx.fill();
      } else if(mode==='static'){
        cx.fillStyle=`rgba(180,230,255,${p.life*.22})`;
        cx.fillRect(p.x,p.y,p.r*2,p.r);
      } else if(mode==='blip'){
        cx.beginPath();cx.arc(p.x,p.y,p.r*p.life,0,7);
        cx.strokeStyle=p.pink?`rgba(255,126,176,${p.life*.5})`:`rgba(127,212,255,${p.life*.5})`;
        cx.lineWidth=1.2;cx.stroke();
      } else if(mode==='glyph'){
        cx.font=p.size+"px ui-monospace,monospace";
        cx.fillStyle=p.teal?`rgba(94,234,212,${p.life*.55})`:`rgba(167,139,250,${p.life*.5})`;
        cx.fillText(p.g,p.x,p.y);
      }
    }
  }
  requestAnimationFrame(tick);
}
tick();
function setEnv(env,fxmode){
  document.body.dataset.env=env;
  if(fxmode&&fxmode!==mode){mode=fxmode;parts=[];}
}

/* ---------- ambient audio: generated, no files, off by default ---------- */
let AC=null, soundOn=false, ambNodes=[];
function ensureAC(){if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();}}
function stopAmb(){ambNodes.forEach(n=>{try{n.stop?n.stop():n.disconnect();}catch(e){}});ambNodes=[];}
function noiseBuffer(){
  const b=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  return b;
}
function amb(env){
  if(!soundOn||!AC)return;
  stopAmb();
  const g=AC.createGain(); g.gain.value=0; g.connect(AC.destination);
  g.gain.linearRampToValueAtTime(0.05,AC.currentTime+1.5);
  ambNodes.push(g);
  if(env==='p0'||env==='title'||env==='end'){
    const n=AC.createBufferSource(); n.buffer=noiseBuffer(); n.loop=true;
    const f=AC.createBiquadFilter(); f.type='bandpass'; f.frequency.value=400; f.Q.value=.6;
    n.connect(f); f.connect(g); n.start(); ambNodes.push(n,f);
    const o=AC.createOscillator(); o.type='sine'; o.frequency.value=70;
    const og=AC.createGain(); og.gain.value=.4; o.connect(og); og.connect(g); o.start(); ambNodes.push(o,og);
  } else if(env==='p1'){
    const n=AC.createBufferSource(); n.buffer=noiseBuffer(); n.loop=true;
    const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=300;
    n.connect(f); f.connect(g); n.start(); ambNodes.push(n,f);
  } else if(env==='p2'){
    const o=AC.createOscillator(); o.type='sawtooth'; o.frequency.value=58;
    const og=AC.createGain(); og.gain.value=.25;
    const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=200;
    o.connect(f); f.connect(og); og.connect(g); o.start(); ambNodes.push(o,og,f);
    const n=AC.createBufferSource(); n.buffer=noiseBuffer(); n.loop=true;
    const nf=AC.createBiquadFilter(); nf.type='highpass'; nf.frequency.value=6000;
    const ng=AC.createGain(); ng.gain.value=.12;
    n.connect(nf); nf.connect(ng); ng.connect(g); n.start(); ambNodes.push(n,nf,ng);
  } else if(env==='p3'){
    const o=AC.createOscillator(); o.type='sine'; o.frequency.value=140;
    const og=AC.createGain(); og.gain.value=.3; o.connect(og); og.connect(g); o.start(); ambNodes.push(o,og);
    const blip=()=>{ if(!soundOn||document.body.dataset.env!=='p3')return;
      const b=AC.createOscillator(); b.type='sine'; b.frequency.value=rnd(700,1400);
      const bg=AC.createGain(); bg.gain.setValueAtTime(.10,AC.currentTime);
      bg.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.25);
      b.connect(bg); bg.connect(AC.destination); b.start(); b.stop(AC.currentTime+.3);
      setTimeout(blip, rnd(900,2600));
    }; setTimeout(blip,800);
  } else if(env==='p4'){
    [110,110.7,165.3].forEach(fq=>{
      const o=AC.createOscillator(); o.type='triangle'; o.frequency.value=fq;
      const og=AC.createGain(); og.gain.value=.22; o.connect(og); og.connect(g); o.start(); ambNodes.push(o,og);
    });
  }
}
function cue(kind){
  if(!soundOn||!AC)return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  if(kind==='choose'){o.type='sine';o.frequency.value=520;g.gain.setValueAtTime(.08,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.18);}
  if(kind==='bad'){o.type='sine';o.frequency.setValueAtTime(300,AC.currentTime);o.frequency.exponentialRampToValueAtTime(140,AC.currentTime+.4);g.gain.setValueAtTime(.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.45);}
  if(kind==='good'){o.type='sine';o.frequency.setValueAtTime(440,AC.currentTime);o.frequency.exponentialRampToValueAtTime(700,AC.currentTime+.25);g.gain.setValueAtTime(.08,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.35);}
  o.start(); o.stop(AC.currentTime+.5);
}
function toggleSound(){
  ensureAC(); AC.resume();
  soundOn=!soundOn;
  const b=document.getElementById('soundBtn');
  b.textContent=soundOn?"SOUND ON":"SOUND OFF";
  b.setAttribute('aria-pressed',soundOn);
  if(soundOn)amb(document.body.dataset.env); else stopAmb();
}

/* ---------- game state ---------- */
const S={
  fid:100, reach:1, human:true,
  words:["The","river","always","returns","to","collect","what","it","has","lent.","Carry","the","children","high,","and","speak","no","word","you","will","not","stand","behind."],
  lost:new Set(), muts:{}, truncated:false, headline:null, round:0
};
let conferenceMode=false;
function fmtReach(n){return n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"k":n;}
function reachPct(){return Math.max(2,Math.min(100,Math.log10(S.reach+1)/8*100));}
function renderHUD(){
  document.getElementById('fidnum').textContent=S.fid;
  document.querySelector('#fidbar i').style.width=S.fid+"%";
  document.getElementById('reachnum').textContent=fmtReach(S.reach);
  document.querySelector('#reachbar i').style.width=reachPct()+"%";
  const flag=document.getElementById('authflag');
  const os=document.getElementById('origstat');
  if(S.human){
    flag.textContent="Origination: human"; flag.classList.remove('none');
    os.classList.remove('none');
    document.getElementById('orignum').textContent="Human";
    document.getElementById('origcap').textContent="Embodied human consciousness";
  } else {
    flag.textContent="Origination: none"; flag.classList.add('none');
    os.classList.add('none');
    document.getElementById('orignum').textContent="None";
    document.getElementById('origcap').textContent="No one stands behind these words";
  }
}
function renderMessage(animLost){
  const m=document.getElementById('message');
  let end=S.truncated?10:S.words.length;
  m.innerHTML=S.words.slice(0,end).map((w,i)=>{
    if(S.lost.has(i))return `<span class="lost ${animLost&&animLost.has(i)?'w-anim':''}">${w}</span>`;
    if(S.muts[i])return `<span class="mut">${S.muts[i]}</span>`;
    return w;
  }).join(" ") + (S.truncated?` <span class="lost">&hellip;[cut for time]</span>`:"");
  const h=document.getElementById('headline');
  if(S.headline){h.textContent=S.headline;h.classList.add('show');}else{h.classList.remove('show');}
}
function degrade(n){
  const idx=[...Array(S.words.length).keys()].filter(i=>!S.lost.has(i)).sort(()=>Math.random()-.5).slice(0,n);
  idx.forEach(i=>S.lost.add(i));
  return new Set(idx);
}

/* ---------- rounds ---------- */
const rounds=[
 {env:'p0',fx:'ember',chip:"Phase I · Primary Orality",title:"The council fire",wipe:"The age of the voice",
  prompt:"No writing exists. The message survives only if minds can hold it across a generation of retellings. How do you shape Saima's words for memory?",
  opts:[
   {t:"Plain prose, as spoken",s:"Honest, but unpatterned.",
    fx(){this._d=degrade(3);S.fid-=14;cue('bad');},
    out:"<b>Words slip into the dark.</b> Without rhythm or formula, three tellings later the message is fraying. \u201cYou know what you can recall\u201d \u2014 and unpatterned prose is hard to recall."},
   {t:"Recast it as rhythmic formula",s:"\u201cThe river returns, returns to collect\u2026\u201d",
    fx(){S.fid-=4;S.muts[2]="returns,";cue('good');},
    out:"<b>The pattern holds.</b> A word shifts here and there, but rhythm and repetition carry the core intact. Oral memory keeps what is built to be kept."},
   {t:"Expand it into the full account",s:"Every detail of the flood, an hour to tell.",
    fx(){this._d=degrade(6);S.fid-=24;cue('bad');},
    out:"<b>Too much to carry.</b> Detail is the first casualty of oral transmission. Tellers keep the kernel and shed the rest \u2014 and they choose which is which, not you."}
  ]},
 {env:'p1',fx:'dust',chip:"Phase II · Literacy & Print",title:"Fix it in space",wipe:"The age of the page",
  prompt:"Writing arrives. The word can now outlive every memory \u2014 if it survives the physical world. How do you preserve it?",
  opts:[
   {t:"One master copy, locked in the meeting hall",s:"Perfect text. Single point of failure.",
    fx(){ if(Math.random()<0.35){this._d=degrade(4);S.fid-=12;this._fire=true;cue('bad');} else {S.fid+=6;S.reach+=20;cue('good');} },
    out(){return this._fire
      ? "<b>Fire in the east wing.</b> The master copy is part ash. What scribes reconstruct from memory carries gaps \u2014 durability was never the same as safety."
      : "<b>The copy endures.</b> Exact wording, verifiable forever. But almost no one has read it. The word is safe and silent.";}},
   {t:"Many hand copies, sent to every town",s:"Resilient. But every copyist is human.",
    fx(){S.muts[6]="that";S.muts[13]="high";S.fid-=7;S.reach+=400;cue('choose');},
    out:"<b>The message spreads \u2014 and drifts.</b> Scribal variants creep in: a \u201cwhat\u201d becomes a \u201cthat.\u201d No single copy is authoritative, but the message cannot be destroyed."},
   {t:"Set it in print",s:"A thousand identical copies.",
    fx(){S.fid+=4;S.reach+=5000;cue('good');},
    out:"<b>Locked in type.</b> Print fixes the exact words across thousands of copies and strips away Saima's voice, her hands, her hesitation. The word gains permanence and loses presence."}
  ]},
 {env:'p2',fx:'static',chip:"Phase III · Secondary Orality",title:"Take it to air",wipe:"The age of the broadcast",
  prompt:"Broadcast can put Saima's words in millions of ears in a single shared moment. The producer is waiting. What goes out?",
  opts:[
   {t:"The full reading, six minutes of airtime",s:"Everything, in context.",
    fx(){S.reach+=900000;cue('good');},
    out:"<b>A nation listens, once.</b> The whole message airs in one shared moment \u2014 communal, present-tense, gone. Those who missed it heard it secondhand."},
   {t:"The soundbite",s:"\u201cThe river always returns\u2026\u201d \u2014 nine seconds.",
    fx(){S.truncated=true;S.fid-=22;S.reach+=40000000;cue('bad');},
    out:"<b>Everyone knows the line now.</b> And only the line. The second half \u2014 the part about standing behind your words \u2014 was cut for time. Reach and completeness traded places."},
   {t:"Decline the broadcast",s:"The message stays whole, and local.",
    fx(){S.fid+=3;S.reach+=200;cue('choose');},
    out:"<b>Intact, and unheard.</b> The word keeps its integrity inside a shrinking circle. Meanwhile the airwaves fill with other people's messages."}
  ]},
 {env:'p3',fx:'blip',chip:"Phase IV · Algorithmic Secondary Orality",title:"Enter the feed",wipe:"The age of the feed",
  prompt:"You post the message. A recommendation system offers to \u201coptimize for engagement.\u201d Every word is still yours \u2014 but circulation no longer is.",
  opts:[
   {t:"Post it exactly as written",s:"Your words, the algorithm's indifference.",
    fx(){S.reach+=1200;cue('choose');},
    out:"<b>Forty-one likes.</b> The message is untouched and nearly invisible. The algorithm owes fidelity nothing; it pays only for engagement."},
   {t:"Accept optimization",s:"New headline, \u201cimproved\u201d framing.",
    fx(){S.headline="She predicted the flood. What this elder said next will stay with you.";S.fid-=15;S.reach+=25000000;cue('bad');},
    out:"<b>It's everywhere.</b> Your words survive beneath a headline you never wrote, framed as content. Humans still authored every sentence \u2014 but the algorithm decided what the message is <i>for</i>."},
   {t:"Post it in fragments across platforms",s:"Each piece tuned to its audience.",
    fx(){S.truncated=true;S.fid-=10;S.reach+=6000000;cue('bad');},
    out:"<b>The message becomes messages.</b> Different audiences receive different fragments in different orders. There is no longer one shared text \u2014 there are personalized symbolic environments."}
  ]}
];

/* ---------- flow ---------- */
function startGame(){
  conferenceMode=false;
  S.round=0; p5done=false;
  transition("The age of the voice",()=>{go('game','p0','ember');showRound();});
}
function startConferenceMode(){
  conferenceMode=true;
  S.round=0; p5done=false;
  transition("Five stages in ninety seconds",()=>{go('game','p0','ember');showRound();});
}
function go(id,env,fxmode){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(env){setEnv(env,fxmode||mode);amb(env);}
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='deep'&&!sortStarted)startSort();
}
function transition(label,then){
  const w=document.getElementById('wipe');
  document.getElementById('wipetext').textContent=label;
  w.classList.add('on');
  const enterDelay=conferenceMode?250:700;
  const exitDelay=conferenceMode?150:350;
  setTimeout(()=>{then();setTimeout(()=>w.classList.remove('on'),exitDelay);},enterDelay);
}
function showRound(){
  renderHUD();renderMessage();
  document.getElementById('outcome').innerHTML='';
  document.getElementById('nextrow').classList.remove('show');
  if(S.round<4){
    const r=rounds[S.round];
    setEnv(r.env,r.fx); amb(r.env);
    document.getElementById('phasechip').textContent=r.chip;
    document.getElementById('roundeyebrow').textContent=(conferenceMode?"90-second journey · Stage ":"Round ")+(S.round+1)+" of 5";
    document.getElementById('roundtitle').textContent=r.title;
    document.getElementById('roundprompt').textContent=r.prompt;
    const wrap=document.getElementById('opts');
    wrap.style.display='flex'; wrap.innerHTML='';
    r.opts.forEach(o=>{
      const b=document.createElement('button');
      b.innerHTML=o.t+`<small>${o.s}</small>`;
      b.onclick=()=>{
        [...wrap.children].forEach(c=>c.disabled=true);
        o.fx();
        S.fid=Math.max(5,Math.min(100,S.fid));
        renderHUD();renderMessage(o._d);
        document.getElementById('outcome').innerHTML=(typeof o.out==='function'?o.out():o.out);
        document.getElementById('nextrow').classList.add('show');
      };
      wrap.appendChild(b);
    });
  } else {
    startPhase5();
  }
}
function advance(){
  S.round++;
  const labels=["","The age of the page","The age of the broadcast","The age of the feed","The age of the machine"];
  transition(labels[S.round]||"",()=>showRound());
}

/* ---------- phase 5: the rules change ---------- */
let clock=10, clockTimer=null, p5done=false;
function startPhase5(){
  setEnv('p4','glyph'); amb('p4');
  document.getElementById('phasechip').textContent="Phase V · Tertiary Algorithmicity";
  document.getElementById('roundeyebrow').textContent="Round 5 of 5 — the rules change";
  document.getElementById('roundtitle').textContent="The flood of versions";
  document.getElementById('roundprompt').textContent="Something new: the network is generating retellings of your message. Several are word-perfect. Only one was written by a person. You have ten seconds to find it before the synthetic versions become the record.";
  document.getElementById('opts').style.display='none';
  document.getElementById('flood').classList.add('show');
  const human={t:"\u201cI carried my sister up that hill. Saima made me repeat the line until I cried. Speak no word you will not stand behind \u2014 she meant it about me, specifically.\u201d",h:true};
  const machines=[
    {t:"\u201cThe river always returns to collect what it has lent. Carry the children high, and speak no word you will not stand behind.\u201d",h:false,note:"word-perfect"},
    {t:"\u201cAs the wise elder Saima reminds us, rivers embody nature's timeless cycle of giving and reclaiming \u2014 a lesson in accountability for every generation.\u201d",h:false},
    {t:"\u201cThe river always returns to collect what it has lent. Carry the children high, and speak no word you will not stand behind.\u201d",h:false,note:"word-perfect"}
  ];
  const all=[human,...machines].sort(()=>Math.random()-.5);
  const wrap=document.getElementById('variants');
  wrap.innerHTML='';
  all.forEach(v=>{
    const b=document.createElement('button');
    b.innerHTML=v.t+`<span class="vt ${v.h?'h':'m'}">${v.h?'Human-authored — situated, embodied, accountable':'Machine-generated'+(v.note?' — identical to the original, authored by no one':' — fluent, weightless')}</span>`;
    b.onclick=()=>resolveP5(v.h,b,wrap);
    wrap.appendChild(b);
  });
  clock=10;
  const ce=document.getElementById('clock');
  ce.textContent=clock; ce.classList.remove('urgent');
  clockTimer=setInterval(()=>{
    clock--; ce.textContent=Math.max(0,clock);
    if(clock<=3)ce.classList.add('urgent');
    if(clock<=3&&clock>0)cue('choose');
    if(clock<=0)resolveP5(null,null,wrap);
  },1000);
}
function resolveP5(pickedHuman,btn,wrap){
  if(p5done)return; p5done=true;
  clearInterval(clockTimer);
  [...wrap.children].forEach(c=>{c.disabled=true;c.classList.add('reveal');});
  let out;
  if(pickedHuman===true){
    btn.classList.add('right'); S.human=true; cue('good');
    out="<b>You found the body in the text.</b> Not the perfect wording \u2014 the shaking hands, the named sister, the stakes. Notice what just happened: two synthetic versions had <i>higher fidelity</i> than the human one. Fidelity stopped being the test.";
  } else {
    if(btn)btn.classList.add('wrong');
    S.human=false; cue('bad');
    if(pickedHuman===false && btn && btn.textContent.includes("river always returns")){S.fid=100;}
    out=pickedHuman===null
      ? "<b>Time ran out.</b> The synthetic versions enter the record by default \u2014 saturation doesn't need your permission. The message survives, word-perfect, and no one wrote it."
      : "<b>You chose a perfect copy.</b> Fidelity: flawless. Origination: none. For four rounds this game trained you to protect the words \u2014 and the words were never the thing most at risk.";
    [...wrap.children].find(c=>c.querySelector('.vt.h')).classList.add('right');
  }
  renderHUD();
  document.getElementById('outcome').innerHTML=out;
  document.getElementById('nextrow').classList.add('show');
  const nb=document.getElementById('nextbtn');
  nb.textContent="See what survived \u2192";
  nb.onclick=()=>transition("What survived",showFinale);
}

/* ---------- finale ---------- */
function showFinale(){
  go('finale','end','ember');
  document.getElementById('endtitle').textContent=S.human?"The word, still carried":"The word, still circulating";
  const ea1=document.getElementById('endauth');
  ea1.textContent=S.human?"ORIGINATION: HUMAN — someone still stands behind these words":"ORIGINATION: NONE — these words stand behind no one";
  ea1.classList.toggle('none',!S.human);
  let end=S.truncated?10:S.words.length;
  document.getElementById('endmessage').innerHTML=S.words.slice(0,end).map((w,i)=>{
    if(S.lost.has(i))return `<span style="opacity:.4;text-decoration:line-through">${w}</span>`;
    if(S.muts[i])return `<span style="color:#e07a7a;font-style:italic">${S.muts[i]}</span>`;
    return w;
  }).join(" ")+(S.truncated?" \u2026":"");
  document.getElementById('endfid').textContent=S.fid+"%";
  document.getElementById('endreach').textContent=fmtReach(S.reach);
  const ea=document.getElementById('endauthor');
  ea.textContent=S.human?"Human":"None";
  ea.className=S.human?"good":"bad";
  document.getElementById('endthesis').innerHTML=
    S.fid>=80
    ? "You protected the words well. Across three of Ong's phases and into the algorithmic ones, every transformation of the medium forced a trade \u2014 memory against detail, permanence against presence, reach against wholeness."
    : "The message arrived worn \u2014 words lost to memory, scribes, soundbites, and headlines. That wearing is not failure; it is what every medium has always charged for carriage.";
}

/* ---------- deep dive: phase sort quiz ---------- */
const PH=["Primary Orality","Literacy & Print","Secondary Orality","Algorithmic Secondary Orality","Tertiary Algorithmicity"];
const scenarios=[
  {t:"A griot recites a community's genealogy at a gathering; nothing is written, and each telling shifts slightly with the audience.",a:0,why:"Voice only, ephemeral, face-to-face. Variation between tellings is a feature of oral composition, not an error."},
  {t:"A scholar silently reads a printed encyclopedia, using the alphabetical index to jump straight to an entry.",a:1,why:"Indexes, silent reading, and random access are creatures of writing and print — words locked into visual space."},
  {t:"Families across a country gather around radios at the same hour to hear a leader's address.",a:2,why:"Electronic voice, simultaneous mass audience, one shared symbolic moment: the signature of secondary orality."},
  {t:"A student's short-video feed surfaces a stranger's study-tips clip; her friend's feed, the same evening, never shows it.",a:3,why:"A human made the clip. The algorithm decided who lives in which symbolic environment. Curation, not creation, changed hands."},
  {t:"A chatbot drafts a complete five-paragraph essay; no person composed any of its sentences.",a:4,why:"The symbolic content originates with an algorithm. Human authorship has become optional — the defining mark of tertiary algorithmicity."},
  {t:"An epic poet builds long passages from stock epithets — \u201cswift-footed,\u201d \u201cwine-dark\u201d — that recur across performances.",a:0,why:"Formulaic composition is oral memory technology: patterns assembled live because nothing can be looked up."},
  {t:"Millions watch a moon landing on live television, knowing everyone else is watching the same images at the same instant.",a:2,why:"Broadcast simultaneity at planetary scale — communal, present-tense, and still entirely human-authored."},
  {t:"Two synthetic podcast hosts, generated end to end, discuss a novel in convincing conversational audio.",a:4,why:"It sounds like secondary orality, but no humans speak. Modality no longer decides the phase; origination does."},
  {t:"A monk hand-copies a manuscript so a reader in another century can study the exact words.",a:1,why:"Chirographic culture: the word made durable and distanced, addressed to readers the writer will never meet."},
  {t:"A human-made joke image spreads to millions because a recommendation engine keeps boosting it into new feeds.",a:3,why:"Human creation, algorithmic circulation. The engine amplifies and targets, but it did not write the joke. One step short of the rupture."}
];
let sortStarted=false, si=0, score=0;
function startSort(){
  sortStarted=true; si=0; score=0;
  scenarios.sort(()=>Math.random()-.5);
  showScenario();
}
function showScenario(){
  const s=scenarios[si];
  document.getElementById('sortcounter').textContent=`SCENARIO ${si+1} OF ${scenarios.length}`;
  document.getElementById('scenariotext').textContent=s.t;
  document.getElementById('sortfeedback').textContent='';
  document.getElementById('sortnext').style.display='none';
  const wrap=document.getElementById('phasebtns');
  wrap.innerHTML='';
  PH.forEach((p,idx)=>{
    const b=document.createElement('button');
    b.textContent=p;
    b.onclick=()=>answerSort(idx,b);
    wrap.appendChild(b);
  });
  document.getElementById('scorebar').textContent=`SCORE ${score} / ${si}`;
}
function answerSort(idx,btn){
  const s=scenarios[si];
  [...document.getElementById('phasebtns').children].forEach(c=>c.disabled=true);
  const right=idx===s.a;
  if(right){score++;btn.classList.add('right');cue('good');}
  else{btn.classList.add('wrong');document.getElementById('phasebtns').children[s.a].classList.add('right');cue('bad');}
  document.getElementById('sortfeedback').innerHTML=`<b>${right?'Correct':'Not quite'} — ${PH[s.a]}.</b> ${s.why}`;
  document.getElementById('scorebar').textContent=`SCORE ${score} / ${si+1}`;
  if(si<scenarios.length-1)document.getElementById('sortnext').style.display='inline-block';
  else document.getElementById('sortfeedback').innerHTML+=`<br><br><b>Final: ${score} of ${scenarios.length}.</b> The boundary cases are hard by design — the line between phases is the argument.`;
}
function nextScenario(){si++;showScenario();}

if(conferenceRequested){
  startConferenceMode();
}

// PipelineZero app.js v2.0 — single-page lesson renderer
'use strict';

// ── STATE ────────────────────────────────────────────────────
const State = {
  completed: JSON.parse(localStorage.getItem('pz_completed')||'[]'),
  streak:    parseInt(localStorage.getItem('pz_streak')||'0'),
  lastSess:  localStorage.getItem('pz_last_session')||'',
  xp:        parseInt(localStorage.getItem('pz_xp')||'0'),
  currentTopic:  null,
  currentLesson: null,
  save(){
    localStorage.setItem('pz_completed', JSON.stringify(this.completed));
    localStorage.setItem('pz_streak',    this.streak);
    localStorage.setItem('pz_xp',        this.xp);
  },
  isComplete(id){ return this.completed.includes(id); },
  markComplete(id,xp){
    if(!this.completed.includes(id)){
      this.completed.push(id);
      this.xp += (xp||100);
      this.save();
    }
  },
  updateStreak(){
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now()-86400000).toDateString();
    if(this.lastSess !== today){
      this.streak = (this.lastSess === yesterday) ? this.streak+1 : 1;
      this.lastSess = today;
      localStorage.setItem('pz_last_session', today);
      localStorage.setItem('pz_streak', this.streak);
    }
  }
};

// ── TOPIC REGISTRY ───────────────────────────────────────────
const TOPICS = [];
window.registerTopic = d => TOPICS.push(d);

// ── HELPERS ──────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const el = (t,c,h) => { const e=document.createElement(t); if(c)e.className=c; if(h)e.innerHTML=h; return e; };

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const s=$(id); if(s){ s.classList.add('active'); }
  const rp=document.querySelector('.right-panel'); if(rp) rp.scrollTop=0;
}

function toast(msg,type='info'){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=el('div',`toast ${type}`,msg);
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2800);
}

function copyText(text, el){
  navigator.clipboard.writeText(text).then(()=>{
    el.classList.add('copied');
    setTimeout(()=>el.classList.remove('copied'),1400);
    toast('📋 Copied!','info');
  }).catch(()=>{ toast('Could not copy','info'); });
}

function confetti(){
  const colors=['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];
  for(let i=0;i<36;i++){
    const p=document.createElement('div');
    p.style.cssText=`position:fixed;top:${Math.random()*30-10}%;left:${Math.random()*100}%;width:${6+Math.random()*7}px;height:${6+Math.random()*7}px;background:${colors[Math.floor(Math.random()*5)]};border-radius:${Math.random()>.5?'50%':'2px'};z-index:9999;pointer-events:none;animation:confettiFall ${1.4+Math.random()*1.4}s ease forwards;animation-delay:${Math.random()*.4}s`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),3000);
  }
}

// ── SIDEBAR ──────────────────────────────────────────────────
let sidebarOpen = true;

window.toggleSidebar = function(){
  sidebarOpen = !sidebarOpen;
  const panel = document.querySelector('.left-panel');
  const overlay = document.querySelector('.left-panel-overlay');
  const btn = $('btn-map');
  if(window.innerWidth <= 900){
    panel.classList.toggle('mobile-open', sidebarOpen);
    overlay.classList.toggle('show', sidebarOpen);
  } else {
    panel.classList.toggle('collapsed', !sidebarOpen);
  }
  if(btn) btn.classList.toggle('active', sidebarOpen);
};

function closeOverlay(){
  if(window.innerWidth <= 900){
    sidebarOpen = false;
    document.querySelector('.left-panel').classList.remove('mobile-open');
    document.querySelector('.left-panel-overlay').classList.remove('show');
  }
}

function buildSidebar(){
  const sc = $('sidebar-content'); if(!sc) return;
  sc.innerHTML = '';
  let lastTier = null;
  TOPICS.forEach(topic=>{
    if(topic.tier !== lastTier){
      sc.appendChild(el('div','tier-pill',`Tier ${topic.tier} — ${topic.tier===1?'Core Skills':'Advanced'}`));
      lastTier = topic.tier;
    }
    const done = topic.lessons.filter(l=>State.isComplete(l.id)).length;
    const total = topic.lessons.length;
    const isActive = State.currentTopic === topic.id;
    const btn = el('div',`nav-btn${isActive?' active':''}${done===total?' done':''}`,
      `<span class="ni">${topic.icon}</span><span class="nt">${topic.name}</span><span class="np">${done}/${total}</span>`);
    btn.onclick = ()=>{ navigateTopic(topic.id); closeOverlay(); };
    sc.appendChild(btn);
  });
}

function updateTopbar(){
  const total = TOPICS.reduce((a,t)=>a+t.lessons.length,0);
  const done  = State.completed.length;
  const pct   = total ? Math.round(done/total*100) : 0;
  const fill  = $('topbar-prog-fill');
  const label = $('topbar-prog-label');
  const streak = $('topbar-streak-count');
  const xpEl  = $('topbar-xp');
  if(fill)   fill.style.width = pct+'%';
  if(label)  label.textContent = `${done} / ${total} lessons`;
  if(streak) streak.textContent = State.streak;
  if(xpEl)   xpEl.textContent = State.xp.toLocaleString()+' XP';
}

// ── NAVIGATION ───────────────────────────────────────────────
window.navigateTo = function(screen){
  switch(screen){
    case 'home':          renderHome();    break;
    case 'map':           renderMap();     break;
    case 'prerequisites': renderPrereqs(); break;
  }
};

window.navigateTopic = function(topicId){
  const topic = TOPICS.find(t=>t.id===topicId); if(!topic) return;
  State.currentTopic = topicId;
  buildSidebar();
  renderTopicPage(topic);
};

window.navigateLesson = function(topicId, lessonId){
  const topic  = TOPICS.find(t=>t.id===topicId);   if(!topic)  return;
  const lesson = topic.lessons.find(l=>l.id===lessonId); if(!lesson) return;
  State.currentTopic  = topicId;
  State.currentLesson = lessonId;
  buildSidebar();
  renderLessonPage(topic, lesson);
};

// ── HOME ─────────────────────────────────────────────────────
function renderHome(){
  showScreen('screen-home');
  let currLesson=null, currTopic=null;
  for(const topic of TOPICS){
    for(const lesson of topic.lessons){
      if(!State.isComplete(lesson.id)){ currLesson=lesson; currTopic=topic; break; }
    }
    if(currLesson) break;
  }
  const total = TOPICS.reduce((a,t)=>a+t.lessons.length,0);
  const done  = State.completed.length;
  const pct   = total ? Math.round(done/total*100) : 0;
  const setEl = (id,v) => { const e=$(id); if(e) e.textContent=v; };
  setEl('home-done', done);
  setEl('home-pct',  pct+'%');
  setEl('home-xp',   State.xp.toLocaleString());
  const cc = $('curr-card');
  if(cc && currLesson){
    cc.querySelector('.curr-tag').textContent  = `▶ Continue — ${currTopic.name}`;
    cc.querySelector('.curr-title').textContent = currLesson.title;
    cc.querySelector('.curr-meta').textContent  = `${currLesson.time} · ${currLesson.type}`;
    cc.onclick = ()=>navigateLesson(currTopic.id, currLesson.id);
  }
  updateTopbar();
}

// ── MAP ──────────────────────────────────────────────────────
function renderMap(){
  showScreen('screen-map');
  const g1=$('map-grid-t1'), g2=$('map-grid-t2');
  if(!g1||!g2) return;
  g1.innerHTML=''; g2.innerHTML='';
  TOPICS.forEach(topic=>{
    const done  = topic.lessons.filter(l=>State.isComplete(l.id)).length;
    const total = topic.lessons.length;
    const pct   = total ? Math.round(done/total*100) : 0;
    const allDone = done===total;
    const hasSome = done>0;
    const card = el('div',`map-card${allDone?' done':''}`,`
      <div class="mc-icon">${topic.icon}</div>
      <div class="mc-name">${topic.name}</div>
      <div class="mc-count">${done}/${total} lessons</div>
      <div class="mc-bar"><div class="mc-fill" style="width:${pct}%"></div></div>
      ${allDone?'<span class="mc-badge done">✓ Done</span>':hasSome?'<span class="mc-badge prog">In Progress</span>':''}
    `);
    card.onclick = ()=>navigateTopic(topic.id);
    (topic.tier===1 ? g1 : g2).appendChild(card);
  });
}

// ── PREREQS ──────────────────────────────────────────────────
const PREREQS=[
  {id:'wsl2',      icon:'🪟', name:'WSL2 (Windows only)', time:'10 min', desc:'Gives Windows a real Linux terminal. Mac/Linux users skip this.', install:'wsl --install', verify:'wsl --list --verbose'},
  {id:'docker',    icon:'🐳', name:'Docker Desktop',       time:'5 min',  desc:'Runs containers locally. Required for all Docker and K8s labs.', install:'# Download from https://www.docker.com/products/docker-desktop', verify:'docker --version'},
  {id:'kubectl',   icon:'☸',  name:'kubectl',              time:'3 min',  desc:'CLI to control Kubernetes clusters.', install:'# Mac: brew install kubectl\n# Windows: winget install Kubernetes.kubectl', verify:'kubectl version --client'},
  {id:'minikube',  icon:'🖥️', name:'minikube',             time:'5 min',  desc:'Local K8s cluster on your laptop for labs.', install:'# Mac: brew install minikube\n# Windows: winget install Kubernetes.minikube', verify:'minikube start'},
  {id:'helm',      icon:'⎈',  name:'Helm',                 time:'2 min',  desc:'Kubernetes package manager.', install:'# Mac: brew install helm\n# Windows: winget install Helm.Helm', verify:'helm version'},
  {id:'terraform', icon:'🏗️', name:'Terraform',            time:'3 min',  desc:'Infrastructure as Code tool.', install:'# Mac: brew tap hashicorp/tap && brew install hashicorp/tap/terraform\n# Windows: winget install HashiCorp.Terraform', verify:'terraform version'},
  {id:'git',       icon:'🌿', name:'Git',                  time:'2 min',  desc:'Version control — you likely have this.', install:'# Windows: winget install Git.Git', verify:'git --version'},
  {id:'python',    icon:'🐍', name:'Python 3',             time:'3 min',  desc:'For Python lessons and running local server.', install:'# Mac: brew install python3\n# Windows: winget install Python.Python.3', verify:'python3 --version'},
  {id:'vscode',    icon:'📝', name:'VS Code + Extensions', time:'5 min',  desc:'Recommended editor with K8s, Docker, YAML support.', install:'# Download https://code.visualstudio.com\ncode --install-extension ms-kubernetes-tools.vscode-kubernetes-tools\ncode --install-extension redhat.vscode-yaml\ncode --install-extension ms-azuretools.vscode-docker', verify:'code --version'},
  {id:'azurecli',  icon:'☁️', name:'Azure CLI',            time:'3 min',  desc:'For AKS and Azure lessons.', install:'# Mac: brew install azure-cli\n# Windows: winget install Microsoft.AzureCLI', verify:'az --version'},
];
let prereqDone = JSON.parse(localStorage.getItem('pz_prereqs')||'[]');

function renderPrereqs(){
  showScreen('screen-prereqs');
  const grid=$('prereq-grid'); if(!grid) return;
  grid.innerHTML='';
  PREREQS.forEach(p=>{
    const done = prereqDone.includes(p.id);
    const card = el('div',`prereq-card${done?' done':''}`,`
      <div class="prereq-hdr">
        <span class="prereq-icon">${p.icon}</span>
        <span class="prereq-name">${p.name}</span>
        <span class="prereq-time">${p.time}</span>
        <div class="prereq-check${done?' done':''}" data-id="${p.id}">${done?'✓':''}</div>
      </div>
      <div class="prereq-desc">${p.desc}</div>
      <code class="prereq-cmd" data-cmd="${p.install.replace(/"/g,'&quot;')}">${p.install.replace(/\n/g,'<br>')}</code>
      <div class="prereq-verify">Verify: <code>${p.verify}</code></div>
    `);
    card.querySelector('.prereq-check').onclick = ()=>{
      prereqDone = done ? prereqDone.filter(x=>x!==p.id) : [...prereqDone,p.id];
      localStorage.setItem('pz_prereqs',JSON.stringify(prereqDone));
      if(!done) toast(`✅ ${p.name} marked installed`,'success');
      renderPrereqs();
    };
    card.querySelector('.prereq-cmd').onclick = e=>{
      copyText(p.install.replace(/<br>/g,'\n'), e.currentTarget);
    };
    grid.appendChild(card);
  });
  const cnt=$('prereq-count'); if(cnt) cnt.textContent=`${prereqDone.length}/${PREREQS.length} installed`;
}

// ── TOPIC PAGE ───────────────────────────────────────────────
function renderTopicPage(topic){
  showScreen('screen-topic');
  const hdr=$('topic-hdr'), list=$('topic-lesson-list');
  if(!hdr||!list) return;
  hdr.innerHTML=`
    <div class="topic-hdr-icon">${topic.icon}</div>
    <div class="topic-hdr-title">${topic.name}</div>
    <div class="topic-hdr-desc">${topic.desc}</div>`;
  list.innerHTML='';
  const certMap={cka:'CKA',az400:'AZ-400',aws:'AWS Pro',lfcs:'LFCS'};
  topic.lessons.forEach((lesson,idx)=>{
    const done = State.isComplete(lesson.id);
    const firstInc = topic.lessons.findIndex(l=>!State.isComplete(l.id));
    const isCurr = idx === firstInc;
    const isLocked = !done && !isCurr && idx > firstInc;
    const certs = (lesson.certs||[]).map(c=>`<span class="cert-badge cb-${c}">${certMap[c]||c}</span>`).join('');
    const row = el('div',`lesson-row${done?' done':isCurr?' curr':isLocked?' locked':''}`,`
      <div class="lr-num">${done?'✓':isCurr?'▶':isLocked?'🔒':idx+1}</div>
      <div class="lr-info">
        <div class="lr-title">${lesson.title}</div>
        <div class="lr-sub">${lesson.subtitle||''}</div>
        <div class="lr-certs">${certs}</div>
      </div>
      <div class="lr-meta">
        <span class="type-pill tp-${lesson.type}">${lesson.type}</span>
        <span class="lr-time">${lesson.time}</span>
      </div>`);
    if(!isLocked) row.onclick = ()=>navigateLesson(topic.id, lesson.id);
    list.appendChild(row);
  });
}

// ── LESSON PAGE — SINGLE SCROLLABLE PAGE ─────────────────────
function renderLessonPage(topic, lesson){
  showScreen('screen-lesson');
  const container = $('lesson-page-container'); if(!container) return;

  const certMap = {cka:'🎯 CKA',az400:'☁ AZ-400',aws:'🟠 AWS Pro',lfcs:'🐧 LFCS'};
  const certBadges = (lesson.certs||[]).map(c=>`<span class="cert-badge cb-${c}">${certMap[c]||c}</span>`).join('');
  const isDone = State.isComplete(lesson.id);

  // Find prev/next lessons
  const allLessons = [];
  TOPICS.forEach(t=>t.lessons.forEach(l=>allLessons.push({topic:t,lesson:l})));
  const currIdx = allLessons.findIndex(x=>x.lesson.id===lesson.id);
  const prev = currIdx > 0 ? allLessons[currIdx-1] : null;
  const next = currIdx < allLessons.length-1 ? allLessons[currIdx+1] : null;

  let html = `
    <div class="lesson-page">
      <!-- Header -->
      <div class="lesson-pg-header">
        <div class="lpg-nav">
          <button class="btn-back" onclick="navigateTopic('${topic.id}')">← ${topic.name}</button>
          <span class="lpg-breadcrumb">
            <span>${topic.name}</span><span class="sep">›</span>
            <span class="curr">${lesson.title}</span>
          </span>
          <button class="lpg-mark-done${isDone?' done':''}" id="mark-done-btn" onclick="markLessonDone('${topic.id}','${lesson.id}',${lesson.xp||100})">
            ${isDone?'✅ Completed':'○ Mark as Complete'}
          </button>
        </div>
        <span class="lpg-phase-badge phase-${topic.id}">${topic.name}</span>
        <div class="lpg-title">${lesson.title}</div>
        <div class="lpg-subtitle">${lesson.subtitle||''}</div>
        <div class="lpg-meta">
          <span>⏱ ${lesson.time}</span>
          <span>+${lesson.xp||100} XP</span>
          <span class="type-pill tp-${lesson.type}">${lesson.type}</span>
        </div>
        <div class="lpg-certs">${certBadges}</div>
      </div>`;

  // ANIMATION
  if(lesson.animationId && window.ANIMATIONS && window.ANIMATIONS[lesson.animationId]){
    html += `<div class="anim-area" id="anim-mount-${lesson.id}">
      <div style="color:var(--text3);font-size:12px">Loading animation...</div>
    </div>`;
  }

  // CONCEPT SECTION
  if(lesson.concept){
    html += `<div class="ls-section">
      <div class="ls-section-title"><span class="ls-icon">📖</span> What Is It & Why It Matters</div>
      <div class="concept-block">
        <div class="cb-plain">
          <div class="cb-plain-label">Plain English</div>
          <div class="cb-plain-text">${lesson.concept.plain}</div>
        </div>
        <div class="cb-analogy">
          <div class="cb-analogy-label">💡 Think of it like this</div>
          <div class="cb-analogy-text">${lesson.concept.analogy}</div>
        </div>
        <div class="cb-deep">
          <div class="cb-deep-label">Technical Detail</div>
          <div class="cb-deep-text">${lesson.concept.technical}</div>
        </div>
      </div>
    </div>`;
  }

  // COMMAND REFERENCE
  if(lesson.commands && lesson.commands.length){
    html += `<div class="ls-section">
      <div class="ls-section-title"><span class="ls-icon">📋</span> Complete Command Reference</div>
      <table class="cmd-table">
        <thead><tr>
          <th style="width:32%">Command</th>
          <th style="width:38%">What it does & when to use it</th>
          <th style="width:15%">Example output</th>
          <th style="width:10%">Level</th>
        </tr></thead>
        <tbody>
          ${lesson.commands.map((c,ci)=>`
          <tr>
            <td><div class="cmd-cell" id="cmd-cell-${ci}" onclick="copyText('${c.cmd.replace(/'/g,"\\'")}',this)">
              <code>${escH(c.cmd)}</code>
              <span class="copy-hint">⎘ copy</span>
            </div></td>
            <td><div class="cmd-desc">${c.desc}</div>
                <div class="cmd-when">📍 ${c.when}</div></td>
            <td><code style="font-size:10px;color:var(--text3)">${escH(c.example||'')}</code></td>
            <td><span class="cmd-level-pill cl-${c.level||'basic'}">${c.level||'basic'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  // LAB
  if(lesson.lab){
    const lab = lesson.lab;
    html += `<div class="ls-section">
      <div class="ls-section-title"><span class="ls-icon">🛠</span> Hands-On Lab</div>
      <div class="lab-block">
        <div class="lab-hdr">
          <div class="lab-tag">🧪 Lab</div>
          <div class="lab-title">${lab.title}</div>
          <div class="lab-scenario">${lab.scenario}</div>
        </div>
        <div class="lab-platform">
          <button class="btn-laptop" onclick="toast('Open your terminal and follow the steps below','info')">💻 Run on my laptop</button>
          <button class="btn-cloud" onclick="window.open('${lab.cloudUrl||'https://killercoda.com'}','_blank')">☁ Cloud playground ↗</button>
        </div>
        <div class="lab-steps-body">
          ${lab.steps.map((s,si)=>`
          <div class="lab-step">
            <div class="lab-step-n${s.isBreak?' brk':''}">${s.isBreak?'🔥':si+1}</div>
            <div class="lab-step-content">
              <div class="lab-step-title">${s.title}${s.isBreak?' <span style="color:var(--red);font-size:11px">(break it on purpose!)</span>':''}</div>
              ${s.desc?`<div class="lab-step-desc">${s.desc}</div>`:''}
              ${s.cmd?`<code class="lab-cmd-line" onclick="copyText('${s.cmd.replace(/'/g,"\\'").replace(/\n/g,'\\n')}',this)">${escH(s.cmd).replace(/\n/g,'<br>')}</code>`:''}
              ${s.expected?`<div class="lab-expected">Expected: ${s.expected}</div>`:''}
              ${s.isBreak?`<div class="lab-break-warn">⚠ This step intentionally breaks something — diagnose it. That is the real learning.</div>`:''}
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  // EXERCISES
  if(lesson.exercises && lesson.exercises.length){
    html += `<div class="ls-section">
      <div class="ls-section-title"><span class="ls-icon">❓</span> Exercises — Test Yourself</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Click any question to reveal the answer. Try answering first.</div>
      ${lesson.exercises.map((ex,ei)=>`
      <div class="exercise-item">
        <div class="ex-question" onclick="toggleEx('ex-${lesson.id}-${ei}','ex-chev-${lesson.id}-${ei}')">
          <div>
            <div class="ex-q-label">Exercise ${ei+1}</div>
            <div class="ex-q-text">${ex.q}</div>
            <span class="ex-level ${ex.level==='basic'?'cl-basic':ex.level==='intermediate'?'cl-intermediate':'cl-advanced'}">${ex.level||'basic'}</span>
          </div>
          <span class="ex-chevron" id="ex-chev-${lesson.id}-${ei}">▾</span>
        </div>
        <div class="ex-answer" id="ex-${lesson.id}-${ei}">
          <div class="ex-answer-label">✅ Answer</div>
          <div class="ex-answer-body">${ex.a}</div>
        </div>
      </div>`).join('')}
    </div>`;
  }

  // INTERVIEW Q&A
  if(lesson.interview && lesson.interview.length){
    html += `<div class="ls-section">
      <div class="ls-section-title"><span class="ls-icon">🎯</span> Interview Q&A</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:12px">Real questions asked in interviews. Click to reveal model answers.</div>
      ${lesson.interview.map((iq,ii)=>`
      <div class="iq-item">
        <div class="iq-question" onclick="toggleIQ('iq-${lesson.id}-${ii}','iq-chev-${lesson.id}-${ii}')">
          <div>
            <span class="iq-q-level ql-${iq.level||'intermediate'}">${iq.level||'intermediate'}</span>
            <div class="iq-q-text">${iq.q}</div>
          </div>
          <span class="iq-chevron" id="iq-chev-${lesson.id}-${ii}">▾</span>
        </div>
        <div class="iq-answer" id="iq-${lesson.id}-${ii}">
          <div class="iq-answer-body">${iq.a}</div>
          ${iq.trap?`<div class="iq-trap"><div class="iq-trap-label">⚠ Common trap — where most candidates fail:</div>${iq.trap}</div>`:''}
        </div>
      </div>`).join('')}
    </div>`;
  }

  // FURTHER READING
  if(lesson.resources && lesson.resources.length){
    html += `<div class="ls-section">
      <div class="ls-section-title"><span class="ls-icon">📚</span> Further Reading</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${lesson.resources.map(r=>`
        <a href="${r.url}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:9px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--accent);transition:background .15s" onmouseover="this.style.background='var(--bg4)'" onmouseout="this.style.background='var(--bg3)'">
          🔗 ${r.label}
        </a>`).join('')}
      </div>
    </div>`;
  }

  // BOTTOM NAV
  html += `
    <div class="lesson-pg-nav">
      ${prev?`<button class="btn-lesson-nav btn-lesson-prev" onclick="navigateLesson('${prev.topic.id}','${prev.lesson.id}')">← ${prev.lesson.title}</button>`:'<div></div>'}
      ${next?`<button class="btn-lesson-nav btn-lesson-next" onclick="navigateLesson('${next.topic.id}','${next.lesson.id}')">${next.lesson.title} →</button>`:'<div></div>'}
    </div>
  </div>`;

  container.innerHTML = html;

  // Mount animation after render
  if(lesson.animationId && window.ANIMATIONS && window.ANIMATIONS[lesson.animationId]){
    requestAnimationFrame(()=>{
      const mount = $(`anim-mount-${lesson.id}`);
      if(mount) window.ANIMATIONS[lesson.animationId](mount);
    });
  }
}

function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Toggle exercise answer
window.toggleEx = function(answerId, chevId){
  const a = $(answerId); const c = $(chevId);
  if(a){ a.classList.toggle('open'); }
  if(c){ c.classList.toggle('open'); }
};

// Toggle interview answer
window.toggleIQ = function(answerId, chevId){
  const a = $(answerId); const c = $(chevId);
  if(a){ a.classList.toggle('open'); }
  if(c){ c.classList.toggle('open'); }
};

// Mark lesson done
window.markLessonDone = function(topicId, lessonId, xp){
  State.markComplete(lessonId, xp);
  State.updateStreak();
  State.save();
  updateTopbar();
  const btn = $('mark-done-btn');
  if(btn){ btn.textContent='✅ Completed'; btn.classList.add('done'); }
  toast(`🎉 +${xp} XP earned!`,'success');
  confetti();
};

// Copy helper exposed globally
window.copyText = copyText;

// ── PREREQUISITES ────────────────────────────────────────────
window.renderPrereqs = renderPrereqs;

// ── INIT ─────────────────────────────────────────────────────
function init(){
  if(window.FOUNDATION_DATA)  registerTopic(window.FOUNDATION_DATA);
  if(window.CONTAINERS_DATA)  registerTopic(window.CONTAINERS_DATA);
  if(window.KUBERNETES_DATA)  registerTopic(window.KUBERNETES_DATA);
  if(window.CICD_DATA)        registerTopic(window.CICD_DATA);
  if(window.IAC_DATA)         registerTopic(window.IAC_DATA);
  if(window.OBSERVABILITY_DATA) registerTopic(window.OBSERVABILITY_DATA);
  if(window.DEVSECOPS_DATA)   registerTopic(window.DEVSECOPS_DATA);
  if(window.PYTHON_DATA)      registerTopic(window.PYTHON_DATA);
  if(window.CLOUD_DATA)       registerTopic(window.CLOUD_DATA);
  if(window.PLATFORM_DATA)    registerTopic(window.PLATFORM_DATA);
  if(window.SRE_DATA)         registerTopic(window.SRE_DATA);
  if(window.AIOPS_DATA)       registerTopic(window.AIOPS_DATA);
  if(window.INTERVIEW_DATA)   registerTopic(window.INTERVIEW_DATA);

  buildSidebar();
  updateTopbar();
  renderHome();

  const btnMap = $('btn-map');
  if(btnMap) btnMap.onclick = toggleSidebar;
  const btnHome = $('btn-home');
  if(btnHome) btnHome.onclick = ()=>navigateTo('home');
  const overlay = document.querySelector('.left-panel-overlay');
  if(overlay) overlay.onclick = closeOverlay;
}

document.addEventListener('DOMContentLoaded', init);
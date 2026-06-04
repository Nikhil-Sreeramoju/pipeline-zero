// ============================================================
// PipelineZero — app.js
// Core application: routing, progress, lesson engine
// ============================================================

'use strict';

// ── STATE ────────────────────────────────────────────────────
const State = {
  completed: JSON.parse(localStorage.getItem('pz_completed') || '[]'),
  streak: parseInt(localStorage.getItem('pz_streak') || '0'),
  lastSession: localStorage.getItem('pz_last_session') || '',
  xp: parseInt(localStorage.getItem('pz_xp') || '0'),
  currentTopic: null,
  currentLesson: null,
  currentStep: 0,      // 0=concept, 1=quickcheck, 2=commands, 3=lab, 4=done
  commandIdx: 0,       // which command question we are on
  commandAnswered: [], // per command: answered correctly?
  checkAnswered: false,

  save() {
    localStorage.setItem('pz_completed', JSON.stringify(this.completed));
    localStorage.setItem('pz_streak', this.streak);
    localStorage.setItem('pz_xp', this.xp);
  },

  markComplete(lessonId) {
    if (!this.completed.includes(lessonId)) {
      this.completed.push(lessonId);
      this.save();
    }
  },

  isComplete(lessonId) { return this.completed.includes(lessonId); },

  getLessonXP(lesson) { return lesson.xp || 100; },

  updateStreak() {
    const today = new Date().toDateString();
    if (this.lastSession !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (this.lastSession === yesterday) {
        this.streak++;
      } else if (this.lastSession !== today) {
        this.streak = 1;
      }
      this.lastSession = today;
      localStorage.setItem('pz_last_session', this.lastSession);
      localStorage.setItem('pz_streak', this.streak);
    }
  }
};

// ── ALL TOPICS REGISTRY ──────────────────────────────────────
const TOPICS = [];
function registerTopic(data) { TOPICS.push(data); }

// ── DOM HELPERS ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = $(id);
  if (s) s.classList.add('active');
  // scroll right panel to top
  const rp = document.querySelector('.right-panel');
  if (rp) rp.scrollTop = 0;
}

function toast(msg, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = el('div', `toast ${type}`, msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function copyToClipboard(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1500);
  });
}

// ── SIDEBAR TOGGLE ───────────────────────────────────────────
let sidebarOpen = true;
function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const panel = document.querySelector('.left-panel');
  const overlay = document.querySelector('.left-panel-overlay');
  const btnMap = $('btn-map');
  const mobile = window.innerWidth <= 900;

  if (mobile) {
    panel.classList.toggle('mobile-open', sidebarOpen);
    overlay.classList.toggle('show', sidebarOpen);
  } else {
    panel.classList.toggle('collapsed', !sidebarOpen);
  }
  if (btnMap) btnMap.classList.toggle('active', sidebarOpen);
}

// ── TOPBAR UPDATE ────────────────────────────────────────────
function updateTopbar() {
  const total = TOPICS.reduce((a, t) => a + t.lessons.length, 0);
  const done = State.completed.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const fill = $('topbar-progress-fill');
  const label = $('topbar-progress-label');
  const streak = $('topbar-streak-count');
  const xpEl = $('topbar-xp');

  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${total} lessons`;
  if (streak) streak.textContent = State.streak;
  if (xpEl) xpEl.textContent = State.xp.toLocaleString() + ' XP';
}

// ── SIDEBAR BUILD ────────────────────────────────────────────
function buildSidebar() {
  const sidebar = $('sidebar-content');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  // Prerequisites button
  const prereqBtn = el('div', 'topic-btn', `<span class="topic-icon">⚙️</span><span class="topic-name">Prerequisites</span><span class="topic-progress-text">optional</span>`);
  prereqBtn.onclick = () => { navigateTo('prerequisites'); closeOverlay(); };
  sidebar.appendChild(prereqBtn);

  let lastTier = null;
  TOPICS.forEach(topic => {
    if (topic.tier !== lastTier) {
      const divider = el('div', 'tier-divider', `Tier ${topic.tier} — ${topic.tier === 1 ? 'Core Skills' : 'Advanced'}`);
      sidebar.appendChild(divider);
      lastTier = topic.tier;
    }
    const done = topic.lessons.filter(l => State.isComplete(l.id)).length;
    const total = topic.lessons.length;
    const allDone = done === total;
    const isActive = State.currentTopic === topic.id;
    const pct = total ? Math.round(done / total * 100) : 0;

    const btn = el('div', `topic-btn${allDone ? ' completed' : ''}${isActive ? ' active' : ''}`,
      `<span class="topic-icon">${topic.icon}</span>
       <span class="topic-name">${topic.name}</span>
       <span class="topic-progress-text">${done}/${total}</span>
       ${allDone ? '<span class="topic-check">✓</span>' : ''}`
    );
    btn.onclick = () => { navigateTopic(topic.id); closeOverlay(); };
    sidebar.appendChild(btn);
  });
}

function closeOverlay() {
  if (window.innerWidth <= 900) {
    sidebarOpen = false;
    document.querySelector('.left-panel').classList.remove('mobile-open');
    document.querySelector('.left-panel-overlay').classList.remove('show');
  }
}

// ── NAVIGATION ───────────────────────────────────────────────
function navigateTo(screen) {
  switch (screen) {
    case 'home':        renderHome();          break;
    case 'map':         renderMap();           break;
    case 'prerequisites': renderPrereqs();     break;
    default:
      if (screen.startsWith('topic:')) {
        navigateTopic(screen.split(':')[1]);
      }
  }
}

function navigateTopic(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return;
  State.currentTopic = topicId;
  buildSidebar();
  renderTopicLessons(topic);
}

function navigateLesson(topicId, lessonId) {
  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) return;
  const lesson = topic.lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  State.currentTopic = topicId;
  State.currentLesson = lessonId;
  State.currentStep = 0;
  State.commandIdx = 0;
  State.commandAnswered = [];
  State.checkAnswered = false;
  buildSidebar();
  renderLessonStep(topic, lesson, 0);
}

// ── HOME SCREEN ──────────────────────────────────────────────
function renderHome() {
  const screen = $('screen-home');
  if (!screen) return;
  showScreen('screen-home');

  // Find current lesson
  let currLesson = null, currTopic = null;
  for (const topic of TOPICS) {
    for (const lesson of topic.lessons) {
      if (!State.isComplete(lesson.id)) {
        currLesson = lesson;
        currTopic = topic;
        break;
      }
    }
    if (currLesson) break;
  }

  const total = TOPICS.reduce((a, t) => a + t.lessons.length, 0);
  const done = State.completed.length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const clc = $('current-lesson-card');
  if (clc && currLesson) {
    clc.querySelector('.clc-tag').textContent = `▶ Continue — ${currTopic.name}`;
    clc.querySelector('.clc-title').textContent = currLesson.title;
    clc.querySelector('.clc-meta').textContent = `${currLesson.time} · ${currLesson.type}`;
    clc.onclick = () => navigateLesson(currTopic.id, currLesson.id);
  } else if (clc) {
    clc.querySelector('.clc-tag').textContent = '🏆 Course Complete!';
    clc.querySelector('.clc-title').textContent = 'All lessons done — practice interviews';
    clc.querySelector('.clc-meta').textContent = 'Visit Interview Prep';
    clc.onclick = () => {};
  }

  const progEl = $('home-progress-pct');
  if (progEl) progEl.textContent = pct + '%';
  const xpEl = $('home-xp');
  if (xpEl) xpEl.textContent = State.xp.toLocaleString();
  const lessonsEl = $('home-lessons-done');
  if (lessonsEl) lessonsEl.textContent = done;

  updateTopbar();
}

// ── MAP SCREEN ───────────────────────────────────────────────
function renderMap() {
  showScreen('screen-map');
  const grid1 = $('map-grid-tier1');
  const grid2 = $('map-grid-tier2');
  if (!grid1 || !grid2) return;

  [grid1, grid2].forEach(g => g.innerHTML = '');

  TOPICS.forEach(topic => {
    const done = topic.lessons.filter(l => State.isComplete(l.id)).length;
    const total = topic.lessons.length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const allDone = done === total;
    const hasSome = done > 0;

    const card = el('div', `map-topic-card${allDone ? ' completed' : ''}`, `
      <div class="mtc-icon">${topic.icon}</div>
      <div class="mtc-name">${topic.name}</div>
      <div class="mtc-count">${done} / ${total} lessons</div>
      <div class="mtc-progress"><div class="mtc-progress-fill" style="width:${pct}%"></div></div>
      ${allDone ? '<span class="mtc-badge done">✓ Done</span>' : hasSome ? '<span class="mtc-badge inprog">In Progress</span>' : ''}
    `);
    card.onclick = () => navigateTopic(topic.id);
    (topic.tier === 1 ? grid1 : grid2).appendChild(card);
  });
}

// ── PREREQUISITES ────────────────────────────────────────────
const PREREQS = [
  { id:'wsl2', icon:'🪟', name:'WSL2 (Windows only)', time:'10 min', desc:'Gives Windows users a real Linux terminal. Mac/Linux users skip this.', installCmd:'wsl --install', verifyCmd:'wsl --list --verbose', verifyExpected:'Ubuntu running' },
  { id:'docker', icon:'🐳', name:'Docker Desktop', time:'5 min', desc:'Runs containers on your machine. Required for all Docker and K8s labs.', installCmd:'# Download from https://www.docker.com/products/docker-desktop', verifyCmd:'docker --version', verifyExpected:'Docker version 24+' },
  { id:'kubectl', icon:'☸', name:'kubectl', time:'3 min', desc:'The command-line tool for controlling Kubernetes clusters.', installCmd:'# Mac: brew install kubectl\n# Windows: winget install Kubernetes.kubectl\n# Linux: see https://kubernetes.io/docs/tasks/tools/', verifyCmd:'kubectl version --client', verifyExpected:'Client Version: ...' },
  { id:'minikube', icon:'🖥️', name:'minikube', time:'5 min', desc:'Runs a local Kubernetes cluster on your laptop. Used for all K8s labs.', installCmd:'# Mac: brew install minikube\n# Windows: winget install Kubernetes.minikube\n# Linux: see https://minikube.sigs.k8s.io/docs/start/', verifyCmd:'minikube version && minikube start', verifyExpected:'minikube v1.x.x ...' },
  { id:'helm', icon:'⎈', name:'Helm', time:'2 min', desc:'Kubernetes package manager. Required for Helm and monitoring labs.', installCmd:'# Mac: brew install helm\n# Windows: winget install Helm.Helm\n# Linux: curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash', verifyCmd:'helm version', verifyExpected:'version.BuildInfo{Version:"v3' },
  { id:'terraform', icon:'🏗️', name:'Terraform', time:'3 min', desc:'Infrastructure as Code tool. Required for IaC lessons.', installCmd:'# Mac: brew tap hashicorp/tap && brew install hashicorp/tap/terraform\n# Windows: winget install HashiCorp.Terraform\n# Linux: see https://developer.hashicorp.com/terraform/install', verifyCmd:'terraform version', verifyExpected:'Terraform v1.x.x' },
  { id:'git', icon:'🌿', name:'Git', time:'2 min', desc:'Version control. You likely have this already.', installCmd:'# Mac: xcode-select --install\n# Windows: winget install Git.Git\n# Linux: sudo apt install git', verifyCmd:'git --version', verifyExpected:'git version 2.x' },
  { id:'python', icon:'🐍', name:'Python 3', time:'3 min', desc:'Required for Python DevOps lessons and running local server.', installCmd:'# Mac: brew install python3\n# Windows: winget install Python.Python.3\n# Linux: sudo apt install python3 python3-pip', verifyCmd:'python3 --version && python3 -m http.server --version', verifyExpected:'Python 3.x.x' },
  { id:'vscode', icon:'📝', name:'VS Code + Extensions', time:'5 min', desc:'Recommended editor with K8s, Docker, and YAML support.', installCmd:'# Download from https://code.visualstudio.com\n# Then install: code --install-extension ms-kubernetes-tools.vscode-kubernetes-tools\n# code --install-extension redhat.vscode-yaml\n# code --install-extension ms-azuretools.vscode-docker', verifyCmd:'code --version', verifyExpected:'1.8x.x' },
  { id:'azurecli', icon:'☁️', name:'Azure CLI', time:'3 min', desc:'Required for AKS and Azure-specific lessons. Optional if not using Azure.', installCmd:'# Mac: brew install azure-cli\n# Windows: winget install Microsoft.AzureCLI\n# Linux: curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash', verifyCmd:'az --version', verifyExpected:'azure-cli 2.x.x' },
];

let prereqDone = JSON.parse(localStorage.getItem('pz_prereqs') || '[]');

function renderPrereqs() {
  showScreen('screen-prereqs');
  const grid = $('prereq-grid-container');
  if (!grid) return;
  grid.innerHTML = '';
  PREREQS.forEach(p => {
    const done = prereqDone.includes(p.id);
    const item = el('div', `prereq-item${done ? ' done' : ''}`, `
      <div class="prereq-item-header">
        <span class="prereq-icon">${p.icon}</span>
        <span class="prereq-name">${p.name}</span>
        <span class="prereq-time">${p.time}</span>
        <div class="prereq-checkbox${done ? ' done' : ''}" data-id="${p.id}">${done ? '✓' : ''}</div>
      </div>
      <div class="prereq-desc">${p.desc}</div>
      <div class="prereq-cmd-block" data-cmd="${p.installCmd.replace(/"/g,'&quot;')}">${p.installCmd.replace(/\n/g,'<br>')}</div>
      <div class="prereq-verify">Verify: <code>${p.verifyCmd}</code> → should show: <code>${p.verifyExpected}</code></div>
    `);

    item.querySelector('.prereq-checkbox').onclick = () => {
      if (prereqDone.includes(p.id)) {
        prereqDone = prereqDone.filter(x => x !== p.id);
      } else {
        prereqDone.push(p.id);
        toast(`✅ ${p.name} marked as installed!`, 'success');
      }
      localStorage.setItem('pz_prereqs', JSON.stringify(prereqDone));
      renderPrereqs();
    };

    item.querySelector('.prereq-cmd-block').onclick = (e) => {
      copyToClipboard(p.installCmd, e.currentTarget);
      toast('📋 Copied to clipboard!', 'info');
    };

    grid.appendChild(item);
  });

  const doneCount = $('prereq-done-count');
  if (doneCount) doneCount.textContent = `${prereqDone.length} / ${PREREQS.length} installed`;
}

// ── TOPIC LESSONS LIST ───────────────────────────────────────
function renderTopicLessons(topic) {
  showScreen('screen-topic');
  const header = $('topic-header-area');
  const list = $('lessons-list-area');
  if (!header || !list) return;

  header.innerHTML = `
    <div class="topic-header-icon">${topic.icon}</div>
    <div class="topic-header-title">${topic.name}</div>
    <div class="topic-header-desc">${topic.desc}</div>
  `;

  list.innerHTML = '';
  topic.lessons.forEach((lesson, idx) => {
    const done = State.isComplete(lesson.id);
    // First uncompleted = current
    const firstIncomplete = topic.lessons.findIndex(l => !State.isComplete(l.id));
    const isCurrent = idx === firstIncomplete;
    const isLocked = !done && !isCurrent && idx > firstIncomplete;

    const certBadges = (lesson.certs || []).map(c => {
      const map = { cka:'CKA', az400:'AZ-400', aws:'AWS Pro', lfcs:'LFCS' };
      return `<span class="cert-badge ${c}">${map[c] || c}</span>`;
    }).join('');

    const item = el('div', `lesson-item${done ? ' completed' : ''}${isCurrent ? ' current' : ''}${isLocked ? ' locked' : ''}`, `
      <div class="lesson-item-num">${done ? '✓' : isCurrent ? '▶' : isLocked ? '🔒' : idx + 1}</div>
      <div class="lesson-item-info">
        <div class="lesson-item-title">${lesson.title}</div>
        <div class="lesson-item-sub">${lesson.subtitle}</div>
        <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">${certBadges}</div>
      </div>
      <div class="lesson-item-meta">
        <span class="lesson-type-badge lt-${lesson.type}">${lesson.type}</span>
        <span class="lesson-item-time">${lesson.time}</span>
      </div>
    `);

    if (!isLocked) {
      item.onclick = () => navigateLesson(topic.id, lesson.id);
    } else {
      item.title = 'Complete previous lessons to unlock';
    }
    list.appendChild(item);
  });
}

// ── LESSON STEP RENDERER ─────────────────────────────────────
function renderLessonStep(topic, lesson, step) {
  State.currentStep = step;

  // Steps: 0=concept, 1=quickcheck, 2=commands, 3=lab (if exists), 4=done
  const steps = buildStepList(lesson);
  const maxStep = steps.length - 1;

  showScreen('screen-lesson');

  // Render breadcrumb + step dots
  const breadcrumb = $('lesson-breadcrumb');
  if (breadcrumb) breadcrumb.innerHTML = `
    <span>${topic.name}</span>
    <span class="sep">›</span>
    <span class="current">${lesson.title}</span>
  `;

  const dotsContainer = $('lesson-step-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = steps.map((s, i) =>
      `<div class="step-dot${i < step ? ' done' : i === step ? ' active' : ''}"></div>`
    ).join('');
  }

  // Cert badges
  const certArea = $('lesson-cert-area');
  if (certArea) {
    const map = { cka:'🎯 CKA', az400:'🎯 AZ-400', aws:'🎯 AWS Pro', lfcs:'🎯 LFCS' };
    certArea.innerHTML = (lesson.certs || []).map(c =>
      `<span class="cert-badge ${c}">${map[c] || c}</span>`
    ).join('');
  }

  // Render step content
  const content = $('lesson-step-content');
  if (!content) return;

  const stepName = steps[step];

  switch (stepName) {
    case 'concept':   renderConceptStep(content, lesson); break;
    case 'quickcheck': renderQuickCheckStep(content, lesson); break;
    case 'commands':  renderCommandStep(content, lesson, State.commandIdx); break;
    case 'lab':       renderLabStep(content, lesson); break;
    case 'done':      renderDoneStep(content, lesson, topic); break;
  }

  // Nav buttons
  const btnPrev = $('btn-step-prev');
  const btnNext = $('btn-step-next');

  if (btnPrev) {
    btnPrev.style.display = step === 0 ? 'none' : 'flex';
    btnPrev.onclick = () => {
      if (step > 0) renderLessonStep(topic, lesson, step - 1);
    };
  }

  if (btnNext) {
    const isLast = step === maxStep;
    const isCheck = stepName === 'quickcheck';
    const isCmds = stepName === 'commands';

    btnNext.textContent = isLast ? '✓ Finish' :
      stepName === 'concept' ? 'Continue →' :
      'Next →';
    btnNext.disabled = false;

    btnNext.onclick = () => {
      if (isCmds) {
        // Commands step: must go through all questions
        const allAnswered = State.commandAnswered.length === lesson.commands.length;
        if (!allAnswered) {
          toast('Answer all questions to continue', 'info');
          return;
        }
      }
      if (isCheck && !State.checkAnswered) {
        toast('Answer the question to continue', 'info');
        return;
      }
      if (isLast) {
        finishLesson(topic, lesson);
      } else {
        renderLessonStep(topic, lesson, step + 1);
      }
    };
  }
}

function buildStepList(lesson) {
  const steps = ['concept', 'quickcheck'];
  if (lesson.commands && lesson.commands.length) steps.push('commands');
  if (lesson.lab) steps.push('lab');
  steps.push('done');
  return steps;
}

// ── CONCEPT STEP ─────────────────────────────────────────────
function renderConceptStep(container, lesson) {
  const certBadgeClass = lesson.certs && lesson.certs[0] ? lesson.certs[0] : '';
  container.innerHTML = `
    <div class="concept-card">
      <div class="lesson-title-bar">
        <span class="lesson-phase-badge phase-${lesson.id.split('-')[0] || 'foundation'}">${lesson.type}</span>
        <div class="lesson-title">${lesson.title}</div>
        <div class="lesson-meta-row">
          <span>⏱ ${lesson.time}</span>
          <span>+${lesson.xp || 100} XP</span>
          ${lesson.certs ? lesson.certs.map(c => `<span>${({cka:'☸ CKA',az400:'☁ AZ-400',aws:'🟠 AWS Pro',lfcs:'🐧 LFCS'})[c]||c}</span>`).join('') : ''}
        </div>
      </div>
      <div class="concept-layers">
        <div class="concept-layer layer-plain">
          <div class="layer-label"><div class="dot"></div>Plain English</div>
          <div class="layer-text">${lesson.concept.plain}</div>
        </div>
        <div class="concept-layer layer-analogy">
          <div class="layer-label"><div class="dot"></div>Think of it like this</div>
          <div class="layer-text">${lesson.concept.analogy}</div>
        </div>
        <div class="concept-layer layer-technical">
          <div class="layer-technical-toggle" onclick="toggleTechnical(this)">
            <div class="layer-label"><div class="dot"></div>Technical detail</div>
            <span class="toggle-arrow">▾</span>
          </div>
          <div class="layer-technical-body">${lesson.concept.technical}</div>
        </div>
      </div>
      ${lesson.concept.hasAnimation ? `<div class="animation-area" id="anim-container">
        <div style="color:var(--text3);font-size:12px;text-align:center">Loading animation...</div>
      </div>` : ''}
    </div>
  `;

  // Mount animation if available
  if (lesson.concept.hasAnimation && lesson.animationId) {
    const animFn = window.ANIMATIONS && window.ANIMATIONS[lesson.animationId];
    if (animFn) {
      requestAnimationFrame(() => {
        const c = $('anim-container');
        if (c) animFn(c);
      });
    }
  }
}

window.toggleTechnical = function(toggle) {
  const body = toggle.nextElementSibling;
  const arrow = toggle.querySelector('.toggle-arrow');
  body.classList.toggle('open');
  arrow.classList.toggle('open');
};

// ── QUICK CHECK STEP ─────────────────────────────────────────
function renderQuickCheckStep(container, lesson) {
  const q = lesson.quickCheck;
  State.checkAnswered = false;

  container.innerHTML = `
    <div class="qcheck-card">
      <div class="qcheck-label">✅ Quick Check</div>
      <div class="qcheck-question">${q.question}</div>
      <div class="qcheck-options" id="qcheck-opts">
        ${q.options.map((opt, i) => `
          <button class="qcheck-option" data-idx="${i}" onclick="answerQuickCheck(${i}, ${q.correct}, this)">
            <span style="color:var(--text3);margin-right:8px;font-family:var(--mono);font-size:11px">${String.fromCharCode(65+i)}.</span>${opt}
          </button>
        `).join('')}
      </div>
      <div class="qcheck-feedback" id="qcheck-fb"></div>
    </div>
    <div style="font-size:12px;color:var(--text3);text-align:center;margin-top:8px">Answer to continue — right or wrong, you will see the explanation</div>
  `;
}

window.answerQuickCheck = function(chosen, correct, btn) {
  if (State.checkAnswered) return;
  State.checkAnswered = true;

  const opts = document.querySelectorAll('.qcheck-option');
  opts.forEach(o => {
    o.classList.add('answered');
    const idx = parseInt(o.dataset.idx);
    if (idx === correct) o.classList.add('correct');
    else if (idx === chosen) o.classList.add('wrong');
  });

  const isCorrect = chosen === correct;
  const fb = $('qcheck-fb');
  if (fb) {
    fb.className = `qcheck-feedback show ${isCorrect ? 'correct' : 'wrong'}`;
    fb.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong>${document.querySelector('.qcheck-option.correct').textContent.trim()} — ${isCorrect ? '' : ''}${document.querySelector('[data-lesson-explanation]')?.textContent || ''}`;

    // Get explanation from lesson data
    const topic = TOPICS.find(t => t.id === State.currentTopic);
    const lesson = topic?.lessons.find(l => l.id === State.currentLesson);
    if (lesson?.quickCheck?.explanation) {
      fb.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> ${lesson.quickCheck.explanation}`;
    }
  }

  // Pulse the next button
  const btnNext = $('btn-step-next');
  if (btnNext) {
    setTimeout(() => {
      btnNext.style.animation = 'scaleBounce 0.4s ease';
      setTimeout(() => { btnNext.style.animation = ''; }, 400);
    }, 800);
  }
};

// ── COMMAND PRACTICE STEP ────────────────────────────────────
function renderCommandStep(container, lesson, idx) {
  const cmds = lesson.commands;
  const q = cmds[idx];
  const total = cmds.length;

  const dots = cmds.map((_, i) =>
    `<div class="cpq-dot${i < idx ? ' done' : i === idx ? ' active' : ''}"></div>`
  ).join('');

  container.innerHTML = `
    <div class="cpractice-card">
      <div class="cpractice-counter">Question ${idx + 1} of ${total}</div>
      <div class="cpractice-progress">${dots}</div>
      <div class="cpractice-label">⌨ Command Practice</div>
      ${q.scenario ? `<div class="cpractice-scenario">${q.scenario}</div>` : ''}
      ${q.cmd ? `<code class="cpractice-cmd" onclick="copyToClipboard('${q.cmd.replace(/'/g,"\\'")}', this)">${q.cmd}</code>` : ''}
      <div class="cpractice-question">${q.question}</div>
      <div class="cpractice-options">
        ${q.options.map((opt, i) => `
          <button class="cpractice-option" data-idx="${i}" onclick="answerCommand(${i}, ${q.correct}, this, ${idx})">
            <span style="color:var(--text3);margin-right:8px;font-family:var(--mono);font-size:11px">${String.fromCharCode(65+i)}.</span>${opt}
          </button>
        `).join('')}
      </div>
      <div class="cpractice-feedback" id="cpractice-fb"></div>
    </div>
  `;
}

window.answerCommand = function(chosen, correct, btn, cmdIdx) {
  const topic = TOPICS.find(t => t.id === State.currentTopic);
  const lesson = topic?.lessons.find(l => l.id === State.currentLesson);
  if (!lesson) return;

  // Check if this question already answered
  if (State.commandAnswered[cmdIdx] !== undefined) return;
  State.commandAnswered[cmdIdx] = chosen === correct;

  const opts = document.querySelectorAll('.cpractice-option');
  opts.forEach(o => {
    o.classList.add('answered');
    const idx = parseInt(o.dataset.idx);
    if (idx === correct) o.classList.add('correct');
    else if (idx === chosen) o.classList.add('wrong');
  });

  const isCorrect = chosen === correct;
  const fb = $('cpractice-fb');
  const q = lesson.commands[cmdIdx];
  if (fb && q?.explanation) {
    fb.className = `cpractice-feedback show ${isCorrect ? 'correct' : 'wrong'}`;
    fb.innerHTML = `<strong>${isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> ${q.explanation}`;
  }

  // Auto-advance to next command after 1.5s if more remain
  const total = lesson.commands.length;
  setTimeout(() => {
    if (cmdIdx + 1 < total) {
      State.commandIdx = cmdIdx + 1;
      renderCommandStep(document.getElementById('lesson-step-content'), lesson, cmdIdx + 1);
    }
  }, 1800);
};

// ── LAB STEP ─────────────────────────────────────────────────
function renderLabStep(container, lesson) {
  const lab = lesson.lab;
  if (!lab) {
    container.innerHTML = '<div style="color:var(--text3);text-align:center;padding:40px">No lab for this lesson.</div>';
    return;
  }

  const steps = lab.steps.map((s, i) => `
    <div class="lab-step">
      <div class="lab-step-num${s.isBreak ? ' break-step' : ''}">${s.isBreak ? '🔥' : i + 1}</div>
      <div class="lab-step-content">
        <div class="lab-step-title">${s.title}${s.isBreak ? ' <span style="color:var(--red);font-size:11px">(break it on purpose!)</span>' : ''}</div>
        ${s.desc ? `<div class="lab-step-desc">${s.desc}</div>` : ''}
        ${s.cmd ? `<code class="lab-cmd" onclick="copyCmd(this, '${s.cmd.replace(/'/g,"\\'").replace(/\n/g,'\\n')}')">${s.cmd.replace(/\n/g,'<br>')}</code>` : ''}
        ${s.expected ? `<div class="lab-expected">Expected: ${s.expected}</div>` : ''}
        ${s.isBreak ? `<div class="lab-break-warning">⚠ This step intentionally breaks something. Diagnose and fix it — that is the real learning.</div>` : ''}
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="lab-card">
      <div class="lab-header">
        <div class="lab-tag">🧪 Hands-On Lab</div>
        <div class="lab-title">${lab.title}</div>
        <div class="lab-scenario">${lab.scenario}</div>
      </div>
      <div class="lab-platform-btns">
        <button class="btn-laptop" onclick="toast('Open your terminal and follow the steps below', 'info')">💻 Run on my laptop</button>
        <button class="btn-cloud" onclick="window.open('${lab.cloudUrl}','_blank')">☁ Use cloud playground ↗</button>
      </div>
      <div class="lab-steps">${steps}</div>
    </div>
    ${lab.laptopSetup ? `<div style="font-size:12px;color:var(--text3);padding:8px 4px">💡 Laptop setup: ${lab.laptopSetup}</div>` : ''}
  `;
}

window.copyCmd = function(el, cmd) {
  const rawCmd = cmd.replace(/\\n/g, '\n');
  copyToClipboard(rawCmd, el);
  toast('📋 Command copied!', 'info');
};

// ── DONE STEP ────────────────────────────────────────────────
function renderDoneStep(container, lesson, topic) {
  // Mark complete, update XP
  State.markComplete(lesson.id);
  const xpGained = State.getLessonXP(lesson);
  State.xp += xpGained;
  State.updateStreak();
  State.save();
  updateTopbar();

  // Find next lesson
  const topicLessons = topic.lessons;
  const currentIdx = topicLessons.findIndex(l => l.id === lesson.id);
  const nextLesson = topicLessons[currentIdx + 1];

  // Find next lesson across topics if needed
  let nextTopic = topic;
  let globalNext = nextLesson;
  if (!globalNext) {
    const topicIdx = TOPICS.findIndex(t => t.id === topic.id);
    for (let ti = topicIdx + 1; ti < TOPICS.length; ti++) {
      const incomplete = TOPICS[ti].lessons.find(l => !State.isComplete(l.id));
      if (incomplete) { globalNext = incomplete; nextTopic = TOPICS[ti]; break; }
    }
  }

  const learnedItems = (lesson.lab?.learned || ['Core concept understood', 'Practice question completed', 'Ready for next lesson'])
    .map(item => `<div class="done-learned-item">${item}</div>`).join('');

  container.innerHTML = `
    <div class="done-card">
      <div class="done-icon">🎉</div>
      <div class="done-title">Lesson Complete!</div>
      <div class="done-subtitle">${lesson.title}</div>
      <div class="done-xp">+${xpGained} XP — Total: ${State.xp.toLocaleString()}</div>
      <div class="done-learned">
        <div class="done-learned-title">What you learned</div>
        ${learnedItems}
      </div>
      ${globalNext ? `<div class="done-next-preview">
        <div class="dnp-label">Up next</div>
        <div class="dnp-title">${globalNext.title}</div>
      </div>` : ''}
      <div class="done-actions">
        ${globalNext ? `<button class="btn-next-lesson" onclick="navigateLesson('${nextTopic.id}','${globalNext.id}')">Next Lesson →</button>` : '<button class="btn-next-lesson" onclick="navigateTo(\'home\')">Back to Home 🏠</button>'}
        <button class="btn-review" onclick="navigateTopic('${topic.id}')">View All ${topic.name} Lessons</button>
      </div>
    </div>
  `;

  // Show confetti on done
  showConfetti();
}

// ── CONFETTI ─────────────────────────────────────────────────
function showConfetti() {
  const colors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.style.cssText = `
      position:fixed;top:${Math.random()*30-10}%;left:${Math.random()*100}%;
      width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      z-index:9999;pointer-events:none;
      animation:confettiFall ${1.5+Math.random()*1.5}s ease forwards;
      animation-delay:${Math.random()*0.5}s;
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
}

const confettiCSS = document.createElement('style');
confettiCSS.textContent = `@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg);  opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}`;
document.head.appendChild(confettiCSS);

// ── FINISH LESSON ────────────────────────────────────────────
function finishLesson(topic, lesson) {
  const steps = buildStepList(lesson);
  const doneIdx = steps.indexOf('done');
  renderLessonStep(topic, lesson, doneIdx);
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  // Register all available topics
  if (window.FOUNDATION_DATA) registerTopic(window.FOUNDATION_DATA);
  // More topics registered as their data files are added

  buildSidebar();
  updateTopbar();
  renderHome();

  // Event listeners
  const btnMap = $('btn-map');
  if (btnMap) btnMap.onclick = () => { toggleSidebar(); };

  const btnHome = $('btn-home');
  if (btnHome) btnHome.onclick = () => navigateTo('home');

  const mapNavBtn = $('nav-map');
  if (mapNavBtn) mapNavBtn.onclick = () => navigateTo('map');

  const overlay = document.querySelector('.left-panel-overlay');
  if (overlay) overlay.onclick = closeOverlay;

  // Copy commands (delegated)
  document.addEventListener('click', e => {
    if (e.target.classList.contains('lab-cmd')) {
      const cmd = e.target.textContent.trim();
      copyToClipboard(cmd, e.target);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
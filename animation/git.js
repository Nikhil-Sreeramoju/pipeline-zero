// ============================================================
// PipelineZero — animations/git.js
// Animated Git branching visualiser
// Pure SVG + CSS — no external libraries
// ============================================================

window.ANIMATIONS = window.ANIMATIONS || {};

window.ANIMATIONS['git-branching'] = function(container) {
  container.innerHTML = '';
  container.style.background = 'transparent';
  container.style.minHeight = '220px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.gap = '12px';

  // Controls
  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:4px';

  const scenarios = [
    { label: '① Feature Branch', key: 'feature' },
    { label: '② Merge', key: 'merge' },
    { label: '③ Rebase', key: 'rebase' },
    { label: '④ Trunk-Based', key: 'trunk' },
  ];

  let activeKey = 'feature';

  scenarios.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = s.label;
    btn.dataset.key = s.key;
    btn.style.cssText = `
      padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;
      border:1px solid rgba(255,255,255,0.12);cursor:pointer;
      background:${s.key === activeKey ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)'};
      color:${s.key === activeKey ? '#93c5fd' : '#8b93b0'};
      transition:all 0.2s;font-family:inherit;
    `;
    btn.onclick = () => {
      activeKey = s.key;
      controls.querySelectorAll('button').forEach(b => {
        const isActive = b.dataset.key === activeKey;
        b.style.background = isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)';
        b.style.color = isActive ? '#93c5fd' : '#8b93b0';
      });
      renderScene(activeKey);
    };
    controls.appendChild(btn);
  });

  container.appendChild(controls);

  // SVG container
  const svgWrap = document.createElement('div');
  svgWrap.style.cssText = 'width:100%;max-width:680px;';
  container.appendChild(svgWrap);

  // Caption
  const caption = document.createElement('div');
  caption.style.cssText = 'font-size:12px;color:#4d5673;text-align:center;max-width:500px;line-height:1.5;';
  container.appendChild(caption);

  // ── Render functions ──────────────────────────────────────

  function renderScene(key) {
    const scenes = { feature: sceneFeature, merge: sceneMerge, rebase: sceneRebase, trunk: sceneTrunk };
    const { svg, cap } = scenes[key]();
    svgWrap.innerHTML = svg;
    caption.textContent = cap;
    // Animate commits in
    svgWrap.querySelectorAll('.commit').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.4)';
      el.style.transition = `all 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        });
      });
    });
  }

  function makeSVG(h, content) {
    return `<svg viewBox="0 0 640 ${h}" width="100%" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      <defs>
        <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
        </marker>
        <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
        </marker>
        <marker id="arrP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>
        </marker>
        <marker id="arrA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
        </marker>
      </defs>
      ${content}
    </svg>`;
  }

  function commit(cx, cy, color, label, sublabel, isHead) {
    const labelX = cx;
    const labelY = cy - 22;
    return `
      <g class="commit" style="transform-origin:${cx}px ${cy}px">
        ${isHead ? `<circle cx="${cx}" cy="${cy}" r="20" fill="${color}22" stroke="${color}" stroke-width="1.5" opacity="0.4"/>` : ''}
        <circle cx="${cx}" cy="${cy}" r="12" fill="${color}22" stroke="${color}" stroke-width="2"/>
        <text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="9" font-weight="700" font-family="JetBrains Mono,monospace">${label}</text>
        ${sublabel ? `<text x="${cx}" y="${cy+18}" text-anchor="middle" fill="${color}99" font-size="9" font-family="Inter,sans-serif">${sublabel}</text>` : ''}
      </g>`;
  }

  function line(x1,y1,x2,y2,color,marker='',dash='') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}
      ${marker?`marker-end="url(#${marker})"`:''}/>`;
  }

  function branchLabel(x,y,label,color) {
    return `<g class="commit" style="transform-origin:${x}px ${y}px">
      <rect x="${x-30}" y="${y-9}" width="60" height="18" rx="4" fill="${color}18" stroke="${color}44"/>
      <text x="${x}" y="${y+1}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="9" font-weight="700" font-family="Inter,sans-serif">${label}</text>
    </g>`;
  }

  function sceneFeature() {
    const mainY = 80, featY = 160;
    let c = '';
    // main line
    c += line(60,mainY,540,mainY,'#10b981');
    // feature branch split at 200
    c += `<path d="M200 ${mainY} Q200 ${(mainY+featY)/2} 260 ${featY}" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/>`;
    // feature line
    c += line(260,featY,460,featY,'#8b5cf6');
    // main commits
    [[80,'C1','init'],[160,'C2','setup'],[200,'C3','base'],[320,'C4','hotfix'],[460,'C5','main'],[520,'C6','',true]].forEach(([x,l,s,h])=>{ c+=commit(x,mainY,'#10b981',l,s,h); });
    // feature commits
    [[280,'F1','add svc'],[360,'F2','tests'],[460,'F3','done']].forEach(([x,l,s])=>{ c+=commit(x,featY,'#8b5cf6',l,s,false); });
    // labels
    c += branchLabel(70,mainY-35,'main','#10b981');
    c += branchLabel(300,featY+35,'feature/add-service','#8b5cf6');
    // HEAD label
    c += `<text x="520" y="${mainY-30}" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="700" font-family="Inter,sans-serif">HEAD</text>`;
    c += `<line x1="520" y1="${mainY-22}" x2="520" y2="${mainY-14}" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrA)"/>`;
    return { svg: makeSVG(210, c), cap: 'Feature branch: develop in isolation, main stays stable. When ready, merge or raise a Pull Request.' };
  }

  function sceneMerge() {
    const mainY = 70, featY = 150;
    let c = '';
    c += line(40,mainY,580,mainY,'#10b981');
    c += `<path d="M160 ${mainY} Q160 ${(mainY+featY)/2} 220 ${featY}" fill="none" stroke="#8b5cf6" stroke-width="2"/>`;
    c += `<path d="M460 ${featY} Q500 ${(mainY+featY)/2} 500 ${mainY}" fill="none" stroke="#8b5cf6" stroke-width="2" marker-end="url(#arrG)"/>`;
    c += line(220,featY,460,featY,'#8b5cf6');
    [[60,'C1',''],[160,'C2',''],[280,'C3',''],[400,'C4',''],[500,'M','merge',true],[560,'C5','']].forEach(([x,l,s,h])=>{ c+=commit(x,mainY,'#10b981',l,s,h); });
    [[240,'F1',''],[340,'F2',''],[460,'F3','']].forEach(([x,l,s])=>{ c+=commit(x,featY,'#8b5cf6',l,s,false); });
    c += branchLabel(60,mainY-32,'main','#10b981');
    c += branchLabel(350,featY+32,'feature branch','#8b5cf6');
    c += `<text x="500" y="${mainY-28}" text-anchor="middle" fill="#3b82f6" font-size="10" font-weight="700" font-family="Inter,sans-serif">merge commit</text>`;
    c += `<line x1="500" y1="${mainY-20}" x2="500" y2="${mainY-13}" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arrB)"/>`;
    return { svg: makeSVG(200, c), cap: 'git merge: creates a merge commit joining both branches. Preserves full history — you can see exactly when the branch diverged and merged.' };
  }

  function sceneRebase() {
    const beforeY = 60, afterY = 140;
    let c = '';
    // Before label
    c += `<text x="40" y="${beforeY-20}" fill="#4d5673" font-size="10" font-family="Inter,sans-serif" font-weight="600">BEFORE rebase:</text>`;
    c += line(40,beforeY,420,beforeY,'#10b981');
    c += `<path d="M160 ${beforeY} Q160 ${(beforeY+afterY+20)/2} 200 ${afterY+20}" fill="none" stroke="#8b5cf6" stroke-width="2"/>`;
    c += line(200,afterY+20,340,afterY+20,'#8b5cf6');
    [[60,'C1',''],[160,'C2',''],[260,'C3',''],[380,'C4','main']].forEach(([x,l,s])=>{ c+=commit(x,beforeY,'#10b981',l,s,false); });
    [[220,'F1',''],[320,'F2','']].forEach(([x,l,s])=>{ c+=commit(x,afterY+20,'#8b5cf6',l,s,false); });

    // After label
    const ay = afterY + 80;
    c += `<text x="40" y="${ay-20}" fill="#4d5673" font-size="10" font-family="Inter,sans-serif" font-weight="600">AFTER git rebase main:</text>`;
    c += line(40,ay,580,ay,'#10b981');
    [[60,'C1',''],[160,'C2',''],[260,'C3',''],[380,'C4',''],[460,"F1'",'replayed'],[540,"F2'",'replayed',true]].forEach(([x,l,s,h])=>{ c+=commit(x,ay,'#10b981',l,s,h); });
    // Arrow showing F1' and F2' are replayed
    c += `<text x="500" y="${ay+34}" text-anchor="middle" fill="#8b5cf6" font-size="9" font-family="Inter,sans-serif">feature commits replayed on tip of main</text>`;

    return { svg: makeSVG(ay+55, c), cap: 'git rebase: replays your commits on top of the target branch. Result: linear history with no merge commit. Warning: rewrites commit SHAs — never rebase shared branches.' };
  }

  function sceneTrunk() {
    const y = 90;
    let c = '';
    // Main trunk
    c += line(40,y,600,y,'#10b981');
    // Short feature branches
    const features = [
      { x1:120, x2:200, fy:y-60, color:'#3b82f6', label:'fix/timeout' },
      { x1:260, x2:320, fy:y-60, color:'#8b5cf6', label:'feat/health' },
      { x1:400, x2:460, fy:y-60, color:'#f59e0b', label:'feat/rbac' },
    ];
    features.forEach(f => {
      c += `<path d="M${f.x1} ${y} Q${f.x1} ${(y+f.fy)/2} ${(f.x1+f.x2)/2} ${f.fy}" fill="none" stroke="${f.color}" stroke-width="1.5" stroke-dasharray="4 2"/>`;
      c += commit((f.x1+f.x2)/2,f.fy,f.color,f.label.split('/')[1].substring(0,4),'',false);
      c += `<text x="${(f.x1+f.x2)/2}" y="${f.fy-20}" text-anchor="middle" fill="${f.color}88" font-size="9" font-family="Inter,sans-serif">${f.label}</text>`;
      c += `<path d="M${(f.x1+f.x2)/2} ${f.fy+12} Q${f.x2} ${(y+f.fy)/2} ${f.x2} ${y}" fill="none" stroke="${f.color}" stroke-width="1.5" stroke-dasharray="4 2" marker-end="url(#arrG)"/>`;
    });
    // Main commits
    [[60,'C1',''],[120,'C2',''],[200,'C3','merge'],[260,'C4',''],[320,'C5','merge'],[400,'C6',''],[460,'C7','merge'],[540,'C8','',true],[580,'','']].forEach(([x,l,s,h])=>{ if(l) c+=commit(x,y,'#10b981',l,s,h); });
    c += branchLabel(90,y+36,'main (trunk)','#10b981');
    c += `<text x="320" y="${y+58}" text-anchor="middle" fill="#4d5673" font-size="10" font-family="Inter,sans-serif">branches live for hours — merged multiple times per day</text>`;
    return { svg: makeSVG(y+75, c), cap: 'Trunk-Based Development: short-lived branches (hours to 2 days), merged to main frequently. Everyone integrates daily. Preferred for CI/CD. Used by Google, Netflix, Spotify.' };
  }

  // Initial render
  renderScene(activeKey);
};
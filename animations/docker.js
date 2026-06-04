// PipelineZero — animations/docker.js
window.ANIMATIONS = window.ANIMATIONS || {};

window.ANIMATIONS['docker-layers'] = function(container) {
  container.innerHTML = '';
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;min-height:200px';

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
  const scenes = [
    {label:'① Image Layers', key:'layers'},
    {label:'② Dockerfile Build', key:'build'},
    {label:'③ Run Container', key:'run'},
  ];
  let activeKey = 'layers';

  scenes.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = s.label;
    btn.dataset.key = s.key;
    btn.style.cssText = `padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;border:1px solid rgba(255,255,255,0.12);cursor:pointer;font-family:inherit;background:${s.key===activeKey?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.04)'};color:${s.key===activeKey?'#93c5fd':'#8b93b0'};transition:all 0.2s`;
    btn.onclick = () => {
      activeKey = s.key;
      controls.querySelectorAll('button').forEach(b => {
        b.style.background = b.dataset.key===activeKey?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.04)';
        b.style.color = b.dataset.key===activeKey?'#93c5fd':'#8b93b0';
      });
      renderScene(activeKey);
    };
    controls.appendChild(btn);
  });
  container.appendChild(controls);

  const svgWrap = document.createElement('div');
  svgWrap.style.cssText = 'width:100%;max-width:640px';
  container.appendChild(svgWrap);

  const caption = document.createElement('div');
  caption.style.cssText = 'font-size:11px;color:#4d5673;text-align:center;max-width:480px;line-height:1.5;padding:0 8px';
  container.appendChild(caption);

  function svg(h, content) {
    return `<svg viewBox="0 0 620 ${h}" width="100%" xmlns="http://www.w3.org/2000/svg">
      <style>.lt{font-family:JetBrains Mono,monospace;font-size:11px;fill:#93c5fd}.lm{font-family:Inter,sans-serif;font-size:11px;fill:#8b93b0}.lb{font-family:Inter,sans-serif;font-size:10px;font-weight:700;fill:#4d5673;text-transform:uppercase;letter-spacing:0.5px}</style>
      ${content}
    </svg>`;
  }

  function layer(x, y, w, h, color, label, sublabel, delay) {
    return `<g style="opacity:0;transform:translateY(-10px);animation:layerIn 0.4s ease ${delay}s forwards">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${color}18" stroke="${color}" stroke-width="1.5"/>
      <text x="${x+10}" y="${y+h/2+1}" dominant-baseline="middle" class="lt" fill="${color}">${label}</text>
      ${sublabel?`<text x="${x+w-10}" y="${y+h/2+1}" dominant-baseline="middle" text-anchor="end" class="lm">${sublabel}</text>`:''}
    </g>`;
  }

  const style = document.createElement('style');
  style.textContent = '@keyframes layerIn{to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);

  function sceneLayer() {
    const layers = [
      {label:'FROM node:18-alpine', sub:'5.6 MB  base image', color:'#3b82f6'},
      {label:'RUN apk add --no-cache curl', sub:'2.1 MB  dependencies', color:'#8b5cf6'},
      {label:'WORKDIR /app', sub:'0 B     metadata only', color:'#14b8a6'},
      {label:'COPY package*.json ./', sub:'4 KB    package files', color:'#f59e0b'},
      {label:'RUN npm ci --only=production', sub:'48 MB   node_modules', color:'#f59e0b'},
      {label:'COPY . .', sub:'124 KB  source code', color:'#10b981'},
      {label:'USER node  ·  EXPOSE 3000', sub:'0 B     metadata', color:'#10b981'},
    ];
    let c = '';
    const lh = 34, gap = 6, startY = 20, lw = 540, lx = 40;
    layers.forEach((l,i) => {
      c += layer(lx, startY + i*(lh+gap), lw, lh, l.color, l.label, l.sub, i*0.12);
    });
    // arrows
    for(let i=0;i<layers.length-1;i++){
      const y = startY + (i+1)*(lh+gap) - gap/2 - 2;
      c += `<line x1="${lx+lw/2}" y1="${y}" x2="${lx+lw/2}" y2="${y+gap}" stroke="#4d5673" stroke-width="1" stroke-dasharray="2 2"/>`;
    }
    c += `<text x="${lx+lw/2}" y="${startY + layers.length*(lh+gap) + 10}" text-anchor="middle" style="font-size:11px;fill:#4d5673;font-family:Inter,sans-serif">Each instruction = one cached layer (bottom → top)</text>`;
    return { svg: svg(startY + layers.length*(lh+gap)+30, c), cap:'Docker images are stacks of read-only layers. If layer N changes, all layers above N are invalidated. Order your Dockerfile from least-changed (base OS) to most-changed (app code).' };
  }

  function sceneBuild() {
    let c = '';
    const steps = [
      {label:'docker build -t myapp:v1 .', color:'#3b82f6', y:20, sub:'send build context to daemon'},
      {label:'Step 1/6: FROM node:18-alpine', color:'#8b5cf6', y:66, sub:'CACHE HIT → 0.0s'},
      {label:'Step 2/6: RUN apk add curl', color:'#8b5cf6', y:112, sub:'CACHE HIT → 0.0s'},
      {label:'Step 3/6: WORKDIR /app', color:'#14b8a6', y:158, sub:'CACHE HIT → 0.0s'},
      {label:'Step 4/6: COPY package*.json ./', color:'#f59e0b', y:204, sub:'CACHE HIT → 0.0s'},
      {label:'Step 5/6: RUN npm ci', color:'#f59e0b', y:250, sub:'CACHE HIT → 0.0s  ← deps unchanged'},
      {label:'Step 6/6: COPY . .', color:'#ef4444', y:296, sub:'CACHE MISS → rebuilding (source changed)'},
    ];
    steps.forEach((s,i) => {
      c += layer(30, s.y, 560, 36, s.color, s.label, s.sub, i*0.1);
    });
    c += `<text x="310" y="352" text-anchor="middle" style="font-size:11px;fill:#10b981;font-family:Inter,sans-serif">✓ Total build time: 0.4s (6/7 layers cached)</text>`;
    return { svg: svg(370, c), cap:'Layer cache is why builds are fast. Only layers after the changed instruction rebuild. This is why COPY package.json + RUN npm install goes BEFORE COPY . .' };
  }

  function sceneRun() {
    let c = '';
    // Image stack (read-only)
    const layers2 = ['FROM alpine', 'RUN apk add...', 'COPY app /app'];
    layers2.forEach((l,i) => {
      c += `<rect x="80" y="${180-i*40}" width="200" height="32" rx="4" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" stroke-width="1.5"/>`;
      c += `<text x="90" y="${196-i*40}" dominant-baseline="middle" class="lt">${l}</text>`;
    });
    c += `<text x="180" y="255" text-anchor="middle" class="lb">Image (read-only)</text>`;

    // Writable layer
    c += `<rect x="80" y="80" width="200" height="32" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2"/>`;
    c += `<text x="90" y="96" dominant-baseline="middle" style="font-family:JetBrains Mono,monospace;font-size:11px;fill:#10b981">Writable layer</text>`;
    c += `<text x="180" y="65" text-anchor="middle" style="font-family:Inter,sans-serif;font-size:10px;fill:#10b981;font-weight:700">CONTAINER (adds writable layer)</text>`;

    // 3 containers from same image
    const cx = [360, 460, 540];
    cx.forEach((x,i) => {
      ['alpine','apk','app'].forEach((l,j) => {
        c += `<rect x="${x}" y="${180-j*28}" width="70" height="22" rx="3" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="1"/>`;
      });
      c += `<rect x="${x}" y="${88}" width="70" height="22" rx="3" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="1.5"/>`;
      c += `<text x="${x+35}" y="${200}" text-anchor="middle" style="font-size:10px;fill:#4d5673;font-family:Inter,sans-serif">container ${i+1}</text>`;
    });
    c += `<text x="470" y="64" text-anchor="middle" style="font-size:10px;fill:#8b93b0;font-family:Inter,sans-serif">3 containers from same image</text>`;

    // Arrow
    c += `<path d="M290 160 Q320 160 350 160" fill="none" stroke="#4d5673" stroke-width="1.5" stroke-dasharray="4 2" marker-end="url(#arr)"/>`;
    c += `<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#4d5673" stroke-width="2" stroke-linecap="round"/></marker></defs>`;
    c += `<text x="315" y="150" text-anchor="middle" style="font-size:10px;fill:#4d5673;font-family:Inter,sans-serif">docker run ×3</text>`;
    return { svg: svg(270, c), cap:'One image → many containers. Each container adds its own thin writable layer on top of the shared read-only image layers. Stop a container → writable layer persists. docker rm → writable layer destroyed.' };
  }

  function renderScene(key) {
    const scenes2 = { layers:sceneLayer, build:sceneBuild, run:sceneRun };
    const { svg: s, cap: capText } = scenes2[key]();
    svgWrap.innerHTML = s;
    caption.textContent = capText;
  }

  renderScene(activeKey);
};
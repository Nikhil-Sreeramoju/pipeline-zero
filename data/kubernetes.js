// PipelineZero — animations/kubernetes.js
window.ANIMATIONS = window.ANIMATIONS || {};

window.ANIMATIONS['k8s-architecture'] = function(container) {
  container.innerHTML = '';
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 0;min-height:240px';

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
  const scenes = [
    {label:'① Cluster Architecture', key:'arch'},
    {label:'② kubectl → Pod flow', key:'flow'},
    {label:'③ Service routing', key:'svc'},
  ];
  let activeKey = 'arch';

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
  svgWrap.style.cssText = 'width:100%;max-width:680px';
  container.appendChild(svgWrap);

  const caption = document.createElement('div');
  caption.style.cssText = 'font-size:11px;color:#4d5673;text-align:center;max-width:520px;line-height:1.6;padding:0 8px';
  container.appendChild(caption);

  const animStyle = document.createElement('style');
  animStyle.textContent = `
    @keyframes k8sFadeIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
    @keyframes k8sPulse{0%,100%{opacity:0.4}50%{opacity:1}}
    @keyframes k8sFlow{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
  `;
  document.head.appendChild(animStyle);

  function mkSvg(h, content) {
    return `<svg viewBox="0 0 660 ${h}" width="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrW" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#ffffff44" stroke-width="2" stroke-linecap="round"/>
        </marker>
        <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
        </marker>
        <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
        </marker>
      </defs>
      ${content}
    </svg>`;
  }

  function box(x, y, w, h, color, title, subtitle, delay) {
    return `<g style="animation:k8sFadeIn 0.4s ease ${delay}s both">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${color}18" stroke="${color}" stroke-width="1.5"/>
      <text x="${x+w/2}" y="${y+h/2-(subtitle?6:0)}" text-anchor="middle" dominant-baseline="middle" style="font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;fill:${color}">${title}</text>
      ${subtitle?`<text x="${x+w/2}" y="${y+h/2+10}" text-anchor="middle" dominant-baseline="middle" style="font-family:Inter,sans-serif;font-size:9px;fill:${color}88">${subtitle}</text>`:''}
    </g>`;
  }

  function arrow(x1,y1,x2,y2,color,markerId,dash,delay) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}  marker-end="url(#${markerId})" style="animation:k8sFadeIn 0.3s ease ${delay}s both"/>`;
  }

  function label(x,y,text,color,delay) {
    return `<text x="${x}" y="${y}" text-anchor="middle" style="font-family:Inter,sans-serif;font-size:9px;font-weight:700;fill:${color||'#4d5673'};animation:k8sFadeIn 0.3s ease ${delay||0}s both">${text}</text>`;
  }

  // Scene 1: Full cluster architecture
  function sceneArch() {
    let c = '';
    // Control Plane background
    c += `<rect x="10" y="10" width="310" height="220" rx="10" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.25)" stroke-width="1.5" stroke-dasharray="6 3"/>`;
    c += label(165,28,'CONTROL PLANE','#3b82f6',0);

    c += box(25, 40, 120, 44, '#3b82f6', 'kube-apiserver', 'entry point', 0.1);
    c += box(175, 40, 130, 44, '#8b5cf6', 'etcd', 'all state stored here', 0.15);
    c += box(25, 110, 120, 40, '#14b8a6', 'scheduler', 'places pods on nodes', 0.2);
    c += box(175, 110, 130, 40, '#f59e0b', 'controller-mgr', 'reconciliation loops', 0.25);
    c += box(25, 170, 280, 40, '#ec4899', 'cloud-controller-manager', 'talks to Azure / AWS', 0.3);

    // api ↔ etcd
    c += arrow(145, 62, 175, 62, '#3b82f688', 'arrB', '', 0.35);
    c += arrow(175, 62, 145, 62, '#8b5cf688', 'arrB', '', 0.35);

    // Worker nodes
    c += `<rect x="340" y="10" width="310" height="220" rx="10" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.25)" stroke-width="1.5" stroke-dasharray="6 3"/>`;
    c += label(495,28,'WORKER NODES','#10b981',0);

    // Node 1
    c += `<rect x="355" y="38" width="130" height="185" rx="8" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.2)" stroke-width="1"/>`;
    c += label(420,54,'node-1','#10b981',0);
    c += box(365, 62, 110, 30, '#10b981', 'kubelet', '', 0.35);
    c += box(365, 100, 110, 30, '#10b981', 'kube-proxy', '', 0.4);
    c += box(365, 138, 50, 26, '#3b82f6', 'pod', '', 0.45);
    c += box(420, 138, 55, 26, '#3b82f6', 'pod', '', 0.48);
    c += box(365, 172, 110, 26, '#8b5cf6', 'containerd', '', 0.5);

    // Node 2
    c += `<rect x="498" y="38" width="135" height="185" rx="8" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.2)" stroke-width="1"/>`;
    c += label(565,54,'node-2','#10b981',0);
    c += box(508, 62, 115, 30, '#10b981', 'kubelet', '', 0.38);
    c += box(508, 100, 115, 30, '#10b981', 'kube-proxy', '', 0.42);
    c += box(508, 138, 55, 26, '#3b82f6', 'pod', '', 0.47);
    c += box(567, 138, 58, 26, '#3b82f6', 'pod', '', 0.5);
    c += box(508, 172, 115, 26, '#8b5cf6', 'containerd', '', 0.52);

    // API server → worker nodes
    c += `<path d="M320 62 Q330 62 340 62" fill="none" stroke="#3b82f666" stroke-width="1.5" stroke-dasharray="4 2" marker-end="url(#arrB)" style="animation:k8sFadeIn 0.3s ease 0.55s both"/>`;
    c += `<path d="M320 130 Q330 130 340 130" fill="none" stroke="#3b82f666" stroke-width="1.5" stroke-dasharray="4 2" marker-end="url(#arrB)" style="animation:k8sFadeIn 0.3s ease 0.58s both"/>`;

    // kubectl from outside
    c += box(250, 248, 90, 32, '#4d5673', 'kubectl', 'your terminal', 0.6);
    c += `<path d="M295 248 L295 106 L145 106" fill="none" stroke="#4d5673" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#arrW)" style="animation:k8sFadeIn 0.3s ease 0.65s both"/>`;
    c += label(230, 195, 'all commands → API server', '#4d5673', 0.7);

    return { svg: mkSvg(300, c), cap: 'Control plane is the brain — API server is the single entry point for everything. etcd holds all cluster state. kubelet on each node is independent — if control plane goes down, running pods keep running.' };
  }

  // Scene 2: kubectl to pod step-by-step
  function sceneFlow() {
    let c = '';
    const steps = [
      {x:30,  y:40,  w:90,  h:36, color:'#4d5673', title:'kubectl',    sub:'your laptop', num:'1'},
      {x:165, y:40,  w:110, h:36, color:'#3b82f6', title:'API Server',  sub:'auth → validate → etcd', num:'2'},
      {x:320, y:40,  w:90,  h:36, color:'#8b5cf6', title:'etcd',       sub:'stores intent', num:'3'},
      {x:165, y:130, w:110, h:36, color:'#f59e0b', title:'Controller', sub:'creates ReplicaSet', num:'4'},
      {x:320, y:130, w:90,  h:36, color:'#f59e0b', title:'Scheduler',  sub:'picks node', num:'5'},
      {x:455, y:85,  w:100, h:36, color:'#10b981', title:'kubelet',    sub:'node-1', num:'6'},
      {x:455, y:155, w:100, h:36, color:'#3b82f6', title:'Pod',        sub:'container running!', num:'7'},
    ];
    steps.forEach((s,i) => {
      c += box(s.x, s.y, s.w, s.h, s.color, s.title, s.sub, i*0.1);
      c += `<circle cx="${s.x+12}" cy="${s.y+8}" r="8" fill="${s.color}" style="animation:k8sFadeIn 0.3s ease ${i*0.1+0.05}s both"/>`;
      c += `<text x="${s.x+12}" y="${s.y+9}" text-anchor="middle" dominant-baseline="middle" style="font-size:9px;font-weight:700;fill:white;animation:k8sFadeIn 0.3s ease ${i*0.1+0.05}s both">${s.num}</text>`;
    });

    // Arrows between steps
    const arrows2 = [
      [120, 58, 165, 58, '#3b82f6', 'HTTPS'],
      [275, 58, 320, 58, '#8b5cf6', 'write to etcd'],
      [320, 62, 275, 138, '#f59e0b', 'watches'],
      [410, 148, 455, 100, '#10b981', 'assigns node'],
      [455, 100, 455, 155, '#3b82f6', ''],
    ];
    arrows2.forEach(([x1,y1,x2,y2,color,lbl],i) => {
      c += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" marker-end="url(#arrB)" style="animation:k8sFadeIn 0.3s ease ${0.7+i*0.1}s both"/>`;
      if(lbl) c += label((x1+x2)/2, (y1+y2)/2-8, lbl, color, 0.7+i*0.1);
    });

    return { svg: mkSvg(220, c), cap: 'kubectl → API Server → etcd → Controller creates ReplicaSet → Scheduler assigns node → kubelet starts container. Nothing talks to nodes directly — everything flows through the API server.' };
  }

  // Scene 3: Service routing
  function sceneSvc() {
    let c = '';

    // Client pod
    c += box(20, 80, 90, 36, '#4d5673', 'client pod', 'sends request', 0.0);
    // Service
    c += box(165, 60, 120, 76, '#3b82f6', 'Service', 'ClusterIP: 10.96.5.3', 0.1);
    c += label(225, 82, 'port: 80', '#3b82f6', 0.15);
    c += label(225, 94, 'selector: app=api', '#3b82f6', 0.15);
    c += label(225, 106, 'targetPort: 8080', '#3b82f6', 0.15);
    c += label(225, 120, 'kube-proxy: iptables DNAT', '#4d5673', 0.2);

    // Pods
    const pods = [
      {x:345, y:40,  label:'api-pod-1', ip:'10.244.1.5:8080', color:'#10b981'},
      {x:345, y:105, label:'api-pod-2', ip:'10.244.2.3:8080', color:'#10b981'},
      {x:345, y:170, label:'api-pod-3 ✗', ip:'readiness FAIL', color:'#ef4444'},
    ];
    pods.forEach((p,i) => {
      c += box(p.x, p.y, 150, 44, p.color, p.label, p.ip, 0.2+i*0.1);
    });

    // Arrows
    c += arrow(110, 98, 165, 98, '#3b82f666', 'arrB', '', 0.5);
    c += arrow(285, 80, 345, 62, '#10b981', 'arrG', '', 0.55);
    c += arrow(285, 98, 345, 127, '#10b981', 'arrG', '', 0.6);
    // broken pod - X
    c += `<line x1="285" y1="115" x2="345" y2="192" stroke="#ef444466" stroke-width="1.5" stroke-dasharray="4 2" style="animation:k8sFadeIn 0.3s ease 0.65s both"/>`;
    c += label(315, 145, 'no traffic', '#ef4444', 0.65);

    // Endpoints label
    c += `<rect x="505" y="55" width="130" height="60" rx="6" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.2)" stroke-width="1" style="animation:k8sFadeIn 0.3s 0.7s both"/>`;
    c += label(570, 72, 'kubectl get endpoints', '#4d5673', 0.72);
    c += label(570, 87, '10.244.1.5:8080', '#10b981', 0.75);
    c += label(570, 102, '10.244.2.3:8080', '#10b981', 0.78);
    c += label(570, 114, '(pod-3 not listed)', '#ef444488', 0.8);

    return { svg: mkSvg(240, c), cap: 'ClusterIP is virtual — exists only in iptables rules on every node. kube-proxy does DNAT routing. Pod failing readiness probe = removed from endpoints = no traffic. kubectl get endpoints svc-name shows which pod IPs are active.' };
  }

  function renderScene(key) {
    const scenes2 = { arch:sceneArch, flow:sceneFlow, svc:sceneSvc };
    const { svg: s, cap: capText } = scenes2[key]();
    svgWrap.innerHTML = s;
    caption.textContent = capText;
  }

  renderScene(activeKey);
};
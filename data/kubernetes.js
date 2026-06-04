// PipelineZero — data/kubernetes.js
window.KUBERNETES_DATA = {
  id:'kubernetes', name:'Kubernetes', icon:'☸', tier:1,
  desc:'22 lessons from zero to production-grade K8s. The most asked-about topic in senior DevOps interviews. Every concept builds on the previous — do not skip ahead.',
  lessons:[

  {
    id:'k1-why-kubernetes', title:'Why Kubernetes Exists', subtitle:'The problem before the solution',
    time:'30 min', type:'concept', certs:['cka'], xp:80,
    concept:{
      plain:'Before Kubernetes, deploying 10 services meant 10 servers managed manually. If one crashed you had to SSH in and restart it yourself. Kubernetes automates all of that: self-healing, scaling, and zero-downtime deployment of containerised applications across a cluster of machines.',
      analogy:'Before K8s, running services was like a restaurant where if any cook goes home sick, that dish is off the menu until you personally drive to their house and bring them back. Kubernetes is hiring a restaurant manager who watches all staff 24/7, replaces anyone who quits instantly, calls in extra staff before the Friday rush — all without you getting involved.',
      technical:`<strong>Problems Kubernetes solves:</strong><br>
Self-healing: crashed containers restart automatically. Node failure: pods rescheduled on healthy nodes.<br>
Scaling: scale with one command or automatically on CPU/memory.<br>
Rolling deployments: new version deployed with zero downtime.<br>
Service discovery: apps find each other by name, not hardcoded IPs that change every restart.<br>
Config management: inject secrets and config without rebuilding images.<br><br>
<strong>The reconciliation loop — THE most important K8s concept:</strong><br>
Every K8s controller constantly compares desired state (your YAML) vs actual state (what is running). When they differ, it acts to close the gap. You declare "I want 3 replicas always running." If one crashes: actual=2, desired=3 → controller creates a new pod. You never asked it to — it just does it.<br><br>
<strong>Declarative vs Imperative:</strong><br>
Imperative: "create 3 pods RIGHT NOW." Declarative: "I want 3 pods always running, make it so and keep it that way." K8s is declarative. This is why kubectl apply is preferred over kubectl create.`
    },
    commands:[
      {cmd:'kubectl apply -f deployment.yaml', desc:'Apply a YAML manifest — creates or updates resources to match declared desired state', when:'The primary way to deploy anything to Kubernetes', example:'deployment.apps/myapp created', level:'basic'},
      {cmd:'kubectl get all -n myns', desc:'Show all resources (pods, services, deployments) in namespace myns', when:'Quick overview of everything running in a namespace', example:'NAME                READY   STATUS   RESTARTS', level:'basic'},
    ],
    exercises:[
      {q:'What is the reconciliation loop and why does it make K8s "self-healing"?', a:'Every controller runs a constant loop: read desired state from etcd → read actual state from cluster → calculate difference → take action to close the gap. Example: Deployment controller has desired=3 replicas. A node fails, killing one pod. Actual=2. Controller detects the gap and creates a new pod on a healthy node. You did nothing — the loop handles it. This is why K8s is self-healing: the loop never stops running, so any drift from desired state is corrected automatically.', level:'basic'},
      {q:'What is the difference between declarative and imperative Kubernetes configuration?', a:'Imperative: you tell K8s what to DO. "kubectl create this pod, kubectl scale this deployment." One-time actions that K8s does not remember. Declarative: you tell K8s what you WANT. "This YAML is my desired state — make it so and keep it that way." kubectl apply is declarative. If you manually delete a pod managed by a Deployment, K8s recreates it — because the declared desire is still 3 replicas. Declarative is the foundation of GitOps: store desired state in Git, K8s continuously reconciles to match.', level:'basic'},
    ],
    interview:[
      {q:'What problem does Kubernetes solve that Docker alone does not?', level:'basic',
       a:'Docker runs one container on one machine with no self-healing, no automatic rescheduling across nodes, no built-in service discovery, no rolling deployment, no load balancing. Kubernetes orchestrates containers across many machines and adds: automatic restart on crash, rescheduling when nodes fail, Service-based discovery, rolling zero-downtime deploys, HPA auto-scaling. Docker is the packaging format (the container). Kubernetes is the orchestration system (the cluster of machines running containers).',
       trap:'Saying Docker is for development and K8s for production. Both are used in production. The distinction is single-host (Docker) vs multi-host orchestration (K8s).'},
    ],
    resources:[{label:'Kubernetes overview documentation', url:'https://kubernetes.io/docs/concepts/overview'}]
  },

  {
    id:'k2-architecture', title:'Kubernetes Architecture', subtitle:'Trace every request from kubectl to running pod',
    time:'75 min', type:'concept', certs:['cka'], xp:120, animationId:'k8s-architecture',
    concept:{
      plain:'A K8s cluster has a control plane (the brain — decides what runs where) and worker nodes (the muscles — actually run containers). Every kubectl command flows through the control plane.',
      analogy:'K8s is a restaurant chain HQ. API Server = receptionist (everyone calls here first). etcd = filing cabinet (every decision written here permanently). Scheduler = manager assigning kitchens to orders. Controller Manager = ops team ensuring right staff count at every restaurant. Worker nodes = the actual restaurants. kubelet = each restaurant\'s local manager.',
      technical:`<strong>Control Plane:</strong><br>
kube-apiserver: single entry point, stateless, validates all requests, stores state in etcd. All kubectl commands go here.<br>
etcd: distributed KV store using RAFT consensus. Stores ALL cluster state. Only stateful control plane component. Losing etcd = losing the cluster. Back it up daily.<br>
kube-scheduler: watches for unscheduled pods, filters nodes (feasibility), scores nodes (optimality), assigns winner.<br>
kube-controller-manager: runs all controllers in loops — Deployment, ReplicaSet, Node, Endpoint controllers.<br>
cloud-controller-manager: talks to Azure/AWS/GCP APIs for LoadBalancers, node lifecycle.<br><br>
<strong>Worker Node:</strong><br>
kubelet: agent on every node, manages pod lifecycle via container runtime (containerd). INDEPENDENT — if API server dies, running pods keep running.<br>
kube-proxy: maintains iptables/ipvs rules on each node to implement Service routing.<br>
container runtime: containerd (standard) — actually starts/stops containers.<br><br>
<strong>Critical insight:</strong> kubelet manages local pods independently. If you lose etcd and the API server, existing pods continue running. You just cannot make changes until control plane is restored.`
    },
    commands:[
      {cmd:'kubectl get nodes -o wide', desc:'List all nodes with roles, status, K8s version, and IP addresses', when:'Checking cluster health and node status', example:'NAME    STATUS  ROLES          VERSION', level:'basic'},
      {cmd:'kubectl get pods -n kube-system', desc:'List system pods — control plane components, CoreDNS, kube-proxy, CNI plugin', when:'Checking if system components are healthy', example:'coredns-xxx    Running\\nkube-proxy-yyy  Running', level:'basic'},
      {cmd:'kubectl describe node worker-1', desc:'Detailed node info: capacity, allocatable resources, conditions, running pods, taints', when:'Diagnosing node pressure or scheduling issues', example:'Capacity: cpu: 4\\nAllocatable: cpu: 3800m', level:'intermediate'},
    ],
    exercises:[
      {q:'What happens if etcd goes down? What still works?', a:'Running pods CONTINUE — kubelet is independent of etcd and API server, managing local pods without them. What stops: kubectl (cannot reach API server), new pod scheduling, any config changes, self-healing for new failures, HPA scaling. The cluster is alive but frozen — cannot respond to new events or changes. Recovery: restore etcd from snapshot backup (etcdctl snapshot restore). This is why etcd backups are critical infrastructure.', level:'intermediate'},
      {q:'What is the role of kube-proxy?', a:'kube-proxy runs on every node and maintains iptables (or ipvs) rules that implement Service routing. When a pod sends traffic to a ClusterIP, iptables intercepts the packet and rewrites (DNAT) the destination to one of the healthy pod IPs behind the Service. kube-proxy watches the API server for Service and Endpoint changes and updates iptables rules on every node within milliseconds. This is why Services work across all nodes — every node has identical routing rules.', level:'advanced'},
    ],
    interview:[
      {q:'Describe the journey of kubectl apply from terminal to running pod.', level:'intermediate',
       a:'1. kubectl reads ~/.kube/config for API server URL and credentials. 2. Sends HTTPS request to kube-apiserver. 3. API server authenticates (certificate/token), authorises (RBAC check), validates the resource schema, writes to etcd. 4. Deployment controller (kube-controller-manager) watches etcd, sees new Deployment, creates ReplicaSet object in etcd. 5. ReplicaSet controller sees desired > actual replicas, creates Pod objects in etcd (pods are just records — nothing running yet). 6. kube-scheduler watches for unscheduled pods, filters/scores nodes, writes node assignment to etcd. 7. kubelet on assigned node watches etcd, sees pod assigned to it, calls containerd to pull image and start container. 8. kubelet updates pod status to Running in etcd.',
       trap:'Saying kubectl sends directly to the node. Everything goes through the API server. Nodes never receive direct commands.'},
    ],
    resources:[{label:'K8s components documentation', url:'https://kubernetes.io/docs/concepts/overview/components'}]
  },

  {
    id:'k3-kubectl-yaml', title:'kubectl & YAML Mastery', subtitle:'Your daily tools — know them cold',
    time:'45 min', type:'lab', certs:['cka'], xp:100,
    concept:{
      plain:'kubectl is the command-line interface to every Kubernetes cluster. YAML is the language for declaring everything in K8s. These two tools are your daily interface — slow usage shows immediately in interviews and on-call.',
      analogy:'kubectl is like a TV remote — it sends commands to the API server (TV) without doing the work itself. Knowing the shortcuts is like knowing hotkeys instead of navigating 5 menus. YAML is the instruction manual — precise, indentation-sensitive, and merciless about typos.',
      technical:`<strong>Essential kubectl:</strong> get, describe, apply, delete, logs, exec, port-forward, top, rollout<br><br>
<strong>Output formats (learn these cold):</strong><br>
-o wide: extra columns (node name, pod IP)<br>
-o yaml: full resource YAML<br>
-o jsonpath="{.spec.replicas}": extract specific field<br>
-o custom-columns=NAME:.metadata.name: custom table<br><br>
<strong>YAML structure every K8s resource follows:</strong><br>
apiVersion, kind, metadata (name/namespace/labels/annotations), spec (YOU define), status (K8s fills, never edit)<br><br>
<strong>Generator shortcuts (must know cold for CKA):</strong><br>
<code>kubectl create deployment myapp --image=nginx --dry-run=client -o yaml > deploy.yaml</code><br>
<code>kubectl run mypod --image=nginx --dry-run=client -o yaml > pod.yaml</code><br>
<code>kubectl create service clusterip mysvc --tcp=80:8080 --dry-run=client -o yaml</code><br>
<code>kubectl create configmap myconf --from-literal=key=val --dry-run=client -o yaml</code><br><br>
<strong>Contexts:</strong><br>
<code>kubectl config get-contexts</code> — list all clusters<br>
<code>kubectl config use-context my-cluster</code> — switch cluster<br>
<code>kubectl config set-context --current --namespace=myns</code> — set default namespace`
    },
    commands:[
      {cmd:'kubectl get pods -A -o wide', desc:'All pods in ALL namespaces with node and IP. -A = --all-namespaces', when:'Quick cluster-wide health check', example:'NAMESPACE  NAME     READY  STATUS   NODE   IP', level:'basic'},
      {cmd:'kubectl describe pod mypod-abc123', desc:'Detailed pod info including Events — the most useful debug command in K8s', when:'First step when a pod is not running as expected. Events section shows why.', example:'Events:\\n  Warning  BackOff  Back-off restarting failed container', level:'basic'},
      {cmd:'kubectl logs mypod --previous', desc:'Logs from the PREVIOUS container instance before most recent restart', when:'Pod in CrashLoopBackOff — current container crashed too fast for logs', example:'Error: ECONNREFUSED db:5432', level:'basic'},
      {cmd:'kubectl exec -it mypod -- /bin/sh', desc:'Interactive shell inside running container', when:'Check env vars, test DNS, test connectivity from inside the pod', example:'/ #', level:'basic'},
      {cmd:'kubectl port-forward svc/myservice 8080:80', desc:'Forward local port 8080 to service port 80 until Ctrl+C', when:'Test a service from your laptop without exposing it publicly', example:'Forwarding 127.0.0.1:8080 -> 80', level:'basic'},
      {cmd:'kubectl create deployment myapp --image=nginx:alpine --dry-run=client -o yaml', desc:'Generate Deployment YAML without creating anything', when:'Starting YAML from scratch — never write Deployment YAML manually', example:'apiVersion: apps/v1\\nkind: Deployment...', level:'basic'},
      {cmd:'kubectl rollout status deployment/myapp', desc:'Watch deployment rollout until all replicas updated and ready', when:'CI/CD pipelines — wait for completion before running tests', example:'Successfully rolled out', level:'basic'},
      {cmd:'kubectl rollout undo deployment/myapp', desc:'Revert to previous deployment version instantly', when:'Emergency rollback when a deployment breaks production', example:'deployment.apps/myapp rolled back', level:'basic'},
      {cmd:'kubectl top pods --sort-by=memory -n myns', desc:'Show actual CPU/memory usage per pod, sorted by memory', when:'Finding resource hogs, verifying resource requests are sized correctly', example:'NAME     CPU   MEMORY\\napi-xyz  50m   450Mi', level:'intermediate'},
      {cmd:'kubectl get events --sort-by=.lastTimestamp -n myns', desc:'All cluster events sorted chronologically', when:'Understanding what happened and when during an incident', example:'Warning FailedScheduling: Insufficient memory', level:'intermediate'},
    ],
    lab:{
      title:'kubectl Daily Workflow — Deploy, Debug, Rollback',
      scenario:'Practice the core kubectl workflow: deploy, simulate failure, debug it, roll back.',
      cloudUrl:'https://killercoda.com/killer-shell-cka',
      steps:[
        {title:'Deploy and expose', cmd:'kubectl create deployment webapp --image=nginx:alpine --replicas=3\nkubectl expose deployment webapp --port=80', expected:'Deployment and Service created', isBreak:false, desc:''},
        {title:'Verify', cmd:'kubectl get pods -l app=webapp && kubectl get svc webapp', expected:'3 Running pods, ClusterIP service', isBreak:false, desc:''},
        {title:'Test the service', cmd:'kubectl run test --image=alpine --restart=Never -it --rm -- wget -qO- http://webapp', expected:'nginx HTML response', isBreak:false, desc:'Temporary pod to test from inside the cluster.'},
        {title:'Deploy a bad image', cmd:'kubectl set image deployment/webapp nginx=nginx:DOESNOTEXIST', expected:'Deployment updated (pods will fail)', isBreak:true, desc:'kubectl get pods will show ImagePullBackOff. kubectl describe pod shows the reason. Roll back with kubectl rollout undo deployment/webapp'},
        {title:'Roll back', cmd:'kubectl rollout undo deployment/webapp\nkubectl rollout status deployment/webapp', expected:'Rolled back, 3/3 Running', isBreak:false, desc:''},
        {title:'Generate YAML', cmd:'kubectl create deployment test --image=nginx --dry-run=client -o yaml', expected:'YAML printed, nothing created', isBreak:false, desc:'Add > test.yaml to save to file.'},
        {title:'Clean up', cmd:'kubectl delete deployment webapp && kubectl delete svc webapp', expected:'Resources deleted', isBreak:false, desc:''},
      ]
    },
    exercises:[
      {q:'What is the fastest way to generate Deployment YAML without writing it from scratch?', a:'<code>kubectl create deployment myapp --image=nginx:alpine --dry-run=client -o yaml > deploy.yaml</code>. --dry-run=client prevents actual creation. -o yaml outputs the valid YAML to stdout. Redirect to file and edit. This is the standard professional workflow — learn it cold. Never write Deployment YAML from scratch in a CKA exam or during on-call.', level:'basic'},
      {q:'A pod shows CrashLoopBackOff but kubectl logs shows no output. Why and what next?', a:'CrashLoopBackOff means the container crashed and K8s is restarting with exponential backoff. The CURRENT container may have crashed so fast it produced no logs. The previous crashed instance had logs. Run: <code>kubectl logs <pod> --previous</code>. The --previous flag gets logs from the terminated container. This is the single most important debugging flag — many engineers do not know it.', level:'intermediate'},
      {q:'How do you watch all pods in a namespace update in real-time?', a:'<code>kubectl get pods -n myns -w</code> — the -w (watch) flag keeps the terminal open and streams updates as pod states change. You see the old pods terminating and new pods progressing through ContainerCreating → Running during a rolling update. Alternative: <code>kubectl rollout status deployment/myapp</code> which gives a summarised view of the rollout progress.', level:'basic'},
    ],
    interview:[
      {q:'How do you debug a pod in Pending state?', level:'intermediate',
       a:'Pending means scheduled but not running yet — or cannot be scheduled. Run <code>kubectl describe pod <name></code> and check Events. Four causes: 1. Insufficient resources — Events say "Insufficient cpu/memory." Fix: add nodes or reduce requests. 2. nodeSelector/affinity mismatch — "FailedScheduling: node(s) did not match node selector." 3. Taint/toleration mismatch — "node(s) had untolerated taint." 4. PVC not bound — "pod has unbound PVCs." Check <code>kubectl get pvc</code>. Each cause has a different fix — describing the pod first, not guessing, is the correct approach.',
       trap:'Only mentioning insufficient resources. Pending has four distinct causes and a senior engineer knows all of them.'},
    ],
    resources:[{label:'kubectl cheat sheet', url:'https://kubernetes.io/docs/reference/kubectl/cheatsheet'}]
  },

  {
    id:'k4-pods', title:'Pods — The Building Block', subtitle:'The atom of Kubernetes, NOT just a container',
    time:'45 min', type:'concept', certs:['cka'], xp:100,
    concept:{
      plain:'A Pod is the smallest unit in Kubernetes — not a container. A Pod wraps one or more containers that always run together on the same node, share the same IP address, and can share storage volumes.',
      analogy:'A Pod is a shared apartment. Roommates (containers) share the same front door (network — same IP), share storage rooms (volumes), but have private rooms (process space). If the building collapses (node failure), all roommates leave together. The Deployment is the property manager who finds them a new building automatically.',
      technical:`<strong>Key pod spec fields:</strong><br>
containers (list), initContainers, volumes, restartPolicy (Always/OnFailure/Never), nodeSelector, tolerations, serviceAccountName, securityContext<br><br>
<strong>Key container spec fields:</strong><br>
image, command, args, env, envFrom, ports, resources (requests+limits), livenessProbe, readinessProbe, startupProbe, volumeMounts, securityContext<br><br>
<strong>Multi-container patterns:</strong><br>
Sidecar: helper alongside main (log shipper, proxy). Share localhost network and volumes.<br>
Init container: runs to completion BEFORE main starts. DB migrations, wait-for-dependencies. If init fails, main never starts.<br>
Ambassador: proxy external services. Adapter: normalise output format.<br><br>
<strong>Pod lifecycle:</strong> Pending → ContainerCreating → Running → Succeeded/Failed<br><br>
<strong>Exit codes:</strong> 0=success, 1=app error, 137=OOMKilled (SIGKILL), 139=segfault, 143=SIGTERM (graceful stop)<br><br>
<strong>NEVER create bare Pods in production.</strong> Always use a controller so pods are recreated on deletion or node failure.`
    },
    commands:[
      {cmd:'kubectl run debug --image=nicolaka/netshoot --restart=Never -it --rm', desc:'Run a temporary debugging pod with network tools pre-installed. Deleted when you exit.', when:'Testing DNS, connectivity, HTTP endpoints from inside the cluster', example:'bash-5.1# dig my-service.default.svc.cluster.local', level:'basic'},
      {cmd:'kubectl get pod mypod -o yaml | grep -A 5 "lastState"', desc:'Show the last terminated container state including exit code and reason', when:'Understanding why a pod restarted — exit code tells you the failure type', example:'lastState:\\n  terminated:\\n    exitCode: 137\\n    reason: OOMKilled', level:'intermediate'},
    ],
    exercises:[
      {q:'Two containers in the same Pod need to share a file. How?', a:'Mount the same Volume in both container specs. In the pod spec define: <code>volumes: [{name: shared, emptyDir: {}}]</code>. In both containers add: <code>volumeMounts: [{name: shared, mountPath: /data}]</code>. Container A writes to /data/output.txt, Container B reads from /data/output.txt — same volume, different containers. This is the classic Sidecar pattern: main app writes logs to /var/log, log-shipper sidecar reads from /var/log and ships to Loki/Elasticsearch.', level:'basic'},
      {q:'What does exit code 137 mean in a K8s pod?', a:'Exit code 137 = 128 + 9 = process killed by signal SIGKILL. In K8s this means OOMKill — the container exceeded its memory limit and the Linux OOM killer forcefully terminated the process. Diagnose: <code>kubectl describe pod | grep OOMKilled</code> or check <code>kubectl get pod -o yaml | grep "exitCode: 137"</code>. Fix: increase the memory limit in the container spec, or profile and fix the memory leak in the application.', level:'basic'},
    ],
    interview:[
      {q:'What is the difference between a Pod and a container in Kubernetes?', level:'basic',
       a:'A container is a running process with an isolated filesystem from a Docker image. A Pod is a K8s abstraction wrapping one or more containers that provides: a shared network namespace (all containers in the pod share the same IP — they reach each other via localhost), shared storage volumes, and a shared lifecycle (all start/stop together). K8s schedules Pods, not individual containers. In practice 90% of Pods have one container, but sidecars (log shippers, proxies, init processes) are common in production.',
       trap:'Saying a Pod is just a container. The shared network namespace is the key — containers in the same Pod use localhost for IPC, containers in separate Pods cannot.'},
    ],
    resources:[{label:'K8s Pods documentation', url:'https://kubernetes.io/docs/concepts/workloads/pods'}]
  },

  {
    id:'k5-deployments', title:'Deployments & ReplicaSets', subtitle:'How stateless apps run reliably in production',
    time:'60 min', type:'lab', certs:['cka','az400'], xp:120,
    concept:{
      plain:'A Deployment manages a set of identical Pods and ensures the right number are always running. It handles rolling updates (replace old pods with new ones gradually, zero downtime) and rollbacks (instantly revert to previous version).',
      analogy:'A Deployment is a staffing agency contract: always 5 developers on Project X with these skills. The ReplicaSet is the agency keeping track of who is working. A developer quits (pod crashes)? Agency immediately finds a replacement. New skills needed (image update)? Agency swaps developers one by one — Project X never stops — until all 5 are the new type.',
      technical:`<strong>Deployment spec fields:</strong><br>
replicas: 3 — desired pod count<br>
selector.matchLabels — which pods this Deployment manages<br>
template — pod spec template (pod labels MUST match selector)<br>
strategy.type: RollingUpdate (default) or Recreate<br>
strategy.rollingUpdate.maxUnavailable: 25% — max pods down during update<br>
strategy.rollingUpdate.maxSurge: 25% — max extra pods during update<br>
revisionHistoryLimit: 10 — old ReplicaSets kept for rollback<br><br>
<strong>Rolling update flow:</strong><br>
1. New ReplicaSet created. 2. New pods created (up to maxSurge). 3. New pods pass readiness probe → traffic switches. 4. Old pods terminated (respecting maxUnavailable). Repeat until all old replaced.<br>
If new pods FAIL readiness: rollout PAUSES. Old pods keep running. Users unaffected.<br><br>
<strong>Recreate strategy:</strong> terminates ALL old pods first, then creates new ones. Causes downtime but only one version runs at a time. Use when two versions cannot coexist.`
    },
    commands:[
      {cmd:'kubectl set image deployment/myapp myapp=myapp:v2', desc:'Update container image — triggers rolling update', when:'Deploying a new version', example:'deployment.apps/myapp image updated', level:'basic'},
      {cmd:'kubectl rollout status deployment/myapp --timeout=5m', desc:'Watch rolling update with 5min timeout — returns exit code 1 if fails', when:'CI/CD pipeline — wait for completion, fail build if deployment fails', example:'Successfully rolled out', level:'basic'},
      {cmd:'kubectl rollout history deployment/myapp', desc:'Show revision history', when:'Before rollback — identify last working revision', example:'REVISION  CHANGE-CAUSE\\n1  Initial\\n2  v2 deploy', level:'basic'},
      {cmd:'kubectl rollout undo deployment/myapp --to-revision=1', desc:'Rollback to specific revision. Omit --to-revision for previous version.', when:'Emergency rollback', example:'deployment rolled back', level:'basic'},
      {cmd:'kubectl scale deployment/myapp --replicas=10', desc:'Scale deployment to 10 replicas immediately', when:'Manual scaling before anticipated traffic spike', example:'deployment scaled', level:'basic'},
    ],
    lab:{
      title:'Zero-Downtime Deployment and Rollback',
      scenario:'Deploy an app, simulate a bad deployment, observe K8s protecting your service, then roll back.',
      cloudUrl:'https://killercoda.com/killer-shell-cka',
      steps:[
        {title:'Deploy initial version', cmd:'kubectl create deployment webapp --image=nginx:alpine --replicas=3\nkubectl expose deployment webapp --port=80\nkubectl rollout status deployment/webapp', expected:'3/3 Running', isBreak:false, desc:''},
        {title:'Successful rolling update', cmd:'kubectl set image deployment/webapp nginx=nginx:1.25-alpine\nkubectl rollout status deployment/webapp', expected:'Pods updated one by one, rollout complete', isBreak:false, desc:''},
        {title:'Deploy a broken version', cmd:'kubectl set image deployment/webapp nginx=nginx:DOESNOTEXIST', expected:'Update started but will pause', isBreak:true, desc:'Watch: kubectl get pods. Old pods stay Running. New pods stuck at ImagePullBackOff. Service continues working. This is the rollout pause safety feature. Fix: kubectl rollout undo deployment/webapp'},
        {title:'Roll back', cmd:'kubectl rollout undo deployment/webapp\nkubectl rollout status deployment/webapp', expected:'Rolled back, 3/3 Running', isBreak:false, desc:''},
        {title:'View history', cmd:'kubectl rollout history deployment/webapp', expected:'3 revisions visible', isBreak:false, desc:''},
        {title:'Clean up', cmd:'kubectl delete deployment webapp && kubectl delete svc webapp', expected:'Deleted', isBreak:false, desc:''},
      ]
    },
    exercises:[
      {q:'A rolling update is stuck with some pods at v2, some at v1. What happened and how do you fix it?', a:'The readiness probe on v2 pods is failing. K8s paused the rollout to protect users — v1 pods keep serving traffic. Diagnosis: <code>kubectl get pods</code> (see mix), <code>kubectl describe pod <new-pod></code> (Events show readiness probe failures). Fix: <code>kubectl rollout undo</code> to revert immediately, or fix the v2 image and retry. This pause is BY DESIGN — K8s never terminates old pods until new ones are healthy.', level:'intermediate'},
      {q:'What is the difference between the Recreate and RollingUpdate deployment strategies?', a:'RollingUpdate (default): replaces pods gradually. Both old and new versions run simultaneously during update. Zero downtime. Requires app to handle two versions live at once (DB migrations must be backward compatible). Recreate: terminates ALL old pods first, then creates all new ones. Causes downtime but only one version ever runs. Use Recreate when: running two versions simultaneously is not possible (exclusive resource locks, schema breaking changes that cannot be backward compatible).', level:'intermediate'},
    ],
    interview:[
      {q:'How does K8s achieve zero downtime during rolling updates?', level:'intermediate',
       a:'The key mechanism is readiness probes. Rolling update: creates new pods, waits for them to pass readiness probes, only then sends traffic to them and terminates old pods. maxUnavailable ensures minimum pods stay running throughout. maxSurge allows extra pods during transition. The guarantee breaks down if readiness probes are misconfigured — if your probe just checks "is the process running" instead of "is the app ready," K8s will declare pods ready too early and may kill old pods before new ones truly work.',
       trap:'Not mentioning readiness probes. The zero-downtime guarantee depends entirely on probes being correct, not just on the rolling update mechanism.'},
    ],
    resources:[{label:'K8s Deployments', url:'https://kubernetes.io/docs/concepts/workloads/controllers/deployment'}]
  },

  {
    id:'k6-statefulsets', title:'StatefulSets — Databases on Kubernetes', subtitle:'Stable identity and persistent storage per pod',
    time:'60 min', type:'concept', certs:['cka'], xp:110,
    concept:{
      plain:'StatefulSets are for applications where each instance needs its own stable identity and dedicated storage — databases, Kafka, Elasticsearch, Redis Cluster.',
      analogy:'Deployment pods are hotel guests — any room works, rooms are interchangeable. StatefulSet pods are office staff with assigned desks. Alice always gets desk A with all her files. When Alice is replaced, new Alice gets desk A with the same files still there. Order matters: senior employee (pod-0) joins before junior (pod-1).',
      technical:`<strong>StatefulSet guarantees:</strong><br>
Stable network identity: pods named pod-0, pod-1, pod-2 — predictable, never random suffix.<br>
Stable storage: each pod gets its own PVC via volumeClaimTemplates. PVC survives pod deletion.<br>
Ordered startup: pod-0 Running before pod-1 starts.<br>
Ordered shutdown: reverse order.<br><br>
<strong>Headless Service (required):</strong><br>
clusterIP: None — DNS returns pod IPs directly for peer discovery.<br>
DNS format: pod-0.service.namespace.svc.cluster.local → pod-0 IP.<br>
Used by Kafka brokers to discover each other, Elasticsearch nodes to form a cluster.<br><br>
<strong>volumeClaimTemplates:</strong><br>
Creates one PVC per pod: data-kafka-0, data-kafka-1, data-kafka-2.<br>
Pod-1 deleted + recreated → reattaches data-kafka-1 (same data intact).<br><br>
<strong>StatefulSet vs Deployment:</strong><br>
StatefulSet: databases, Kafka, Elasticsearch, Redis Cluster, ZooKeeper.<br>
Deployment: REST APIs, web frontends, stateless microservices. Always prefer Deployment for stateless apps.`
    },
    commands:[
      {cmd:'kubectl get statefulset', desc:'List StatefulSets with ready count', when:'Checking StatefulSet health', example:'NAME    READY   AGE\\nkafka   3/3     5d', level:'basic'},
      {cmd:'kubectl get pvc -l app=kafka', desc:'List PVCs created by the StatefulSet — one per replica', when:'Verifying dedicated storage per pod', example:'data-kafka-0  Bound  10Gi\\ndata-kafka-1  Bound  10Gi', level:'intermediate'},
    ],
    exercises:[
      {q:'You delete pod-1 in a 3-replica StatefulSet. What happens?', a:'K8s creates a new pod named pod-1 (same name). The new pod-1 is scheduled on a healthy node and reattaches its existing PVC (data-kafka-1 or similar) — all data intact. Same DNS name (pod-1.service.namespace.svc.cluster.local). From the application perspective: pod-1 came back with its identity and data preserved. This is the core StatefulSet guarantee that makes it suitable for databases and distributed systems.', level:'basic'},
      {q:'Why does a StatefulSet require a Headless Service?', a:'Stateful applications need to communicate with specific peers by name, not just any healthy member. A regular Service returns a single virtual IP routing to a random pod. A Headless Service (clusterIP: None) returns actual DNS A records for each individual pod. This lets Kafka broker-0 discover and connect to broker-1 and broker-2 directly by name for replication. Without Headless Service, peer-to-peer discovery in distributed systems is impossible.', level:'intermediate'},
    ],
    interview:[
      {q:'When would you use a StatefulSet instead of a Deployment?', level:'intermediate',
       a:'StatefulSet when the application needs: 1. Stable network identity — each instance must be reachable at a consistent DNS name (Kafka brokers, Postgres primary/replicas). 2. Per-instance dedicated storage — each replica needs its own separate disk, not shared. 3. Ordered operations — cluster formation requires members to join in order (ZooKeeper). Deployment for everything else — stateless services, REST APIs, web frontends. Common mistake: deploying a database as a Deployment — all replicas share one PVC or have no storage, causing data loss on pod deletion.',
       trap:'Not explaining WHY. "StatefulSets for stateful apps" is not a complete answer — stable identity, dedicated storage, and ordered operations are the specific capabilities that matter.'},
    ],
    resources:[{label:'StatefulSets documentation', url:'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset'}]
  },

  {
    id:'k7-other-workloads', title:'DaemonSets, Jobs & CronJobs', subtitle:'The right controller for every job',
    time:'45 min', type:'concept', certs:['cka'], xp:90,
    concept:{
      plain:'Not every workload runs indefinitely. DaemonSets run exactly one pod per node (monitoring agents), Jobs run tasks to completion (migrations), and CronJobs run tasks on a schedule (backups).',
      analogy:'DaemonSet = building security guard — one per floor, auto-assigned to new floors as the building grows. Job = a contractor hired for one task — works until done, then leaves. CronJob = a cleaner on schedule — every Friday 6pm, does the job, leaves.',
      technical:`<strong>DaemonSet:</strong><br>
One pod per node (or subset via nodeSelector/affinity). Auto-schedules on new nodes added to cluster.<br>
Use for: Fluentd (log collection), Prometheus node-exporter (metrics), Calico/Cilium (CNI networking), GPU drivers, security agents.<br>
System DaemonSets tolerate unschedulable taints (kube-proxy, CNI run everywhere including tainted nodes).<br><br>
<strong>Job:</strong><br>
restartPolicy: Never or OnFailure. completions: how many successful runs needed. parallelism: concurrent pods.<br>
Set ttlSecondsAfterFinished: 3600 to auto-delete (Jobs do NOT auto-delete otherwise).<br>
Use for: DB migrations, data imports, batch processing, one-time setup.<br><br>
<strong>CronJob:</strong><br>
schedule: "0 2 * * *" (2am daily). concurrencyPolicy: Forbid (skip if previous still running). Creates a Job per run.<br>
successfulJobsHistoryLimit: 3 — keep 3 successful job records. failedJobsHistoryLimit: 1.`
    },
    commands:[
      {cmd:'kubectl get daemonset -n kube-system', desc:'List DaemonSets in kube-system — kube-proxy, CNI, node agents', when:'Verifying system DaemonSets run on all nodes', example:'NAME        DESIRED  CURRENT  READY\\nkube-proxy  3        3        3', level:'basic'},
      {cmd:'kubectl create job myjob --image=alpine -- sh -c "echo migration done"', desc:'Create a one-off Job imperatively', when:'Running a quick one-time task without writing YAML', example:'job.batch/myjob created', level:'basic'},
    ],
    exercises:[
      {q:'Where should you run a database migration before your app starts?', a:'As an Init Container in the application Pod spec. Init containers run to completion before any app containers start. If migration fails, the init container fails and the main app NEVER starts — preventing the app from running against an incorrect schema. This is safer than running migration code in app startup because: failure is explicit (pod stays in Init state), it runs before any traffic reaches the app, and init container logs are separate and easy to check.', level:'basic'},
      {q:'Your CronJob creates duplicate Jobs because a previous run did not complete before the next was scheduled. Fix?', a:'Set <code>concurrencyPolicy: Forbid</code> — skips the new run if a previous Job is still active. Alternative: <code>concurrencyPolicy: Replace</code> cancels the previous and starts fresh. Default is Allow (runs concurrently — the cause of duplicates). Also: set <code>activeDeadlineSeconds</code> on the Job to kill it if it runs too long, preventing it from blocking all future runs.', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between a DaemonSet and a Deployment?', level:'basic',
       a:'Deployment: run N replicas regardless of node count. Pods can be on any nodes, multiple on same node. You control the count. Used for applications. DaemonSet: exactly one pod per node automatically. Pod count = node count — you do not set it. New node added = new pod created automatically. Used for infrastructure agents that must run on every node: log collectors, metrics exporters, CNI plugins, security scanners.',
       trap:'Saying DaemonSet is only for system/kube-system pods. Teams run their own DaemonSets for custom agents.'},
    ],
    resources:[{label:'K8s Jobs documentation', url:'https://kubernetes.io/docs/concepts/workloads/controllers/job'}]
  },

  {
    id:'k8-config-secrets', title:'ConfigMaps & Secrets', subtitle:'Externalise config. Never bake it into images.',
    time:'45 min', type:'concept', certs:['cka','az400'], xp:100,
    concept:{
      plain:'ConfigMaps store non-sensitive configuration (env vars, config files). Secrets store sensitive data (passwords, tokens, certificates). Both are injected into pods at runtime — you never rebuild an image to change config.',
      analogy:'ConfigMap = office notice board, public, anyone can read. Secret = a safe, only authorised people with the combination can open it. Both live outside your code. You give the app a key (env var or mounted file) to access the values.',
      technical:`<strong>ConfigMap creation:</strong><br>
<code>kubectl create configmap myconf --from-literal=DB_HOST=db.svc --from-file=nginx.conf</code><br><br>
<strong>ConfigMap usage in pod:</strong><br>
All keys as env vars: <code>envFrom: [{configMapRef: {name: myconf}}]</code><br>
Single key: <code>env: [{name: DB_HOST, valueFrom: {configMapKeyRef: {name: myconf, key: DB_HOST}}}]</code><br>
Mounted as file: <code>volumes: [{name: conf, configMap: {name: myconf}}]</code><br><br>
<strong>Secret types:</strong><br>
Opaque (generic), kubernetes.io/tls, kubernetes.io/dockerconfigjson<br><br>
<strong>Security — critical facts:</strong><br>
Secrets stored in etcd as base64 only — NOT encrypted by default.<br>
base64 is encoding, not encryption. Anyone with kubectl get secret can decode it.<br>
Production hardening: etcd encryption at rest, RBAC restricting secret access, External Secrets Operator pulling from Azure Key Vault / HashiCorp Vault.<br><br>
<strong>Immutable:</strong> set immutable: true to prevent changes and improve performance.`
    },
    commands:[
      {cmd:'kubectl create secret generic db-creds --from-literal=password=mysecret', desc:'Create Secret with literal value. K8s base64-encodes automatically.', when:'Creating a password or token secret', example:'secret/db-creds created', level:'basic'},
      {cmd:'kubectl get secret db-creds -o jsonpath="{.data.password}" | base64 -d', desc:'Decode secret value to plaintext', when:'Verifying a secret has the correct value', example:'mysecret', level:'intermediate'},
    ],
    exercises:[
      {q:'What is the security problem with K8s Secrets and how do you harden them?', a:'Secrets are only base64 encoded in etcd — base64 is reversible, not encryption. Anyone with kubectl get secret or etcd read access sees values in plaintext. Three hardening layers: 1. Enable etcd encryption at rest (EncryptionConfiguration) — encrypts data before writing to etcd disk. 2. RBAC: restrict who can get/list Secrets — separate from who can get other resources. 3. External Secrets Operator with Azure Key Vault or HashiCorp Vault — no sensitive values stored in etcd at all, synced at runtime.', level:'intermediate'},
      {q:'When should you use envFrom vs individual env valueFrom?', a:'envFrom: imports ALL keys from ConfigMap/Secret as env vars at once. Convenient but risky — if someone adds a key that conflicts with an existing env var, it silently overrides. valueFrom: imports specific named keys — explicit and auditable. Rule: for Secrets, always use specific valueFrom — you want to know exactly which secrets are exposed to which containers. For non-sensitive ConfigMaps with many keys, envFrom is acceptable.', level:'intermediate'},
    ],
    interview:[
      {q:'How do you manage secrets in GitOps where all config is stored in Git?', level:'advanced',
       a:'Cannot store plain K8s Secrets in Git — base64 is not encryption and anyone with repo access decodes them. Three approaches: 1. Sealed Secrets: encrypt Secret with cluster public key before committing. Only the cluster can decrypt. Commit the SealedSecret YAML (safe). 2. External Secrets Operator: reference in Git points to Azure Key Vault or Vault path. ESO syncs actual values to K8s Secret at deploy time. No secret values in Git. 3. SOPS: encrypt secret values in YAML using KMS/age keys. Commit encrypted YAML, decrypt in pipeline at apply time.',
       trap:'Saying "just use Sealed Secrets" without explaining why plain Secrets cannot go in Git.'},
    ],
    resources:[{label:'External Secrets Operator', url:'https://external-secrets.io'}]
  },

  {
    id:'k9-resources-probes', title:'Resource Requests, Limits & Health Probes', subtitle:'The two most common causes of production incidents',
    time:'60 min', type:'concept', certs:['cka'], xp:110,
    concept:{
      plain:'Resources tell K8s how much CPU and memory a container needs and is allowed to use. Probes tell K8s when a container is healthy and ready for traffic. Wrong settings cause OOMKills, CrashLoops, and traffic hitting unhealthy pods.',
      analogy:'Requests = desk space you book in advance — nobody else can use it. Scheduler uses bookings to decide which node has room. Limits = maximum desk space security allows — they will forcefully remove you (OOMKill) if you exceed it. Liveness probe = IT checking if your computer is on. Readiness probe = checking if you are ready to take calls.',
      technical:`<strong>CPU:</strong> in millicores. 1000m = 1 core. 100m = 0.1 core. CPU limits THROTTLE (slow down, not kill).<br>
<strong>Memory:</strong> in Mi/Gi. Memory limits KILL (OOMKill, exit code 137) if exceeded.<br>
Set requests = typical usage. Set limits = 2-3x requests for memory (headroom for spikes).<br><br>
<strong>QoS classes:</strong><br>
Guaranteed: requests=limits. Highest priority, last evicted.<br>
Burstable: limits>requests. Middle priority.<br>
BestEffort: no requests or limits set. First evicted under node pressure.<br><br>
<strong>Liveness probe:</strong> fails → container restarted. Detects deadlocks, infinite loops.<br>
<strong>Readiness probe:</strong> fails → removed from Service endpoints (no traffic). Detects: warming up, dependency down, overloaded.<br>
<strong>Startup probe:</strong> disables liveness/readiness until it passes. For slow-starting apps (JVM, large model loading).<br><br>
<strong>Probe types:</strong> httpGet (2xx=success), tcpSocket (connect=success), exec (exit 0=success).<br>
<strong>Probe config:</strong> initialDelaySeconds, periodSeconds, failureThreshold, timeoutSeconds`
    },
    commands:[
      {cmd:'kubectl top pods --sort-by=memory', desc:'Show actual CPU/memory per pod, sorted by memory. Requires metrics-server.', when:'Finding memory hogs, verifying requests are sized correctly', example:'NAME     CPU   MEMORY\\napi-xyz  50m   450Mi', level:'basic'},
    ],
    exercises:[
      {q:'Pod keeps getting OOMKilled every few hours. What is happening and fix?', a:'OOMKilled = exit code 137. Container exceeded its memory limit, Linux OOM killer forcefully terminated it. Immediate fix: increase the memory limit. Real fix: profile application for memory leaks (heap dump, profiler) — the limit increase just delays the inevitable. Also: check if memory requests are set correctly — HPA bases scaling decisions on request utilisation, so undersized requests mean HPA under-scales before memory pressure builds.', level:'intermediate'},
      {q:'What is the difference between liveness and readiness probes? Give a scenario for each.', a:'Liveness: "is this container alive?" Failure = container restarted. Scenario: Java app enters deadlock — JVM running but no threads processing requests. HTTP health endpoint stops responding. Liveness detects this after failureThreshold failures and restarts the container. Readiness: "is this container ready for traffic?" Failure = removed from Service endpoints, NOT restarted. Scenario: API loading a 500MB model on startup — not ready for 30 seconds. Readiness probe fails during warmup, no traffic sent until model is loaded. Both solve different problems.', level:'intermediate'},
    ],
    interview:[
      {q:'What happens if you do not set resource requests and limits on containers?', level:'intermediate',
       a:'Without requests: BestEffort QoS — first pods evicted under node memory pressure. Scheduler cannot make informed placement decisions. HPA cannot work (calculates utilisation as actual / requested — zero denominator). Without limits: a single container can consume all node CPU (throttling others) or all memory (causing other pods to OOMKill). Both are required in production. Standard: requests = p50 (typical) load, limits = p99 + buffer (2-3x requests for memory, less headroom for CPU since throttle not kill).',
       trap:'Not mentioning HPA. Without requests HPA is non-functional — not just slow.'},
    ],
    resources:[{label:'K8s resource management', url:'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers'}]
  },

  {
    id:'k10-storage', title:'Persistent Storage — PV, PVC, StorageClass', subtitle:'Data that survives pod restarts',
    time:'60 min', type:'concept', certs:['cka'], xp:110,
    concept:{
      plain:'Container storage is ephemeral — pod deleted means data lost. PersistentVolumes (PVs) and PersistentVolumeClaims (PVCs) provide durable storage that outlives pods and survives rescheduling.',
      analogy:'PV = pre-built storage unit in a warehouse. PVC = ticket requesting a storage unit of specific size and type. StorageClass = type of storage available (standard HDD, premium SSD, NFS). Submit the ticket (PVC) → warehouse manager (provisioner) finds or builds a matching unit → unit attached to your pod.',
      technical:`<strong>Static provisioning:</strong> admin creates PV → developer creates PVC → K8s binds if compatible.<br>
<strong>Dynamic provisioning (standard):</strong> developer creates PVC with storageClassName → cloud provisioner auto-creates PV → auto-bound.<br><br>
<strong>Access modes:</strong><br>
ReadWriteOnce (RWO): one node at a time. Most block storage (Azure Disk, AWS EBS).<br>
ReadWriteMany (RWX): multiple nodes. Network storage (NFS, Azure File, AWS EFS).<br>
ReadOnlyMany (ROX): multiple nodes read-only.<br><br>
<strong>Reclaim policy:</strong> Retain (keep data after PVC deleted), Delete (auto-delete cloud disk).<br><br>
<strong>AKS storage classes:</strong><br>
default: Azure Standard SSD (RWO)<br>
managed-premium: Azure Premium SSD (RWO, fast)<br>
azurefile: Azure File Share (RWX, shared access)<br><br>
<strong>StatefulSet + volumeClaimTemplates:</strong> auto-creates one PVC per pod. Each pod gets dedicated storage.`
    },
    commands:[
      {cmd:'kubectl get pv,pvc', desc:'List PersistentVolumes and PersistentVolumeClaims with status (Bound/Pending/Lost)', when:'Checking storage provisioning status', example:'pvc/data-0  Bound  pv/pvc-abc  10Gi', level:'basic'},
      {cmd:'kubectl get storageclass', desc:'List available StorageClasses — what storage types can be requested', when:'Before creating PVC — find valid storageClassName values', example:'standard (default)  azure-disk-csi', level:'basic'},
    ],
    exercises:[
      {q:'StatefulSet with 3 replicas. How many PVCs are created, and how are they named?', a:'3 PVCs, created automatically by volumeClaimTemplates. Named: <templateName>-<statefulsetName>-<ordinal>. Example: template name "data", StatefulSet "kafka" → data-kafka-0, data-kafka-1, data-kafka-2. Each pod mounts only its own PVC. Pod-1 deleted and recreated reattaches data-kafka-1 — same data. If you had used a Deployment with one shared PVC, all replicas would write to the same disk and corrupt each other.', level:'basic'},
      {q:'PVC is stuck in Pending state. What are the possible causes?', a:'1. No matching StorageClass — storageClassName in PVC does not match any available. 2. Access mode not supported — RWX requested but only RWO storage classes available. 3. Resource quota exceeded — namespace storage quota is full. Check kubectl describe namespace. 4. No available PVs (static provisioning) — admin has not created a matching PV. 5. Cloud provisioner issue — IAM permissions or quota. Always: kubectl describe pvc for Events.', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between ReadWriteOnce and ReadWriteMany?', level:'intermediate',
       a:'ReadWriteOnce (RWO): volume mounted read-write by a SINGLE NODE at a time. Multiple pods on the SAME node can use it, but pods on DIFFERENT nodes cannot. This is block storage constraint (Azure Disk, AWS EBS are physically attached to one VM). ReadWriteMany (RWX): volume mounted read-write by MULTIPLE NODES simultaneously. Network storage (Azure File, AWS EFS, NFS). Use RWX when: multiple pod replicas on different nodes need shared file access. RWX storage is typically slower and more expensive.',
       trap:'Saying RWO means only one pod. RWO means one NODE — pods on the same node can share it.'},
    ],
    resources:[{label:'K8s storage documentation', url:'https://kubernetes.io/docs/concepts/storage/persistent-volumes'}]
  },

  {
    id:'k11-services', title:'Services — Stable Networking for Pods', subtitle:'How kube-proxy implements virtual IPs',
    time:'60 min', type:'concept', certs:['cka','az400'], xp:110,
    concept:{
      plain:'Pod IPs change every restart. Services provide a stable virtual IP and DNS name that always routes to healthy pods, no matter which pods are currently running.',
      analogy:'Service = reception desk with permanent phone number. Staff (pods) change — people leave, new ones join. But the reception number (ClusterIP) never changes. kube-proxy is the phone exchange routing calls. If a desk is empty (readiness probe failing), the exchange does not route calls there.',
      technical:`<strong>Service types:</strong><br>
ClusterIP (default): virtual IP inside cluster only. kube-proxy iptables DNAT implements it. Not a real interface.<br>
NodePort: static port (30000-32767) on every node. Builds on ClusterIP.<br>
LoadBalancer: provisions cloud LB pointing to NodePort. One LB per service — expensive at scale.<br>
ExternalName: CNAME to external DNS. No proxy.<br>
Headless (clusterIP: None): DNS returns all pod IPs. Used by StatefulSets.<br><br>
<strong>How ClusterIP works (important for interviews):</strong><br>
Traffic to ClusterIP → iptables rule intercepts → DNAT rewrites destination to random healthy pod IP → pod processes → response direct to caller.<br>
ClusterIP never assigned to any real interface — exists only in iptables rules on every node.<br><br>
<strong>Endpoints:</strong> kubectl get endpoints svc — actual pod IPs behind a Service.<br>
Readiness probe failure → pod removed from endpoints → no traffic.`
    },
    commands:[
      {cmd:'kubectl expose deployment myapp --port=80 --target-port=8080 --name=myapp-svc', desc:'Create ClusterIP Service: external port 80 → container port 8080', when:'Exposing a deployment to other services in the cluster', example:'service/myapp-svc exposed', level:'basic'},
      {cmd:'kubectl get endpoints myapp-svc', desc:'Show actual pod IPs behind Service. Empty = no healthy pods.', when:'Diagnosing why traffic is not reaching pods', example:'NAME       ENDPOINTS\\nmyapp-svc  10.244.1.5:8080,10.244.2.3:8080', level:'basic'},
    ],
    exercises:[
      {q:'Service has 3 pods but only 2 receive traffic. How do you find the problem?', a:'1. <code>kubectl get endpoints svc-name</code> — if only 2 IPs shown, pod 3 is not in endpoints. 2. <code>kubectl get pods -l <selector></code> — all 3 Running? 3. <code>kubectl describe pod pod-3</code> — Events show readiness probe failures. Pod 3 is failing its readiness probe — K8s removed it from endpoints BY DESIGN to protect users. Fix the probe failure to restore traffic.', level:'intermediate'},
    ],
    interview:[
      {q:'How does a K8s ClusterIP Service work at the network level?', level:'advanced',
       a:'ClusterIP is not a real interface — it exists only as iptables rules on every node. When pod A sends to ClusterIP:80, the Linux netfilter/iptables chain intercepts the packet before it leaves the node and applies DNAT: rewrites destination from ClusterIP:80 to a randomly selected healthy endpoint IP:targetPort from the EndpointSlice. The pod sends response directly back to pod A (source IP is pod A, not the Service). kube-proxy watches API server for Endpoint changes and updates iptables rules on every node within milliseconds.',
       trap:'Saying the Service forwards requests as a running process. The Service does not exist as a process — it is purely iptables rules.'},
    ],
    resources:[{label:'K8s Services documentation', url:'https://kubernetes.io/docs/concepts/services-networking/service'}]
  },

  {
    id:'k12-ingress', title:'Ingress & TLS — HTTP Routing at Scale', subtitle:'One load balancer for all HTTP services',
    time:'60 min', type:'concept', certs:['cka','az400'], xp:110,
    concept:{
      plain:'Without Ingress, every HTTP service needs its own cloud load balancer. With Ingress, one LB routes all HTTP traffic to the right service based on hostname and URL path.',
      analogy:'Ingress = smart hotel concierge. One phone number (one LB IP), routes based on what you say: "Checking in? Third floor. Restaurant? Ground floor." Concierge (Ingress controller) reads the routing rules you defined. TLS handled at the desk — guests speak plainly.',
      technical:`<strong>Ingress requires a controller:</strong> NGINX Ingress (most popular), Traefik, AGIC (Azure App Gateway), AWS ALB.<br>
<code>helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace</code><br><br>
<strong>Ingress resource:</strong><br>
rules → host → http.paths → path + pathType (Exact/Prefix) + backend service<br>
tls → hosts + secretName (cert stored as K8s Secret)<br><br>
<strong>cert-manager for auto TLS:</strong><br>
Install cert-manager → create ClusterIssuer (Let's Encrypt) → annotate Ingress with cert-manager.io/cluster-issuer → cert auto-provisioned and renewed.<br><br>
<strong>Cost:</strong> 5 services without Ingress = 5 cloud LBs = ~$150/month. With Ingress = 1 LB = ~$30/month.<br><br>
<strong>AGIC on AKS:</strong> Azure App Gateway as Ingress controller. Includes WAF, SSL offload, autoscaling built in.`
    },
    commands:[
      {cmd:'kubectl get ingress -A', desc:'List all Ingress resources with hosts and addresses', when:'Overview of all external access points', example:'NAME    HOSTS          ADDRESS\\nmyapp   api.myapp.com  20.50.1.2', level:'basic'},
    ],
    exercises:[
      {q:'5 microservices all on port 80. How many cloud LBs without Ingress? With Ingress?', a:'Without: 5 LoadBalancer Services = 5 cloud LBs = ~$150/month on Azure/AWS. With Ingress: 1 cloud LB for the Ingress controller routing all 5 by hostname/path = ~$30/month. This is the primary cost argument for Ingress. Rule: all HTTP/HTTPS services go behind Ingress. Use LoadBalancer type directly only for non-HTTP protocols (TCP databases, MQTT brokers, etc.).', level:'basic'},
    ],
    interview:[
      {q:'How does TLS termination work at the Ingress controller?', level:'intermediate',
       a:'TLS termination: Ingress controller decrypts HTTPS, forwards plain HTTP to backend services. Flow: browser connects to LB:443 → TLS handshake with Ingress controller (presents cert from K8s Secret) → controller decrypts, reads HTTP Host header → matches routing rule → forwards plain HTTP to backend Service:port → pod never deals with TLS. cert-manager with Let\'s Encrypt automates cert provisioning and 90-day renewals. This is SSL offloading — backends are simpler, no TLS config needed.',
       trap:'Not clarifying that the backend receives plain HTTP after termination.'},
    ],
    resources:[
      {label:'NGINX Ingress Controller', url:'https://kubernetes.github.io/ingress-nginx'},
      {label:'cert-manager', url:'https://cert-manager.io'},
    ]
  },

  {
    id:'k13-rbac', title:'RBAC — Role-Based Access Control', subtitle:'Who can do what to which resources',
    time:'60 min', type:'lab', certs:['cka','az400'], xp:110,
    concept:{
      plain:'RBAC controls which users and service accounts can perform which operations on which Kubernetes resources in which namespaces.',
      analogy:'Role = keycard template (can access server room and kitchen). RoleBinding = issuing that card to Alice. ClusterRole = master card working in every room (all namespaces). ServiceAccount = the card issued to an application process.',
      technical:`<strong>4 objects:</strong><br>
Role: namespace-scoped permissions.<br>
ClusterRole: cluster-wide permissions OR non-namespaced resources (Nodes, PVs).<br>
RoleBinding: bind Role or ClusterRole to subjects in one namespace.<br>
ClusterRoleBinding: bind ClusterRole cluster-wide.<br><br>
<strong>Rule structure:</strong><br>
apiGroups: ["apps"] (use "" for core: pods/services/configmaps)<br>
resources: ["deployments", "pods"]<br>
verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]<br><br>
<strong>ServiceAccount best practices:</strong><br>
Default SA in every namespace auto-mounted in every pod — over-privileged by default.<br>
Create dedicated SA per application. Minimum required permissions only.<br>
Disable auto-mount where not needed: automountServiceAccountToken: false.<br><br>
<strong>Audit:</strong><br>
kubectl auth can-i create pods --as=system:serviceaccount:ns:sa-name<br>
kubectl auth can-i --list -n myns --as=system:serviceaccount:ns:sa-name`
    },
    commands:[
      {cmd:'kubectl create role pod-reader --verb=get,list,watch --resource=pods -n myns', desc:'Create Role allowing read-only pod access in one namespace', when:'Giving a ServiceAccount read access to pods', example:'role.rbac.authorization.k8s.io/pod-reader created', level:'basic'},
      {cmd:'kubectl create rolebinding app-binding --role=pod-reader --serviceaccount=myns:myapp-sa -n myns', desc:'Bind pod-reader role to myapp-sa ServiceAccount in myns', when:'After creating the Role — link it to the ServiceAccount', example:'rolebinding created', level:'basic'},
      {cmd:'kubectl auth can-i list pods --as=system:serviceaccount:myns:myapp-sa -n myns', desc:'Verify ServiceAccount has permission to list pods', when:'Testing RBAC config before deploying', example:'yes', level:'intermediate'},
    ],
    exercises:[
      {q:'What is the difference between a Role and a ClusterRole?', a:'Role: permissions within a SINGLE namespace. Cannot grant access to non-namespaced resources (Nodes, PVs, Namespaces). ClusterRole: permissions across ALL namespaces, OR for non-namespaced resources. Important: a ClusterRole CAN be bound to a specific namespace using a RoleBinding (not ClusterRoleBinding) — this grants ClusterRole permissions only within that namespace. Useful for reusable permission templates (e.g. "pod-reader" ClusterRole bound in different namespaces to different ServiceAccounts).', level:'basic'},
    ],
    interview:[
      {q:'Why create dedicated ServiceAccounts instead of using the default?', level:'intermediate',
       a:'The default ServiceAccount exists in every namespace and is auto-mounted in every pod. If any workload over-privileges the default SA, ALL pods in the namespace get those powers. Dedicated SAs enable: least privilege (each app gets exactly what it needs), audit trail (API server logs show which SA made each request), easy revocation (disable one SA without affecting others), and Workload Identity integration on AKS (bind Azure RBAC roles to specific K8s SAs for Key Vault access). Security audit should flag any production pod using the default SA.',
       trap:'Saying "it is best practice." The concrete risk is namespace-wide privilege escalation through the default SA.'},
    ],
    resources:[{label:'K8s RBAC documentation', url:'https://kubernetes.io/docs/reference/access-authn-authz/rbac'}]
  },

  {
    id:'k14-network-policy', title:'NetworkPolicy — Kubernetes Firewall', subtitle:'Default allow-all. You must lock it down.',
    time:'45 min', type:'concept', certs:['cka'], xp:100,
    concept:{
      plain:'By default every pod can reach every other pod in the cluster. NetworkPolicy restricts that — you explicitly define which pods can talk to which.',
      analogy:'Default K8s = office with no internal doors. NetworkPolicy adds keycards. Database room only lets API server pods in. API pods only let frontend in.',
      technical:`<strong>Default:</strong> no NetworkPolicy = all ingress/egress allowed.<br><br>
<strong>NetworkPolicy selects pods via podSelector.</strong><br>
Ingress rules: who can connect TO selected pods.<br>
Egress rules: where selected pods can connect TO.<br><br>
<strong>Default deny pattern:</strong><br>
podSelector: {} (matches ALL pods) + policyTypes: [Ingress] + no ingress rules = deny ALL ingress to all pods in namespace. Then add specific allow rules.<br><br>
<strong>Selectors:</strong> podSelector (by label), namespaceSelector (by namespace label), ipBlock (CIDR).<br><br>
<strong>CNI requirement:</strong> NetworkPolicy is only enforced by the CNI plugin.<br>
Flannel does NOT enforce NetworkPolicy.<br>
Use: Calico, Cilium, Weave. On AKS: Azure CNI with Calico or Cilium.`
    },
    commands:[
      {cmd:'kubectl get networkpolicy -A', desc:'List all NetworkPolicies across all namespaces', when:'Checking traffic restrictions in the cluster', example:'NAMESPACE  NAME       POD-SELECTOR  AGE', level:'basic'},
    ],
    exercises:[
      {q:'NetworkPolicy: podSelector: {}, policyTypes: [Ingress], no ingress rules. What happens?', a:'ALL ingress to ALL pods in the namespace is denied. podSelector: {} matches ALL pods. Ingress policyType with empty ingress rules = deny all inbound. This is the default-deny-all ingress pattern. Standard production approach: apply default-deny, then add specific allow rules for each required communication path. This implements zero-trust pod networking.', level:'intermediate'},
    ],
    interview:[
      {q:'You applied a NetworkPolicy to block traffic but the pod still receives it. Why?', level:'intermediate',
       a:'Most common cause: CNI plugin does not enforce NetworkPolicy. Flannel is widely used but does NOT enforce NetworkPolicy — rules are accepted by the API server but have no effect. Solution: switch to Calico, Cilium, or Weave. Check: kubectl get pods -n kube-system (what CNI is running?). Second cause: podSelector does not match the pod\'s actual labels. Verify: kubectl get pod -o yaml | grep labels vs the NetworkPolicy selector.',
       trap:'Not knowing CNI enforcement is required. This is a common production security failure.'},
    ],
    resources:[{label:'Network Policy editor', url:'https://editor.networkpolicy.io'}]
  },

  {
    id:'k15-scheduling', title:'Scheduling — Affinity, Taints & Tolerations', subtitle:'Control exactly where pods land',
    time:'60 min', type:'concept', certs:['cka'], xp:100,
    concept:{
      plain:'By default K8s schedules pods on any available node. Scheduling controls let you require pods on specific nodes, prefer co-location, or spread pods across zones for high availability.',
      analogy:'nodeSelector = "I only sit in open-plan offices" (hard requirement). Node affinity = "I prefer near the design team but flexible" (soft preference). Taint = "Reserved: Senior Engineers Only" sign on a desk. Toleration = senior engineer badge allowing them to sit at reserved desks.',
      technical:`<strong>nodeSelector:</strong> hard requirement. <code>spec.nodeSelector: {disktype: ssd}</code>. Pod Pending if no match.<br><br>
<strong>Node Affinity:</strong><br>
required...Execution = hard (not scheduled if not met)<br>
preferred...Execution = soft (try to satisfy, schedule anyway if impossible)<br>
Operators: In, NotIn, Exists, DoesNotExist<br><br>
<strong>Pod Anti-Affinity:</strong> spread replicas across nodes/zones for HA.<br>
topologyKey: kubernetes.io/hostname (different node), topology.kubernetes.io/zone (different zone)<br><br>
<strong>Taints and Tolerations:</strong><br>
Taint: kubectl taint node node1 gpu=true:NoSchedule<br>
Effects: NoSchedule, PreferNoSchedule, NoExecute (evicts existing pods)<br>
Toleration on pod: allows landing on tainted node<br><br>
<strong>topologySpreadConstraints:</strong> spread with maxSkew — more flexible than anti-affinity.`
    },
    commands:[
      {cmd:'kubectl taint node node1 dedicated=gpu:NoSchedule', desc:'Reserve node1 for GPU workloads only — pods without toleration cannot be scheduled here', when:'Dedicating nodes to specific workload types', example:'node/node1 tainted', level:'intermediate'},
      {cmd:'kubectl get nodes --show-labels', desc:'Show node labels for nodeSelector and affinity configuration', when:'Finding available labels before writing scheduling rules', example:'NAME    LABELS\\nnode1   disktype=ssd,zone=eastus-1', level:'basic'},
    ],
    exercises:[
      {q:'Ensure 3 replicas never run on the same node. Configuration?', a:'Pod anti-affinity with hard requirement: <code>affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution: [{labelSelector: {matchLabels: {app: webapp}}, topologyKey: "kubernetes.io/hostname"}]</code>. Tells scheduler: do not place this pod on a node that already runs a pod with app=webapp. Each replica lands on a different node. If fewer nodes than replicas, extra pods stay Pending (hard requirement cannot be met). Use preferredDuring for soft preference.', level:'intermediate'},
    ],
    interview:[
      {q:'How does the K8s scheduler choose a node?', level:'intermediate',
       a:'Two phases: 1. Filtering: eliminate nodes that cannot run the pod. Checks: enough CPU/memory (requests), nodeSelector match, required affinity, tolerations match taints, node conditions (Ready). Result: list of feasible nodes. 2. Scoring: rank feasible nodes. Plugins score each: LeastAllocated (prefer more free resources), NodeAffinity (prefer matching preferences), InterPodAffinity. Highest score wins. Ties: random. No nodes pass filtering: pod stays Pending with FailedScheduling event.',
       trap:'Saying K8s picks the node with most free resources. Filtering and scoring are separate — a node with most free resources might be filtered out.'},
    ],
    resources:[{label:'K8s scheduling documentation', url:'https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node'}]
  },

  {
    id:'k16-autoscaling', title:'Autoscaling — HPA, VPA & KEDA', subtitle:'Scale automatically based on real demand',
    time:'60 min', type:'concept', certs:['cka'], xp:110,
    concept:{
      plain:'Fixed replicas waste money when traffic is low and cause outages when it spikes. Autoscaling adjusts replica count automatically based on actual load.',
      analogy:'HPA = call centre manager watching queue length, bringing in more agents (pods) when calls pile up. VPA = manager adjusting each agent\'s desk size (CPU/memory) based on actual use. KEDA = manager scaling based on message queue directly — 100 messages = add 1 worker.',
      technical:`<strong>HPA:</strong> scales replicas on metrics (CPU%, memory%, custom). Requires metrics-server. Checks every 15s.<br>
Scale-up: aggressive. Scale-down: conservative (5-min stabilisation window).<br>
Formula: desired = ceil(current * currentMetric / targetMetric)<br>
Example: 3 pods at 90% CPU, target 70% → ceil(3*90/70) = ceil(3.86) = 4 pods.<br><br>
<strong>VPA:</strong> recommends or auto-applies CPU/memory requests. Requires pod restart to apply. Do NOT use HPA and VPA on same resource simultaneously.<br><br>
<strong>KEDA:</strong> scale to ZERO on external events: Azure Service Bus queue length, Kafka lag, Redis list length, Prometheus metric, HTTP RPS.<br>
Best for: batch workloads, event-driven processing. Zero cost when idle.<br><br>
<strong>Cluster Autoscaler:</strong> adds nodes for Pending pods, removes underutilised nodes. Works with HPA.`
    },
    commands:[
      {cmd:'kubectl autoscale deployment myapp --min=2 --max=20 --cpu-percent=70', desc:'Create HPA scaling between 2-20 replicas to keep CPU under 70%', when:'Basic CPU-based autoscaling', example:'horizontalpodautoscaler/myapp created', level:'basic'},
      {cmd:'kubectl get hpa', desc:'Show HPA status: metrics, current vs target, min/max', when:'Checking if HPA is working and current state', example:'NAME   REPLICAS  CPU\\nmyapp  5         65%/70%', level:'basic'},
    ],
    exercises:[
      {q:'HPA: min=2, max=10, cpu=70%. Current: 3 pods at 90% CPU. Result?', a:'Formula: desired = ceil(3 * 90/70) = ceil(3.857) = 4 pods. HPA scales to 4, not to max=10. After scaling if CPU drops to ~67.5% (within target), HPA stops. Scale-up is immediate. Scale-down waits 5 minutes (default stabilisation window) to avoid thrashing.', level:'intermediate'},
      {q:'When should you use KEDA instead of HPA?', a:'KEDA when: 1. Need to scale to ZERO — HPA minimum is 1, KEDA can scale to 0 saving all cost when idle. 2. External trigger — queue depth (Azure Service Bus, SQS, Kafka consumer lag), not pod-internal CPU/memory. 3. Event-driven batch — workers only when messages are queued. Example: image processing service: 0 pods when queue empty, 50 pods when 5000 images queued. HPA cannot achieve scale-to-zero or external event triggers.', level:'intermediate'},
    ],
    interview:[
      {q:'Why does HPA require resource requests to be set?', level:'intermediate',
       a:'HPA calculates CPU utilisation as actual usage / requested CPU. If requests are not set the denominator is zero — the percentage cannot be calculated. K8s shows utilisation as "Unknown" and HPA cannot act. Example: pod using 100m CPU. With requests=200m: 50% utilisation. Without requests: Unknown, HPA disabled. This is why requests are not just best practice for pods using HPA — they are a functional requirement.',
       trap:'Saying "you should set requests anyway." The specific reason for HPA is the formula dependency.'},
    ],
    resources:[{label:'KEDA', url:'https://keda.sh'}]
  },

  {
    id:'k17-security', title:'Pod Security — securityContext & PSA', subtitle:'Non-root, read-only, capabilities dropped',
    time:'45 min', type:'concept', certs:['cka'], xp:100,
    concept:{
      plain:'Pod security context sets the security posture for a pod or container: which Linux user it runs as, whether the filesystem is read-only, and which Linux capabilities it has.',
      analogy:'Hard hat (non-root) mandatory. Fall protection (read-only filesystem) limits damage if something goes wrong. Safety harness (dropped capabilities) prevents access to dangerous areas.',
      technical:`<strong>Pod-level securityContext:</strong><br>
runAsNonRoot: true, runAsUser: 1000, runAsGroup: 1000, fsGroup: 2000<br>
seccompProfile: {type: RuntimeDefault}<br><br>
<strong>Container-level securityContext:</strong><br>
readOnlyRootFilesystem: true<br>
allowPrivilegeEscalation: false<br>
capabilities: {drop: ["ALL"], add: ["NET_BIND_SERVICE"]}<br><br>
<strong>Write temp files with readOnlyRootFilesystem: true:</strong><br>
Mount emptyDir volume at the writable path — readOnly only applies to container FS layers, not volumes.<br><br>
<strong>Pod Security Admission (PSA) K8s 1.25+:</strong><br>
Namespace labels enforce policy profiles:<br>
Privileged: no restrictions. Baseline: blocks known escalations. Restricted: full hardening.<br>
kubectl label namespace myns pod-security.kubernetes.io/enforce=baseline<br><br>
<strong>OPA Gatekeeper / Kyverno:</strong> custom policy engines for more granular rules.`
    },
    commands:[
      {cmd:'kubectl label namespace myns pod-security.kubernetes.io/enforce=baseline', desc:'Apply Pod Security Baseline policy to namespace — rejects non-compliant pods', when:'Enforcing security baseline on a namespace', example:'namespace/myns labeled', level:'intermediate'},
    ],
    exercises:[
      {q:'readOnlyRootFilesystem: true but app writes to /tmp. How do you handle it?', a:'Mount an emptyDir volume at /tmp. readOnlyRootFilesystem makes the union filesystem layers read-only but mounted volumes remain writable. Pod spec: <code>volumes: [{name: tmp, emptyDir: {}}]</code>. Container: <code>volumeMounts: [{name: tmp, mountPath: /tmp}]</code>. emptyDir is ephemeral (deleted with pod) but writable. Apply this pattern to every path the app writes to. readOnlyRootFilesystem + emptyDir for writable paths is the production-standard security pattern.', level:'intermediate'},
    ],
    interview:[
      {q:'What is least privilege applied to K8s pods?', level:'intermediate',
       a:'Six layers: 1. Non-root user (runAsUser: 1000, runAsNonRoot: true). 2. Drop all Linux capabilities (drop: ["ALL"]), add only specifically needed (NET_BIND_SERVICE to bind port 80). 3. Read-only root filesystem (readOnlyRootFilesystem: true). 4. No privilege escalation (allowPrivilegeEscalation: false). 5. Dedicated ServiceAccount with minimum RBAC permissions. 6. Resource requests/limits to prevent resource abuse. Together these dramatically reduce the blast radius of any container compromise.',
       trap:'Listing only non-root. Complete answer requires all six layers.'},
    ],
    resources:[{label:'Security context documentation', url:'https://kubernetes.io/docs/tasks/configure-pod-container/security-context'}]
  },

  {
    id:'k18-debugging', title:'K8s Debugging — Systematic Troubleshooting', subtitle:'A methodology, not a list of random commands',
    time:'60 min', type:'lab', certs:['cka'], xp:110,
    concept:{
      plain:'When K8s breaks, the difference between a 5-minute fix and a 2-hour nightmare is systematic methodology. Check in a defined order, not randomly.',
      analogy:'K8s debugging is A&E medicine — not running every test at once. Vitals first (is the pod running?), symptoms (what do logs say?), specialist tests (events, exec). Production cannot wait for random attempts.',
      technical:`<strong>Systematic flow:</strong><br>
1. kubectl get pods — what state? (Running/Pending/CrashLoop/ImagePullBackOff/OOMKilled)<br>
2. kubectl describe pod — Events section (scheduling failures, probe failures, OOMKill reasons)<br>
3. kubectl logs <name> --previous — previous container logs (current may have none if crashed fast)<br>
4. kubectl exec -it <name> -- sh — check env vars, DNS, connectivity from inside<br>
5. kubectl get events --sort-by=.lastTimestamp — cluster incident timeline<br>
6. kubectl top pods/nodes — resource pressure<br><br>
<strong>Quick reference by symptom:</strong><br>
Pending: resources/affinity/taint mismatch/PVC not bound (check Events)<br>
CrashLoopBackOff: app crash, wrong command, missing env var (logs --previous)<br>
ImagePullBackOff: wrong tag, missing imagePullSecrets, private registry<br>
OOMKilled: exit 137, raise memory limit or fix leak<br>
Service no traffic: readiness failing (get endpoints), wrong selector/targetPort<br>
DNS fail: exec pod -- nslookup svc, check CoreDNS in kube-system`
    },
    commands:[
      {cmd:'kubectl get pods -n myns | grep -v Running', desc:'Show only non-Running pods — quickly see what is broken', when:'First incident overview — find unhealthy pods fast', example:'api-xyz  0/1  CrashLoopBackOff  5', level:'basic'},
      {cmd:'kubectl logs mypod --previous --tail=50', desc:'Last 50 lines from previous container instance', when:'CrashLoopBackOff — current container crashed too fast for logs', example:'Error: ECONNREFUSED db:5432', level:'basic'},
      {cmd:'kubectl get events -n myns --sort-by=.lastTimestamp | tail -20', desc:'Last 20 cluster events chronologically — incident timeline', when:'Understanding what happened and when', example:'Warning FailedScheduling: Insufficient memory', level:'basic'},
    ],
    exercises:[
      {q:'Pod in CrashLoopBackOff, kubectl logs shows nothing. What and why?', a:'Pod crashed so fast current instance produced no logs. Run <code>kubectl logs <pod> --previous</code> — retrieves logs from terminated previous container instance. If still nothing: <code>kubectl describe pod</code> Events for exit codes and reasons. Exit code 1=app error, 137=OOMKilled, 139=segfault, 143=SIGTERM. The exit code guides the next step.', level:'basic'},
      {q:'Service not routing traffic to pods even though pods are Running. Diagnosis?', a:'1. kubectl get endpoints svc-name — are pod IPs listed? Empty = no ready pods. 2. If empty: kubectl get pods -l <selector> — do labels match Service selector? Compare kubectl get svc -o yaml selector vs kubectl get pod --show-labels. 3. If labels match but not in endpoints: pods failing readiness probe. kubectl describe pod shows probe failures. 4. If endpoints has IPs but traffic still fails: targetPort in Service vs container port in pod spec — they must match.', level:'intermediate'},
    ],
    interview:[
      {q:'Walk through debugging a pod that suddenly started crashing after weeks of running fine.', level:'intermediate',
       a:'1. kubectl describe pod — Events: OOMKilled (memory leak over time), probe failure, node pressure. 2. kubectl logs --previous — last output before crash. 3. kubectl top pod — is memory growing over time (leak)? 4. kubectl get events --sort-by=.lastTimestamp — did a ConfigMap or Secret change? Did a node have issues? 5. kubectl rollout history deployment — did a recent deploy happen? 6. kubectl describe node — node under pressure? NodeMemoryPressure evicts pods. Working theory at each step, not random guessing.',
       trap:'Starting with logs without first checking pod state and events.'},
    ],
    resources:[{label:'K8s troubleshooting guide', url:'https://kubernetes.io/docs/tasks/debug'}]
  },

  {
    id:'k19-aks', title:'AKS — Kubernetes on Azure', subtitle:'K8s + Azure features you use at Accenture daily',
    time:'75 min', type:'concept', certs:['az400','cka'], xp:120,
    concept:{
      plain:'AKS is Microsoft\'s managed Kubernetes. Azure manages the control plane — you pay for worker nodes only. AKS adds Azure-specific integrations for identity, networking, and storage.',
      analogy:'AKS = managed apartment building. Azure handles building maintenance (control plane, upgrades, backups). You manage your apartment (workloads, configs). The building has Azure amenities: AAD key cards, Azure File storage rooms, Azure LB for the entrance.',
      technical:`<strong>Managed control plane:</strong> Azure manages API server, etcd, upgrades, HA. No control plane VMs in your subscription.<br><br>
<strong>Node pools:</strong><br>
System pool: CriticalAddonsOnly=true:NoSchedule taint — only K8s system pods.<br>
User pools: your workloads. Multiple pools per cluster (GPU, spot, Windows).<br><br>
<strong>Networking:</strong><br>
kubenet: pods get private IPs not in VNet. Simple.<br>
Azure CNI: pods get real VNet IPs. Required for AGIC, Workload Identity, advanced network policies.<br>
Azure CNI + Cilium: eBPF-based, best NetworkPolicy support and performance.<br><br>
<strong>Workload Identity (recommended):</strong><br>
Annotate K8s ServiceAccount with Azure managed identity client-id.<br>
Pod gets auto-injected Azure token. Accesses Key Vault, Storage, etc without stored credentials.<br><br>
<strong>ACR integration:</strong> az aks update --attach-acr — pull from ACR without imagePullSecrets.<br>
<strong>AGIC:</strong> Azure App Gateway as Ingress. WAF + SSL offload included.<br>
<strong>Upgrades:</strong> control plane first, then node pools. AKS cordons/drains nodes automatically.`
    },
    commands:[
      {cmd:'az aks get-credentials --resource-group myRG --name myCluster', desc:'Download AKS cluster credentials into ~/.kube/config', when:'First connection to an AKS cluster', example:'Merged myCluster into kubeconfig', level:'basic'},
      {cmd:'az aks scale --resource-group myRG --name myCluster --node-count 5 --nodepool-name userpool', desc:'Scale a node pool to 5 nodes', when:'Manual scaling before anticipated traffic spike', example:'Scaling in progress', level:'basic'},
      {cmd:'az aks nodepool list --resource-group myRG --cluster-name myCluster', desc:'List all node pools with VM size, count, and mode', when:'Understanding cluster capacity and pool layout', example:'NAME    MODE    COUNT  VM_SIZE', level:'basic'},
    ],
    exercises:[
      {q:'AKS pod needs Azure Key Vault secrets without credentials in the cluster. Correct approach?', a:'Workload Identity: 1. Create user-assigned managed identity. 2. Grant it Key Vault Secrets User role. 3. Create K8s ServiceAccount annotated with managed identity client ID (azure.workload.identity/client-id). 4. Deploy pod with this ServiceAccount and label azure.workload.identity/use: "true". Azure Workload Identity webhook injects a short-lived token. Pod uses Azure SDK to read secrets. No credentials stored anywhere. Standard enterprise AKS pattern.', level:'intermediate'},
    ],
    interview:[
      {q:'How do you perform AKS cluster upgrades with zero application downtime?', level:'advanced',
       a:'1. Check upgrade path: az aks get-upgrades — only one minor version at a time. 2. Upgrade control plane first (--control-plane-only) — no effect on running pods. 3. Upgrade node pools one at a time. For each node: AKS cordons → drains (respecting PodDisruptionBudgets) → replaces with new node → uncordons. Zero-downtime prerequisites: PodDisruptionBudgets on critical workloads, pod anti-affinity across nodes (no single node has all replicas), readiness probes configured. Without these, node drain causes downtime.',
       trap:'Saying just upgrade. The prerequisites (PDBs, anti-affinity, probes) are what actually prevent downtime.'},
    ],
    resources:[
      {label:'AKS documentation', url:'https://learn.microsoft.com/en-us/azure/aks'},
      {label:'AKS Workload Identity', url:'https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview'},
    ]
  },

  {
    id:'k20-helm', title:'Helm — Kubernetes Package Manager', subtitle:'Templated deployments with versioning and rollback',
    time:'60 min', type:'lab', certs:['az400'], xp:110,
    concept:{
      plain:'Helm packages Kubernetes YAML into charts with configurable values and versioning. Instead of managing 20 separate YAML files, you install a chart with custom values and Helm manages the rest.',
      analogy:'Helm = apt-get for Kubernetes. Chart = package bundling all YAML with defaults. values.yaml = your customisation. helm install creates a release. helm rollback = revert all K8s objects to a previous state instantly.',
      technical:`<strong>Chart structure:</strong><br>
Chart.yaml (metadata), values.yaml (defaults), templates/ (Go template YAML), charts/ (sub-charts), NOTES.txt<br><br>
<strong>Template syntax:</strong><br>
{{ .Values.replicaCount }}, {{ .Release.Name }}, {{ .Chart.Version }}<br>
{{- if .Values.ingress.enabled }} ... {{- end }}, {{- range .Values.env }}<br>
{{ toYaml .Values.resources | nindent 10 }}<br><br>
<strong>Commands:</strong><br>
helm install name ./chart -f values.yaml<br>
helm upgrade name ./chart --set image.tag=v2<br>
helm rollback name 1 (revert to revision 1)<br>
helm uninstall name<br>
helm history name (all revisions)<br>
helm template name ./chart (render YAML without installing)<br><br>
<strong>Idempotent pattern for CI/CD:</strong><br>
helm upgrade --install myapp ./chart -f values-${ENV}.yaml<br>
Installs if not exists, upgrades if exists. One command for all environments.`
    },
    commands:[
      {cmd:'helm upgrade --install myapp ./chart -f values-prod.yaml', desc:'Idempotent install/upgrade — installs if missing, upgrades if present', when:'CI/CD pipeline deploy step', example:'Release myapp deployed/upgraded', level:'basic'},
      {cmd:'helm history myapp', desc:'Show all revision history with status and description', when:'Before rollback — find last working revision number', example:'1 deployed Install\\n2 failed Upgrade failed', level:'basic'},
      {cmd:'helm rollback myapp 1', desc:'Rollback ALL K8s objects managed by this release to revision 1 state', when:'Emergency rollback — more complete than kubectl rollout undo', example:'Rollback was a success', level:'basic'},
      {cmd:'helm template myapp ./chart -f values.yaml', desc:'Render chart to stdout without installing — preview generated YAML', when:'Debugging template issues, reviewing what will be applied', example:'---\\napiVersion: apps/v1...', level:'intermediate'},
    ],
    exercises:[
      {q:'helm upgrade breaks production. How do you revert?', a:'helm history myapp to find last working revision. helm rollback myapp <revision>. This reverts ALL K8s objects the release manages (Deployment, Service, ConfigMap, Ingress, RBAC) to the exact state at that revision. More complete than kubectl rollout undo which only reverts the Deployment. For Helm-managed apps, always use helm rollback.', level:'basic'},
    ],
    interview:[
      {q:'What are Helm hooks and when would you use them?', level:'advanced',
       a:'Hooks run at lifecycle points via annotations: pre-install, post-install, pre-upgrade, post-upgrade, pre-rollback, pre-delete. Common uses: 1. pre-upgrade Job for DB migrations — run migration before new app deployed, fail upgrade if migration fails. 2. post-install Job for smoke tests — verify installation works before marking release successful. 3. pre-delete Job to drain queue or backup data before uninstalling. Hook pods must complete before Helm proceeds. Set helm.sh/hook-delete-policy: hook-succeeded to auto-clean.',
       trap:'Not giving examples. "Hooks run at lifecycle points" without concrete use cases shows theoretical knowledge only.'},
    ],
    resources:[{label:'Helm documentation', url:'https://helm.sh/docs'}]
  },

  {
    id:'k21-gitops-argocd', title:'GitOps & ArgoCD', subtitle:'Git as the single source of truth',
    time:'60 min', type:'concept', certs:['az400'], xp:110,
    concept:{
      plain:'GitOps means Git is the only source of truth for what runs in your cluster. ArgoCD watches Git and continuously ensures the cluster matches what is defined there — automatically fixing any drift.',
      analogy:'Traditional deployment: you drive to the data centre and install software manually. GitOps: you write a shopping list (Git), a robot (ArgoCD) checks if the shop (cluster) has everything on the list. Items missing get added. Extra items not on the list get removed. Manual changes to the shop get undone on the next check.',
      technical:`<strong>GitOps four principles:</strong><br>
Declarative (all state in Git), Versioned (full history), Automated (agent syncs), Continuously reconciled (drift corrected).<br><br>
<strong>ArgoCD Application CRD:</strong><br>
source: Git repo URL + path + revision (branch/tag/commit)<br>
destination: cluster + namespace<br>
syncPolicy: automated (auto-sync on Git change) or manual<br>
selfHeal: true — reverts manual kubectl changes back to Git state<br>
prune: true — deletes K8s objects removed from Git<br><br>
<strong>Rollback = git operation:</strong><br>
git revert HEAD → push → ArgoCD syncs → cluster reverts. Full audit trail in Git.<br><br>
<strong>Secrets in GitOps:</strong><br>
Never commit plain Secrets. Use: Sealed Secrets (encrypted in Git), External Secrets Operator (pull from vault at sync).`
    },
    commands:[
      {cmd:'kubectl get application -n argocd', desc:'List ArgoCD Applications with sync and health status', when:'Overview of all GitOps-managed apps', example:'NAME    SYNC     HEALTH\\nmyapp   Synced   Healthy', level:'basic'},
      {cmd:'argocd app sync myapp', desc:'Manually trigger sync of an Application', when:'After pushing to Git and not wanting to wait for auto-sync', example:'Sync started', level:'basic'},
    ],
    exercises:[
      {q:'Developer runs kubectl scale deployment/api --replicas=10 on ArgoCD cluster with selfHeal: true. What happens?', a:'ArgoCD detects drift within the next reconciliation (default 3 min): cluster has 10 replicas, Git says 3. selfHeal: true → ArgoCD reverts to 3 replicas automatically. The manual change is undone. This is by design — Git is the only truth. To permanently scale to 10: update Git. This also prevents accidental production changes via kubectl in GitOps environments.', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between GitOps and traditional CI/CD?', level:'intermediate',
       a:'Traditional CI/CD (push): pipeline deploys directly via kubectl apply or helm upgrade. Pipeline = deployment mechanism. If it fails mid-run, cluster may be inconsistent. GitOps (pull): pipeline only updates Git (image tag, YAML). ArgoCD inside the cluster pulls Git and applies changes. Key differences: 1. Drift detection — ArgoCD detects and corrects manual changes. Traditional does not monitor post-deploy. 2. Security — cluster access is internal (ArgoCD pulls), not external (pipeline pushes in). 3. Rollback = git revert, no pipeline re-run needed. 4. Git always reflects cluster state — auditability.',
       trap:'Saying GitOps is just storing YAML in Git. GitOps requires automated reconciliation — the continuous comparison and correction is what makes it GitOps.'},
    ],
    resources:[{label:'ArgoCD getting started', url:'https://argo-cd.readthedocs.io/en/stable/getting_started'}]
  },

  {
    id:'k22-pdb-ha', title:'Pod Disruption Budgets & High Availability', subtitle:'Survive node maintenance without downtime',
    time:'45 min', type:'concept', certs:['cka'], xp:90,
    concept:{
      plain:'Pod Disruption Budgets protect your application during planned maintenance like node drains and cluster upgrades, ensuring a minimum number of pods stay running throughout.',
      analogy:'PDB = hospital minimum staffing policy: at least 2 doctors on duty at all times. When management tries to schedule all-hands training (drain all nodes simultaneously), HR blocks it because the hospital cannot function below minimum. PDB = the HR policy enforcing the minimum.',
      technical:`<strong>PodDisruptionBudget spec:</strong><br>
selector: which pods this PDB protects<br>
minAvailable: minimum pods that MUST be running (integer or percentage)<br>
OR maxUnavailable: maximum pods that CAN be disrupted simultaneously<br><br>
<strong>Voluntary disruptions only:</strong><br>
Voluntary (PDB applies): kubectl drain, deployment updates, node pool upgrades.<br>
Involuntary (PDB does NOT apply): node hardware failure, OOMKill, crash.<br><br>
<strong>kubectl drain + PDB:</strong><br>
kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data<br>
Drain RESPECTS PDBs — fails if eviction would violate budget.<br>
--disable-eviction bypasses PDB — NEVER in production.<br><br>
<strong>HA stack (all together):</strong><br>
1. Always >= 2 replicas<br>
2. Pod anti-affinity across nodes<br>
3. topologySpreadConstraints across zones<br>
4. PDB: minAvailable >= 1 or maxUnavailable: 1<br>
5. Readiness probes (traffic protection)<br>
6. Resource requests (proper scheduling)`
    },
    commands:[
      {cmd:'kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data --grace-period=60', desc:'Drain node for maintenance. Respects PDBs. 60s graceful termination.', when:'Before any node maintenance or AKS upgrade', example:'node/node-1 cordoned\\nevicting pod myapp-xyz', level:'intermediate'},
      {cmd:'kubectl uncordon node-1', desc:'Re-enable scheduling on previously cordoned node', when:'After maintenance is complete', example:'node/node-1 uncordoned', level:'basic'},
      {cmd:'kubectl get pdb -A', desc:'List all PodDisruptionBudgets with their allowed-disruptions count', when:'Checking if critical workloads are protected', example:'NAMESPACE  NAME      MIN  ALLOWED-DISRUPTIONS', level:'basic'},
    ],
    exercises:[
      {q:'kubectl drain fails: "cannot evict pod, would violate PodDisruptionBudget." What do you do?', a:'Never use --disable-eviction or --force — could take down all pods. Correct approach: 1. kubectl get pdb — see ALLOWED-DISRUPTIONS column. If 0, at minimum already. 2. kubectl get pods — are some already Pending/failing? Available replicas may be below minAvailable due to existing failures. 3. Wait for failed pods to recover then retry drain. 4. If urgent: temporarily scale up replicas first (raises available count above minAvailable allowing drain to proceed).', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between kubectl cordon and kubectl drain?', level:'basic',
       a:'cordon: marks node as unschedulable — no new pods scheduled here. Existing pods continue running undisturbed. Use when: you want to stop new work going to a node before maintenance without disrupting what is already there. drain: cordons the node AND evicts all existing pods, respecting PodDisruptionBudgets and grace periods. Pods are rescheduled elsewhere. Use when: taking a node out of service (maintenance, upgrade, decommission). drain = cordon + evict all pods.',
       trap:'Saying drain just stops scheduling. Drain BOTH stops new scheduling AND evicts existing pods.'},
    ],
    resources:[{label:'PodDisruptionBudget documentation', url:'https://kubernetes.io/docs/tasks/run-application/configure-pdb'}]
  }

  ] // end lessons
}; // end KUBERNETES_DATA

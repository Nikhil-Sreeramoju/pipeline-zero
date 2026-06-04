// PipelineZero — data/foundation.js v2.0
window.FOUNDATION_DATA = {
  id:'foundation', name:'Foundation', icon:'🐧', tier:1,
  desc:'The non-negotiable base. Linux, Git, and Networking underpin every DevOps tool. Gaps here cause failures in interviews and on-call incidents.',
  lessons:[

  {
    id:'f1-linux-core', title:'Linux Core Commands', subtitle:'The terminal is your home — own it',
    time:'45 min', type:'concept', certs:['lfcs'], xp:100,
    concept:{
      plain:'Linux is the OS running on almost every server, container, and cloud machine in the world. The terminal is how you control it — no mouse, just keyboard commands. Every DevOps tool you will ever use is operated from here.',
      analogy:'Learning the terminal is like learning to cook instead of always ordering takeaway. Harder at first, but once it clicks you can make exactly what you want faster than any GUI can deliver it. The GUI tools change every year. The terminal commands have been the same for 40 years.',
      technical:`<strong>Navigation:</strong> <code>ls -la</code> list all files with permissions, <code>cd /path</code> change directory, <code>pwd</code> print working directory, <code>find /var -name "*.log" -mtime -1</code> find files modified in last 24h<br><br><strong>File operations:</strong> <code>cat file</code> print, <code>less file</code> scroll, <code>head -n 20</code> first 20 lines, <code>tail -f app.log</code> follow live log, <code>cp -r src/ dest/</code> copy, <code>mv old new</code> move/rename, <code>rm -rf dir/</code> delete recursively<br><br><strong>Permissions:</strong> Numbers = sum of read(4)+write(2)+execute(1). <code>chmod 755</code> = owner rwx, group rx, others rx. <code>chmod 644</code> = owner rw, others r. <code>chown user:group file</code> change ownership<br><br><strong>Processes:</strong> <code>ps aux | grep myapp</code> find process, <code>kill -9 PID</code> force kill, <code>top</code> or <code>htop</code> live view, <code>nohup cmd &</code> background<br><br><strong>Disk/Memory:</strong> <code>df -h</code> disk usage, <code>du -sh /var/log/*</code> folder sizes, <code>free -h</code> memory<br><br><strong>Text processing:</strong> <code>grep -r "ERROR" /var/log</code> search files, <code>awk '{print $1}'</code> first column, <code>sed 's/old/new/g'</code> replace, <code>sort | uniq -c | sort -rn</code> count occurrences`
    },
    commands:[
      {cmd:'ls -la', desc:'List all files including hidden ones with permissions, owner, size, and timestamps', when:'First command on any new server — understand what is there', example:'-rw-r--r-- 1 root root 4096 app.conf', level:'basic'},
      {cmd:'find /var -name "*.log" -mtime -1', desc:'Find files matching pattern, -mtime -1 = modified in last 24 hours', when:'Tracking down log files or recently changed configs', example:'/var/log/nginx/access.log', level:'basic'},
      {cmd:'tail -f /var/log/app.log', desc:'Follow a log file in real-time — prints new lines as they are written', when:'Monitoring deployments and debugging live issues. Press Ctrl+C to stop', example:'2026-01-01 INFO Request received', level:'basic'},
      {cmd:'grep -r "ERROR" /var/log --include="*.log"', desc:'Recursively search all .log files for the word ERROR', when:'Finding errors across multiple log files during an incident', example:'/var/log/app.log:ERROR DB timeout at line 42', level:'basic'},
      {cmd:'ps aux | grep nginx', desc:'List all processes and filter for ones matching nginx', when:'Check if a service is running and find its PID', example:'root 1234 0.0 0.0 nginx: master process', level:'basic'},
      {cmd:'kill -9 1234', desc:'Forcefully terminate process PID 1234. -9=SIGKILL, cannot be ignored. Try kill -15 first (graceful)', when:'Process is hung and not responding to normal termination', example:'(process terminated)', level:'basic'},
      {cmd:'df -h', desc:'Show disk usage of all filesystems in human-readable format', when:'Diagnosing "no space left on device" errors', example:'/dev/sda1 50G 45G 5G 90% /', level:'basic'},
      {cmd:'du -sh /var/log/*', desc:'Show size of each directory inside /var/log in human-readable format', when:'Finding what is eating up disk space', example:'2.1G /var/log/nginx\n500M /var/log/app', level:'intermediate'},
      {cmd:'chmod 755 script.sh && chown deploy:deploy script.sh', desc:'Set script permissions and change ownership in one line', when:'Setting up deployment scripts', example:'(permissions and owner updated)', level:'basic'},
      {cmd:"awk '{print $1, $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20", desc:"Extract IP and URL columns, count occurrences, show top 20 most frequent requests", when:"Analysing traffic patterns during incidents", example:"1234 192.168.1.1 /api/health", level:"advanced"},
      {cmd:"sed -i 's/localhost/db.prod.svc.cluster.local/g' config.yml", desc:'Find and replace text in-place in a file (-i flag)', when:'Updating config files in deployment automation scripts', example:'(file modified)', level:'intermediate'},
    ],
    lab:{
      title:'Server Triage — Diagnose a Slow Server in 5 Minutes',
      scenario:'You SSH into a server that is behaving strangely. CPU is high, disk might be full. Your job: diagnose it systematically using only the terminal.',
      cloudUrl:'https://killercoda.com/learn/course/linux-basics',
      steps:[
        {title:'Check system load', cmd:'uptime && nproc', expected:'load average: X.X — compare to nproc (number of CPU cores). Load > cores = overloaded', isBreak:false, desc:'Load average over 1, 5, 15 minutes. If greater than number of CPU cores, system is under stress.'},
        {title:'Find top CPU processes', cmd:'ps aux --sort=-%cpu | head -10', expected:'List sorted by CPU usage — top offender visible at top', isBreak:false, desc:''},
        {title:'Check disk space', cmd:'df -h && du -sh /var/log/* 2>/dev/null | sort -rh | head -5', expected:'Disk usage per filesystem + top 5 largest log directories', isBreak:false, desc:'Full disk at 100% is a very common server problem.'},
        {title:'Create a large file to simulate disk pressure', cmd:'dd if=/dev/zero of=/tmp/bigfile bs=1M count=200 2>&1', expected:'209715200 bytes transferred', isBreak:True, desc:'Now run df -h again — you will see reduced space. Find it with du -sh /tmp/* then clean up.'},
        {title:'Clean up', cmd:'rm /tmp/bigfile && echo "Space restored:"&& df -h | grep tmpfs', expected:'Space restored', isBreak:False, desc:''},
      ]
    },
    exercises:[
      {q:'What command shows all running processes with CPU and memory usage, and updates in real-time?', a:'<code>top</code> or the better alternative <code>htop</code>. htop adds: colour coding, mouse support, ability to sort by any column (F6), kill processes interactively (F9), and see process tree. Both show CPU%, MEM%, PID, and command. On a server without htop, top is always available.', level:'basic'},
      {q:'How do you view the last 100 lines of a log file AND keep watching for new entries?', a:'<code>tail -n 100 -f /var/log/app.log</code>. The -n 100 shows the last 100 lines first, then -f follows (streams) new lines as they are written. This is your go-to tool when watching a deployment or debugging a live issue. Press Ctrl+C to stop following.', level:'basic'},
      {q:'What does chmod 777 do and why should you never use it in production?', a:'chmod 777 gives read+write+execute to owner, group, AND all other users. Any user on the system (or a compromised process running as any user) can read, modify, or execute the file. In production: never use 777. Use 755 for executables/directories (owner write, others read/execute), 644 for config files (owner write, others read only), 600 for secrets (owner only).', level:'basic'},
      {q:'How do you find all files larger than 100MB on a server?', a:'<code>find / -size +100M -type f 2>/dev/null</code>. The -size +100M finds files larger than 100 megabytes. -type f means files only (not directories). 2>/dev/null suppresses permission errors for directories you cannot read. Add -exec ls -lh {} \; to see the file sizes in human-readable format.', level:'intermediate'},
      {q:'A service writes logs to /var/log/myapp.log and the disk is now 95% full. What are your options?', a:'Immediate relief: 1. <code>truncate -s 0 /var/log/myapp.log</code> — empty the log file without deleting it (the process keeps its file handle). 2. <code>gzip /var/log/myapp.log.1</code> — compress older rotated logs. Long-term fix: set up logrotate to automatically rotate and compress log files. Configure app to set a max log size. Consider shipping logs to a central aggregator (Loki, ELK) instead of local disk.', level:'intermediate'},
    ],
    interview:[
      {q:'A Linux server is responding slowly. Walk me through your diagnosis.', level:'intermediate',
       a:'Systematic approach — check four bottlenecks in order:<br><strong>1. CPU:</strong> <code>top</code> — any process at 100%? Check load average vs <code>nproc</code>.<br><strong>2. Memory:</strong> <code>free -h</code> — is swap being used? High swap = out of RAM.<br><strong>3. Disk I/O:</strong> <code>iostat -x 1</code> or <code>iotop</code> — which process is hammering disk?<br><strong>4. Network:</strong> <code>ss -s</code> — connection storms? <code>iftop</code> — unusual traffic?<br>Also: <code>journalctl -xe</code> for recent system errors, <code>dmesg | tail -20</code> for kernel messages.',
       trap:'Only checking CPU. The slowdown is very often disk I/O (a process filling the disk or thrashing) or swap (out of memory). Checking all four bottlenecks shows systematic senior-engineer thinking.'},
      {q:'What is the difference between a process and a thread in Linux?', level:'intermediate',
       a:'A process is an independent execution unit with its own memory space, file descriptors, and PID. Processes are isolated — one cannot read another\'s memory without special mechanisms. A thread is a lighter execution unit inside a process — threads within the same process share memory space and file descriptors. Creating a thread is cheaper (less memory overhead) than creating a process. In K8s: each container has its own process namespace (isolated PIDs) but containers in the same Pod share the same network namespace (same IP).',
       trap:'Stopping at "threads share memory." Connecting to K8s pod/container context shows you have made the DevOps connection.'},
    ],
    resources:[
      {label:'Killercoda Linux Basics — free in-browser lab', url:'https://killercoda.com/learn/course/linux-basics'},
      {label:'OverTheWire Bandit — learn Linux by hacking (free)', url:'https://overthewire.org/wargames/bandit'},
      {label:'tldr.sh — simplified man pages', url:'https://tldr.sh'},
    ]
  },

  {
    id:'f2-shell-scripting', title:'Shell Scripting & Automation', subtitle:'Stop doing the same thing twice',
    time:'60 min', type:'lab', certs:['lfcs','az400'], xp:120,
    concept:{
      plain:'A shell script is a file of terminal commands that runs in sequence. Instead of typing the same 10 commands every deployment, you write them once and run the file. Every CI/CD pipeline step is essentially a shell script.',
      analogy:'Shell scripts are kitchen recipes. A chef does not improvise the same dish from memory every service — they write the recipe once, follow it every time, and the result is always the same. A good DevOps engineer automates anything they do more than three times. That is the difference between a junior who types commands and a senior who writes tools.',
      technical:`<strong>Standard script header:</strong><br>
<code>#!/bin/bash</code> — shebang: tells OS which interpreter to use<br>
<code>set -e</code> — exit immediately on any error<br>
<code>set -o pipefail</code> — catch failures inside pipes (cmd1 | cmd2)<br>
<code>set -u</code> — error on undefined variables<br><br>
<strong>Variables:</strong> <code>NAME="value"</code>, reference as <code>$NAME</code> or <code>\${NAME}</code><br>
Default: <code>ENV=\${DEPLOY_ENV:-"staging"}</code><br>
Command substitution: <code>DATE=$(date +%Y-%m-%d)</code><br><br>
<strong>Control flow:</strong><br>
<code>if [ -f "$FILE" ]; then ... fi</code><br>
<code>for NS in dev staging prod; do kubectl get pods -n $NS; done</code><br>
<code>while ! curl -f $URL; do sleep 5; done</code><br><br>
<strong>Functions:</strong> <code>deploy() { kubectl apply -f $1 && kubectl rollout status deploy/$2; }</code><br><br>
<strong>Exit codes:</strong> <code>$?</code> = last command exit code. 0=success, non-zero=failure.<br><br>
<strong>Key tools in scripts:</strong> <code>jq</code> (parse JSON/kubectl output), <code>awk</code> (columns), <code>sed</code> (replace), <code>xargs</code> (pipe to commands)`
    },
    commands:[
      {cmd:'#!/bin/bash\nset -euo pipefail', desc:'Standard safe script header. -e=exit on error, -u=undefined vars are errors, -o pipefail=catch pipe failures', when:'First three lines of every production shell script', example:'', level:'basic'},
      {cmd:'VAR=\${INPUT:-"default_value"}', desc:'Use INPUT if set, otherwise use default_value. Prevents scripts from failing when env var is missing', when:'Scripts that accept optional environment variable configuration', example:'', level:'basic'},
      {cmd:'kubectl get pods -o json | jq -r \".items[].metadata.name\"', desc:'Parse kubectl JSON output with jq to extract just the pod names', when:'Scripting operations that need to loop over pods', example:'nginx-abc123', level:'intermediate'},
      {cmd:'trap "rm -f /tmp/lockfile; kubectl delete pod debug 2>/dev/null" EXIT', desc:'Always run cleanup on script exit, even if the script fails', when:'Scripts that create temporary resources that must be cleaned up', example:'', level:'intermediate'},
      {cmd:'for i in $(seq 1 5); do kubectl rollout status deploy/myapp && break || sleep 10; done', desc:'Retry kubectl rollout status up to 5 times with 10 second delay', when:'Waiting for deployments to complete in CI/CD pipelines', example:'Waiting for deployment spec update to be observed...', level:'intermediate'},
    ],
    lab:{
      title:'Write a Kubernetes Deployment Health Check Script',
      scenario:'Write a reusable script that checks if a K8s deployment is healthy. It should print pass/fail and return exit code 1 on failure so CI/CD pipelines detect it.',
      cloudUrl:'https://killercoda.com/playgrounds/scenario/kubernetes',
      steps:[
        {title:'Create the script', cmd:'cat > health_check.sh << "SCRIPT"\n#!/bin/bash\nset -euo pipefail\n\nDEPLOY=\${1?"Usage: \$0 <deployment> [namespace]"}\nNS=${2:-"default"}\n\necho "Checking $DEPLOY in namespace $NS..."\nSCRIPT', expected:'File created', isBreak:false, desc:'${1?"message"} exits with error if argument 1 is not provided — built-in argument validation.'},
        {title:'Add the replica health check', cmd:'cat >> health_check.sh << "SCRIPT"\n\nREADY=$(kubectl get deploy $DEPLOY -n $NS -o jsonpath=\'{.status.readyReplicas}\' 2>/dev/null || echo 0)\nDESIRED=$(kubectl get deploy $DEPLOY -n $NS -o jsonpath=\'{.spec.replicas}\' 2>/dev/null || echo 1)\n\n[ "$READY" = "$DESIRED" ] && echo "✅ PASS: $READY/$DESIRED replicas ready" || { echo "❌ FAIL: $READY/$DESIRED replicas ready"; exit 1; }\nSCRIPT\nchmod +x health_check.sh', expected:'Script updated', isBreak:false, desc:'[ "$A" = "$B" ] && success || { failure; exit 1; } is a common one-line if/else pattern.'},
        {title:'Deploy a test app', cmd:'kubectl create deployment nginx --image=nginx:alpine --replicas=2 2>/dev/null || true\nkubectl rollout status deployment/nginx', expected:'deployment nginx successfully rolled out', isBreak:false, desc:''},
        {title:'Run health check — should pass', cmd:'./health_check.sh nginx default', expected:'✅ PASS: 2/2 replicas ready', isBreak:false, desc:''},
        {title:'Simulate a failed deployment', cmd:'kubectl scale deployment nginx --replicas=0\n./health_check.sh nginx default || echo "Exit code: $?"', expected:'❌ FAIL — exit code 1', isBreak:True, desc:'Exit code 1 tells CI/CD systems like Azure Pipelines and GitHub Actions that the step failed. Scale back: kubectl scale deployment nginx --replicas=2'},
        {title:'Clean up', cmd:'kubectl delete deployment nginx && rm health_check.sh', expected:'Deployment deleted', isBreak:False, desc:''},
      ]
    },
    exercises:[
      {q:'What does set -e do and why is it critical for deployment scripts?', a:'<code>set -e</code> causes the script to exit immediately if any command returns a non-zero exit code. Without it, a failed command (e.g. kubectl apply failing because of a syntax error) is silently ignored and the script continues — potentially leaving infrastructure in a broken half-deployed state. Always pair with <code>set -o pipefail</code> which catches failures inside pipes (without it, <code>bad_command | grep something</code> succeeds even if bad_command fails).', level:'basic'},
      {q:'How do you pass arguments to a shell script and validate they exist?', a:'Arguments are accessed as $1, $2, etc. Validate with: <code>\${1?"Error: argument 1 required"}</code> — this exits with an error message if $1 is not provided. Or: <code>if [ $# -lt 2 ]; then echo "Usage: $0 arg1 arg2"; exit 1; fi</code>. For named parameters use <code>while getopts "n:e:" opt; do</code> (getopts built-in).', level:'intermediate'},
      {q:'Write a one-liner that waits for a URL to return HTTP 200, retrying every 5 seconds.', a:'<code>until curl -sf http://localhost:8080/health; do echo "Waiting..."; sleep 5; done; echo "Service is up"</code>. The -s flag suppresses output, -f flag makes curl return exit code 22 on HTTP errors (4xx/5xx). <code>until</code> keeps looping until the command succeeds. Add a timeout: <code>TIMEOUT=60; START=$SECONDS; until curl -sf $URL || [ $((SECONDS-START)) -ge $TIMEOUT ]; do sleep 5; done</code>', level:'intermediate'},
    ],
    interview:[
      {q:'How do you handle errors in shell scripts to prevent silent failures?', level:'intermediate',
       a:'Three layers: 1. <code>set -e</code> — exit on any command failure. 2. <code>set -o pipefail</code> — exit on pipe failures. 3. <code>trap "cleanup_function" ERR EXIT</code> — run cleanup on errors or exit. For individual commands where failure is expected: <code>kubectl get pod mypod 2>/dev/null || echo "Pod not found"</code>. Log errors with timestamps: <code>error() { echo "[ERROR $(date +%T)] $*" >&2; exit 1; }</code>. The >&2 sends to stderr, not stdout.',
       trap:'Just saying "use set -e." Production scripts also need pipefail, trap for cleanup, and meaningful error messages with timestamps.'},
    ],
    resources:[
      {label:'ShellCheck — find bugs in your bash scripts online', url:'https://www.shellcheck.net'},
      {label:'Google Shell Style Guide', url:'https://google.github.io/styleguide/shellguide.html'},
    ]
  },

  {
    id:'f3-git', title:'Git & Version Control', subtitle:'Every pipeline starts with git push',
    time:'45 min', type:'concept', certs:['az400','aws'], xp:100, animationId:'git-branching',
    concept:{
      plain:'Git tracks every change you make to files, lets you go back to any version, and enables teams to work in parallel without overwriting each other. It is the trigger for every CI/CD pipeline.',
      analogy:'Git is a time machine for your work. Every commit is a save point. Branches are parallel universes where you can experiment safely — the original stays untouched. Merging brings the best of two universes together. The reflog is the time machine\'s history log — you can recover almost anything.',
      technical:`<strong>Core workflow:</strong> clone → add → commit → push → pull<br>
<code>git clone url</code>, <code>git status</code>, <code>git add -A</code>, <code>git commit -m "type: message"</code>, <code>git push origin branch</code><br><br>
<strong>Branching:</strong><br>
<code>git checkout -b feature/name</code> — create + switch<br>
<code>git merge feature/name</code> — merge (preserves history with merge commit)<br>
<code>git rebase main</code> — replay commits on tip of main (linear history, rewrites SHAs)<br><br>
<strong>Undoing:</strong><br>
<code>git revert HEAD</code> — undo last commit by adding new commit (SAFE for shared branches)<br>
<code>git reset --hard HEAD~1</code> — delete last commit and changes (DANGEROUS, local branches only)<br>
<code>git stash / git stash pop</code> — temporarily save uncommitted work<br><br>
<strong>Advanced:</strong><br>
<code>git reflog</code> — recover anything — shows every HEAD move ever<br>
<code>git bisect</code> — binary search to find bug-introducing commit<br>
<code>git cherry-pick abc123</code> — apply one commit from any branch<br>
<code>git log --oneline --graph --all</code> — visual history`
    },
    commands:[
      {cmd:'git log --oneline --graph --all', desc:'Show compact visual history of all branches as a graph', when:'Understanding branch structure and reviewing recent history', example:'* abc123 feat: add ingress\n* def456 fix: probe', level:'basic'},
      {cmd:'git checkout -b feature/add-monitoring', desc:'Create a new branch and switch to it in one command', when:'Starting any new feature or fix — never commit directly to main', example:'Switched to a new branch', level:'basic'},
      {cmd:'git stash && git checkout main && git stash pop', desc:'Save work, switch to main, restore work — all without committing', when:'Urgent fix needed while mid-feature', example:'Saved working directory', level:'intermediate'},
      {cmd:'git revert HEAD --no-edit', desc:'Undo last commit by creating a new commit — safe for shared branches, preserves history', when:'Fixing a bad commit that has already been pushed to main', example:'[main abc789] Revert bad commit', level:'intermediate'},
      {cmd:'git bisect start && git bisect bad HEAD && git bisect good v1.2', desc:'Start binary search to find which commit introduced a bug. Git checks out midpoints, you test and mark good/bad', when:'Bug appeared sometime in the last N commits and you need to find exactly when', example:'First bad commit is: abc123', level:'advanced'},
      {cmd:'git cherry-pick abc123..def456', desc:'Apply a range of commits from another branch to current branch', when:'Backporting specific bug fixes to a release branch', example:'Applied commits successfully', level:'advanced'},
    ],
    lab:{
      title:'Professional Git Workflow for a DevOps Config Change',
      scenario:'Practise the complete branch → commit → review → merge workflow that professional teams use. This mirrors daily work at companies using GitHub/Azure DevOps.',
      cloudUrl:'https://learngitbranching.js.org',
      steps:[
        {title:'Set up a local repo', cmd:'mkdir pz-git && cd pz-git && git init && git config user.email "you@example.com" && git config user.name "DevOps" && git commit --allow-empty -m "init"', expected:'Initialized empty Git repository', isBreak:false, desc:''},
        {title:'Create feature branch', cmd:'git checkout -b feat/add-monitoring-namespace', expected:'Switched to a new branch feat/add-monitoring-namespace', isBreak:false, desc:'Never work directly on main. Branch names should describe what the change does.'},
        {title:'Create a K8s config and commit', cmd:'printf "apiVersion: v1\nkind: Namespace\nmetadata:\n  name: monitoring\n  labels:\n    team: platform" > monitoring-ns.yaml && git add . && git commit -m "feat: add monitoring namespace with platform label"', expected:'1 file changed', isBreak:false, desc:'Conventional commit format: type(scope): description. Types: feat, fix, docs, chore, refactor, test'},
        {title:'Review what you are about to merge', cmd:'git diff main..feat/add-monitoring-namespace', expected:'Shows your new file as a diff', isBreak:false, desc:'Always review the diff before merging. This is what a code reviewer sees in a PR.'},
        {title:'Merge to main', cmd:'git checkout main && git merge feat/add-monitoring-namespace --no-ff -m "Merge: add monitoring namespace"', expected:'Merge commit created', isBreak:false, desc:'--no-ff creates a merge commit even if fast-forward is possible. This preserves branch history in the log.'},
        {title:'Break it then fix it with revert', cmd:'echo "BROKEN_CONFIG" >> monitoring-ns.yaml && git add . && git commit -m "mistake: broke the config"\ngit log --oneline\ngit revert HEAD --no-edit\ngit log --oneline', expected:'Revert commit visible, original commit still in history', isBreak:True, desc:'Notice: both the mistake AND the revert are visible in history. This is correct — full audit trail. Never use reset --hard on shared branches.'},
        {title:'Clean up', cmd:'cd .. && rm -rf pz-git', expected:'', isBreak:false, desc:''},
      ]
    },
    exercises:[
      {q:'What is the difference between git merge and git rebase? When should you use each?', a:'<strong>Merge</strong> creates a merge commit joining two branches — history shows exactly when branches diverged and merged. Preserves the full picture. <strong>Rebase</strong> replays your commits on top of the target — creates linear history with no merge commit, but rewrites commit SHAs. Use rebase for: cleaning up your local feature branch before a PR (makes it easier to review). Use merge for: integrating branches into main, hotfixes. Rule: never rebase shared branches (main, develop) — you rewrite SHAs that others have already pulled.', level:'intermediate'},
      {q:'You accidentally committed and pushed a secret (API key) to main. What do you do?', a:'Step 1 (IMMEDIATE): Rotate/invalidate the API key right now — assume it is already compromised. Git history is public/accessible. Step 2: <code>git revert HEAD</code> and push — this removes the key from the latest code. Step 3: The key still exists in git history. To fully remove: use BFG Repo Cleaner (<code>bfg --replace-text secrets.txt repo.git</code>) then force push. Step 4: Enable secret scanning (GitHub has it built-in, Azure DevOps has it as a setting) to prevent this happening again.', level:'intermediate'},
      {q:'What does git reflog do and when would you use it?', a:'reflog is a log of every HEAD movement — every checkout, commit, reset, merge, rebase, and pull. It is your safety net. Use it when: you did <code>git reset --hard</code> and lost commits, you deleted a branch you needed, you rebased and made a mess. <code>git reflog</code> shows the SHA of every state HEAD was in. Then <code>git checkout abc123</code> or <code>git branch recovered abc123</code> to get it back. Git keeps reflog entries for at least 90 days.', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between git revert and git reset --hard?', level:'intermediate',
       a:'<code>git revert</code> creates a new commit that undoes a previous commit — history is preserved, the original commit is still visible, teammates who already pulled are not affected. SAFE for shared/remote branches. <code>git reset --hard</code> moves the HEAD pointer back, deleting commits from history. If those commits were already pushed, this creates diverged history and breaks everyone else\'s copy of the branch. ONLY use reset --hard on local branches you have not pushed yet.',
       trap:'Not mentioning the shared branch problem. In interviews this distinction is specifically tested — using reset --hard on a shared branch is a common team-wrecking mistake.'},
    ],
    resources:[
      {label:'Learn Git Branching — visual interactive', url:'https://learngitbranching.js.org'},
      {label:'Conventional Commits specification', url:'https://www.conventionalcommits.org'},
    ]
  },

  {
    id:'f4-networking', title:'Networking Fundamentals for DevOps', subtitle:'TCP/IP, DNS, TLS, HTTP — the pipes everything flows through',
    time:'60 min', type:'concept', certs:['cka','az400'], xp:120,
    concept:{
      plain:'Everything in DevOps moves through a network. Deployments, app traffic, monitoring data, database connections. Understanding how data travels between machines is essential for debugging connectivity issues and designing reliable systems.',
      analogy:'The internet is a postal system. IP address = street address. Port = apartment number. DNS = the phonebook that converts "google.com" into a street address. TCP = registered mail — tracked and guaranteed. UDP = dropping a flyer through a letterbox — fast, no confirmation. TLS = a tamper-proof sealed envelope — only the recipient can open it. A load balancer = a sorting office that distributes incoming mail across multiple delivery teams.',
      technical:`<strong>OSI layers that matter for DevOps:</strong><br>
L3 = IP (routing between machines), L4 = TCP/UDP (ports, sessions), L7 = HTTP (application)<br>
<em>K8s Services are L4. K8s Ingress is L7. This distinction is critical.</em><br><br>
<strong>TCP 3-way handshake:</strong> SYN → SYN-ACK → ACK. Every TCP connection begins this way.<br><br>
<strong>DNS resolution chain:</strong> Browser cache → OS /etc/hosts → OS DNS cache → Recursive resolver → Root (.) → TLD (.com) → Authoritative server → IP returned. TTL controls cache lifetime.<br><br>
<strong>HTTP status codes:</strong> 200=OK, 201=Created, 301/302=Redirect, 400=Bad Request, 401=Unauthorized, 403=Forbidden, 404=Not Found, 429=Rate Limited, 500=Server Error, 502=Bad Gateway, 503=Service Unavailable, 504=Gateway Timeout<br><br>
<strong>TLS handshake:</strong> Client hello (supported ciphers) → Server cert (public key + CA signature) → Client verifies CA → Key exchange → Symmetric session key agreed → Encrypted channel established<br><br>
<strong>CIDR:</strong> 10.0.0.0/24 = 256 IPs. /16 = 65536 IPs. /32 = 1 IP. K8s defaults: pods=10.244.0.0/16, services=10.96.0.0/12`
    },
    commands:[
      {cmd:'curl -v https://api.example.com 2>&1 | head -40', desc:'Verbose HTTP request showing DNS resolution, TLS handshake, headers, response', when:'Diagnosing HTTPS connectivity and certificate issues', example:'* Connected\n* TLS handshake\n< HTTP/2 200', level:'basic'},
      {cmd:'curl -o /dev/null -s -w "%{http_code} %{time_total}s" http://svc:8080/health', desc:'Return only HTTP status code and total request time — perfect for health check scripts', when:'CI/CD health checks, smoke tests after deployment', example:'200 0.043s', level:'intermediate'},
      {cmd:'dig +short my-service.default.svc.cluster.local', desc:'DNS lookup for a K8s service using cluster DNS format. +short shows just the IP', when:'Verifying K8s service DNS resolution is working', example:'10.96.123.45', level:'intermediate'},
      {cmd:'nc -zv db.internal 5432 && echo "DB port open"', desc:'Test TCP port 5432 is reachable without needing the database client', when:'Pre-flight checks before deploying apps that need database access', example:'Connection to db.internal 5432 succeeded', level:'basic'},
      {cmd:'ss -tulpn | grep LISTEN', desc:'Show all listening TCP/UDP ports with process names — faster and more accurate than netstat', when:'Port conflict debugging, security auditing what services are exposed', example:'tcp LISTEN 0 128 *:8080 users:((java,pid=1234))', level:'basic'},
    ],
    exercises:[
      {q:'A pod cannot reach a service in the same namespace. Walk through your debug steps.', a:'In order: 1. <code>kubectl exec pod -- nslookup service-name</code> — does DNS resolve to an IP? 2. <code>kubectl exec pod -- nc -zv service-name PORT</code> — is the port reachable? 3. <code>kubectl get endpoints service-name</code> — does the service have healthy pod IPs? Empty endpoints = all pods failing readiness probes. 4. <code>kubectl get networkpolicy</code> — is there a NetworkPolicy blocking the traffic? 5. Check the Service selector matches the pod labels: <code>kubectl get svc service-name -o yaml</code> vs <code>kubectl get pod pod-name --show-labels</code>', level:'intermediate'},
      {q:'What is the difference between HTTP 502 and 503?', a:'502 Bad Gateway: the proxy/load balancer got an invalid response from the upstream server. The upstream is running but returning garbage, timing out, or returning non-HTTP responses. Often means the app is crashing (returning partial responses) or the wrong port is configured. 503 Service Unavailable: the server is intentionally refusing requests — typically because all upstream pods are down or failing health checks, so the load balancer has no healthy backends to send traffic to. In K8s: 502 = pod running but app broken. 503 = Service has no healthy endpoints.', level:'intermediate'},
      {q:'What does a DNS TTL of 300 mean and why does it matter for deployments?', a:'TTL=300 means DNS resolvers cache this record for 300 seconds (5 minutes). After you change a DNS record, it takes UP TO the TTL for all clients to see the new value. Best practice for DNS migrations: 1. Lower TTL to 60 (or 30) a few hours before the change. 2. Make the DNS change. 3. Wait TTL seconds for propagation. 4. Raise TTL back to normal. If you change DNS with TTL=86400 (24h), some users may get the old IP for up to 24 hours.', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between a K8s Service LoadBalancer and Ingress?', level:'intermediate',
       a:'Service LoadBalancer is Layer 4 — it provisions a cloud load balancer (Azure LB, AWS NLB) that exposes a TCP/UDP port. One cloud LB per service. Expensive if you have 20 services. Works for any protocol (not just HTTP). Ingress is Layer 7 HTTP routing — one cloud LB for all services. The Ingress controller routes traffic based on HTTP hostname and URL path. Also handles TLS termination via cert-manager. Production pattern: use LoadBalancer only for non-HTTP protocols (databases, raw TCP). All HTTP/HTTPS services go behind a single Ingress. This reduces cloud LB costs from 20x to 1x.',
       trap:'Saying they do the same thing. The L4 vs L7 distinction is a very common interview question and the cost/architecture implications are what interviewers want to hear.'},
    ],
    resources:[
      {label:'Cloudflare Learning Center — free networking', url:'https://www.cloudflare.com/learning'},
    ]
  },

  {
    id:'f5-git-branching', title:'Git Branching Strategies', subtitle:'How teams ship code without chaos',
    time:'30 min', type:'concept', certs:['az400'], xp:80, animationId:'git-branching',
    concept:{
      plain:'A branching strategy is the set of rules your team follows: how to name branches, when to merge, and how code travels from a developer\'s laptop to production. Without one, releases are stressful and unpredictable.',
      analogy:'Think of a restaurant without a ticket system for orders. Chefs grab random tickets, some orders get made twice, others get lost. A branching strategy is the kitchen\'s ticket system — every dish (change) follows a defined path from order (commit) to service (production), and everyone knows whose responsibility it is at each stage.',
      technical:`<strong>Trunk-Based Development (TBD) — best for CI/CD:</strong><br>
Everyone commits to main (trunk) at least daily. Feature branches exist but are short-lived: hours to 2 days maximum. Large incomplete features use feature flags (if/else controlled by config). CI/CD pipeline only needs to watch one branch. Used by Google, Netflix, Spotify. Requires: automated testing you trust, feature flag infrastructure.<br><br>
<strong>GitHub Flow — practical default:</strong><br>
main is always deployable. Create branch → PR → review → merge → auto-deploy. No develop branch. Simple, works for most teams.<br><br>
<strong>Gitflow — for scheduled releases:</strong><br>
main (production), develop (integration), feature/*, release/*, hotfix/*. More overhead but suits teams with fixed release windows. Downside: long-lived branches cause big merge conflicts.<br><br>
<strong>Branch naming convention:</strong><br>
<code>feat/JIRA-123-add-monitoring</code>, <code>fix/resolve-memory-leak</code>, <code>chore/update-base-image</code>, <code>hotfix/critical-auth-bypass</code>`
    },
    commands:[
      {cmd:'git checkout -b feat/TICKET-123-add-ingress', desc:'Create a descriptively named feature branch. Include ticket number for traceability', when:'Starting any change — branch first, commit later', example:'Switched to a new branch', level:'basic'},
      {cmd:'git pull --rebase origin main', desc:'Update your branch by replaying your commits on top of the latest main — keeps history clean', when:'Before raising a PR to avoid unnecessary merge commits', example:'Successfully rebased', level:'intermediate'},
    ],
    exercises:[
      {q:'Your team is adopting CI/CD with auto-deploy on merge to main. Which strategy fits best?', a:'Trunk-Based Development. Only one branch (main) triggers the pipeline. Short-lived feature branches (< 2 days) mean no painful merge conflicts. Developers integrate daily so broken code surfaces immediately rather than at release time. Gitflow would require separate pipelines for develop, release, and main branches, and the long-lived branches would cause painful merges before each release.', level:'intermediate'},
      {q:'A developer keeps a feature branch open for 3 weeks. What problems does this cause?', a:'1. Merge conflicts: main has moved on for 3 weeks. Merging will be painful. 2. Integration risk: the 3-week-old code has not been tested against what others built. 3. PR size: nobody wants to review 3 weeks of code properly. 4. CI/CD bypass: the long-lived branch has been running outdated pipelines. Solution: use feature flags to merge incomplete features to main in small daily increments. The feature is hidden from users until the flag is turned on.', level:'intermediate'},
    ],
    interview:[
      {q:'What is a feature flag and how does it enable trunk-based development?', level:'advanced',
       a:'A feature flag is a runtime conditional: <code>if featureFlags.newDashboard { showNew() } else { showOld() }</code>. The flag value comes from a config system or env var, not hardcoded. This allows incomplete features to be merged to main (flag=false by default), letting developers commit daily without showing users unfinished work. When the feature is ready, turn the flag on in production — no code deployment needed. Feature flags also enable: canary releases (turn on for 5% of users), A/B testing, and instant rollback (just turn the flag off).',
       trap:'Saying feature flags are only for A/B testing. The primary use case is enabling trunk-based development and safe deployments — A/B testing is a secondary benefit.'},
    ],
    resources:[
      {label:'Trunk Based Development — trunkbaseddevelopment.com', url:'https://trunkbaseddevelopment.com'},
    ]
  },

  {
    id:'f6-linux-networking', title:'Linux Networking Tools', subtitle:'Diagnose any connectivity issue in minutes',
    time:'40 min', type:'concept', certs:['lfcs','cka'], xp:100,
    concept:{
      plain:'When an app cannot reach a database or a K8s pod cannot talk to a service, Linux networking tools let you trace exactly where the connection is breaking — which port, which DNS name, which network hop.',
      analogy:'Linux networking tools are a doctor\'s diagnostic kit. ss is the stethoscope — listen to which ports the body is using. curl is the test patient you send through the system to check if they come out healthy. dig is the DNS specialist. tcpdump is the X-ray — you see every packet. You do not use all of them every time, but you need to know which one to reach for.',
      technical:`<strong>ss — socket statistics (replaces netstat):</strong><br>
<code>ss -tulpn</code> — all TCP/UDP listening ports with process name<br>
<code>ss -tnp state established</code> — all active connections<br><br>
<strong>curl:</strong><br>
<code>curl -v url</code> — verbose: shows DNS, TCP connect, TLS, headers, body<br>
<code>curl -I url</code> — headers only (faster)<br>
<code>curl -o /dev/null -s -w "%{http_code} %{time_total}s" url</code> — status + timing<br>
<code>curl -k url</code> — ignore TLS cert (testing only!)<br><br>
<strong>dig — DNS lookup:</strong><br>
<code>dig +short google.com</code> — just the IP<br>
<code>dig @coredns-ip svc.namespace.svc.cluster.local</code> — test K8s cluster DNS<br><br>
<strong>nc — netcat (port tester):</strong><br>
<code>nc -zv host 5432</code> — test TCP port without needing the actual client<br><br>
<strong>tcpdump — packet capture:</strong><br>
<code>tcpdump -i eth0 port 8080 -nn -c 100</code> — capture 100 packets on port 8080`
    },
    commands:[
      {cmd:'ss -tulpn | grep :8080', desc:'Find which process owns port 8080', when:'Debugging port conflicts before starting a service', example:'tcp LISTEN *:8080 users:((java,pid=4321))', level:'basic'},
      {cmd:'kubectl exec -it pod -- curl -s http://service-name:80/health', desc:'Test HTTP connectivity from inside a pod using real cluster DNS and routing', when:'Diagnosing pod-to-service issues — the only accurate test', example:'{"status":"healthy"}', level:'intermediate'},
      {cmd:'kubectl exec -it pod -- nslookup service-name.namespace.svc.cluster.local', desc:'Test Kubernetes DNS resolution from inside the cluster', when:'Diagnosing DNS failures — CoreDNS issues or wrong service name', example:'Address: 10.96.45.67', level:'intermediate'},
    ],
    exercises:[
      {q:'Why must you test K8s service connectivity from inside a pod rather than from your laptop?', a:'K8s cluster DNS (.svc.cluster.local names) is only resolvable inside the cluster — your laptop uses a completely different DNS resolver. K8s service IPs (ClusterIP range like 10.96.0.0/12) are not routable from outside the cluster. NetworkPolicies apply to pod-to-pod traffic, not to your laptop. Testing from inside the pod uses the exact same DNS, network namespace, and routing rules that the application uses. Testing from your laptop bypasses all of this and gives a false result.', level:'intermediate'},
      {q:'A service returns HTTP 502 intermittently (every 1 in 5 requests). How do you diagnose which pod is the problem?', a:'1. Check endpoint count: <code>kubectl get endpoints svc-name</code> — if 5 pods, one might be unhealthy. 2. Loop and test: <code>for i in $(seq 1 20); do curl -o /dev/null -s -w "%{http_code}\n" http://svc:8080; done</code> — see if 502s appear at a fixed interval (suggesting round-robin to a broken pod). 3. Get pod readiness: <code>kubectl get pods -l app=myapp</code> — check READY column. 4. Check individual pod: <code>kubectl logs bad-pod-name</code> + <code>kubectl describe pod bad-pod-name</code> for probe failures.', level:'advanced'},
    ],
    interview:[
      {q:'What command shows which process is listening on port 8080 on a Linux server?', level:'basic',
       a:'<code>ss -tulpn | grep :8080</code> — shows TCP/UDP listening ports with process name and PID. Alternatively: <code>lsof -i :8080</code> which shows file handles including network ports. The old command <code>netstat -tulpn</code> still works but netstat (net-tools) is deprecated and not installed by default on modern Linux distributions (RHEL 8+, Ubuntu 20.04+). Using ss shows you know current tooling.',
       trap:'Only mentioning netstat. On modern systems ss is the correct answer, and not knowing this signals outdated knowledge.'},
    ],
    resources:[
      {label:'Julia Evans — how DNS works', url:'https://jvns.ca/blog/2020/11/17/dns-is-hard/'},
    ]
  }

  ]
};
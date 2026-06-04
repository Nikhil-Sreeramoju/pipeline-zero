// ============================================================
// PipelineZero — data/foundation.js
// Foundation phase: 6 lessons
// ============================================================

window.FOUNDATION_DATA = {
  id: 'foundation',
  name: 'Foundation',
  icon: '🐧',
  color: 'phase-foundation',
  tier: 1,
  desc: 'The non-negotiable base every DevOps engineer needs cold. These skills appear in every interview and underpin every tool you will use.',
  lessons: [

    // ── LESSON F1 ──────────────────────────────────────────
    {
      id: 'f1-linux-core',
      title: 'Linux Core Commands',
      subtitle: 'The terminal is your home — own it',
      time: '45 min',
      type: 'concept',
      certs: ['lfcs'],
      xp: 100,

      concept: {
        plain: 'Linux is the operating system that runs almost every server, container, and cloud machine in the world. Knowing how to navigate it with just a keyboard is the first skill every DevOps engineer needs.',
        analogy: 'Think of the terminal like learning to cook instead of always ordering takeaway. At first it feels slower and harder. But once you know it, you can make exactly what you want, exactly how you want it — faster than any app could deliver it. Every DevOps tool you will ever use is just a menu in this kitchen.',
        technical: 'Five command categories to master cold:<br><br><strong>Navigation:</strong> <code>ls -la</code> (list all files with permissions), <code>cd /path</code> (change directory), <code>pwd</code> (where am I?), <code>find /var/log -name "*.log"</code> (find files)<br><br><strong>File operations:</strong> <code>cat file.txt</code> (print file), <code>less file.txt</code> (scroll through), <code>head/tail -n 20</code> (first/last 20 lines), <code>cp -r src/ dest/</code> (copy), <code>mv old new</code> (move/rename), <code>rm -rf dir/</code> (delete recursively — careful!)<br><br><strong>Process management:</strong> <code>ps aux | grep myapp</code> (find process), <code>kill -9 PID</code> (force kill), <code>top</code> / <code>htop</code> (live CPU/mem), <code>nohup command &</code> (run in background)<br><br><strong>Disk & system:</strong> <code>df -h</code> (disk usage), <code>du -sh /var/log/*</code> (folder sizes), <code>free -h</code> (memory), <code>uname -a</code> (kernel info)<br><br><strong>Text processing:</strong> <code>grep -r "ERROR" /var/log</code> (search in files), <code>awk \'{print $1}\' file</code> (print column), <code>sed \'s/old/new/g\' file</code> (find+replace), <code>sort | uniq -c</code> (count duplicates)',
        hasAnimation: false
      },

      quickCheck: {
        question: 'You are on a production server. An app is consuming 100% CPU and you need to find its Process ID. What is the fastest command?',
        options: [
          'ls -la /proc',
          'cat /var/log/syslog',
          'top or htop — shows live CPU per process with PID',
          'systemctl status'
        ],
        correct: 2,
        explanation: 'top and htop show live, per-process CPU usage with PIDs updated every second. In htop you can press F6 to sort by CPU and see the culprit immediately. Then kill -9 <PID> to terminate it. The /proc filesystem and syslog would take much longer to find the same information.'
      },

      commands: [
        {
          scenario: 'You want to find all files ending in .log inside the /var directory',
          cmd: 'find /var -name "*.log"',
          question: 'What does this command do?',
          options: [
            'Deletes all log files in /var',
            'Searches /var recursively and prints paths of all files matching *.log',
            'Shows the contents of all log files',
            'Counts the number of log files'
          ],
          correct: 1,
          explanation: 'find traverses the directory tree from the starting path (/var), matching files by name pattern. The * is a wildcard — *.log matches any filename ending in .log. This is one of the most used debugging commands when you need to track down a specific file.'
        },
        {
          scenario: 'You want to see the last 50 lines of a log file as new lines are being written',
          cmd: 'tail -f -n 50 /var/log/app.log',
          question: 'What does -f do here?',
          options: [
            'Formats the output with colours',
            'Follows the file — keeps printing new lines as they are written (like a live feed)',
            'Filters lines containing errors only',
            'Forces read permission if denied'
          ],
          correct: 1,
          explanation: '-n 50 shows the last 50 lines. -f follows the file and keeps the terminal open, printing new lines as they arrive in real time. This is the standard way to monitor logs during a deployment or incident. Press Ctrl+C to exit.'
        }
      ],

      lab: {
        title: 'Linux Terminal Survival Kit',
        scenario: 'You have just SSH\'d into a server that is "behaving strangely." Your job is to diagnose it using only the terminal.',
        laptopSetup: 'Open your WSL2 terminal (Windows) or Terminal app (Mac/Linux). No extra software needed.',
        cloudUrl: 'https://killercoda.com/learn/course/linux-basics',
        steps: [
          { title: 'Check who is logged in and system uptime', cmd: 'w && uptime', expected: 'Shows logged-in users and load averages', isBreak: false, desc: 'uptime shows how long the server has been running and load averages (1/5/15 min). High load average = busy system.' },
          { title: 'Find the top CPU-consuming process', cmd: 'ps aux --sort=-%cpu | head -10', expected: 'List of processes sorted by CPU usage', isBreak: false, desc: 'ps aux lists all processes. --sort=-%cpu sorts by CPU descending. head -10 shows only the top 10.' },
          { title: 'Check available disk space', cmd: 'df -h', expected: 'Filesystem sizes and usage percentages', isBreak: false, desc: 'Full disk (/var or /tmp at 100%) is a very common cause of server problems.' },
          { title: 'Find large files eating disk space', cmd: 'du -sh /var/log/* 2>/dev/null | sort -rh | head -5', expected: 'Top 5 largest directories in /var/log', isBreak: false, desc: 'Log files grow forever if not rotated. This finds the biggest offenders.' },
          { title: 'Break it on purpose — flood a file', cmd: 'for i in $(seq 1 1000); do echo "fake error $i" >> /tmp/test.log; done', expected: '/tmp/test.log now has 1000 lines', isBreak: true, desc: 'Now diagnose it: how many lines? Use wc -l /tmp/test.log. Find lines with "500": grep "500" /tmp/test.log | wc -l' },
          { title: 'Clean up', cmd: 'rm /tmp/test.log', expected: 'File deleted', isBreak: false, desc: 'Always clean up after labs to keep your machine tidy.' }
        ],
        learned: ['Navigate any Linux server without a GUI', 'Find CPU/memory/disk issues in under 2 minutes', 'Read log files live with tail -f']
      }
    },

    // ── LESSON F2 ──────────────────────────────────────────
    {
      id: 'f2-shell-scripting',
      title: 'Shell Scripting & Automation',
      subtitle: 'Stop doing the same thing twice',
      time: '60 min',
      type: 'lab',
      certs: ['lfcs', 'az400'],
      xp: 120,

      concept: {
        plain: 'A shell script is a text file containing a list of terminal commands. Instead of typing the same 10 commands manually every time, you write them in a file once, and run the file.',
        analogy: 'Shell scripts are kitchen recipes. A chef does not improvise a new dish from memory every day — they write the recipe once, follow it every time, and the result is consistent. A good DevOps engineer turns any task they do more than three times into a script. That is how you scale your work without scaling your hours.',
        technical: '<strong>Script anatomy:</strong><br><code>#!/bin/bash</code> — the shebang. Tells the OS which interpreter to use. Always the first line.<br><code>chmod +x script.sh</code> — make it executable<br><code>./script.sh</code> — run it<br><br><strong>Variables:</strong> <code>NAME="Nikhil"</code>, use as <code>$NAME</code> or <code>${NAME}</code>. Command substitution: <code>DATE=$(date +%Y-%m-%d)</code><br><br><strong>Control flow:</strong><br><code>if [ -f "$FILE" ]; then ... elif ...; else ...; fi</code><br><code>for POD in $(kubectl get pods -o name); do echo $POD; done</code><br><code>while true; do sleep 5; check_health; done</code><br><br><strong>Error handling (critical):</strong><br><code>set -e</code> — exit immediately on any error<br><code>set -o pipefail</code> — catch errors in pipes<br><code>set -u</code> — treat undefined variables as errors<br><code>trap "cleanup" EXIT</code> — always run cleanup on exit<br><br><strong>Functions:</strong><br><code>deploy() { kubectl apply -f $1; kubectl rollout status deploy/$2; }</code><br><code>deploy manifests/ myapp</code><br><br><strong>Key tools:</strong> <code>jq</code> for JSON (parsing kubectl output), <code>xargs</code> for piping to commands, <code>awk</code> for columns, <code>sed</code> for replacements',
        hasAnimation: false
      },

      quickCheck: {
        question: 'You write a deployment script. Halfway through, one command fails silently and the script keeps running, leaving infrastructure in a broken half-deployed state. How do you prevent this?',
        options: [
          'Wrap every command in an if-else statement',
          'Add set -e and set -o pipefail at the top — script exits immediately on any error or pipe failure',
          'Run the script with bash -v to see verbose output',
          'Add echo "done" after every command'
        ],
        correct: 1,
        explanation: 'set -e makes the script exit immediately if any command returns a non-zero exit code. set -o pipefail catches failures inside pipes (like cmd1 | cmd2 where cmd1 fails but cmd2 succeeds). Together these are the two most important safety settings for any production shell script. Add set -u too to catch undefined variable mistakes.'
      },

      commands: [
        {
          scenario: 'Your script has a variable that might be empty. You want a default value if it is not set.',
          cmd: 'NAMESPACE=${NAMESPACE:-"default"}',
          question: 'What does ${NAMESPACE:-"default"} do?',
          options: [
            'Sets NAMESPACE to default permanently',
            'Uses the value of NAMESPACE if it is set, otherwise uses "default"',
            'Checks if NAMESPACE equals "default"',
            'Deletes the NAMESPACE variable'
          ],
          correct: 1,
          explanation: 'The :- operator is parameter expansion with a default. If NAMESPACE is unset or empty, "default" is used. This pattern avoids errors when scripts are run without all env vars set. Common in CI/CD scripts: ENV=${DEPLOY_ENV:-"staging"}'
        },
        {
          scenario: 'You have a list of K8s namespaces and want to run a command in each one.',
          cmd: 'for ns in dev staging prod; do kubectl get pods -n $ns; done',
          question: 'What does this loop do?',
          options: [
            'Runs kubectl get pods once for all namespaces',
            'Creates three namespaces named dev, staging, prod',
            'Runs kubectl get pods -n separately for dev, then staging, then prod in sequence',
            'Fails — you cannot loop over text values in bash'
          ],
          correct: 2,
          explanation: 'The for loop iterates over the space-separated list. Each iteration sets ns to the next value. This is how you automate tasks across multiple environments without copy-pasting commands. The same pattern works with $(kubectl get namespaces -o name) to loop over live namespaces.'
        }
      ],

      lab: {
        title: 'Write a Real Deployment Health Check Script',
        scenario: 'Your team asks you to write a script that checks if a Kubernetes deployment is healthy after a release. It should print pass or fail for each check.',
        laptopSetup: 'Requires kubectl and a running minikube cluster. Run: minikube start',
        cloudUrl: 'https://killercoda.com/playgrounds/scenario/kubernetes',
        steps: [
          { title: 'Create the script file', cmd: 'cat > health_check.sh << \'EOF\'\n#!/bin/bash\nset -e\nset -o pipefail\n\nDEPLOYMENT=${1:-"nginx"}\nNAMESPACE=${2:-"default"}\n\necho "=== Health Check: $DEPLOYMENT in $NAMESPACE ==="\nEOF', expected: 'Script file created', isBreak: false, desc: 'The heredoc (<<\'EOF\') lets you write multiline content to a file.' },
          { title: 'Add replica check and make executable', cmd: 'cat >> health_check.sh << \'EOF\'\n\nREADY=$(kubectl get deploy $DEPLOYMENT -n $NAMESPACE -o jsonpath=\'{.status.readyReplicas}\')\nDESIRED=$(kubectl get deploy $DEPLOYMENT -n $NAMESPACE -o jsonpath=\'{.spec.replicas}\')\n\nif [ "$READY" = "$DESIRED" ]; then\n  echo "✅ Replicas: $READY/$DESIRED PASS"\nelse\n  echo "❌ Replicas: $READY/$DESIRED FAIL"\n  exit 1\nfi\nEOF\nchmod +x health_check.sh', expected: 'Script updated and executable', isBreak: false, desc: 'kubectl -o jsonpath extracts specific fields from K8s resources — much cleaner than grep.' },
          { title: 'Deploy a test app to check', cmd: 'kubectl create deployment nginx --image=nginx:alpine --replicas=2 2>/dev/null || true', expected: 'Deployment nginx created', isBreak: false, desc: '2>/dev/null || true silences errors if it already exists.' },
          { title: 'Run your health check', cmd: './health_check.sh nginx default', expected: '✅ Replicas: 2/2 PASS', isBreak: false, desc: 'Your script is now reusable for any deployment in any namespace.' },
          { title: 'Break it — scale down to cause a mismatch', cmd: 'kubectl scale deployment nginx --replicas=1 && sleep 3 && ./health_check.sh nginx default', expected: 'Script may show FAIL if replica not yet ready', isBreak: true, desc: 'Simulates a partial deployment failure. In CI/CD pipelines, this script would fail the build and alert the team.' },
          { title: 'Clean up', cmd: 'kubectl delete deployment nginx && rm health_check.sh', expected: 'Resources cleaned up', isBreak: false, desc: 'Good habit — always clean up lab resources.' }
        ],
        learned: ['Write safe production shell scripts with set -e and set -o pipefail', 'Use loops and conditionals for automation', 'Extract data from kubectl using jsonpath']
      }
    },

    // ── LESSON F3 ──────────────────────────────────────────
    {
      id: 'f3-linux-networking',
      title: 'Linux Networking Tools',
      subtitle: 'Diagnose any connectivity problem in minutes',
      time: '45 min',
      type: 'concept',
      certs: ['lfcs', 'cka'],
      xp: 100,

      concept: {
        plain: 'When your app cannot reach a database, or a Kubernetes pod cannot talk to a service, Linux networking tools let you trace exactly where the connection is breaking — which port, which DNS name, which route.',
        analogy: 'Linux networking tools are a doctor\'s diagnostic kit. ss is the stethoscope — you listen to which ports the body (server) is using. curl is a test patient you send through the system to see if it comes out healthy. dig is the specialist who explains why DNS lookups are failing. tcpdump is the X-ray — you see every packet. You do not need all tools every time, but you need to know which one to reach for.',
        technical: '<strong>Port and socket inspection:</strong><br><code>ss -tulpn</code> — all listening TCP/UDP ports with the process name. The modern replacement for netstat.<br><code>netstat -tulpn</code> — older but still common in interview questions<br><br><strong>Connectivity testing:</strong><br><code>curl -v https://api.example.com</code> — verbose HTTP request, shows TLS handshake, headers, response<br><code>curl -o /dev/null -s -w "%{http_code}" url</code> — just the status code, useful in scripts<br><code>nc -zv hostname 8080</code> — test if TCP port is open (no HTTP needed)<br><code>wget --spider url</code> — check if URL is reachable<br><br><strong>DNS tools:</strong><br><code>dig google.com</code> — full DNS query with answer records<br><code>dig @8.8.8.8 google.com</code> — query a specific DNS server<br><code>nslookup service-name.namespace.svc.cluster.local</code> — test K8s DNS resolution<br><br><strong>Packet capture:</strong><br><code>tcpdump -i eth0 port 8080 -nn</code> — capture packets on interface eth0, port 8080<br><br><strong>Routing and interfaces:</strong><br><code>ip addr</code> — show all network interfaces and IPs<br><code>ip route</code> — show routing table<br><code>traceroute hostname</code> — trace the network path hop by hop<br><br><strong>K8s specific:</strong><br><code>kubectl exec -it pod -- curl http://service-name:80</code> — test connectivity FROM inside a pod (most accurate)<br><code>kubectl exec -it pod -- nslookup service-name</code> — test DNS resolution from inside the cluster',
        hasAnimation: false
      },

      quickCheck: {
        question: 'A Kubernetes pod cannot reach a service. You suspect DNS is the issue. What is the most accurate test?',
        options: [
          'ping the service IP from your laptop',
          'curl the service from your laptop using port-forward',
          'kubectl exec into the pod and run nslookup service-name or curl http://service-name:port',
          'Check the Service YAML for typos'
        ],
        correct: 2,
        explanation: 'Testing from inside the pod is the only accurate test because it uses the exact same network namespace, DNS configuration, and routing rules that the real traffic uses. Testing from your laptop or with port-forward bypasses all of that. If DNS works from inside the pod, the issue is elsewhere. If it fails, you have found your culprit.'
      },

      commands: [
        {
          scenario: 'You want to find which process is listening on port 8080',
          cmd: 'ss -tulpn | grep 8080',
          question: 'What does the -tulpn flags mean?',
          options: [
            't=TCP, u=UDP, l=listening, p=show process, n=numeric (no DNS lookup)',
            't=timestamp, u=user, l=list, p=port, n=name',
            'These flags are optional and do not change the output',
            'ss only works without flags'
          ],
          correct: 0,
          explanation: 'Each flag has a specific purpose: -t (TCP), -u (UDP), -l (listening sockets only), -p (show the process name and PID), -n (show numeric IPs and ports instead of resolving names — faster). This combination is the most useful for finding which process owns a port.'
        },
        {
          scenario: 'You want to test if a remote server\'s MySQL port (3306) is open without installing MySQL client',
          cmd: 'nc -zv db.example.com 3306',
          question: 'What does nc -zv do?',
          options: [
            'Connects to MySQL and runs a test query',
            '-z scans without sending data (port check only), -v verbose output — tells you if the port is open or refused',
            'Downloads the MySQL schema',
            'nc is a MySQL-specific tool'
          ],
          correct: 1,
          explanation: 'nc (netcat) is the Swiss army knife of networking. -z means "scan mode" — try to connect but send no data. -v means verbose — print whether it succeeded or failed. You will see "Connection to db.example.com 3306 port [tcp/mysql] succeeded!" if the port is open. Works for any TCP port, not just databases.'
        }
      ],

      lab: null
    },

    // ── LESSON F4 ──────────────────────────────────────────
    {
      id: 'f4-git-version-control',
      title: 'Git & Version Control',
      subtitle: 'Every CI/CD pipeline starts with a git push',
      time: '45 min',
      type: 'concept',
      certs: ['az400', 'aws'],
      xp: 100,
      animationId: 'git-branching',

      concept: {
        plain: 'Git tracks every change you make to your code or configuration files. It lets you go back to any previous version, work on multiple features simultaneously, and collaborate with a team without overwriting each other\'s work.',
        analogy: 'Git is a time machine for your work. Every commit (save point) captures exactly what every file looks like at that moment. You can jump back to any commit, anytime. Branches are parallel universes — you create a new branch to experiment, and if it goes wrong, the original universe (main branch) is completely untouched. Merging brings the best of two universes together.',
        technical: '<strong>Core workflow:</strong><br><code>git clone https://github.com/org/repo.git</code> — download a repository<br><code>git status</code> — what has changed since last commit?<br><code>git add -A</code> — stage all changes<br><code>git commit -m "feat: add K8s deployment config"</code> — save snapshot<br><code>git push origin main</code> — upload to remote<br><code>git pull</code> — download + merge latest changes<br><br><strong>Branching:</strong><br><code>git checkout -b feature/add-ingress</code> — create + switch to new branch<br><code>git branch -a</code> — list all branches<br><code>git merge feature/add-ingress</code> — merge feature into current branch<br><code>git rebase main</code> — replay your commits on top of main (clean history)<br><br><strong>Undoing things:</strong><br><code>git reset --soft HEAD~1</code> — undo last commit, keep changes staged<br><code>git reset --hard HEAD~1</code> — undo last commit AND discard changes (dangerous on shared branches)<br><code>git revert abc123</code> — create a new commit that undoes a specific commit (safe for shared branches)<br><code>git stash</code> / <code>git stash pop</code> — temporarily save uncommitted work<br><br><strong>Advanced:</strong><br><code>git reflog</code> — see everything Git has ever done (recover "lost" commits)<br><code>git bisect start/bad/good</code> — binary search to find which commit introduced a bug<br><code>git cherry-pick abc123</code> — apply one specific commit to current branch',
        hasAnimation: true
      },

      quickCheck: {
        question: 'You committed a secret API key to the main branch by mistake. The commit is already pushed. What is the correct fix?',
        options: [
          'git reset --hard HEAD~1 and force push to main',
          'Just delete the key from the file in a new commit — the old commit is harmless',
          'git revert the commit (creates a new commit that removes the key), then immediately rotate/invalidate the API key — the old commit still exists in history and should be treated as compromised',
          'Archive the repository and start a new one'
        ],
        correct: 2,
        explanation: 'This is critical: even after reverting, the secret still exists in git history and should be treated as compromised — rotate it immediately. git revert is the safe way to undo on shared branches because it adds a new commit rather than rewriting history. Never git reset --hard + force push on a shared branch — it breaks teammates\' local copies. After reverting, use a secret scanning tool (git-secrets, detect-secrets) to prevent future leaks.'
      },

      commands: [
        {
          scenario: 'You want to see exactly what changed in the last commit',
          cmd: 'git show HEAD',
          question: 'What does HEAD refer to?',
          options: [
            'The first commit in the repository',
            'The name of the current branch',
            'The most recent commit on your current branch',
            'The remote origin'
          ],
          correct: 2,
          explanation: 'HEAD is a pointer to the current commit — whatever you checked out most recently. git show HEAD shows the diff and metadata of that commit. HEAD~1 is the commit before it, HEAD~2 is two back. This pointer is what moves when you commit, checkout, or reset.'
        },
        {
          scenario: 'A bug was introduced sometime in the last 50 commits. You want to find exactly which commit caused it.',
          cmd: 'git bisect start && git bisect bad && git bisect good v1.0',
          question: 'What strategy does git bisect use?',
          options: [
            'Checks every commit one by one from newest to oldest',
            'Binary search — splits the commit range in half each time, you test and mark good/bad, finds the culprit in ~log2(50) = 6 steps',
            'Scans code for common bug patterns automatically',
            'Compares the latest commit to the tagged version'
          ],
          correct: 1,
          explanation: 'Binary search means git bisect finds a bug in 50 commits in only ~6 steps instead of 50. Each step git checks out the middle commit. You test it, mark it good or bad, and git narrows the range. This is one of the most underused and most powerful Git features for debugging production issues.'
        }
      ],

      lab: {
        title: 'Git Workflow for a DevOps Config Change',
        scenario: 'You are adding a new Kubernetes namespace config to a shared repository. Practice the correct branch, commit, and merge workflow.',
        laptopSetup: 'Requires Git installed. Run: git --version to verify.',
        cloudUrl: 'https://learngitbranching.js.org',
        steps: [
          { title: 'Create a local test repository', cmd: 'mkdir pipeline-git-lab && cd pipeline-git-lab && git init && git commit --allow-empty -m "initial commit"', expected: 'Initialized empty Git repository', isBreak: false, desc: 'Starting from scratch to practice the full workflow.' },
          { title: 'Create a feature branch', cmd: 'git checkout -b feature/add-monitoring-namespace', expected: 'Switched to a new branch', isBreak: false, desc: 'Never commit directly to main in a team environment. Always use feature branches.' },
          { title: 'Add a config file', cmd: 'echo "apiVersion: v1\nkind: Namespace\nmetadata:\n  name: monitoring" > monitoring-ns.yaml && git add monitoring-ns.yaml && git commit -m "feat: add monitoring namespace config"', expected: 'Commit created on feature branch', isBreak: false, desc: 'Conventional commit format: feat/fix/docs/chore: description' },
          { title: 'See the branch difference', cmd: 'git diff main..feature/add-monitoring-namespace', expected: 'Shows the new file as a diff', isBreak: false, desc: 'Always review your diff before merging or raising a PR.' },
          { title: 'Merge to main', cmd: 'git checkout main && git merge feature/add-monitoring-namespace --no-ff -m "Merge: add monitoring namespace"', expected: 'Merge commit created', isBreak: false, desc: '--no-ff creates a merge commit even for fast-forwards — preserves branch history, important for audit trails.' },
          { title: 'Break it — make a bad commit and revert', cmd: 'echo "BROKEN CONFIG" > bad.yaml && git add bad.yaml && git commit -m "accident" && git revert HEAD --no-edit', expected: 'Revert commit created', isBreak: true, desc: 'git revert HEAD creates a new commit undoing the last one. Safe for shared branches. git log --oneline to see the history.' },
          { title: 'Clean up', cmd: 'cd .. && rm -rf pipeline-git-lab', expected: 'Lab directory removed', isBreak: false, desc: '' }
        ],
        learned: ['Create and merge feature branches correctly', 'Write conventional commit messages', 'Safely undo mistakes with git revert vs git reset']
      }
    },

    // ── LESSON F5 ──────────────────────────────────────────
    {
      id: 'f5-git-branching-strategies',
      title: 'Git Branching Strategies',
      subtitle: 'How teams ship code without chaos',
      time: '30 min',
      type: 'concept',
      certs: ['az400'],
      xp: 80,
      animationId: 'git-branching',

      concept: {
        plain: 'A branching strategy is a set of rules your team follows for how to name branches, when to merge them, and how to get code from a developer\'s laptop to production. Without a strategy, every team member does something different and deployments become unpredictable.',
        analogy: 'Imagine a restaurant kitchen without a system for how orders flow from table to kitchen to plate. Some chefs grab random tickets, others wait for verbal instructions. Orders get lost, duplicated, or cooked twice. A branching strategy is the kitchen\'s ticket system — everyone knows exactly where a dish is in its journey and whose responsibility it is at each stage.',
        technical: '<strong>Trunk-Based Development (TBD) — preferred for CI/CD:</strong><br>Everyone commits to main (the "trunk") frequently (at least daily). Short-lived feature branches (max 1-2 days) merged via PR. Feature flags control what users see. Why it wins: forces frequent integration, finds conflicts early, CI/CD pipelines are simple (only one long-lived branch). Used by Google, Facebook, Netflix.<br><br><strong>Gitflow — common in enterprises:</strong><br>Branches: main (production), develop (integration), feature/* (new work), release/* (prep for deployment), hotfix/* (urgent prod fixes). More structured, suits teams with scheduled release cycles. Downside: long-lived branches cause integration hell, slow CI/CD.<br><br><strong>GitHub Flow — simple middle ground:</strong><br>main is always deployable. Feature branches → PR → merge to main → auto-deploy. No develop branch. Simple and works well for most teams.<br><br><strong>What interviewers want to hear:</strong> "I prefer trunk-based development with feature flags for larger changes because it keeps CI/CD pipelines simple and forces the team to integrate frequently. We used Gitflow at [company] but found the long-lived branches caused painful merges before each release."',
        hasAnimation: true
      },

      quickCheck: {
        question: 'Your team is moving to CI/CD with automated deployments on every merge to main. Which branching strategy is the best fit?',
        options: [
          'Gitflow — because it has a dedicated release branch for controlled deployments',
          'Trunk-Based Development — short-lived feature branches, merge to main daily, feature flags for incomplete work, simple CI/CD pipeline triggered on every main commit',
          'Create a new branch per environment (dev-branch, staging-branch, prod-branch)',
          'Each developer has their own long-lived branch'
        ],
        correct: 1,
        explanation: 'Trunk-Based Development is the natural fit for CI/CD because there is only one branch that deploys to production. Every merge triggers the pipeline. Gitflow\'s multiple long-lived branches mean you need separate pipelines for develop, release, and main — and merging between them becomes a bottleneck. Environment branches (dev-branch, staging-branch) are an anti-pattern that causes drift between environments.'
      },

      commands: [
        {
          scenario: 'You are using trunk-based development. You need a small change deployed in 2 hours but do not want to block it with a feature flag.',
          cmd: 'git checkout -b fix/update-timeout-config && git commit -m "fix: increase DB timeout to 30s" && git push && gh pr create --base main',
          question: 'In trunk-based development, how long should this branch live?',
          options: [
            'Until the next sprint ends',
            'Hours to 1-2 days maximum — short-lived branches are the core principle. Merge and delete after PR is approved.',
            'Until the release date',
            'Indefinitely, kept up to date with main via rebase'
          ],
          correct: 1,
          explanation: 'Short-lived branches (hours to max 2 days) are the core discipline of trunk-based development. Long-lived branches accumulate divergence from main, causing painful merge conflicts and delaying integration. If your feature takes more than 2 days, use a feature flag to hide the incomplete work in main, rather than keeping a long branch open.'
        }
      ],

      lab: null
    },

    // ── LESSON F6 ──────────────────────────────────────────
    {
      id: 'f6-networking-fundamentals',
      title: 'Networking Fundamentals for DevOps',
      subtitle: 'TCP/IP, DNS, TLS — the pipes everything flows through',
      time: '60 min',
      type: 'concept',
      certs: ['cka', 'az400', 'lfcs'],
      xp: 120,

      concept: {
        plain: 'Everything in DevOps moves through a network — your code deployments, your app\'s traffic, your monitoring data, your database connections. Understanding how data travels from one machine to another is essential for debugging connectivity issues and designing systems.',
        analogy: 'The internet is a postal system. An IP address is a street address. A port is the apartment number in the building. DNS is the phonebook that converts a name like "google.com" into a street address. TCP is registered mail — tracked, guaranteed delivery with confirmation. UDP is posting a flyer through the letterbox — fast, no confirmation, some get lost. TLS is a tamper-proof sealed envelope — only the recipient can open it. A load balancer is a sorting office that distributes mail across multiple delivery teams.',
        technical: '<strong>OSI model (the critical layers):</strong><br>Layer 3 = IP (routing between machines), Layer 4 = TCP/UDP (ports, sessions, reliability), Layer 7 = HTTP (application — your API traffic). This matters because Kubernetes Services are Layer 4 and Ingress is Layer 7.<br><br><strong>TCP 3-way handshake:</strong> SYN → SYN-ACK → ACK. Every TCP connection starts this way. TIME_WAIT state means connection is closing.<br><br><strong>DNS resolution chain:</strong> Browser cache → OS hosts file (/etc/hosts) → OS DNS cache → DNS resolver → Root nameservers → TLD (.com) → Authoritative nameserver → IP returned. TTL controls how long each level caches the result.<br><br><strong>HTTP:</strong> Methods (GET/POST/PUT/DELETE/PATCH), Status codes (200 OK, 201 Created, 301 Redirect, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error, 503 Service Unavailable), Headers (Content-Type, Authorization, X-Request-ID)<br><br><strong>TLS/HTTPS:</strong> Client hello → Server sends certificate (public key + identity signed by CA) → Client verifies CA signature → Key exchange → Symmetric encryption for session. Certificate = public key signed by a trusted Certificate Authority.<br><br><strong>CIDR notation:</strong> 10.0.0.0/24 = 256 IPs (.0 to .255). /16 = 65,536 IPs. /32 = exactly 1 IP. K8s pod CIDR is typically 10.244.0.0/16.<br><br><strong>Load balancing:</strong> Layer 4 (TCP): routes by IP+port, very fast, no HTTP awareness. Layer 7 (HTTP): routes by URL path, hostname, headers — can route /api to API pods and /static to CDN. K8s Service = L4. K8s Ingress = L7.',
        hasAnimation: false
      },

      quickCheck: {
        question: 'A K8s pod reports it cannot resolve "my-service.default.svc.cluster.local". The service exists. What is the most likely cause?',
        options: [
          'The service port is wrong',
          'CoreDNS (the cluster DNS server) is not running or the pod\'s DNS config points to a wrong resolver',
          'The pod does not have enough memory',
          'The service needs to be restarted'
        ],
        correct: 1,
        explanation: 'K8s DNS resolution goes through CoreDNS. Every pod is configured to use the CoreDNS ClusterIP as its DNS server (check /etc/resolv.conf inside the pod). If CoreDNS is crashing or the pod\'s /etc/resolv.conf has the wrong nameserver IP, DNS lookups fail. Diagnose: kubectl get pods -n kube-system | grep coredns, then kubectl exec -it failing-pod -- cat /etc/resolv.conf to verify the nameserver.'
      },

      commands: [
        {
          scenario: 'You want to test DNS resolution for a K8s service from inside a pod',
          cmd: 'kubectl exec -it mypod -- nslookup my-service.default.svc.cluster.local',
          question: 'Why test DNS from inside the pod instead of from your laptop?',
          options: [
            'It is faster',
            'The pod uses the cluster\'s CoreDNS and its own /etc/resolv.conf — the test must happen from inside to reflect actual DNS behaviour that the app experiences',
            'nslookup only works inside pods',
            'Your laptop cannot run nslookup'
          ],
          correct: 1,
          explanation: 'K8s cluster DNS (CoreDNS) is only accessible from inside the cluster. Your laptop uses a completely different DNS resolver and cannot resolve .svc.cluster.local names. Testing from inside the pod is the only way to reproduce what the application actually experiences. This is a core debugging principle: test at the same layer and location as the actual traffic.'
        },
        {
          scenario: 'You want to understand what HTTP status code a service returns before writing a health check',
          cmd: 'curl -o /dev/null -s -w "%{http_code}" http://my-service:8080/health',
          question: 'What does this curl command output?',
          options: [
            'The full HTTP response body',
            'Only the HTTP status code (e.g. 200, 503) — nothing else. -o /dev/null discards body, -s silent mode, -w prints the format string',
            'The response headers only',
            'The DNS resolution time'
          ],
          correct: 1,
          explanation: 'This one-liner is extremely useful in health check scripts: -o /dev/null sends the response body to /dev/null (discards it), -s suppresses progress output, -w "%{http_code}" prints just the status code. Use it like: STATUS=$(curl -o /dev/null -s -w "%{http_code}" url); if [ "$STATUS" != "200" ]; then echo "UNHEALTHY"; fi'
        }
      ],

      lab: null
    }

  ] // end lessons
}; // end FOUNDATION_DATA
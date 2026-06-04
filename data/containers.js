// PipelineZero — data/containers.js
window.CONTAINERS_DATA = {
  id:'containers', name:'Docker & Containers', icon:'🐳', tier:1,
  desc:'Containers are the packaging format for everything in modern DevOps. Master Docker before Kubernetes — K8s orchestrates containers, so without this foundation K8s makes no sense.',
  lessons:[

  {
    id:'c1-docker-fundamentals', title:'Docker Fundamentals', subtitle:'What actually happens when you docker run',
    time:'60 min', type:'concept', certs:['az400'], xp:110, animationId:'docker-layers',
    concept:{
      plain:'Docker packages your application and everything it needs to run (code, dependencies, config, OS libraries) into a single portable box called a container. That box runs identically on your laptop, a CI server, and a production cloud.',
      analogy:'A Docker image is a recipe card. A container is the meal you cooked from it. You can cook the same meal (run the same image) on any kitchen (server) in the world and get identical results. The layers are like recipe steps — each step builds on the previous one, and Docker caches unchanged steps so rebuilds are fast.',
      technical:`<strong>Image vs Container:</strong><br>
Image = read-only layers stacked on top of each other (filesystem snapshot). Container = running image + writable layer on top (copy-on-write). One image → many containers. Stop/start preserves the writable layer. docker rm destroys it.<br><br>
<strong>Layer caching:</strong> Each RUN, COPY, ADD instruction creates a layer. If layer N changes, all layers after N must rebuild. Order your Dockerfile from least-changed (base OS, system deps) to most-changed (app code). This makes rebuilds fast.<br><br>
<strong>Registry:</strong> Docker Hub (public), ACR (Azure Container Registry), ECR (AWS), GCR (Google). Push: <code>docker push registry/image:tag</code>. Pull: <code>docker pull registry/image:tag</code><br><br>
<strong>Container lifecycle:</strong> create → start (= run) → pause → unpause → stop (SIGTERM) → kill (SIGKILL) → rm<br><br>
<strong>Networking modes:</strong> bridge (default, containers get private IPs), host (share host network, no isolation), none (no network)`
    },
    commands:[
      {cmd:'docker run -d -p 8080:3000 --name myapp myimage:v1', desc:'Run container detached (-d), map host port 8080 to container port 3000, name it myapp', when:'Starting a container in the background for testing', example:'Container ID: abc123...', level:'basic'},
      {cmd:'docker ps', desc:'List all running containers with IDs, names, ports, and status', when:'Check what is currently running', example:'CONTAINER ID  IMAGE        STATUS       PORTS', level:'basic'},
      {cmd:'docker ps -a', desc:'List ALL containers including stopped ones', when:'Find containers that crashed or were stopped', example:'abc123 myapp Exited (1) 5 min ago', level:'basic'},
      {cmd:'docker logs -f myapp', desc:'Stream logs from a container. -f follows live output', when:'Debugging a running container — see what it is printing', example:'2026-01-01 INFO Server started on :3000', level:'basic'},
      {cmd:'docker exec -it myapp /bin/sh', desc:'Open an interactive shell inside a running container. Use /bin/bash if available', when:'Debugging inside a container — check env vars, files, connectivity', example:'/ # ls', level:'basic'},
      {cmd:'docker inspect myapp', desc:'Show all container configuration as JSON — env vars, mounts, network, state', when:'Checking exactly how a container is configured, diagnosing networking issues', example:'{\\n  "Id": "abc123",\\n  "Mounts": [...]', level:'intermediate'},
      {cmd:'docker stats', desc:'Live CPU, memory, network I/O stats for all running containers', when:'Performance debugging — which container is consuming resources', example:'NAME CPU% MEM USAGE/LIMIT NET I/O', level:'intermediate'},
      {cmd:'docker image ls', desc:'List all local images with their sizes', when:'Seeing what images are cached locally, checking image sizes', example:'nginx latest 188MB\\nmyapp v1 45MB', level:'basic'},
      {cmd:'docker system prune -af', desc:'Remove ALL unused images, containers, networks, and build cache. Frees disk space.', when:'Cleaning up a CI server or developer machine running low on disk', example:'Deleted images: 15\\nTotal reclaimed: 3.2GB', level:'intermediate'},
      {cmd:'docker cp myapp:/app/config.yml ./config-backup.yml', desc:'Copy a file from container to host (or host to container)', when:'Extracting config or logs from a running container', example:'(file copied)', level:'intermediate'},
    ],
    lab:{
      title:'Run, Debug and Inspect Your First Container',
      scenario:'Start an nginx container, customise it, debug it from inside, and understand what each docker command is doing under the hood.',
      cloudUrl:'https://labs.play-with-docker.com',
      steps:[
        {title:'Pull and run nginx', cmd:'docker run -d -p 8080:80 --name my-nginx nginx:alpine', expected:'Container ID printed', isBreak:false, desc:'Alpine = minimal Linux base image (~5MB). The container runs nginx serving on port 80 internally, mapped to 8080 on your host.'},
        {title:'Test it is working', cmd:'curl http://localhost:8080', expected:'HTML response from nginx', isBreak:false, desc:''},
        {title:'Get a shell inside the container', cmd:'docker exec -it my-nginx /bin/sh', expected:'/ # (shell prompt)', isBreak:false, desc:'You are now inside the running container. Explore: ls /etc/nginx, cat /etc/nginx/nginx.conf, ps aux. Type exit to leave.'},
        {title:'View real-time logs', cmd:'docker logs -f my-nginx', expected:'nginx access log entries', isBreak:false, desc:'Press Ctrl+C to stop following. Each request you make generates a log line.'},
        {title:'Break it — stop nginx inside the container', cmd:'docker exec my-nginx nginx -s stop', expected:'Container shows as Exited', isBreak:True, desc:'Now run docker ps — the container stopped. Run docker start my-nginx to restart it. Note: docker stop sends SIGTERM first, then SIGKILL after 10s timeout. docker kill sends SIGKILL immediately.'},
        {title:'Inspect the container config', cmd:'docker inspect my-nginx | python3 -m json.tool | head -50', expected:'JSON config showing ports, mounts, env vars', isBreak:false, desc:'docker inspect shows everything: IP address, port bindings, environment variables, mount points.'},
        {title:'Clean up', cmd:'docker stop my-nginx && docker rm my-nginx', expected:'Container stopped and removed', isBreak:false, desc:''},
      ]
    },
    exercises:[
      {q:'What is the difference between docker stop and docker kill?', a:'<code>docker stop</code> sends SIGTERM to the main process, giving it time to shut down gracefully (save state, close connections). If it does not exit within 10 seconds, Docker sends SIGKILL. <code>docker kill</code> sends SIGKILL immediately — no graceful shutdown. Always use stop first. Use kill only if stop is hanging.', level:'basic'},
      {q:'You run docker stop on a container then docker start it again. What happens to data written inside the container?', a:'Data persists — the container\'s writable layer survives stop/start on the same host. Data is only lost when you docker rm the container. For persistence that survives rm or works across multiple hosts, use volumes: <code>-v /host/path:/container/path</code> (bind mount) or <code>-v mydata:/container/path</code> (named volume).', level:'basic'},
      {q:'How do you see the environment variables set inside a running container?', a:'Two methods: 1. <code>docker exec mycontainer env</code> — runs env command inside the container, lists all env vars. 2. <code>docker inspect mycontainer | grep -A 20 "Env"</code> — shows env vars from the container config. The first method shows the actual runtime environment, the second shows what was configured at start time.', level:'intermediate'},
    ],
    interview:[
      {q:'What is the difference between a Docker image and a container?', level:'basic',
       a:'An image is a read-only template — a stack of filesystem layers built from a Dockerfile. It is stored in a registry and does not run anything. A container is a running (or stopped) instance of an image — an isolated process with its own filesystem (writable layer on top of the image), networking, and process space. One image can create thousands of containers. Analogy: image is the class definition in code, container is the instantiated object.',
       trap:'Saying "a container IS a running image" — technically close but misses the key detail: containers have their own writable layer separate from the read-only image. Multiple containers from the same image each have independent writable layers.'},
      {q:'Explain the Docker layer caching system and how to optimise it.', level:'intermediate',
       a:'Each Dockerfile instruction (RUN, COPY, ADD) creates an immutable layer. Docker caches layers and reuses them if inputs have not changed. Key rule: if layer N changes, all layers after N are invalidated and rebuilt. Optimisation: put the most stable instructions first. Pattern for Node.js: <br>1. COPY package.json . <br>2. RUN npm install (cached until package.json changes)<br>3. COPY . . (source changes here, but deps already cached)<br>4. RUN npm build<br>This way a code change only rebuilds layers 3 and 4, not the slow npm install.',
       trap:'Not explaining the "layer N invalidates all subsequent layers" rule. Just saying "put stable things first" without explaining why is a shallow answer.'},
    ],
    resources:[
      {label:'Play with Docker — free browser-based lab', url:'https://labs.play-with-docker.com'},
      {label:'Docker official getting started', url:'https://docs.docker.com/get-started'},
    ]
  },

  {
    id:'c2-dockerfile', title:'Dockerfile Mastery & Multi-Stage Builds', subtitle:'Write production-grade Dockerfiles, not tutorial ones',
    time:'60 min', type:'lab', certs:['az400'], xp:120, animationId:'docker-layers',
    concept:{
      plain:'A Dockerfile is a recipe for building a Docker image. Every line in the file creates a layer. Writing a good Dockerfile means: small images that deploy fast, layers that cache well so builds are quick, and no security vulnerabilities from unnecessary tools.',
      analogy:'A multi-stage Dockerfile is like a factory with two rooms. Room 1 (builder) has all the heavy machinery — compilers, test tools, development libraries. Once the product is manufactured, only the finished item moves to Room 2 (production) — a small, clean shipping container. No machinery, no raw materials, no mess. Just the product.',
      technical:`<strong>Key instructions:</strong><br>
<code>FROM node:18-alpine</code> — base image (always pin the version, never :latest in production)<br>
<code>WORKDIR /app</code> — set working directory, creates it if missing<br>
<code>COPY package*.json ./</code> — copy package files first (for layer caching)<br>
<code>RUN npm ci --only=production</code> — install deps (cached until package.json changes)<br>
<code>COPY . .</code> — copy source code (changes every build)<br>
<code>CMD ["node", "server.js"]</code> — default command (overridable). Use ENTRYPOINT for a fixed executable.<br>
<code>USER nonroot</code> — run as non-root user (security!)<br>
<code>EXPOSE 3000</code> — documentation only, does not actually publish the port<br>
<code>HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1</code><br><br>
<strong>Multi-stage build pattern:</strong><br>
<code>FROM golang:1.21 AS builder</code><br>
<code>RUN go build -o /app/binary .</code><br>
<code>FROM alpine:latest</code><br>
<code>COPY --from=builder /app/binary /app/binary</code><br>
<code>CMD ["/app/binary"]</code><br>
Result: final image has no Go compiler, no source code, no build tools. 900MB → 15MB.<br><br>
<strong>.dockerignore:</strong> same syntax as .gitignore. Exclude: node_modules, .git, *.log, .env, Dockerfile, README. Prevents sending large local files to build context.`
    },
    commands:[
      {cmd:'docker build -t myapp:v1.0 -f Dockerfile .', desc:'Build image with tag myapp:v1.0 using Dockerfile in current directory', when:'Building a new version of your application', example:'Successfully built abc123\\nSuccessfully tagged myapp:v1.0', level:'basic'},
      {cmd:'docker build --no-cache -t myapp:fresh .', desc:'Build without using any cached layers — forces fresh download and rebuild of everything', when:'When you suspect stale cache is causing issues, or before releasing to production', example:'Step 1/12: FROM node:18...', level:'intermediate'},
      {cmd:'docker image inspect myapp:v1.0 | jq \'.[0].RootFS.Layers | length\'', desc:'Count the number of layers in an image', when:'Auditing image size and layer count', example:'8', level:'advanced'},
      {cmd:'docker scan myapp:v1.0', desc:'Scan image for known CVE vulnerabilities (requires Docker Desktop)', when:'Security audit before pushing to production registry', example:'High severity: CVE-2023-xxxx in openssl', level:'intermediate'},
      {cmd:'docker history myapp:v1.0', desc:'Show all layers of an image with their sizes and commands that created them', when:'Debugging image size — finding which layer is largest', example:'COPY . . 45MB\\nRUN npm install 120MB', level:'intermediate'},
    ],
    lab:{
      title:'Optimise a Fat Docker Image — From 900MB to Under 100MB',
      scenario:'You are given a Node.js Dockerfile that produces a 900MB image. Your job: apply multi-stage builds and best practices to get it under 100MB.',
      cloudUrl:'https://labs.play-with-docker.com',
      steps:[
        {title:'Create a sample app', cmd:'mkdir docker-lab && cd docker-lab\ncat > app.js << \'EOF\'\nconst http = require("http");\nhttp.createServer((req,res)=>{ res.end("Hello from PipelineZero"); }).listen(3000);\nconsole.log("Running on port 3000");\nEOF\necho \'{"name":"app","version":"1.0"}\' > package.json', expected:'Files created', isBreak:false, desc:''},
        {title:'Write the BAD Dockerfile (fat image)', cmd:'cat > Dockerfile.fat << \'EOF\'\nFROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["node", "app.js"]\nEOF\ndocker build -t myapp:fat -f Dockerfile.fat .\ndocker image ls myapp:fat', expected:'Image size ~950MB', isBreak:false, desc:'node:18 is full Debian with build tools. All source files copied including everything.'},
        {title:'Write the GOOD Dockerfile (optimised)', cmd:'cat > Dockerfile << \'EOF\'\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY app.js .\nUSER node\nEXPOSE 3000\nCMD ["node", "app.js"]\nEOF\ndocker build -t myapp:optimised .\ndocker image ls | grep myapp', expected:'myapp:fat ~950MB vs myapp:optimised ~120MB', isBreak:false, desc:'Alpine base image is 5MB vs 950MB for full Debian. npm ci is faster and more reproducible than npm install.'},
        {title:'Test it works', cmd:'docker run -d -p 3000:3000 --name test-app myapp:optimised && sleep 2 && curl http://localhost:3000', expected:'Hello from PipelineZero', isBreak:false, desc:''},
        {title:'Break it — what happens with COPY . . BEFORE npm install?', cmd:'cat > Dockerfile.slow << \'EOF\'\nFROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm ci --only=production\nCMD ["node", "app.js"]\nEOF\ntouch app.js\ndocker build -t myapp:slow -f Dockerfile.slow . && docker build -t myapp:slow -f Dockerfile.slow .', expected:'Second build does NOT use cache for npm install', isBreak:True, desc:'Any change to app.js invalidates the COPY . . layer, which invalidates npm install. Compare with the optimised version where changing app.js only invalidates the final COPY app.js . layer.'},
        {title:'Clean up', cmd:'docker stop test-app && docker rm test-app && docker rmi myapp:fat myapp:optimised myapp:slow && cd .. && rm -rf docker-lab', expected:'Images removed', isBreak:false, desc:''},
      ]
    },
    exercises:[
      {q:'What is the difference between CMD and ENTRYPOINT in a Dockerfile?', a:'<strong>CMD</strong> provides default arguments that can be overridden when running a container: <code>docker run myimage custom-command</code> replaces CMD. Use CMD for the default behavior you expect users to override. <strong>ENTRYPOINT</strong> sets the executable that always runs — it cannot be overridden with docker run arguments (only with --entrypoint flag). Use ENTRYPOINT when the container IS the command (e.g. <code>ENTRYPOINT ["nginx"]</code>). Best practice: use ENTRYPOINT for the executable + CMD for default args: <code>ENTRYPOINT ["node"] CMD ["server.js"]</code>', level:'intermediate'},
      {q:'Why should you never use :latest as a Docker image tag in production?', a:':latest is a mutable tag — it points to whatever the most recent push was. This means: two builds of the same Dockerfile can produce different results if the base image changed between builds. You cannot reproduce a specific version later. Rollback is unreliable. Always use specific version tags: <code>node:18.19.0-alpine3.19</code> not <code>node:18</code> or <code>node:latest</code>. In production CI/CD, tag your own images with the git SHA: <code>myapp:$(git rev-parse --short HEAD)</code>', level:'intermediate'},
      {q:'What does .dockerignore do and what should it always include?', a:'.dockerignore prevents files from being sent to the Docker build context (the files Docker reads before building). Without it, Docker sends your entire project directory — including node_modules (1GB), .git history, log files, etc. Always include: <code>node_modules</code>, <code>.git</code>, <code>*.log</code>, <code>.env</code>, <code>Dockerfile*</code>, <code>README.md</code>, <code>tests/</code> (unless needed for build), <code>.github/</code>. A large build context makes every build slow even before the first instruction runs.', level:'intermediate'},
    ],
    interview:[
      {q:'Your Node.js Docker image is 900MB. How do you get it to under 100MB?', level:'intermediate',
       a:'Three techniques: 1. Switch from <code>node:18</code> to <code>node:18-alpine</code> — drops from 950MB to 175MB immediately. 2. Copy package.json first, run npm install, then copy source code — this is layer caching, not size reduction. 3. Multi-stage build: build stage runs npm install with devDependencies, production stage copies only the built output and runs npm install --only=production. Result for most Node.js apps: 80-150MB. Also: add .dockerignore to exclude node_modules from build context.',
       trap:'Only mentioning alpine base image. For a complete answer you need multi-stage builds. Many apps still have 300MB images even on alpine because they include devDependencies. Multi-stage is the key technique.'},
    ],
    resources:[
      {label:'Docker multi-stage builds docs', url:'https://docs.docker.com/build/building/multi-stage'},
      {label:'Trivy — free container vulnerability scanner', url:'https://trivy.dev'},
    ]
  },

  {
    id:'c3-docker-compose', title:'Docker Compose — Multi-Container Apps', subtitle:'Run your entire stack locally with one command',
    time:'45 min', type:'lab', certs:['az400'], xp:100,
    concept:{
      plain:'Docker Compose lets you define and run multi-container applications with a single YAML file. One command starts your API, database, cache, and frontend together — same on every developer\'s machine.',
      analogy:'Docker Compose is like a stage directions document for a theatre production. Each actor (container) has their role, costume (image), cues (depends_on), and where to stand (networks and ports). With one command "places everyone" — all actors take their positions simultaneously and the show begins.',
      technical:`<strong>docker-compose.yml structure:</strong><br>
<code>version: "3.9"</code><br>
<code>services:</code><br>
&nbsp;&nbsp;<code>api:</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>image: myapp:latest</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>ports: ["8080:3000"]</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>environment: [DB_HOST=db, DB_PORT=5432]</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>depends_on: [db]</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>networks: [backend]</code><br>
&nbsp;&nbsp;<code>db:</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>image: postgres:15-alpine</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>volumes: [pgdata:/var/lib/postgresql/data]</code><br>
&nbsp;&nbsp;&nbsp;&nbsp;<code>environment: [POSTGRES_PASSWORD=secret]</code><br>
<code>volumes:</code><br>
&nbsp;&nbsp;<code>pgdata:</code><br>
<code>networks:</code><br>
&nbsp;&nbsp;<code>backend:</code><br><br>
<strong>Key facts:</strong> Services reference each other by service name (api connects to "db:5432"). Each compose file gets its own isolated network. depends_on only waits for the container to START, not for the application inside to be ready — use healthchecks for that.<br><br>
<strong>Healthcheck:</strong><br>
<code>healthcheck:</code><br>
&nbsp;&nbsp;<code>test: ["CMD", "pg_isready", "-U", "postgres"]</code><br>
&nbsp;&nbsp;<code>interval: 5s</code><br>
&nbsp;&nbsp;<code>retries: 5</code>`
    },
    commands:[
      {cmd:'docker compose up -d', desc:'Start all services defined in docker-compose.yml in the background (-d = detached)', when:'Starting your local development environment', example:'[+] Running 3/3 container started', level:'basic'},
      {cmd:'docker compose down -v', desc:'Stop and remove all containers, networks. -v also removes named volumes (deletes database data!)', when:'Resetting your local environment completely', example:'[+] Running 3/3 removed', level:'basic'},
      {cmd:'docker compose logs -f api', desc:'Follow logs from the api service specifically. Remove service name to see all services', when:'Debugging why a specific service is failing', example:'api_1 | 2026-01-01 ERROR DB connection refused', level:'basic'},
      {cmd:'docker compose ps', desc:'Show status of all services in the current compose project', when:'Check which services are running and their ports', example:'NAME       STATUS    PORTS', level:'basic'},
      {cmd:'docker compose exec db psql -U postgres', desc:'Open an interactive shell in a running compose service (db in this case)', when:'Debugging database state, running queries, checking data', example:'postgres=# \\l', level:'intermediate'},
      {cmd:'docker compose up -d --scale api=3', desc:'Scale the api service to 3 instances', when:'Testing load balancing locally or load testing', example:'[+] Running 5/5 (1 db + 3 api + 1 nginx)', level:'intermediate'},
    ],
    lab:{
      title:'Run a Full Stack App (API + Database) with Docker Compose',
      scenario:'Define a multi-service app with an API and PostgreSQL database. Connect them, add healthchecks, and test the full stack locally.',
      cloudUrl:'https://labs.play-with-docker.com',
      steps:[
        {title:'Create the project', cmd:'mkdir compose-lab && cd compose-lab\ncat > docker-compose.yml << \'EOF\'\nversion: "3.9"\nservices:\n  api:\n    image: nginx:alpine\n    ports:\n      - "8080:80"\n    depends_on:\n      db:\n        condition: service_healthy\n    networks:\n      - backend\n  db:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: myapp\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      retries: 5\n    networks:\n      - backend\nvolumes:\n  pgdata:\nnetworks:\n  backend:\nEOF', expected:'docker-compose.yml created', isBreak:false, desc:''},
        {title:'Start the stack', cmd:'docker compose up -d', expected:'Both containers running', isBreak:false, desc:'The api service waits for db to pass its healthcheck before starting. This prevents race conditions.'},
        {title:'Check all services are healthy', cmd:'docker compose ps', expected:'Both api and db show as running/healthy', isBreak:false, desc:''},
        {title:'Test API is running', cmd:'curl http://localhost:8080', expected:'nginx welcome page HTML', isBreak:false, desc:''},
        {title:'Connect to the database', cmd:'docker compose exec db psql -U postgres -c "\\l"', expected:'List of databases including myapp', isBreak:false, desc:'This runs psql inside the running db container. No need to install postgres client on your host.'},
        {title:'Break it — what if db is not healthy', cmd:'docker compose stop db\ndocker compose up -d api 2>&1', expected:'api refuses to start or shows dependency error', isBreak:True, desc:'With condition: service_healthy, if db fails its healthcheck the api will not start. Check docker compose ps to see db is stopped, then docker compose start db to fix it.'},
        {title:'Clean up', cmd:'docker compose down -v && cd .. && rm -rf compose-lab', expected:'All resources removed including database volume', isBreak:false, desc:'-v flag removes the pgdata volume — deletes database data permanently.'},
      ]
    },
    exercises:[
      {q:'Why does depends_on not guarantee the application is ready — only that the container started?', a:'Docker Compose depends_on only waits for the container process to start, not for the application inside to be ready. A PostgreSQL container starts in milliseconds but the database takes 5-10 seconds to initialise. If your API tries to connect immediately after the container starts, it will fail. Solution: use healthchecks — define a test command that returns success only when the application is truly ready. Then use <code>depends_on: condition: service_healthy</code>. This makes Compose wait for the healthcheck to pass before starting dependent services.', level:'intermediate'},
      {q:'How do containers in the same docker-compose.yml communicate with each other?', a:'Docker Compose creates a shared network for all services in the same file. Services can reach each other using their service name as the hostname. Example: if your service is named "db", your API connects to "db:5432" — not "localhost:5432". This is identical to how K8s Service DNS works (service-name:port). This is why apps containerised with Compose are easy to move to Kubernetes — the service discovery pattern is the same.', level:'basic'},
    ],
    interview:[
      {q:'What is the difference between docker compose up and docker compose start?', level:'basic',
       a:'<code>docker compose up</code> creates and starts containers — if they do not exist yet, it creates them from the image. Also rebuilds images if you pass --build. <code>docker compose start</code> starts existing stopped containers — it will not create new ones. Typical workflow: first time = up, subsequent times after down = up again, after stop = start. Use up -d for daily development workflow (creates if missing, starts if stopped).',
       trap:'Not knowing that up creates containers while start only restarts existing ones. This matters when you change the compose file — start will not pick up changes, up will.'},
    ],
    resources:[
      {label:'Docker Compose docs', url:'https://docs.docker.com/compose'},
    ]
  },

  {
    id:'c4-container-security', title:'Container Security', subtitle:'Non-root, read-only, scanned — harden everything',
    time:'40 min', type:'concept', certs:['az400'], xp:100,
    concept:{
      plain:'A container running as root with a writable filesystem is one exploit away from accessing the host. Container security means: run as non-root, use read-only filesystems, scan for vulnerabilities, and sign images so you know what you are deploying.',
      analogy:'Container security is like safety equipment at a construction site. The hard hat (non-root user) is mandatory — you do not walk on site without it. Fall protection (read-only filesystem) limits the damage if something goes wrong. Safety harness (dropped Linux capabilities) prevents access to dangerous areas. Just because not every site enforces all rules does not mean you should ignore them.',
      technical:`<strong>Run as non-root in Dockerfile:</strong><br>
<code>RUN addgroup -S appgroup && adduser -S appuser -G appgroup</code><br>
<code>USER appuser</code><br><br>
<strong>Read-only filesystem in K8s:</strong><br>
<code>securityContext:</code><br>
&nbsp;&nbsp;<code>readOnlyRootFilesystem: true</code><br>
&nbsp;&nbsp;<code>allowPrivilegeEscalation: false</code><br>
&nbsp;&nbsp;<code>runAsNonRoot: true</code><br>
&nbsp;&nbsp;<code>capabilities: { drop: ["ALL"] }</code><br><br>
<strong>If app needs to write files:</strong> Mount a writable emptyDir volume at the specific path. <code>readOnlyRootFilesystem</code> only blocks the container filesystem, not mounted volumes.<br><br>
<strong>Image scanning:</strong> Trivy scans images for CVEs in OS packages and application dependencies. Run in CI: <code>trivy image myapp:v1.0 --exit-code 1 --severity HIGH,CRITICAL</code><br><br>
<strong>Image signing with Cosign:</strong> Sign images after build: <code>cosign sign myregistry/myapp:v1.0</code>. Verify before deploy. Prevents deploying tampered images.<br><br>
<strong>Image tag pinning:</strong> Use digest (@sha256:abc...) instead of tags for production. Tags are mutable; digests are immutable.`
    },
    commands:[
      {cmd:'trivy image nginx:latest', desc:'Scan nginx image for known vulnerabilities (CVEs). Shows severity level for each finding', when:'Before pushing any image to production registry', example:'HIGH: CVE-2023-xxx in libssl\\nTotal: 5 high, 12 medium', level:'intermediate'},
      {cmd:'trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:v1', desc:'Scan and return exit code 1 if HIGH or CRITICAL CVEs found — fails CI/CD pipeline on vulnerable images', when:'CI/CD pipeline gate to block deployment of vulnerable images', example:'(pipeline fails if vulnerabilities found)', level:'intermediate'},
      {cmd:'docker run --read-only --tmpfs /tmp nginx:alpine', desc:'Run container with read-only root filesystem but allow writes to /tmp via tmpfs', when:'Testing if your container works with a read-only filesystem before adding K8s securityContext', example:'(nginx starts with read-only root)', level:'intermediate'},
      {cmd:'docker run --user 1000:1000 myapp:v1', desc:'Run container as user ID 1000 (non-root) overriding the Dockerfile USER', when:'Running third-party images that default to root', example:'(container runs as uid=1000)', level:'intermediate'},
    ],
    exercises:[
      {q:'Why is running a container as root dangerous?', a:'If the containerised application is compromised (e.g. via a code injection vulnerability), the attacker has root access inside the container. If there is also a container escape vulnerability in the container runtime (Docker, containerd), the attacker gets root access on the HOST — potentially the entire Kubernetes node, including other containers and secrets. Running as non-root means an attacker gets only the limited permissions of that user. Combined with read-only filesystem and dropped Linux capabilities, the blast radius of an exploit is drastically reduced.', level:'intermediate'},
      {q:'Your container needs readOnlyRootFilesystem: true but the app writes temp files. How do you handle this?', a:'Mount an emptyDir volume at the path the app writes to. readOnlyRootFilesystem only makes the container\'s union filesystem read-only — mounted volumes are still writable. Example in K8s: <code>volumes: [{name: tmp, emptyDir: {}}]</code> + <code>volumeMounts: [{name: tmp, mountPath: /tmp}]</code>. emptyDir is ephemeral (deleted when pod is deleted) but writable. For persistent writes use PersistentVolumeClaim instead.', level:'intermediate'},
    ],
    interview:[
      {q:'What is a supply chain attack in the context of containers and how do you defend against it?', level:'advanced',
       a:'A supply chain attack targets your software build process rather than your running application. Examples: malicious code injected into a popular npm package your app depends on, a compromised base Docker image in a public registry, or a CI/CD system that builds and pushes a tampered image. Defences: 1. Pin base image versions to specific digests (immutable, cannot be tampered post-publish). 2. Scan all images for CVEs in CI/CD with Trivy or Snyk. 3. Sign images with Cosign and verify signatures at deploy time. 4. Use private registries (ACR, ECR) for your own images — never pull untrusted images directly to production. 5. Generate SBOMs (Software Bill of Materials) to know every dependency in every image.',
       trap:'Saying "just scan for vulnerabilities." Scanning catches known CVEs but not malicious code injections. The complete answer includes image signing and private registry policies.'},
    ],
    resources:[
      {label:'Trivy — open source vulnerability scanner', url:'https://trivy.dev'},
      {label:'Docker security best practices', url:'https://docs.docker.com/develop/security-best-practices'},
    ]
  },

  {
    id:'c5-docker-networking-volumes', title:'Docker Networking & Volumes', subtitle:'How containers talk and persist data',
    time:'40 min', type:'concept', certs:['az400'], xp:90,
    concept:{
      plain:'Containers are isolated by default — they cannot reach each other or the outside world unless you explicitly configure it. Volumes are how data survives container restarts and is shared between containers.',
      analogy:'Docker networks are office buildings. Containers on the same network are colleagues in the same building — they find each other by name (DNS). Different networks are different buildings with no connecting corridor. Volumes are USB drives — they exist independently of any container and can be plugged into any container. Plug one USB into container A and container B to share files between them.',
      technical:`<strong>Network types:</strong><br>
bridge (default) — containers get private IPs on a virtual switch. User-defined bridges enable DNS by container name.<br>
host — container shares the host\'s network namespace. No port mapping needed but no isolation.<br>
none — no network access at all.<br>
overlay — multi-host networking for Docker Swarm / K8s.<br><br>
<strong>Container DNS on user-defined networks:</strong> Containers resolve each other by service name. On the default bridge network they can only reach each other by IP address.<br><br>
<strong>Volume types:</strong><br>
<code>-v /host/path:/container/path</code> — bind mount: mounts a specific host directory. Changes on host visible in container immediately. Used for development (mount source code).<br>
<code>-v mydata:/container/path</code> — named volume: managed by Docker, stored at /var/lib/docker/volumes/. Survives container rm. Used for persistent data (databases).<br>
<code>--tmpfs /tmp</code> — in-memory, no persistence. Used for sensitive temp data.<br><br>
<strong>Inspect volumes:</strong> <code>docker volume ls</code>, <code>docker volume inspect mydata</code>`
    },
    commands:[
      {cmd:'docker network create mynetwork && docker run -d --network mynetwork --name db postgres:15-alpine && docker run -it --network mynetwork --name app alpine ping db', desc:'Create network, start postgres named "db", start alpine and ping "db" by name — shows DNS resolution', when:'Understanding how container-to-container networking works', example:'PING db: 64 bytes from db (172.18.0.2)', level:'intermediate'},
      {cmd:'docker volume create mydata && docker run -v mydata:/data alpine sh -c "echo hello > /data/test.txt" && docker run -v mydata:/data alpine cat /data/test.txt', desc:'Create volume, write to it from container 1, read from it in container 2 — data persists', when:'Demonstrating named volume persistence between containers', example:'hello', level:'intermediate'},
      {cmd:'docker run -v $(pwd):/app -w /app node:18-alpine node server.js', desc:'Mount current directory into container and run app — changes to local files reflect immediately', when:'Local development: run app in container but edit files on host', example:'Server running on port 3000', level:'basic'},
    ],
    exercises:[
      {q:'In a docker-compose.yml, container A wants to connect to container B\'s database on port 5432. What hostname does A use?', a:'A uses the service name of B as the hostname — e.g. "db:5432" if the service is named "db" in the compose file. Docker Compose automatically creates a network and registers each service name as a DNS entry. This is the same pattern as Kubernetes — services connect to each other by service name, not IP address. Never use "localhost:5432" — localhost inside a container means the container itself, not another container.', level:'basic'},
      {q:'What is the difference between a bind mount and a named volume?', a:'Bind mount (-v /host/path:/container/path): mounts a specific directory from the host. The host path must exist. Used in development to mount source code so changes are instantly visible in the container without rebuilding. Named volume (-v mydata:/container/path): Docker creates and manages the storage at /var/lib/docker/volumes/. The volume persists even after docker rm. Used for databases and other persistent data. Named volumes are portable — they work on any host. Bind mounts are host-specific.', level:'intermediate'},
    ],
    interview:[
      {q:'Why would you use a named volume over a bind mount for a database in production?', level:'intermediate',
       a:'Portability: named volumes work on any system — no specific host path needed. Named volumes are managed by Docker with proper permissions already set (bind mounts can have ownership/permission conflicts). In Docker Compose and K8s, named volumes are the standard — they abstract the storage from the host path. Bind mounts are for development (mounting source code) where you want the host and container to share the same files. For production databases, named volumes (or K8s PersistentVolumeClaims) are correct because they are managed, durable, and portable.',
       trap:'Saying named volumes are "more persistent" — both survive container rm. The real advantage is portability and Docker management.'},
    ],
    resources:[
      {label:'Docker networking overview', url:'https://docs.docker.com/network'},
    ]
  }

  ] // end lessons
}; // end CONTAINERS_DATA
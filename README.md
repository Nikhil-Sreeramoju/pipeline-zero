# PipelineZero 🚀

**From zero to production-ready — your complete DevOps learning platform**

Live at: [https://nikhil-sreeramoju.github.io/pipeline-zero](https://nikhil-sreeramoju.github.io/pipeline-zero)

---

## What is PipelineZero?

PipelineZero is a structured, interactive DevOps learning platform covering 88 lessons across 16 topics — built for 2026 market requirements.

**Tier 1 — Core Skills:** Foundation (Linux, Git, Networking) → Docker → Kubernetes (22 lessons, scratch to advanced) → CI/CD (Jenkins, Azure Pipelines, GitHub Actions) → IaC (Terraform, Ansible) → Observability

**Tier 2 — Advanced:** DevSecOps → Python for DevOps → Cloud (Azure + AWS) → Platform Engineering → Service Mesh → SRE → AI/MLOps → Interview Ready

---

## How to use locally

```bash
# Clone the repo
git clone https://github.com/Nikhil-Sreeramoju/pipeline-zero.git
cd pipeline-zero

# Start local server (Python — comes with every OS)
python3 -m http.server 8080

# Open in browser
http://localhost:8080
```

Or use **VS Code Live Server** extension — install it, right-click index.html → "Open with Live Server".

---

## How to deploy updates to GitHub Pages

```bash
# Make your changes to any file
git add .
git commit -m "Add Kubernetes networking lesson"
git push origin main
# GitHub Pages auto-deploys in ~60 seconds
```

---

## File structure

```
pipeline-zero/
├── index.html          ← App shell, layout, all screens
├── styles.css          ← Design system, animations, responsive
├── app.js              ← Routing, progress engine, lesson player
├── data/
│   ├── foundation.js   ← Foundation lessons (Linux, Git, Networking)
│   └── ...             ← One file per topic, added each session
├── animations/
│   ├── git.js          ← Git branching animated explainer
│   └── ...             ← Topic-specific animations
└── README.md
```

---

## Adding a new topic

1. Create `data/yourtopic.js` following the same structure as `data/foundation.js`
2. Add `<script src="data/yourtopic.js"></script>` to `index.html` before `app.js`
3. The topic auto-appears in the sidebar and map

---

## Certifications covered

- 🎯 **CKA** — Certified Kubernetes Administrator
- ☁ **AZ-400** — Microsoft Azure DevOps Engineer Expert
- 🟠 **AWS DevOps Pro** — AWS Certified DevOps Engineer Professional
- 🐧 **LFCS** — Linux Foundation Certified SysAdmin

---

Built with: Pure HTML + CSS + Vanilla JS. No frameworks, no build step, works offline.
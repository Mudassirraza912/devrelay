# 🔄 DevRelay

<p align="center">
  <strong>Universal Cross-Agent Session Bridge for AI Coding Assistants</strong><br>
  <em>Never lose momentum when your AI agent hits a rate limit.</em>
</p>

<p align="center">
  <a href="https://github.com/Mudassirraza912/devrelay/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node Version">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platforms">
  <a href="https://github.com/Mudassirraza912/devrelay/stargazers"><img src="https://img.shields.io/github/stars/Mudassirraza912/devrelay?style=social" alt="GitHub Stars"></a>
</p>

---

## ⚡ The Problem

You are deep into writing code with **Claude Code** (or **Codex**), and suddenly you hit the **rate limit**. 

Your other AI agents (**Antigravity**, **Codex**, **Copilot**) are ready to work, but explaining where you left off, which files are uncommitted, what failed, and what remains takes 15 minutes of tedious prompt drafting.

```
┌─────────────────┐       Rate Limit Hit               ┌──────────────────┐
│   Claude Code   │ ─────────────────────────────────► │   Work Paused 🛑 │
└─────────────────┘                                    └──────────────────┘
         │
         │  DevRelay Bridge
         ▼
┌─────────────────┐       Instantly Resumes Task       ┌──────────────────┐
│    DevRelay     │ ─────────────────────────────────► │ Antigravity/Codex│
│ (Local State)   │                                    │   (Continues 🚀) │
└─────────────────┘                                    └──────────────────┘
```

**DevRelay solves this completely:**
- 🔍 **Auto-Discovers Local Transcripts**: Scans sessions across Claude Code, Codex, and Antigravity directly on your disk.
- 🎯 **Preserves In-Flight State**: Extracts active project workspace (`cwd`), uncommitted files, PR/milestone status, and exact pending tasks.
- 🔌 **Universal MCP & CLI**: Native Model Context Protocol (MCP) server + standalone CLI for zero-friction handoff.
- 🔒 **100% Local & Private**: Never sends code or chat logs to external cloud servers. Everything is parsed locally on your machine.

---

## 🚀 Quickstart

### Option 1: NPX (Zero-Install)
Run setup instantly on any machine:
```bash
npx devrelay-cli setup
```

### Option 2: Global Install
```bash
npm install -g devrelay-cli
devrelay setup
```

The `setup` command automatically configures:
- **Google Antigravity**: Registers the DevRelay MCP server & continuity skills in `~/.gemini/config/`.
- **Claude Code**: Registers the DevRelay skill in `~/.claude/skills/`.
- **OpenAI Codex**: Registers the DevRelay skill in `~/.codex/skills/`.

---

## 💻 CLI Usage

### 1. List All Active Sessions Across All Agents
```bash
devrelay list
```
*Output:*
```text
🔄 Active & Recent Agent Sessions Across Your System:

[1] [Claude Code] "Refactor authentication service"
    ID:        a1b2c3d4-e5f6-7890-abcd-ef1234567890
    Workspace: ~/projects/ecommerce-api
    Updated:   12m ago
    Status:    "Implement JWT validation and error handling..."

[2] [Codex] "Fix database connection pool timeout"
    ID:        b2c3d4e5-f6a7-8901-bcde-f12345678901
    Workspace: ~/projects/payment-service
    Updated:   1h ago
    Status:    "Verify pool configuration and retry logic..."

[3] [Antigravity] "Add dark mode toggle to navigation"
    ID:        c3d4e5f6-a7b8-9012-cdef-123456789012
    Workspace: ~/projects/web-dashboard
    Updated:   Just now
```

---

### 2. Resume / Handoff Any Session
```bash
devrelay resume <session_id_or_keyword>
```
*Example:*
```bash
devrelay resume ecommerce-api
```
*Prints the full state snapshot, workspace path, and remaining tasks to continue the work in any agent.*

---

## 🤖 Using Inside Your AI Assistant

Once configured, you can invoke DevRelay directly inside any coding agent:

* **In Antigravity / Cursor:**
  ```text
  @devrelay list
  ```
  or
  ```text
  devrelay resume <id>
  ```
* **In Claude Code / Codex:**
  ```text
  /devrelay
  ```

---

## 📂 Supported Platforms & Paths

| Agent Platform | Interface | Local Session Location |
| :--- | :--- | :--- |
| **Claude Code** | CLI / Extension | `~/.claude/projects/` |
| **OpenAI Codex** | CLI / Extension | `~/.codex/sessions/` |
| **Google Antigravity** | IDE / CLI | `~/.gemini/antigravity/brain/` |

---

## 🛠️ Local Development & Testing

```bash
git clone https://github.com/Mudassirraza912/devrelay.git
cd devrelay
npm link
devrelay list
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Mudassirraza912">Mudassir Raza</a>
</p>

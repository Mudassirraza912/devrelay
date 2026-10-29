const fs = require('fs');
const path = require('path');
const os = require('os');

const home = os.homedir();

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// 1. Claude Code Scanner
function getClaudeSessions() {
  const baseDir = path.join(home, '.claude', 'projects');
  if (!fs.existsSync(baseDir)) return [];
  const results = [];
  try {
    const projects = fs.readdirSync(baseDir);
    for (const proj of projects) {
      const projDir = path.join(baseDir, proj);
      if (!fs.statSync(projDir).isDirectory()) continue;
      const files = fs.readdirSync(projDir).filter(f => f.endsWith('.jsonl'));
      for (const file of files) {
        const fullPath = path.join(projDir, file);
        const stat = fs.statSync(fullPath);

        const fd = fs.openSync(fullPath, 'r');
        const headBuf = Buffer.alloc(Math.min(stat.size, 65536));
        fs.readSync(fd, headBuf, 0, headBuf.length, 0);
        const headStr = headBuf.toString('utf8');

        const tailBuf = Buffer.alloc(Math.min(stat.size, 65536));
        const tailPos = Math.max(0, stat.size - tailBuf.length);
        fs.readSync(fd, tailBuf, 0, tailBuf.length, tailPos);
        fs.closeSync(fd);
        const tailStr = tailBuf.toString('utf8');

        let title = '';
        const promptMatches = tailStr.match(/"lastPrompt":"([^"]+)"/g) || headStr.match(/"lastPrompt":"([^"]+)"/g);
        if (promptMatches) {
          const last = promptMatches[promptMatches.length - 1];
          const m = last.match(/"lastPrompt":"([^"]+)"/);
          if (m) title = m[1];
        }

        let cwd = '';
        const cwdMatches = tailStr.match(/"cwd":"([^"]+)"/g) || headStr.match(/"cwd":"([^"]+)"/g);
        if (cwdMatches) {
          const last = cwdMatches[cwdMatches.length - 1];
          const m = last.match(/"cwd":"([^"]+)"/);
          if (m) cwd = m[1].replace(/\\\\/g, '\\');
        }

        let lastText = '';
        const textMatches = [...tailStr.matchAll(/"role":"assistant","content":\[\{"type":"text","text":"([\s\S]*?)"\}\]/g)];
        if (textMatches.length > 0) {
          lastText = textMatches[textMatches.length - 1][1]
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"');
        }

        results.push({
          agent: 'Claude Code',
          id: file.replace('.jsonl', ''),
          title: title || 'Untitled Claude Session',
          cwd: cwd,
          updatedAt: stat.mtime,
          timeAgo: timeAgo(stat.mtime),
          lastAssistantMessage: lastText,
          filePath: fullPath
        });
      }
    }
  } catch (e) {}
  return results;
}

// 2. Codex Scanner
function getCodexSessions() {
  const indexFile = path.join(home, '.codex', 'session_index.jsonl');
  if (!fs.existsSync(indexFile)) return [];
  const results = [];
  try {
    const lines = fs.readFileSync(indexFile, 'utf8').trim().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line);
      const sessionFile = path.join(home, '.codex', 'sessions', data.id + '.json');
      let mtime = new Date(data.updated_at);
      let lastText = '';
      if (fs.existsSync(sessionFile)) {
        try {
          const sStat = fs.statSync(sessionFile);
          mtime = sStat.mtime;
        } catch (e) {}
      }
      results.push({
        agent: 'Codex',
        id: data.id,
        title: data.thread_name || 'Untitled Thread',
        cwd: '',
        updatedAt: mtime,
        timeAgo: timeAgo(mtime),
        lastAssistantMessage: lastText,
        filePath: sessionFile
      });
    }
  } catch (e) {}
  return results;
}

// 3. Antigravity Scanner
function getAntigravitySessions() {
  const brainDir = path.join(home, '.gemini', 'antigravity', 'brain');
  if (!fs.existsSync(brainDir)) return [];
  const results = [];
  try {
    const dirs = fs.readdirSync(brainDir);
    for (const d of dirs) {
      const transcript = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
      if (fs.existsSync(transcript)) {
        const stat = fs.statSync(transcript);
        let title = '';
        try {
          const fd = fs.openSync(transcript, 'r');
          const headBuf = Buffer.alloc(Math.min(stat.size, 16384));
          fs.readSync(fd, headBuf, 0, headBuf.length, 0);
          fs.closeSync(fd);
          const headStr = headBuf.toString('utf8');
          const m = headStr.match(/"USER_INPUT"[\s\S]*?"content":"([^"]+)"/);
          if (m) title = m[1].replace(/\\n/g, ' ').replace(/<[^>]+>/g, '').trim().slice(0, 80);
        } catch (e) {}

        results.push({
          agent: 'Antigravity',
          id: d,
          title: title || 'Antigravity Session',
          cwd: '',
          updatedAt: stat.mtime,
          timeAgo: timeAgo(stat.mtime),
          lastAssistantMessage: '',
          filePath: transcript
        });
      }
    }
  } catch (e) {}
  return results;
}

function getAllSessions() {
  const all = [
    ...getClaudeSessions(),
    ...getCodexSessions(),
    ...getAntigravitySessions()
  ];
  all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return all;
}

function findSession(query) {
  const all = getAllSessions();
  const q = query.toLowerCase().trim();
  return all.find(s =>
    s.id.toLowerCase().includes(q) ||
    s.title.toLowerCase().includes(q) ||
    s.cwd.toLowerCase().includes(q)
  );
}

module.exports = {
  getAllSessions,
  findSession,
  getClaudeSessions,
  getCodexSessions,
  getAntigravitySessions
};


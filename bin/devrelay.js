#!/usr/bin/env node

const { getAllSessions, findSession } = require('../src/scanners');
const { install } = require('../src/installer');

const cmd = process.argv[2] || 'list';
const arg = process.argv.slice(3).join(' ');

if (cmd === 'setup' || cmd === 'install') {
  install();
} else if (cmd === 'sync') {
  install();
} else if (cmd === 'list') {
  const sessions = getAllSessions().slice(0, 10);
  console.log('\n🔄 Active & Recent Agent Sessions Across Your System:\n');
  sessions.forEach((s, i) => {
    console.log(`[${i + 1}] [${s.agent}] ${s.title}`);
    console.log(`    ID:        ${s.id}`);
    if (s.cwd) console.log(`    Workspace: ${s.cwd}`);
    console.log(`    Updated:   ${s.timeAgo} (${new Date(s.updatedAt).toLocaleTimeString()})`);
    if (s.lastAssistantMessage) {
      const preview = s.lastAssistantMessage.split('\n').filter(l => l.trim()).slice(-2).join(' ');
      console.log(`    Status:    "${preview.slice(0, 120)}..."`);
    }
    console.log('');
  });
  console.log('💡 Run "devrelay resume <id/query>" or pick a session in your IDE slash menu (/resume-...).');
} else if (cmd === 'resume' || cmd === 'get') {
  if (!arg) {
    console.log('Usage: devrelay resume <session_id_or_keyword>');
    process.exit(1);
  }
  const found = findSession(arg);
  if (!found) {
    console.error(`❌ No session found matching: "${arg}"`);
    process.exit(1);
  }
  console.log(`\n📋 Resuming Session from [${found.agent}]: ${found.title}`);
  console.log(`   Workspace: ${found.cwd || 'N/A'}`);
  console.log(`   Updated:   ${found.timeAgo}\n`);
  console.log('--- Last Agent State ---');
  console.log(found.lastAssistantMessage || 'No text captured.');
  console.log('------------------------\n');
} else {
  console.log(`
Usage: devrelay <command>

Commands:
  devrelay setup              Configure integrations across Antigravity, Claude Code, and Codex
  devrelay list               Show all active & recent coding agent sessions
  devrelay resume <id|query>  Print continuity state to resume in any agent
  devrelay sync               Refresh session skills in the IDE slash menu
`);
}


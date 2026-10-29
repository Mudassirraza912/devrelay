const fs = require('fs');
const path = require('path');
const os = require('os');
const { getAllSessions } = require('./scanners');

const home = os.homedir();

function install() {
  console.log('\n🚀 Installing DevRelay across your installed AI coding agents...\n');
  let installedCount = 0;

  // 1. Antigravity Setup
  const geminiConfigDir = path.join(home, '.gemini', 'config');
  if (fs.existsSync(geminiConfigDir)) {
    const pluginDir = path.join(geminiConfigDir, 'plugins', 'devrelay');
    const skillsDir = path.join(pluginDir, 'skills', 'devrelay');
    fs.mkdirSync(skillsDir, { recursive: true });

    // Write plugin.json
    fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify({
      name: 'devrelay',
      displayName: 'devrelay',
      description: 'Cross-agent session continuity & state handoff bridge',
      version: '1.0.0'
    }, null, 2));

    // Write master SKILL.md
    fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), `---
name: devrelay
description: >-
  Universal Cross-Agent Session Bridge. Use whenever switching agents due to limits
  or picking up an in-flight task across Claude Code, Codex, and Antigravity.
---

# DevRelay: Cross-Agent Session Bridge

DevRelay allows any AI coding assistant to seamlessly pick up work from another agent.

## Workflows:
1. List active sessions:
   \`devrelay list\`
2. Resume a specific session:
   \`devrelay resume <id_or_title>\`
`);

    // Write MCP config
    const mcpConfigFile = path.join(geminiConfigDir, 'mcp_config.json');
    let mcpConfig = {};
    if (fs.existsSync(mcpConfigFile)) {
      try { mcpConfig = JSON.parse(fs.readFileSync(mcpConfigFile, 'utf8')); } catch (e) {}
    }
    mcpConfig.mcpServers = mcpConfig.mcpServers || {};
    const serverScriptPath = path.resolve(__dirname, 'mcp_server.cjs');
    mcpConfig.mcpServers['devrelay'] = {
      command: 'node',
      args: [serverScriptPath]
    };
    fs.writeFileSync(mcpConfigFile, JSON.stringify(mcpConfig, null, 2));

    console.log('✅ Configured for Antigravity (Skills + MCP Server)');
    installedCount++;
  }

  // 2. Claude Code Setup
  const claudeDir = path.join(home, '.claude');
  if (fs.existsSync(claudeDir)) {
    const claudeSkills = path.join(claudeDir, 'skills', 'devrelay');
    fs.mkdirSync(claudeSkills, { recursive: true });
    fs.writeFileSync(path.join(claudeSkills, 'SKILL.md'), `---
name: devrelay
description: >-
  Universal Cross-Agent Session Bridge. Use to inspect and resume sessions from Codex or Antigravity.
---

# DevRelay for Claude Code
Run \`devrelay list\` or \`devrelay resume <id>\` to pick up work from other agents.
`);
    console.log('✅ Configured for Claude Code (Skills)');
    installedCount++;
  }

  // 3. Codex Setup
  const codexDir = path.join(home, '.codex');
  if (fs.existsSync(codexDir)) {
    const codexSkills = path.join(codexDir, 'skills', 'devrelay');
    fs.mkdirSync(codexSkills, { recursive: true });
    fs.writeFileSync(path.join(codexSkills, 'SKILL.md'), `---
name: devrelay
description: >-
  Universal Cross-Agent Session Bridge. Use to inspect and resume sessions from Claude Code or Antigravity.
---

# DevRelay for Codex
Run \`devrelay list\` or \`devrelay resume <id>\` to pick up work from other agents.
`);
    console.log('✅ Configured for Codex (Skills)');
    installedCount++;
  }

  console.log(`\n🎉 DevRelay successfully configured across ${installedCount} agent platforms!`);
  console.log('\nQuick Commands:');
  console.log('  devrelay list              - List all active agent sessions');
  console.log('  devrelay resume <id/query> - Get continuity payload for an agent session');
  console.log('  devrelay setup             - Reconfigure integrations\n');
}

module.exports = { install };

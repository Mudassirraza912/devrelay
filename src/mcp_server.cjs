const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { getAllSessions, findSession } = require('./scanners');

function sendResponse(id, result, error = null) {
  const resp = { jsonrpc: '2.0', id };
  if (error) {
    resp.error = error;
  } else {
    resp.result = result;
  }
  process.stdout.write(JSON.stringify(resp) + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    const { id, method, params } = req;

    switch (method) {
      case 'initialize':
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            resources: { subscribe: false, listChanged: true },
            tools: { listChanged: false }
          },
          serverInfo: { name: 'devrelay', version: '1.0.0' }
        });
        break;

      case 'notifications/initialized':
      case 'ping':
        if (id) sendResponse(id, {});
        break;

      case 'resources/list': {
        const sessions = getAllSessions().slice(0, 15);
        const resources = sessions.map(s => {
          const workspaceTag = s.cwd ? ` [${path.basename(s.cwd)}]` : '';
          return {
            uri: `session://${s.agent.toLowerCase().replace(/\s+/g, '-')}/${s.id}`,
            name: `[${s.agent}] ${s.title}${workspaceTag} (${s.timeAgo})`,
            description: `Agent: ${s.agent} | Workspace: ${s.cwd || 'N/A'} | Updated: ${s.timeAgo}`,
            mimeType: 'text/markdown'
          };
        });
        sendResponse(id, { resources });
        break;
      }

      case 'resources/read': {
        const uri = params?.uri || '';
        const all = getAllSessions();
        const found = all.find(s => uri.includes(s.id));
        if (!found) {
          sendResponse(id, null, { code: -32602, message: `Session not found: ${uri}` });
          return;
        }

        let contentText = `# Resumed Session from ${found.agent}\n\n`;
        contentText += `- **Original Title**: ${found.title}\n`;
        contentText += `- **Session ID**: \`${found.id}\`\n`;
        if (found.cwd) contentText += `- **Workspace**: \`${found.cwd}\`\n`;
        contentText += `- **Last Active**: ${found.timeAgo} (${new Date(found.updatedAt).toLocaleString()})\n\n`;
        contentText += `## State Where Previous Agent Stopped:\n\n`;
        contentText += found.lastAssistantMessage || '_No assistant response recorded._';

        sendResponse(id, {
          contents: [{ uri, mimeType: 'text/markdown', text: contentText }]
        });
        break;
      }

      case 'tools/list':
        sendResponse(id, {
          tools: [
            {
              name: 'devrelay_list_sessions',
              description: 'List active and recent coding agent sessions across Claude Code, Codex, and Antigravity',
              inputSchema: { type: 'object', properties: {} }
            },
            {
              name: 'devrelay_resume_session',
              description: 'Resume and extract the full context of a coding session by ID or search query',
              inputSchema: {
                type: 'object',
                properties: { query: { type: 'string', description: 'Session ID or query' } },
                required: ['query']
              }
            }
          ]
        });
        break;

      case 'tools/call': {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        if (toolName === 'devrelay_list_sessions') {
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(getAllSessions().slice(0, 10), null, 2) }]
          });
        } else if (toolName === 'devrelay_resume_session') {
          const found = findSession(toolArgs.query || '');
          if (!found) {
            sendResponse(id, { isError: true, content: [{ type: 'text', text: `Session matching "${toolArgs.query}" not found.` }] });
          } else {
            sendResponse(id, { content: [{ type: 'text', text: JSON.stringify(found, null, 2) }] });
          }
        } else {
          sendResponse(id, null, { code: -32601, message: `Unknown tool: ${toolName}` });
        }
        break;
      }

      default:
        sendResponse(id, null, { code: -32601, message: `Method not supported: ${method}` });
        break;
    }
  } catch (e) {}
});


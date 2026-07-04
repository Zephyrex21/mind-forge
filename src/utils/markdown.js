/**
 * Custom Markdown → HTML parser for README preview.
 * Handles: headings, bold/italic, links, images, code blocks,
 * inline code, lists, blockquotes, horizontal rules.
 *
 * Extracted from App.jsx to keep rendering logic isolated.
 */
export function parseMarkdownToHtml(md) {
  if (!md) return '';
  let html = md;

  // Protect code blocks from other transformations
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const i = codeBlocks.length;
    codeBlocks.push(
      `<pre style="background:#1e1e2e;color:#cdd6f4;padding:16px;border-radius:8px;overflow-x:auto;margin:16px 0"><code>${code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</code></pre>`
    );
    return `\x00CB${i}\x00`;
  });

  // Protect inline code
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const i = inlineCodes.length;
    inlineCodes.push(
      `<code style="background:rgba(175,184,193,0.2);padding:2px 6px;border-radius:4px;font-size:85%;font-family:monospace">${code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</code>`
    );
    return `\x00IC${i}\x00`;
  });

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^[-*_]{3,}\s*$/gm, '<hr/>');

  // Images (before links to avoid conflict)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;display:inline-block"/>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#0969da;text-decoration:none">$1</a>'
  );

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*\\])\*(?!\*)(.+?)(?<![*\\])\*(?!\*)/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(
    /^>\s+(.*)$/gm,
    '<blockquote style="padding:0 1em;color:#656d76;border-left:0.25em solid #d0d7de;margin:0 0 16px">$1</blockquote>'
  );
  html = html.replace(/<\/blockquote>\n<blockquote[^>]*>/g, '<br/>');

  // Lists
  const lines = html.split('\n');
  const out = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (ulMatch) {
      if (!inUl) { out.push('<ul style="padding-left:2em;margin:0 0 16px">'); inUl = true; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      out.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inOl) { out.push('<ol style="padding-left:2em;margin:0 0 16px">'); inOl = true; }
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      out.push(trimmed ? line : '');
    }
  }
  if (inUl) out.push('</ul>');
  if (inOl) out.push('</ol>');
  html = out.join('\n');

  // Wrap bare text in paragraphs
  const blocks = html.split(/\n{2,}/);
  html = blocks
    .map(block => {
      const t = block.trim();
      if (!t) return '';
      if (/^<(h[1-6]|ul|ol|blockquote|pre|div|p|table|hr|img|br|section|article|details|summary|a\s|figure)/i.test(t)) return t;
      if (/<(div|table|ul|ol|h[1-6]|pre|blockquote|hr|img|details|summary)/i.test(t)) return t;
      if (/^\x00CB/i.test(t)) return t;
      if (/^<\//.test(t)) return t;
      if (/align\s*=/i.test(t)) return t;
      return `<p style="margin:0 0 16px">${t.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  // Restore protected blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`\x00CB${i}\x00`, block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`\x00IC${i}\x00`, code);
  });

  return html;
}

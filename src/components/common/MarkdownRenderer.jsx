import React from 'react';

/**
 * Premium, light-weight regex-based Markdown Renderer component.
 * Supports headers, lists, code fences, inline code, bold, italic, links, images, horizontal lines, tables, and blockquotes.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const blocks = [];
  const lines = content.split('\n');
  let currentCodeBlock = null;
  let currentTable = null;
  let currentList = null;
  let listType = null; // 'ul' or 'ol'

  const flushTable = () => {
    if (currentTable) {
      blocks.push({ type: 'table', rows: currentTable });
      currentTable = null;
    }
  };

  const flushList = () => {
    if (currentList) {
      blocks.push({ type: 'list', items: currentList, listType });
      currentList = null;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code Block Checking
    if (line.trim().startsWith('```')) {
      flushTable();
      flushList();
      if (currentCodeBlock) {
        blocks.push({ type: 'code', lang: currentCodeBlock.lang, code: currentCodeBlock.lines.join('\n') });
        currentCodeBlock = null;
      } else {
        const lang = line.trim().substring(3).trim();
        currentCodeBlock = { lang, lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(line);
      continue;
    }

    // 2. Table Checking: Starts and ends with |
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      // Skip markdown visual separator lines like |---|:---|
      if (trimmed.includes('---') || trimmed.includes('-|-')) {
        continue;
      }
      if (!currentTable) {
        currentTable = [];
      }
      const cols = trimmed.split('|').slice(1, -1).map(c => c.trim());
      currentTable.push(cols);
      continue;
    } else {
      flushTable();
    }

    // 3. List Checking: Unordered lists (- , * , +) or Ordered lists (\d+.)
    const unorderedMatch = line.match(/^(\s*)(?:[-*+])\s+(.*)/);
    const orderedMatch = line.match(/^(\s*)(?:\d+)\.\s+(.*)/);

    if (unorderedMatch) {
      if (currentList && listType !== 'ul') {
        flushList();
      }
      if (!currentList) {
        currentList = [];
        listType = 'ul';
      }
      currentList.push({ text: unorderedMatch[2], indent: unorderedMatch[1].length });
      continue;
    } else if (orderedMatch) {
      if (currentList && listType !== 'ol') {
        flushList();
      }
      if (!currentList) {
        currentList = [];
        listType = 'ol';
      }
      currentList.push({ text: orderedMatch[2], indent: orderedMatch[1].length });
      continue;
    } else {
      flushList();
    }

    // 4. Blockquotes
    if (trimmed.startsWith('>')) {
      const text = trimmed.substring(trimmed.indexOf('>') + 1).trim();
      blocks.push({ type: 'blockquote', text });
      continue;
    }

    // 5. Headers (H1 - H6)
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)/);
      if (match) {
        blocks.push({ type: 'header', depth: match[1].length, text: match[2] });
        continue;
      }
    }

    // 6. Horizontal Rules (---, ***, ___)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({ type: 'hr' });
      continue;
    }

    // 7. Spacers
    if (trimmed === '') {
      blocks.push({ type: 'empty' });
      continue;
    }

    // 8. Default Paragraph
    blocks.push({ type: 'p', text: line });
  }

  // Clean remaining queues
  flushTable();
  flushList();
  if (currentCodeBlock) {
    blocks.push({ type: 'code', lang: currentCodeBlock.lang, code: currentCodeBlock.lines.join('\n') });
  }

  // Helper for parsing inline tags
  const parseInline = (text) => {
    if (!text) return '';

    // Sanitization: Escape base tags
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Markdown Image Badges: ![alt](url)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto inline-block my-1 align-middle" />');

    // Hyperlinks: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-650 dark:text-indigo-400 font-semibold hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Inline Code snippets
    html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-rose-500 font-mono text-[11px] border border-gray-250 dark:border-gray-700">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'header': {
            const Tag = `h${block.depth}`;
            const headerSizes = {
              1: 'text-2xl font-bold border-b pb-2 mb-4 mt-6',
              2: 'text-xl font-bold border-b pb-1.5 mb-3 mt-5',
              3: 'text-lg font-bold mb-2 mt-4',
              4: 'text-base font-semibold mb-2 mt-3',
              5: 'text-sm font-semibold mb-1 mt-2',
              6: 'text-xs font-semibold mb-1 mt-2 text-gray-500 dark:text-gray-400'
            };
            return (
              <Tag key={index} className={`${headerSizes[block.depth]} text-gray-900 dark:text-white border-gray-250 dark:border-gray-800`}>
                {parseInline(block.text)}
              </Tag>
            );
          }
          case 'p':
            return (
              <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3 text-left">
                {parseInline(block.text)}
              </p>
            );
          case 'blockquote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1.5 my-3 text-gray-500 dark:text-gray-400 italic text-sm text-left">
                {parseInline(block.text)}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={index} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl font-mono text-[11px] overflow-auto text-left text-gray-750 dark:text-gray-300 my-4 shadow-inner">
                {block.lang && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 select-none pb-2 font-sans border-b border-gray-200 dark:border-gray-900 mb-2 uppercase font-bold tracking-wider">
                    {block.lang}
                  </div>
                )}
                <code>{block.code}</code>
              </pre>
            );
          case 'hr':
            return <hr key={index} className="my-6 border-gray-200 dark:border-gray-800" />;
          case 'empty':
            return <div key={index} className="h-1" />;
          case 'list': {
            const ListTag = block.listType;
            return (
              <ListTag key={index} className={`${block.listType === 'ul' ? 'list-disc' : 'list-decimal'} pl-6 my-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-left space-y-1.5`}>
                {block.items.map((item, idx) => (
                  <li key={idx} style={{ paddingLeft: `${item.indent * 4}px` }}>
                    {parseInline(item.text)}
                  </li>
                ))}
              </ListTag>
            );
          }
          case 'table': {
            const hasHeaders = block.rows.length > 0;
            const headers = hasHeaders ? block.rows[0] : [];
            const bodyRows = hasHeaders ? block.rows.slice(1) : [];
            return (
              <div key={index} className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <table className="min-w-full border-collapse text-left text-sm">
                  {headers.length > 0 && (
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        {headers.map((h, idx) => (
                          <th key={idx} className="px-4 py-2 font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-800 last:border-0">
                            {parseInline(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-gray-200 dark:border-gray-800 last:border-0 bg-white dark:bg-gray-950/20 odd:bg-gray-50/50 dark:odd:bg-gray-900/10">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 border-r border-gray-200 dark:border-gray-800 last:border-0 text-gray-700 dark:text-gray-300">
                            {parseInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

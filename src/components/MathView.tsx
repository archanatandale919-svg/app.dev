import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '', inline = false }) => {
  // Parse string and render LaTeX sections: $...$ for inline, $$...$$ for block
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    try {
      // If content is purely a formula without delimiters and inline is true
      if (inline && !content.includes('$')) {
        return katex.renderToString(content, {
          throwOnError: false,
          displayMode: false,
        });
      }

      // Replace $$...$$ block equations
      let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
        try {
          return `<div class="my-3 py-1 overflow-x-auto text-center">${katex.renderToString(math.trim(), {
            throwOnError: false,
            displayMode: true,
          })}</div>`;
        } catch {
          return `<pre class="text-sm font-mono p-2 rounded bg-neutral-100 dark:bg-neutral-800">${math}</pre>`;
        }
      });

      // Replace $...$ inline equations
      processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            throwOnError: false,
            displayMode: false,
          });
        } catch {
          return `<code class="font-mono text-xs px-1 rounded bg-neutral-100 dark:bg-neutral-800">${math}</code>`;
        }
      });

      // Convert linebreaks to <br/> or paragraphs if needed
      return processed.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
    } catch {
      return content;
    }
  }, [content, inline]);

  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

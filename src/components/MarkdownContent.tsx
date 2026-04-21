import React from 'react';
import { cn } from '../lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * A lightweight, safe alternative to react-markdown that handles the specific
 * formatting used by the ZhiMing AI (headers, bold text, and lists).
 * This avoids potential library-related crashes in React 19.
 */
export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null;

  // Split content by lines to process block elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let key = 0;
  let currentList: React.ReactNode[] = [];

  const processInline = (text: string) => {
    // Simple bold text replacement: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-primary font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Handle Headers (###)
    if (trimmedLine.startsWith('###')) {
      // If we were in a list, push it first
      if (currentList.length > 0) {
        elements.push(<ul key={`list-${key++}`} className="list-disc list-inside mb-4 space-y-1 text-sm opacity-90">{currentList}</ul>);
        currentList = [];
      }
      const headerText = trimmedLine.replace(/^###\s*/, '');
      elements.push(
        <h3 key={`h3-${key++}`} className="text-primary font-headline font-bold text-base mt-6 mb-3 flex items-center gap-2 border-b border-primary/10 pb-1">
          {processInline(headerText)}
        </h3>
      );
    } 
    // Handle List Items (- or *)
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const itemText = trimmedLine.slice(2);
      currentList.push(<li key={`li-${key++}`} className="ml-1 leading-relaxed">{processInline(itemText)}</li>);
    }
    // Handle Paragraphs or Empty Lines
    else {
      if (trimmedLine === '') {
        if (currentList.length > 0) {
          elements.push(<ul key={`list-${key++}`} className="list-disc list-inside mb-4 space-y-1 text-sm opacity-90">{currentList}</ul>);
          currentList = [];
        }
      } else {
        if (currentList.length > 0) {
          // Continue list if line doesn't start with - but isn't empty? 
          // Usually, AI keeps lists together. For safety, we'll close the list.
          elements.push(<ul key={`list-${key++}`} className="list-disc list-inside mb-4 space-y-1 text-sm opacity-90">{currentList}</ul>);
          currentList = [];
        }
        elements.push(
          <p key={`p-${key++}`} className="mb-4 last:mb-0 leading-relaxed text-sm opacity-90">
            {processInline(trimmedLine)}
          </p>
        );
      }
    }
  });

  // Final list check
  if (currentList.length > 0) {
    elements.push(<ul key={`list-${key++}`} className="list-disc list-inside mb-4 space-y-1 text-sm opacity-90">{currentList}</ul>);
  }

  return (
    <div className={cn("markdown-content", className)}>
      {elements}
    </div>
  );
}

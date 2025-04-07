import React from 'react';

/**
 * Component to render problem descriptions with proper formatting
 * This handles code blocks, lists, and basic formatting
 */
const ProblemDescription = ({ description }) => {
  if (!description) return null;

  // First unescape the newlines and other special characters
  const unescapeString = (str) => {
    return str
      .replace(/\\n/g, '\n')  // Replace \n with actual newlines
      .replace(/\\t/g, '\t')  // Replace \t with actual tabs
      .replace(/\\"/g, '"')   // Replace \" with "
      .replace(/\\'/g, "'");  // Replace \' with '
  };

  // Process code blocks
  const processCodeBlocks = (text) => {
    const parts = [];
    let lastIndex = 0;
    
    // Find all code blocks marked with ```language ... ```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add the text before the code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      
      // Add the code block with language
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }
    
    return parts;
  };

  // Format paragraphs, handling inline code
  const formatParagraph = (text) => {
    // Handle inline code with backticks
    const elements = [];
    const parts = text.split('`');
    
    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        elements.push(part);
      } else {
        elements.push(<code key={`inline-code-${i}`}>{part}</code>);
      }
    });
    
    return elements;
  };

  // Process bullet points and numbered lists with better structure
  const processLists = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentList = null;
    let listType = null;
    let paragraphText = '';
    
    const addParagraph = () => {
      if (paragraphText.trim()) {
        elements.push(
          <p key={`p-${elements.length}`}>{formatParagraph(paragraphText)}</p>
        );
        paragraphText = '';
      }
    };
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Check if line is a bullet point
      if (trimmedLine.startsWith('- ')) {
        // First, add any pending paragraph text
        addParagraph();
        
        // If we're not in a bullet list, start a new one
        if (listType !== 'ul') {
          if (currentList !== null) {
            elements.push(
              listType === 'ul' 
                ? <ul key={`ul-${elements.length}`} className="problem-list">{currentList}</ul>
                : <ol key={`ol-${elements.length}`} className="problem-list">{currentList}</ol>
            );
          }
          currentList = [];
          listType = 'ul';
        }
        currentList.push(<li key={lineIndex}>{formatParagraph(trimmedLine.substring(2))}</li>);
      }
      // Check if line is a numbered point
      else if (/^\d+\.\s/.test(trimmedLine)) {
        // First, add any pending paragraph text
        addParagraph();
        
        // If we're not in a numbered list, start a new one
        if (listType !== 'ol') {
          if (currentList !== null) {
            elements.push(
              listType === 'ul' 
                ? <ul key={`ul-${elements.length}`} className="problem-list">{currentList}</ul>
                : <ol key={`ol-${elements.length}`} className="problem-list">{currentList}</ol>
            );
          }
          currentList = [];
          listType = 'ol';
        }
        currentList.push(
          <li key={lineIndex}>
            {formatParagraph(trimmedLine.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      // Regular text line
      else {
        // If we were in a list, add it to elements
        if (currentList !== null) {
          elements.push(
            listType === 'ul' 
              ? <ul key={`ul-${elements.length}`} className="problem-list">{currentList}</ul>
              : <ol key={`ol-${elements.length}`} className="problem-list">{currentList}</ol>
          );
          currentList = null;
          listType = null;
        }
        
        // Handle blank lines as paragraph breaks
        if (trimmedLine === '') {
          addParagraph();
        } else {
          // Add to current paragraph
          paragraphText += (paragraphText ? ' ' : '') + trimmedLine;
        }
      }
    });
    
    // Don't forget any trailing paragraph
    addParagraph();
    
    // If we ended with a list, add it
    if (currentList !== null) {
      elements.push(
        listType === 'ul' 
          ? <ul key={`ul-${elements.length}`} className="problem-list">{currentList}</ul>
          : <ol key={`ol-${elements.length}`} className="problem-list">{currentList}</ol>
      );
    }
    
    return elements;
  };

  // Render the description with formatting
  const renderFormattedDescription = () => {
    // First unescape the description
    const unescapedDescription = unescapeString(description);
    
    // Then process code blocks
    const parts = processCodeBlocks(unescapedDescription);
    
    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <pre key={index} className={`code-block language-${part.language}`}>
            <code>{part.content}</code>
          </pre>
        );
      } else {
        // Check for section headers
        const sectionElements = [];
        const sections = part.content.split(/^(Example:|Requirements:|Note:|Input:|Output:)/gm);
        
        for (let i = 0; i < sections.length; i++) {
          if (i % 2 === 1) {
            // This is a section header
            sectionElements.push(
              <h3 key={`section-${i}`} className="section-header">{sections[i]}</h3>
            );
          } else if (sections[i].trim()) {
            // This is section content
            sectionElements.push(
              <div key={`content-${i}`} className="section-content">
                {processLists(sections[i])}
              </div>
            );
          }
        }
        
        return sectionElements.length > 0 
          ? <div key={index} className="content-section">{sectionElements}</div>
          : <div key={index} className="content-section">{processLists(part.content)}</div>;
      }
    });
  };

  return (
    <div className="problem-description">
      {renderFormattedDescription()}
    </div>
  );
};

export default ProblemDescription;
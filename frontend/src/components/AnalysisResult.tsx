interface Props {
  result: string;
  status: string;
}

export default function AnalysisResult({ result, status }: Props) {
  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <div className="text-center">
          <p className="text-blue-600 font-medium">Processing your code...</p>
          <p className="text-gray-500 text-sm mt-1">Please be patient, this may take a few minutes</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="text-4xl">⏳</div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">Queued for analysis</p>
          <p className="text-gray-500 text-sm mt-1">Your code will be processed shortly</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="text-4xl">❌</div>
        <div className="text-center">
          <p className="text-red-600 font-medium">Analysis failed</p>
          <p className="text-gray-500 text-sm mt-1">{result || 'Please try again'}</p>
        </div>
      </div>
    );
  }

  // Parse and format the result
  const formatResult = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Main section headers (1. Bugs/Errors:, 2. Security:, etc.)
      if (/^\d+\.\s+[A-Za-z\/\s]+:/.test(line)) {
        return (
          <div key={index} className="mt-6 mb-3 first:mt-0">
            <h3 className="text-lg font-bold text-blue-600">{line}</h3>
          </div>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        const content = line.trim().replace(/^[\*\-]\s*/, '');
        return (
          <div key={index} className="ml-4 mb-3 flex gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <p className="text-gray-700">{formatInlineCode(content)}</p>
          </div>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      
      // Regular text
      return (
        <p key={index} className="text-gray-700 mb-2">
          {formatInlineCode(line)}
        </p>
      );
    });
  };

  // Format inline code (text between backticks or function names)
  const formatInlineCode = (text: string) => {
    const parts = text.split(/(`[^`]+`)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      
      // Highlight function names (word followed by ())
      const highlighted = part.split(/(\b\w+\(\))/g).map((segment, j) => {
        if (/\w+\(\)/.test(segment)) {
          return (
            <code key={j} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-sm font-mono">
              {segment}
            </code>
          );
        }
        return segment;
      });
      
      return <span key={i}>{highlighted}</span>;
    });
  };

  return (
    <div className="prose prose-gray max-w-none">
      {formatResult(result)}
    </div>
  );
}

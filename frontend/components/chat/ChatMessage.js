'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message, isUser }) {
  if (message.isTyping) {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-900 rounded-bl-none">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {/* Message content */}
        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap m-0">{message.content}</p>
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Override default element styling
                  p: ({node, ...props}) => <p className="my-1 text-gray-900" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold my-1 text-gray-900" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-sm font-bold my-1 text-gray-900" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-1 pl-4 text-gray-900 space-y-1" {...props} />,
                  ol: ({node, ...props}) => (
                    <ol className="my-1 pl-6 text-gray-900 space-y-1 list-decimal" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-gray-900 leading-relaxed pl-1" {...props} />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 my-2" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className={`font-bold ${isUser ? 'text-white' : 'text-gray-900'}`} {...props} />
                  ),
                  em: ({node, ...props}) => (
                    <em className={`italic ${isUser ? 'text-white' : 'text-gray-900'}`} {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? 'text-purple-200' : 'text-gray-600'
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
} 
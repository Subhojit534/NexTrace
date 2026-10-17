import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  ArrowUp,
  FileText,
  X,
  Loader2,
} from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function ChatArea({
  messages = [],
  onSendMessage,
  isLoading,
  activePreset,
  activePresetData,
  onUploadJson,
  uploadedFile,
  onRemoveUploadedFile,
  onOpenRemediation,
}) {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputText;
    if (!text.trim() || isLoading) return;

    onSendMessage(text);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Only .json graph architecture files are permitted.');
      e.target.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB limit
    if (file.size > MAX_SIZE) {
      alert(`File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller topology file.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target?.result);
        onUploadJson(file.name, rawJson);
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid JSON graph architecture.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {/* Scrollable Message Feed */}
      <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 pt-3 sm:pt-4 pb-2 w-full">
        <div className="max-w-4xl w-full mx-auto">
          {messages.length === 0 ? (
            /* Clean Minimalist Gemini Welcome Screen */
            <div className="min-h-[50vh] sm:min-h-[60vh] flex flex-col items-center justify-center text-center px-2 sm:px-4 animate-fade-in my-auto">
              {/* Header Sparkle & Title */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gemini-surface border border-gemini-border text-xs text-gemini-accent mb-4 sm:mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen FalkorDB Autonomous SecOps</span>
              </div>

              <h1 className="text-2xl sm:text-5xl font-bold tracking-tight mb-2 sm:mb-3">
                <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  Hello, Security Lead
                </span>
              </h1>
              <p className="text-xs sm:text-base text-gemini-muted max-w-md mb-6 sm:mb-8 leading-relaxed">
                How can I assist your security investigation today? Upload an architecture JSON using the <strong className="text-white">+</strong> button below or ask any question to get started.
              </p>
            </div>
          ) : (
            /* Message List */
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  onSelectFollowup={handleSubmit}
                  onOpenRemediation={onOpenRemediation}
                />
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2.5 sm:space-x-3 my-4 sm:my-6 text-gemini-muted text-xs animate-pulse pl-1 sm:pl-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-gemini-gradientStart to-gemini-gradientEnd flex items-center justify-center shrink-0">
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
                  </div>
                  <span className="text-[11px] sm:text-xs">Autonomous Agent is querying FalkorDB, computing shortest paths, and evaluating blast radius...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Centered Bottom Prompt Bar */}
      <div className="w-full px-2.5 sm:px-4 pb-3 sm:pb-4 pt-2 bg-gradient-to-t from-gemini-bg via-gemini-bg/95 to-transparent">
        <div className="max-w-4xl w-full mx-auto">
          {/* Uploaded File Chip */}
          {uploadedFile && (
            <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-gemini-surface border border-gemini-border text-xs text-white shadow-lg animate-fade-in w-fit max-w-full">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="w-4 h-4 text-gemini-accent shrink-0" />
                <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">{uploadedFile.name}</span>
                <span className="text-[10px] text-gemini-muted shrink-0">
                  ({uploadedFile.nodes} nodes, {uploadedFile.rels} edges)
                </span>
              </div>
              <button
                onClick={onRemoveUploadedFile}
                className="ml-2.5 p-0.5 rounded hover:bg-gemini-surfaceHover text-gemini-muted hover:text-white shrink-0"
                title="Remove attached graph"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Input Container */}
          <div className="relative rounded-2xl bg-gemini-surface border border-gemini-border focus-within:border-gemini-accent focus-within:ring-1 focus-within:ring-gemini-accent/40 shadow-2xl transition">
            <div className="flex items-end p-2 sm:p-2.5 space-x-1.5 sm:space-x-2">
              {/* Attachment '+' Button */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 sm:p-2 rounded-xl text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition shrink-0"
                title="Import JSON Architecture File"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about vulnerabilities, simulate attacks, or upload JSON..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-gemini-muted resize-none focus:outline-none py-1 sm:py-1.5 max-h-32 sm:max-h-40 leading-relaxed font-sans"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() || isLoading}
                className={`p-1.5 sm:p-2 rounded-xl transition shrink-0 ${
                  inputText.trim() && !isLoading
                    ? 'bg-gemini-accent text-gemini-bg hover:opacity-90 shadow-md'
                    : 'text-gemini-muted cursor-not-allowed bg-gemini-surfaceHover/50'
                }`}
                title="Send Message"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="text-center mt-2 px-1">
            <span className="text-[9px] sm:text-[10px] text-gemini-muted block leading-tight">
              NexTrace AI can hallucinate vulnerabilities; always verify against live FalkorDB Cypher graph proofs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

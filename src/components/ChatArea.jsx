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

  // Derive suggested prompt pills based on active preset or uploaded file
  const suggestedPills = uploadedFile?.scenarios?.length
    ? uploadedFile.scenarios.map((s) => (typeof s === 'string' ? s : s.text || s.title))
    : activePresetData?.scenarios?.length
    ? activePresetData.scenarios.map((s) => s.text || s.title)
    : [
        'Simulate CVE-2024-3094 RCE on Ingress gateway and isolate database',
        'Identify blast radius of compromised auth token',
        'Find shortest path to crown jewel database via Cypher',
        'Sever compromised edges to contain breach',
      ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-5xl w-full mx-auto px-4 overflow-hidden">
      {/* Scrollable Message Feed */}
      <div className="flex-1 overflow-y-auto pt-4 pb-32">
        {messages.length === 0 ? (
          /* Clean Gemini Welcome Screen */
          <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
            {/* Header Sparkle & Title */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gemini-surface border border-gemini-border text-xs text-gemini-accent mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen FalkorDB Autonomous SecOps</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                Hello, Security Lead
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gemini-muted max-w-md mb-8 leading-relaxed">
              How can I assist your security investigation today? Upload an architecture JSON using the <strong className="text-white">+</strong> button below or ask any question to get started.
            </p>

            {/* When a file is uploaded, show context-aware suggested prompt pills */}
            {uploadedFile && (
              <div className="w-full max-w-xl p-4 rounded-2xl bg-gemini-surface/80 border border-gemini-border text-left shadow-lg mb-4 animate-fade-in backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gemini-accent" />
                    <span className="text-xs font-semibold text-white">{uploadedFile.name}</span>
                  </div>
                  <span className="text-[11px] text-gemini-muted">
                    {uploadedFile.nodes} nodes · {uploadedFile.rels} edges
                  </span>
                </div>
                <p className="text-xs text-gemini-muted mb-3">
                  Architecture loaded. Choose a suggested scenario below or type your own prompt:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPills.map((pillText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(pillText)}
                      className="p-2.5 rounded-xl bg-gemini-card hover:bg-gemini-surfaceHover border border-gemini-border hover:border-gemini-accent/40 text-left transition group shadow-sm"
                    >
                      <p className="text-xs text-white group-hover:text-gemini-accent transition font-medium line-clamp-2">
                        {pillText}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Message List */
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg}
                onSelectFollowup={handleSubmit}
                onOpenRemediation={onOpenRemediation}
              />
            ))}

            {isLoading && (
              <div className="flex items-center space-x-3 my-6 text-gemini-muted text-xs animate-pulse pl-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gemini-gradientStart to-gemini-gradientEnd flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <span>Autonomous Agent is querying FalkorDB, computing shortest paths, and evaluating blast radius...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Prompt Bar (Gemini Style) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gemini-bg via-gemini-bg/95 to-transparent pointer-events-none z-30">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          {/* Uploaded File Chip */}
          {uploadedFile && (
            <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-gemini-surface border border-gemini-border text-xs text-white shadow-lg animate-fade-in w-fit">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gemini-accent" />
                <span className="font-medium truncate max-w-[200px]">{uploadedFile.name}</span>
                <span className="text-[10px] text-gemini-muted">
                  ({uploadedFile.nodes} nodes, {uploadedFile.rels} edges)
                </span>
              </div>
              <button
                onClick={onRemoveUploadedFile}
                className="ml-3 p-0.5 rounded hover:bg-gemini-surfaceHover text-gemini-muted hover:text-white"
                title="Remove attached graph"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Context Prompt Suggestions Carousel if file is uploaded or messages exist */}
          {(uploadedFile || messages.length > 0) && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
              {suggestedPills.slice(0, 4).map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(pill)}
                  className="px-3 py-1 rounded-full bg-gemini-surface hover:bg-gemini-surfaceHover border border-gemini-border text-[11px] text-gemini-text whitespace-nowrap transition"
                >
                  {pill}
                </button>
              ))}
            </div>
          )}

          {/* Main Input Container */}
          <div className="relative rounded-2xl bg-gemini-surface border border-gemini-border focus-within:border-gemini-accent focus-within:ring-1 focus-within:ring-gemini-accent/40 shadow-2xl transition">
            <div className="flex items-end p-2.5 space-x-2">
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
                className="p-2 rounded-xl text-gemini-muted hover:text-white hover:bg-gemini-surfaceHover transition shrink-0"
                title="Import JSON Architecture File"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about vulnerabilities, simulate RCE on ingress, or upload a JSON architecture..."
                className="w-full bg-transparent text-sm text-white placeholder-gemini-muted resize-none focus:outline-none py-1.5 max-h-40 leading-relaxed font-sans"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!inputText.trim() || isLoading}
                className={`p-2 rounded-xl transition shrink-0 ${
                  inputText.trim() && !isLoading
                    ? 'bg-gemini-accent text-gemini-bg hover:opacity-90 shadow-md'
                    : 'text-gemini-muted cursor-not-allowed bg-gemini-surfaceHover/50'
                }`}
                title="Send Message"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="text-[10px] text-gemini-muted">
              NexTrace AI can hallucinate vulnerabilities; always verify against live FalkorDB Cypher graph proofs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

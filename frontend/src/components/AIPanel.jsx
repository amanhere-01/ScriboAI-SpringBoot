import { useState, useRef, useEffect } from "react";
import { X, Bot, Sparkles, Zap, Send, Copy, CornerUpLeft, User, Cpu, RefreshCcw, FileOutput, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MODELS = [
  { id: "gemini", label: "Gemini", icon: Sparkles },
  { id: "groq",   label: "Groq",   icon: Zap },
];

/* ─── Action button ───────────────────────────────────────────────────────── */
function ActBtn({ icon: Icon, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium
        border-none cursor-pointer transition-all duration-100
        ${accent
          ? "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
          : "text-[#9a9490] hover:bg-[#f0ede8] hover:text-[#4a4440]"
        }
      `}
    >
      <Icon size={9} strokeWidth={2} />
      {label}
    </button>
  );
}

/* ─── Divider ─────────────────────────────────────────────────────────────── */
function TimeDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-[#ede9e3]" />
      <span className="text-[10px] text-[#c0b8b0] tracking-widest uppercase whitespace-nowrap font-medium">{label}</span>
      <div className="flex-1 h-px bg-[#ede9e3]" />
    </div>
  );
}

/* ─── Message ─────────────────────────────────────────────────────────────── */
function Message({ msg, isLatest, onInsert, onCopy, onReplace, onRegenerate }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 items-start ${isUser ? "flex-row-reverse" : ""} msg-enter`}>
      {/* Avatar */}
      <div className={`
        w-[24px] h-[24px] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center
        ${isUser
          ? "bg-[#ede9e3] border border-[#e0dcd6] text-[#8a8078]"
          : "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm shadow-indigo-200"
        }
      `}>
        {isUser
          ? <User size={11} strokeWidth={2} />
          : <Bot size={11} strokeWidth={2} className="text-white" />
        }
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div className={`
          px-3.5 py-2.5 text-[13px] leading-[1.7] rounded-2xl
          ${isUser
            ? "bg-[#2a2420] text-[#e8e4de] rounded-tr-[5px]"
            : "bg-white text-[#3a3430] rounded-tl-[5px] border border-[#ede9e3] shadow-sm"
          }
        `}>
          {isUser ? (
            <p className="whitespace-pre-wrap m-0">{msg.content}</p>
          ) : (
            <div className="
              prose prose-sm max-w-none
              [&_p]:my-1 [&_p:last-child]:mb-0 [&_p]:text-[#3a3430] [&_p]:leading-[1.7]
              [&_strong]:font-semibold [&_strong]:text-[#1a1210]
              [&_em]:text-[#7a6e68] [&_em]:italic
              [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:text-[#3a3430] [&_li]:leading-relaxed
              [&_code]:bg-[#fdf3e7] [&_code]:border [&_code]:border-[#f0dfc0] [&_code]:text-indigo-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11.5px]
              [&_pre]:bg-[#faf7f2] [&_pre]:border [&_pre]:border-[#ede9e3] [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:my-2
              [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-3 [&_blockquote]:text-[#8a8078] [&_blockquote]:bg-indigo-50/50
              [&_h1]:text-[#1a1210] [&_h2]:text-[#1a1210] [&_h3]:text-[#1a1210]
              [&_a]:text-indigo-600 [&_a]:underline-offset-2
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {/* Micro actions */}
        <div className={`flex items-center gap-0.5 px-0.5 mt-1 ${isUser ? "flex-row-reverse" : ""}`}>
          {!isUser && (
            <>
              <ActBtn icon={CornerUpLeft} label="Insert Below" onClick={() => onInsert?.(msg.content)} accent />
              <ActBtn icon={FileOutput} label="Replace Document" onClick={() => onReplace?.(msg.content)} />
              <ActBtn icon={Copy} label="Copy" onClick={() => onCopy?.(msg.content)} />
              {isLatest && (
                <ActBtn icon={RefreshCcw} label="Regenerate" onClick={onRegenerate} />
              )}
            </>
          )}
          {isUser && (
            <ActBtn icon={Copy} label="Copy" onClick={() => onCopy?.(msg.content)} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Typing indicator ────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-start msg-enter">
      <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center shadow-sm shadow-indigo-200">
        <Bot size={11} strokeWidth={2} className="text-white" />
      </div>
      <div className="bg-white border border-[#ede9e3] rounded-2xl rounded-tl-[5px] px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 120, 240].map(d => (
            <span key={d} className="w-[5px] h-[5px] rounded-full bg-[#d0c8c0] inline-block animate-bounce"
              style={{ animationDelay: `${d}ms`, animationDuration: "0.9s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function AIPanel({ onClose, onInsert, onReplaceDocument, documentContent, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const chatEndRef  = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, [input]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || isTyping) return;
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    try {
      const safeDoc = documentContent || "";
      const res = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: newMessages, document: safeDoc, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard?.writeText(text);
  const activeModel = MODELS.find(m => m.id === provider);

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      send(lastUserMsg.content);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F2EC]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 h-[52px] border-b border-[#e8e4de] shrink-0 bg-white shadow-[0_1px_0_#ede9e3]">
        <div className="flex items-center gap-2.5">
          {/* Logo orb */}
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-sm animate-pulse" />
            <div className="relative w-7 h-7 rounded-[8px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-200">
              <Cpu size={13} strokeWidth={2} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#2a2420] leading-none tracking-tight">AI Assistant</p>
            <p className="text-[10px] text-[#b0a8a0] mt-0.5 leading-none">via {activeModel?.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-[7px] border border-[#e8e4de] text-[11px] font-medium text-[#8a8078] hover:bg-[#f0ede8] hover:text-[#4a4440] transition-all duration-150"
            >
              <Trash2 size={12} strokeWidth={2} />
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[7px] border border-[#e8e4de] bg-transparent flex items-center justify-center text-[#b0a8a0] hover:bg-[#f0ede8] hover:text-[#5a5450] transition-all duration-150"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Model selector ── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#ede9e3] bg-white shrink-0">
        <span className="text-[9px] text-[#c0b8b0] font-bold uppercase tracking-[0.12em] mr-0.5">Model</span>
        {MODELS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            disabled={isTyping}
            onClick={() => setProvider(id)}
            className={`
              flex items-center gap-1.5 h-6 px-2.5 rounded-full
              text-[11px] font-medium transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed
              ${provider === id
                ? "bg-indigo-50 border border-indigo-200 text-indigo-700"
                : "bg-transparent border border-transparent text-[#a09890] hover:text-[#5a5450]"
              }
            `}
          >
            <Icon size={9} strokeWidth={2} className={provider === id ? "text-indigo-500" : ""} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto ai-messages-scroll">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4 animate-fade-scale">
            <h3 className="text-[#2a2420] text-[15px] font-semibold mb-5 tracking-tight">
              What can I help with?
            </h3>
            <div className="grid grid-cols-2 gap-3.5 w-full max-w-[340px] px-1 mx-auto">
              {[
                { label: "Summarize document", prompt: "Summarize this document clearly." },
                { label: "Improve writing", prompt: "Improve the writing quality of this document." },
                { label: "Rewrite introduction", prompt: "Rewrite only the introduction of this document." },
                { label: "Continue this document", prompt: "Continue writing this document naturally." },
                { label: "Find weak points", prompt: "Identify weak points in this document." },
                { label: "What’s missing in this document", prompt: "What important ideas or sections are missing from this document?" }
              ].map((chip, i) => (
                <button
                  key={i}
                  onClick={() => send(chip.prompt)}
                  disabled={isTyping}
                  className="
                    px-4 min-h-[44px] rounded-2xl text-[12px] font-medium leading-[1.3]
                    bg-gradient-to-br from-white to-[#faf8f5] border border-[#f0ece6] text-[#5a5450]
                    shadow-[0_2px_4px_rgba(0,0,0,0.015)]
                    hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.08)]
                    hover:border-indigo-200 hover:text-indigo-600
                    active:scale-95
                    transition-all duration-200 ease-out text-center flex items-center justify-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 py-5">
            <TimeDivider label="Today" />
            {messages.map((msg, i) => (
              <Message 
                key={i} 
                msg={msg} 
                isLatest={i === messages.length - 1}
                onInsert={onInsert} 
                onCopy={copyToClipboard}
                onReplace={onReplaceDocument}
                onRegenerate={handleRegenerate}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="border-t border-[#ede9e3] bg-white px-4 pt-3 pb-4 shrink-0">
        <div className="
          flex items-end gap-2.5 bg-[#faf8f5] border border-[#e8e4de] rounded-xl
          px-3.5 py-2.5 transition-all duration-200
          focus-within:border-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]
        ">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything about your document…"
            rows={1}
            className="flex-1 bg-transparent text-[13px] text-[#3a3430] placeholder-[#c8c0b8] resize-none outline-none leading-[1.55] min-h-[20px]"
            style={{ maxHeight: "100px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isTyping}
            className="
              w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
              bg-gradient-to-br from-indigo-500 to-purple-500
              disabled:opacity-25 disabled:cursor-not-allowed
              hover:shadow-md hover:shadow-indigo-200
              active:scale-95 transition-all duration-150
            "
          >
            <Send size={11} strokeWidth={2.5} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-[#c8c0b8] text-center mt-2 tracking-wide">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
// const AI_PANEL_STYLES = `
//   @keyframes msgSlideIn {
//     from { opacity: 0; transform: translateY(8px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   .msg-enter { animation: msgSlideIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards; }

//   @keyframes fadeScaleIn {
//     from { opacity: 0; transform: scale(0.95); }
//     to   { opacity: 1; transform: scale(1); }
//   }
//   .animate-fade-scale { animation: fadeScaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }

//   .ai-messages-scroll::-webkit-scrollbar { width: 4px; }
//   .ai-messages-scroll::-webkit-scrollbar-track { background: transparent; }
//   .ai-messages-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 9999px; }
//   .ai-messages-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.14); }
// `;
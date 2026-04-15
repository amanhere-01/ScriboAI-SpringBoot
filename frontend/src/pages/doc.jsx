import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Bold, Italic, Undo, Redo, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, FileText, Bot, File, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import AIPanel from "../components/AIPanel";
import { marked } from "marked";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DocumentEditor() {
  const navigate = useNavigate();
  const { docId } = useParams();
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  const [aiResult, setAIResult] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [resultPosition, setResultPosition] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your writing assistant. Ask me to brainstorm, refine drafts, or continue any section of your document."
    }
  ]);

  // Ref to always have the latest popup position at click time
  const popupPositionRef = useRef(null);
  const selectionRef = useRef(null);
  const editorContainerRef = useRef(null);

  // FETCH DOCUMENT
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/docs/${docId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDoc(data);
        setTitle(data.title);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [docId]);

  // TIPTAP EDITOR
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate({ editor }) {
      setDoc(prev => ({ ...prev, content: JSON.stringify(editor.getJSON()) }));
    },
  });

  useEffect(() => {
    if (!editor || !doc?.content || contentLoaded) return;
    editor.commands.setContent(JSON.parse(doc.content), false);
    setContentLoaded(true);
  }, [editor, doc?.content, contentLoaded]);

  // AUTO-FOCUS: place cursor at start once editor + doc are ready
  useEffect(() => {
    if (!editor || loading) return;
    // For existing docs, wait until content is loaded; for new/empty docs, proceed immediately
    if (doc?.content && !contentLoaded) return;

    const timer = setTimeout(() => {
      // 1. Focus the actual DOM element
      const proseMirrorEl = editorContainerRef.current?.querySelector('.ProseMirror');
      if (proseMirrorEl) proseMirrorEl.focus();

      // 2. Place cursor at the very start via editor API
      try {
        editor.commands.focus('start');
        editor.commands.setTextSelection(1);
      } catch (_) {
        // empty doc edge case — just focus is enough
        editor.commands.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [editor, loading, contentLoaded]);

  // AUTOSAVE
  useEffect(() => {
    if (!doc?.content || loading || !contentLoaded) return;
    setIsSaving(true);
    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        await fetch(`${BACKEND_URL}/docs/${docId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: doc.content }),
        });
      } catch {
        toast.error("Autosave failed");
      } finally {
        if (!cancelled) setIsSaving(false);
      }
    }, 1000);

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [doc?.content, docId, loading]);

  // SAVE TITLE
  const saveTitle = async () => {
    setEditingTitle(false);
    const finalTitle = title.trim() || "Untitled Document";
    if (finalTitle === doc.title) return;
    setTitle(finalTitle);
    try {
      await fetch(`${BACKEND_URL}/docs/${docId}/title`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: finalTitle }),
      });
      setDoc(prev => ({ ...prev, title: finalTitle }));
    } catch {
      toast.error("Failed to save title");
    }
  };

  // AI Action — snapshot position from ref at call time so it's never stale
  const handleAIAction = async (action) => {
    if (!editor) return;
    setLastAction(action);
    const { state } = editor;
    const { from, to } = state.selection;

    if (from === to) return;

    const text = state.doc.textBetween(from, to, " ");

    selectionRef.current = { from, to, text };

    const currentPosition = popupPositionRef.current;

    setResultPosition(currentPosition);
    setIsAILoading(true);
    setAIResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/ai/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAIResult(data.result);
    } catch (err) {
      toast.error(err.message);
      setResultPosition(null);
    } finally {
      setIsAILoading(false);
    }
  };

  const insertIntoEditor = (markdownText) => {
    if (!editor) return;
    const html = marked.parse(markdownText);
    editor.chain().focus().insertContent(html).run();
  };

  const replaceSelectedText = (newText) => {
    const sel = selectionRef.current;
    if (!editor || !sel) return;

    const { state, view } = editor;
    const tr = state.tr;

    tr.insertText(newText, sel.from, sel.to);

    view.dispatch(tr);
  };

  const dismissResult = () => {
    setAIResult(null);
    setResultPosition(null);
    setIsAILoading(false);
  };

  // UI helpers
  const ToolBtn = ({ children, onClick, active }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 ${active ? "bg-gray-200" : ""}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  // Update selection — also keep refs in sync
  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, " ");
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const x = (start.left + end.right) / 2;
        const y = start.top;

        const sel = { text, from, to };
        const pos = { x, y };

        setSelection(sel);
        setPopupPosition(pos);

        popupPositionRef.current = pos;
      } else {
        setSelection(null);
        setPopupPosition(null);
      }
    };

    editor.on("selectionUpdate", updateSelection);
    return () => editor.off("selectionUpdate", updateSelection);
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const editorEl = document.querySelector(".ProseMirror");
      const popupEl = document.querySelector(".ai-result-popup");

      if (!editorEl) return;

      // If clicking inside editor OR popup → do nothing
      if (
        editorEl.contains(e.target) ||
        popupEl?.contains(e.target)
      ) {
        return;
      }

      setSelection(null);
      setPopupPosition(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <File className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition">
          <div
            onClick={() => navigate("/")}
            title="Go to Home"
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg shadow-lg shadow-purple-500/30"
          >
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            {editingTitle ? (
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => e.key === "Enter" && saveTitle()}
                className="text-lg font-semibold outline-none border-b-2 border-purple-500 bg-transparent px-1 -ml-1 text-gray-800"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                className="text-lg font-semibold cursor-pointer hover:bg-gray-100 px-2 py-1 -ml-2 rounded-lg transition-colors text-gray-800"
              >
                {title}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isSaving ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">Saving…</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400 font-medium">Saved</span>
              </>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() => setIsAIPanelOpen(prev => !prev)}
            className={`flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold transition-all duration-150 ${isAIPanelOpen
              ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
          >
            <Bot size={13} strokeWidth={2} />
            Ask AI
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="bg-white border-b border-gray-200 z-10 shrink-0">
          <div className="flex gap-1 px-4 py-2 justify-center">
            <ToolBtn onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></ToolBtn>
            <Divider />
            <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolBtn>
            <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={16} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={16} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={16} /></ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolBtn>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`transition-all duration-300 overflow-y-auto ${isAIPanelOpen ? "w-[calc(100%-400px)]" : "w-full"}`}>
          <div ref={editorContainerRef} className="max-w-[850px] mx-auto bg-white shadow-lg px-12 pt-8 pb-20 min-h-full">
            <EditorContent editor={editor} />
          </div>
        </div>
        {isAIPanelOpen && (
          <div className="w-[650px] border-l border-gray-200 shrink-0 animate-in slide-in-from-right duration-300">
            <AIPanel 
              onClose={() => setIsAIPanelOpen(false)} 
              onInsert={insertIntoEditor} 
              documentContent={editor?.getText()}
              messages={chatMessages}
              setMessages={setChatMessages}
            />
          </div>
        )}
      </div>

      {/* Floating Toolbar (shown on text selection) */}
      {/* Floating Toolbar */}
      {selection && popupPosition && (
        <div
          style={{
            position: "fixed",
            top: popupPosition.y - 50,
            left: popupPosition.x,
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: "2px",
              background: "#0f1117",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", padding: "4px",
              boxShadow: "0 8px 32px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.2)",
            }}
          >
            <button
              // onMouseDown={(e) => { e.preventDefault(); handleAIAction("rewrite"); }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                height: "30px", padding: "0 12px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "8px", color: "#fff",
                fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
              }}
            >
              <span style={{ fontSize: "11px" }}>✦</span> Ask AI
            </button>

            <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 2px", flexShrink: 0 }} />

            {[
              { id: "improve", label: "Improve" },
              { id: "shorten", label: "Shorten" },
              { id: "explain", label: "Explain" },
              { id: "summarize", label: "Summarize" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onMouseDown={(e) => { e.preventDefault(); handleAIAction(id); }}
                style={{
                  height: "30px", padding: "0 10px",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#9ca3af", fontSize: "11.5px", fontWeight: 500,
                  borderRadius: "7px", whiteSpace: "nowrap", transition: "background .12s, color .12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Caret */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #0f1117",
            }} />
          </div>
        </div>
      )}

      {/* AI Result Popup — loading or result, anchored to resultPosition */}
      {(isAILoading || aiResult) && resultPosition && (
        <div
          style={{
            position: "fixed",
            top: (() => {
              const popupHeight = 280;
              const spaceBelow = window.innerHeight - resultPosition.y;
              return spaceBelow < popupHeight
                ? resultPosition.y - popupHeight - 16
                : resultPosition.y + 16;
            })(),
            left: Math.min(
              Math.max(resultPosition.x, 220),
              window.innerWidth - 220
            ),
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
          className="ai-result-popup w-[420px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          onMouseDown={(e) => e.preventDefault()}
        >

          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 bg-black rounded-md">
                <Bot size={12} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                AI Result
              </span>
            </div>

            <div className="flex items-center gap-1">
              {!isAILoading && aiResult && (
                <button
                  onClick={() => handleAIAction(lastAction)}
                  className="flex items-center gap-1 h-6 px-2 rounded-md border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                  </svg>
                  Retry
                </button>
              )}
              <button
                onClick={dismissResult}
                className="flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-4 py-3 max-h-52 overflow-y-auto">
            {isAILoading ? (
              <div className="flex items-center gap-2 text-gray-400 py-2">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Generating…</span>
              </div>
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{aiResult}</p>
            )}
          </div>

          {!isAILoading && aiResult && (
            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { replaceSelectedText(aiResult); dismissResult(); }}
                className="flex-1 h-7 px-3 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
              >
                Replace
              </button>
              <button
                onClick={() => {
                  const sel = selectionRef.current;
                  if (!editor || !sel) return;
                  const tr = editor.state.tr;
                  tr.insertText("\n" + aiResult, sel.to);
                  editor.view.dispatch(tr);
                  dismissResult();
                  setSelection(null);
                  setPopupPosition(null);
                }}
                className="flex-1 h-7 px-3 rounded-lg bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
              >
                Insert Below
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(aiResult)}
                className="h-7 px-3 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
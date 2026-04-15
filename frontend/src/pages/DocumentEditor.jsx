import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, FileText, Bot, File, Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import AIPanel from "../components/AIPanel";
import { marked } from "marked";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* ─── Toolbar button ──────────────────────────────────────────────────────── */
const ToolBtn = ({ children, onClick, active, title }) => (
  <button
    title={title}
    onClick={onClick}
    className={`
      flex items-center justify-center w-8 h-8 rounded-md
      transition-all duration-150 active:scale-95
      ${active
        ? "bg-amber-100 text-amber-700 shadow-inner"
        : "text-[#7a7570] hover:text-[#2a2420] hover:bg-[#f0ede8]"
      }
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-[#e8e4de] mx-1 shrink-0" />;

/* ─── Component ───────────────────────────────────────────────────────────── */
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
  const [chatMessages, setChatMessages] = useState([]);

  const popupPositionRef = useRef(null);
  const selectionRef = useRef(null);
  const editorContainerRef = useRef(null);

  /* ── Fetch doc ── */
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/docs/${docId}`, { credentials: "include" });
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

  /* ── Editor ── */
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

  /* ── Auto-focus ── */
  useEffect(() => {
    if (!editor || loading) return;
    if (doc?.content && !contentLoaded) return;
    const timer = setTimeout(() => {
      const el = editorContainerRef.current?.querySelector(".ProseMirror");
      if (el) el.focus();
      try {
        editor.commands.focus("start");
        editor.commands.setTextSelection(1);
      } catch (_) { editor.commands.focus(); }
    }, 50);
    return () => clearTimeout(timer);
  }, [editor, loading, contentLoaded]);

  /* ── Autosave ── */
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
      } catch { toast.error("Autosave failed"); }
      finally { if (!cancelled) setIsSaving(false); }
    }, 1000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [doc?.content, docId, loading]);

  /* ── Save title ── */
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
    } catch { toast.error("Failed to save title"); }
  };

  /* ── AI action ── */
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
    } finally { setIsAILoading(false); }
  };

  const insertIntoEditor = (markdownText) => {
    if (!editor) return;
    const html = marked.parse(markdownText);
    editor.chain().focus().insertContent(html).run();
  };

  const replaceDocumentContent = (markdownText) => {
    if (!editor) return;
    const html = marked.parse(markdownText);
    editor.commands.setContent(html);
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

  /* ── Selection tracking ── */
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, " ");
        const start = editor.view.coordsAtPos(from);
        const end = editor.view.coordsAtPos(to);
        const pos = { x: (start.left + end.right) / 2, y: start.top };
        setSelection({ text, from, to });
        setPopupPosition(pos);
        popupPositionRef.current = pos;
      } else {
        setSelection(null);
        setPopupPosition(null);
      }
    };
    editor.on("selectionUpdate", update);
    return () => editor.off("selectionUpdate", update);
  }, [editor]);

  useEffect(() => {
    const handle = (e) => {
      const editorEl = document.querySelector(".ProseMirror");
      const popupEl = document.querySelector(".ai-result-popup");
      if (!editorEl) return;
      if (editorEl.contains(e.target) || popupEl?.contains(e.target)) return;
      setSelection(null);
      setPopupPosition(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-200" />
            <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <File className="w-4 h-4 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[#a09890] text-sm tracking-wide">Opening document…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#EEEAE3] overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-[#e8e4de] flex items-center justify-between px-5 shrink-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/")}
            title="Home"
            className="
              flex items-center justify-center w-8 h-8 rounded-[8px] shrink-0
              bg-gradient-to-br from-indigo-500 to-purple-500
              shadow-md shadow-indigo-200
              hover:scale-105 active:scale-95 transition-transform duration-150
            "
          >
            <FileText className="w-4 h-4 text-white" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[#ccc8c2] text-sm select-none">/</span>
            {editingTitle ? (
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => e.key === "Enter" && saveTitle()}
                className="text-sm font-medium text-[#2a2420] bg-indigo-50 border border-indigo-400 rounded-md px-2 py-1 outline-none w-52 transition-all"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-medium text-[#5a5450] truncate max-w-[240px] px-2 py-1 rounded-md hover:bg-[#f5f2ec] hover:text-[#2a2420] transition-all duration-150"
              >
                {title}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /><span className="text-[11px] text-[#a09890] tracking-wide">Saving</span></>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-[11px] text-[#a09890] tracking-wide">Saved</span></>
            )}
          </div>
          <div className="w-px h-4 bg-[#e8e4de]" />
          <button
            onClick={() => setIsAIPanelOpen(prev => !prev)}
            className={`
              flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] font-semibold
              transition-all duration-200
              ${isAIPanelOpen
                ? "bg-[#f5f2ec] text-[#8a8078] border border-[#e0dcd6] hover:bg-[#eee9e2]"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98]"
              }
            `}
          >
            <Bot size={13} strokeWidth={2.5} />
            {isAIPanelOpen ? "Close AI" : "Ask AI"}
          </button>
        </div>
      </header>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      {editor && (
        <div className="bg-white border-b border-[#ede9e3] shrink-0 z-10">
          <div className="flex items-center gap-0.5 px-4 py-1.5 justify-center">
            <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo size={15} /></ToolBtn>
            <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo size={15} /></ToolBtn>
            <Divider />
            <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></ToolBtn>
            <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></ToolBtn>
            <Divider />
            <ToolBtn title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={15} /></ToolBtn>
            <ToolBtn title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={15} /></ToolBtn>
            <ToolBtn title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={15} /></ToolBtn>
            <Divider />
            <ToolBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></ToolBtn>
            <ToolBtn title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></ToolBtn>
          </div>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto editor-scroll ${isAIPanelOpen ? "w-[calc(100%-500px)]" : "w-full"}`}>
          <div className="min-h-full py-10 px-6 flex justify-center bg-[#EEEAE3]">
            <div
              ref={editorContainerRef}
              className="w-full max-w-[780px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] px-14 pt-12 pb-24 min-h-[calc(100vh-160px)] editor-paper"
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {isAIPanelOpen && (
          <div className="w-[600px] shrink-0 border-l border-[#e0dcd6] ai-panel-enter">
            <AIPanel
              onClose={() => setIsAIPanelOpen(false)}
              onInsert={insertIntoEditor}
              onReplaceDocument={replaceDocumentContent}
              documentContent={editor?.getText()}
              messages={chatMessages}
              setMessages={setChatMessages}
            />
          </div>
        )}
      </div>

      {/* ── Floating selection toolbar ────────────────────────────────────── */}
      {selection && popupPosition && (
        <div
          style={{ position: "fixed", top: popupPosition.y - 52, left: popupPosition.x, transform: "translateX(-50%)", zIndex: 50 }}
          className="floating-toolbar-enter"
        >
          <div className="flex items-center gap-0.5 bg-[#1f1d1a] border border-white/[0.08] rounded-xl px-1.5 py-1.5 shadow-2xl shadow-black/20">
            <button
              style={{ background: "linear-gradient(135deg,#f59e0b,#ea580c)", boxShadow: "0 2px 10px rgba(245,158,11,0.4)" }}
              className="flex items-center gap-1.5 h-7 px-3 rounded-[8px] text-[11.5px] font-bold text-white transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-[10px]">✦</span> Ask AI
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            {[
              { id: "improve", label: "Improve" },
              { id: "shorten", label: "Shorten" },
              { id: "explain", label: "Explain" },
              { id: "summarize", label: "Summarize" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onMouseDown={(e) => { e.preventDefault(); handleAIAction(id); }}
                className="h-7 px-2.5 bg-transparent border-none cursor-pointer text-[#8a8580] text-[11px] font-medium rounded-[7px] hover:bg-white/[0.08] hover:text-white transition-all duration-100 whitespace-nowrap"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#1f1d1a]" />
          </div>
        </div>
      )}

      {/* ── AI result popup ───────────────────────────────────────────────── */}
      {(isAILoading || aiResult) && resultPosition && (
        <div
          style={{
            position: "fixed",
            top: (() => {
              const h = 280;
              return (window.innerHeight - resultPosition.y) < h ? resultPosition.y - h - 16 : resultPosition.y + 16;
            })(),
            left: Math.min(Math.max(resultPosition.x, 220), window.innerWidth - 220),
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
          className="ai-result-popup w-[420px] ai-popup-enter"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="bg-white border border-[#e8e4de] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0ece6] bg-[#faf8f5]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot size={11} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-semibold text-[#8a8078] uppercase tracking-widest">AI Result</span>
              </div>
              <div className="flex items-center gap-1">
                {!isAILoading && aiResult && (
                  <button onClick={() => handleAIAction(lastAction)} className="flex items-center gap-1 h-6 px-2 rounded-md border border-[#e8e4de] text-[#8a8078] text-[11px] hover:bg-[#f5f2ec] hover:text-[#4a4440] transition-all">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    Retry
                  </button>
                )}
                <button onClick={dismissResult} className="flex items-center justify-center w-6 h-6 rounded-md text-[#b0a8a0] hover:bg-[#f0ece6] hover:text-[#5a5450] transition-all">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="px-4 py-3.5 max-h-52 overflow-y-auto">
              {isAILoading ? (
                <div className="flex items-center gap-2.5 text-[#b0a8a0] py-2">
                  <Loader2 size={14} className="animate-spin text-indigo-500" />
                  <span className="text-sm">Thinking…</span>
                </div>
              ) : (
                <p className="text-sm text-[#3a3430] whitespace-pre-wrap leading-relaxed">{aiResult}</p>
              )}
            </div>
            {!isAILoading && aiResult && (
              <div className="flex items-center gap-2 px-4 py-3 border-t border-[#f0ece6] bg-[#faf8f5]">
                <button
                  onClick={() => { replaceSelectedText(aiResult); dismissResult(); }}
                  className="flex-1 h-7 px-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11.5px] font-bold shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95"
                >Replace</button>
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
                  className="flex-1 h-7 px-3 rounded-lg bg-[#2a2420] text-white text-[11.5px] font-semibold hover:bg-[#3a3430] transition-colors active:scale-95"
                >Insert Below</button>
                <button
                  onClick={() => navigator.clipboard.writeText(aiResult)}
                  className="h-7 px-2.5 rounded-lg border border-[#e8e4de] text-[#8a8078] text-[11px] hover:bg-[#f5f2ec] hover:text-[#4a4440] transition-all flex items-center gap-1.5"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
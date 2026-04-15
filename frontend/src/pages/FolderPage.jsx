import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Plus, ArrowLeft, Clock, FolderOpen, Trash2, Search, LayoutGrid, List as ListIcon } from "lucide-react";
import { toast } from "react-toastify";
import DeleteModal from "../components/DeleteModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function FolderPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folder, setFolder] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/f/${folderId}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setFolder(data.folder);
        setFolderName(data.folder.name);
        setDocs(data.docs || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFolderData();
  }, [folderId]);

  const handleCreateDoc = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/f/${folderId}/docs`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      toast.success("Document created");
      navigate(`/doc/${data.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/docs/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setDocs((prev) => prev.filter((doc) => doc.id !== docId));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveFolderName = async () => {
    const trimmed = folderName.trim();

    if (!trimmed || trimmed === folder.name) {
      setFolderName(folder.name);
      setEditingName(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/f/${folderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFolderName(folder.name);
        throw new Error(data.error);
      }

      setFolder((prev) => ({ ...prev, name: trimmed }));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
      setFolderName(folder.name);
    } finally {
      setEditingName(false);
    }
  };

  const filteredDocs = docs.filter((doc) =>
    (doc.title || "Untitled Document").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
            <FolderOpen className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading folder…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* ── Top Navigation Bar ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm shadow-gray-100/50">
        <div className="max-w-[1200px] mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="font-medium text-gray-600">{folderName}</span>
            </div>
          </div>

          <button
            onClick={handleCreateDoc}
            className="group flex items-center gap-2 h-9 px-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            New Document
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1200px] mx-auto px-8 py-8">

        {/* ── Folder Header Card ── */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 via-purple-50 to-violet-100 rounded-xl shadow-inner">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                {editingName ? (
                  <input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onBlur={saveFolderName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveFolderName();
                      if (e.key === "Escape") {
                        setFolderName(folder.name);
                        setEditingName(false);
                      }
                    }}
                    className="text-xl font-bold outline-none border-b-2 border-indigo-400 bg-transparent text-gray-900 w-full max-w-md"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setEditingName(true)}
                    className="text-xl font-bold cursor-pointer text-gray-900 hover:text-indigo-600 transition-colors duration-150"
                  >
                    {folderName}
                  </h1>
                )}
                <p className="text-sm text-gray-400 mt-0.5">
                  {docs.length} {docs.length === 1 ? "document" : "documents"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search & View Toggle ── */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-gray-200/80 bg-white/80 backdrop-blur-sm text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 shadow-sm"
            />
          </div>

          <div className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${viewMode === "grid" ? "bg-indigo-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${viewMode === "list" ? "bg-indigo-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Documents ── */}
        {filteredDocs.length > 0 ? (
          viewMode === "grid" ? (
            /* ── Grid View ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-200/80 hover:-translate-y-1 hover:bg-white shadow-sm"
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                      setIsDeleteOpen(true);
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/80 hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Document icon */}
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl mb-3 group-hover:from-indigo-100 group-hover:to-violet-100 transition-all duration-200 shadow-inner">
                    <FileText className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors duration-200" />
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-gray-900 truncate mb-2">
                    {doc.title || "Untitled Document"}
                  </h3>

                  {/* Metadata */}
                  {doc.updated_at && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(doc.updated_at)}</span>
                    </div>
                  )}

                  {/* Bottom accent line on hover */}
                  {/* <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" /> */}
                </div>
              ))}
            </div>
          ) : (
            /* ── List View ── */
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 divide-y divide-gray-100/80 overflow-hidden shadow-sm">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="group flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-indigo-50/30 transition-all duration-150"
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg group-hover:from-indigo-100 group-hover:to-violet-100 transition-all duration-200 shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors duration-200" />
                  </div>

                  {/* Title & date */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-gray-900 truncate">
                      {doc.title || "Untitled Document"}
                    </h3>
                  </div>

                  {/* Date (right side) */}
                  {doc.updated_at && (
                    <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                      {formatDate(doc.updated_at)}
                    </span>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoc(doc);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl mb-5 shadow-inner">
              <FileText className="w-8 h-8 text-indigo-300" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-base font-semibold text-gray-700 mb-1">No results found</h3>
                <p className="text-sm text-gray-500 mb-5">
                  No documents match "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-gray-700 mb-1">No documents yet</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Get started by creating your first document
                </p>
                <button
                  onClick={handleCreateDoc}
                  className="flex items-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50"
                >
                  <Plus className="w-4 h-4" />
                  Create Document
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (!selectedDoc) return;
          handleDeleteDoc(selectedDoc.id);
          setIsDeleteOpen(false);
        }}
        docTitle={selectedDoc?.title}
        type="doc"   // ✅ IMPORTANT FIX
      />
    </div>
  );
}
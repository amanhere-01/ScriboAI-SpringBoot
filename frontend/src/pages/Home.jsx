import { useState, useEffect } from "react";
import { Menu, Plus, User, LogOut, FileText, MoreVertical, Trash2, ExternalLink, Folder } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { logoutSuccess } from "../store/authSlice";
import CreateFolder from "../components/CreateFolder";
import DeleteModal from "../components/DeleteModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center mt-10 mb-4">
      <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/60 shadow-sm">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-200"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${p === page
              ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all duration-200"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [openDocMenuId, setOpenDocMenuId] = useState(null);
  const [openFolderMenuId, setOpenFolderMenuId] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const [folderPage, setFolderPage] = useState(0);
  const [totalFolderPages, setTotalFolderPages] = useState(0);
  const [docPage, setDocPage] = useState(0);
  const [totalDocPages, setTotalDocPages] = useState(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);


  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/docs?page=${docPage}&pageSize=12`,
          { credentials: "include" });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch documents");
        setDocs(data.content);
        setTotalDocPages(data.totalPages);

      } catch (err) {
        toast.error(err.message);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocs();
  }, [docPage]);


  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/f?page=${folderPage}&pageSize=12`,
          { credentials: "include" });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch folders");

        setFolders(data.content);
        setTotalFolderPages(data.totalPages);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setFoldersLoading(false);
      }
    };
    fetchFolders();
  }, [folderPage]);



  useEffect(() => {
    setDocPage(0);
  }, [activeTab]);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      dispatch(logoutSuccess());
      setShowMenu(false);
      setLoading(false);
      navigate('/auth');
    }
  };

  const handleCreateDoc = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/docs`, { method: "POST", credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create document");
      toast.success("New document created");
      navigate(`/doc/${data.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/docs/${docId}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDocs(prev => prev.filter(doc => doc.id !== docId));
      toast.success("Document deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/f/${folderId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      toast.success("Folder deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateFolder = async (name) => {
    if (!name || !name.trim()) { toast.error("Folder name cannot be empty"); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/f`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      navigate(`/f/${data.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowFolderDialog(false);
      setShowCreateMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 pb-24">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm shadow-gray-100/50">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            ScriboAI
          </h1>
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full cursor-pointer bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
            >
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-900"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/60 p-2 z-[100]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full px-4 py-2 text-left flex items-center gap-3 rounded-xl hover:bg-gray-50/80 text-gray-700 text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero / Welcome ── */}
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl mb-2">
              Welcome to ScriboAI
            </h2>
            <p className="text-gray-500 text-lg">
              Your intelligent document workspace
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFolderDialog(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <Folder className="w-4 h-4 text-gray-400" />
              New Folder
            </button>
            <button
              onClick={handleCreateDoc}
              className="flex-1 md:flex-none group flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-600 transition-all duration-200 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              New Document
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-[1200px] mx-auto px-6 mb-8">
        <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/60 p-1.5 gap-1">
          {[
            { key: "documents", icon: <FileText className="w-4 h-4" />, count: docs.length },
            { key: "folders", icon: <Folder className="w-4 h-4" />, count: folders.length },
          ].map(({ key, icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 ${activeTab === key
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
            >
              <span className="flex items-center gap-2">
                {icon}
                {key}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${activeTab === key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
                  }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="max-w-[1200px] mx-auto px-6">

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="animate-[fadeIn_200ms_ease-out]">
            {/* {!docsLoading && docs.length > 0 && (
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Documents</h3>
            )} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {!docsLoading && docs.length > 0 && docs.map((doc) => (
                <div
                  key={doc.id}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-200/80 hover:-translate-y-1 hover:bg-white shadow-sm ${openDocMenuId === doc.id ? 'z-50 shadow-xl border-indigo-200/80 -translate-y-1 bg-white' : ''}`}
                >
                  {/* More Menu */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenDocMenuId(openDocMenuId === doc.id ? null : doc.id); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openDocMenuId === doc.id && (
                      <div
                        className="absolute right-0 mt-1 w-44 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/60 p-1.5 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/doc/${doc.id}`, "_blank");
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" /> Open in tab
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(doc);
                            setDeleteType("doc");
                            setIsDeleteOpen(true);
                            setOpenDocMenuId(null);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div onClick={() => navigate(`/doc/${doc.id}`)} className="cursor-pointer block h-full">
                    <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl mb-4 group-hover:from-indigo-100 group-hover:to-violet-100 transition-all duration-300 shadow-inner">
                      <FileText className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <h3 className="font-semibold text-[15px] text-gray-900 truncate mb-1.5">
                      {doc.title || "Untitled Document"}
                    </h3>
                    <p className="text-[12px] text-gray-500 font-medium">
                      Updated {new Date(doc.updatedAt + "Z").toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>

                  {/* <div className="absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-indigo-400 to-violet-400 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                </div>
              ))}
            </div>

            {!docsLoading && docs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300/80">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl mb-6 shadow-inner">
                  <FileText className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-500 max-w-sm mb-8">
                  Get started by creating your first document to capture your ideas.
                </p>
                <button
                  onClick={handleCreateDoc}
                  className="flex items-center gap-2 h-11 px-6 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create Document
                </button>
              </div>
            )}

            <Pagination total={totalDocPages * 9} page={docPage + 1} perPage={9} onChange={(p) => setDocPage(p - 1)} />
          </div>
        )}

        {/* Folders Tab */}
        {activeTab === "folders" && (
          <div className="animate-[fadeIn_200ms_ease-out]">
            {/* {!foldersLoading && folders.length > 0 && (
              <h3 className="text-lg font-bold text-gray-900 mb-6">Your Folders</h3>
            )} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {!foldersLoading && folders.length > 0 && folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/60 transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/40 hover:border-amber-200/80 hover:-translate-y-1 hover:bg-white shadow-sm ${openFolderMenuId === folder.id ? 'z-50 shadow-xl border-amber-200/80 -translate-y-1 bg-white' : ''}`}
                >
                  {/* More Menu */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenFolderMenuId(openFolderMenuId === folder.id ? null : folder.id); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openFolderMenuId === folder.id && (
                      <div
                        className="absolute right-0 mt-1 w-44 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/60 p-1.5 z-[100]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/f/${folder.id}`, "_blank");
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" /> Open in tab
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(folder);
                            setDeleteType("folder");
                            setIsDeleteOpen(true);
                            setOpenFolderMenuId(null);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div onClick={() => navigate(`/f/${folder.id}`)} className="cursor-pointer block h-full">
                    <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl mb-4 group-hover:from-amber-100 group-hover:to-orange-100 transition-all duration-300 shadow-inner">
                      <Folder className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <h3 className="font-semibold text-[15px] text-gray-900 truncate mb-1.5">
                      {folder.name || "Untitled Folder"}
                    </h3>
                    <p className="text-[12px] text-gray-500 font-medium">
                      Created {new Date(folder.createdAt + "Z").toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>

                  {/* <div className="absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                </div>
              ))}
            </div>

            {!foldersLoading && folders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300/80">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl mb-6 shadow-inner">
                  <Folder className="w-10 h-10 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No folders yet</h3>
                <p className="text-gray-500 max-w-sm mb-8">
                  Organize your documents by creating your first folder.
                </p>
                <button
                  onClick={() => setShowFolderDialog(true)}
                  className="flex items-center gap-2 h-11 px-6 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create Folder
                </button>
              </div>
            )}

            <Pagination total={totalFolderPages * 9} page={folderPage + 1} perPage={9} onChange={(p) => setFolderPage(p - 1)} />
          </div>
        )}
      </div>

      <CreateFolder
        isOpen={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
        onCreate={handleCreateFolder}
      />

      {/* ── Shared Overlay for all Modals/Dropdowns ── */}
      {(showMenu || openFolderMenuId || openDocMenuId || showCreateMenu) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowMenu(false);
            setOpenFolderMenuId(null);
            setOpenDocMenuId(null);
            setShowCreateMenu(false);
          }}
        />
      )}

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (!selectedItem) return;

          if (deleteType === "doc") {
            handleDeleteDoc(selectedItem.id);
          } else if (deleteType === "folder") {
            handleDeleteFolder(selectedItem.id);
          }

          setIsDeleteOpen(false);
        }}
        docTitle={selectedItem?.title || selectedItem?.name}
        type={deleteType}
      />
    </div>
  );
}
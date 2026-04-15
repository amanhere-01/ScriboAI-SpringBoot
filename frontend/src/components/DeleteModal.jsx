import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, docTitle, type }) {
  const modalRef = useRef(null);
  const cancelRef = useRef(null);

  // Focus the Cancel button when modal opens
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-sm overflow-hidden animate-[scaleIn_200ms_ease-out]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Delete {type === "folder" ? "Folder" : "Document"}?
          </h3>
          {docTitle && (
            <p className="text-sm font-medium text-gray-700 mb-1 truncate max-w-[250px] mx-auto">
              "{docTitle}"
            </p>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-6 pb-6">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors duration-150 shadow-sm shadow-red-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

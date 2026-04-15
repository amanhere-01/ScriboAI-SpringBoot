import { useState } from "react";

export default function CreateFolder({isOpen, onClose, onCreate}) {
  const [folderName, setFolderName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!folderName.trim()) return;
    onCreate(folderName.trim());
    setFolderName("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Create Folder
        </h3>

        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoFocus
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setFolderName("");
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

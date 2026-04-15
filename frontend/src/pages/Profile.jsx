import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ArrowLeft, Mail, Folder, Shield, Settings, FileText, Trash2 } from "lucide-react";
import { logoutSuccess } from "../store/authSlice";
import { toast } from "react-toastify";
import { useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function ImprovedProfile() {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
	const navigate = useNavigate();
	const [documentsCount, setDocumentsCount] = useState(0);
  const [foldersCount, setFoldersCount] = useState(0);

	if (!user) {
		navigate("/auth");
		return null;
	}


  useEffect(() => {
    fetchCount(`${BACKEND_URL}/docs/count`, setDocumentsCount);
    fetchCount(`${BACKEND_URL}/f/count`, setFoldersCount);
  }, []);

  const fetchCount = async (url, setCount) => {
    try {
      const res = await fetch(url, { credentials: "include" });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setCount(data.count);
    } catch (e) {
      toast.error(e.message);
    }
  };
	

  const handleLogout = async () => {
			if (loading) return;
			setLoading(true);
			try{   
				const res = await fetch(`${BACKEND_URL}/auth/signout`, {
						method: 'POST',
						credentials: 'include'
				});
				
				const data = await res.json();
	
				if(!res.ok){
					throw new Error(data.error);
				}
				
				toast.success(data.message || "Signed out successfully.");
	
			} catch(error){
				console.error("Sign out error:", error);
				toast.error(error.message);
			} finally {  
				dispatch(logoutSuccess());
				setLoading(false);
				navigate('/auth')
			}
		};
		

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Main Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header with gradient */}
          <div className="relative h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl ring-8 ring-white">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {user.username}
              </h1>
              <p className="text-gray-500 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{documentsCount}</p>
                    <p className="text-sm text-purple-700">Documents</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 border border-cyan-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-900">{foldersCount}</p>
                    <p className="text-sm text-cyan-700">Folders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">Account Settings</p>
                  <p className="text-sm text-gray-500">Manage your account preferences</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">Privacy & Security</p>
                  <p className="text-sm text-gray-500">Update password and security settings</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-6 py-4 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 group border border-red-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-red-800">Delete Account</p>
                  <p className="text-sm text-red-600">Permanently delete your account</p>
                </div>
              </button>
            </div>

            {/* Logout Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
								disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Logout
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
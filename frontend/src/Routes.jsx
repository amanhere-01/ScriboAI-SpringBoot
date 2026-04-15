import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthSuccess from "./pages/AuthSuccess";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import DocumentEditor from "./pages/DocumentEditor";
import Profile from "./pages/Profile";
import FolderPage from "./pages/FolderPage";


export default function AppRoutes() {
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  return (
    <Routes>
      <Route 
        path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />}
      />

      <Route 
        path="/" element={ isAuthenticated ? <Home /> : <Navigate to="/auth" />} 
      />

      <Route path="/auth/success" element={<AuthSuccess/>}/>

      <Route path="/doc/:docId" element={<DocumentEditor />} />

      <Route path="/f/:folderId" element={<FolderPage />} />

      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

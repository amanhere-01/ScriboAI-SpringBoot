import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Routes from "./Routes";

export default function App() {
  return (
    <>
      <Routes />
      <ToastContainer position="top-right" autoClose={1500} /> 
    </>
  )
}

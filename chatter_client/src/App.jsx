import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthstore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const { authUser, getMe } = useAuthStore();

  useEffect(() => {
    getMe(); // check if user is already logged in on refresh
  }, []);

  return (
    <Routes>
      <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;


// import Login from "./pages/Login";

// function App() {
//   return <Login />;
// }

// export default App;
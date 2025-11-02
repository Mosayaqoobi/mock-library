import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import BookDetail from './pages/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from "./pages/Profile.jsx";
import axios from "axios";


function App() {
  const [user,  setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("/api/users/me",{
          headers: {Authorization: `Bearer ${token}`}
      });
      setUser(response.data);
    } catch (error) {
        setError("failed to fetch user data");
        localStorage.removeItem("token")
        setUser(null);
      };
    };
    };
    fetchUser();

}, []);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} error={error} />
    </Router>
  );
};

function AppContent({ user, setUser, error }) {
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return ( 
    <>
    {shouldShowNavbar && <NavBar user={user} setUser={setUser} /> }
    <Routes>
      <Route path = "/" element={<Dashboard user = {user} error = {error} />} />
      <Route path = "/search" element={<Search user = {user} />} />
      <Route path = "/books/:id" element={<BookDetail user={user} setUser={setUser} />} />
      <Route path = "/login" element={<Login setUser = {setUser} />} />
      <Route path = "/register" element={<Register setUser = {setUser} />} />
      <Route path = "/profile" element={<Profile user={user} setUser={setUser}/>}/>
    </Routes>
    </>
  );
};

export default App;

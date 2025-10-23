import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
      }) 
    } catch (error) {
        setError("failed to fetch user data");
        localStorage.removeItem("token")
      }
    }
    };
    fetchUser();

}, [])

  return (
    <Router>
      <NavBar user = {user} setUser = {setUser}/>
        <Routes>
          <Route path = "/" element={<Home user = {user} error = {error} />} />
          <Route path = "/login" element={<Login setUser = {setUser} />} />
          <Route path = "/register" element={<Register setUser = {setUser} />} />
        </Routes>
    </Router>
  )
}

export default App

import * as React from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register({setUser}) {
  const [formData, setFormData ] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //keep the value the same as what it was upon submiting
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }
  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res = await axios.post("api/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data);
      navigate("/login");
      console.log(res.data);

    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {error && ( 
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400, width: '90%' }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Paper elevation={2} sx={{p: 3,width: 400, backgroundColor: '#2c2c2c', maxWidth: '90%', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',}}>
        <Typography variant="h5" align="center" sx={{ mb: 3, color: "white" }}>
          Register
        </Typography>
        <form onSubmit={handleSubmit}>

        <TextField label="username" type="username" name="username" value={formData.username} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white' } }}/>

        <TextField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white' } }}/>

        <TextField label="Password" type="password" name = "password" value = {formData.password} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white' } }}/>

        <Button type = "submit" variant="contained" fullWidth sx={{ mt: 2, color: "white" }}>
          Register
        </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 , color: "white"}}>
          Already have an account?{' '}
          <Typography
            component="span"
            color="primary"
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
          >
            Log in
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
}
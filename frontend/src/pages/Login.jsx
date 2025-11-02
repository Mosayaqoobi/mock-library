import * as React from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, Container, Fade } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({setUser}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data);
      navigate("/");
      console.log(res.data);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Paper 
            elevation={24} 
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            {error && ( 
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(139, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 69, 58, 0.3)',
                  '& .MuiAlert-message': { 
                    fontSize: '0.9rem',
                    color: '#ff6b6b'
                  }
                }} 
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #00d4ff 30%, #0099cc 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: '#888888' }}>
                Sign in to your account
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField 
                label="Email Address" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                fullWidth 
                margin="normal"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00d4ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d4ff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#888888',
                    '&.Mui-focused': {
                      color: '#00d4ff',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  },
                }}
                required
              />

              <TextField 
                label="Password" 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                fullWidth 
                margin="normal"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#00d4ff',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d4ff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#888888',
                    '&.Mui-focused': {
                      color: '#00d4ff',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  },
                }}
                required
              />

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2d2d2d 30%, #404040 90%)',
                  border: '1px solid rgba(0, 212, 255, 0.5)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.3s ease',
              }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 3, color: '#888888' }}>
              Don't have an account?{' '}
              <Typography
                component="span"
                sx={{ 
                  color: '#00d4ff',
                  cursor: 'pointer', 
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
                onClick={() => navigate("/register")}
              >
                Register
              </Typography>
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
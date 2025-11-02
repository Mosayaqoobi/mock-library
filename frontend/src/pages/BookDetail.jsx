import * as React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Container, 
  Fade,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Star,
  ArrowBack,
  Book as BookIcon,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function BookDetail({ user, setUser }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookDetails = async () => {
    if (!id) {
      setError("Invalid book ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        setBook(res.data);
      } else {
        setError("Book data not found");
      }
    } catch (error) {
      console.error("Failed to fetch book details:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load book details";
      setError(errorMessage);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
        return;
      } else if (error.response?.status === 404) {
        setError("Book not found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
      navigate("/login");
      return;
    }
    
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleBorrow = async () => {
    setBorrowing(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/borrow", 
        { bookId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(res.data.message || "Book borrowed successfully!");
      
      // Refresh book details to show updated status
      setTimeout(() => {
        fetchBookDetails();
        setSuccess("");
      }, 2000);
      
    } catch (error) {
      console.error("Failed to borrow book:", error);
      setError(error.response?.data?.message || "Failed to borrow book");
      setTimeout(() => setError(""), 5000);
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#00d4ff', mb: 2 }} />
          <Typography sx={{ color: 'white' }}>Loading book details...</Typography>
        </Box>
      </Box>
    );
  }

  if (!loading && !book) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
            maxWidth: 600,
          }}
        >
          <Typography variant="h5" sx={{ color: '#ff6b6b', textAlign: 'center', mb: 2 }}>
            {error ? 'Error Loading Book' : 'Book Not Found'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#888888', textAlign: 'center', mb: 3 }}>
            {error || "The book you're looking for doesn't exist."}
          </Typography>
          <Button
            onClick={() => navigate(-1)}
            variant="contained"
            startIcon={<ArrowBack />}
            fullWidth
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2d2d2d 30%, #404040 90%)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
              }
            }}
          >
            Go Back
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box>
            {/* Back Button */}
            <Button
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack />}
              sx={{
                mb: 3,
                color: '#888888',
                textTransform: 'none',
                '&:hover': {
                  color: '#00d4ff',
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                }
              }}
            >
              Back
            </Button>

            <Grid container spacing={4}>
            {/* Left Column - Book Cover */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={24}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
                }}
              >
                <CardMedia
                  component="img"
                  image={book.coverimg || '/placeholder-book.jpg'}
                  alt={book.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    objectFit: 'cover',
                  }}
                />
              </Paper>
            </Grid>

            {/* Right Column - Book Details */}
            <Grid size={{ xs: 12, md: 8 }}>
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

                {success && ( 
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      backgroundColor: 'rgba(0, 139, 0, 0.2)',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      '& .MuiAlert-message': { 
                        fontSize: '0.9rem',
                        color: '#4caf50'
                      }
                    }} 
                    onClose={() => setSuccess("")}
                  >
                    {success}
                  </Alert>
                )}

                {/* Title */}
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: { xs: '1.8rem', md: '2.5rem' }
                  }}
                >
                  {book.title}
                </Typography>

                {/* Rating and Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ color: '#ffd700', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {book.rating !== undefined && book.rating !== null 
                        ? Number(book.rating).toFixed(1) 
                        : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Chip
                    icon={book.isAvailable ? <CheckCircle /> : <Cancel />}
                    label={book.isAvailable ? 'Available' : 'Borrowed'}
                    sx={{
                      backgroundColor: book.isAvailable 
                        ? 'rgba(76, 175, 80, 0.2)' 
                        : 'rgba(244, 67, 54, 0.2)',
                      color: book.isAvailable ? '#4caf50' : '#f44336',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: `1px solid ${book.isAvailable ? '#4caf50' : '#f44336'}`,
                    }}
                  />
                </Box>

                {/* Genres */}
                {book.genres && book.genres.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#888888', mb: 1 }}>
                      Genres
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {book.genres.map((genre, index) => (
                        <Chip
                          key={index}
                          label={genre}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0, 212, 255, 0.2)',
                            color: '#00d4ff',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Details */}
                {book.details && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                      Description
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#888888',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {book.details}
                    </Typography>
                  </Box>
                )}

                {/* Borrow Information */}
                {!book.isAvailable && (
                <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: user && book.borrowedBy?._id && String(user._id) === String(book.borrowedBy._id)
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(244, 67, 54, 0.1)',
                    border: user && book.borrowedBy?._id && String(user._id) === String(book.borrowedBy._id)
                    ? '1px solid rgba(76, 175, 80, 0.3)'
                    : '1px solid rgba(244, 67, 54, 0.3)'
                }}>
                    <Typography variant="body2" sx={{ 
                    color: user && book.borrowedBy?._id && String(user._id) === String(book.borrowedBy._id) ? '#4caf50' : '#888888', 
                    mb: 1 
                    }}>
                    Currently Borrowed By: {user && book.borrowedBy?._id && String(user._id) === String(book.borrowedBy._id)
                        ? 'You' 
                        : (book.borrowedBy?.username || 'Unknown')}
                    </Typography>
                    {book.dueDate && (
                    <Typography variant="body2" sx={{ color: '#888888' }}>
                        Due Date: {new Date(book.dueDate).toLocaleDateString()}
                    </Typography>
                    )}
                </Box>
                )}

               {/* Borrow Button */}
                {book.isAvailable ? (
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<BookIcon />}
                    onClick={handleBorrow}
                    disabled={borrowing}
                    fullWidth
                    sx={{
                    mt: 2,
                    py: 2,
                    borderRadius: 2,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #00d4ff 30%, #0099cc 90%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #0099cc 30%, #00d4ff 90%)',
                        boxShadow: '0 6px 20px rgba(0, 212, 255, 0.6)',
                        transform: 'translateY(-2px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                    '&:disabled': {
                        backgroundColor: '#cccccc',
                    },
                    transition: 'all 0.3s ease',
                    }}
                >
                    {borrowing ? 'Borrowing...' : 'Borrow This Book'}
                </Button>
                ) : user && book.borrowedBy?._id && String(user._id) === String(book.borrowedBy._id) ? (
                // User borrowed this book - show different message
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#4caf50', mb: 1, fontWeight: 600 }}>
                    ✓ You have borrowed this book
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888888' }}>
                    Return it from your Profile page
                    </Typography>
                </Box>
                ) : (
                // Someone else borrowed it
                <Button
                    variant="outlined"
                    size="large"
                    disabled
                    fullWidth
                    sx={{
                    mt: 2,
                    py: 2,
                    borderRadius: 2,
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: 'rgba(244, 67, 54, 0.5)',
                    color: '#f44336',
                    '&:disabled': {
                        borderColor: 'rgba(244, 67, 54, 0.3)',
                        color: '#f44336',
                    }
                    }}
                >
                    Currently Unavailable
                </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}


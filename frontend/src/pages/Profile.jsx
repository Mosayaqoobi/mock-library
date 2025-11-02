import * as React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  Container, 
  Fade,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  Person,
  Edit,
  Lock,
  Delete,
  Book,
  Warning,
  Undo,
  Refresh
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Profile update form
  const [profileFormData, setProfileFormData] = useState({
    newUsername: "",
  });
  
  // Password change form
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  
  // Borrowed books
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  
  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Loading states for individual operations
  const [returningBookId, setReturningBookId] = useState(null);
  const [renewingBookId, setRenewingBookId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
      navigate("/login");
      return;
    }
    
    fetchBorrowedBooks();
  }, [user, navigate]);

  const fetchBorrowedBooks = async () => {
    setLoadingBooks(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch active borrowed books, overdue, and returned books
      const [activeBorrowsRes, overdueRes, returnedRes] = await Promise.all([
        axios.get("/api/borrow/?status=using", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("/api/borrow/overdue", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("/api/borrow/?status=returned", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const activeBorrows = activeBorrowsRes.data.borrowedBooks || [];
      const overdue = overdueRes.data.borrowedBooks || [];
      const returned = returnedRes.data.borrowedBooks || [];
      
      // Fetch book details for active borrows
      const bookDetailsPromises = activeBorrows.map(async (borrow) => {
        try {
          const bookRes = await axios.get(`/api/books/${borrow.bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return {
            ...borrow,
            book: bookRes.data
          };
        } catch (error) {
          console.error(`Failed to fetch book ${borrow.bookId}:`, error);
          return {
            ...borrow,
            book: null
          };
        }
      });
      
      const booksWithDetails = await Promise.all(bookDetailsPromises);
      setBorrowedBooks(booksWithDetails);
      
      // Fetch book details for overdue books
      const overdueDetailsPromises = overdue.map(async (borrow) => {
        try {
          const bookRes = await axios.get(`/api/books/${borrow.bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return {
            ...borrow,
            book: bookRes.data
          };
        } catch (error) {
          console.error(`Failed to fetch book ${borrow.bookId}:`, error);
          return {
            ...borrow,
            book: null
          };
        }
      });
      
      const overdueWithDetails = await Promise.all(overdueDetailsPromises);
      setOverdueBooks(overdueWithDetails);
      
      // Fetch book details for returned books
      const returnedDetailsPromises = returned.map(async (borrow) => {
        try {
          const bookRes = await axios.get(`/api/books/${borrow.bookId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return {
            ...borrow,
            book: bookRes.data
          };
        } catch (error) {
          console.error(`Failed to fetch book ${borrow.bookId}:`, error);
          return {
            ...borrow,
            book: null
          };
        }
      });
      
      const returnedWithDetails = await Promise.all(returnedDetailsPromises);
      setReturnedBooks(returnedWithDetails);
    } catch (error) {
      console.error("Failed to fetch borrowed books:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      }
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileFormData({...profileFormData, [e.target.name]: e.target.value});
  };

  const handlePasswordChange = (e) => {
    setPasswordFormData({...passwordFormData, [e.target.name]: e.target.value});
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("/api/users/profile", {
        newUsername: profileFormData.newUsername || undefined,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(res.data.message || "Profile updated successfully");
      setUser({ ...user, username: res.data.user.username });
      setProfileFormData({ newUsername: "" });
      
      // Update token if needed (usually not required for username change)
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
      setError("New passwords do not match");
      setTimeout(() => setError(""), 5000);
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put("/api/users/profile", {
        newPassword: passwordFormData.newPassword,
        confirmNewPassword: passwordFormData.confirmNewPassword,
        confirmOldPassword: passwordFormData.oldPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(res.data.message || "Password updated successfully");
      setPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update password");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete account");
      setTimeout(() => setError(""), 5000);
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (bookId) => {
    setReturningBookId(bookId);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/borrow/return",
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(res.data.message || "Book returned successfully!");
      await fetchBorrowedBooks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to return book");
      setTimeout(() => setError(""), 5000);
    } finally {
      setReturningBookId(null);
    }
  };

  const handleRenewBook = async (bookId) => {
    setRenewingBookId(bookId);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/borrow/renew",
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(res.data.message || "Book renewed successfully!");
      await fetchBorrowedBooks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to renew book");
      setTimeout(() => setError(""), 5000);
    } finally {
      setRenewingBookId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <Container maxWidth="md">
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
                Profile
              </Typography>
              <Typography variant="body1" sx={{ color: '#888888' }}>
                Manage your account and view your borrowed books
              </Typography>
            </Box>

            {/* Tab Navigation */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Button
                onClick={() => setActiveTab('profile')}
                startIcon={<Person />}
                sx={{
                  color: activeTab === 'profile' ? '#00d4ff' : '#888888',
                  borderBottom: activeTab === 'profile' ? '2px solid #00d4ff' : '2px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: activeTab === 'profile' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  }
                }}
              >
                Profile
              </Button>
              <Button
                onClick={() => setActiveTab('password')}
                startIcon={<Lock />}
                sx={{
                  color: activeTab === 'password' ? '#00d4ff' : '#888888',
                  borderBottom: activeTab === 'password' ? '2px solid #00d4ff' : '2px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: activeTab === 'password' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  }
                }}
              >
                Change Password
              </Button>
              <Button
                onClick={() => setActiveTab('books')}
                startIcon={<Book />}
                sx={{
                  color: activeTab === 'books' ? '#00d4ff' : '#888888',
                  borderBottom: activeTab === 'books' ? '2px solid #00d4ff' : '2px solid transparent',
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: activeTab === 'books' ? 600 : 400,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  }
                }}
              >
                My Books
              </Button>
            </Box>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Box>
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                  <Typography variant="body2" sx={{ color: '#888888', mb: 1 }}>Current Username</Typography>
                  <Typography variant="h6" sx={{ color: 'white' }}>{user?.username || 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ color: '#888888', mt: 2, mb: 1 }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>{user?.email || 'N/A'}</Typography>
                </Box>

                <form onSubmit={handleProfileUpdate}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Update Username</Typography>
                  
                  <TextField 
                    label="New Username" 
                    name="newUsername" 
                    value={profileFormData.newUsername} 
                    onChange={handleProfileChange} 
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
                  />

                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    startIcon={<Edit />}
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
                    disabled={loading || !profileFormData.newUsername}
                  >
                    {loading ? 'Updating...' : 'Update Username'}
                  </Button>
                </form>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 2 }}>Danger Zone</Typography>
                  <Button 
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'rgba(255, 69, 58, 0.5)',
                      color: '#ff6b6b',
                      '&:hover': {
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 69, 58, 0.1)',
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Box>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Box>
                <form onSubmit={handlePasswordUpdate}>
                  <TextField 
                    label="Current Password" 
                    type="password" 
                    name="oldPassword" 
                    value={passwordFormData.oldPassword} 
                    onChange={handlePasswordChange} 
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
                    label="New Password" 
                    type="password" 
                    name="newPassword" 
                    value={passwordFormData.newPassword} 
                    onChange={handlePasswordChange} 
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
                    label="Confirm New Password" 
                    type="password" 
                    name="confirmNewPassword" 
                    value={passwordFormData.confirmNewPassword} 
                    onChange={handlePasswordChange} 
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
                    startIcon={<Lock />}
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
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </Box>
            )}

            {/* Books Tab */}
            {activeTab === 'books' && (
              <Box>
                {loadingBooks ? (
                  <Typography sx={{ color: '#888888', textAlign: 'center', py: 4 }}>
                    Loading your books...
                  </Typography>
                ) : (
                  <>
                    {/* Overdue Books */}
                    {overdueBooks.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Warning sx={{ color: '#ff6b6b', mr: 1 }} />
                          <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                            Overdue Books ({overdueBooks.length})
                          </Typography>
                        </Box>
                        <Grid container spacing={2}>
                          {overdueBooks.map((borrow) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={borrow._id}>
                              <Card
                                sx={{
                                  background: 'rgba(139, 0, 0, 0.2)',
                                  border: '1px solid rgba(255, 69, 58, 0.3)',
                                  borderRadius: 2,
                                }}
                              >
                                <CardContent>
                                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                    {borrow.book?.title || `Book ID: ${borrow.bookId}`}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#ff6b6b', mb: 1 }}>
                                    Due: {formatDate(borrow.dueDate)}
                                  </Typography>
                                  <Chip
                                    label="Overdue"
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(255, 69, 58, 0.3)',
                                      color: '#ff6b6b',
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Currently Borrowed Books */}
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                        Currently Borrowed ({borrowedBooks.length})
                      </Typography>
                      {borrowedBooks.length === 0 ? (
                        <Typography sx={{ color: '#888888', textAlign: 'center', py: 4 }}>
                          You don't have any borrowed books at the moment.
                        </Typography>
                      ) : (
                        <Grid container spacing={2}>
                          {borrowedBooks.map((borrow) => {
                            const daysRemaining = getDaysRemaining(borrow.dueDate);
                            const isOverdueSoon = daysRemaining <= 3 && daysRemaining > 0;
                            
                            return (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={borrow._id}>
                                <Card
                                  sx={{
                                    background: 'rgba(26, 26, 46, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 2,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.02)',
                                      border: '1px solid rgba(0, 212, 255, 0.5)',
                                    }
                                  }}
                                >
                                  <CardContent>
                                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                      {borrow.book?.title || `Book ID: ${borrow.bookId}`}
                                    </Typography>
                                    {borrow.book && (
                                      <>
                                        {borrow.book.genres && borrow.book.genres.length > 0 && (
                                          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                                            {borrow.book.genres.slice(0, 2).map((genre, index) => (
                                              <Chip
                                                key={index}
                                                label={genre}
                                                size="small"
                                                sx={{
                                                  backgroundColor: 'rgba(0, 212, 255, 0.2)',
                                                  color: '#00d4ff',
                                                  fontSize: '0.7rem',
                                                  height: 20
                                                }}
                                              />
                                            ))}
                                          </Box>
                                        )}
                                      </>
                                    )}
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: isOverdueSoon ? '#ff9800' : daysRemaining < 0 ? '#ff6b6b' : '#4caf50',
                                        mb: 1,
                                        fontWeight: 600
                                      }}
                                    >
                                      {daysRemaining < 0 
                                        ? `Overdue by ${Math.abs(daysRemaining)} day(s)`
                                        : isOverdueSoon
                                        ? `Due in ${daysRemaining} day(s) - Renew Soon!`
                                        : `Due in ${daysRemaining} day(s)`}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#888888' }}>
                                      Due Date: {formatDate(borrow.dueDate)}
                                    </Typography>
                                    {borrow.renew > 0 && (
                                      <Typography variant="body2" sx={{ color: '#888888', mt: 1 }}>
                                        Renewed {borrow.renew} time(s)
                                      </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Undo />}
                                        onClick={() => handleReturnBook(borrow.bookId)}
                                        disabled={returningBookId === borrow.bookId}
                                        fullWidth
                                        sx={{
                                          textTransform: 'none',
                                          borderRadius: 2,
                                          borderColor: 'rgba(76, 175, 80, 0.5)',
                                          color: '#4caf50',
                                          '&:hover': {
                                            borderColor: '#4caf50',
                                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                          },
                                          '&:disabled': {
                                            borderColor: 'rgba(76, 175, 80, 0.3)',
                                            color: '#4caf50',
                                          }
                                        }}
                                      >
                                        {returningBookId === borrow.bookId ? 'Returning...' : 'Return'}
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Refresh />}
                                        onClick={() => handleRenewBook(borrow.bookId)}
                                        disabled={renewingBookId === borrow.bookId || borrow.renew >= 3 || daysRemaining > 3}
                                        fullWidth
                                        sx={{
                                          textTransform: 'none',
                                          borderRadius: 2,
                                          borderColor: daysRemaining <= 3 ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                                          color: daysRemaining <= 3 ? '#00d4ff' : '#888888',
                                          '&:hover': {
                                            borderColor: daysRemaining <= 3 ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)',
                                            backgroundColor: daysRemaining <= 3 ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                                          },
                                          '&:disabled': {
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#666666',
                                          }
                                        }}
                                      >
                                        {renewingBookId === borrow.bookId ? 'Renewing...' : 'Renew'}
                                      </Button>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </Box>

                    {/* Returned Books History */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                        Returned Books ({returnedBooks.length})
                      </Typography>
                      {returnedBooks.length === 0 ? (
                        <Typography sx={{ color: '#888888', textAlign: 'center', py: 4 }}>
                          You haven't returned any books yet.
                        </Typography>
                      ) : (
                        <Grid container spacing={2}>
                          {returnedBooks.map((borrow) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={borrow._id}>
                              <Card
                                sx={{
                                  background: 'rgba(20, 20, 30, 0.8)',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  borderRadius: 2,
                                }}
                              >
                                <CardContent>
                                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                    {borrow.book?.title || `Book ID: ${borrow.bookId}`}
                                  </Typography>
                                  {borrow.book && (
                                    <>
                                      {borrow.book.genres && borrow.book.genres.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                                          {borrow.book.genres.slice(0, 2).map((genre, index) => (
                                            <Chip
                                              key={index}
                                              label={genre}
                                              size="small"
                                              sx={{
                                                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                                                color: '#00d4ff',
                                                fontSize: '0.7rem',
                                                height: 20
                                              }}
                                            />
                                          ))}
                                        </Box>
                                      )}
                                    </>
                                  )}
                                  <Typography variant="body2" sx={{ color: '#888888', mb: 0.5 }}>
                                    Borrowed: {formatDate(borrow.createdAt)}
                                  </Typography>
                                  {borrow.returnedAt && (
                                    <Typography variant="body2" sx={{ color: '#888888', mb: 0.5 }}>
                                      Returned: {formatDate(borrow.returnedAt)}
                                    </Typography>
                                  )}
                                  {borrow.renew > 0 && (
                                    <Typography variant="body2" sx={{ color: '#888888' }}>
                                      Renewed {borrow.renew} time(s)
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* Delete Account Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              PaperProps={{
                sx: {
                  backgroundColor: 'rgba(10, 10, 10, 0.95)',
                  color: 'white',
                }
              }}
            >
              <DialogTitle sx={{ color: '#ff6b6b' }}>Delete Account</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: '#888888' }}>
                  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setDeleteDialogOpen(false)}
                  sx={{ color: '#888888' }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteAccount}
                  color="error"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: 'rgba(255, 69, 58, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 69, 58, 0.5)',
                    }
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}


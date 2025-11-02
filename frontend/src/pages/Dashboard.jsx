import * as React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  Grid,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [sections, setSections] = useState({
    popular: [],
    fiction: [],
    nonfiction: [],
    mystery: [],
    romance: [],
    scifi: [],
    recentlyAdded: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
      console.log("No token or user found, redirecting to login");
      navigate("/login");
      return;
    };

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("Token from localStorage:", token);
      console.log("User object:", user);
      
      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      const testRes = await axios.get("/api/books/search?limit=5", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Test request successful:", testRes.data);
      
      // Fetch books by different categories using your existing searchBooks endpoint
      const [popularRes, fictionRes, nonfictionRes, mysteryRes, romanceRes, scifiRes, recentRes] = await Promise.all([
        axios.get("/api/books/search?rating=4&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/books/search?genre=fiction&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/books/search?genre=nonfiction&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/books/search?genre=mystery&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/books/search?genre=romance&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/books/search?genre=sci-fi&limit=10", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/books/search?limit=10", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setSections({
        popular: popularRes.data.results || [],
        fiction: fictionRes.data.results || [],
        nonfiction: nonfictionRes.data.results || [],
        mystery: mysteryRes.data.results || [],
        romance: romanceRes.data.results || [],
        scifi: scifiRes.data.results || [],
        recentlyAdded: recentRes.data.results || []
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      };

    } finally {
      setLoading(false);
    }
  };

  const HorizontalScrollSection = ({ title, books, icon }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const scrollRef = React.useRef(null);

    const scroll = (direction) => {
      const container = scrollRef.current;
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    };

    if (!books || books.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h5" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            ml: 1
          }}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,212,255,0.5)',
                borderRadius: 4,
              },
            }}
          >
            {books.map((book) => (
              <Card
                key={book._id}
                onClick={() => navigate(`/books/${book._id}`)}
                sx={{
                  minWidth: 200,
                  background: 'rgba(26, 26, 46, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    border: '1px solid rgba(0, 212, 255, 0.5)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="280"
                  image={book.coverimg || '/placeholder-book.jpg'}
                  alt={book.title}
                  sx={{
                    objectFit: 'cover',
                    borderRadius: '8px 8px 0 0'
                  }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {book.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#888888',
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {book.author}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                    {book.genres?.slice(0, 2).map((genre, index) => (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ color: '#ffd700', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: '#888888' }}>
                        {book.rating || 'N/A'}
                      </Typography>
                    </Box>
                    <Chip
                      label={book.status === 'available' ? 'Available' : 'Borrowed'}
                      size="small"
                      color={book.status === 'available' ? 'success' : 'error'}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Scroll buttons */}
          <IconButton
            onClick={() => scroll('left')}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => scroll('right')}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              }
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography sx={{ color: 'white' }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            mb: 1
          }}>
            Welcome back, {user?.username || 'User'}
          </Typography>
          <Typography variant="h6" sx={{ color: '#888888' }}>
            Discover your next great read
          </Typography>
        </Box>

        {/* Horizontal Sections */}
        <HorizontalScrollSection
          title="Trending Now"
          books={sections.popular}
          icon={<TrendingUp sx={{ color: '#00d4ff', fontSize: 28 }} />}
        />

        <HorizontalScrollSection
          title="Recently Added"
          books={sections.recentlyAdded}
          icon={<Star sx={{ color: '#4caf50', fontSize: 28 }} />}
        />

        <HorizontalScrollSection
          title="Fiction"
          books={sections.fiction}
          icon={<Typography sx={{ color: '#64b5f6', fontSize: 28, fontWeight: 'bold' }}>📚</Typography>}
        />

        <HorizontalScrollSection
          title="Non-Fiction"
          books={sections.nonfiction}
          icon={<Typography sx={{ color: '#ff9800', fontSize: 28, fontWeight: 'bold' }}>📖</Typography>}
        />

        <HorizontalScrollSection
          title="Mystery & Thriller"
          books={sections.mystery}
          icon={<Typography sx={{ color: '#e91e63', fontSize: 28, fontWeight: 'bold' }}>🔍</Typography>}
        />

        <HorizontalScrollSection
          title="Romance"
          books={sections.romance}
          icon={<Typography sx={{ color: '#f44336', fontSize: 28, fontWeight: 'bold' }}>💕</Typography>}
        />

        <HorizontalScrollSection
          title="Sci-Fi & Fantasy"
          books={sections.scifi}
          icon={<Typography sx={{ color: '#9c27b0', fontSize: 28, fontWeight: 'bold' }}>🚀</Typography>}
        />
      </Box>
    </Box>
  );
}
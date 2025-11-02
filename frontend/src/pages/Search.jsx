import * as React from 'react';
import { 
  Box, 
  TextField, 
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
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  Star,
  FilterList
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Search({ user }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    'fiction',
    'nonfiction', 
    'mystery',
    'romance',
    'sci-fi',
    'fantasy',
    'adventure',
    'thriller',
    'horror',
    'historical',
    'biography',
    'science'
  ];

  const ratings = [
    { label: 'Any Rating', value: null },
    { label: '4+ Stars', value: 4 },
    { label: '3+ Stars', value: 3 },
    { label: '2+ Stars', value: 2 },
    { label: '1+ Stars', value: 1 }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token || !user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim() && selectedGenres.length === 0 && !selectedRating) {
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Build query parameters
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append('q', query.trim());
      }
      
      // For genres, we'll need to search with each selected genre
      // The backend uses regex, so we can try combining them or searching one at a time
      // For simplicity, let's search with the first selected genre
      if (selectedGenres.length > 0) {
        params.append('genre', selectedGenres[0]); // Backend supports one genre at a time
      }
      
      if (selectedRating !== null) {
        params.append('rating', selectedRating);
      }
      
      params.append('limit', '50'); // Get more results
      
      const res = await axios.get(`/api/books/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If multiple genres selected, we need to filter client-side
      let filteredResults = res.data.results || [];
      
      if (selectedGenres.length > 1) {
        filteredResults = filteredResults.filter(book => {
          return selectedGenres.some(genre => 
            book.genres?.some(g => 
              g.toLowerCase().includes(genre.toLowerCase())
            )
          );
        });
      }
      
      setResults(filteredResults);
    } catch (error) {
      console.error("Search failed:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? null : rating);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedRating(null);
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedRating !== null || searchQuery.trim() !== '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Google-like Search Box */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: { xs: 8, md: 12 },
            pb: 4
          }}
        >
          <Fade in timeout={800}>
            <Box sx={{ width: '100%', maxWidth: 600 }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'white',
                  fontWeight: 300,
                  textAlign: 'center',
                  mb: 4,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Library Search
              </Typography>
              
              {/* Search Input */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: 6,
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <SearchIcon sx={{ color: '#888888', mr: 2, ml: 1 }} />
                <TextField
                  fullWidth
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setSearchQuery('');
                            setResults([]);
                            setHasSearched(false);
                          }}
                          size="small"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '1.1rem',
                      color: '#000',
                    }
                  }}
                />
              </Paper>

              {/* Search Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => handleSearch()}
                  disabled={loading || (!searchQuery.trim() && selectedGenres.length === 0 && !selectedRating)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    backgroundColor: '#4285f4',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#357ae8',
                    },
                    '&:disabled': {
                      backgroundColor: '#cccccc',
                    }
                  }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterList />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Filters
                </Button>
              </Box>

              {/* Filter Panel */}
              {showFilters && (
                <Fade in={showFilters}>
                  <Paper
                    elevation={3}
                    sx={{
                      mt: 3,
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
                        Filters
                      </Typography>
                      {hasActiveFilters && (
                        <Button
                          onClick={clearFilters}
                          size="small"
                          sx={{ textTransform: 'none', color: '#4285f4' }}
                        >
                          Clear All
                        </Button>
                      )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Genre Filters */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
                        Genres
                      </Typography>
                      <Grid container spacing={1}>
                        {genres.map((genre) => (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={genre}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedGenres.includes(genre)}
                                  onChange={() => handleGenreChange(genre)}
                                  sx={{
                                    color: '#4285f4',
                                    '&.Mui-checked': {
                                      color: '#4285f4',
                                    }
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: '0.9rem', color: '#000', textTransform: 'capitalize' }}>
                                  {genre}
                                </Typography>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Rating Filters */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
                        Minimum Rating
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {ratings.map((rating) => (
                          <Button
                            key={rating.value || 'any'}
                            variant={selectedRating === rating.value ? "contained" : "outlined"}
                            onClick={() => handleRatingChange(rating.value)}
                            size="small"
                            sx={{
                              textTransform: 'none',
                              borderRadius: 2,
                              borderColor: '#4285f4',
                              color: selectedRating === rating.value ? 'white' : '#4285f4',
                              backgroundColor: selectedRating === rating.value ? '#4285f4' : 'transparent',
                              '&:hover': {
                                borderColor: '#357ae8',
                                backgroundColor: selectedRating === rating.value ? '#357ae8' : 'rgba(66, 133, 244, 0.1)',
                              }
                            }}
                          >
                            {rating.label}
                          </Button>
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          handleSearch();
                          setShowFilters(false);
                        }}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: '#4285f4',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#357ae8',
                          }
                        }}
                      >
                        Apply Filters
                      </Button>
                    </Box>
                  </Paper>
                </Fade>
              )}

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {selectedGenres.map((genre) => (
                    <Chip
                      key={genre}
                      label={genre}
                      onDelete={() => handleGenreChange(genre)}
                      size="small"
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        textTransform: 'capitalize'
                      }}
                    />
                  ))}
                  {selectedRating !== null && (
                    <Chip
                      label={`${selectedRating}+ Stars`}
                      onDelete={() => handleRatingChange(selectedRating)}
                      size="small"
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2'
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        </Box>

        {/* Search Results */}
        {hasSearched && (
          <Box sx={{ mt: 4 }}>
            {loading ? (
              <Typography sx={{ color: 'white', textAlign: 'center', py: 4 }}>
                Searching...
              </Typography>
            ) : results.length === 0 ? (
              <Typography sx={{ color: '#888888', textAlign: 'center', py: 4 }}>
                No books found. Try adjusting your search or filters.
              </Typography>
            ) : (
              <>
                <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </Typography>
                <Grid container spacing={3}>
                  {results.map((book) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book._id}>
                      <Card
                        sx={{
                          height: '100%',
                          background: 'rgba(26, 26, 46, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.03)',
                            border: '1px solid rgba(0, 212, 255, 0.5)',
                            boxShadow: '0 8px 24px rgba(0, 212, 255, 0.2)',
                          }
                        }}
                        onClick={() => navigate(`/books/${book._id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="300"
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
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {book.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                            {book.genres?.slice(0, 3).map((genre, index) => (
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
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ color: '#ffd700', fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2" sx={{ color: '#888888' }}>
                                {book.rating?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                            <Chip
                              label={book.status === 'available' ? 'Available' : 'Borrowed'}
                              size="small"
                              sx={{
                                backgroundColor: book.status === 'available' 
                                  ? 'rgba(76, 175, 80, 0.2)' 
                                  : 'rgba(244, 67, 54, 0.2)',
                                color: book.status === 'available' ? '#4caf50' : '#f44336',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}


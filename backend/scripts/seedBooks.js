//file to process all the books to the db

import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../src/models/Book.js';

dotenv.config();

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_db');
    console.log('✅ Connected to MongoDB');

    await Book.deleteMany({});
    console.log('🗑️  Cleared existing books');

    const books = [];

    // Read entire CSV first
    const stream = fs.createReadStream('../Book_Details.csv')
      .pipe(csv())
      .on('data', (row) => {
        books.push({
          title: row.book_title,
          coverimg: row.cover_image_uri,
          details: row.details,
          genres: row.genres ? row.genres.split(',').map(g => g.trim()) : [],
          rating: parseFloat(row.average_rating) || 0
        });
      });

    // Wait for stream to finish
    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    console.log(`📖 Read ${books.length} books from CSV`);

    // Insert all at once (fastest for large datasets)
    await Book.insertMany(books, { ordered: false });
    
    console.log(`✅ Successfully imported ${books.length} books!`);
    
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedBooks();
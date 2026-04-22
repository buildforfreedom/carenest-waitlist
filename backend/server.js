/**
 * CareNest Waitlist Backend
 * -------------------------
 * This is a lightweight Express server that securely handles waitlist form submissions.
 * Currently, it stores data in a local JSON file (`cloud_db_mock.json`) to simulate a cloud environment.
 * 
 * SECURITY FEATURES ENABLED:
 * 1. IP Rate Limiting (Prevents bot spam)
 * 2. Data Validation (Ensures email structure is correct)
 * 3. Exact Deduplication (Prevents the same email from registering twice)
 * 
 * FUTURE UPGRADE PATH:
 * To migrate to a live cloud database (like Supabase, Firebase, or MongoDB Atlas), 
 * simply replace the `fs.readFileSync` and `fs.writeFileSync` blocks below with your 
 * chosen database provider's insert/update functions.
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup file paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors()); // Allows frontend to communicate with this backend securely
app.use(express.json()); // Parses incoming JSON payloads from the frontend

/**
 * -------------------------
 * DATABASE INITIALIZATION
 * -------------------------
 */
const dbPath = path.join(__dirname, 'cloud_db_mock.json');

// Bootstraps the local JSON database file if it does not exist.
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ count: 142, waitlist: [] }));
}

/**
 * -------------------------
 * SECURITY: RATE LIMITING
 * -------------------------
 * Restricts a single IP address from submitting more than 3 waitlist entries 
 * inside a 10-minute trailing window to prevent DDOS / counter manipulation.
 */
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 3, 
  message: { error: 'Too many requests from this IP, please try again later to prevent spam.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * -------------------------
 * API ROUTES
 * -------------------------
 */

// GET /api/waitlist/count -> Returns the total number of people on the waitlist
app.get('/api/waitlist/count', (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json({ count: db.waitlist.length });
  } catch (error) {
    console.error("Failed to read DB:", error);
    res.status(500).json({ error: 'Database read error' });
  }
});

// POST /api/waitlist/submit -> Processes a new waitlist registration
app.post('/api/waitlist/submit', submitLimiter, (req, res) => {
  try {
    const { name, contact, questions } = req.body;
    
    // 1. Basic Field Validation
    if (!name || !contact || !questions) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    // 2. Email Regular Expression Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact)) {
      return res.status(400).json({ error: 'Please submit a valid email address.' });
    }

    // Connect to the DB
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // 3. Deduplication Constraint: Block identical emails
    if (db.waitlist.some(entry => entry.contact.toLowerCase() === contact.toLowerCase())) {
      return res.status(409).json({ error: 'This email is already on the waitlist! Thank you.' });
    }

    // 4. Record Generation
    const newEntry = { 
      name, 
      contact, 
      questions, 
      timestamp: new Date().toISOString(), 
      ip: req.ip // Useful for tracing bad actors later
    };
    
    // 5. Append and Commit Data
    db.waitlist.push(newEntry);
    db.count += 1;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    res.json({ success: true, count: db.waitlist.length });
  } catch (error) {
    console.error("Failed to write to DB:", error);
    res.status(500).json({ error: 'Database write error' });
  }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CareNest Backend running effectively on port ${PORT}`);
});

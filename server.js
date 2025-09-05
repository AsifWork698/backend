const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env locally

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ===== MongoDB Setup =====
const mongoURI = process.env.MONGO_URL; // Use Vercel env variable
const client = new MongoClient(mongoURI);
const dbName = 'passop';

let db;

// Connect once when server starts
async function connectDB() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectDB();

// ===== Routes =====

// Get all passwords
app.get('/', async (req, res) => {
    try {
        const collection = db.collection('passwords');
        const findResult = await collection.find({}).toArray();
        res.json(findResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Save a password
app.post('/', async (req, res) => {
    try {
        const password = req.body;
        const collection = db.collection('passwords');
        const result = await collection.insertOne(password);
        res.json({ success: true, result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a password
app.delete('/:id', async (req, res) => {
    try {
        const collection = db.collection('passwords');
        const result = await collection.deleteOne({ id: req.params.id });
        if (result.deletedCount === 1) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Edit a password
app.put('/:id', async (req, res) => {
    try {
        const collection = db.collection('passwords');
        const { id, ...updateData } = req.body;

        const result = await collection.updateOne(
            { id: req.params.id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Password not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ===== Start server =====
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

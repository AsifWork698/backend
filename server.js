const express = require('express')
const { MongoClient } = require('mongodb');
const bodyparser = require('body-parser')
const cors = require('cors')

// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'passop';


const app = express()
const port = 3000
app.use(cors())

const dotenv = require('dotenv');
app.use(bodyparser.json())
dotenv.config()

client.connect();

//Get all the Passwords
app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult)
})

//Save a Password
app.post('/', async (req, res) => {
    const password = req.body
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.insertOne(password)
    res.send({ success: true, result: findResult })
})

//Delete a Password
app.delete('/:id', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('passwords');
        const result = await collection.deleteOne({ id: req.params.id });
        if (result.deletedCount === 1) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: "Not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



// Edit password
app.put('/:id', async (req, res) => {
    try {
        const db = client.db(dbName);
        const collection = db.collection('passwords');

        console.log("---- EDIT REQUEST ----");
        console.log("req.params.id:", req.params.id);
        console.log("req.body:", req.body);

        const { id, ...updateData } = req.body;

        const result = await collection.updateOne(
            { id: req.params.id },   // find by id
            { $set: updateData }     // update everything except id
        );

        console.log("Mongo result:", result);

        if (result.matchedCount === 0) {
            console.log("No document matched for id:", req.params.id);
            return res.status(404).json({ success: false, message: "Password not found" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Error in PUT /:id:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
require("dotenv").config();
//App initialization
const app = express();



//Middleware
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//Connection to db
const user = process.env.MONGO_USERID
const pw = process.env.MONGO_PW

const uri = "mongodb+srv://"+ user+":"+pw+"@cluster0.51qps.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

//This retrieves all of the information
app.get('/api/getall', async (req, res) => {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const collection = client.db("sample_mflix").collection("snuggle board");

        // Fetch all entries from snuggle board
        const entries = await collection.find().toArray();

        // Send entries as JSON
        res.json(entries);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error retrieving entries from MongoDB");//Error handling
    } finally {
        await client.close();
    }
});

//This adds the entry to the snuggle board
app.post('/api/add', function (req, res) {
    const client = new MongoClient(uri);
    
    async function connectAndAdd() {
        try {
            await client.connect();
            const collection = client.db("sample_mflix").collection("snuggle board");
            
            const newEntry = { 
                username: req.body.username, 
                color: req.body.color, 
                breed: req.body.breed 
            };
            
            const result = await collection.insertOne(newEntry);

            res.redirect(`/success?id=${result.insertedId}`);
        } catch (e) {
            console.error(e);
            res.status(500).send("Error inserting data into MongoDB");//Error handling
        } finally {
            await client.close();
            console.log("Connection closed to MONGO");
        }
    }

    connectAndAdd();
});

//This fetches the entry based on the ID
app.get('/api/:id', async (req, res) => {
    const client = new MongoClient(uri);
    const id = req.query.id;

    try {
        await client.connect();
        const collection = client.db("sample_mflix").collection("snuggle board");

        const entry = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });

        if (entry) {
            res.render('editinfo', { entry: entry }); // Renders a page with entry information to edit
        } else {
            res.send("Entry not found.");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error retrieving data from MongoDB");//Error handling
    } finally {
        await client.close();
    }
});

//This updates the data related to the id
app.post('/api/update/:id', async (req, res) => {
    const client = new MongoClient(uri);
    const id = req.params.id;
    const updatedData = {
        username: req.body.username,
        color: req.body.color,
        breed: req.body.breed
    };

    try {
        await client.connect();
        const collection = client.db("sample_mflix").collection("snuggle board");

        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updatedData }
        );

        if (result.modifiedCount === 1) {
            res.redirect('/success_edit'); // Redirect to success_edit page after update
        } else {
            res.status(404).send("Entry not found or no changes made.");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error updating data in MongoDB");//Error handling
    } finally {
        await client.close();
    }
});

//This deletes the entry
app.post('/api/delete/:id', async (req, res) => {
    const client = new MongoClient(uri);
    const id = req.params.id;

    try {
        await client.connect();
        const collection = client.db("sample_mflix").collection("snuggle board");

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.redirect('/success_delete'); // Redirect to the delete page after deletion
        } else {
            res.status(404).send("Entry not found.");
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Error deleting data from MongoDB");//Error handling
    } finally {
        await client.close();
    }
});


// Route for the homepage
app.get('/', (req, res) => {
    res.render('index');
});

// Route for the registerpage
app.get('/register', (req, res) => {
    res.render('register');
});
// Route for the infopage
app.get('/myinfo', (req, res) => {
    res.render('myinfo');
});
//Route for the snuggle board
app.get('/snuggleboard', (req, res) => {
    const id = req.query.id;
    res.render('snuggleboard', { id: id });
});
//Route for the success page
app.get('/success', (req, res) => {
    const id = req.query.id;
    res.render('success', { id: id });
});
//Route for the success page when done editing
app.get('/success_edit', (req, res) => {
    const id = req.query.id;
    res.render('success_edit', { id: id });
});
//Route for the success page when done deleting
app.get('/success_delete', (req, res) => {
    const id = req.query.id;
    res.render('success_delete', { id: id });
});




//Error path

app.get("*", function (req, res) {
    res.send("Error! No such path.");
});

//Port config and startig the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log("The web app is listening on port %d", PORT);
});
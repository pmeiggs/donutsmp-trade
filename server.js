const express = require('express');
const admin = require('firebase-admin');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();

const cors = require('cors');
app.use(cors({
  origin: "https://pmeiggs.github.io", // Specifically allow your GitHub Pages
  credentials: true
}));

// 1. Firebase Initialization
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : require("./cred.json"); // Falls back to local file for dev

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "YOUR_FIREBASE_REALTIME_DATABASE_URL_HERE" // Paste your URL here
});

const db = admin.database();
const userRef = db.ref("/user");
const postRef = db.ref("/post");

// 2. Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For React JSON requests
app.use(session({
  secret: crypto.randomBytes(24).toString('hex'),
  resave: false,
  saveUninitialized: true
}));

// 3. Routes - Signup Logic (accidentify)
app.post('/accidentify', async (req, res) => {
    const { username, password, confirmpass, gender, age } = req.body;

    try {
        const snapshot = await userRef.get();
        const users = snapshot.val() || {};

        // Validation logic
        if (users[username]) {
            return res.status(400).json({ sameuserid: 'The username already exists' });
        }
        if (password.length < 7 || password.length > 15) {
            return res.status(400).json({ warnpass: 'Password must be 7-15 characters' });
        }
        if (password !== confirmpass) {
            return res.status(400).json({ notsamepass: 'Passwords do not match' });
        }

        // Set User
        await userRef.child(username).set({
            password: password,
        });

        res.status(200).send("Signup successful");
    } catch (error) {
        res.status(500).send("Database Error");
    }
});

// 4. Routes - Login Logic
app.post('/Login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const snapshot = await userRef.child(username).get();
        const userData = snapshot.val();

        if (!userData) {
            return res.status(404).json({ nouser: 'This username does not exist' });
        }

        if (userData.password === password) {
            req.session.loginuser = username;
            return res.status(200).json({ success: true, user: username });
        } else {
            return res.status(401).json({ wrongpass: 'Wrong password' });
        }
    } catch (error) {
        res.status(500).send("Login Error");
    }
});

// 5. Routes - Post Logic
app.post('/post', async (req, res) => {
    if (!req.session.loginuser) return res.status(403).send("Unauthorized");

    const { title, photo, content } = req.body; // Incoming data
    const date = new Date().toLocaleDateString();

    try {
        const snapshot = await postRef.get();
        const posts = snapshot.val() || {};
        
        const keys = Object.keys(posts);
        const lastKey = keys.length > 0 ? keys[keys.length - 1] : "a0";
        const nextId = "a" + (parseInt(lastKey.substring(1)) + 1);

        await postRef.child(nextId).set({
            Item: title,    // Changed 'item' to 'title' to match your req.body
            Datetime: date,
            Poster: req.session.loginuser,
            Photo: photo,
            Price: content
        });

        res.status(200).json({ success: true }); // Better for React than res.redirect
    } catch (error) {
        res.status(500).send("Posting Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
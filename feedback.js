const express = require('express');
const path = require('path');
const db = require('/Users/sid/DBMS_project/db.js');
const adminRoutes = require('./admin');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', adminRoutes);

app.post('/feedback', async (req, res) => {
    const { name, mobileNo, feedback } = req.body;

    try {
        await db.query(
            'INSERT INTO feedback (name, mobileNo, feedback) VALUES (?, ?, ?)',
            [name, mobileNo, feedback]
        );
        res.send('Feedback submitted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error occurred');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

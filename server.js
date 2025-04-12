const express = require('express');
const path = require('path');
const db = require('/Users/sid/DBMS_project/db.js');
const adminRoutes = require('./admin');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', adminRoutes);

app.post('/submit', async (req, res) => {
    const { name, mobileNo, complaint } = req.body;

    try {
        await db.query(
            'INSERT INTO form (name, mobileNo, complaint) VALUES (?, ?, ?)',
            [name, mobileNo, complaint]
        ); 

        const [result] = await db.query(
            'SELECT id FROM form WHERE name = ? ORDER BY id DESC LIMIT 1',
            [name]
        );

        if (result.length > 0) {
            res.json({ message: `Your Complaint ID is: ${result[0].id}` });
        } else {
            res.status(404).json({ message: 'No complaint found for the given name.' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Database error occurred');
    }
});

app.post('/track', async (req, res) => {
    const { id } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM form WHERE id = ?', [id]);

        if (rows.length > 0) {
            const messages = rows.map((row, index) => {
                return `Complaint ${index + 1}
------------------------
Name       : ${row.name}
Mobile No  : ${row.mobileNo}
Complaint  : ${row.complaint}
Status :     ${row.status}
Date       : ${new Date(row.created_at).toLocaleString()}`;
            }).join('\n\n');

            res.setHeader('Content-Type', 'text/plain');
            res.send(messages);
        } else {
            res.send('No complaint found with that ID');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching details');
    }
});

app.get('/home', async(req,res)=>{
    res.redirect('http://localhost:3000/home.html');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('http://localhost:3000/home.html');
});

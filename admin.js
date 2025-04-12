const express = require('express');
const router = express.Router();
const db = require('./db');


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM admin WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.send('Recall your Username and Password.');
        }

        res.redirect('/complaints');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


router.get('/complaints', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM form ORDER BY created_at DESC');

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>All Complaints</title>
                <style>
                    body { font-family: Arial; background: #f9f9f9; padding: 20px; }
                    .complaint {
                        background: white; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        padding: 20px; margin-bottom: 20px;
                    }
                    h1 { text-align: center; }
                    form { margin-top: 10px; }
                    label, select, input[type=submit] {
                        display: block; margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <h1>All Complaints</h1>
        `;

        rows.forEach((row, index) => {
            html += `
                <div class="complaint">
                    <p><strong>Complaint ${index + 1}</strong></p>
                    <p><strong>Name:</strong> ${row.name}</p>
                    <p><strong>Mobile No:</strong> ${row.mobileNo}</p>
                    <p><strong>Complaint:</strong> ${row.complaint}</p>
                    <p><strong>Status:</strong> ${row.status}</p>
                    <p><strong>Date:</strong> ${new Date(row.created_at).toLocaleString()}</p>

                    <form action="/update-status" method="POST">
                        <input type="hidden" name="id" value="${row.id}">
                        <label for="status">Change Status:</label>
                        <select name="status">
                            <option value="Pending" ${row.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${row.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Resolved" ${row.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                        <input type="submit" value="Update Status">
                    </form>
                </div>
            `;
        });

        html += `</body></html>`;
        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch complaints');
    }
});


router.post('/update-status', async (req, res) => {
    const { id, status } = req.body;

    try {
        await db.query('UPDATE form SET status = ? WHERE id = ?', [status, id]);
        res.redirect('/complaints');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update status');
    }
});


router.get('/lookfeedback', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM feedback ORDER BY created_at DESC');

        const messages = rows.map((row, index) => {
            return `Feedback ${index + 1}:
Name: ${row.name}
Mobile No: ${row.mobileNo}
Feedback: ${row.feedback}
Date: ${new Date(row.created_at).toLocaleString()}

------------------------`;
        }).join('\n\n');

        res.setHeader('Content-Type', 'text/plain'); 
        res.send(messages);

    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch feedback');
    }
});


router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        await db.query(
            'INSERT INTO admin (username, password) VALUES (?, ?)',
            [username, password]
        );
        res.redirect('/login.html');
    } catch (err) {
        console.error(err);
        res.status(400).send('You already exist.');
    }
});

module.exports = router;

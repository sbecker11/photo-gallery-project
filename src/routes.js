import express from 'express';

export const mainRouter = express.Router();

// Define your routes here
mainRouter.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// You can add more routes as needed
mainRouter.get('/api/some-endpoint', (req, res) => {
    res.json({ message: 'This is an API endpoint' });
});
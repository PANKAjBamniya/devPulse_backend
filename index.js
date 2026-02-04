const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// test route
app.get('/', (req, res) => {
    res.send('Backend working');
});

// routes
app.use('/api/linkedin', require("./routes/auth.route"));


connectDB();

app.listen(port, () => {
    console.log('Server running on port:', port);
});

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());

connectDB();

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

// require("./cron/test.cron")
require("./cron/schedule.cron")

// auth routes
app.use('/api/linkedin', require("./routes/auth.route"));

// category routers
app.use('/api/category', require("./routes/category.route"))

// Schedule routers
app.use('/api/schedule', require("./routes/schedule.route"))

// Post
app.use("/api/posts", require("./routes/post.route"))

app.listen(port, () => {
    console.log('Server running on port:', port);
});

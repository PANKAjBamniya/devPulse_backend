require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require("express-session");
const errorHandler = require('./middlewares/errorHandler');


const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());

connectDB();

const allowedOrigins = [
    "http://localhost:5173",
    "https://dev-pulse-frontend-flax.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS: " + origin));
            }
        },
        credentials: true,
    })
);


app.use(
    session({
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);


// test route
app.get('/', (req, res) => {
    res.json({
        msg: "Dev_pulse Working",
        err: {}
    });
});


// require("./cron/test.cron")
// require("./cron/schedule.cron")

// Linkedin auth routes
app.use('/api/auth', require("./routes/auth.route"));

// Linkedin auth routes
app.use('/api/linkedin', require("./routes/linkedin.route"));

// Linkedin auth routes
app.use('/api/twitter', require("./routes/twitter.route"));

// Face-book route
app.use('/api/facebook', require("./routes/category.route"))

// category routers
app.use('/api/category', require("./routes/category.route"))

// Schedule routers
app.use('/api/schedule', require("./routes/schedule.route"))

// Post
app.use("/api/posts", require("./routes/post.route"))


app.use(errorHandler);

app.listen(port, () => {
    console.log('Server running on port:', port);
});

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const authRouter = require('./Routers/authroute');
const eventRouter = require('./Routers/Eventroute');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Models/User');
const auth = require('./Middleware/auth');
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
})
const PORT = process.env.PORT || 4000;
app.use(authRouter);
app.use(eventRouter);
app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});

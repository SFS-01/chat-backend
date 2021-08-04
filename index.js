require('dotenv').config(); // Sets up dotenv as soon as our application starts
const path = require('path');

global.helpers = require('./misc/helpers');
global.moment = require('moment');
global.app_root = path.resolve(__dirname);

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const routes = require('./routes/index.js');
const handleErrors = require('./middleware/handleErrors');
const cors = require('cors')

const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

const router = express.Router();
app.use('/api/v1', routes(router));

const environment = process.env.NODE_ENV; // development
if (environment !== 'production') {
    app.use(logger('dev'));
}
const config = require('./config/config')[environment];

app.use(handleErrors);

/** START SOCKETS */

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
    },
});

io.use((socket, next) => {
    const user = socket.handshake.auth.user;
    if (!user.id) {
        return next(new Error("invalid user"));
    }

    socket.user_id = user.id;
    socket.username = user.username;
    socket.email = user.email;
    socket.firstname = user.firstname;
    socket.lastname = user.lastname;

    next();
});

io.on("connection", (socket) => {
    // fetch existing users
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            userSocketID: id,
            userID: socket.user_id,
            username: socket.username,
            email: socket.email,
            firstname: socket.firstname,
            lastname: socket.lastname
        });
    }
    socket.emit("users", users);

    // notify existing users
    socket.broadcast.emit("user connected", {
        userSocketID: socket.id,
        userID: socket.user_id,
        username: socket.username,
        email: socket.email,
        firstname: socket.firstname,
        lastname: socket.lastname
    });

    // forward the private message to the right recipient
    socket.on("private message", ({ content, to }) => {
        socket.to(to).emit("private message", {
            content,
            from: socket.id,
        });
    });

    // notify users upon disconnection
    socket.on("disconnect", () => {
        socket.broadcast.emit("user disconnected", socket.id);
    });
});

/** END SOCKETS */

server.listen(`${config.apiPort}`, () => {
    console.log(`Server now listening at localhost:${config.apiPort}`);
});

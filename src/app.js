const express =  require('express');

// connect to db
require('./db/mongoose');

// Routers require
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());

// using user and task router
app.use(userRouter);
app.use(taskRouter);

// index page route
app.get('/', (req, res)=>{
    res.send('<p>created by:</p> <strong> Mahmoud Ezz </strong> <p>github repo:</p> <a href="https://github.com/MahmoudEzz/nodejs-task-manager-api"> Link </a>')
})
// 404 route 
app.get('*', (req, res)=>{
    res.status(404).send('404 Page not found');
})

module.exports = app;


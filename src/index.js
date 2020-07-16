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

app.listen(port, ()=>{
    console.log('Server is listening on port :'+ port);
})


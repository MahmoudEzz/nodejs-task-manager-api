const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const {userOne, userTwo, setupDataBase, taskOne, taskTwo, taskThree} = require('./fixtures/db');

beforeEach(setupDataBase);

test('Should create task for user', async ()=>{
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "test for task api",
	        completed: true
        }).expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(true);
})

test('Should get all tasks for user one', async ()=>{
    const response = await request(app).get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toEqual(2);
})

test('Should not delete other user task', async ()=>{
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);
    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
})

test('Should not create task with invalid description', async ()=>{
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "",
        }).expect(400);
})

test('Should not create task with invalid description', async ()=>{
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: "ss",
        }).expect(400);
})

test('Should not update task with invalid description', async ()=>{
    const response = await request(app).patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "",
        }).expect(400);
})

test('Should not update task with invalid description', async ()=>{
    const response = await request(app).patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: "ss",
        }).expect(400);
})

test('Should delete user task', async ()=>{
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
})

test('Should not delete task if unauthenticated', async ()=>{
    await request(app).delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `invalid token`)
        .send()
        .expect(401);
})

test('Should not update other user task', async ()=>{
    await request(app).patch(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: "updated"
        })
        .expect(404);
})

test('Should fetch user task by id', async ()=>{
    await request(app).get(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not fetch user task by id if unauthenticated', async ()=>{
    await request(app).get(`/tasks/${taskTwo._id}`)
        .set('Authorization', `invalid token`)
        .send()
        .expect(401);
})

test('Should not fetch other users task by id', async ()=>{
    await request(app).get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404);
})

test('Should fetch only completed tasks', async ()=>{
    const response = await request(app).get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body[0].completed).toEqual(true);
})

test('Should fetch only incomplete tasks', async ()=>{
    const response = await request(app).get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body[0].completed).toEqual(false);
})
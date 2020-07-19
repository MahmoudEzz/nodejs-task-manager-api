const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const {userOne, userOneId, setupDataBase} = require('./fixtures/db');

beforeEach(setupDataBase);

test('create new user', async ()=>{
    const response = await request(app).post('/users').send({
        name: 'mahmoud',
        email: 'user@user.com',
        password: '12345678',
        age: 27
    }).expect(201);

    // Assert that db changed sucessfully
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assert for a specific object (user) -> response
    expect(response.body).toMatchObject({
        user: {
            name: 'mahmoud',
            email: 'user@user.com'
        },
        token: user.tokens[0].token
    });

    // Assert if password is hashed
    expect(user.password).not.toBe('12345678')
})

test('Login user', async ()=>{
    const response = await request(app).post('/users/login').send({
        "email": userOne.email,
        "password": userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
})

test('Should not login a nonexistence user', async ()=>{
    await request(app).post('/users/login').send({
        email: 'email@email.com',
        password: '111111111'
    }).expect(400);
})

test('Should get his own profile', async ()=>{
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not get profile for not authenticated users', async ()=>{
    await request(app).get('/users/me')
        .set('Authorization', `some not working token`)
        .send()
        .expect(401);
})

test('Should delete account for user', async ()=>{
    const response = await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete account for unauthorized user', async ()=>{
    await request(app).delete('/users/me')
        .set('Authorization', 'some not working token')
        .send()
        .expect(401);
})

test('Should upload avatar image', async ()=>{
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
})

test('Should update valid user fields', async ()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'name Changed'
        }).expect(200);
    const user = await User.findById(userOneId);
    expect(user.name).toBe('name Changed');
})

test('Should not update invalid user fields', async ()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Mahalla'
        }).expect(400);
})

test ('Should not signup user with invalid name', async ()=>{
    await request(app).post('/users')
        .send({
            name: ''
        }).expect(400);
})

test ('Should not signup user with invalid email', async ()=>{
    await request(app).post('/users')
        .send({
            email: 'email.com'
        }).expect(400);
})

test ('Should not signup user with invalid password', async ()=>{
    await request(app).post('/users')
        .send({
            password: 'short'
        }).expect(400);
})

test('Should not update user if unauthenticated', async ()=>{
    await request(app).patch('/users/me')
        .set('Authorization', 'not valid token')
        .send({
            name: 'new name'
        }).expect(401);
})

test ('Should not update user with invalid name', async ()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: ''
        }).expect(400);
})

test ('Should not update user with invalid email', async ()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'email.com'
        }).expect(400);
})

test ('Should not update user with invalid password', async ()=>{
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            password: 'short'
        }).expect(400);
})

test('Should not delete user if unauthenticated', async ()=>{
    await request(app).delete('/users/me')
        .set('Authorization', 'not valid token')
        .send()
        .expect(401);
})
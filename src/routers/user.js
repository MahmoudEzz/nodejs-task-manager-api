const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = express.Router();

// Login router
router.post('/users/login', async (req, res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
        
    } catch (e) {
        res.status(400).send();
    }
})
router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=> token.token !== req.token );
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
})
router.post('/users/logoutAll', auth, async (req, res)=>{
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

// CRUD routes
router.post('/users', async (req, res)=>{
    const user = new User(req.body);
    
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();

        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
})

router.get('/users/me', auth, async (req,res)=>{
    
    res.send(req.user);
    
})

router.patch('/users/me', auth, async (req, res)=>{
    
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));

    if (!isValidOperation){
        return res.status(400).send({error: "invalid updates!"});
    }

    try {
        
        updates.forEach((update)=> req.user[update] = req.body[update]);
        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req, res)=>{
    
    try{
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
})

// config a save directory for files upload
const upload = multer({ 
    // dest: 'avatars', 
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)/)){
            return cb(new Error('Please provide an image file'));
        }
        cb(null, true);
    }

});
// Upload an avatar for the user
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;

    try {
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
}, (error, req, res, next)=>{
    res.status(400).send({ error: error.message });
})
// delete user avatar
router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined;
    try {
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})
// get user avatar
router.get('/users/:id/avatar', async(req, res)=>{
    try {
        const user = await User.findById(req.params.id);
        console.log(user);
        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
})



module.exports = router;
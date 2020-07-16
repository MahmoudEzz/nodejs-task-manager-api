const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Not a valid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Not valid, contains password');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a postive number');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// virtual field def for reverse relation with task collection
userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Instance method (user object)
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

    user.tokens.push({token});
    await user.save();

    return token;
}

userSchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

// Model method (static)
userSchema.statics.findByCredentials = async (email, password)=>{
    
    const user = await User.findOne({email});
    if(!user){
        throw new Error("Unable to connect");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
        throw new Error("Unable to connect");
    }
    
    return user;
}

// Hash plain text before saving Model middleware for create and update user
userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    
    next();
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next){
    const user = this;

    await Task.deleteMany({ owner: user._id });
})

const User = mongoose.model('User', userSchema);

module.exports = User;
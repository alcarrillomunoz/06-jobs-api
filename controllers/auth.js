const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');      // because of index, no need to specify bad-request file 
// const bcrypt = require('bcryptjs');  ----> no longer necessary, since this is done in model now
// const jwt = require('jsonwebtoken'); ----> no longer necessary, since this is done in model now

const register = async (req, res) => {
    //this is optional, error functionality is still there with mongoose validators
    // const { name, email, password } = req.body;
    // if (!name || !email || !password) {
    //     throw new BadRequestError('Please provide a name, email, and password');
    // }
    //this is now taken care of in User model, through UserSchema 
    // const { name, email, password } = req.body;

    // // genSalt method generates random bytes
    // const salt = await bcrypt.genSalt(10); 
    // //hash method provides hashed password based on salt value 
    // const hashedPassword = await bcrypt.hash(password,salt);
    // console.log(hashedPassword);

    // const tempUser = { name, email, password:hashedPassword};
    
    const user = await User.create({...req.body});      //user created using UserSchema in models (user)
    // token created ---> no longer used here, created in model
    // const token = jwt.sign({ userId:user._id, name:user.name }, 'jwtSecret', { expiresIn: '30d'})

    // token now created in User model 
    const token = user.createJWT(); 
    res.status(StatusCodes.CREATED).json({ user:{ name: user.name }, token }); 
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        throw new BadRequestError('Please provide an email and password')
    }
    const user = await User.findOne({ email }); 

    if(!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    // compare password
    const isPasswordCorrect  = await user.comparePassword(password);
    
    if (isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = { register, login }
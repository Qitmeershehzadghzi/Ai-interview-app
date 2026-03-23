const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/tokenblacklist.modal.js");
/**
 * @name registerUserController
 * @descrption register a new user  exprects userName,email and password in req.body
 * @access Public
 */


async function registerUserController(req,res){
const {userName,email,password} = req.body;
if(!userName || !email || !password){
    res.status(400).json({
        message:"please provide userName,email or password"
    })
}
const isExist = await userModel.findOne({
    $or:[{userName},{email}]
})
if(isExist){
    res.status(401).json({
        message:'userName or email already exist'
    })
}
const hash =await bcrypt.hash(password,10)
const user =await userModel.create({
    userName,
    email,
    password:hash
})
const token = jwt.sign(
    {
    id:user._id,userName:user.userName
},process.env.JWT_SECRET
,{expiresIn:'1d'}
)
res.cookie('token',token)
res.status(201).json({
    message:'user register successfully',
    user:{
        id:user._id,
        userName:user.userName,
        email:user.email
    }
})
}
/**
 * @name loginUserController
 * @descrption login a user  exprects email and password in req.body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: 'invalid email or password'
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return res.status(404).json({
            message: 'invalid email or password'
        });
    }

    const token = jwt.sign(
        {
            id: user._id,
            userName: user.userName
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie('token', token);

    res.status(200).json({
        message: 'user login successfully',
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        }
    });
}
/**
 * @name logoutUserController
 * @descrption logout a user by clearing the token cookie
 * @access Public
 */
async function logoutUserController(req,res){
const token = req.cookies.token;
if(token){
    await tokenBlacklistModel.create({token})

}
res.clearCookie('token')
res.status(200).json({
    message:'user logout successfully'
})

}

/**
 * @name getMeController
 * @descrption get user details of logged in user.  exprects token in cookie
 * @access Public
 */
async function getMeController(req,res){
const user =await userModel.findById(req.user.id)
res.status(201).json({
    message:'user details fetched successfully',
    user:{
        id:user._id,
        userName:user.userName,
        email:user.email
    }
})
}


module.exports ={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
import expres from 'express';
const authRouter =expres.Router();
import authMiddleware from '../middleware/auth.middleware.js';
import authController from '../controller/auth.controller.js'
/**
 * @route POST /api/auth/register
    * @desc Register a new user
    * @access Public
*/
authRouter.post('/register',authController.registerUserController)
/**
 * @route POST /api/auth/login
    * @desc Login a user
    * @access Public
*/
authRouter.post('/login',authController.loginUserController)
/**
 * @route POST /api/auth/logout
    * @desc clear cookie to logout a user
    * @access Public
*/
authRouter.post('/logout',authController.logoutUserController)
/**
 * @route POST /api/auth/get-me
    * @desc get user details of logged in user exprects token in cookie
    * @access Private
*/
authRouter.get('/get-me',authMiddleware.authUser,authController.getMeController)

export default authRouter;
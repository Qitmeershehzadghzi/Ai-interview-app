const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/tokenblacklist.modal.js");

/**
 * @name registerUserController
 * @description Register a new user; expects userName, email, password in req.body
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({ message: "Please provide userName, email, and password" });
        }

        const isExist = await userModel.findOne({ $or: [{ userName }, { email }] });
        if (isExist) {
            return res.status(409).json({ message: "userName or email already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({ userName, email, password: hash });

        const token = jwt.sign({ id: user._id, userName: user.userName }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });

        return res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, userName: user.userName, email: user.email }
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: error.message });
    }
}

/**
 * @name loginUserController
 * @description Login a user; expects email and password in req.body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "Invalid email or password" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(404).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, userName: user.userName }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true });

        return res.status(200).json({
            message: "User logged in successfully",
            user: { id: user._id, userName: user.userName, email: user.email }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: error.message });
    }
}

/**
 * @name logoutUserController
 * @description Logout a user by blacklisting token and clearing cookie
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;
        if (token) await tokenBlacklistModel.create({ token });

        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: error.message });
    }
}

/**
 * @name getMeController
 * @description Get logged-in user details; expects token in cookie
 * @access Private
 */
async function getMeController(req, res) {
    try {
        if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({
            message: "User details fetched successfully",
            user: { id: user._id, userName: user.userName, email: user.email }
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };
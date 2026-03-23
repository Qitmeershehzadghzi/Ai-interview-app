const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/tokenblacklist.modal.js");

async function authUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Token not provided" });

    const isBlacklisted = await tokenBlacklistModel.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ message: "Token is invalid" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, userName: decoded.userName };
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = { authUser };
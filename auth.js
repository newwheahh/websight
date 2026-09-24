const jwt = require("jsonwebtoken");

const User = require("../models/User");

async function auth(req, res, next) {

    try {

        const header =
            req.headers.authorization;


        if (!header) {

            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });

        }


        const token =
            header.startsWith("Bearer ")
                ? header.substring(7)
                : header;


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        const user =
            await User.findById(
                decoded.userId
            ).select("-password");


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found"
            });

        }


        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }

}


module.exports = auth;
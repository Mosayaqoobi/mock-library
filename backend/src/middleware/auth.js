//middleware to verify the jwt token and protect routes
//users with authorized jwt tokens can access the routes with this function

import User from "../models/User.js";
import jwt from "jsonwebtoken";

//sits between the route and the handler
export const protect = async (req, res, next)  => {

    let token;
    //checks if the response from the user has Bearer in the header
    if (req.headers.authorization && req.headers.authorization.toLowerCase().startsWith("bearer")) {
        try {
            //extracts the token
            token = req.headers.authorization.split(" ")[1];

            //checks if the token is valid
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            //finds the user by id (excludes the password) and attaches it to the response that we send from backend
            req.user = await User.findById(decoded.id).select("-password");

            return next();
            
        //handles invalid tokens
        } catch (error) {
            console.error("token error verification failed", error);
            return res.status(401).json({message: "not authorized, token failed"})
        }
    }
    return res.status(401).json({message: "not authorized, token failed"})
}
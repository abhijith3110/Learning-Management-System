import jwt from 'jsonwebtoken';
import httpError from '../utils/httpError.js';

const JWT_SECRET = process.env.JWT_SECRET || "2#2!2*2@";

export const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return next(new httpError("Authentication token required", 401)); 

    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {

            console.log("Token verification failed", err);
            return next(new httpError("Invalid or expired token", 401)); 
        }

        req.admin = decoded; 
        console.log("Token verified successfully, proceeding");
        next(); 

    });
    
};

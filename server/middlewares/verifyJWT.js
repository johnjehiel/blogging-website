import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // ["bearer", "token"]
    if (token == null) {
        return res.status(401).json({ "error": "No access Token"});
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ "error": "Access Token is Invalid"});
        }
        req.user = user.id;
        next(); // continue the parent callback
    });
}
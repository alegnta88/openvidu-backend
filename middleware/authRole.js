const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function authRole(allowedRoles) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Token missing" });

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ error: "Access denied" });
            }
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    };
}

module.exports = authRole;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            code: 401,
            message: 'No token provided or invalid format',
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'error',
                code: 403,
                message: 'Invalid or expired token',
            });
        }

        req.user = user; // Attach decoded user data to the request object
        next();
    });
};

export default authenticateToken;

import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
dotenv.config();

export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }
  next();
};

export const createSessionMiddleware = (mongoUrl) => {
  return session({
    secret: process.env.SESSION_SECRET || 'a-secret-for-testing',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: mongoUrl
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    }
  });
}

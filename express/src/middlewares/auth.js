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

export const sessionMiddleware =  session({
      secret:process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        mongoUrl: process.env.MONGO_URI
      }),
      cookie: {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
      }})
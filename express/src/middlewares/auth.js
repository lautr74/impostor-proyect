import session from 'express-session';


export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }
  next();
};

export const sessionMiddleware =  session({
      secret:process.env.SESSION_SECRET || '4321542635JKLEDHFSJ54636',
      resave: false,
      saveUninitialized: false,
      cookie: {
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
      }})
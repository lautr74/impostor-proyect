import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt"

export const register = async (req, res) => {    
    const { usuario, email, password } = req.body;

    if(!usuario || !email || !password){
        return res.status(400).json({ mensaje: "Faltan datos"})
    }

    try{
    const existe = await Usuario.findOne({ usuario });
    if(existe){
        return res.status(400).json({ mensaje: "El usuario ya existe" })
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const nuevoUsuario = new Usuario({usuario, email, password: hashedPassword });
    await nuevoUsuario.save();

    req.session.userId = nuevoUsuario._id;
    req.session.usuario = nuevoUsuario.usuario;
    res.json({ 
      mensaje: 'Usuario registrado',
      usuario: { usuario: nuevoUsuario.usuario }
    });

    } catch (err){
        console.error(err);
        res.status(500).json({ mensaje: 'Error al registrar usuario'})
    }
    };

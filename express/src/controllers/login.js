import Usuario from "../models/Usuario.js";
import bcrypt from 'bcrypt'

 export const login = async (req, res) => {
    const {usuario, password} = req.body;
    if( !usuario || !password ){
        return res.status(400).json({mensaje: "falta uno de los campos"});
    };


    try{
    const existe = await Usuario.findOne({ usuario });

    if(!existe){
        return res.status(404).json({mensaje: "Lo sentimos, es usuario no existe"});
    }
    
    const valido = await bcrypt.compare(password, existe.password);

    if(!valido){
        return res.status(401).json({mensaje: "Contrasena incorrecta"})
    }

    req.session.userId = existe._id;
    req.session.usuario = existe.usuario;

    res.json({ 
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: existe._id,
                usuario: existe.usuario,
                email: existe.email
            }
        });
    } catch(err){
        console.error('Error de login', err);
        res.status(500).send('Error del servidor');
    }
}


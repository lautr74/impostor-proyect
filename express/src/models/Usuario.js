import mongoose from "mongoose";

const esquemaUsuario = new mongoose.Schema({
    usuario: { type: String, required: true, unique: true },
    email: { type: String, required: true},
    password: {type: String, required: true}
})

const Usuario = mongoose.model('Usuario', esquemaUsuario)


export default Usuario 
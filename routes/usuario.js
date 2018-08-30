const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion');

const Usuario = require('./../models/usuario');
// =====================================
// Obtener todos los usuarios 
// =====================================
app.get('/', (req, res) => {
    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuarios
            });
        });
});

// =====================================
// Verificar token 
// =====================================

/*app.use('/', (req, res, next) => {
    const { token } = req.query;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        next();
    });
});*/

// =====================================
// Actualizar usuario 
// =====================================
app.put('/:id', verificaToken, (req, res) => {
    const { id } = req.params;
    const { nombre, email, role } = req.body;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(500).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = nombre;
        usuario.email = email;
        usuario.role = role;
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            })
        });
    });
});

// =====================================
// Crear un nuevo usuario 
// =====================================
app.post('/', verificaToken, (req, res) => {
    const { nombre, email, password, img, role } = req.body;
    const usuario = new Usuario({
        nombre,
        email,
        password: bcrypt.hashSync(password, 10),
        img,
        role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
        });
    });
});

// =====================================
// Borrar un usuario por id 
// =====================================
app.delete('/:id', verificaToken, (req, res) => {
    const { id } = req.params;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;
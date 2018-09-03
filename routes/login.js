const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { SEED, DURATION, CLIENT_ID } = require('./../config');

const app = express();
const Usuario = require('./../models/usuario');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =====================================
// Autenticacion y generacion de JWT
// =====================================
app.post('/', (req, res) => {
    const { email, password } = req.body;
    Usuario.findOne({ email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });

        }
        //Crear un token!!!
        usuarioDB.password = ':)';
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: DURATION });
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB._id
        });
    });
});

// =====================================
// Autenticacion y generacion de JWT
// por google
// =====================================
app.post('/google', async(req, res) => {
    const { token } = req.body;

    try {
        const googleUser = await verify(token);
        Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Debe usar su autenticación normal'
                        }
                    })
                } else {
                    const token = jwt.sign({
                        usuario: usuarioDB
                    }, SEED, { expiresIn: DURATION });

                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token,
                        id: usuarioDB._id,
                    });
                }
            } else {
                //Si el usuario no existe en nuestra base de datos
                const usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = googleUser.google;
                usuario.password = ':)';

                usuario.save((err, usuarioDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    const token = jwt.sign({
                        usuario: usuarioDB
                    }, SEED, { expiresIn: DURATION });

                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token,
                        id: usuarioDB._id,
                    });
                });
            }
        });
    } catch (err) {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido',
        });
    }


    /*return res.status(200).json({
        ok: true,
        mensaje: 'ok!!!',
        googleUser
    });*/
});



async function verify(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    return {
        nombre: name,
        email,
        img: picture,
        google: true
    };
}


module.exports = app;
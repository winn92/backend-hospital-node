const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');

const Medico = require('./../models/medico');

// =====================================
// Obtener todos los medicos 
// =====================================
app.get('/', (req, res) => {
    const desde = Number(req.query.desde) || 0;
    const limit = Number(req.query.limit) || 5;
    Medico.find({})
        .skip(desde)
        .limit(limit)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar medicos',
                    errors: err
                });
            }
            Medico.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            })
        });
});

// =====================================
// Actualizar medico 
// =====================================
app.put('/:id', verificaToken, (req, res) => {

    const { usuario, params, body } = req;
    const { id } = params;
    const { nombre, hospital } = body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!Medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = nombre;
        medico.hospital = hospital;
        medico.usuario = usuario._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            })
        });
    });
});

// =====================================
// Crear un nuevo medico 
// =====================================
app.post('/', verificaToken, (req, res) => {
    const { usuario, body } = req;
    const { nombre, hospital } = body;
    const medico = new Medico({
        nombre,
        hospital,
        usuario: usuario._id
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });
    });
});

// =====================================
// Borrar un medico por id 
// =====================================
app.delete('/:id', verificaToken, (req, res) => {
    const { id } = req.params;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;
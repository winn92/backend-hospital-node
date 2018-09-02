const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');

const Hospital = require('./../models/hospital');
// =====================================
// Obtener todos los hospitales 
// =====================================
app.get('/', (req, res) => {
    const desde = Number(req.query.desde) || 0;
    const limit = Number(req.query.limit) || 5;
    Hospital.find({})
        .skip(desde)
        .limit(limit)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar hospitales',
                    errors: err
                });
            }
            Hospital.countDocuments({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo,
                });
            });

        });
});

// =====================================
// Actualizar hospital 
// =====================================
app.put('/:id', verificaToken, (req, res) => {
    const { usuario, params, body } = req;
    const { id } = params;
    const { nombre } = body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = nombre;
        hospital.usuario = usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            })
        });
    });
});

// =====================================
// Crear un nuevo hospital 
// =====================================
app.post('/', verificaToken, (req, res) => {
    const { usuario } = req;
    const { nombre } = req.body;
    const hospital = new Hospital({
        nombre,
        usuario: usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });
    });
});

// =====================================
// Borrar un hospital por id 
// =====================================
app.delete('/:id', verificaToken, (req, res) => {
    const { id } = req.params;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;
const express = require('express');
const app = express();
const Hospital = require('./../models/hospital');
const Medico = require('./../models/medico');
const Usuario = require('./../models/usuario');

// ==========================================
// Busqueda por coleccion
// ==========================================
app.get('/coleccion/:tabla/:busqueda', async(req, res) => {
    const { busqueda, tabla } = req.params;
    const regex = new RegExp(busqueda, 'i');
    try {
        switch (tabla) {
            case 'usuarios':
                const usuarios = await buscarUsuarios(regex);
                return res.status(200).json({ usuarios });
            case 'medicos':
                const medicos = await buscarMedicos(regex);
                return res.status(200).json({ medicos });
            case 'hospitales':
                const hospitales = await buscarHospitales(regex);
                return res.status(200).json({ hospitales });
            default:
                res.status(400).json({
                    ok: false,
                    mensaje: 'Los tipos de búsqueda sólo sonÑ usuarios, medicos y hospital',
                    error: { message: 'Tipo de tabla/coleccion no valido' }
                });
        }
    } catch (err) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar datos',
            errors: err
        });
    }
});

// ==========================================
// Busqueda general
// ==========================================

app.get('/todo/:busqueda', async(req, res) => {
    const { busqueda } = req.params;
    const regex = new RegExp(busqueda, 'i');
    try {
        const hospitales = await buscarHospitales(regex);
        const medicos = await buscarMedicos(regex);
        const usuarios = await buscarUsuarios(regex);
        res.status(200).json({ hospitales, medicos, usuarios });
    } catch (err) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar datos',
            errors: err
        });
    }
});

const buscarHospitales = (regex) => {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

const buscarMedicos = (regex) => {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

const buscarUsuarios = (regex) => {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec({ nombre: regex }, (err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;
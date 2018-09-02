const Hospital = require('./../models/hospital');
const Medico = require('./../models/medico');
const Usuario = require('./../models/usuario');

// =========================================================
// Valida /upload/:tipo/:id e inyecta modelo que corresponda 
// =========================================================
exports.verificaTipoUpload = async(req, res, next) => {
    const { tipo, id } = req.params;
    // tipos de colección
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válido',
            errors: { message: 'Tipo de coleccion no es válido' }
        });
    }

    try {
        if (tipo === 'usuarios') {
            req.modelo = await obtenerUsuarioPorId(id);
        }

        if (tipo === 'medicos') {
            req.modelo = await obtenerMedicoPorId(id);
        }

        if (tipo === 'hospitales') {
            req.modelo = await obtenerHospitalPorId(id);
        }
        next();
    } catch (err) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al cargar dato',
            errors: err
        });
    }
}

const obtenerUsuarioPorId = (id) => {
    return new Promise((resolve, reject) => {
        Usuario.findById(id).exec((err, usuario) => {
            if (err) {
                reject('Error al cargar usuario', err);
            }
            if (!usuario) {
                reject('Error al obtener usuario')
            }
            resolve(usuario);
        });
    });
};

const obtenerMedicoPorId = (id) => {
    return new Promise((resolve, reject) => {
        Medico.findById(id).exec((err, medico) => {
            if (err) {
                reject('Error al cargar medico', err);
            }
            if (!medico) {
                reject('Error al obtener medico')
            }
            resolve(medico);
        });
    });
};

const obtenerHospitalPorId = (id) => {
    return new Promise((resolve, reject) => {
        Hospital.findById(id).exec((err, hospital) => {
            if (err) {
                reject('Error al cargar hospital', err);
            }
            if (!hospital) {
                reject('Error al obtener hospital')
            }
            resolve(hospital);
        });
    });
};
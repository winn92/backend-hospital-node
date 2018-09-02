const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const { verificaTipoUpload } = require('./../middlewares/upload');

const app = express();

app.use(fileUpload());

app.put('/:tipo/:id', verificaTipoUpload, (req, res) => {
    const { tipo, id } = req.params;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //Obtener el archivo
    const archivo = req.files.imagen;
    //png  "mime": "image/png", gif  "mime": "image/gif", jpg  "mime": "image/jpeg", jpeg "mime": "image/jpeg",

    //Validando solo imagenes por mime (image/*)
    if (!archivo.mimetype.match(/^image\W/)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No envió una imagen',
            errors: { message: 'Debes enviar una imagen' }
        });
    }

    //Si llegamos hasta aca la imagen es valida
    const { success, error, extension } = getExtension(archivo.name);
    if (!success) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: error }
        });
    }

    //Subir la imagen (si llegamos hasta aca la imagen es valida)
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    const path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        
        subirPorTipo(tipo,getSingularName(tipo),nombreArchivo, req.modelo, res);
    });
});

const subirPorTipo = (tipo,tipoSing,nombreArchivo, modelo, res) => {
    const pathViejo = `./uploads/${tipo}/${modelo.img}`;
    if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
    }    
    
    modelo.img = nombreArchivo;
    modelo.save((err, modeloActualizado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar '+tipoSing,
                errors: err
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Imagen de '+tipoSing+' actualizada',
            [tipoSing]: modeloActualizado
        });
    });
}

const getExtension = (nameFile) => {
    //Sólo estas extensiones son validas
    const extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];
    if (nameFile.match(/\.(jpg|jpeg|png|gif)$/)) {
        const splited = nameFile.split('.');
        return { extension: splited[splited.length - 1], success: true };
    }
    return { success: false, error: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') };
}

const getSingularName=(type)=>{
    switch(type){
        case 'usuarios': return 'usuario';
        case 'medicos': return 'medico';
        case 'hospitales':  return 'hospital';
        default: return null;
    }
}

module.exports = app;
const express = require('express');
const app = express();
const path = require('path'),
    fs = require('fs');

app.get('/:tipo/:img', (req, res) => {
    const { tipo, img } = req.params;
    const pathImagen = path.resolve(__dirname, `./../uploads/${tipo}/${img}`);
    const ruta = (fs.existsSync(pathImagen)) ? pathImagen : path.resolve(__dirname, './../assets/no-img.jpg');
    res.sendFile(ruta);
});

module.exports = app;
const express = require('express');
const app = express();

//Usar las rutas y definirle prefijos
app.use('/usuarios', require('./usuario'));
app.use('/hospitales', require('./hospital'));
app.use('/medicos', require('./medico'));
app.use('/login', require('./login'));
app.use('/busqueda', require('./busqueda'));
app.use('/upload', require('./upload'));
app.use('/img', require('./imagenes'));
app.use('/', require('./app'));

module.exports = app;
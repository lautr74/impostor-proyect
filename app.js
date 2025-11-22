const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hola, esto es una prueba de Express con Jest!');
});

module.exports = app;

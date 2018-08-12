var express = require('express');
var router = express.Router();
var login = require('./login').router
var { getSecret } = require('./login')
var { requestWS } = require('./webservice')
var { pool, url } = require('../util/DB.js');

router.get('/oportunidad', login.validarSesion, async function (req, res, next) {
    res.send("ok");
})

router.get('/referencia/actividad', login.validarSesion, async (req, res, next) => {
    try {
        var query = `select * from vw_referencia where tipo = 'C_ContactActivity Type'`;
        var { rows } = await pool.query(query);
        
        res.set('Cache-Control', 'private, max-age=1200');
        res.json(rows);
        
    } catch (e) { 
        console.log(e)
        next(e) 
    }
})



module.exports = router;
var express = require('express');

router.post('/bitacora', login.validarSesion, async (req, res, next) => {
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
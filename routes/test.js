var express = require('express');
var router = express.Router();

/* GET Hello World page. */
router.get('/test', function(req, res) {
  res.render('index', { title: 'hello world' });
});

module.exports = router;

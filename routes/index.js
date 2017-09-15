var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/index.html#/auth/loading');
});
module.exports = router;

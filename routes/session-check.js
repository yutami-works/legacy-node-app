const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  if (!req.session.user) {
    //res.render('timeout);
    res.redirect('login');
  } else {
    next();
  }
});

module.exports = router;

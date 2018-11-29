var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  var temp = req.query.isAdmin;
  res.render('index', {
    temp: temp
  });
  console.log(temp)
});

router.get('/login.html', function (req, res) {
  res.render('login');
})

router.get('/register.html', function (req, res) {
  res.render('register');
})

// router.get('/users.html', function (req, res) {
//   res.render('users');
// })

router.get('/brand.html', function (req, res) {
  res.render('brand');
})

router.get('/phone.html', function (req, res) {
  res.render('phone');
})
module.exports = router;

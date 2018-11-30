var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;//获取数据库id
var async = require('async');

var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';

/* GET home page. */
router.get('/', function (req, res, next) {
  var temp = req.query.isAdmin;
  res.render('index', { title: 'Express' });
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

// router.get('/phone.html', function (req, res) {
//   res.render('phone');
// })
router.get('/phone.html', function (req, res, next) {
  var page = parseInt(req.query.page) || 1;//页码
  var pageSize = parseInt(req.query.pageSize) || 5;//每页显示的条数
  var totalSize = 0;//总条数
  var data = [];

  MongoClient.connect(url, { useNewUrlParse: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      });
      return;
    }
    var db = client.db('JAY-project');//数据库名字

    async.series([
      function (cb) {
        db.collection('phone').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('phone').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err);
          } else {
            // data = data;
            cb(null, data);
          }
        })
      }
    ], function (err, results) { //results是个数组
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize);//总页数

        res.render('phone', {
          list: results[1],
          //totalSize: totalSize,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page,
        });
      }
      client.close(); //关闭数据库的链接
    })
  })
});


module.exports = router;

var express = require('express');
var MongoClient = require('mongodb').MongoClient;

var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';

/* GET users listing. */
router.get('/', function (req, res, next) {

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      //连接数据库失败
      console.log('连接数据库是失败', err);
      res.render('error', {
        message: '连接数据库失败',
        error: err
      });
      return;
    }

    var db = client.db('JAY-project');//数据库名字

    //user集合名字
    db.collection('user').find().toArray(function (err, data) {
      if (err) {
        console.log('查询用户数据失败', err);
        //有错误就渲染errot.ejs文件
        res.render('error', {
          message: '查询失败',
          error: err
        });
      } else {
        console.log(data);
        res.render('users', {
          list: data
        });
      }
      client.close(); //关闭数据库的链接
    });

  });

  // res.render('users'); 
  //这里不能写了，因为mongodb的操作时异步操作，
  //写这个可能会出现这先运行的可能，然后就运行下面得了
});

module.exports = router;

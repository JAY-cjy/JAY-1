var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;//获取数据库id
var async = require('async');

var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';


//location:3000/users
router.get('/', function (req, res, next) {
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
        db.collection('user').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('user').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
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

        res.render('users', {
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



//登录操作 location:3000/users/login
router.post('/login', function (req, res) {
  //1.获取前端传递过来的参数
  console.log(req.body);
  var username = req.body.name;
  var password = req.body.pwd;

  //2.验证参数的有效性
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }
  if (!password) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }

  //3.连接数据库做验证
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      console.log('连接失败', err)
      res.render('error', {
        message: '连接失败',
        error: err
      });
      return;
    }
    var db = client.db('JAY-project');

    db.collection('user').find({
      username: username,
      password: password
    }).toArray(function (err, data) {
      if (err) {
        console.log('查询失败', err);
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
        //没找到哦，登录失败
        res.render('error', {
          message: '登录失败',
          error: new Error('用户不存在')
          //error页面需要error.status,这个没有，所以我们自己new一个
        })
      } else {
        //找到数据，登陆成功-跳转到首页
        // if (data[0].isAdmin == true) {
        res.cookie('nickname', data[0].nickname, {
          maxAge: 60 * 60 * 1000
        });
        res.cookie('isAdmin', data[0].isAdmin, {
          maxAge: 60 * 60 * 1000
        });
        //设置nickname，maxAge是cookie存在时间(时间毫秒数)
        //res.render('index')不会改变页面地址,所以用redirect重定向
        res.redirect('/');//res.redirect('http://localhost:3000/')主页
      }
      client.close();
    })
  })
});



//注册操作 localhost:3000/register.html
router.post('/register', function (req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true : false;
  //console.log(name, pwd, nickname,age, sex, isAdmin);

  //插入数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('JAY-project');

    async.series([
      function (cb) {
        db.collection('user').find({ username: name }).count(function (err, num) {
          if (err) {
            cb(err);
          } else if (num > 0) {
            //这个人已经注册过了
            cb(new Error('已经注册'));
          } else {
            //注册成功
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('user').insertOne({
          username: name,
          password: pwd,
          nickname: nickname,
          age: age,
          sex: sex,
          isAdmin: isAdmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ],
      function (err, result) {
        if (err) {
          res.render('error', {
            message: '注册失败',
            error: err
          })
        } else {
          res.redirect('/login.html');
        }
        //成功失败都关闭数据库连接
        client.close();
      })
  })
});



//删除操作 localhost:3000/users/delete
router.get('/delete', function (req, res) {
  var id = req.query.id;
  // console.log('req.query.id:' + id);

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('JAY-project');
    db.collection('user').deleteOne({
      _id: ObjectId(id)
    }, function (err, data) {
      //console.log('data:' + data)
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        //删除成功，页面刷新
        res.redirect('/users')
      }
      client.close();
    })
  })
})



//搜索操作 localhost:3000/users/delete
router.post('/search', function (req, res) {
  var page = parseInt(req.query.page) || 1;//页码
  var pageSize = parseInt(req.query.pageSize) || 5;//每页显示的条数
  var totalSize = 0;//总条数
  var data = [];
  var name = req.body.name;
  var filter = new RegExp(name);
  //获取搜索框内容

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '数据库连接失败',
        error: err
      })
      return;
    }
    var db = client.db('JAY-project');

    async.series([
      function (cb) {
        db.collection('user').find({
          nickname: filter
        }).count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('user').find({
          nickname: filter
        }).toArray(function (err, data) {
          if (err) {
            cb(err);
          } else {
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

        res.render('users', {
          list: results[1],
          //totalSize: totalSize,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page,
        });
        client.close(); //关闭数据库的链接
      }
    })
  })
})


module.exports = router;

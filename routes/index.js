const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/User.model');

router.post("/signup", (req, res, next) => {
  const {username, password} = req.body;
  bcryptjs
  .genSalt(saltRounds)
  .then(salt => bcryptjs.hash(password, salt))
  .then(hashedPassword => {
    return User.create({
      username,
      password: hashedPassword
    });
  })
  .then(userFromDB => {
    console.log('Newly created user is: ', userFromDB);
  })
  .then(userFromDB => {
    res.redirect('/login');
  })
  .catch(error => next(error));
});

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const {username, password} = req.body;
  if (username === '' || password === '') {
    res.render('login', {
      errorMessage: 'Please enter both, username and password to login.'
    });
    return;
  }
  User.findOne({ username })
    .then(user => {
      if (!user) {
        res.render('login', { errorMessage: 'Username is not registered. Try with other.' });
        return;
      } else if (bcryptjs.compareSync(password, user.password)) {
          //******* SAVE THE USER IN THE SESSION ********//
          req.session.currentUser = user;
          res.redirect('/profile');
      } else {
        res.render('login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.get("/profile", (req, res, next) => {
  res.render('user-profile', { userInSession: req.session.currentUser });
});


router.get("/main", (req, res, next) => {
  res.render('main', { userInSession: req.session.currentUser });
});

router.get("/private", (req, res, next) => {
  res.render('private', { userInSession: req.session.currentUser });
});

module.exports = router;

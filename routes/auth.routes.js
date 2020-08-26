const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const UserModel = require('../models/User.model');

const { isLoggedIn } = require('../helpers/auth-helper');

router.post('/signup', (req, res) => {
  const {username, email, password} = req.body;

  if (!uername || !email || !password) {
    res.status(500)
      .json({
        errorMessage: 'Please enter username, email and password'
      });
    return;  
  }

  const emailRegEx = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
  if (!emailRegEx.test(email)) {
    res.status(500)
      .json({
        errorMessage: 'Please enter a valid email'
      })
    return;
  }

  const passwordRegEx = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);
  if (!passwordRegEx.test(password)) {
    res.status(500)
      .json({
        errorMessage: 'Password must contain letter, uppercase letter, number and a special character, and needs to have 8 characters.'
      })
    return;
  }

  bcrypt.genSalt(10)
    .then((salt) => {
      bcrypt.hash(password, salt)
          .then((passwordHash) => {
            UserModel.create({email, username, passwordHash})
              .then((user) => {
                user.passwordHash = "***";
                req.session.loggedInUser = user;
                console.log(req.session)
                res.status(200).json(user);
              })
              .catch((err) => {
                if (err.code === 11000) {
                  res.status(500)
                    .json({
                      errorMessage: 'Username or email entered already exists!'
                    });
                  return;  
                } 
                else {
                  res.status(500)
                    .json({
                      errorMessage: 'Something went wrong!'
                    });
                  return; 
                }
              })
          });  
    });

})

router.post('/signin', (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.status(500)
      .json({
        errorMessage: 'Please enter email and password'
      });
    return;
  }

  const myRegex = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
    if (!myRegex.test(email)) {
      res.status(500)
        .json({
          error: 'Email format not correct',
        })
      return;  
    }

    UserModel.findOne({email})
      .then((user) => {
        bcrypt.compare(password, user.passwordHash)
          .then((matches) => {
            if (matches) {
              user.passwordHash = "***";
              req.session.loggedInUser = user;
              console.log('Signin succes!', req.session)
              res.status(200).json(user);
            }
            else {
              res.status(500)
                .json({
                  error: 'Password don\'t match, please try again'
                })
              return;
            }
          }).catch(() => {
            res.status(500)
              .json({
                error: 'Email not correct'
              })
            return;
          });
      }).catch(() => {
        res.status(500).json({
          error: 'Email not correct'
        })
        return;
      });
})

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.status(204)
    .send();
})

router.get('/user', isLoggedIn, (req, res, next) => {
  res.status(200).json(req.session.loggedInUser);
});

router.post('/user/:id/edit', isLoggedIn, (req, res) => {
  const {address, postal, city, firstName, lastName} = req.body;
  UserModel.findByIdAndUpdate(req.params.id, {$set: {firstName: firstName, lastName: lastName, address: address, postal: postal, city: city}})
    .then((user) => {
      res.status(200).json(user)
    }).catch((err) => {
      res.status(500).json({
        error: 'Cannot update',
        message: err
      })
      return;
    });
})

module.exports = router;
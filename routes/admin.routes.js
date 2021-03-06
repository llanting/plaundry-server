const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');

const AdminModel = require('../models/Admin.Model');


router.post('/admin/signup', (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    res.status(500)
      .json({
        error: 'Please enter email and password'
      });
    return;  
  }

  const emailRegEx = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
  if (!emailRegEx.test(email)) {
    res.status(500)
      .json({
        error: 'Please enter a valid email'
      })
    return;
  }

  const passwordRegEx = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);
  if (!passwordRegEx.test(password)) {
    res.status(500)
      .json({
        error: 'Password must contain letter, uppercase letter, number and a special character, and needs to have 8 characters.'
      })
    return;
  }

  bcrypt.genSalt(10)
    .then((salt) => {
      bcrypt.hash(password, salt)
          .then((passwordHash) => {
            AdminModel.create({email, passwordHash})
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
                      error: 'Username or email already exists!'
                    });
                  return;  
                } 
                else {
                  res.status(500)
                    .json({
                      error: 'Something went wrong!'
                    });
                  return; 
                }
              })
          })  
    });

})

router.post('/admin/signin', (req, res) => {
  const {email, password} = req.body;
  if (!email ) {
    res.status(500)
      .json({
        error: 'Please enter your email '
      });
    return;
  }

  if (!password ) {
    res.status(500)
      .json({
        error: 'Please enter your password'
      });
    return;
  }

  const myRegex = new RegExp(/^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/);
    if (!myRegex.test(email)) {
      res.status(500)
        .json({
          error: 'Please enter a valid email',
        })
      return;  
    }

    AdminModel.findOne({email})
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
                  error: 'Password doesn\'t match, please try again'
                })
              return;
            }
          }).catch(() => {
            res.status(500)
              .json({
                error: 'Password doesn\'t match, please try again'
              })
            return;
          });
      }).catch(() => {
        res.status(500).json({
          error: 'Email doesn\'t match, please try again'
        })
        return;
      });
})

module.exports = router;
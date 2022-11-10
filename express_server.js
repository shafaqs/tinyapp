const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// function to generate random string
function generateRandomString() {
  const randomNumber = Math.random().toString(36).slice(6);
  return randomNumber;
}
// create a function that returns user object
const getuserbyId = (id, database) => {
  for (let keyID in database) {
    if (keyID === id) return database[keyID];
  }
  return null;
};
// create a function to user urls
const urlsForUser = (id, urlDatabase) => {
  let userurls = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === id) {
      userurls[shorturl] = urlDatabase[shorturl].longURL;
    }
  }
  return userurls;
};

const users = {};
const urlDatabase = {};


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ["unbreakable"]
}));



app.get("/urls", (req, res) => {
  // create a check to let only register users access data
  const userid = req.session.userid;
  if (!userid) {
    res.send("login or register to proceed");
  } else {
    let userurl = urlsForUser(userid, urlDatabase);
    const templateVars = {
      user: users[userid],
      urls: userurl
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  // create a function for register users to access features
  const userid = req.session.userid;
  if (!userid) {
    res.send("login or register to shorten URL");
    res.redirect("/login");
  }
  const templateVars = {
    user: users[userid],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // create a function for register users to access features
  const userid = req.session.userid;
  if (!userid) {
    res.send("This page isn't availabe");
  }
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    user: users[userid],
    id, longURL
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (!longURL) {
    res.send("id is not in the database");
  }
  res.redirect(longURL);
});


app.get("/register", (req, res) => {
  const userid = req.session.userid;

  if (userid) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: users[userid],
  };
  res.render("register", templateVars);
});
// if user is logged in redirect to get urls
app.get("/login", (req, res) => {

  const userid = req.session.userid;
  if (userid) {
    res.redirect("/urls");
  }
  const templateVars = {
    user: getuserbyId(userid, users)
  };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);



  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  //  if email already exists
  if (getUserByEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const userid = generateRandomString();
    users[userid] = {
      id: userid,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    };
    req.session.userid = userid;
    res.redirect(`/urls`);
  }
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const newuser = {
    longURL: longURL,
    userID: req.session.userid
  };
  urlDatabase[shortURL] = newuser;
  res.redirect(`/urls/${shortURL}`);

});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls/`);
});
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id].longURL = longURL;
  res.redirect(`/urls`);
});
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  //  if email already exists
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    res.sendStatus(403);
  } else {
    if ((user.email === req.body.email) && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.userid = user.id;
      res.redirect(`/urls`);
    }
    else {
      res.sendStatus(403);
    }
  }
});
app.post("/logout", (req, res) => {
  req.session.userid = null;
  res.redirect(`/login`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
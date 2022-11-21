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

// Render the Root page
app.get("/", (req, res) => {
  const userid = req.session.userid;
  if (userid) {
    console.log("Root, logged in user, redirecting to /urls");
    req.session.userid = userid;
    res.redirect(`/urls`);
  } else {
    console.log("Root, user not logged in, redirecting to /login");

    res.redirect(`/login`);
  }
});

// Render the urls page
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
  } else {
    const templateVars = {
      user: users[userid],
    };
    res.render("urls_new", templateVars);
  }
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
  const url = urlDatabase[id];

  if (!url) {
    res.redirect('/');
    return;
  }

  longURL = url.longURL;
  console.log("We are in /u/:id");
  if (!longURL) {
    res.send("id is not in the database");
  } else {
    res.redirect(longURL);
  }
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
    message: null,
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
    res.status(400).send('Enter valid email and password');
  }
  //  if email already exists
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Enter a different email and password');
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
      //res.status(403).send('invalid email or password');
      res.render("login", { message: 'invalid email or password', user: null });
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
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

function generateRandomString() {
  const randomNumber = Math.random().toString(36).slice(6);
  console.log(" string:___", randomNumber);
  return randomNumber;
}
const getuserEmail = (email, database) => {
  for (let keyID in database) {
    if (database[keyID].email === email) return database[keyID];
  }
  return null;
};
const getuserbyId = (id, database) => {
  for (let keyID in database) {
    if (keyID === id) return database[keyID];
  }
  return null;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {

  const templateVars = {
    user: req.cookies["userid"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["userid"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    user: req.cookies["userid"],
    id, longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["userid"]],
  };
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  console.log("req.headers.cookie", req.headers.cookie);
  if (req.headers.cookie?.split("=")[1]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: getuserbyId(req.headers.cookie?.split("=")[1], users)
    };
    res.render("login", templateVars);
  }
});
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  //  if email already exists
  if (getuserEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const userid = generateRandomString();
    users[userid] = {
      id: userid,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('userid', userid);
    console.log("New User Name Being Added: ", users[userid]);
    res.redirect(`/urls`);
  }
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  console.log(req.body);// Log the POST request body to the console
  console.log("newurlDatatbase:", urlDatabase);
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)

});
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls/`);
});
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const shortURL = req.body.shortURL;
  res.redirect(`/urls/${shortURL}`);
});
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  }
  //  if email already exists
  const userid = getuserEmail(req.body.email, users);
  if (!userid) {
    res.sendStatus(403);
  } else {
    if ((userid.email === req.body.email) && (userid.password === req.body.password)) {
      res.cookie('userid', userid);
    }
    else {
      res.sendStatus(403);
    }
    //console.log("New User Name Being Added: ", users[userid]);
    res.redirect(`/urls`);
  }
  res.redirect(`/urls/`);
});
app.post("/logout", (req, res) => {
  res.clearCookie('userid');
  res.redirect(`/login`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
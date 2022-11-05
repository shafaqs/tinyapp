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
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = {
    username: req.cookies["username"],
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
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect(`/urls/`);
});
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls/`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
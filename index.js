require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require('path');

const app = express();

// Set the port to use Heroku's environment variable or default to 3000
const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://voosh-foods-screening-e240f1d5f72b.herokuapp.com/auth/google/callback"
 // Update with your Heroku app URL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile"); // Redirect to profile after successful login
  }
);

app.get("/profile", (req, res) => {
  const user = req.user;

  // Serve a different HTML file for the profile page if desired
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="styles.css">
      <title>Test Website</title>
    </head>
    <body>
      <header>
        <h1>Welcome , User Authenticated </h1>
        <div class="user-info">
          <img src="${user.photos[0].value}" class="user-avatar" alt="User Avatar">
          <span>${user.displayName}</span>
          <a href="/logout" class="logout-btn">Logout</a>
        </div>
      </header>
      <main>
        <h2>User logged in as: ${user.displayName}</h2>
      </main>
      <footer>
        <p>© 2024 Have a good day. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `);
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

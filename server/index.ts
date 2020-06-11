require("dotenv").config();
const path = require("path");
import * as express from "express";
import * as cors from "cors";
import * as https from "https";
import * as session from "express-session";
import * as passport from "passport";
import * as GoogleStrategy from "passport-google-oauth20";
import * as bodyParser from "body-parser";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001"
    ]
  })
);
const port = 8080; //default port to listen
app.use(express.json());

const sessionOptions = {
  secret: process.env.APP_SESSION_SECRET || "secrettexthere",
  saveUninitialized: true,
  resave: true,
  name: "sessionid" // Our own cookie name so others don't know we're running Node.
  //cookie: { secure: false } // allows cookies to be used without https
};

// passport setup
function isAuthenticated(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (process.env.NODE_ENV === "development" || req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send("not authenticated");
    return next("not authenticated");
  }
}
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

const callbackBaseUrl = process.env.APP_ROOT_URL || `http://localhost:${port}`;

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.APP_OAUTH_CLIENT_ID ||
        "126647422471-2t7pfb8rll2aic63hpgccjnuqjoidjj6.apps.googleusercontent.com",
      clientSecret:
        process.env.APP_OAUTH_CLIENT_SECRET || "W22ouUd81nbGDIsJmhIjr9o-",
      callbackURL: callbackBaseUrl + "/api/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    (accessToken, refreshToken, profile, done) => {
      // TODO: might need to add this back in to check user has adinstruments.com email?
      // if (profile._json.hd !== "adinstruments.com") {
      //   https.get(
      //     "https://accounts.google.com/o/oauth2/revoke?token=" + accessToken,
      //     function(res) {}
      //   );
      //   return done(null, false);
      // }
      done(null, profile);
    }
  )
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: "email", prompt: "select_account" })
);

app.get("/api/auth/google/callback", function(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  passport.authenticate("google", function(err, user, info) {
    if (err) {
      console.error(err);
      return next(Error("Error while authenticating user: " + err));
    }
    if (!user) {
      if (info.code === "NOT_ADI_ADDRESS") {
        console.error("Non-ADI account tried to log in:" + info.email);
        res.redirect("/auth/wrong-domain");
      } else if (info.code === "NOT_ON_WHITELIST") {
        console.error("Non-whitelisted account tried to log in:" + info.email);
        res.redirect("/auth/invalid-account");
      } else {
        console.warn("Was unable to get user profile");
        res.redirect("/auth/unverified");
      }
      return;
    }
    req.login(user, function(err) {
      if (err) {
        console.error(err);
        return next(Error("Failed to login after authenticating" + err));
      }
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/api/logout", function(req: express.Request, res: express.Response) {
  req.session.destroy(function() {
    req.logout();
    res.redirect("/login");
  });
});

const api = require("./api");
app.use("/api", isAuthenticated, api);

// Handles any requests that don't match the ones above
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname + "/client/build/index.html"));
// });

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

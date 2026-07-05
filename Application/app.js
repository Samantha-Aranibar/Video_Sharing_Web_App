const createError = require("http-errors");
const express = require("express");
const favicon = require('serve-favicon');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const handlebars = require("express-handlebars");
const sesion = require("express-session");
const MySQLStore = require("express-mysql-session")(sesion);
const flash = require("express-flash");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postRouter = require("./routes/post");
const commentsRouter = require("./routes/comments");
const likesRouter = require("./routes/likes");

const app = express();

app.engine(
  "hbs",
  handlebars({
    layoutsDir: path.join(__dirname, "views/layouts"), //where to look for layouts
    partialsDir: path.join(__dirname, "views/partials"), // where to look for partials
    extname: ".hbs", //expected file extension for handlebars files
    defaultLayout: "layout", //default layout for app, general template for all pages in app
    helpers: {
      isNotEmpty: function (obj) {
        return(
          obj && 
          obj.constructor === Object && 
          Object.keys(obj).length >0
        );
      },
      formatDateString: function (dateString) {
        return new Date(dateString).toLocaleString("en-us",{
          dateStyle:"long",
          timeStyle:"medium"
        });
      },
      // Simple helper for flash messages  ----> EXTRA WITH SOME HELP
      /*showFlashMessage: function (messages) {
        let result = '';
        for (const[type, messageArray] of Object.entries(messages)) {
          if (messageArray.length) {
            messageArray.forEach(message => {
              result += `<div class="alert alert-${trype}">${message}</div>`;
            });
        }
      }
      return new handlebars.SafeString(result); 
    }*/ //adding new helpers to handlebars for extra functionality
    }
}));

const sessionStore = new MySQLStore({
  /** default options */},
  require(`./conf/database`)
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('csc 317 super secret'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(sesion({
  key: `csid`,
  secret: `csc 317 super secret`,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,    //used to be true i am debbuging
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using https
    maxAge: 1000*60*60*24 // 1 day
  }
}));

app.use(function (req, res, next) {
  if(req.session.user) {
    res.locals.isLoggedIn = true; // if user is logged in, set isLoggedIn to true
    res.locals.user = req.session.user; // make user info available in all views
  }
  next();
});

app.use(flash());
// Middleware to make flash messages available in all views
app.use((req,res,next)=>{
  res.locals.messages ={
    error: req.flash("error"),
    success: req.flash("success"),
    info: req.flash("info")
  };
  next();
})

app.use("/", indexRouter); // route middleware from ./routes/index.js
app.use("/users", usersRouter); // route middleware from ./routes/users.js
app.use("/post",postRouter); // route middleware from ./routes/post.js
app.use("/comemnts",commentsRouter); // route middleware from ./routes/comment.js
app.use("/likes",likesRouter); // route middleware from ./routes/comment.js


app.use((req,res,next) => {
  next(createError(404, `The route ${req.method} : ${req.url} does not exist.`));
})
  


app.use(function (err, req, res, next) {
  //res.locals.messages = err.message;
  res.locals.message = err.message;
  res.locals.error = err;
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
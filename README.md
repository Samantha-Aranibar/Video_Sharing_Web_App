# Video Sharing Web Application

A full-stack video-sharing web application built with Node.js, Express, Handlebars, and MySQL.

This project allows users to register, log in, upload videos, view posts, like videos, manage their profile, and browse uploaded content.

## Features

- User registration
- User login/logout
- User profile page
- Video upload
- View all videos
- View individual video posts
- Like videos
- Search video posts
- MySQL database integration
- Session management
- Handlebars templating

## Technologies Used

- Node.js
- Express.js
- Express Handlebars
- MySQL
- MySQL Sessions
- bcrypt
- multer
- dotenv
- HTML
- CSS
- JavaScript

## Repository Structure

```text
Video-Sharing-Web-App/
│
├── bin/
├── conf/
├── helpers/
├── middleware/
├── public/
├── routes/
├── views/
│   ├── layouts/
│   ├── partials/
│   ├── index.hbs
│   ├── login.hbs
│   ├── registration.hbs
│   ├── profile.hbs
│   ├── postvideo.hbs
│   ├── viewpost.hbs
│   └── viewpostid.hbs
│
├── app.js
├── package.json
├── package-lock.json
├── README.md
├── LICENSE
└── .gitignore

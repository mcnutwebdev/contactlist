var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

//  APP CONFIG

var app = express();

//  MONGOOSE CONFIG

mongoose.connect("mongodb://localhost/contactlist");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());// HAS TO BE AFTER BODY-PARSER
app.use(methodOverride("_method"));

var contactSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phone: String
});

var Contact = mongoose.model("Contact", contactSchema);

//  ROUTES

//  INDEX ROUTE
app.get("/", function (req, res) {
    res.redirect("/contacts");
});

app.get("/contacts", function (req, res) {
    Contact.find({}, function (err, contacts) {
        if (err) {
            console.log("error:" + err);
        } else {
            res.render("index", { contacts: contacts });
            console.log("GET /contacts");
        }
    });
});

//  NEW ROUTE
app.get("/contacts/new", function (req, res) {
    res.render("new");
    console.log("GET /contacts/new");
});

//  CREATE ROUTE
app.post("/contacts", function (req, res) {
    req.body.contact.lastname = req.sanitize(req.body.contact.lastname);
    Contact.create(req.body.contact, function (err) {
        if (err) {
            res.render("new");
            console.log("error:" + err);
        } else {
            res.redirect("/contacts");
            console.log("POST /contacts");
        }
    });
});

//  SHOW ROUTE
app.get("/contacts/:id", function (req, res) {
    Contact.findById(req.params.id, function (err, foundContact) {
        if (err) {
            res.redirect("/contacts");
        } else {
            res.render("show", { contact: foundContact });
            console.log("GET /contacts/:id");
        }
    });
});

//  EDIT ROUTE
app.get("/contacts/:id/edit", function (req, res) {
    Contact.findById(req.params.id, function (err, foundContact) {
        if (err) {
            res.redirect("/contacts");
            console.log(err);
        } else {
            res.render("edit", { contact: foundContact });
            console.log("GET /contacts/:id/edit");
        }
    });
});

//  UPDATE ROUTE
app.put("/contacts/:id", function (req, res) {
    req.body.contact.lastname = req.sanitize(req.body.contact.lastname);
    Contact.findByIdAndUpdate(req.params.id, req.body.contact, function (err) {
        if (err) {
            res.redirect("/contacts");
        } else {
            res.redirect("/contacts/" + req.params.id);
            console.log("PUT /contacts/:id");
        }
    });
});

//  DELETE ROUTE
app.delete("/contacts/:id", function (req, res) {
    Contact.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err);
            res.redirect("/contacts");
        } else {
            res.redirect("/contacts");
            console.log("DELETE /contacts/:id");
        }
    });
});

//  SERVER CONFIG
app.listen(3000, function () {
    console.log("server running");
});
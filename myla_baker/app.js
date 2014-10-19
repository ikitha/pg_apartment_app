var express = require('express'),
	pg = require('pg'),
	bodyParser = require('body-parser'),
	methodOverride = require("method-override"),
	app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
	extended:true
}));

app.use(methodOverride("_method"));

app.use(express.static(__dirname + '/public'));

var db = {};

db.config = {
	database: "apartmentapp",
	port: 5432,
	host: "localhost"
};

db.connect = function(runAfterConnecting) {
    pg.connect(db.config, function(err, client, done){
        if (err) {
            console.error("Something went wrong.", err);
        }
        runAfterConnecting(client);
        done();
    });
};

db.query = function(statement, params, callback){
    db.connect(function(client){
        client.query(statement, params, callback);
    });
};

app.get("/", function(req, res) {
	db.query("select * from managers;", function(error, result) {
		res.render("index.ejs", {
			allManagers: result.rows
		});
	});
});

app.post("/", function(req, res) {
	db.query("INSERT INTO managers (firstname, lastname, property) VALUES ($1, $2, $3);", [req.body.manfirstname, req.body.manlastname, req.body.propaddress],
		function(error, result) {
			res.redirect("/");
		});
});

app.get("/tenants/:manager_id", function(req, res) {
	var id =req.params.manager_id.toString();
	db.query("select tenants.*, managers.property from tenants join managers on tenants.man_id = managers.id where managers.id =$1;", [id], function(error, result) {
	    if (!error) {
		    res.render("tenants.ejs", {
				allTenants: result.rows,
				manager_id: req.params.manager_id
			});
		}
	});
});

app.post("/tenants/:manager_id", function(req, res) {
	db.query("INSERT INTO tenants (firstname, lastname, man_id) VALUES ($1, $2, $3);", [req.body.tenantfirst, req.body.tenantlast, req.params.manager_id],
		function(error, result) {
			console.log(error);
			res.redirect("/tenants/" + req.params.manager_id);
		});
});

app.listen(3000);
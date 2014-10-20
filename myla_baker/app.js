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

var property_array;
app.get("/", function(req, res){
    db.query("select property from managers;", 
        function(error, result){
        property_array = result.rows
    });
});

app.get("/tenants/:manager_id", function(req, res) {
	var id =req.params.manager_id.toString();
	db.query("select tenants.*, managers.property from tenants join managers on tenants.man_id = managers.id where managers.id =$1 order by id;", [id], function(error, result) {
	    if (!error) {
		    res.render("tenants.ejs", {
				allTenants: result.rows,
				manager_id: req.params.manager_id,
				allProperties: property_array
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

app.put("/tenants/:manager_id/:tenant_id", function(req, res){
	db.query("UPDATE tenants SET firstname=$1, lastname=$2 WHERE id=$3;", [req.body.tenantfirst, req.body.tenantlast, req.params.tenant_id],
	function(error, result) {
			console.log(error);
			res.redirect("/tenants/" + req.params.manager_id);
	});
});

app.delete("/tenants/:manager_id/:tenant_id", function(req, res){
	db.query("DELETE from tenants WHERE id=$1;", [req.params.tenant_id], 
		function(error, result){
			res.redirect("/tenants/" + req.params.manager_id);
	});
});

app.listen(3000);
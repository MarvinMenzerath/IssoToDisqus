var fs = require("fs");
var moment = require("moment");
var sqlite3 = require("sqlite3");

var db = new sqlite3.Database("comments.db");

console.log("Welcome to IssoToDisqus!\n");

var out = "";
db.each("SELECT threads.title, comments.id, comments.parent, comments.created, comments.author, comments.email, comments.website, comments.remote_addr, comments.text FROM threads, comments WHERE threads.id = comments.tid;",
	function(err, row) {
		if (row.author === null) { row.author = "Anonymous"; }
		if (row.email === null) { row.email = "anonymous@guest.com"; }
		if (row.website === null) { row.website = ""; }
		if (row.remote_addr === "123.123.123.123") { row.remote_addr = "127.0.0.1"; }
		row.created = moment(row.created, "X").format("YYYY-MM-DD HH:mm:ss");
		if (row.parent === null) { row.parent = 0; }

		var rowOut = "<!-- " + row.title + ": -->\n";
		rowOut += "<wp:comment>\n";
		rowOut += "	<wp:comment_id>" + row.id + "</wp:comment_id>\n";
		rowOut += "	<wp:comment_author>" + row.author + "</wp:comment_author>\n";
		rowOut += "	<wp:comment_author_email>" + row.email + "</wp:comment_author_email>\n";
		rowOut += "	<wp:comment_author_url>" + row.website + "</wp:comment_author_url>\n";
		rowOut += "	<wp:comment_author_IP>" + row.remote_addr + "</wp:comment_author_IP>\n";
		rowOut += "	<wp:comment_date_gmt>" + row.created + "</wp:comment_date_gmt>\n";
		rowOut += "	<wp:comment_content><![CDATA[" + row.text + "]]></wp:comment_content>\n";
		rowOut += "	<wp:comment_approved>1</wp:comment_approved>\n";
		rowOut += "	<wp:comment_parent>" + row.parent + "</wp:comment_parent>\n";
		rowOut += "</wp:comment>\n\n";

		out += rowOut;
	},
	function(err, rows) {
		console.log(out);
		fs.writeFile("comments.xml", out, function(err) {
			if (err) {
				return console.log(err);
			}
			console.log("File 'comments.xml' saved.");
		});
	}
);

db.close();

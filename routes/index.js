var express = require('express');
var router = express.Router();
var http = require('http');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: 'getAppleTuan'
	});
});

router.get('/getJobs', function(req, res, next) {
	var Res = res;
	var url = 'http://www.appletuan.com';
	var path;
	var cid = req.param('cid');
	if (cid) {
		cid = "?cid=" + cid
	} else {
		cid = "";
	}

	http.get(url, function(res) {
		var chunks = [];
		var size = 0;
		res.on('data', function(chunk) {
			chunks.push(chunk);
			size += chunk.length;
		});
		res.on('end', function() {
			var result = {};
			var data = Buffer.concat(chunks, size);
			var html = data.toString();
			var $ = cheerio.load(html);
			var date = $('#main-nav-price-report').text();
			path = $('#main-nav-price-report').attr('href');
			console.log('get path success!path:' + path);
			result["path"] = path;
			result["date"] = date;
			http.get(url + path + cid, function(res) {
				var chunks = [];
				var size = 0;
				res.on('data', function(chunk) {
					chunks.push(chunk);
					size += chunk.length;
				})
				res.on('end', function() {
					var data = Buffer.concat(chunks, size);
					var html = data.toString();
					var $ = cheerio.load(html);
					var content = $('.col-md-8 .box').eq(1).html();
					result["html"] = content;
					Res.json({
						result: result
					});
				});
			});
		});
	});

});

module.exports = router;
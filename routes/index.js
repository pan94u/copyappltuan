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
	var page = req.param('page');
	var cid = req.param('cid');
	if (cid) {
		cid = "?cid=" + cid
	} else {
		cid = "";
	}
	console.log("page:" + page);
	var Res = res;
	var url = 'http://www.appletuan.com/daily_price_reports/'
	http.get(url + page + cid, function(res) {
		var chunks = [];
		var size = 0;
		res.on('data', function(chunk) {
			chunks.push(chunk);
			size += chunk.length;
		})
		res.on('end', function() {
			var result = [];
			var data = Buffer.concat(chunks, size);
			var html = data.toString();
			var $ = cheerio.load(html);
			if ($('.col-md-8 .box .cell').eq(0).text().indexOf('404') > 0) {
				result.push("404");
			} else {
				var content = $('.col-md-8 .box').eq(1).html();
				result.push(content);
			}
			Res.json({
				result: result
			});
		});
	}).on('error', function(err) {
		console.log(err);
	});;

});

module.exports = router;
var express = require('express');
var router = express.Router();
var http = require('http');
var cheerio = require('cheerio');
var path;
var result = {};
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: '胖胖数码今日报价'
	});
});

router.get('/getJobs', function(req, res, next) {
	var Res = res;
	var get_url = 'http://www.appletuan.com/page/about';
	var url = 'http://www.appletuan.com';
	var cid = req.param('cid');
	if (cid) {
		cid = "?cid=" + cid;
	} else {
		cid = "";
	}

	http.get(get_url, function(res) {
		var chunks = [];
		var size = 0;
		res.on('data', function(chunk) {
			chunks.push(chunk);
			size += chunk.length;
		});
		res.on('end', function() {
			var data = Buffer.concat(chunks, size);
			var html = data.toString();
			var $ = cheerio.load(html);
			var date = $('#main-nav-price-report').text();
			if (path == $('#main-nav-price-report').attr('href') && (Date.now() - result["time"]) < 3600000) {
				console.log('getting old data success!');
				Res.json({
					result: result
				});
			} else {
				result = {};
				path = $('#main-nav-price-report').attr('href');
				console.log('path update success!path:' + path);
				result["path"] = path;
				result["date"] = date;
				result["time"] = Date.now();
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
						$('.header').remove();
						$('.product-series-heading>span').text('(价格实时变动,下单请联系微信)');
						var content = $('.col-md-8 .box').eq(1).html();
						content = content.replace(/(<\/?a.*?>)|(<\/?span.*?>)/g, '<span>');
						result["html"] = content;
						Res.json({
							result: result
						});
					});
				});
			}
		});
	});

});

module.exports = router;
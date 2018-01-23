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

router.get('/product_models/:id/prices', function(req, res, next) {
	res.render('charts', {
		title: '胖胖数码 - 趋势图'
	});
});

router.get('/getCharts', function(req, res, next) {
	var Res = res;
	var chart_url = 'http://www.appletuan.com/product_models/' + req.param('id') + '/prices.json?tag=&du=' + req.param('du');
	var title_url = 'http://www.appletuan.com/product_models/' + req.param('id') + '/prices';
	var result = {};
	http.get(title_url, function(res) {
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
			result["title"] = $.html('.highcharts-title');
			http.get(chart_url, function(res) {
				var chunks = [];
				var size = 0;
				res.on('data', function(chunk) {
					chunks.push(chunk);
					size += chunk.length;
				});
				res.on('end', function() {
					var data = Buffer.concat(chunks, size);
					result["charts"] = data.toString();
					Res.json({
						result: result
					});
				});
			})
		});
	})
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
						$('.product-series-heading span').text('(参考报价，根据市场价格随时更新，下单联系微信）');
						var content = $('.col-md-8 .box').eq(1).html();
						//content = content.replace(/(<\/?a.*?>)/g, '');
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
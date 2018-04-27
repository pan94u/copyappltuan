var express = require('express');
var router = express.Router();
var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
var date, path, cid, result = {};
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: '胖胖数码今日报价'
	});
});

router.get('/spider', function(req, res, next) {
	res.render('spider', {
		title: '胖胖数码今日报价',
		content: result["html"]
	});
});

router.get('/attention', function(req, res, next) {
	res.render('attention');
});

router.get('/product_models/:id/prices', function(req, res, next) {
	res.render('charts', {
		title: '胖胖数码 - 趋势图'
	});
});

router.get('/getprice', function(req, res, next) {
	cid = req.param('cid') ? ("?cid=" + cid) : "";
	getPath()
		.then(() => {
			return getPrice();
		})
		.then(() => {
			resPrice(res, result);
		})
		.catch(e => {
			//报价未更新，return缓存
			if (e.notRealPromiseException) {
				resPrice(res, e.data);
			}
		})
});

router.get('/fu',function(req,res,next){
	result = {};
	res.send('报价更新成功');
})

router.get('/getCharts', function(req, res, next) {
	var Res = res;
	var chart_url = 'http://www.appletuan.com/product_models/' + req.param('id') + '/prices.json?tag=&du=' + req.param('du');
	var title_url = 'http://www.appletuan.com/product_models/' + req.param('id') + '/prices?dpr_id=' + req.param('dpr_id');
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
			var allscript = $('html').find('script');
			allscript.each(function(i, elem) {
				var elemstr = $(elem).html();
				if (elemstr.match('Highcharts.theme')) {
					result["title"] = elemstr;
				}
			});
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

const getPath = () => {
	return new Promise((resolve, reject) => {
		request('http://www.appletuan.com/page/about', function(err, res, data) {
			if (!err && res.statusCode == 200) {
				var $ = cheerio.load(data);
				if(isEmptyObject(result)){
					path = $('#main-nav-price-report').attr('href');
					date = $('#main-nav-price-report').text();
					resolve();
				}
				if (path == $('#main-nav-price-report').attr('href') && (Date.now() - result["time"]) < 1800000) {
					console.log('getting old data success!');
					reject({
						notRealPromiseException: true,
						data: result
					});
				} else {
					path = $('#main-nav-price-report').attr('href');
					date = $('#main-nav-price-report').text();
					resolve();
				}
			}
		});
	});
}

const getPrice = () => {
	return new Promise((resolve, reject) => {
		request('http://www.appletuan.com' + path + cid, function(err, res, data) {
			if (!err && res.statusCode == 200) {
				result["path"] = path;
				result["date"] = date;
				result["time"] = Date.now();
				var $ = cheerio.load(data);
				$('.header').remove();
				$('.product-series-heading span').text('(参考报价，根据市场价格随时更新，下单联系微信）');
				var content = $('.col-md-8 .box').eq(1).html();
				result["html"] = content;
				resolve(result);
			}
		});
	});
}

const resPrice = (res, result) => {
	res.json({
		result: result
	});
}

function isEmptyObject( obj ) {
	var name;
	for ( name in obj ) {
	  return false;
	}
	return true;
  }

module.exports = router;
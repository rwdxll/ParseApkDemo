var express = require('express');
var parseApk = require('../util/parseapk');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/new', function(req, res) {
	res.render('new_app', {
		errors: null
	});
});

// { file:
//    { fieldname: 'file',
//      originalname: 'GoldNet0716.apk',
//      name: 'b965f95c5d8a86990386198365dc7803.apk',
//      encoding: '7bit',
//      mimetype: 'application/octet-stream',
//      path: 'uploads/b965f95c5d8a86990386198365dc7803.apk',
//      extension: 'apk',
//      size: 10665378,
//      truncated: false
// 	 }
// }
router.post('/new', function(req, res) {

	var errors = req.validationErrors();

	if (errors != null) {
		res.render('new_app', {
			errors: errors
		});
	} else {
		var file = req.files.file;

		if (file != undefined) {
			parseApk(file.name, function(appinfo) {
				console.log(appinfo);

				res.set({
					'content-type': 'application/json; charset=utf-8'
				}).send(appinfo);
			});

		} else {
			res.render('new_app', {
				errors: [{
					msg: 'please select a file'
				}]
			});
		}
	}
});

module.exports = router;
var sys = require('sys');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

function execute(command, callback) {
	exec(command, function(error, stdout, stderr) {
		callback(stdout);
		if (error) {
			console.log(error);
		}
		if (stderr) {
			console.log(stderr);
		}
	});
}

// [ 'package: name=\'com.goldnet.mobile\' versionCode=\'1\' versionName=\'1.0\'',
//   'uses-permission:\'android.permission.INTERNET\'',
//   'uses-permission:\'android.permission.VIBRATE\'',
//   'uses-permission:\'android.permission.ACCESS_NETWORK_STATE\'',
//   'uses-permission:\'android.permission.ACCESS_WIFI_STATE\'',
//   'uses-permission:\'android.permission.WRITE_EXTERNAL_STORAGE\'',
//   'uses-permission:\'android.permission.MODIFY_AUDIO_SETTINGS\'',
//   'uses-permission:\'android.permission.READ_EXTERNAL_STORAGE\'',
//   'uses-permission:\'android.permission.MOUNT_UNMOUNT_FILESYSTEMS\'',
//   'uses-permission:\'android.permission.CAMERA\'',
//   'uses-permission:\'android.hardware.camera\'',
//   'uses-permission:\'android.hardware.camera.autofocus\'',
//   'uses-permission:\'android.permission.RECORD_AUDIO\'',
//   'uses-permission:\'android.permission.RESTART_PACKAGES\'',
//   'sdkVersion:\'8\'',
//   'targetSdkVersion:\'15\'',
//   'application-label:\'中金金网\'',
//   'application-icon-120:\'res/drawable-hdpi/icon1.png\'',
//   'application-icon-160:\'res/drawable-hdpi/icon1.png\'',
//   'application-icon-240:\'res/drawable-hdpi/icon1.png\'',
//   'application-icon-320:\'res/drawable-hdpi/icon1.png\'',
//   'application-icon-480:\'res/drawable-hdpi/icon1.png\'',
//   'application: label=\'中金金网\' icon=\'res/drawable-hdpi/icon1.png\'',
//   'launchable-activity: name=\'com.goldnet.mobile.activity.AppStartActivity\'  label=\'\' icon=\'\'',
//   'uses-feature:\'android.hardware.camera\'',
//   'uses-feature:\'android.hardware.camera.autofocus\'',
//   'uses-implied-feature:\'android.hardware.camera.autofocus\',\'requested android.permission.CAMERA permission\'',
//   'uses-feature:\'android.hardware.microphone\'',
//   'uses-implied-feature:\'android.hardware.microphone\',\'requested android.permission.RECORD_AUDIO permission\'',
//   'uses-feature:\'android.hardware.wifi\'',
//   'uses-implied-feature:\'android.hardware.wifi\',\'requested android.permission.ACCESS_WIFI_STATE, android.permission.CHANGE_WIFI_STATE, or android.permission.CHANGE_WIFI_MULTICAST_STATE permission\'',
//   'uses-feature:\'android.hardware.touchscreen\'',
//   'uses-implied-feature:\'android.hardware.touchscreen\',\'assumed you require a touch screen unless explicitly made optional\'',
//   'uses-feature:\'android.hardware.screen.landscape\'',
//   'uses-implied-feature:\'android.hardware.screen.landscape\',\'one or more activities have specified a landscape orientation\'',
//   'uses-feature:\'android.hardware.screen.portrait\'',
//   'uses-implied-feature:\'android.hardware.screen.portrait\',\'one or more activities have specified a portrait orientation\'',
//   'main',
//   'other-activities',
//   'supports-screens: \'small\' \'normal\' \'large\' \'xlarge\'',
//   'supports-any-density: \'true\'',
//   'locales: \'--_--\'',
//   'densities: \'120\' \'160\' \'240\' \'320\' \'480\'',
//   'native-code: \'armeabi\'',
//   '' ]

function parseApkFile(file_name, callback) {
	if (!file_name) {
		console.log('file not exists');
		return;
	}

	var aapt = path.join(path.dirname(fs.realpathSync(__filename)), 'aapt');
	var uploadsDir = path.join(path.dirname(fs.realpathSync(__filename)), '../uploads');
	var command = aapt + " d badging " + uploadsDir + "/" + file_name;
	execute(command, function(output) {
		console.log('output is ' + output);
		var info = output.split('\n');
		var tmp, i, j;
		var appinfo = {};

		for (i in info) {
			tmp = info[i];
			if (tmp.match(/^package:/)) {
				// 'package: name=\'com.goldnet.mobile\' versionCode=\'1\' versionName=\'1.0\''
				tmp = tmp.slice('package:'.length).trim();
				tmp = tmp.split(/\s+/);

				for (j in tmp) {
					if (tmp[j].match(/^name=/)) {
						appinfo['packageName'] = tmp[j].slice('name='.length);
					} else if (tmp[j].match(/^versionCode=/)) {
						appinfo['versionCode'] = tmp[j].slice('versionCode='.length);
					} else if (tmp[j].match(/^versionName/)) {
						appinfo['versionName'] = tmp[j].slice('versionName='.length);
					}
				}
			} else if (tmp.match(/^uses-permission:/)) {
				if (!appinfo.hasOwnProperty('uses-permission')) {
					appinfo['uses-permission'] = [tmp.slice('uses-permission:'.length)];
				} else {
					appinfo['uses-permission'].push(tmp.slice('uses-permission:'.length));
				}
			} else if (tmp.match(/^sdkVersion:/)) {
				appinfo['minSdkVersion'] = tmp.slice('sdkVersion:'.length);
			} else if (tmp.match(/^application-label:/)) {
				appinfo['application-label'] = tmp.slice('application-label:'.length);
			} else if (tmp.match(/^launchable-activity:/)) {
				// 'launchable-activity: name=\'com.goldnet.mobile.activity.AppStartActivity\'  label=\'\' icon=\'\''
				tmp = tmp.slice('launchable-activity:'.length).trim();
				tmp = tmp.split(/\s+/);
				for (j in tmp) {
					if (tmp[j].match(/^name=/)) {
						appinfo['launch-activity'] = tmp[j].slice('name='.length);
						break;
					}
				}
			}
		}

		//console.log(appinfo);
		if (callback) {
			callback(appinfo);
		}
	});
}

module.exports = parseApkFile;
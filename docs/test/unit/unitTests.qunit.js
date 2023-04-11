/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comvesi/zfafi_dgt_rcpt/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

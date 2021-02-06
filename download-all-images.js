// download-all-images.js
// Browser: Microsoft Edge Version 88.0.705.63
// Copyright (C) 2021 片山博文MZ.

// To download all the images on the current web page, please paste the following code on Console of Developer Tool of the browser.
// 以下のコードをブラウザの開発者ツールのコンソールに貼り付けて、Enterキーを押すと、表示中のWebページの画像を全部ダウンロードできる。

let INTERVAL = 500; // 時間間隔（ミリ秒）。
let MIN_BYTES = 256; // 画像の最小バイトサイズ。
(function(){
	let next_id = 0, count = 0;
	let callback = function(type, fileTitle, url) {
		if (type.substr(0, 6) != "image/") {
			return false;
		}
		if (url.length < MIN_BYTES) {
			return false;
		}
		type = type.replace("image/", "").replace("\+xml", "");
		if (type == "jpeg")
			type = "jpg";
		else if (type == "tiff")
			type = "tif";
		let dotext = '.' + type;
		let link = document.createElement("a");
		link.href = url;
		link.download = fileTitle + dotext;
		document.body.insertAdjacentElement("beforeEnd", link);
		link.click();
		setTimeout(function() {
			window.URL.revokeObjectURL(url);
		}, 100);
		link.remove();
		return true;
	};
	let doBinary = function(fileTitle, text) {
		let binary = '';
		for (let i = 0; i < text.length; ++i) {
			binary += String.fromCharCode(text.charCodeAt(i) & 0xFF);
		}
		let type = '';
		if (binary.substr(1, 3) == 'PNG')
			type = 'image\/png';
		else if (binary.substr(0, 3) == 'GIF')
			type = 'image\/gif';
		else if (binary.substr(6, 4) == 'JFIF')
			type = 'image\/jpeg';
		else if (binary.substr(8, 4) == 'WEBP')
			type = 'image\/webp';
		else if (binary.substr(0, 2) == 'II' || binary.substr(0, 2) == 'MM')
			type = 'image\/tiff';
		else if (binary.substr(0, 2) == 'BM')
			type = 'image\/bmp';
		else if (binary.substr(0, 5) == '<?xml')
			type = 'image\/svg+xml';
		else {
			console.log("error");
			return false;
		}
		src = 'data:' + type + ';base64,' + window.btoa(binary);
		if (callback(type, fileTitle, src))
			return true;
	};
	let doDownload = function(src, fileTitle) {
		if (src.substr(0, 5) == "data:") {
			let type = src.substr(5, src.indexOf(';') - 5);
			if (callback(type, fileTitle, src))
				return true;
		} else {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.overrideMimeType('text\/plain; charset=x-user-defined');
			xhr.onload = function(e) {
				if (this.responseText) {
					let text = this.responseText;
					doBinary(fileTitle, text);
				}
			};
			xhr.send(null);
		}
		return false;
	};
	let twoDigits = function(num) {
		return ('0' + num).slice(-2);
	};
	let threeDigits = function(num) {
		return ('00' + num).slice(-3);
	};
	let timeStamp = function() {
		let now = new Date();
		return now.getFullYear() + twoDigits(now.getMonth() + 1) + twoDigits(now.getDate()) + "-" + twoDigits(now.getHours()) + twoDigits(now.getMinutes()) + twoDigits(now.getSeconds());
	};
	let downloadBackImages = function() {
		let elements = document.querySelectorAll("*");
		let urls = [];
		for (let iElement = 0; iElement < elements.length; ++iElement) {
			if (!elements[iElement].style) {
				continue;
			}
			let url = elements[iElement].style.backgroundImage;
			if (!url) {
				continue;
			}
			if (url.substr(0, 5) == 'url("' && url.slice(-2) == '")') {
				url = url.substr(5).slice(0, -2);
				urls.push(url);
			}
		}
		let iURL = 0;
		let timer1 = window.setInterval(function(){
			console.log("downloadBackImages");
			if (iURL >= urls.length) {
				clearInterval(timer1);
				return;
			}
			let url = urls[iURL];
			let fileTitle = "image-" + threeDigits(next_id++) + "-" + timeStamp();
			try {
				if (doDownload(url, fileTitle))
					++count;
			} catch (e) {
				;
			}
			++iURL;
		}, INTERVAL);
	};
	let downloadImages = function() {
		let images = document.getElementsByTagName('img');
 		let iImage = 0, timer2 = window.setInterval(function(){
			console.log("downloadImages");
			if (iImage >= images.length) {
				clearInterval(timer2);
				return;
			}
			let img = images[iImage];
			img.setAttribute('crossOrigin', 'anonymous');
			let url = img.currentSrc;
 			if (!url) {
 				++iImage;
 				return;
 			}
			let fileTitle = "image-" + threeDigits(next_id++) + "-" + timeStamp();
			try {
				if (doDownload(url, fileTitle))
					++count;
			} catch (e) {
				;
			}
			++iImage;
		}, INTERVAL);
	};
	let downloadSVGs = function() {
		let SVGs = document.getElementsByTagName('svg');
 		let iSVG = 0, timer3 = window.setInterval(function(){
			console.log("downloadSVGs");
			if (iSVG >= SVGs.length) {
				clearInterval(timer3);
				return;
			}
			let svg = SVGs[iSVG];
			svg.setAttribute('crossOrigin', 'anonymous');
			let text = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + svg.outerHTML;
 			if (!text) {
 				++iSVG;
 				return;
 			}
			let fileTitle = "image-" + threeDigits(next_id++) + "-" + timeStamp();
			try {
				if (doBinary(fileTitle, text))
					++count;
			} catch (e) {
				;
			}
			++iSVG;
		}, INTERVAL);
	};
	let main = function() {
		downloadBackImages();
		downloadImages();
		downloadSVGs();
	};
	main();
})();

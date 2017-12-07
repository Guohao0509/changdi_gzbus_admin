//根据服务器环境判断是否为生产环境
const os = require('os');

var prod = {
	"env": 'linux',
	"host": "http://111.230.129.41:8080",
  	"domain": "http://111.230.129.41:5050",
  	"projectName": "guizhoubus"
};
var dev = {
	"env": 'win32',
	"host": "http://192.168.5.223:8080",
  	"domain": "http://192.168.5.41:5050",
  	"projectName": "bus"
};
module.exports = os.platform() == 'linux' ? prod : dev;
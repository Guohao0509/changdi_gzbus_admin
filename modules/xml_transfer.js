var xml2js = require('xml2js');

var xml = {
    parser: function(xml, success, error) {
        var parse = xml2js.parseString;
        parse(xml, {explicitArray : false}, function (err, result) {
            if(err) {
                return error(err);
            }
            success(result);
        });
    },
    builder: function(json, success, error) {
        try{
            var builder = new xml2js.Builder();
            var result =  builder.buildObject(json);
        }catch(e){
            return error(e);
        }
        success(result);
    }
}

module.exports = xml;
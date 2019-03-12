var crypto = require('crypto');
var AES_CONF = {
  iv : 'e6db271db12d4d47',
  secretKey : '9cd5b4cf89949207', // length of key is 16 of 128 bit
  cipherEncoding : 'base64',
  clearEncoding : 'utf8',
  algorithm : "aes-128-cbc"
};

//加密
exports.aesEncrypt = function (data){
  const cipher = crypto.createCipheriv(AES_CONF.algorithm,AES_CONF.secretKey, AES_CONF.iv)
  return  cipher.update(data,AES_CONF.clearEncoding,AES_CONF.cipherEncoding) + cipher.final(AES_CONF.cipherEncoding);
}
//解密
exports.aesDecrypt = function (data){
  const cipher = crypto.createDecipheriv(AES_CONF.algorithm,AES_CONF.secretKey, AES_CONF.iv)
  return  cipher.update(data,AES_CONF.cipherEncoding,AES_CONF.clearEncoding) + cipher.final(AES_CONF.clearEncoding)
}

//无用，没走通
exports.des = {
    algorithm:{ ecb:'des',cbc:'des-cbc' },
    encrypt:function(plaintext){
        var password = new Buffer(KEY);
        var iv = new Buffer(IV);
        var cipher = crypto.createCipheriv(this.algorithm.ecb, password, iv);
        cipher.setAutoPadding(true)
        var ciph = cipher.update(plaintext, 'utf8', 'base64');
        ciph += cipher.final('base64');
        return ciph;
    },
    decrypt:function(encrypt_text){
        var password = new Buffer(KEY);
        var iv = new Buffer(IV);
        var decipher = crypto.createDecipheriv(this.algorithm.ecb, password, iv);
        decipher.setAutoPadding(true);
        var txt = decipher.update(encrypt_text, 'base64', 'utf8');
        txt += decipher.final('utf8');
        return txt;
    }
};

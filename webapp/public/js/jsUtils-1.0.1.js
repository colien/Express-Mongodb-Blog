/* 公用JS方法 */

/*  去除字符串两端的空格  */
String.prototype.trim = function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

/*  判断是否为空  */
function isNullOrEmpty(str) {
    if (str == null) return true;
	if (str == undefined || str == "undefined") return true;
	if (str == "") return true;
	if (str.length == 0) return true;
	if (!/[^(^\s*)|(\s*$)]/.test(str)) return true;
	return false;
};
/*判断是否为空*/
function isNotEmpty(obj) {
	return !isNullOrEmpty(obj);
}
/*  判断是否为整数数字 */
function isNumber(n) {  
    return !isNaN(parseFloat(n)) && isFinite(n) && n%1 === 0; 
}
/* 获取字符串中的所有数字  */
function getNum(text){
	var value = text.replace(/[^0-9]/ig,""); 
	return value;
};
/* 获取字符串中的所有字母 */
function getLetter(text){
	var value = text.replace(/[^a-zA-Z]/ig,""); 
	return value;
}

/* 判断输入内容是否含有小写字母 */
function isContainLowercase(str){
    var reg = /.*[a-z]+.*/;
    if(reg.test(str)){    
        return true;
    }else{
        return false;
    }

}
/*  判断是否含有大写字母 */
function isContainUpper(str){       
    if (/^[a-z]+$/.test(str)){
       return true;
    } 
    return false;
}

/* 判断是否为全英文大写或全中文 */
function isValidTrueName(str){
	var reg = /^[A-Z u4E00-u9FA5]+$/;
	if(reg.test(str)){
		return false;
	}
	return true;
}
/*  失去焦点去前后空格 */
function loseFocusClearBlank(obj){
	$(obj).val($.trim($(obj).val()));
}

/*  键盘弹起转化成大写 */
function keyUpToUpperCase(obj){
	obj.value = obj.value.toUpperCase();
}

/*  键盘弹起转化成小写 */
function keyUpToLowerCase(obj){
	obj.value = obj.value.toLowerCase();
}


var dateUtil = {
	    /*
	     * 取传入日期是星期几
	     * 使用方法：dateUtil.nowFewWeeks(new Date());
	     * @param date{date} 传入日期类型
	     * @returns {星期四，...}
	     */
	    nowIsWeeks:function(date){
	        if(date instanceof Date){
	            var dayNames = new Array(7,1,2,3,4,5,6);
	            return dayNames[date.getDay()];
	        } else{
	            return "Param error,date type!";
	        }
	    },
	};
Date.prototype.dateFormat = function (format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}



String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

function promptWithPlaceHolder(obj) {
	$(obj).next().show();
	if (obj.value == "" || obj.value == null) {
		obj.value = obj.placeholder;
	}
}

Array.prototype.contains = function (obj) {  
    var i = this.length;  
    while (i--) {  
        if (this[i] == obj) {  
            return true;  
        }  
    }  
    return false;  
} 
Array.prototype.removeByValue = function(val) {
	 for(var i=0; i<this.length; i++) {
	    if(this[i] == val) {
	      this.splice(i, 1);
	      break;
	    }
	 }
}

/* 请求操作的提示 显示 */
function commitWarnShow(){
	$("#commit_yy").show();
	$("#commit_title").show();
}

/* 请求操作的提示隐藏  */
function commitWarnHide(){
	$("#commit_yy").hide();
	$("#commit_title").hide();
}
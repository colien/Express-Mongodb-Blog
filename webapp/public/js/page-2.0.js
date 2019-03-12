/**
 * Created by DELL on 2016/12/1.
 */
/* 分页公用插件 */

/*全局变量*/
var CurrentPage;
var PageCount;
var PageSize;
var FunName;

/* 跳转到指定页 */
function _go() {
    var pc = parseInt($("#pageCode").val());	/*获取文本框中的当前页码*/
    var pageSize = parseInt($("#pageSize").val());
    if (!/^[1-9]\d*$/.test(pc)) {	/*对当前页码进行整数校验*/
        CallCapacity("","请输入正确的页码！","","");
        return;
    }
    if (pc > PageCount) {/*判断当前页码是否大于最大页*/
        CallCapacity("","请输入正确的页码！","","");
        return;
    }
    getData(pc,pageSize);
}
/* 点击分页 */
function gogo(obj){
    var pageNum = $(obj).attr("pageNum");
    var pageSize = parseInt($("#pageSize").val());
    var currentPage = CurrentPage;
    if("up" == pageNum){
        currentPage = parseInt(currentPage)-1;
    }
    if("down" == pageNum){
        currentPage = parseInt(currentPage)+1;
    }
    if(!isNaN(pageNum)){
        currentPage = parseInt(pageNum);
    }
    getData(currentPage,pageSize);
}

/* 分页插件入口 ，创建分页
 page : 分页信息（总页数，页数大小，当前页数）
 id : 在那个元素中显示
 funName : 执行那个方法
 show : 是否显示页数大小选择
 */
function doPage(pageCount,currentPage,pageSize,id,functionName,show) {

    $(id).html("");

    PageCount = (pageCount % pageSize)==0?pageCount/pageSize:parseInt(pageCount/pageSize)+1;
    CurrentPage = currentPage;
    PageSize = pageSize;
    FunName = functionName;
    if(show){
        generatePageChange(PageSize,PageCount,$(id),"block");	/* 创建页数选择 */
    }else{
        generatePageChange(PageSize,PageCount,$(id),"none");	/* 创建页数选择 */
    }

    $(id).append('<div class="divContent"></div>');
    var pageElement = $(".divContent")[0];

    /* 创建上一页节点 */
    generateUpPart(currentPage,pageElement);
    /* 创建页码节点 */
    generateMiddlePart(PageCount, currentPage, pageElement);
    /* 创建下一页节点 */
    generateDownPart(PageCount, currentPage, pageElement);
    /* 创建页面跳转 */
    generateGoPart(PageCount, currentPage,pageElement);
    $(id).append("<p class='clear'></p>");
}
/* 创建页码选择 */
function generatePageChange(pageSize,pageCount,pageElement,display){
    var pageNumChange = "<div class='pageNumChange' style='display:"+display+"'>"
        +"<span>Showing 1 to "+pageSize+" of "+pageCount+" rows </span>"
        +"<select id='pageSize' style='width:50px;height:25px;'>";
    if(pageSize==10){
        pageNumChange += "<option value='10' selected='selected'>10</option>";
    }else{
        pageNumChange += "<option value='10'>10</option>";
    }
	if(pageSize==20){
        pageNumChange += "<option value='20' selected='selected'>20</option>";
    }else{
        pageNumChange += "<option value='20'>20</option>";
    }
    if(pageSize==25){
        pageNumChange += "<option value='25' selected='selected'>25</option>";
    }else{
        pageNumChange += "<option value='25'>25</option>";
    }
    if(pageSize==50){
        pageNumChange += "<option value='50' selected='selected'>50</option>";
    }else{
        pageNumChange += "<option value='50'>50</option>";
    }
    if(pageSize==100){
        pageNumChange += "<option value='100' selected='selected'>100</option>";
    }else{
        pageNumChange += "<option value='100'>100</option>";
    }
    pageNumChange += "</select><span>rows per page</span></div>";
    pageElement.append(pageNumChange);
}
/* 创建上一页节点 */
function generateUpPart(currentPage,pageElement){
    if(currentPage == 1){
        createSpanPart(pageElement,"preBtn aBtn spanBtnDisabled","false","<span class='icon'></span>上一页");
    }else{
        createSpanPart(pageElement,"preBtn aBtn","true","<span class='icon'></span>上一页","up");
    }
}

/* 创建分页节点
 pageElement:父节点
 className:class名字
 isClick:是否可以点击
 text:元素显示内容
 pageNum:元素标示内容
 */
function createSpanPart(pageElement,className,isClick,text,pageNum){
    var spanHtml = "<span class='"+className+"'";
    if(isClick == "true"){
        spanHtml +=  "pageNum='"+pageNum+"' onclick='gogo(this)'";
    }
    spanHtml +=  ">";
    spanHtml += text;
    spanHtml +=  "</span>";
    $(pageElement).append(spanHtml);
}
/*获取第二个和倒数第二个*/
function getCurrent(pageCount, currentPage){
    var begin;
    var end;
    if(pageCount <= 9){
    	if(pageCount>0){
    		end = pageCount-1;
    	}else{
    		end = 0;
    	}
        begin = 2;
    }else{
        if(currentPage-5 > 0){
            if(currentPage + 4 < pageCount){
                //左边有...
                begin = currentPage - 2;
                //右边有...
                end = currentPage + 2;
            }else{
                /* 只有左边有 */
                begin = pageCount - 7;
                end = pageCount - 1;
            }
        }else{
            /*右边有。。。*/
            begin = 2;
            end = 7;
        }
    }
    return [begin, end];
}

/* 创建页码 */
function generateMiddlePart(pageCount, currentPage, pageElement) {
    var beginAndEnd = getCurrent(pageCount, currentPage);//获取开始结束页码
    var begin = beginAndEnd[0];
    var end = beginAndEnd[1];
    if(currentPage==1){
        createSpanPart(pageElement,"aBtn spanBtnSelected","false",1,1);
    }else{
        createSpanPart(pageElement,"aBtn","true",1,1);
    }
    if(begin > 2 ){
        createSpanPart(pageElement,"aBtn spanApostrophe","false","...");
    }
    for(var i = begin; i <= end; i++){
        if(i == currentPage){
            createSpanPart(pageElement,"aBtn spanBtnSelected","false",i,i);
        }else{
            createSpanPart(pageElement,"aBtn","true",i,i);
        }
    }
    if(end < pageCount - 1){
        createSpanPart(pageElement,"aBtn spanApostrophe","false","...");
    }
    if(pageCount>1){
        if(currentPage==pageCount){
            createSpanPart(pageElement,"aBtn spanBtnSelected","false",pageCount,pageCount);
        }else{
            createSpanPart(pageElement,"aBtn","true",pageCount,pageCount);
        }
    }
}

/* 创建下一页 */
function generateDownPart(pageCount,currentPage,pageElement) {
    if(currentPage >= pageCount){
        createSpanPart(pageElement,"nextBtn aBtn spanBtnDisabled","false","下一页<span class='icon'></span>");
    }else{
        createSpanPart(pageElement,"nextBtn aBtn","true","下一页<span class='icon'></span>","down");
    }
}
/* 创建分页跳转 */
function generateGoPart(pageCount, currentPage, pageElement){
    appendSpanNode(pageElement, " &nbsp;&nbsp;共"+pageCount+"页 ","totalPages");
    appendSpanNode(pageElement, " 到 ");
    appendInputNode(pageElement,currentPage,"inputPagecode", "text", "pageCode");
    appendSpanNode(pageElement, " 页 ");
    appendANode(pageElement, "确定", "_go()", "aSubmit")
}

/**
 * 生成一个span元素节点
 */
function appendSpanNode(parentNode, text, className){
    var spanHtml = "<span class='"+className+"'>"+text+"</span>";
    $(parentNode).append(spanHtml);
}

/**
 * 生成一个a元素节点
 */
function appendANode(parentNode, text, onclickStr, className){
    var aHtml = "<a class='"+className+"' onclick='"+onclickStr+"'>"+text+"</a>"
    $(parentNode).append(aHtml);
}

/**
 * 生成一个input元素节点
 */
function appendInputNode(parentNode, value, className, type, id){
    var inputHtml = "<input class='"+className+"' id='"+id+"' type='"+type+"' value='"+value+"'/>";
    $(parentNode).append(inputHtml);
}
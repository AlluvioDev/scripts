var currLink = location.href;

var params = {};
var paramsArr = currLink.split('?')[1].split('&');
paramsArr.forEach((element) => params[element.replace("%20", " ").split('=')[0]] = element.replace("%20", " ").split('=')[1]); 
console.log(params);
function initTree(){
  if(params.uname) {
    $("#username").text(params.uname);
  }
}
initTree();

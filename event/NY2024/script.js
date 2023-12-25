var currLink = location.href;
var inventorySrc= "https://alluviodev.github.io/scripts/event/NY2024/inventory.json";


var params = {};
var paramsArr = currLink.split('?')[1].split('&');
paramsArr.forEach((element) => params[element.replace("%20", " ").split('=')[0]] = element.replace("%20", " ").split('=')[1]); 
var userInv = params.inv ? params.inv.split(" ") : [];
function initTree(){
  if(params.uname) {
    $("#username").text(params.uname);
  }
}
initTree();
$("#add").hide();

var TOY_ID = "";
var OWNER_NAME = "";
var TOY_TYPE = "";
var POST_ID = "";
var IMG_SRC = "";
var FACE_OWNER = "";
var TEXT = "";
var XPOS = "";
var YPOS = "";
var FILTER = "";

var TOTAL_INV = [];
var realInv = [];

function showInfo(itemId) {
	let infoTemplate = `<p>Выдано пользователю <b>{{OWNER_NAME}}</b> в посте с идентификатором <b>{{PID}}</b></p>`;
	realInv.forEach((item) => {
		if(itemId == item.id) {
			$("#info").html(infoTemplate.replace("{{OWNER_NAME}}", item.owner).replace("{{PID}}", item.post));
			if(!item.img) {
				TOY_ID = item.id;
				OWNER_NAME = params.uname;
				TOY_TYPE = item.type;
				POST_ID = item.post;
				updToyCode();
				document.querySelector("#currentToy > div").classList.add(item.type);
				$("#add").show();
			} else {
				$("#add").hide();
			}
		}
	});
}

var TOY_CODE = ``;
const NEW_ITEM_TEMPLATE = `[code]{
    "id": "{{TOY_ID}}",
    "owner": "{{OWNER_NAME}}",
    "type": "{{TOY_TYPE}}",
    "post": "{{POST_ID}}",
    "img": "{{IMG_SRC}}",
    "faceOwner": "{{FACE_OWNER}}",
    "text": "{{TEXT}}",
    "xPos": "{{XPOS}}",
    "yPos": "{{YPOS}}",
    "filter": "{{FILTER}}"
  }[/code]`;


function updToyCode() {
	TOY_CODE = NEW_ITEM_TEMPLATE
		.replace("{{TOY_ID}}", TOY_ID)
		.replace("{{OWNER_NAME}}", OWNER_NAME)
		.replace("{{TOY_TYPE}}", TOY_TYPE)
		.replace("{{POST_ID}}", POST_ID)
		.replace("{{IMG_SRC}}", IMG_SRC)
		.replace("{{FACE_OWNER}}", FACE_OWNER)
		.replace("{{TEXT}}", TEXT)
		.replace("{{XPOS}}", XPOS)
		.replace("{{YPOS}}", YPOS)
		.replace("{{FILTER}}", FILTER);
	resultCode.value = TOY_CODE;
}

async function loadInv() {
	const response = await fetch(inventorySrc);
	TOTAL_INV = await response.json();
	
	console.log("Load inventory...");
	
	  let toysStr = "";

  
	  TOTAL_INV.forEach((item) => {
		if(currLink.indexOf("edit") > 0 && item.img || !(currLink.indexOf("edit") > 0) && item.owner==params.uname) {
		  if(!item.post) {
			let tmpArr = item.id.split("-");
			item.type = tmpArr[0];
			item.post = tmpArr[1];
		  }
		  realInv.push(item);
			
	let TOY_TEMPLATE = 
`<div class='toy {{ITEM_TYPE}}'
	id='{{ITEM_ID}}'
	title='{{IMG_TITLE}}'
	style='{{XPOS}} {{YPOS}}'
	onclick='{{ONCLICK}}'>
	<div class="userImg" style="{{BG_IMG}} {{FILTER}}"></div><div class="{{ITEM_TYPE}}_mask"></div>
	<div class="userComment"><h3>{{IMG_TITLE}}</h3>{{USER_COMMENT}}</div>
</div>`;
		toy = TOY_TEMPLATE
			.replaceAll("{{ITEM_TYPE}}", item.type)
			.replaceAll("{{ITEM_ID}}", item.id)
			.replaceAll("{{IMG_TITLE}}", item.faceOwner ? item.faceOwner : "")
			.replaceAll("{{USER_COMMENT}}", item.text ? item.text : "")
			.replaceAll("{{BG_IMG}}", item.img ? ("background-image:url(" + item.img + ");") : "")
			.replaceAll("{{XPOS}}", item.xPos ? ("left:" + item.xPos + "px;") : "")
			.replaceAll("{{YPOS}}", item.yPos ? ("top:" + item.yPos + "px;") : "")
			.replaceAll("{{FILTER}}", item.filter ? item.filter : "")
			.replaceAll("{{ONCLICK}}", 'showInfo("' + item.id + '")');
			toysStr += `<li onclick='showInfo("` + item.id + `")'><div class='toy ` + item.type + (item.img ? ` added` : ``) + `' style="position: relative;"></div>` + (item.img ? `Игрушка уже висит!` : `Вы можете повесить эту игрушку.`) + `</li>`;

			if(item.img) {
				$('#tree').after(toy);
			}
		}
		
	  });
	  
	  
	  
	userInv.forEach((toyId) => {
		let exist = false;
		realInv.forEach((item) => {
			if(item.id == toyId) exist = true;
		});
		
		if(!exist) {
			let item = {};
			let tmpArr = toyId.split("-");
			item["id"] = toyId;
			item["type"] = tmpArr[0];
			item["post"] = tmpArr[1];
			realInv.push(item);
			toysStr = `<li onclick='showInfo(` + `"` + item.id + `"` + `)'>`
				+ `<div class='toy ` + item.type + (item.img ? ` added` : ``) + `' style="position: relative;"></div>`
				+ (item.img ? `Игрушка уже висит!` : `Вы можете повесить эту игрушку.`)
				+ `</li>`
				+ toysStr;

		}

	});
	
	  toysStr = "<ul>" + toysStr + "</ul>"
	  
	if(currLink.indexOf("edit") > 0){
		$("#toys").html(toysStr);
	}
}

  loadInv();

var div = document.getElementById('currentToy');
var listener = function(e) {
  div.style.left = e.pageX - 25 + "px";
  xPos.value = e.pageX - 25;
  XPOS = e.pageX - 25;
  div.style.top = e.pageY - 25 + "px";
  yPos.value = e.pageY - 25;
  YPOS = e.pageY - 25;
  updToyCode();
};

currentToy.addEventListener('pointerdown', e => {
   document.addEventListener('pointermove', listener);
});

currentToy.addEventListener('pointerup', e => {
    document.removeEventListener('pointermove', listener);
});

let brightness = 100;
let contrast = 100;
let saturate = 100;
let grayscale = 0;
let invert = 0;
let huerotate = 0;
let sepia = 0;
let dropshadow = 0;
 
const imgture = document.querySelector("#currentToyUserImg")
const resetAll = document.getElementById("resetAll");
 
const slider1 = document.getElementById("slider1");
const value1 = document.getElementById("bright");
const slider2 = document.getElementById("slider2");
const value2 = document.getElementById("contrast");
const slider3 = document.getElementById("slider3");
const value3 = document.getElementById("saturate");
const slider4 = document.getElementById("slider4");
const value4 = document.getElementById("gray");
const slider5 = document.getElementById("slider5");
const value5 = document.getElementById("invert");
const slider6 = document.getElementById("slider6");
const value6 = document.getElementById("hue");
const slider9 = document.getElementById("slider9");
const value9 = document.getElementById("sepia");
 
//Update filters
function updateFilters() {
	imgture.style.filter =
		"brightness(" +
		brightness +
		"%) contrast(" +
		contrast +
		"%) saturate(" +
		saturate +
		"%) grayscale(" +
		grayscale +
		"%) invert(" +
		invert +
		"%) hue-rotate(" +
		huerotate +
		"deg) sepia(" +
		sepia +
		"%)";
	FILTER = 
		"filter: brightness(" +
		brightness +
		"%) contrast(" +
		contrast +
		"%) saturate(" +
		saturate +
		"%) grayscale(" +
		grayscale +
		"%) invert(" +
		invert +
		"%) hue-rotate(" +
		huerotate +
		"deg) sepia(" +
		sepia +
		"%)";
	updToyCode();
}
//Reset All
resetAll.addEventListener("click", function() {
	console.log("resset");
	brightness = 100;
	slider1.value = 100;
	value1.innerHTML = slider1.value + "%";
	contrast = 100;
	slider2.value = 100;
	value2.innerHTML = slider2.value + "%";
	saturate = 100;
	slider3.value = 100;
	value3.innerHTML = slider3.value + "%";
	grayscale = 0;
	slider4.value = 0;
	value4.innerHTML = slider4.value + "%";
	invert = 0;
	slider5.value = 0;
	value5.innerHTML = slider5.value + "%";
	huerotate = 0;
	slider6.value = 0;
	value6.innerHTML = slider6.value + "px";
	sepia = 0;
	slider9.value = 0;
	value9.innerHTML = slider9.value + "%";
	updateFilters();
});
 
//Brightness slider
slider1.addEventListener("input", function() {
	console.log(slider1.value);
	value1.innerHTML = slider1.value + "%";
	brightness = slider1.value;
	updateFilters();
});
 
//Contrast slider
slider2.addEventListener("input", function() {
	value2.innerHTML = slider2.value + "%";
	contrast = slider2.value;
	updateFilters();
});

//Saturation slider
slider3.addEventListener("input", function() {
	value3.innerHTML = slider3.value + "%";
	saturate = slider3.value;
	updateFilters();
});
 
//Grayscale slider
slider4.addEventListener("input", function() {
	value4.innerHTML = slider4.value + "%";
	grayscale = slider4.value;
	updateFilters();
});
//Invert slider
slider5.addEventListener("input", function() {
	value5.innerHTML = slider5.value + "%";
	invert = slider5.value;
	updateFilters();
});
 
//Hue-rotate slider
slider6.addEventListener("input", function() {
	value6.innerHTML = slider6.value + "°";
	huerotate = slider6.value;
	updateFilters();
});
 
//Sepia slider
slider9.addEventListener("input", function() {
	value9.innerHTML = slider9.value + "%";
	sepia = slider9.value;
	updateFilters();
});

// Img link
imgLink.addEventListener("change", (event) => {
	$('#currentToy .userImg').css('background-image', 'url(' + imgLink.value + ')');
	IMG_SRC = imgLink.value;
	updToyCode();
});

faceOwner.addEventListener("change", (event) => {
	currentToy.title = faceOwner.value;
	FACE_OWNER = faceOwner.value;
	updToyCode();
});

commentText.addEventListener("change", (event) => {
	TEXT = commentText.value
		.replaceAll("\"", "&quot;")
		.replaceAll("\\", "&#92;")
		.replaceAll("\n", "<br>");
	updToyCode();
});
// Copies a string to the clipboard. Must be called from within an event handler such as click.
// May return false if it failed, but this is not always
// possible. Browser support for Chrome 43+, Firefox 42+, Edge and IE 10+.
// No Safari support, as of (Nov. 2015). Returns false.
// IE: The clipboard feature may be disabled by an adminstrator. By default a prompt is
// shown the first time the clipboard is used (per session).
function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text); 

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function copyCode() {
    var result = copyToClipboard(resultCode.value);
    console.log("copied?", result);
};

const version = "v2.11"; // Обнови меня, если меняешь код!

const DEBUG_MODE = true; // true - уведомление никогда не исчезает, false  - всё работает в нормальном режиме.
const UPDATE_INTERVAL_IN_MS = 120_000; //120_000 (2 min) | 3_600_000 (1h) | 43_200_000 (12h) | 86_400_000 (24h)

/* ==== STYLE SETTINGS ==== */
/* Обёртка для всей панельки */
const MESSAGE_PANEL_WRAPPER_CLASS = `alert_wrapper`;
const MESSAGE_PANEL_WRAPPER_START = `<div class='` + MESSAGE_PANEL_WRAPPER_CLASS + `'>`;
const MESSAGE_PANEL_WRAPPER_END = `</div>`;
/* Крестик закрывания окошка. */
const MESSAGE_CLOSE_BTN_CLASS = `close_alert`;
const MESSAGE_CLOSE_BTN = `<a class="` + MESSAGE_CLOSE_BTN_CLASS + `">×</a>`;
/* Обёртка для изменений в одной вкладке */
const MESSAGE_BLOCK_START = `<div class='alert_block'>`;
const MESSAGE_BLOCK_END = `</div>`;
/* Обёртка для имени изменённого раздела */
const MESSAGE_TITLE_START = `<div class='alert_blockTitle'>Изменён раздел `;
const MESSAGE_TITLE_END = `!</div>`;
/* Обёртка для списка изменённых предметов */
const MESSAGE_ITEMS_ROW_START = `<div class='alert_blockItems'>`;
const MESSAGE_ITEMS_ROW_END = `</div>`;
/* Обёртка для добавленного предмета */
const MESSAGE_ITEM_ADDED_START = `<span class='alert_addedItem'>`;
const MESSAGE_ITEM_ADDED_END = `</span>`;
/* Обёртка для удадённого предмета */
const MESSAGE_ITEM_DELETED_START = `<span class='alert_deletedItem'>`;
const MESSAGE_ITEM_DELETED_END = `</span>`;

const STYLE = `<style>
.alert_wrapper {
    width: 514px;
    background: #122634;
    color: #cbcbcb;
    height: 271px;
    padding: 20px;
    text-align: center;
    border: double 4px #23486a;
    box-shadow: 0px 0px 19px #0000006e inset;
    overflow: auto;
    position: fixed;
    top: 25vh;
    right: 0;
    bottom: 25vh;
    left: 0;
    margin: auto;
    z-index: 1000;
}

.alert_block {
    padding: 0px 0px 0px 0px;
    width: 478px;
    height: 93px;
    margin: 14px 18px;
    overflow: auto;
}     

.alert_blockTitle {
        text-transform: uppercase;
    font-family: 'Cormorant';
    text-align: center;
    font-weight: 400;
    font-size: 13px;
    letter-spacing: 0.7px;
    text-shadow: 0px 0px 4px #000000a6;
    margin-bottom: 10px;
}

.alert_blockItems {
    width: 475px;
}

.alert_addedItem {
    padding: 3px;
}

.alert_deletedItem {
    opacity: 10%;
    filter: alpha(opacity=40);
}

.close_alert {
    font-size: 27px;
    position: absolute;
    top: 8px;
    right: 11px;
    color: #4b72a3;
    text-shadow: 0 -1px 1px rbga(0,0,0,.6);
    font-weight: bold;
    cursor: pointer;
    text-decoration: none;
}

.close_alert a:hover {
color: #1f242a85 !important;
}
</style>`;

console.log("init inventoryAlert plugin " + version);
if(DEBUG_MODE) console.log("DEBUG_MODE on");
function saveCurrentInventory() {
	let inventory = JSON.stringify(getCurrentInventory());

	$.ajax({
		url: '/api.php',
		method: 'post',
		dataType: 'json',
		data: {
			token: ForumAPITicket,
			method: "storage.set",
			key: "backup_inventory",
			value: inventory
		},
		async: false,
		success: function(data){
			// console.log(data);
		}
	});
}

function getLastInventory() {
	let inventory;
	$.ajax({
		url: '/api.php',
		method: 'get',
		dataType: 'json',
		data: {
			method: "storage.get",
			key: "backup_inventory"
		},
		async: false,
		success: function(data){
			// console.log(data);
			inventory = eval('(' + data.response.storage.data.backup_inventory + ')');
		}
	});
	return inventory;
}
function getCurrentInventory() {
	var doc = new DOMParser().parseFromString(UserFld5, "text/html");
	let invId = $( doc.documentElement.textContent ).find('a').attr('id');
  
	let current = new Date();
	current = current.getTime();
  
	let currentInventory = [];
	currentInventory[0] = current;
	
	$.ajax({
		url: '/pages/'+invId,
		method: 'get',
		data: {
			token: ForumAPITicket
		},
		async: false,
		success: function(data){
			let d = $(data);
			currentInventory[1] = $(d).find('#sm1').html();
			currentInventory[2] = $(d).find('#sm2').html();
			currentInventory[3] = $(d).find('#sm3').html();
			currentInventory[4] = $(d).find('#sm4').html();
			currentInventory[5] = $(d).find('#sm5').html();
		}
	});
	return currentInventory;
}

function showAlertIfInventoryChanged() {
	// console.log("Get last inv...");
	let oldInventoryArr = getLastInventory();
	if(!oldInventoryArr) {
		// console.log("Last inv not exist...");
		saveCurrentInventory();
		// console.log("Curr inv saved");
		return;
	}
	// console.log("Last inv getted");
	
	// console.log("Get curr inv...");
	let newInventory = getCurrentInventory();
	// console.log("Curr inv getted");
	
	if(oldInventoryArr[0] + UPDATE_INTERVAL_IN_MS > newInventory[0]) {/* console.log("Inv too fresh"); */ if(!DEBUG_MODE) return;}
	
	if(oldInventoryArr[1] === newInventory[1]
		&& oldInventoryArr[2] === newInventory[2]
		&& oldInventoryArr[3] === newInventory[3]
		&& oldInventoryArr[4] === newInventory[4]
		&& oldInventoryArr[5] === newInventory[5]) {
		saveCurrentInventory();
		// console.log("No changes!");
		if(!DEBUG_MODE) return;
	}
	// console.log("Find changes!");
	
	let message = "";
	for(let i = 1; i < newInventory.length; i++) {
		if(!(oldInventoryArr[i] === newInventory[i])) {
			message += MESSAGE_BLOCK_START + MESSAGE_TITLE_START;
			switch(i) {
				case 1: message += `"Награды"`; break;
				case 2: message += `"Артефакты"`; break;
				case 3: message += `"Ачивки"`; break;
				case 4: message += `"Иконки"`; break;
				case 5: message += `"Подарки"`; break;
			}
			message += MESSAGE_TITLE_END;
			message += MESSAGE_ITEMS_ROW_START;
	// console.log("Get diffs #" + i + "...");
			message += getItems(oldInventoryArr[i], newInventory[i]);
	// console.log("Diffs getted!");
			message += MESSAGE_ITEMS_ROW_END + MESSAGE_BLOCK_END;
		}
	}
	// console.log("Save curr inv...");
	saveCurrentInventory();
	// console.log("Curr inv saved");

	$('body').append(STYLE);
	if(DEBUG_MODE) {
		message = `<div class="alert_block"><div class="alert_blockTitle">Изменён раздел "Артефакты"!</div><div class="alert_blockItems"><span class="alert_deletedItem"><img src="https://forumupload.ru/uploads/001a/b7/b5/5/169367.png" title="вместо 1 тысячи слов"></span> <span class="alert_deletedItem"><img src="https://forumupload.ru/uploads/001a/b7/b5/5/169367.png" title="вместо 2 тысячи слов"></span> <span class="alert_deletedItem"><img src="https://forumupload.ru/uploads/001a/b7/b5/5/169367.png" title="вместо 3 тысячи слов"></span></div></div><div class="alert_block"><div class="alert_blockTitle">Изменён раздел "Подарки"!</div><div class="alert_blockItems"><span class="alert_addedItem"><img src="https://forumupload.ru/uploads/001a/b7/b5/5/169367.png" title="вместо 1 тысячи слов"></span> <span class="alert_addedItem"><img src="https://forumupload.ru/uploads/001a/b7/b5/5/169367.png" title="вместо 2 тысячи слов"></span> <span class="alert_addedItem"><img src="https://forumupload.ru/uploads/001a/b7/b5/5/169367.png" title="вместо 3 тысячи слов"></span></div></div>`;
	}
	$('body').append(MESSAGE_PANEL_WRAPPER_START + MESSAGE_CLOSE_BTN + message + MESSAGE_PANEL_WRAPPER_END);
}
function closeAlertWindow() {
	console.log("Inventory alert closed.");
	$('.' + MESSAGE_PANEL_WRAPPER_CLASS).hide();
	$('body').remove("." + MESSAGE_PANEL_WRAPPER_CLASS);
}
showAlertIfInventoryChanged();
$('.' + MESSAGE_CLOSE_BTN_CLASS).on("click", ".menu_button", function() { closeAlertWindow()});

function getItems(oldItemsString, newItemsString) {
	let oldItemsArr = oldItemsString ? splitItemsStringToArr(oldItemsString.replace(/[\r\n\t]+/g, '').trim()) : [];
	let newItemsArr = newItemsString ? splitItemsStringToArr(newItemsString.replace(/[\r\n\t]+/g, '').trim()) : [];
	
	var result = [];
	for (var i = 0; i < oldItemsArr.length; i++) {
		if (newItemsArr.indexOf(oldItemsArr[i]) === -1) {
			result.push(MESSAGE_ITEM_DELETED_START + oldItemsArr[i] + MESSAGE_ITEM_DELETED_END);
		}
	}
	for (i = 0; i < newItemsArr.length; i++) {
		if (oldItemsArr.indexOf(newItemsArr[i]) === -1) {
			result.push(MESSAGE_ITEM_ADDED_START + newItemsArr[i] + MESSAGE_ITEM_ADDED_END);
		}
	}
	return result.join(" ");
}

function splitItemsStringToArr(istr) {
	let arr = [];
	$(istr).filter('img').each(function(idx, ctx) {arr.push(ctx.outerHTML.toString())});
	return arr;
}

const UPDATE_INTERVAL_IN_MS = 120_000; //120_000 (2 min) | 3_600_000 (1h) | 43_200_000 (12h) | 86_400_000 (24h)

/* ==== STYLE SETTINGS ==== */
/* id контейнера, куда будет выводиться список изменений. При значении "" будет выводиться в консоль. */
const MESSAGE_CONTAINER_ID = "";
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
    position: absolute;
    margin: 0;
    padding: 20px;
    text-align: center;
    border: double 4px #23486a;
    box-shadow: 0px 0px 19px #0000006e inset;
    overflow: auto;
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
</style>`;

console.log("init inventoryAlert plugin v2.03");		
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
	
	if(oldInventoryArr[0] + UPDATE_INTERVAL_IN_MS > newInventory[0]) {/* console.log("Inv too fresh"); */ return;}
	
	if(oldInventoryArr[1] === newInventory[1]
		&& oldInventoryArr[2] === newInventory[2]
		&& oldInventoryArr[3] === newInventory[3]
		&& oldInventoryArr[4] === newInventory[4]
		&& oldInventoryArr[5] === newInventory[5]) {
		saveCurrentInventory();
		// console.log("No changes!");
		return;
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
	$('body').append('<div class="alert_wrapper">' + message + '</div>');
}
showAlertIfInventoryChanged();

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

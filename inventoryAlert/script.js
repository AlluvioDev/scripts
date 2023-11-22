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
			console.log(data);
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
			console.log(data);
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
	console.log("Get last inv...");
	let oldInventoryArr = getLastInventory();
	if(!oldInventoryArr) {
		console.log("Last inv not exist...");
		saveCurrentInventory();
		console.log("Curr inv saved");
		return;
	}
	console.log("Last inv getted");
	
	console.log("Get curr inv...");
	let newInventory = getCurrentInventory();
	console.log("Curr inv getted");
	
	let msInOneDay = 120000; //86400000; // 1 000(ms) * 60(s) * 60(m) * 24(h)
	
	if(oldInventoryArr[0] + msInOneDay > newInventory[0]) {console.log("Inv too fresh"); return;}
	
	if(oldInventoryArr[1] === newInventory[1]
		&& oldInventoryArr[2] === newInventory[2]
		&& oldInventoryArr[3] === newInventory[3]
		&& oldInventoryArr[4] === newInventory[4]
		&& oldInventoryArr[5] === newInventory[5]) {
		saveCurrentInventory();
		console.log("No changes!");
		return;
	}
	console.log("Find changes!");
	
	let message = "";
	for(let i = 1; i < newInventory.length; i++) {
		if(!(oldInventoryArr[i] === newInventory[i])) {
			message += `<div class='alert_block'><div class='alert_blockTitle'>Изменён раздел `;
			switch(i) {
				case 1: message += `"Награды"`; break;
				case 2: message += `"Артефакты"`; break;
				case 3: message += `"Ачивки"`; break;
				case 4: message += `"Иконки"`; break;
				case 5: message += `"Подарки"`; break;
			}
			message += `!</div>`;
			message += `<div class='alert_blockItems'>`;
	console.log("Get diffs #" + i + "...");
			message += getItems(oldInventoryArr[i], newInventory[i]);
	console.log("Diffs getted!");
			message += `</div></div>`;
		}
	}
	console.log("Save curr inv...");
	saveCurrentInventory();
	console.log("Curr inv saved");
	let style=`<style>
		.alert_deletedItem > *{     border: 3px solid red; opacity:0.6;}
		.alert_deletedItem:before { content: "I'm deleted: ";}
		.alert_addedItem > *{     border: 3px solid green; }
		.alert_addedItem:before { content: "I'm added: ";}
	</style>`;
	
	$('body').append(style);
	
	$('body').append('<div class="alert_panel" style="display:block;color:#ffffff;position:fixed;width: 400px;height: 200px;top: 50%;margin-top: -100px;margin-left: -200px;padding: 20px;left: 50%;background-color:rgba(0, 0, 0, 0.9);z-index:990;border-radius: 4px;"></div>');
		$('.alert_panel').append('<div>' + message + '</div>');
		
	
		
}

function getItems(oldItemsString, newItemsString) {
	let oldItemsArr = oldItemsString ? splitItemsStringToArr(oldItemsString.replace(/[\r\n\t]+/g, '').trim()) : [];
	let newItemsArr = newItemsString ? splitItemsStringToArr(newItemsString.replace(/[\r\n\t]+/g, '').trim()) : [];
	
	var result = [];
	for (var i = 0; i < oldItemsArr.length; i++) {
		if (newItemsArr.indexOf(oldItemsArr[i]) === -1) {
			result.push("<span class='alert_deletedItem'>" + oldItemsArr[i] + "</span>");
		}
	}
	for (i = 0; i < newItemsArr.length; i++) {
		if (oldItemsArr.indexOf(newItemsArr[i]) === -1) {
			result.push("<span class='alert_addedItem'>" + newItemsArr[i] + "</span>");
		}
	}
	return result.join(" ");
}

function splitItemsStringToArr(istr) {
	let arr = [];
	$(istr).filter('img').each(function(idx, ctx) {arr.push(ctx.outerHTML.toString())});
	return arr;
}

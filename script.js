console.log('5etop chrome extension is running...');

var items_dota2 = getDataFromLocalStorage();

function getDataFromLocalStorage() {
	const temp_storage = JSON.parse(localStorage.getItem('items_dota2_storage'));
	if (temp_storage && Array.isArray(temp_storage)) {
		return temp_storage;
	} else {
		delete localStorage.items_dota2_storage;
		return [];
	}
}

// declear
const URL_PROXY = 'https://cors-anywhere.herokuapp.com/'; // to disable CORS
// const STEAM_API = "https://steamcommunity.com/market/priceoverview/?appid=570&currency=1&market_hash_name=";
const STEAM_LIST_API = "https://steamcommunity.com/market/itemordershistogram?country=VN&language=english&currency=1&item_nameid=";
const STEAM_LIST_LINK = 'https://steamcommunity.com/market/listings/570/';
// end declear

async function ingotexchangeitem(e) {
	let instant = $(e);
	let parent = instant.parent();
	let item_price = instant.attr('data-price');
	let item_name = instant.attr('data-itemname').trim();
	let item_name_2 = parent.find('p.item_name').text().trim();
	console.clear();
	let steam_data = null;
	let item_nameid = null;
	if (item_name !== item_name_2) {
		item_name = item_name_2.charAt(0).toUpperCase() + item_name_2.slice(1);
	}
	// check items in localStorage 
	for (let el of items_dota2) {
		if (el.name == item_name) {
			item_nameid = el.nameid;
			console.log('Get item_namid of ' + item_name + ' in localStorage');
			break;
		}
	}
	if (item_nameid == null) {
		console.log('Get item_namid of ' + item_name + ' by API');
		item_nameid = await getItemId(item_name);
	}
	// end check
	if (item_nameid >= 0) {
		steam_data = await getData(STEAM_LIST_API + item_nameid);
		if (steam_data.success == 1) {
			let order_rate = 0;
			let sell_rate = 0;
			const rate_wallet = document.getElementById('myIngotTabContent').getAttribute('e_wallet_rate');
			const highest_buy_order = parseFloat(steam_data.highest_buy_order) / 100;
			const lowest_sell_order = parseFloat(steam_data.lowest_sell_order) / 100;
			// start log
			console.log('Searching for ' + item_name);
			console.log('- wallet rate:', rate_wallet);
			console.log('- highest buy order: ', highest_buy_order);
			console.log('- lowest sell order: ', lowest_sell_order);
			// end log
			if (highest_buy_order)
				order_rate = calcRate(rate_wallet, item_price, highest_buy_order);
			if (lowest_sell_order)
				sell_rate = calcRate(rate_wallet, item_price, lowest_sell_order);
			// fill in text
			instant.text('[ord: ' + order_rate + '; sell: ' + sell_rate + ']');
		}
	}
	function calcRate(rate_wallet, etop_price, steam_price) {
		return Number.parseFloat(steam_price * rate_wallet / etop_price).toFixed(2);
	}
}

function getData(uri_api) {
	return $.get(URL_PROXY + uri_api, function (res) {
		try {
			console.log("Success fetch data");
		} catch (err) {
			console.log("Error: " + err);
		}
	});
}

async function getItemId(item_name) {
	const regex = /Market_LoadOrderSpread\((.*?)\)/gm;
	let m;
	let data = await getData(STEAM_LIST_LINK + item_name);
	while ((m = regex.exec(data)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (m.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		// The result can be accessed through the `m`-variable.
		for (let match of m) {
			if (parseInt(match.trim()) >= 0) {
				let value = match.trim();
				items_dota2.push({ name: item_name, nameid: value });
				localStorage.setItem('items_dota2_storage', JSON.stringify(items_dota2));
				console.log('item_nameid: ', value);
				return value;
			}
		}
	}
}

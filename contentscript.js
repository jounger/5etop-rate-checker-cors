function injectScript() {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('script.js');
    (document.head || document.documentElement).appendChild(s);
    s.onload = function () {
        s.parentNode.removeChild(s);
    };
}

chrome.storage.sync.get('e_rate', function (result) {
    let localRate = result.e_rate ? result.e_rate : 14; // default wallet rate
    document.getElementById('myIngotTabContent').setAttribute('e_wallet_rate', localRate);
});

chrome.storage.sync.get('e_status', function (result) {
    if (result.e_status == true)
        injectScript();
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        const etopDOM = document.getElementById('myIngotTabContent');
        if (request.e_rate >= 0) {
            etopDOM.setAttribute('e_wallet_rate', request.e_rate);
            sendResponse({ farewell: "Get success rate" });
        }
        if (request.e_status != null) {
            location.reload();
            injectScript();
            sendResponse({ farewell: "Get success status" });
        }
    });
function getLocalRate() {
    return new Promise((resolve, reject) => {
        let inputField = document.getElementById('e_wallet_rate');
        let localRate = 0;
        chrome.storage.sync.get('e_rate', function (result) {
            localRate = result.e_rate ? result.e_rate : 14; // default wallet rate
            if(inputField)
                inputField.value = localRate; // set value to input
            resolve(result.e_rate);
        });
    })
}

document.addEventListener("DOMContentLoaded", function () {

    chrome.storage.sync.get('e_status', function (result) {
        let statusDOM = document.getElementById("e_status_toggle");
        if(statusDOM)
            statusDOM.checked = result.e_status;
        getLocalRate().then(res => sendMessageToContent({ e_rate: res }));
    });

    const applyBtn = document.getElementById("e_change");
    const statusChecked = document.getElementById("e_status_toggle");
    if(applyBtn)
        applyBtn.addEventListener("click", saveRateToLocal); // popup save button
    if(statusChecked)
        statusChecked.addEventListener("click", saveExtensionStatus); // popup toggle input

    function saveRateToLocal() {
        // Get a value saved in a form.
        let value = document.getElementById('e_wallet_rate').value;
        let messageTag = document.getElementById('e_message');
        // Save it using the Chrome extension storage API.
        let floatValue = parseFloat(value);
        if (value &&  floatValue > 0) {
            chrome.storage.sync.set({ 'e_rate': floatValue }, function () {
                messageTag.innerHTML = 'Settings saved';
                sendMessageToContent({ e_rate: floatValue });
            });
        } else {
            messageTag.innerHTML = 'Error: No value specified';
        }
    }

    function saveExtensionStatus() {
        let status = document.getElementById('e_status_toggle').checked;
        chrome.storage.sync.set({ 'e_status': status }, function () {
            sendMessageToContent({ e_status: status });
        });
    }

    function sendMessageToContent(message) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
                if(response)
                    console.log(response.farewell);
            });
        });
    }
});


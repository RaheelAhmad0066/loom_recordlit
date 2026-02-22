chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_RECORDING') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (!activeTab) {
                sendResponse({ success: false, error: 'No active tab found' });
                return;
            }

            // In a real production extension, we'd use chrome.tabCapture.getMediaStreamId
            // and then open a new tab or use the current app to process the stream.
            // For this demo, we'll redirect the user to our web app's record page.
            chrome.tabs.create({ url: 'https://recordly.dev/record' });
            sendResponse({ success: true });
        });
        return true; // Keep channel open for async response
    }
});

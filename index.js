// Get the current URL. Got it from the startup exemple for chrome extensions.
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true,
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

// Attach the event listener.
chrome.browserAction.onClicked.addListener(function(activeTab)
{
  getCurrentTabUrl(function(URL) {
    // Create the link for PageSpeed Insights.
    var psiURL = 'https://developers.google.com/speed/pagespeed/insights/?url=' + encodeURIComponent(URL);

    // Open the Insights page in a new tab.
    chrome.tabs.create({ url: psiURL });
  });
});

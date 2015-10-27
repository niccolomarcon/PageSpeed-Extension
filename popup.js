// Calls Google's APIs to get the result
function callApi(url, callback, fallback) {
  var api = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=';
  var enUrl = encodeURIComponent(url);
  var mobileResult;

  var mXmlHttp = new XMLHttpRequest();
  var dXmlHttp = new XMLHttpRequest();
  mXmlHttp.open('GET', api + enUrl + '&strategy=mobile', true);
  dXmlHttp.open('GET', api + enUrl + '&strategy=desktop', true);

  // Setting the request to start the second one if gets the data
  mXmlHttp.onreadystatechange = function() {
    if (mXmlHttp.readyState == 4 && mXmlHttp.status == 200) {
      var response = JSON.parse(mXmlHttp.responseText);
      mobileResult = response.ruleGroups.SPEED.score;
      dXmlHttp.send();
    } else if (mXmlHttp.status != 200) {
      fallback(1, 0, 0);
    }
  };

  // Calls the callback sending the points
  dXmlHttp.onreadystatechange = function() {
    if (dXmlHttp.readyState == 4 && dXmlHttp.status == 200) {
      var response = JSON.parse(dXmlHttp.responseText);
      callback({
        mobile: mobileResult,
        desktop: response.ruleGroups.SPEED.score
      });
    } else if (dXmlHttp.status != 200) {
      fallback(1, 0, 0);
    }
  };

  // Kick off the first request
  mXmlHttp.send();
}

// Get the current tab URL using chrome extnsion's APIs
function getCurrentTabUrl(callback) {
  // Setting the query options
  var queryInfo = {
    active: true,
    currentWindow: true,
  };

  // Get the current tab and calling the callback
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

// Print the result
function printResult(res) {
  var thresholdGood = 85; var thresholdWarn = 65;
  var green = '#009a2d'; var yellow = '#fda100'; var red = '#dd4b39';

  // Gets the html elements
  var mPoints = document.getElementById('mobilePoints');
  var mIcon   = document.getElementById('mobileIcon');
  var dPoints = document.getElementById('desktopPoints');
  var dIcon   = document.getElementById('desktopIcon');

  // Display the scores
  mPoints.innerHTML = res.mobile;
  dPoints.innerHTML = res.desktop;

  // Select the right class and color
  switch (true) {
    case(res.mobile >= thresholdGood):
      mPoints.style.background = green;
      mIcon.className += ' mobile_excellent';
      break;
    case(res.mobile >= thresholdWarn):
      mPoints.style.background = yellow;
      mIcon.className += ' mobile_warning';
      break;
    default:
      mPoints.style.background = red;
      mIcon.className += ' mobile_error';
  }

  switch (true) {
    case(res.desktop >= thresholdGood):
      dPoints.style.background = green;
      dIcon.className += ' desktop_excellent';
      break;
    case(res.desktop >= thresholdWarn):
      dPoints.style.background = yellow;
      dIcon.className += ' desktop_warning';
      break;
    default:
      dPoints.style.background = red;
      dIcon.className += ' desktop_error';
  }

  display(0, 0, 1);
}

function display(error, loading, data) {
  document.getElementById('error').style.display   = error   ? 'block' : 'none';
  document.getElementById('loading').style.display = loading ? 'block' : 'none';
  document.getElementById('data').style.display    = data    ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  // Load URL tab
  getCurrentTabUrl(function(url) {

    // Set the show more button with the user settings
    document.getElementById('show').addEventListener('click', function() {
      chrome.storage.sync.get(defaultOptions, function(item) {
        if (item.psi) {
          var psiURL = APIs.psi + encodeURIComponent(url);
          chrome.tabs.create({url: psiURL});
        }
      });
    });

    // Set the onclick event of the link to start a new request
    document.getElementById('tryAgain').onclick = function() {
      display(0, 1, 0);
      callApi(url, printResult, display);
    };

    // Kick off the first request
    callApi(url, printResult, display);
  });
});

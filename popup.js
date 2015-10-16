// Calls Google's APIs to get the result
function callApi(url, callback, fallback) {
  var api = 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=';
  var enUrl = encodeURIComponent(url);
  var mobileResult;

  var mXmlHttp = new XMLHttpRequest();
  var dXmlHttp = new XMLHttpRequest();
  mXmlHttp.open('GET', api + enUrl + '&strategy=mobile', true);
  dXmlHttp.open('GET', api + enUrl + '&strategy=desktop', true);

  mXmlHttp.onreadystatechange = function() {
    if (mXmlHttp.readyState == 4 && mXmlHttp.status == 200) {
      var response = JSON.parse(mXmlHttp.responseText);
      mobileResult = response.ruleGroups.SPEED.score;
      dXmlHttp.send();
    } else if (mXmlHttp.status != 200) {
      fallback(1, 0, 0);
    }
  };

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

  mXmlHttp.send();
}

// Get the current tab URL using chrome extnsion's APIs
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

// Print the result
function printResult(res) {
  var thresholdGood = 85; var thresholdWarn = 65;
  var green = '#009a2d'; var yellow = '#fda100'; var red = '#dd4b39';

  var mColor; var mClass; var dColor; var dClass;

  // Check results for mobile
  if (res.mobile >= thresholdGood) {
    mColor = green;
    mClass = ' mobile_excellent';
  } else if (res.mobile >= thresholdWarn) {
    mColor = yellow;
    mClass = ' mobile_warning';
  } else {
    mColor = red;
    mClass = ' mobile_error';
  }

  // Check results for desktop
  if (res.desktop >= thresholdGood) {
    dColor = green;
    dClass = ' desktop_excellent';
  } else if (res.desktop >= thresholdWarn) {
    dColor = yellow;
    dClass = ' desktop_warning';
  } else {
    dColor = red;
    dClass = ' desktop_error';
  }

  // Show the results
  mPoints = document.getElementById('mobilePoints');
  mIcon = document.getElementById('mobileIcon');
  dPoints = document.getElementById('desktopPoints');
  dIcon = document.getElementById('desktopIcon');

  mPoints.innerHTML = res.mobile;
  mPoints.style.background = mColor;
  mIcon.className += mClass;

  dPoints.innerHTML = res.desktop;
  dPoints.style.background = dColor;
  dIcon.className += dClass;

  display(0, 0, 1);
}

function display(error, loading, data) {
  document.getElementById('error').style.display   = error ? 'block' : 'none';
  document.getElementById('loading').style.display = loading ? 'block' : 'none';
  document.getElementById('data').style.display    = data ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  // Load URL tab
  getCurrentTabUrl(function(url) {
    document.getElementById('show').addEventListener('click', function() {
      chrome.storage.sync.get(defaultOptions, function(item) {
        if (item.psi) {
          var psiURL = APIs.psi + encodeURIComponent(url);
          chrome.tabs.create({url: psiURL});
        }
      });
    });
    document.getElementById('tryAgain').onclick = function() {
      display(0, 1, 0);
      callApi(url, printResult, display);
    };
    callApi(url, printResult, display);
  });
});

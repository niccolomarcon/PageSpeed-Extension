// Calls Google's APIs to get the result
function callApi(url, callback) {
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
    }
  };

  dXmlHttp.onreadystatechange = function() {
    if (dXmlHttp.readyState == 4 && dXmlHttp.status == 200) {
      var response = JSON.parse(dXmlHttp.responseText);
      callback({
        mobile: mobileResult,
        desktop: response.ruleGroups.SPEED.score
      });
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
}

function toogleLoading() {
  document.getElementById('data').style.display = 'block';
  document.getElementById('loading').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  // Load URL tab
  getCurrentTabUrl(function(url) {
    // Get results with PSI's APIs
    callApi(url, function(result) {
      // Show results
      toogleLoading();
      printResult(result);

      // Open new tab(s) when clicking the "Show more" button
      document.getElementById('show').addEventListener('click', function() {
        var psiAPI =
          'https://developers.google.com/speed/pagespeed/insights/?url=';

        chrome.storage.sync.get(function(item) {
          if (item.psi) {
            var psiURL = psiAPI + encodeURIComponent(url);
            chrome.tabs.create({url: psiURL});
          }
        });
      });
    });
  });
});

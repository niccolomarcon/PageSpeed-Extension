// Saves options to chrome.storage
function saveOptions() {
  var psi = document.getElementById('psi').checked;
  chrome.storage.sync.set({
    psi: psi
  }, function() {
    // Show the alert
    setTimeout(function() {
      // Vanish the alert
    }, 3000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    psi: true
  }, function(items) {
    document.getElementById('psi').checked = items.psi;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

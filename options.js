// Saves options to chrome.storage
function saveOptions() {
  var psi = document.getElementById('psi').checked;
  chrome.storage.sync.set({
    'psi': psi
  }, function() {
    // Update status to let user know options were saved.
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  // Use default value
  chrome.storage.sync.get(defaultOptions, function(items) {
    document.getElementById('psi').checked = items.psi;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

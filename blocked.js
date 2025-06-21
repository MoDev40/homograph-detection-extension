// Handle the back button click
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('back');
  if (backButton) {
    backButton.addEventListener('click', function() {
      // Send a message to the background script to handle the navigation
      chrome.runtime.sendMessage({action: 'navigateToNewTab'});
    });
  }
});

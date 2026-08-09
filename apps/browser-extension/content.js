// Content Script for MIL ECHO Chrome Extension
console.log("MIL ECHO Content Script initialized.");

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NEW_CARD_AUDITED") {
    console.log("Received new audited card from extension background worker:", message.card);
    
    // Relay to window via postMessage & LocalStorage for web client sync
    try {
      const existing = JSON.parse(localStorage.getItem('viral_spiral_extension_deck') || '[]');
      const updated = [message.card, ...existing];
      localStorage.setItem('viral_spiral_extension_deck', JSON.stringify(updated));
      
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('viral_spiral_deck_channel');
        channel.postMessage({ type: 'NEW_CARD_AUDITED', card: message.card });
        channel.close();
      }
    } catch (e) {
      console.warn("Storage sync failed:", e);
    }
  }
  sendResponse({ status: "received" });
});

document.addEventListener('DOMContentLoaded', () => {
  const statusBadge = document.getElementById('statusBadge');
  const deckCount = document.getElementById('deckCount');
  const openArenaBtn = document.getElementById('openArenaBtn');

  // Check AI Service Health
  fetch('http://localhost:8000/health')
    .then((res) => res.json())
    .then((data) => {
      if (data.status === 'healthy') {
        statusBadge.textContent = '🟢 AI Service Connected (Port 8000)';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        statusBadge.style.color = '#10b981';
      }
    })
    .catch(() => {
      statusBadge.textContent = '🟡 AI Service Offline (Using Socratic Fallback)';
      statusBadge.style.background = 'rgba(255, 183, 3, 0.2)';
      statusBadge.style.color = '#ffb703';
    });

  // Check stored cards count
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({ viral_spiral_extension_deck: [] }, (result) => {
      const count = result.viral_spiral_extension_deck.length;
      deckCount.textContent = `${count} ${count === 1 ? 'Card' : 'Cards'}`;
    });
  }

  // Open Web Client Arena button
  openArenaBtn.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'http://localhost:3000' });
    } else {
      window.open('http://localhost:3000', '_blank');
    }
  });
});

const AI_SERVICE_URL = "http://localhost:8000";

// Register context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send_to_viral_spiral",
    title: "🚀 Send to Viral Spiral Deck",
    contexts: ["selection", "page"]
  });
  console.log("MIL ECHO Context Menu registered successfully.");
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "send_to_viral_spiral") {
    const textToAudit = info.selectionText || tab?.title || "Captured Web Headline";
    const pageUrl = tab?.url || "";

    console.log("Auditing captured text:", textToAudit);

    try {
      // 1. Send POST request to AI service backend
      const response = await fetch(`${AI_SERVICE_URL}/api/v1/audit-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: textToAudit,
          media_url: "",
          content: `Captured from URL: ${pageUrl}`
        })
      });

      let auditData;
      if (response.ok) {
        auditData = await response.json();
      } else {
        auditData = {
          creator_analysis: "Web content captured via Chrome Extension. Appears click-optimized.",
          emotional_triggers: ["Sensationalism", "Urgency"],
          socratic_question: "Before sharing, what primary source verifies this headline?",
          resilience_score_impact: 15,
          clout_score_risk: "High"
        };
      }

      // 2. Build playable scenario card
      const newCard = {
        id: `ext-${Date.now()}`,
        headline: textToAudit,
        fake_headline: `[POLLUTED] ${textToAudit}`,
        category: "Chrome Extension Scrape",
        is_misinformation: auditData.clout_score_risk === "High",
        clout_reward: 30,
        resilience_penalty: 15,
        resilience_reward: auditData.resilience_score_impact || 15,
        source: pageUrl.length > 30 ? pageUrl.slice(0, 30) + "..." : pageUrl,
        audit_details: auditData
      };

      // 3. Save to chrome storage
      chrome.storage.local.get({ viral_spiral_extension_deck: [] }, (result) => {
        const updatedDeck = [newCard, ...result.viral_spiral_extension_deck];
        chrome.storage.local.set({ viral_spiral_extension_deck: updatedDeck });
        console.log("Card saved to storage. Total extension cards:", updatedDeck.length);
      });

      // 4. Notify open web client tabs
      chrome.tabs.query({ url: "http://localhost:3000/*" }, (tabs) => {
        tabs.forEach((tabItem) => {
          if (tabItem.id) {
            chrome.tabs.sendMessage(tabItem.id, {
              type: "NEW_CARD_AUDITED",
              card: newCard
            }).catch(() => {});
          }
        });
      });

    } catch (error) {
      console.error("Failed to audit captured card:", error);
    }
  }
});

const STORAGE_KEY = "adaptive_ui_profile_v1";

const defaultProfile = {
  menuClicks: { home: 0, reports: 0, messages: 0, settings: 0 },
  catClicks: { AI: 0, HCI: 0, UX: 0, Data: 0 },
  lastTopMenu: "home",
  lastTopCat: "AI"
};

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : structuredClone(defaultProfile);
  } catch {
    return structuredClone(defaultProfile);
  }
}

function saveProfile(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function log(msg) {
  const logBox = document.getElementById("logBox");
  const now = new Date().toLocaleTimeString();
  logBox.innerHTML = `[${now}] ${msg}<br>` + logBox.innerHTML;
}

function argMax(obj) {
  return Object.entries(obj).sort((a,b) => b[1] - a[1])[0][0];
}

function applyAdaptation(profile) {
  const topMenu = argMax(profile.menuClicks);
  const topCat = argMax(profile.catClicks);

  profile.lastTopMenu = topMenu;
  profile.lastTopCat = topCat;
  saveProfile(profile);

  const menuList = document.getElementById("menuList");
  const items = Array.from(menuList.querySelectorAll("li"));

  items.sort((a,b) => {
    const ka = a.querySelector("button").dataset.key;
    const kb = b.querySelector("button").dataset.key;
    return (profile.menuClicks[kb] || 0) - (profile.menuClicks[ka] || 0);
  });

  menuList.innerHTML = "";
  items.forEach(li => menuList.appendChild(li));

  document.querySelectorAll(".menuItem").forEach(btn => {
    btn.classList.toggle("primary", btn.dataset.key === topMenu);
  });

  document.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("popular", btn.dataset.cat === topCat);
  });

  const tipBox = document.getElementById("tipBox");
  tipBox.textContent = `Tip: You use "${topMenu}" most. We moved it to the top and highlighted it.`;

  renderRecommendations(profile);
}

function renderRecommendations(profile) {
  const recoBox = document.getElementById("recoBox");
  const topCat = profile.lastTopCat;

  const library = {
    AI: [
      { title: "Personalization Rules", text: "Use behavior data to adapt layout dynamically." },
      { title: "User Modeling", text: "Build a profile from clicks and time-on-task." }
    ],
    HCI: [
      { title: "Usability + Adaptation", text: "Adapt without confusing users—small, gradual changes." },
      { title: "Human-Centered AI", text: "Keep user control and transparency." }
    ],
    UX: [
      { title: "Reduce Cognitive Load", text: "Prioritize what users need most." },
      { title: "Consistency", text: "Avoid big UI changes too frequently." }
    ],
    Data: [
      { title: "Event Tracking", text: "Collect interactions ethically and locally." },
      { title: "Simple Metrics", text: "Counts, frequency, and recency can drive adaptation." }
    ]
  };

  const picks = library[topCat] || [];
  recoBox.innerHTML = picks.map(p => `
    <div class="card">
      <h3>${p.title}</h3>
      <p>${p.text}</p>
    </div>
  `).join("");

  log(`Recommendations updated for top category: ${topCat}`);
}

function main() {
  const profile = loadProfile();

  document.querySelectorAll(".menuItem").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      profile.menuClicks[key] = (profile.menuClicks[key] || 0) + 1;
      log(`Menu clicked: ${key} (count=${profile.menuClicks[key]})`);

      if (profile.menuClicks[key] >= 3) {
        log(`AI rule triggered: "${key}" reached 3 clicks → prioritize in menu.`);
      }

      applyAdaptation(profile);
    });
  });

  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      profile.catClicks[cat] = (profile.catClicks[cat] || 0) + 1;
      log(`Category clicked: ${cat} (count=${profile.catClicks[cat]})`);

      if (profile.catClicks[cat] >= 3) {
        log(`AI rule triggered: "${cat}" reached 3 clicks → highlight + tailor recommendations.`);
      }

      applyAdaptation(profile);
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    log("Personalization reset.");
    location.reload();
  });

  applyAdaptation(profile);
  log("App loaded. Interact with menu and categories to see adaptation.");
}

main();
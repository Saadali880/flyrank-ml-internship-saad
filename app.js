// Application State
let state = {
  selectedTrack: null,
  currentStep: 'view-track',
  proofStatement: "",
  oneClaim: "",
  onePerson: "",
  oneAction: "",
  whyNeeded: "",
  voiceCard: "direct, warm, plain, specific, no buzzwords",
  sitemapPages: [],
  toolkitChecked: {
    claude: false,
    chatgpt: false,
    gemini: false,
    perplexity: false
  },
  pressureTestCompleted: false,
  changeNote: "",
  interviewStep: 0,
  chatHistory: []
};

// Track-specific configurations for the Interview Bot
const trackConfigs = {
  dev: {
    role: "Dev / SEO / Ops",
    botIntro: "Hello developer! I'm your AI Mentor. Let's design a portfolio that proves you can build real, deployable tools. First: what primary technical skill do you want to base your claim on? (Avoid general lists like 'HTML, CSS, JS, React, Node, SQL'—pick your main strength).",
    quickReplies: [
      ["Frontend Tool Building", "I build fast interactive web apps using vanilla JS."],
      ["Production Deployments", "I take ideas to responsive live apps running in production."],
      ["APIs & Integration", "I build secure, documented APIs that connect services smoothly."]
    ],
    critiqueTemplate: (claim, pages) => `### Claude 3.5 Sonnet: Sitemap Pressure-Test (Developer Track)

**Claim to Prove:** "${claim}"
**Sitemap Pages Checked:** ${pages.map(p => p.name).join(', ')}

Here is the pressure-test analysis of your sitemap:

1. **What Earns Its Place:**
   * The **Landing Hero** directly claims you build production-ready tools. That matches your claim.
   * Your **Work / Case Study** page is critical. It must host a live, running app with a link to the open-source repository. A developer who doesn't link code isn't proving anything.
   
2. **What is Wasted / Weak:**
   ${pages.some(p => p.name.toLowerCase().includes('skill')) 
     ? `* **The 'Skills' Page is Wasted:** You have a dedicated skills section. Recruiters ignore lists of bulleted logos. Remove it. Prove those skills inside your case studies by describing *how* you used them.` 
     : `* Your structure is clean. Ensure you do not add a generic 'Resume' page. The case study is your resume.`}
   
3. **What is Missing / Needs Changing:**
   * **The Action Link:** If your action is "Email me to chat," make sure the contact form is a direct, friction-free mailto link or button. Do not hide it behind a captcha or 5-field form.
   * **Outcome Metric:** In your Case Study, you need an honest performance metric (e.g., "loads in under 200ms" or "handling 100 concurrent requests"). Make this metric prominent on the page.

**Recommended Change:** Remove any generic skills/resume links. Merge your bio and contact action directly onto a single, compact contact section or footer to keep the sitemap tightly bound to your one action.`
  },
  design: {
    role: "UI / UX Designer",
    botIntro: "Welcome designer! Let's shape a portfolio that proves your design capabilities. What is the ONE core UI/UX claim you want to prove? (Avoid buzzwords like 'passionate user-centric creator'—what real interface problem do you solve?)",
    quickReplies: [
      ["Simplifying Flows", "I turn confusing, multi-step user flows into clean, usable screens."],
      ["Responsive Interface Refactoring", "I redesign outdated mobile layouts to make them intuitive."],
      ["Prototyping & Interaction", "I build high-fidelity interactive wireframes that solve user dropoffs."]
    ],
    critiqueTemplate: (claim, pages) => `### Claude 3.5 Sonnet: Sitemap Pressure-Test (Design Track)

**Claim to Prove:** "${claim}"
**Sitemap Pages Checked:** ${pages.map(p => p.name).join(', ')}

Here is the pressure-test analysis of your sitemap:

1. **What Earns Its Place:**
   * The **Landing Screen** is your first impression. Since you are a UI/UX designer, the design system of your portfolio *is* part of your proof. 
   * The **Case Study** page is essential. It must show before/after screens, wireframe iterations, and user testing notes.
   
2. **What is Wasted / Weak:**
   ${pages.some(p => p.name.toLowerCase().includes('about') && p.name.toLowerCase().includes('page')) 
     ? `* **Separate About Page is Weak:** A full separate page just to tell your life story is wasted for a 30-second scan. Move your 2-sentence bio to the top/bottom of the landing page.` 
     : `* Your page count is small. This is excellent. Avoid adding gallery views that aren't backed by deep case studies.`}
   
3. **What is Missing / Needs Changing:**
   * **Before & After Visuals:** Your case study layout needs to contrast the confusing original flow with your clean solution. 
   * **CTA Visibility:** The contact action should be a sticky element or header button. Make sure your "one action" is visible from every scroll depth.

**Recommended Change:** Merge the bio into the home page. Ensure your Case Study page goes straight into the 'three beats' (Problem, Decisions, Outcome) instead of long paragraphs of text.`
  },
  ml: {
    role: "Machine Learning",
    botIntro: "Hello! Let's build a portfolio that proves your ML capabilities. What is the ONE primary skill you want to showcase? (Focus on real models and datasets, not broad AI generalities).",
    quickReplies: [
      ["Model Tuning & Optimization", "I build models that run on messy, real-world datasets and optimize their accuracy."],
      ["MLOps & API Deployment", "I deploy machine learning models behind clean web APIs for instant testing."],
      ["Data Engineering Funnels", "I design pipelines that clean and preprocess noisy text or image data."]
    ],
    critiqueTemplate: (claim, pages) => `### Claude 3.5 Sonnet: Sitemap Pressure-Test (ML Track)

**Claim to Prove:** "${claim}"
**Sitemap Pages Checked:** ${pages.map(p => p.name).join(', ')}

Here is the pressure-test analysis of your sitemap:

1. **What Earns Its Place:**
   * The **Landing Page** displaying your model claim.
   * The **Model Playground / Interactive Case Study** page. For ML, a recruiter needs to see a simple input field where they can test your model live, or a clear breakdown of the model's accuracy on messy test data.
   
2. **What is Wasted / Weak:**
   * If you have a general "Projects" archive page showing 5 simple course exercises (like Iris dataset classification), delete them. They weaken your main case. Showcase just **one** deep, real-world model.
   
3. **What is Missing / Needs Changing:**
   * **Honest Limitations:** ML models always have edge cases. Your case study page MUST have a section named "Limitations & Failure Modes." Acknowledging where your model fails builds immediate trust.
   * **Dataset Source:** Clearly explain how you cleaned the training data. The data prep is often more important than the training run.

**Recommended Change:** Rename your case study to 'Interactive Demo & Model Performance' and make sure the code repo link is front-and-center so developers can verify your architecture.`
  },
  marketing: {
    role: "Growth Marketing",
    botIntro: "Hi there! Let's structure a marketing portfolio that proves you can move actual business metrics. What is the ONE growth skill you want to prove? (Avoid generic terms like 'social media marketer'—what metric do you own?)",
    quickReplies: [
      ["Organic Traffic Growth", "I grow search and organic traffic and can show the before and after traffic charts."],
      ["Conversion Optimization", "I run copy and landing page tests to increase conversion and signup metrics."],
      ["Paid Ad Strategy & Funnels", "I build and optimize ad campaigns to lower acquisition costs."]
    ],
    critiqueTemplate: (claim, pages) => `### Claude 3.5 Sonnet: Sitemap Pressure-Test (Marketing Track)

**Claim to Prove:** "${claim}"
**Sitemap Pages Checked:** ${pages.map(p => p.name).join(', ')}

Here is the pressure-test analysis of your sitemap:

1. **What Earns Its Place:**
   * The **Landing Page** with a bold headline stating your metric claim.
   * The **Growth Case Study** page. This is the core. It must prominently display a before/after metric chart.
   
2. **What is Wasted / Weak:**
   * **Service Catalog Pages:** Pages listing "Services I Offer (SEO, Social, PPC, Email)" are weak. They make you look like a generic freelancer. Focus entirely on proving your single claim through your case study.
   
3. **What is Missing / Needs Changing:**
   * **Proof of Attribution:** In your case study, you must show *how* you know your actions caused the metric to move. Explain the testing methodology or tracking code.
   * **A Direct Booking Link:** For marketers, the one action is usually booking a consultation. Your CTA should link directly to a scheduler (like Calendly).

**Recommended Change:** Swap any generic contact page for an integrated scheduler widget on your home page, reducing friction to get a caller booked.`
  }
};

// Default sitemaps prefilled per track to help user start
const defaultSitemaps = {
  dev: [
    { id: 'p1', name: 'Home / Hero Claim', role: 'landing', desc: 'Introduces my claim: I take raw ideas to working tools in production. Features a live widget of my latest project.' },
    { id: 'p2', name: 'Case Study: The App Build', role: 'proof', desc: 'Breaks down the problem, my design choices, code hurdles, and links the live URL and Git repo.' },
    { id: 'p3', name: 'Contact & Repository', role: 'action', desc: 'Direct mailto button for hiring managers and links to my GitHub profile.' }
  ],
  design: [
    { id: 'p1', name: 'Portfolio Landing', role: 'landing', desc: 'Presents my claim of turning messy flows into simple screens. Shows a teaser of the main redesign.' },
    { id: 'p2', name: 'Case Study: Signage Redesign', role: 'proof', desc: 'Shows the original confusing screens, wireframes, user test notes, and the high-fidelity prototypes.' },
    { id: 'p3', name: 'Work with Me', role: 'action', desc: 'Short bio, contact details, and a form to book an initial design review.' }
  ],
  ml: [
    { id: 'p1', name: 'Model Showcase Landing', role: 'landing', desc: 'States my claim: building models that work on messy real data. Shows model accuracy metrics immediately.' },
    { id: 'p2', name: 'Model Evaluation Case', role: 'proof', desc: 'Details data cleaning steps, accuracy curves, model limits, and hosts an interactive playground to test inputs.' },
    { id: 'p3', name: 'Get in Touch', role: 'action', desc: 'Mail link to request custom model runs or download my CV.' }
  ],
  marketing: [
    { id: 'p1', name: 'Growth Metric Home', role: 'landing', desc: 'States the claim: growing organic traffic. Displays a before/after traffic chart above the fold.' },
    { id: 'p2', name: 'Case Study: Organic Campaign', role: 'proof', desc: 'Details the problem (traffic plateau), keyword audit steps, content rewrite execution, and the resulting conversion increase.' },
    { id: 'p3', name: 'Book a Strategy Call', role: 'action', desc: 'Embedded calendar scheduler widget to book a 15-minute growth review.' }
  ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Try loading from localStorage
  const savedState = localStorage.getItem('flyrank_week1_state');
  if (savedState) {
    try {
      state = JSON.parse(savedState);
      restoreAppState();
    } catch(e) {
      console.error("Failed to restore saved state", e);
    }
  }

  setupEventListeners();
  updateProgress();
});

// Setup event listeners for sidebar tabs
function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const targetPanel = e.currentTarget.getAttribute('data-target');
      navigateTo(targetPanel);
    });
  });
}

// Navigation Function
function navigateTo(panelId) {
  // Verify step locks
  if (panelId === 'view-interview' && !state.selectedTrack) return showToast("Please select a track first.");
  if (panelId === 'view-sitemap' && !state.proofStatement) return showToast("Please complete the Narrowing Interview first.");
  if (panelId === 'view-claude' && state.sitemapPages.length === 0) return showToast("Please draw a sitemap first.");
  if (panelId === 'view-deliver' && !state.pressureTestCompleted) return showToast("Please run the Claude sitemap pressure-test first.");

  // Switch panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(panelId).classList.add('active');

  // Switch tabs
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-target') === panelId) {
      btn.classList.add('active');
    }
  });

  state.currentStep = panelId;
  saveState();
  updateProgress();

  // Special page initialization
  if (panelId === 'view-sitemap') {
    renderSitemap();
  } else if (panelId === 'view-claude') {
    initClaudeMockup();
  } else if (panelId === 'view-deliver') {
    renderDeliverables();
  }
}

// Select Track
function selectTrack(trackId) {
  state.selectedTrack = trackId;
  
  // Highlight card
  document.querySelectorAll('.track-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.getElementById(`track-card-${trackId}`).classList.add('selected');

  // Enable continue button
  document.getElementById('btn-to-step2').removeAttribute('disabled');
  document.getElementById('nav-btn-interview').removeAttribute('disabled');

  // Initialize Interview if changed or brand new
  if (state.chatHistory.length === 0 || state.interviewStep === 0) {
    state.sitemapPages = [...defaultSitemaps[trackId]];
    resetInterview();
  }

  showToast(`Track set to: ${trackConfigs[trackId].role}`);
  saveState();
  updateProgress();
}

// Restore UI if loading from LocalStorage
function restoreAppState() {
  // Set track visual
  if (state.selectedTrack) {
    document.querySelectorAll('.track-card').forEach(card => {
      card.classList.remove('selected');
    });
    const card = document.getElementById(`track-card-${state.selectedTrack}`);
    if (card) card.classList.add('selected');
    document.getElementById('btn-to-step2').removeAttribute('disabled');
  }

  // Set Proof statement UI
  if (state.proofStatement) {
    document.getElementById('btn-to-step3').removeAttribute('disabled');
    document.getElementById('proof-statement-result-box').classList.remove('hidden');
    document.getElementById('display-proof-statement').innerText = state.proofStatement;
    document.getElementById('display-voice-card').innerHTML = `<strong>Voice Card:</strong> ${state.voiceCard}`;
  }

  // Set Sitemap buttons
  if (state.sitemapPages.length > 0 && state.proofStatement) {
    document.getElementById('btn-to-step4').removeAttribute('disabled');
  }

  // Set Claude inputs
  if (state.pressureTestCompleted) {
    document.getElementById('btn-to-step5').removeAttribute('disabled');
    document.getElementById('change-notes-card-box').classList.remove('hidden');
    document.getElementById('sitemap-change-note-input').value = state.changeNote;
  }

  // Set toolkit checklist checks
  document.getElementById('chk-claude').checked = state.toolkitChecked.claude;
  document.getElementById('chk-chatgpt').checked = state.toolkitChecked.chatgpt;
  document.getElementById('chk-gemini').checked = state.toolkitChecked.gemini;
  document.getElementById('chk-perplexity').checked = state.toolkitChecked.perplexity;

  // Navigate to saved step
  navigateTo(state.currentStep);
}

// Interactive Narrowing Interview Chatbot logic
function resetInterview() {
  state.interviewStep = 0;
  state.chatHistory = [];
  state.proofStatement = "";
  state.oneClaim = "";
  state.onePerson = "";
  state.oneAction = "";
  state.whyNeeded = "";
  
  document.getElementById('chat-messages-box').innerHTML = "";
  document.getElementById('proof-statement-result-box').classList.add('hidden');
  document.getElementById('btn-to-step3').setAttribute('disabled', 'true');

  // Trigger bot intro
  const config = trackConfigs[state.selectedTrack];
  addChatMessage('ai', config.botIntro);
  renderSuggestions(config.quickReplies);
  saveState();
}

function addChatMessage(sender, text) {
  const container = document.getElementById('chat-messages-box');
  const msgDiv = document.createElement('div');
  msgDiv.className = `cmsg ${sender}`;
  
  // Format formatting: markdown-like simple quotes
  let formattedText = text.replace(/> (.*)/g, '<blockquote>$1</blockquote>');
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  msgDiv.innerHTML = `<div class="cb"><span class="vh">${sender === 'ai' ? 'AI: ' : 'You: '}</span>${formattedText}</div>`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  
  // Save history
  state.chatHistory.push({ sender, text });
}

function renderSuggestions(options) {
  const container = document.getElementById('chat-suggestions-container');
  container.innerHTML = "";
  
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.innerText = opt[0];
    btn.onclick = () => handleSuggestionClick(opt[1]);
    container.appendChild(btn);
  });
}

function handleSuggestionClick(text) {
  addChatMessage('me', text);
  processInterviewInput(text);
}

function sendUserMessage() {
  const input = document.getElementById('chat-input-text');
  const text = input.value.trim();
  if (!text) return;
  
  addChatMessage('me', text);
  input.value = "";
  processInterviewInput(text);
}

// State machine for Interview bot questions
function processInterviewInput(input) {
  const track = state.selectedTrack;
  const config = trackConfigs[track];
  
  // Disable suggestions temporarily
  document.getElementById('chat-suggestions-container').innerHTML = "";
  
  // Simulate AI thinking delay
  setTimeout(() => {
    state.interviewStep++;
    
    switch (state.interviewStep) {
      case 1:
        // Input was the Claim
        state.oneClaim = input;
        addChatMessage('ai', `Got it: **${state.oneClaim}**.\n\nNow, who is the **ONE specific person** who needs to believe this so you can get hired? Recruiters, startup engineering leads, design agency heads, or project founders? Choose one specific audience.`);
        
        if (track === 'dev' || track === 'ml') {
          renderSuggestions([
            ["Startup Tech Lead", "An engineering manager at a fast-paced software startup."],
            ["Project Founder", "A startup founder building a prototype tool."],
            ["Lead Developer", "A senior lead looking for an assistant developer."]
          ]);
        } else if (track === 'design') {
          renderSuggestions([
            ["Design Lead Manager", "A lead UX design manager looking to hire a junior."],
            ["Small Product Team Head", "The head of product at a 15-person design-driven studio."],
            ["Freelance Client", "A tech founder who needs custom UI components."]
          ]);
        } else { // marketing
          renderSuggestions([
            ["Growth Founder", "A bootstrapped founder looking to scale signups."],
            ["Marketing Director", "A marketing lead at a mid-market e-commerce brand."],
            ["E-comm Shop Owner", "An online retail brand founder looking to increase reach."]
          ]);
        }
        break;

      case 2:
        // Input was the Person
        state.onePerson = input;
        addChatMessage('ai', `Understood. You are proving your claim to: **${state.onePerson}**.\n\nWhat is the **ONE specific action** you want them to take when they visit your site? Download your app, email you directly, schedule a 15-minute call, or look at your GitHub repository?`);
        
        renderSuggestions([
          ["Email to Chat", "Send a direct email to schedule an interview chat."],
          ["Book Call Widget", "Click my Calendly link to book a 15-minute review."],
          ["Download Tool / GitHub", "Go to my GitHub repo and download/test my live build."]
        ]);
        break;

      case 3:
        // Input was the Action
        state.oneAction = input;
        addChatMessage('ai', `Excellent: **${state.oneAction}**.\n\nHere is the critical final question: **Why does this site need to exist?** What is the one thing a traditional CV or LinkedIn profile cannot prove about you that this site fixes? Be honest and brief.`);
        
        renderSuggestions([
          ["Can't Prove Code Works", "A resume lists bullet points, but it cannot prove I can ship a clean, working tool in production."],
          ["Can't Show Flow Iteration", "LinkedIn shows job titles, but it cannot show my step-by-step wireframe test results and design logic."],
          ["Can't Show Metric Attribution", "A CV claims I do SEO, but it cannot show the before/after analytics charts and code logs that prove I moved the needle myself."]
        ]);
        break;

      case 4:
        // Input was the Why
        state.whyNeeded = input;
        
        // Formulate proof statement
        const finalStatement = `I prove that I can ${state.oneClaim.toLowerCase().replace(/i\s/g, '').replace(/i'm\s/g, '')}. I am showing this to ${state.onePerson.toLowerCase()}, so they will ${state.oneAction.toLowerCase()}. Why this exists: ${state.whyNeeded}`;
        state.proofStatement = finalStatement;
        
        addChatMessage('ai', `Awesome! I have compiled your narrowing interview. Here is your final **Proof Statement**: \n\n> "${finalStatement}"\n\nAnd I have noted your **Voice Card** as: \n> "${state.voiceCard}"\n\nDo you approve this proof statement, or would you like to restart the interview?`);
        
        renderSuggestions([
          ["Approve & Proceed", "I approve this proof statement. Let's build the sitemap!"],
          ["Restart Interview", "I want to change some details. Let's restart."]
        ]);
        break;

      case 5:
        if (input.toLowerCase().includes('approve') || input.toLowerCase().includes('proceed')) {
          addChatMessage('ai', "Perfect! Your proof statement is saved and locked. Proceed to the next step to design your sitemap. I've enabled navigation.");
          
          // Unlock step 3
          document.getElementById('btn-to-step3').removeAttribute('disabled');
          document.getElementById('nav-btn-sitemap').removeAttribute('disabled');
          
          // Render Proof Summary Box
          document.getElementById('proof-statement-result-box').classList.remove('hidden');
          document.getElementById('display-proof-statement').innerText = state.proofStatement;
          document.getElementById('display-voice-card').innerHTML = `<strong>Voice Card:</strong> ${state.voiceCard}`;
          
          saveState();
          updateProgress();
        } else {
          resetInterview();
        }
        break;
    }
    
    saveState();
  }, 600);
}

// Edit Proof Statement directly
function editProofStatement() {
  const newStatement = prompt("Edit your Proof Statement:", state.proofStatement);
  if (newStatement) {
    state.proofStatement = newStatement;
    document.getElementById('display-proof-statement').innerText = newStatement;
    saveState();
    updateProgress();
  }
}

// Sitemap builder logic
function renderSitemap() {
  // Goal display
  document.getElementById('sitemap-goal-summary').innerText = `"${state.proofStatement}"`;
  
  const canvas = document.getElementById('sitemap-canvas-nodes');
  canvas.innerHTML = "";
  
  if (state.sitemapPages.length === 0) {
    canvas.innerHTML = `<div class="text-muted">No pages designed. Use the left panel to add a page.</div>`;
    validateSitemap();
    return;
  }
  
  state.sitemapPages.forEach((page, index) => {
    // Render Node
    const node = document.createElement('div');
    node.className = `sitemap-node`;
    
    let badgeClass = 'badge-proof';
    if (page.role === 'landing') badgeClass = 'badge-landing';
    if (page.role === 'bio') badgeClass = 'badge-bio';
    if (page.role === 'action') badgeClass = 'badge-action';
    
    node.innerHTML = `
      <div class="node-header">
        <span class="node-title">${index + 1}. ${page.name}</span>
        <span class="node-badge ${badgeClass}">${page.role}</span>
      </div>
      <div class="node-desc">${page.desc}</div>
      <div class="node-meta">
        <span>Goal: ${page.role === 'landing' ? 'Claim' : page.role === 'proof' ? 'Proof' : page.role === 'bio' ? 'Bio' : 'CTA'}</span>
        <button class="btn-delete-node" title="Delete page" onclick="deleteSitemapPage('${page.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    
    canvas.appendChild(node);
    
    // Render Connector Arrow if not last node
    if (index < state.sitemapPages.length - 1) {
      const connector = document.createElement('div');
      connector.className = 'node-connector';
      connector.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      `;
      canvas.appendChild(connector);
    }
  });
  
  validateSitemap();
}

function addSitemapPage() {
  const nameInput = document.getElementById('page-name-input');
  const roleSelect = document.getElementById('page-role-select');
  const descInput = document.getElementById('page-desc-input');
  
  const name = nameInput.value.trim();
  const role = roleSelect.value;
  const desc = descInput.value.trim();
  
  if (!name || !desc) {
    showToast("Please fill in both the page name and description.");
    return;
  }
  
  const newPage = {
    id: 'p_' + Date.now(),
    name,
    role,
    desc
  };
  
  state.sitemapPages.push(newPage);
  
  // Clear inputs
  nameInput.value = "";
  descInput.value = "";
  
  renderSitemap();
  saveState();
  updateProgress();
  showToast(`Added page: ${name}`);
}

function deleteSitemapPage(pageId) {
  state.sitemapPages = state.sitemapPages.filter(p => p.id !== pageId);
  renderSitemap();
  saveState();
  updateProgress();
  showToast("Page deleted");
}

function validateSitemap() {
  let hasLanding = false;
  let hasProof = false;
  let hasAction = false;
  
  state.sitemapPages.forEach(p => {
    if (p.role === 'landing') hasLanding = true;
    if (p.role === 'proof') hasProof = true;
    if (p.role === 'action') hasAction = true;
  });
  
  const validSize = state.sitemapPages.length >= 2 && state.sitemapPages.length <= 4;
  
  // Update Rules list styles
  toggleRuleVisual('rule-size', validSize);
  toggleRuleVisual('rule-landing', hasLanding);
  toggleRuleVisual('rule-proof', hasProof);
  toggleRuleVisual('rule-cta', hasAction);
  
  // Enable Step 4 button if sitemap checks out
  const allValid = validSize && hasLanding && hasProof && hasAction;
  if (allValid) {
    document.getElementById('btn-to-step4').removeAttribute('disabled');
    document.getElementById('nav-btn-claude').removeAttribute('disabled');
  } else {
    document.getElementById('btn-to-step4').setAttribute('disabled', 'true');
  }
}

function toggleRuleVisual(elementId, isValid) {
  const el = document.getElementById(elementId);
  if (isValid) {
    el.classList.remove('invalid');
    el.classList.add('valid');
  } else {
    el.classList.remove('valid');
    el.classList.add('invalid');
  }
}

// Programmatic export of Sitemap as SVG
function exportSitemapSVG() {
  if (state.sitemapPages.length === 0) return;
  
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 ${state.sitemapPages.length * 150 + 50}" width="500" height="${state.sitemapPages.length * 150 + 50}" style="background-color: #0B0F19; font-family: sans-serif;">`;
  
  // Add title background grid
  svgContent += `<defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>`;
  
  svgContent += `<text x="20" y="30" fill="#94A3B8" font-size="12" font-weight="bold" letter-spacing="1">WEEK 1 PORTFOLIO SITEMAP SKETCH</text>`;
  
  state.sitemapPages.forEach((page, idx) => {
    const y = 60 + idx * 150;
    
    // Card background
    svgContent += `<rect x="50" y="${y}" width="400" height="90" rx="8" fill="#1E293B" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1.5"/>`;
    
    // Left accent block
    let badgeColor = '#34D399';
    if (page.role === 'landing') badgeColor = '#60A5FA';
    if (page.role === 'bio') badgeColor = '#A78BFA';
    if (page.role === 'action') badgeColor = '#FBBF24';
    
    svgContent += `<rect x="50" y="${y}" width="6" height="90" rx="2" fill="${badgeColor}"/>`;
    
    // Title
    svgContent += `<text x="75" y="${y + 30}" fill="#F8FAFC" font-size="15" font-weight="bold">${idx + 1}. ${page.name}</text>`;
    
    // Badge role
    svgContent += `<rect x="360" y="${y + 15}" width="70" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>`;
    svgContent += `<text x="395" y="${y + 29}" fill="${badgeColor}" font-size="9" font-weight="bold" text-anchor="middle">${page.role.toUpperCase()}</text>`;
    
    // Description text (wrap manual limit)
    let descLines = [];
    if (page.desc.length > 55) {
      descLines.push(page.desc.substring(0, 55) + "...");
    } else {
      descLines.push(page.desc);
    }
    
    descLines.forEach((line, lIdx) => {
      svgContent += `<text x="75" y="${y + 55 + lIdx * 16}" fill="#94A3B8" font-size="11">${line}</text>`;
    });
    
    // Connector arrow
    if (idx < state.sitemapPages.length - 1) {
      const arrowY = y + 90;
      svgContent += `<line x1="250" y1="${arrowY}" x2="250" y2="${arrowY + 60}" stroke="#64748B" stroke-width="2" stroke-dasharray="4"/>`;
      svgContent += `<polygon points="246,${arrowY + 54} 250,${arrowY + 60} 254,${arrowY + 54}" fill="#64748B" />`;
    }
  });
  
  svgContent += `</svg>`;
  
  const blob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const trigger = document.createElement('a');
  trigger.href = url;
  trigger.download = `portfolio_sitemap_sketch.svg`;
  document.body.appendChild(trigger);
  trigger.click();
  document.body.removeChild(trigger);
  URL.revokeObjectURL(url);
  
  showToast("Sitemap SVG sketch downloaded!");
}

// Step 4: Claude Simulator Mockup init
function initClaudeMockup() {
  // Prepopulate custom instructions
  const instructions = `You are an expert technical tutor for my 8-week Portfolio Build.
My background and track is: ${trackConfigs[state.selectedTrack].role}.

Proof Statement:
"${state.proofStatement}"

Voice Card:
"${state.voiceCard}"

DIRECTIVES:
1. Act as a strict tutor. Do not build the portfolio for me.
2. Explain the mechanical reasoning behind your styling and layout choices.
3. Push back on generic, template-driven designs. Keep layouts tightly aligned to my proof claim and one action.
4. Keep all responses brief and educational.`;

  document.getElementById('custom-instructions-area').value = instructions;
  
  // Set Chat viewport
  const chatView = document.getElementById('claude-simulator-messages');
  chatView.innerHTML = `
    <div class="chat-mockup-bubble user">
      <span class="prompt-label-block">System Context Configured</span>
      Custom instructions saved in Claude Project settings drawer. Ready to pressure-test the sitemap.
    </div>
  `;
  
  if (state.pressureTestCompleted) {
    renderPressureTestResult();
  } else {
    document.getElementById('claude-input-trigger-box').classList.remove('hidden');
    document.getElementById('change-notes-card-box').classList.add('hidden');
  }
}

function copyInstructions() {
  const el = document.getElementById('custom-instructions-area');
  el.select();
  document.execCommand('copy');
  showToast("Instructions copied to clipboard!");
}

// Simulate the pressure test running
function runPressureTest() {
  const chatView = document.getElementById('claude-simulator-messages');
  const triggerBox = document.getElementById('claude-input-trigger-box');
  
  // Add User prompt bubble
  const sitemapStr = state.sitemapPages.map((p, idx) => `Page ${idx + 1}: ${p.name} [Role: ${p.role}] - Description: ${p.desc}`).join('\n');
  const userPrompt = `This is my proof statement: "${state.proofStatement}". 
This is my sitemap:
${sitemapStr}

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.`;

  const userBubble = document.createElement('div');
  userBubble.className = 'chat-mockup-bubble user';
  userBubble.innerHTML = `<span class="prompt-label-block">Prompt sent to Claude Project</span>${userPrompt.replace(/\n/g, '<br>')}`;
  chatView.appendChild(userBubble);
  chatView.scrollTop = chatView.scrollHeight;
  
  triggerBox.classList.add('hidden');
  
  // Simulate Claude loading
  const loadingBubble = document.createElement('div');
  loadingBubble.className = 'chat-mockup-bubble assistant';
  loadingBubble.innerText = "Claude is analyzing...";
  chatView.appendChild(loadingBubble);
  
  setTimeout(() => {
    chatView.removeChild(loadingBubble);
    state.pressureTestCompleted = true;
    renderPressureTestResult();
    
    // Unlock step 5 if notes are filled (can be empty first)
    document.getElementById('btn-to-step5').removeAttribute('disabled');
    document.getElementById('nav-btn-deliver').removeAttribute('disabled');
    
    saveState();
    updateProgress();
  }, 1200);
}

function renderPressureTestResult() {
  const chatView = document.getElementById('claude-simulator-messages');
  
  // Verify user prompt is there
  const userBubbles = chatView.querySelectorAll('.chat-mockup-bubble.user');
  if (userBubbles.length <= 1) {
    const sitemapStr = state.sitemapPages.map((p, idx) => `Page ${idx + 1}: ${p.name} [Role: ${p.role}] - Description: ${p.desc}`).join('\n');
    const userPrompt = `This is my proof statement: "${state.proofStatement}". 
This is my sitemap:
${sitemapStr}

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.`;
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-mockup-bubble user';
    userBubble.innerHTML = `<span class="prompt-label-block">Prompt sent to Claude Project</span>${userPrompt.replace(/\n/g, '<br>')}`;
    chatView.appendChild(userBubble);
  }
  
  const botBubble = document.createElement('div');
  botBubble.className = 'chat-mockup-bubble assistant';
  
  const rawFeedback = trackConfigs[state.selectedTrack].critiqueTemplate(state.proofStatement, state.sitemapPages);
  
  // Format formatting: markdown-like simple syntax
  let formattedText = rawFeedback;
  formattedText = formattedText.replace(/### (.*)/g, '<h3>$1</h3>');
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/\*(.*?)\n/g, '<li>$1</li>');
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  botBubble.innerHTML = `<span class="prompt-label-block">Claude Response</span>${formattedText}`;
  chatView.appendChild(botBubble);
  chatView.scrollTop = chatView.scrollHeight;
  
  // Show changes note input
  document.getElementById('change-notes-card-box').classList.remove('hidden');
  document.getElementById('sitemap-change-note-input').focus();
}

function saveChangeNote() {
  const note = document.getElementById('sitemap-change-note-input').value;
  state.changeNote = note;
  saveState();
  updateProgress();
}

// Step 5: Deliverables Hub compiling
function renderDeliverables() {
  // Update submission checklist checkboxes in state
  const checklistItems = {
    statement: !!state.proofStatement,
    sitemap: state.sitemapPages.length >= 2 && state.sitemapPages.length <= 4,
    toolkit: state.toolkitChecked.claude && state.toolkitChecked.chatgpt && state.toolkitChecked.gemini && state.toolkitChecked.perplexity,
    instructions: !!document.getElementById('custom-instructions-area').value,
    test: state.pressureTestCompleted,
    note: !!state.changeNote
  };
  
  toggleChecklistVisual('chk-item-statement', checklistItems.statement);
  toggleChecklistVisual('chk-item-sitemap', checklistItems.sitemap);
  toggleChecklistVisual('chk-item-toolkit', checklistItems.toolkit);
  toggleChecklistVisual('chk-item-instructions', checklistItems.instructions);
  toggleChecklistVisual('chk-item-test', checklistItems.test);
  toggleChecklistVisual('chk-item-note', checklistItems.note);
  
  // Build markdown post text
  const pagesList = state.sitemapPages.map((p, idx) => `  ${idx + 1}. **${p.name}** [Role: ${p.role.toUpperCase()}] - *${p.desc}*`).join('\n');
  const toolkitList = Object.entries(state.toolkitChecked)
    .map(([key, val]) => `  * [${val ? 'x' : ' '}] ${key.charAt(0).toUpperCase() + key.slice(1)} account setup`)
    .join('\n');
    
  const testPrompt = `This is my proof statement: "${state.proofStatement}". 
This is my sitemap:
${state.sitemapPages.map((p, idx) => `Page ${idx + 1}: ${p.name} [${p.role}] - ${p.desc}`).join('\n')}

Does this sitemap walk my one person from landing, to believing me, to taking my one action, and does it actually prove my claim? Tell me which pages earn their place, which are wasted, and what is missing. Be specific, not encouraging.`;

  const testFeedback = trackConfigs[state.selectedTrack] ? trackConfigs[state.selectedTrack].critiqueTemplate(state.proofStatement, state.sitemapPages) : '';

  const postText = `### Week 1 Deliverable: Draw the Path

**1. Proof Statement & Voice Card**
* **Proof Statement:** "${state.proofStatement}"
* **Voice Card:** "${state.voiceCard}"

**2. Portfolio Sitemap Structure**
${pagesList}

**3. AI Workspace Toolkit**
${toolkitList}

**4. Claude Project Settings: Custom Instructions**
\`\`\`markdown
${document.getElementById('custom-instructions-area') ? document.getElementById('custom-instructions-area').value : ''}
\`\`\`

**5. Sitemap Pressure-Test Prompt**
\`\`\`
${testPrompt}
\`\`\`

**6. Sitemap Pressure-Test Claude Output**
\`\`\`markdown
${testFeedback}
\`\`\`

**7. Sitemap Change Notes**
> "${state.changeNote || 'No change notes completed yet.'}"`;

  document.getElementById('compilation-post-text').innerText = postText;
}

function toggleChecklistVisual(elementId, isChecked) {
  const el = document.getElementById(elementId);
  if (isChecked) {
    el.classList.add('checked');
  } else {
    el.classList.remove('checked');
  }
}

function copyCompilationText() {
  const container = document.getElementById('compilation-post-text');
  
  // Select all content inside
  const range = document.createRange();
  range.selectNode(container);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
  showToast("Entire markdown post copied to clipboard!");
}

function updateToolkitProgress() {
  state.toolkitChecked.claude = document.getElementById('chk-claude').checked;
  state.toolkitChecked.chatgpt = document.getElementById('chk-chatgpt').checked;
  state.toolkitChecked.gemini = document.getElementById('chk-gemini').checked;
  state.toolkitChecked.perplexity = document.getElementById('chk-perplexity').checked;
  
  saveState();
  updateProgress();
}

// Utility to calculate completion progress
function updateProgress() {
  let stepsCompleted = 0;
  
  if (state.selectedTrack) stepsCompleted++; // Step 1 complete
  if (state.proofStatement) stepsCompleted++; // Step 2 complete
  if (state.sitemapPages.length > 0 && state.proofStatement) {
    // Basic verification of validation rules
    let hasLanding = false;
    let hasProof = false;
    let hasAction = false;
    state.sitemapPages.forEach(p => {
      if (p.role === 'landing') hasLanding = true;
      if (p.role === 'proof') hasProof = true;
      if (p.role === 'action') hasAction = true;
    });
    if (hasLanding && hasProof && hasAction && state.sitemapPages.length <= 4) {
      stepsCompleted++; // Step 3 complete
    }
  }
  if (state.pressureTestCompleted && state.changeNote) stepsCompleted++; // Step 4 complete
  
  const toolkitCount = Object.values(state.toolkitChecked).filter(Boolean).length;
  if (toolkitCount === 4 && stepsCompleted === 4) {
    stepsCompleted++; // Step 5 complete
  }
  
  const percentage = Math.round((stepsCompleted / 5) * 100);
  document.getElementById('overall-progress').style.width = `${percentage}%`;
  document.getElementById('progress-percent-text').innerText = `${percentage}% Complete`;
}

// Local Storage helpers
function saveState() {
  localStorage.setItem('flyrank_week1_state', JSON.stringify(state));
}

// Toast Notifications
function showToast(message) {
  // Remove existing
  const existing = document.querySelector('.toast-msg');
  if (existing) {
    existing.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerText = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

// Complete Project and export Walkthrough / Deliverables to local workspace
function finishProject() {
  // Trigger compilation render just in case
  renderDeliverables();
  
  const content = document.getElementById('compilation-post-text').innerText;
  
  // Custom API trigger back to AI to write file
  const event = new CustomEvent('flyrank_export_deliverables', { detail: content });
  window.dispatchEvent(event);
  
  showToast("Deliverables markdown file generated in your workspace!");
}

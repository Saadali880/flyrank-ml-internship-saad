// app.js

// --------------------------------------------------
// Application State & Configurations
// --------------------------------------------------
const state = {
  theme: 'dark',
  currentScorerResult: null,
  chatHistory: [],
  traceLogCount: 0
};

// Model Coefficients from Saad's research paper
const MODEL_COEF = {
  intercept: -0.5,
  log_impressions_90d: 1.27,
  avg_position: -0.40,
  content_age_days: -0.37,
  log_clicks_90d: -0.56,
  users_90d: -0.83 // estimated as clicks * 1.1 in normalized scaling
};

// --------------------------------------------------
// UI Initializations & Event Listeners
// --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Setup
  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', toggleTheme);

  // Initial scorer state
  runInference(5000, 150, 12.4, 180, 45, 950);

  // Initial Agent Welcome message
  initAgentChat();
});

// Theme toggling
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  
  const toggleText = document.querySelector('#theme-toggle-btn .toggle-text');
  toggleText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  state.theme = newTheme;
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Copy dashboard metrics
function copyMetric(name, value) {
  navigator.clipboard.writeText(`${name}: ${value}`);
  showToast(`Copied ${name} to clipboard!`);
}

function copyStatus() {
  const summary = `Saad Ali's Scorer Specs:\n- Precision@50: 74% (+247% lift)\n- Holdout ROC AUC: 0.747\n- Target Latency: 14ms`;
  navigator.clipboard.writeText(summary);
  showToast("Copied model status summary to clipboard!");
}

// --------------------------------------------------
// 1. Machine Learning Scorer Logic
// --------------------------------------------------
function calculateScore(event) {
  event.preventDefault();
  
  const impressions = parseFloat(document.getElementById('impressions').value);
  const clicks = parseFloat(document.getElementById('clicks').value);
  const avgPosition = parseFloat(document.getElementById('avg-position').value);
  const contentAge = parseFloat(document.getElementById('content-age').value);
  const scrollRate = parseFloat(document.getElementById('scroll-rate').value);
  const wordCount = parseFloat(document.getElementById('word-count').value);

  runInference(impressions, clicks, avgPosition, contentAge, scrollRate, wordCount);
  showToast("Scorer inference completed!");
}

function runInference(impressions, clicks, avgPosition, contentAge, scrollRate, wordCount) {
  // A. Model Probability (Logistic Regression)
  const log_imp = Math.log10(impressions);
  const log_clk = Math.log10(clicks + 1);
  const users = clicks * 1.1;
  const log_usr = Math.log10(users + 1);
  
  // Calculate logit z
  const z = MODEL_COEF.intercept 
            + MODEL_COEF.log_impressions_90d * log_imp
            + MODEL_COEF.avg_position * (avgPosition / 10) 
            + MODEL_COEF.content_age_days * (contentAge / 365)
            + MODEL_COEF.log_clicks_90d * log_clk
            + MODEL_COEF.users_90d * log_usr;
            
  // Apply logistic function
  const probability = 1 / (1 + Math.exp(-z));
  
  // B. Heuristic Score (Staleness & Striking Distance Heuristics)
  let heuristicScore = 0;
  // Striking distance position (3 to 15) gives opportunity
  if (avgPosition >= 3 && avgPosition <= 15) {
    heuristicScore += 40 - Math.abs(avgPosition - 8) * 2; // Peak opportunity near rank 8
  } else if (avgPosition < 3) {
    heuristicScore += 15; // Low opportunity for top ranked
  } else {
    heuristicScore += 10; // Low opportunity for deep ranks
  }
  
  // Staleness opportunity (>= 90 days update)
  if (contentAge >= 90) {
    heuristicScore += Math.min(40, (contentAge - 90) * 0.2 + 20);
  } else {
    heuristicScore += (contentAge / 90) * 15;
  }
  
  // Visibility threshold helper
  if (impressions >= 500) {
    heuristicScore += Math.min(20, (impressions / 2000) * 10 + 10);
  } else {
    heuristicScore += (impressions / 500) * 10;
  }
  
  heuristicScore = Math.min(100, Math.max(0, Math.round(heuristicScore)));
  
  // C. Blend Opportunity Score (70% model prob + 30% heuristic)
  const probPercent = probability * 100;
  const blendedScore = Math.round(0.70 * probPercent + 0.30 * heuristicScore);
  
  // D. Action Routing Classification
  let action = 'monitor';
  let reasoning = '';
  
  if (blendedScore >= 50 && probability >= 0.65) {
    action = 'refresh';
    reasoning = `High priority: Model signals high probability of traffic decline (${(probability * 100).toFixed(1)}%) paired with severe content staleness (${Math.round(contentAge)} days). Schedule structural copyedit refresh immediately.`;
  } else if (avgPosition >= 1 && avgPosition <= 20 && (clicks / impressions) < 0.005 && impressions >= 500) {
    action = 'review_ctr';
    reasoning = `CTR optimization: Page sits in visible striking distance (rank ${avgPosition.toFixed(1)}) but has an underperforming CTR (<0.5%). Prioritize rewriting titles, snippet hooks, and meta descriptions instead of rewriting body text.`;
  } else if (scrollRate < 30 && clicks >= 10) {
    action = 'review_engagement';
    reasoning = `Engagement warning: High bounce characteristics detected (scroll rate ${scrollRate}% is under the 30% threshold). Reorganize content structure, add bullet lists, or embed interactive media to capture user scroll attention.`;
  } else if (wordCount < 1200 && impressions >= 250) {
    action = 'expand';
    reasoning = `Thin content: Word count is low (${Math.round(wordCount)} words) but page is capturing visibility. Expand core sections, answer popular related questions, and double text length to anchor ranking.`;
  } else {
    action = 'monitor';
    reasoning = `Stable state: Opportunity score is low (${blendedScore}/100). Content performance is either highly stable, freshly refreshed, or currently holds low query demand. Monitor GSC logs.`;
  }

  // E. Update UI Elements
  document.getElementById('gauge-value-text').textContent = blendedScore;
  document.getElementById('res-probability').textContent = `${(probability * 100).toFixed(1)}%`;
  document.getElementById('res-heuristic').textContent = `${heuristicScore}/100`;
  document.getElementById('res-reasoning').textContent = reasoning;
  
  // Set Gauge Dashoffset
  const fillCircle = document.getElementById('gauge-fill-circle');
  const circumference = 2 * Math.PI * 40; // 251.2
  const offset = circumference - (blendedScore / 100) * circumference;
  fillCircle.style.strokeDasharray = `${circumference - offset}, ${circumference}`;

  // Update Action badge classes
  const actionBadge = document.getElementById('action-badge');
  actionBadge.className = `value-badge action-${action}`;
  
  const actionLabels = {
    'refresh': '🚨 STRUCTURAL REFRESH',
    'review_ctr': '🔍 CTR TITLE EDIT',
    'review_engagement': '📈 LAYOUT ENGAGEMENT',
    'expand': '✍️ CONTENT EXPANSION',
    'monitor': '🛡️ MONITOR PERFORMANCE'
  };
  actionBadge.textContent = actionLabels[action] || 'MONITOR';

  // Save in state
  state.currentScorerResult = {
    impressions, clicks, avgPosition, contentAge, scrollRate, wordCount,
    probability, heuristicScore, blendedScore, action, reasoning
  };
}

// --------------------------------------------------
// 2. Personal AI Agent Console Logic
// --------------------------------------------------
const AGENT_QUICK_REPLIES = [
  { text: "Score sample page data", query: "Score a page with 8000 impressions, 50 clicks, rank 14, 250 days old, 40% scroll, 800 words." },
  { text: "Explain coefficients", query: "What are your model's coefficients and what do they mean?" },
  { text: "How did you handle leakage?", query: "How did you audit and handle feature leakage in this project?" },
  { text: "What are the limitations?", query: "What are the core failure modes or limits of your ML scorer?" }
];

function initAgentChat() {
  const messagesBox = document.getElementById('agent-chat-messages');
  messagesBox.innerHTML = '';
  
  addChatBubble("agent", "Hi! I'm Saad's Personal Portfolio Agent. I have tool access to search his project specs, run his Content Scorer model, and fetch his professional credentials. Ask me anything or select a prompt below!");
  
  renderQuickReplies(AGENT_QUICK_REPLIES);
  
  // Clear trace logs
  const traceBox = document.getElementById('agent-trace-logs');
  traceBox.innerHTML = `<div class="log-entry"><span class="log-time">[${getTimestamp()}]</span> <span class="log-state">[SYSTEM]</span> Agent engine initialized. Ready to execute tools.</div>`;
}

function renderQuickReplies(replies) {
  const container = document.getElementById('agent-quick-replies');
  container.innerHTML = '';
  replies.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = r.text;
    btn.onclick = () => handleQuickReply(r.query);
    container.appendChild(btn);
  });
}

function handleQuickReply(query) {
  document.getElementById('agent-chat-input').value = query;
  sendAgentMessage();
}

function addChatBubble(sender, text) {
  const messagesBox = document.getElementById('agent-chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  
  // Support simple code block formatting in bubble
  if (text.includes("```")) {
    const parts = text.split("```");
    bubble.innerHTML = parts[0] + "<pre>" + parts[1] + "</pre>" + (parts[2] || "");
  } else {
    bubble.textContent = text;
  }
  
  messagesBox.appendChild(bubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function addTraceLog(stateLabel, detail, output = null) {
  const traceBox = document.getElementById('agent-trace-logs');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  
  let stateSpan = '';
  if (stateLabel === 'THINKING') stateSpan = `<span class="log-state">[THINKING]</span>`;
  else if (stateLabel === 'TOOL_CALL') stateSpan = `<span class="log-state">[TOOL CALL]</span> <span class="log-tool">${detail.split('(')[0]}</span><span class="log-args">(${detail.substring(detail.indexOf('(')+1)}</span>`;
  else if (stateLabel === 'TOOL_OUTPUT') stateSpan = `<span class="log-state">[TOOL OUTPUT]</span>`;
  else if (stateLabel === 'ENGINE') stateSpan = `<span class="log-state">[ENGINE]</span>`;
  
  let content = `<span class="log-time">[${getTimestamp()}]</span> ${stateSpan} ${stateLabel === 'TOOL_CALL' ? '' : detail}`;
  
  if (output) {
    content += `<div class="log-output">${output}</div>`;
  }
  
  entry.innerHTML = content;
  traceBox.appendChild(entry);
  traceBox.scrollTop = traceBox.scrollHeight;
}

function getTimestamp() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

function resetAgentChat() {
  initAgentChat();
}

// Natural Language Agent Router and Simulated Execution Loop
function sendAgentMessage() {
  const inputEl = document.getElementById('agent-chat-input');
  const query = inputEl.value.trim();
  if (!query) return;
  
  // 1. Add user message
  addChatBubble("user", query);
  inputEl.value = '';
  
  // 2. Log engine query capture
  addTraceLog('ENGINE', `Received user query: "${query}"`);
  
  // Disable input during "thinking"
  inputEl.disabled = true;
  
  // 3. Evaluate query parameters (NLP routing)
  setTimeout(() => {
    routeAgentQuery(query, () => {
      inputEl.disabled = false;
      inputEl.focus();
    });
  }, 400);
}

function routeAgentQuery(query, onComplete) {
  const q = query.toLowerCase();
  
  // Route A: Model Scorer execution request
  if (q.includes('score') || q.includes('inference') || q.includes('impressions')) {
    // Extract numbers from query if present, else use default
    const numMatches = query.match(/\d+(\.\d+)?/g);
    let imps = 8000, clks = 50, pos = 14, age = 250, scroll = 40, words = 800;
    
    if (numMatches && numMatches.length >= 2) {
      imps = parseFloat(numMatches[0]);
      clks = parseFloat(numMatches[1]);
      if (numMatches.length >= 3) pos = parseFloat(numMatches[2]);
      if (numMatches.length >= 4) age = parseFloat(numMatches[3]);
      if (numMatches.length >= 5) scroll = parseFloat(numMatches[4]);
      if (numMatches.length >= 6) words = parseFloat(numMatches[5]);
    }
    
    addTraceLog('THINKING', `Evaluating query. Query indicates a page scoring request. Parsing features...`);
    
    setTimeout(() => {
      addTraceLog('TOOL_CALL', `run_model_inference(impressions=${imps}, clicks=${clks}, avg_position=${pos}, age=${age}, scroll_rate=${scroll}, word_count=${words})`);
      
      setTimeout(() => {
        // Run actual inference on playground UI
        document.getElementById('impressions').value = imps;
        document.getElementById('clicks').value = clks;
        document.getElementById('avg-position').value = pos;
        document.getElementById('content-age').value = age;
        document.getElementById('scroll-rate').value = scroll;
        document.getElementById('word-count').value = words;
        runInference(imps, clks, pos, age, scroll, words);
        
        const res = state.currentScorerResult;
        const toolJson = JSON.stringify({
          blended_score: res.blendedScore,
          model_probability: `${(res.probability * 100).toFixed(1)}%`,
          heuristic_score: res.heuristicScore,
          action: res.action
        }, null, 2);
        
        addTraceLog('TOOL_OUTPUT', `Inference engine returned scoring result:`, toolJson);
        
        setTimeout(() => {
          addTraceLog('THINKING', `Formulating editorial action recommendation...`);
          
          setTimeout(() => {
            const reply = `I ran the Content Refresh Scorer model on your page data:\n- **Blended Score**: ${res.blendedScore}/100\n- **Inference Prob**: ${(res.probability * 100).toFixed(1)}%\n- **Action Recommendation**: ${res.action.toUpperCase()}\n\n${res.reasoning}`;
            addChatBubble("agent", reply);
            onComplete();
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }
  
  // Route B: Coefficients explanation
  else if (q.includes('coef') || q.includes('weight') || q.includes('importance')) {
    addTraceLog('THINKING', `Searching specs for model parameters and feature importances...`);
    
    setTimeout(() => {
      addTraceLog('TOOL_CALL', `get_model_coefficients()`);
      
      setTimeout(() => {
        const coefJson = JSON.stringify(MODEL_COEF, null, 2);
        addTraceLog('TOOL_OUTPUT', `Retrieved feature weights:`, coefJson);
        
        setTimeout(() => {
          addTraceLog('THINKING', `Synthesizing explanation of coefficients...`);
          
          setTimeout(() => {
            const reply = `Saad's Logistic Regression model features these key coefficients:\n1. **log_impressions_90d** (+1.27): High visibility indicates high statistical decay potential (highest room to fall).\n2. **users_90d** (-0.83) & **log_clicks_90d** (-0.56): High active user traffic is a robust signal of stability.\n3. **avg_position** (-0.40): Pages ranked lower (numerically larger) have less room to decay.\n4. **content_age_days** (-0.37): Older content displays survivorship bias (surviving pages tend to remain stable).`;
            addChatBubble("agent", reply);
            onComplete();
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }
  
  // Route C: Feature Leakage explanation
  else if (q.includes('leakage') || q.includes('leak') || q.includes('split')) {
    addTraceLog('THINKING', `Querying code audits for data safety checks and train/test splits...`);
    
    setTimeout(() => {
      addTraceLog('TOOL_CALL', `get_data_safety_logs()`);
      
      setTimeout(() => {
        const safetyInfo = `Safety Audit Passed:\n- Target Leakage Checked: Excluded trend_pct, trend_direction\n- Client ID leakage prevention: Grouped train/test split enforced (client_id GroupKFold)`;
        addTraceLog('TOOL_OUTPUT', `Safety and leakage logs loaded:`, safetyInfo);
        
        setTimeout(() => {
          addTraceLog('THINKING', `Synthesizing explanation of leakage protection...`);
          
          setTimeout(() => {
            const reply = `To ensure an honest model, we implemented two major safeguards against feature leakage:\n1. **Dropping Label Derivations**: Direct outcome columns like \`trend_direction\` and \`trend_pct\` were deleted from features, as they represent the future state the model is trying to predict.\n2. **Group-Based Validation Split**: Standard random train/test splits leak client-specific patterns. We split our data grouped by \`client_id\`, holding out 7 entire clients (20% of the data) for testing. This verifies that the model generalizes to completely unseen client distributions.`;
            addChatBubble("agent", reply);
            onComplete();
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }
  
  // Route D: Limitations explanation
  else if (q.includes('limit') || q.includes('fail') || q.includes('tail') || q.includes('weakness')) {
    addTraceLog('THINKING', `Querying model diagnostic notes for weak zones...`);
    
    setTimeout(() => {
      addTraceLog('TOOL_CALL', `get_model_limitations()`);
      
      setTimeout(() => {
        const limitInfo = `- Stability Paradox: False positives on stable evergreen pages.\n- Tail Query Sparsity: High noise under 250 impressions.\n- Competitor Updates: Model misses external competitive content shifts.`;
        addTraceLog('TOOL_OUTPUT', `Limitations retrieved:`, limitInfo);
        
        setTimeout(() => {
          addTraceLog('THINKING', `Synthesizing diagnostic summary...`);
          
          setTimeout(() => {
            const reply = `Our model has three defined limitations that content reviewers must keep in mind:\n1. **The Stability Paradox**: Older, highly visible pages with high impressions are flagged by the model because they have "room to fall", even if their ranking is stable. These represent evergreen assets and are false positives.\n2. **Tail Query Noise**: Pages with <250 impressions over 90 days suffer from sparse data and high noise. We apply a heuristic filter to bypass these.\n3. **Competitor Blind Spot**: The model cannot see competitor edits since it is trained entirely on internal telemetry (GSC and GA4). Competitor content refreshes look like sudden, unexplained clicks drops.`;
            addChatBubble("agent", reply);
            onComplete();
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }
  
  // Route E: Skills / Experience
  else if (q.includes('skill') || q.includes('experience') || q.includes('who') || q.includes('about')) {
    addTraceLog('THINKING', `Querying Saad Ali's portfolio profile index...`);
    
    setTimeout(() => {
      addTraceLog('TOOL_CALL', `search_portfolio_data({ query: "skills_experience" })`);
      
      setTimeout(() => {
        const profileJson = JSON.stringify({
          name: "Saad Ali",
          track: "Machine Learning / AI Engineering",
          core_focus: "Data pipeline engineering, predictive modeling, tool-calling agents",
          internship: "FlyRank AI Internship (Weeks 1-8 completed)"
        }, null, 2);
        addTraceLog('TOOL_OUTPUT', `Portfolio search returned Saad's profile:`, profileJson);
        
        setTimeout(() => {
          addTraceLog('THINKING', `Synthesizing bio response...`);
          
          setTimeout(() => {
            const reply = `Saad Ali is a Machine Learning and AI Engineer completing the FlyRank AI Internship. His core skillset covers:\n- **ML Modeling**: Classification/Regression architectures, leakage checks, GroupKFold cross-validation.\n- **AI Workflow Engineering**: Structured chains, Evaluator-Optimizer feedback loops, and custom MCP servers.\n- **Full-Stack Development**: Custom database integration, responsive client-side visual analytics, and API deployment.`;
            addChatBubble("agent", reply);
            onComplete();
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }
  
  // Route F: Contact Info
  else if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('github')) {
    addTraceLog('THINKING', `Retrieving contact records...`);
    
    setTimeout(() => {
      addTraceLog('TOOL_CALL', `get_contact_info()`);
      
      setTimeout(() => {
        const contactJson = JSON.stringify({
          github: "https://github.com/Saadali880",
          email: "saadali880@users.noreply.github.com",
          linkedin: "https://linkedin.com/in/saadali"
        }, null, 2);
        addTraceLog('TOOL_OUTPUT', `Contact records loaded:`, contactJson);
        
        setTimeout(() => {
          addTraceLog('THINKING', `Synthesizing contact response...`);
          
          setTimeout(() => {
            const reply = `You can connect with Saad Ali via the following channels:\n- **GitHub**: https://github.com/Saadali880\n- **Project Repository**: https://github.com/Saadali880/flyrank-ml-internship-saad\n- **Email**: saadali880@users.noreply.github.com`;
            addChatBubble("agent", reply);
            onComplete();
          }, 800);
        }, 800);
      }, 1000);
    }, 800);
  }
  
  // Default Route: Help / Greeting
  else {
    addTraceLog('THINKING', `Parsing query fallback. User asked general question. Generating helper greeting...`);
    
    setTimeout(() => {
      const reply = `I'm here to help you explore Saad's work! You can ask me questions such as:\n- "Can you score a page?" (or click a quick reply below)\n- "What are your model's coefficients?"\n- "How did you handle feature leakage?"\n- "What are the limitations of your machine learning scorer?"\n- "Tell me about Saad's skills and background."`;
      addChatBubble("agent", reply);
      onComplete();
    }, 1000);
  }
}

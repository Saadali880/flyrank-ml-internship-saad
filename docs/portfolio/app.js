// app.js - Personal Portfolio Scorer Widget

// Model Coefficients from Saad's research paper
const MODEL_COEF = {
  intercept: -0.5,
  log_impressions_90d: 1.27,
  avg_position: -0.40,
  content_age_days: -0.37,
  log_clicks_90d: -0.56,
  users_90d: -0.83 // estimated as clicks * 1.1 in normalized scaling
};

// Default constants for inputs not present in the simplified widget form
const DEFAULT_SCROLL_RATE = 55;
const DEFAULT_WORD_COUNT = 1400;

document.addEventListener('DOMContentLoaded', () => {
  console.log("Saad Ali Portfolio Loaded.");
  
  // Contact Form Submission Handler
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const submitBtn = document.getElementById('contact-submit-btn');
      const resultContainer = document.getElementById('contact-result');
      const feedbackText = document.getElementById('contact-message-feedback');
      const statusBadge = document.getElementById('contact-badge');
      
      // Update UI to show sending status
      resultContainer.classList.remove('hidden');
      statusBadge.className = 'badge badge-sending';
      statusBadge.textContent = '⚡ SENDING...';
      feedbackText.textContent = 'Connecting to backend API gateway and verifying credentials...';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const formData = new FormData(contactForm);
      
      // Verify access key placeholder
      const accessKey = formData.get('access_key');
      if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
        // Fallback for visual mock testing when access key is not set
        setTimeout(() => {
          statusBadge.className = 'badge badge-success';
          statusBadge.textContent = '✅ SUCCESS (MOCK)';
          feedbackText.textContent = 'Developer Mode: Form submitted successfully! (Note: Replace "YOUR_ACCESS_KEY_HERE" in index.html with a real Web3Forms key to route messages to your real inbox).';
          contactForm.reset();
          submitBtn.textContent = 'Message Sent';
        }, 1200);
        return;
      }

      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok || data.success) {
          statusBadge.className = 'badge badge-success';
          statusBadge.textContent = '✅ SUCCESS';
          feedbackText.textContent = 'Your message has been processed by the backend and sent directly to my email address. Thank you!';
          contactForm.reset();
          submitBtn.textContent = 'Message Sent';
        } else {
          throw new Error(data.message || 'Web3Forms API refused the submission.');
        }
      })
      .catch((error) => {
        console.error("Web3Forms Formspree submission error:", error);
        statusBadge.className = 'badge badge-error';
        statusBadge.textContent = '❌ ERROR';
        feedbackText.textContent = `Transmission failed: ${error.message || 'Please check your internet connection and try again.'}`;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
    });
  }
});

function evaluateWidget(event) {
  event.preventDefault();

  // 1. Gather Form Values
  const impressions = parseFloat(document.getElementById('impressions').value);
  const clicks = parseFloat(document.getElementById('clicks').value);
  const avgPosition = parseFloat(document.getElementById('position').value);
  const contentAge = parseFloat(document.getElementById('age').value);

  // 2. Perform Inference
  const result = runInference(impressions, clicks, avgPosition, contentAge);

  // 3. Update DOM
  const resultContainer = document.getElementById('widget-result');
  const resultScore = document.getElementById('result-score');
  const resultBadge = document.getElementById('result-badge');
  const resultReason = document.getElementById('result-reason');

  // Remove hidden class
  resultContainer.classList.remove('hidden');

  // Update text values
  resultScore.textContent = `${result.blendedScore}/100 (Probability: ${result.probPercent}%)`;
  resultReason.textContent = result.reasoning;

  // Set action badge classes
  resultBadge.className = 'badge';
  if (result.action === 'refresh') {
    resultBadge.classList.add('badge-refresh');
    resultBadge.textContent = '🚨 Refresh';
  } else if (result.action === 'monitor') {
    resultBadge.classList.add('badge-leave');
    resultBadge.textContent = '🛡️ Monitor';
  } else {
    resultBadge.classList.add('badge-monitor');
    resultBadge.textContent = `🔍 ${result.action.replace('_', ' ').toUpperCase()}`;
  }
}

function runInference(impressions, clicks, avgPosition, contentAge) {
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
  const probPercent = Math.round(probability * 100);
  const blendedScore = Math.round(0.70 * (probability * 100) + 0.30 * heuristicScore);
  
  // D. Action Routing Classification
  let action = 'monitor';
  let reasoning = '';
  
  if (blendedScore >= 50 && probability >= 0.65) {
    action = 'refresh';
    reasoning = `High priority: Model signals high probability of traffic decline (${(probability * 100).toFixed(1)}%) paired with content staleness (${Math.round(contentAge)} days). Schedule structural copyedit refresh immediately.`;
  } else if (avgPosition >= 1 && avgPosition <= 20 && (clicks / impressions) < 0.005 && impressions >= 500) {
    action = 'review_ctr';
    reasoning = `CTR optimization: Page sits in visible striking distance (rank ${avgPosition.toFixed(1)}) but has an underperforming CTR. Prioritize rewriting titles, snippet hooks, and meta descriptions.`;
  } else if (DEFAULT_SCROLL_RATE < 30 && clicks >= 10) {
    action = 'review_engagement';
    reasoning = `Engagement warning: High bounce characteristics detected (scroll rate ${DEFAULT_SCROLL_RATE}% is low). Reorganize content structure and add visual elements.`;
  } else if (DEFAULT_WORD_COUNT < 1200 && impressions >= 250) {
    action = 'expand';
    reasoning = `Thin content: Word count is low (${DEFAULT_WORD_COUNT} words) but page is capturing visibility. Expand core sections and answer popular related questions.`;
  } else {
    action = 'monitor';
    reasoning = `Stable state: Opportunity score is low (${blendedScore}/100). Content performance is either highly stable, freshly refreshed, or holds low query demand. Monitor GSC logs.`;
  }

  return {
    blendedScore,
    probPercent,
    action,
    reasoning
  };
}

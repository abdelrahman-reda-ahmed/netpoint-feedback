(function () {
  const SUPABASE_URL = "https://pxfgbsdhlletvavcgmoq.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Zmdic2RobGxldHZhdmNnbW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDA1NzcsImV4cCI6MjA5OTc3NjU3N30.fDYqrSDXC0gkEeb05OwErIkJu8SLU7JHADjWNxFVmiM";

  const RATING_FIELDS = [
    { key: "clarity", labels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"] },
    { key: "pace", labels: ["", "Too Slow", "A Bit Slow", "Just Right", "A Bit Fast", "Too Fast"] },
    { key: "relevance", labels: ["", "Not Relevant", "Slightly", "Moderately", "Very", "Exactly"] },
    { key: "theory_practice_balance", labels: ["", "All Theory", "Mostly Theory", "Balanced", "Mostly Practice", "All Practice"] },
    { key: "instructor_clarity", labels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"] },
    { key: "materials_quality", labels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"] },
    { key: "hands_on_usefulness", labels: ["", "Not Useful", "Slightly", "Moderately", "Very", "Extremely"] },
    { key: "quiz_app_usefulness", labels: ["", "Not Useful", "Slightly", "Moderately", "Very", "Extremely"] },
    { key: "overall_satisfaction", labels: ["", "Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"] },
    { key: "confidence", labels: ["", "Not Confident", "Slightly", "Somewhat", "Confident", "Very Confident"] },
  ];

  var ratings = {};
  var sessionNumber = null;
  var db = null;

  function getSessionFromURL() {
    var params = new URLSearchParams(window.location.search);
    var s = params.get("session");
    if (s && !isNaN(s) && parseInt(s) > 0) {
      return parseInt(s);
    }
    return null;
  }

  function showError(msg) {
    document.getElementById("sessionLabel").textContent = msg;
  }

  function init() {
    if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
      showError("Failed to load. Check your connection and refresh.");
      return;
    }

    try {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      showError("Connection error. Please refresh.");
      return;
    }

    sessionNumber = getSessionFromURL();
    var form = document.getElementById("feedbackForm");
    var sessionLabel = document.getElementById("sessionLabel");
    var sessionFallback = document.getElementById("sessionFallback");

    if (sessionNumber !== null) {
      sessionLabel.textContent = "Session " + sessionNumber;
      form.style.display = "block";
    } else {
      sessionLabel.textContent = "Session not specified";
      sessionFallback.style.display = "block";
      form.style.display = "block";

      document.getElementById("sessionInput").addEventListener("input", function () {
        var val = parseInt(this.value);
        if (val > 0) {
          sessionNumber = val;
          sessionLabel.textContent = "Session " + sessionNumber;
        }
      });
    }

    setupRatingButtons();
    setupFormSubmit();
  }

  function setupRatingButtons() {
    document.querySelectorAll(".rating-group").forEach(function (group) {
      var field = group.dataset.field;
      var labelEl = group.querySelector(".rating-label");
      var buttons = group.querySelectorAll("button");

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var value = parseInt(btn.dataset.value);
          ratings[field] = value;

          buttons.forEach(function (b) { b.classList.remove("selected"); });
          btn.classList.add("selected");

          var fieldInfo = RATING_FIELDS.find(function (f) { return f.key === field; });
          if (fieldInfo) {
            labelEl.textContent = fieldInfo.labels[value];
          }
        });
      });
    });
  }

  function setupFormSubmit() {
    var form = document.getElementById("feedbackForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!sessionNumber) {
        sessionNumber = parseInt(document.getElementById("sessionInput").value);
      }

      if (!sessionNumber || sessionNumber <= 0) {
        alert("Please enter a valid session number.");
        return;
      }

      var missing = RATING_FIELDS.filter(function (f) { return !ratings[f.key]; });
      if (missing.length > 0) {
        var names = missing.map(function (f) {
          var g = document.querySelector('[data-field="' + f.key + '"]');
          return g ? g.querySelector("label").textContent : f.key;
        });
        alert("Please rate all items:\n\n" + names.join("\n"));
        return;
      }

      var submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      var payload = {
        p_session_number: sessionNumber,
        p_clarity: ratings.clarity,
        p_pace: ratings.pace,
        p_relevance: ratings.relevance,
        p_theory_practice_balance: ratings.theory_practice_balance,
        p_instructor_clarity: ratings.instructor_clarity,
        p_materials_quality: ratings.materials_quality,
        p_hands_on_usefulness: ratings.hands_on_usefulness,
        p_quiz_app_usefulness: ratings.quiz_app_usefulness,
        p_overall_satisfaction: ratings.overall_satisfaction,
        p_confidence: ratings.confidence,
        p_comments: document.getElementById("comments").value.trim() || null,
      };

      db.rpc("submit_feedback", payload)
        .then(function (result) {
          if (result.error) throw result.error;
          document.getElementById("feedbackForm").style.display = "none";
          document.getElementById("successMessage").style.display = "block";
        })
        .catch(function (err) {
          console.error("Submit error:", err);
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Feedback";
          alert("Submission failed. Please try again.");
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

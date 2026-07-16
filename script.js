const SUPABASE_URL = "https://pxfgbsdhlletvavcgmoq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Zmdic2RobGxldHZhdmNnbW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMDA1NzcsImV4cCI6MjA5OTc3NjU3N30.fDYqrSDXC0gkEeb05OwErIkJu8SLU7JHADjWNxFVmiM";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const RATING_FIELDS = [
  { key: "clarity", label: "Poor", labels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"] },
  { key: "pace", label: "Poor", labels: ["", "Too Slow", "A Bit Slow", "Just Right", "A Bit Fast", "Too Fast"] },
  { key: "relevance", label: "Poor", labels: ["", "Not Relevant", "Slightly", "Moderately", "Very", "Exactly"] },
  { key: "theory_practice_balance", label: "Poor", labels: ["", "All Theory", "Mostly Theory", "Balanced", "Mostly Practice", "All Practice"] },
  { key: "instructor_clarity", label: "Poor", labels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"] },
  { key: "materials_quality", label: "Poor", labels: ["", "Poor", "Fair", "Good", "Very Good", "Excellent"] },
  { key: "hands_on_usefulness", label: "Poor", labels: ["", "Not Useful", "Slightly", "Moderately", "Very", "Extremely"] },
  { key: "quiz_app_usefulness", label: "Poor", labels: ["", "Not Useful", "Slightly", "Moderately", "Very", "Extremely"] },
  { key: "overall_satisfaction", label: "Poor", labels: ["", "Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"] },
  { key: "confidence", label: "Low", labels: ["", "Not Confident", "Slightly", "Somewhat", "Confident", "Very Confident"] },
];

const ratings = {};
let sessionNumber = null;

function getSessionFromURL() {
  const params = new URLSearchParams(window.location.search);
  const s = params.get("session");
  if (s && !isNaN(s) && parseInt(s) > 0) {
    return parseInt(s);
  }
  return null;
}

function init() {
  sessionNumber = getSessionFromURL();
  const form = document.getElementById("feedbackForm");
  const sessionLabel = document.getElementById("sessionLabel");
  const sessionFallback = document.getElementById("sessionFallback");

  if (sessionNumber !== null) {
    sessionLabel.textContent = "Session " + sessionNumber;
    form.style.display = "block";
  } else {
    sessionLabel.textContent = "Session not specified";
    sessionFallback.style.display = "block";
    form.style.display = "block";

    document.getElementById("sessionInput").addEventListener("input", function () {
      const val = parseInt(this.value);
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
  document.querySelectorAll(".rating-group").forEach((group) => {
    const field = group.dataset.field;
    const labelEl = group.querySelector(".rating-label");
    const buttons = group.querySelectorAll("button");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = parseInt(btn.dataset.value);
        ratings[field] = value;

        buttons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        const fieldInfo = RATING_FIELDS.find((f) => f.key === field);
        if (fieldInfo) {
          labelEl.textContent = fieldInfo.labels[value];
        }
      });
    });
  });
}

function setupFormSubmit() {
  const form = document.getElementById("feedbackForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!sessionNumber) {
      sessionNumber = parseInt(document.getElementById("sessionInput").value);
    }

    if (!sessionNumber || sessionNumber <= 0) {
      alert("Please enter a valid session number.");
      return;
    }

    const missing = RATING_FIELDS.filter((f) => !ratings[f.key]);
    if (missing.length > 0) {
      const names = missing.map((f) => {
        const group = document.querySelector(`[data-field="${f.key}"]`);
        return group ? group.querySelector("label").textContent : f.key;
      });
      alert("Please rate all items:\n\n" + names.join("\n"));
      return;
    }

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const payload = {
      session_number: sessionNumber,
      clarity: ratings.clarity,
      pace: ratings.pace,
      relevance: ratings.relevance,
      theory_practice_balance: ratings.theory_practice_balance,
      instructor_clarity: ratings.instructor_clarity,
      materials_quality: ratings.materials_quality,
      hands_on_usefulness: ratings.hands_on_usefulness,
      quiz_app_usefulness: ratings.quiz_app_usefulness,
      overall_satisfaction: ratings.overall_satisfaction,
      confidence: ratings.confidence,
      comments: document.getElementById("comments").value.trim() || null,
    };

    try {
      const { error } = await supabase.from("feedback").insert([payload]);
      if (error) throw error;

      document.getElementById("feedbackForm").style.display = "none";
      document.getElementById("successMessage").style.display = "block";
    } catch (err) {
      console.error("Submit error:", err);
      document.getElementById("errorMessage").style.display = "block";
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

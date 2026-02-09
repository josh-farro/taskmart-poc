
document.addEventListener("DOMContentLoaded", () => {
  // Teacher page is intentionally not access-controlled beyond client side.
  // Instructors can set Training Mode and reset data per-browser.

  const toggle = document.getElementById("trainingToggle");
  const state = document.getElementById("trainingState");
  const preserve = document.getElementById("preserveTraining");
  const resetBtn = document.getElementById("resetAllBtn");
  const resetHardBtn = document.getElementById("resetHardBtn");

  function sync(){
    const on = TM.isTrainingMode();
    toggle.checked = on;
    state.textContent = on ? "ON" : "OFF";
    state.className = on ? "badge danger" : "badge ok";
  }

  toggle.addEventListener("change", ()=>{
    TM.setTrainingMode(toggle.checked);
    sync();
    // refresh banner and any page sinks after change
    window.location.reload();
  });

  resetBtn.addEventListener("click", ()=>{
    TM.resetLab(true);
    window.location.reload();
  });

  resetHardBtn.addEventListener("click", ()=>{
    TM.resetLab(false);
    window.location.reload();
  });

  sync();
});


document.addEventListener("DOMContentLoaded", () => {
  const s = TM.getSession();
  const who = document.getElementById("whoami");
  if (who){
    if (s) who.textContent = `${s.username} (${s.role})`;
    else who.textContent = "Not logged in";
  }
  const training = TM.isTrainingMode();
  const mode = document.getElementById("mode");
  if (mode) mode.textContent = training ? "Training Mode ON" : "Safe Mode (default)";
});

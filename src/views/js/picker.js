document.querySelector(
  "#picker"
).style.border = "10px solid rgba(200, 200, 200, 0.3)";

document.addEventListener(
  "DOMContentLoaded",
  () => window.api.send("pickerRequested"),
  false
);
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") { window.api.send("closePicker"); }
  },
  false
);

window.api.on("updatePicker", (event, color) => {
  document.querySelector("#picker").style.border = `10px solid ${color}`;
});

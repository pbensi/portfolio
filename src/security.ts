export function initSecurity() {
  /** ----------------------------- */
  /** BLOCK RIGHT-CLICK & SHORTCUTS */
  /** ----------------------------- */
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key)) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      alert("Inspect is disabled on this site!");
    }
  });

  /** ----------------------------- */
  /** DEVTOOLS DETECTION */
  /** ----------------------------- */
  let devtoolsBlocked = false;

  // Getter trick
  const detector = new Image();
  Object.defineProperty(detector, "id", {
    get() {
      if (!devtoolsBlocked) {
        devtoolsBlocked = true;
        blockUser();
      }
    },
  });

  const interval = setInterval(() => {
    console.log(detector);
    console.clear();
  }, 1000);

  function blockUser() {
    clearInterval(interval);
    document.body.innerHTML = "";
    window.location.replace("/blocked.html");
  }

  /** ----------------------------- */
  /** BLUR CONTENT ON TAB SWITCH */
  /** ----------------------------- */
  document.addEventListener("visibilitychange", () => {
    document.body.style.filter = document.hidden ? "blur(12px)" : "none";
  });

  /** ----------------------------- */
  /** DISABLE TEXT SELECTION & DRAG */
  /** ----------------------------- */
  const style = document.createElement("style");
  style.innerHTML = `
    * { user-select: none; -webkit-user-drag: none; }
    input, textarea { user-select: text; }
  `;
  document.head.appendChild(style);

  /** ----------------------------- */
  /** WATERMARK */
  /** ----------------------------- */
  const watermark = document.createElement("div");
  watermark.innerText = "© Frank-Site";
  watermark.style.cssText = `
    position: fixed;
    inset: 0;
    font-size: 60px;
    opacity: 0.08;
    transform: rotate(-30deg);
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  document.body.appendChild(watermark);
}

(() => {
  "use strict";

  function setupTabs() {
    const buttons = Array.from(
      document.querySelectorAll(".tab-button[data-tab]")
    );
    const panels = Array.from(
      document.querySelectorAll(".tab-panel[data-panel]")
    );

    if (!buttons.length || !panels.length) {
      console.warn("Tab controls or tab panels were not found.");
      return;
    }

    const validTabs = new Set(
      buttons.map((button) => button.dataset.tab)
    );

    function activateTab(tabName, updateHash = true) {
      const nextTab = validTabs.has(tabName) ? tabName : "about";

      buttons.forEach((button) => {
        const selected = button.dataset.tab === nextTab;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== nextTab;
      });

      if (updateHash) {
        window.history.replaceState(null, "", `#${nextTab}`);
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        activateTab(button.dataset.tab);
      });

      button.addEventListener("keydown", (event) => {
        const supportedKeys = [
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End"
        ];

        if (!supportedKeys.includes(event.key)) return;
        event.preventDefault();

        let targetIndex = index;

        if (event.key === "ArrowLeft") {
          targetIndex = (index - 1 + buttons.length) % buttons.length;
        }

        if (event.key === "ArrowRight") {
          targetIndex = (index + 1) % buttons.length;
        }

        if (event.key === "Home") targetIndex = 0;
        if (event.key === "End") targetIndex = buttons.length - 1;

        buttons[targetIndex].focus();
        activateTab(buttons[targetIndex].dataset.tab);
      });
    });

    window.addEventListener("hashchange", () => {
      activateTab(window.location.hash.slice(1), false);
    });

    activateTab(
      window.location.hash.slice(1) || "about",
      false
    );
  }

  function fitEnglishTitle() {
    const chineseTitle = document.querySelector(".project-title-zh");
    const englishTitle = document.querySelector(".project-title-en");

    if (!chineseTitle || !englishTitle) return;

    const targetWidth = chineseTitle.getBoundingClientRect().width;
    if (!targetWidth) return;

    englishTitle.style.width = "auto";

    let low = 10;
    let high = 42;

    for (let i = 0; i < 18; i += 1) {
      const midpoint = (low + high) / 2;
      englishTitle.style.fontSize = `${midpoint}px`;

      const currentWidth =
        englishTitle.getBoundingClientRect().width;

      if (currentWidth <= targetWidth) {
        low = midpoint;
      } else {
        high = midpoint;
      }
    }

    englishTitle.style.fontSize = `${low}px`;
    englishTitle.style.width = `${targetWidth}px`;
    englishTitle.style.textAlign = "center";
  }

  function setupTitleFitting() {
    const scheduleFit = () => {
      window.requestAnimationFrame(() => {
        try {
          fitEnglishTitle();
        } catch (error) {
          console.warn("Title fitting failed:", error);
        }
      });
    };

    window.addEventListener("resize", scheduleFit);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFit).catch(scheduleFit);
    } else {
      scheduleFit();
    }
  }

  function init() {
    // Initialize tab navigation first, so a title-fitting problem
    // can never disable Exposition or Reference.
    setupTabs();
    setupTitleFitting();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

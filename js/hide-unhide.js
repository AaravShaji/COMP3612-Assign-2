/* ============================= */
/* HIDE AND UNHIDE ARTICLES JAVASCRIPT */
/* ============================= */

document.addEventListener("DOMContentLoaded", () => {

    function showView(viewName) {
        // Hide all
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

        // Show selected view
        const view = document.getElementById(`view-${viewName}`);
        if (view) view.classList.add("active");
    }

    document.querySelector(".navbar-container").addEventListener("click", (e) => {
        const target = e.target.closest("[data-view]");
        if (!target) return;
        showView(target.dataset.view);
    });

    document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-view]");
        if (!target) return;

        // Prevent double handling for navbar
        if (e.target.closest(".navbar-container")) return;

        showView(target.dataset.view);
    });

    // add animations for clicking navbar 
    document.querySelectorAll(".nav-link").forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;

            document.querySelectorAll(".view").forEach(v => {
                v.classList.remove("active", "gender-fade");
            });

            const target = document.getElementById(`view-${view}`);
            if (!target) return;

            target.classList.add("active");

            // Apply fade animation ONLY to gender pages
            if (view === "women" || view === "men") {
                target.classList.add("gender-fade");
            }
        });
    });


});

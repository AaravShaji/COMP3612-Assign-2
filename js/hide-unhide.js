document.addEventListener("DOMContentLoaded", ()=>{

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


});
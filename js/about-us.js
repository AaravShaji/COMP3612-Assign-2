/* ============================= */
/* ABOUT US MODAL JAVASCRIPT */
/* ============================= */

document.addEventListener("DOMContentLoaded", ()=>{

const aboutModal = document.getElementById("aboutModal");
const aboutBtn = document.querySelector("[data-view='about']");
const aboutFooterBtn = document.getElementById("aboutFooterBtn");
const closeX = document.getElementById("aboutCloseX");
const closeBtn = document.getElementById("aboutCloseBtn");

// Open modal when clicking About in navbar
aboutBtn.addEventListener("click", e => {
    e.preventDefault();
    aboutModal.showModal();
});

// Open modal when clicking footer link
if (aboutFooterBtn) {
    aboutFooterBtn.addEventListener("click", () => aboutModal.showModal());
}

// Close modal (bottom button)
closeBtn.addEventListener("click", () => aboutModal.close());

// Close modal (X icon)
closeX.addEventListener("click", () => aboutModal.close());

    
});
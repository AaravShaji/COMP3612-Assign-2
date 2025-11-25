/* ============================================================
   ABOUT US MODAL JAVASCRIPT 
   ------------------------------------------------------------
   Responsibilities:
   - Open the modal when user clicks “About” in the navbar
   - Open the modal when user clicks “About This Project” in footer
   - Close the modal when user clicks the X or Close button
   - Uses <dialog> element + showModal()/close()
   ============================================================ */

document.addEventListener("DOMContentLoaded", ()=>{

    //DOM References
    const aboutModal     = document.getElementById("aboutModal");
    const aboutBtn       = document.querySelector("[data-view='about']");
    const aboutFooterBtn = document.getElementById("aboutFooterBtn");
    const closeX         = document.getElementById("aboutCloseX");
    const closeBtn       = document.getElementById("aboutCloseBtn");

    aboutBtn.addEventListener("click", e => {
        e.preventDefault();
        aboutModal.showModal();
    });

    if (aboutFooterBtn) {
        aboutFooterBtn.addEventListener("click", () => aboutModal.showModal());
    }

    closeBtn.addEventListener("click", () => aboutModal.close());

    // Close modal (X icon)
    closeX.addEventListener("click", () => aboutModal.close());
});
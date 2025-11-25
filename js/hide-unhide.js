/*======================================================
/* HIDE AND UNHIDE ARTICLES JAVASCRIPT (SPA VIEW ROUTER)
/*======================================================
   This script controls which <article> "view" is visible at
   any time. It implements simple single-page-app style routing:

   - Each main section of the page is an <article> with class="view"
     and an id like: view-home, view-women, view-men, view-browse, etc.

   - Any clickable element with a data-view="name" attribute
     will switch to the matching article:
        data-view="home"   -> <article id="view-home">
        data-view="women"  -> <article id="view-women">
        data-view="men"    -> <article id="view-men">, etc.

   - Navbar links, hero buttons, breadcrumbs, and category cards
     all use this system, so navigation is consistent across the app.

   - A small extra: when switching to women/men pages from the navbar,
     a CSS animation class "gender-fade" is added for a nicer effect.
*/
document.addEventListener("DOMContentLoaded", () => {

    /*--------------------
     * showView(viewName)
     *--------------------
     *   Hides all .view articles and then activates exactly one:
     * 
     *   showView("home")  -> shows #view-home
     *   showView("women") -> shows #view-women
     *   showView("cart")  -> shows #view-cart
     */
    function showView(viewName) {
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));

        const view = document.getElementById(`view-${viewName}`);
        if (view) view.classList.add("active");
    }

    /*--------------------
    * NAVBAR CLICK HANDLER
    *--------------------
    *   Listens specifically on the .navbar-container element so that:
    *   - Any child element with data-view will trigger a view change
    *   - Works for logo, nav buttons, cart button, etc.
    */
    document.querySelector(".navbar-container").addEventListener("click", (e) => {
        const target = e.target.closest("[data-view]");
        if (!target) return;
        showView(target.dataset.view);
    });

    /*--------------------------------------------------
    /* GLOBAL CLICK HANDLER FOR OTHER data-view ELEMENTS
    /*--------------------------------------------------
    *   This covers elements outside the navbar:
    *   - Hero "Shop Women / Shop Men" buttons
    *   - Breadcrumb links (Home > gender > category)
    *   - Category cards on women/men views
    *   - Any other element that uses data-view
    *
    *   We skip events that already originated inside .navbar-container
    *   to avoid handling the same click twice.
    */
    document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-view]");
        if (!target) return;

        // Prevent double handling for navbar
        if (e.target.closest(".navbar-container")) return;

        showView(target.dataset.view);
    });

    /*-------------------------
    /* NAVBAR ANIMATION HANDLER
    /*-------------------------
    *  Adds a subtle animation when switching views from the navbar.
    *  - Removes "active" and "gender-fade" from all views
    *  - Activates the clicked view
    *  - If the view is "women" or "men", adds "gender-fade" so
    *  the section can animate in via CSS.
    */
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

document.addEventListener("DOMContentLoaded", () => {

    const track = document.querySelector(".slider-track");
    const barFill = document.querySelector(".slider-bar-fill");
    const slides = document.querySelectorAll(".slide");

    let index = 0;
    const total = slides.length;

    function rotateSlide() {
        index = (index + 1) % total;
        
        // Credit: https://www.w3schools.com/cssref/func_translatex.php
        track.style.transform = `translateX(-${index * 100}%)`; 

        barFill.style.width = `${((index + 1) / total) * 100}%`;
    }

    setInterval(rotateSlide, 3000);
});
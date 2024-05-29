$(document).ready(function() {
    // Navbar scrolling effect
    $(window).scroll(function() {
        const navEl = $('.navbar');
        if ($(this).scrollTop() >= 40) {
            navEl.addClass('navbar-scrolled');
        } else {
            navEl.removeClass('navbar-scrolled');
        }
    });

    // Form validation and submission
    const form = $(".contact-form");
    const inputs = form.find(".input-field");
    const sendBtn = form.find(".send-btn");

    sendBtn.click(function(event) {
        event.preventDefault();
        let isValid = true;

        inputs.each(function() {
            if ($(this).val().trim() === "") {
                isValid = false;
                showErrorMessage($(this), "This field is required.");
            } else {
                hideErrorMessage($(this));
                console.log("Message Sent");
            }
        });

        if (isValid) {
            alert("Message sent!");
            form[0].reset();
        }
    });

    function showErrorMessage(input, message) {
        const errorDiv = input.parent().find(".error");
        errorDiv.text(message).css("color", "red");
    }

    function hideErrorMessage(input) {
        input.parent().find(".error").text("");
    }

    // Form submission popup message
    const formElement = document.querySelector('.contact-form');
    formElement.addEventListener('submit', function(event) {
        event.preventDefault();
        const popupMessage = document.getElementById('popup-message');
        popupMessage.textContent = "Form submitted successfully!";
        popupMessage.classList.add('show');
        setTimeout(function() {
            popupMessage.classList.remove('show');
            popupMessage.textContent = "";
        }, 3000);
        formElement.reset();
    });
});

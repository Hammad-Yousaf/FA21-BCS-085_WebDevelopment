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
$(document).ready(function() {
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
});

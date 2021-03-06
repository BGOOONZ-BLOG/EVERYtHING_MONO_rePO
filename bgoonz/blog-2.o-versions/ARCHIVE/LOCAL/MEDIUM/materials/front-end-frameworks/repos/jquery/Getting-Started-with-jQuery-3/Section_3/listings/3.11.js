$(() => {
  $("#switcher h3").hover(
    function () {
      $(this).addClass("hover");
    },
    function () {
      $(this).removeClass("hover");
    }
  );
});

$(() => {
  $("#switcher").click(function (event) {
    if (event.target == this) {
      $(this).children("button").toggleClass("hidden");
    }
  });
});

$(() => {
  $("#switcher-default").addClass("selected");

  $("#switcher button").click(function () {
    const bodyClass = this.id.split("-")[1];

    $("body").removeClass().addClass(bodyClass);
    $(this).addClass("selected").siblings("button").removeClass("selected");
  });
});

$(() => {
  $("#selected-plays > li").addClass("horizontal");

  $("#selected-plays li:not(.horizontal)").addClass("sub-level");
});

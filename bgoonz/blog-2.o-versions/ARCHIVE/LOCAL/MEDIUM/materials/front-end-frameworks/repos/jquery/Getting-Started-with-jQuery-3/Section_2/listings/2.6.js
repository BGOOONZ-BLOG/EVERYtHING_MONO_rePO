$(() => {
  $("#selected-plays > li").addClass("horizontal");

  $("#selected-plays li:not(.horizontal)").addClass("sub-level");

  $('a[href^="mailto:"]').addClass("mailto");

  $('a[href$=".pdf"]').addClass("pdflink");

  $('a[href^="http"][href*="henry"]').addClass("henrylink");

  $("tr:even").addClass("alt");

  $("tr").filter(":even").addClass("alt");
});

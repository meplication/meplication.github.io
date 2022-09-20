$(function() {
  // let url = $(location).attr("pathname");

  // includeHTML
  $("header").load("/include/header.html");
  $("footer").load("/include/footer.html");
});

// 숫자 추출
function extNumber(res) {
  return Number(res.replace(/[^0-9]/g, ""));
}

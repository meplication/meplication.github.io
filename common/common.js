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

// 시간날짜분리
function getDatebyString(date) {
  return {
    year: date.substr(0, 4),
    month: date.substr(4, 2),
    day: date.substr(6, 2),
    hour: date.substr(8, 2),
    min: date.substr(10, 2),
  };
}
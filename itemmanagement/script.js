$(function () {
  // datepicker초기화
  $("#datepicker").datepicker({
    changeMonth: true,
    dateFormat: "yy.mm.dd.",
    monthNames: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    monthNamesShort: [
      "1,",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ],
    dayNames: [
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
      "일요일",
    ],
    dayNamesMin: ["월", "화", "수", "목", "금", "토", "일"],
    onSelect: function (dateText, inst) {
      $("#time").focus();
    },
  });

  // autocomplete
  $("#name").autocomplete({
    source: function (request, response) {
      $.ajax({
        type: "get",
        url: "itemList.json",
        dataType: "json",
        success: function (data) {
          response(
            $.map(data["list"], function (item) {
              if (item.indexOf(request.term) >= 0) {
                return {
                  label: item,
                  value: item,
                };
              }
            })
          );
        },
      });
    },
    minLength: 1,
    focus: function (event, ui) {
      return false;
    },
    select: function (event, ui) {
      $("#datepicker").focus();
    },
  });

  // 로컬스토리지 확인
  if ($.isEmptyObject(localStorage.getItem("itemManagement")))
    localStorage.setItem("itemManagement", JSON.stringify([]));
  else {
    let list = JSON.parse(localStorage.getItem("itemManagement"));

    for (let i of list) {
      let content = `
            <tr data-rds="${i["rds"]}">
                <td>${i["name"]}</td>
                <td>${i["date"]}<br>${replaceTime(i["time"])}</td>
                <td data-date="${i["eDate"]}" class="remaining_time"></td>
                <td>
                    <button class="btn_delete btn btn-danger btn-sm"><i class="fa-solid fa-x"></i></button>
                </td>
            </tr>`;
      $(".table tbody").append(content);
    }
  }

  // 시간 자동 변경
  $("#time").change(function () {
    let date = $("#time").val();
    let h = date.substr(0, 2),
      m = date.substr(2, 2);

    if (parseInt(h) > 24 || parseInt(m) >= 60) {
      alert("시간을 잘못 입력했습니다.");
      $("#time").val("");
    }
  });

  // 시간칸 클릭시 초기화
  $("#time").click(function () {
    $("#time").val("");
  });

  // 등록버튼
  $("#btn_regist").click(function () {
    let $name = $("#name"),
      $date = $("#datepicker"),
      $time = $("#time"),
      rds = randomStr();
    let eDate =
      $date.val().replace(/[^0-9]/g, "") + $time.val().replace(/[^0-9]/g, "");

    // 빈칸 확인
    if ($name.val() == "") {
      alert("아이템 이름을 입력해주세요.");
      $("#name").focus();
      return;
    }
    if ($date.val() == "") {
      alert("날짜를 입력해주세요.");
      $("#datepicker").focus();
      return;
    }
    if ($time.val() == "") {
      alert("시간을 입력해주세요.");
      $("#time").focus();
      return;
    }

    let content = `
          <tr data-rds="${rds}">
              <td>${$name.val()}</td>
              <td>${$date.val()}<br>${replaceTime($time.val())}</td>
              <td data-date="${eDate}" class="remaining_time"></td>
              <td>
                  <button class="btn_delete btn btn-danger btn-sm"><i class="fa-solid fa-x"></i></button>
              </td>
          </tr>`;

    $(".table tbody").append(content);

    // 로컬스토리지
    let obj = {
        rds: rds,
        name: $name.val(),
        date: $date.val(),
        time: $time.val(),
        eDate: eDate,
      },
      list = JSON.parse(localStorage.getItem("itemManagement"));
    list.push(obj);
    localStorage.setItem("itemManagement", JSON.stringify(list));

    // 초기화
    $name.val("");
    $date.val("");
    $time.val("");
  });
});

function replaceTime(data) {
  let h = data.substr(0, 2),
    m = data.substr(2, 2);

  return h + "시 " + m + "분";
}

// 남은시간 업데이트
function remainingUpdate() {
  let $arr = $(".table tbody").children();
  let now = new Date();
  let nDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes()
  );

  for (let i = 0; i < $arr.length; i++) {
    let expire = subdate(String($arr.eq(i).children().eq(2).data("date")));
    let eDate = new Date(
      expire.year,
      expire.mouth,
      expire.day,
      expire.hour,
      expire.min
    );

    let diffMSec = eDate.getTime() - nDate.getTime();
    let rMin = (diffMSec / 1000 / 60) % 60;
    let rHour = parseInt((diffMSec / 1000 / 60 / 60) % 24);
    let rDay = parseInt(diffMSec / 1000 / 60 / 60 / 24);

    if (rDay < 0 || rHour < 0 || rMin < 0)
      $arr.eq(i).css("border-left", "solid Gray 10px");
    else if (rDay > 7) $arr.eq(i).css("border-left", "solid Green 10px");
    else if (rDay > 4) $arr.eq(i).css("border-left", "solid Orange 10px");
    else if (rDay >= 0) $arr.eq(i).css("border-left", "solid Red 10px");

    $arr
      .eq(i)
      .children()
      .eq(2)
      .html(rDay + "일 " + rHour + "시간 " + rMin + "분");
  }
}
setInterval(remainingUpdate, 1000);

// 삭제버튼
$(document).on("click", ".btn_delete", function () {
  let rds = $(this).parents().eq(1).data("rds");
  let filterArr = JSON.parse(localStorage.getItem("itemManagement")).filter(
    function (data) {
      return data["rds"] != rds;
    }
  );

  $(this).parents("tr").remove();
  localStorage.setItem("itemManagement", JSON.stringify(filterArr));
});

// 시간날짜분리
function subdate(date) {
  return {
    year: date.substr(0, 4),
    mouth: date.substr(4, 2),
    day: date.substr(6, 2),
    hour: date.substr(8, 2),
    min: date.substr(10, 2),
  };
}

// 랜덤 문자열
function randomStr() {
  let rds = Math.random().toString(36).substring(2, 12),
    list = localStorage.getItem("itemManagement");

  if (list.indexOf(rds) > 0) rds = randomStr();

  return rds;
}



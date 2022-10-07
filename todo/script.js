$(function () {
  // localStorage
  if ($.isEmptyObject(localStorage.getItem("todo"))) {
    // localStorage.setItem("todo", JSON.stringify({ character: [], todlList: []}));
  } else {
    localStorageObj = _.cloneDeep(JSON.parse(localStorage.getItem("todo")));
    localStorageObj["selected"] = 0;

    // 새로운 todo 확인
    checkUpdate();

    // todo초기화
    let t = new Date(localStorageObj.latestConnect.split(".")[0]),
      now = new Date();

    if (isPast(t)) {
      for (let i of localStorageObj["todoList"]) {
        for (let j in i) {
          if (j.indexOf("daily") < 0 ? false : true) {
            if (now.getDay() !== t.getDay()) {
              for (let k in i[j]) {
                i[j][k]["isClear"] = 0;
              }
            }
          } else if (j.indexOf("weekly") < 0 ? false : true) {
            if (now.getDate() === 4) {
              for (let k in i[j]) {
                i[j][k]["isClear"] = 0;
              }
            }
          } else if (j.indexOf("monthly") < 0 ? false : true) {
            if (now.getMonth() !== t.getMonth()) {
              for (let k in i[j]) {
                i[j][k]["isClear"] = 0;
              }
            }
          }
        }
      }
    }
  }

  //
  setTodoList();

  //
  if (localStorageObj["character"].length) $("#modal-characterList").find(".row").eq(0).html("");
  for (let i of localStorageObj["character"]) {
    $("#modal-characterList").find(".row").eq(0).append(getCharacterList(i));
  }
  if (localStorageObj.character.length)
    setCharacterSelect(localStorageObj["character"][0]);
});
import { specialRewardList } from "./list/specialReward.js";
import { dailyEventList } from "./list/dailyEvent.js";
import { weeklyEventList } from "./list/weeklyEvent.js";
import { dailyContentList } from "./list/dailyContent.js";
import { dailyBossList } from "./list/dailyBoss.js";
import { dailySymbolList } from "./list/dailySymbol.js";
import { weeklyContentList } from "./list/weeklyContent.js";
import { weeklyBossList } from "./list/weeklyBoss.js";
import { monthlyBossList } from "./list/monthlyBoss.js";
const arrList = [specialRewardList, dailyEventList, weeklyEventList, dailyContentList, dailyBossList, dailySymbolList, weeklyContentList, weeklyBossList, monthlyBossList],
  arrNameList = ["specialReward", "dailyEvent", "weeklyEvent", "dailyContent", "dailyBoss", "dailySymbol", "weeklyContent", "weeklyBoss", "monthlyBoss"];
const isIOS = navigator.userAgent.match(/iPad/i)|| navigator.userAgent.match(/iPhone/i);
const eventName = isIOS ? "pagehide" : "beforeunload";
var localStorageObj = {
  character: [],
  todoList: [],
};

$(window).on(eventName, function () {
  localStorageObj["latestConnect"] = new Date();
  localStorage.setItem("todo", JSON.stringify(localStorageObj));
});

$(document).on("click", ".content-body", function () {
  if ($("#option").is(":checked")) return;
  else if ($(".character-list").length === 0) {
    alert("캐릭터를 추가해주세요.");
    return;
  } else if ($(".character-select > div > img").attr("src") === undefined) {
    alert("캐릭터를 선택해주세요.");
    return;
  } else if ($(this).hasClass("coming-soon-blur")) return;
  let $element = $(this).children();
  let id = $(this).attr("id"),
    target = $(this).parents().eq(1).attr("id").split("-")[0];

  $element.eq(1).toggleClass("clear");
  if ($element.eq(2).children().hasClass("circle-red")) {
    $element.eq(2).children().eq(0).removeClass("circle-red");
    $element.eq(2).children().eq(0).addClass("circle-green");
    inputClearTodo(target, id, 1);
  } else {
    $element.eq(2).children().eq(0).removeClass("circle-green");
    $element.eq(2).children().eq(0).addClass("circle-red");
    inputClearTodo(target, id, 0);
  }

  setCnt(target);
  setPrograss(target);
  localStorage.setItem("todo", JSON.stringify(localStorageObj));
});

$(document).on("change", "#option", function () {
  if ($(".character-list").length === 0) {
    $(this).prop("checked", false);
    alert("캐릭터를 추가해주세요.");
    return;
  } else if ($(".character-select > div > img").attr("src") === undefined) {
    $(this).prop("checked", false);
    alert("캐릭터를 선택해주세요.");
    return;
  }
  if ($(this).is(":checked")) {
    $(this).next().html('<i class="fa-solid fa-floppy-disk"></i>');
    removeTodo();
    setOptionList();
  } else {
    $(this).next().html('<i class="fa-solid fa-gear"></i>');
    removeTodo();
    setTodoList();
  }
  for (let i in arrList) {
    setCnt(arrNameList[i]);
    setPrograss(arrNameList[i]);
  }
});

$(document).on("change", ".toggle-switchy", function () {
  let id = $(this).attr("for"),
    category = $(this).parents().eq(3).attr("id").split("-")[0];

  if ($("#" + id).is(":checked")) {
    inputHiddenTodo(category, id, 0);
  } else {
    inputHiddenTodo(category, id, 1);
  }
  localStorage.setItem("todo", JSON.stringify(localStorageObj));
});

$(document).on("click", "#btn-character-add", function () {
  $("#modal-characterAdd").modal("show");
});

$(document).on("shown.bs.modal", "#modal-characterAdd", function () {
  $("#other-char").focus();
});

$(document).on("click", "#btn-modal-other", function () {
  let name = $("#other-char").val(),
    res;

  if (name === "") {
    alert("닉네임을 입력해주세요.");
    $("#other-char").focus();
    return;
  } else if(localStorageObj["character"].filter((char) => (char.name == name)).length) {
    alert("이미 있는 캐릭터 입니다.");
    $("#other-char").focus();
    return;
  }
  res = getCharacter(name);
  if (Object.prototype.hasOwnProperty.call(res, "error")) {
    alert();
    $("#modal-characterAdd").modal("hide");
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(localStorageObj, "character") || localStorageObj["character"].length === 0) {
    localStorageObj["character"] = [_.cloneDeep(res)];
    localStorageObj["selected"] = 0;
    setCharacterSelect(res);
    localStorageObj["todoList"] = [_.cloneDeep(getTodoInit())];
    $("#modal-characterList").find(".row").eq(0).html("");
  } else {
    localStorageObj["character"].push(_.cloneDeep(res));
    localStorageObj["todoList"].push(_.cloneDeep(getTodoInit()));
  }
  $("#modal-characterList").find(".row").eq(0).append(getCharacterList(res));
  localStorage.setItem("todo", JSON.stringify(localStorageObj));

  $("#other-char").val("");
  $("#option").attr("disabled", false);
  $("#modal-characterAdd").modal("hide");
});

$(document).on("click", "#btn-character-change", function () {
  $("#modal-characterList").modal("show");
});

$(document).on("click", ".character-list", function () {
  let name = $(this).find(".character-name").html();

  for (let i in localStorageObj["character"]) {
    if (localStorageObj["character"][i]["name"] === name) {
      localStorageObj["selected"] = i;
      setCharacterSelect(localStorageObj["character"][i]);
      removeTodo();
      setTodoList();
      $("#modal-characterList").modal("hide");
      return;
    }
  }
});

function setPrograss(target) {
  let $progress = $("#" + target + "-header").find(".progress-bar");
  let clearCnt = $("#" + target + "-body").children().find(".clear").length, 
    maxCnt = $("#" + target + "-body").children().length,
    lockCnt = $("#" + target + "-body").children().find(".coming-soon").length;

  $progress.css("width", (clearCnt / (maxCnt - lockCnt)) * 100 + "%");
}

function setCnt(target) {
  let clearCnt = $("#" + target + "-body").children().find(".clear").length, 
    maxCnt = $("#" + target + "-body").children().length,
    lockCnt = $("#" + target + "-body").children().find(".coming-soon").length;

  $("#" + target + "-header")
    .children()
    .children()
    .eq(1)
    .text(clearCnt + " / " + (maxCnt - lockCnt));
}

function setCharacterSelect(data) {
  $(".character-select").find("img").attr("src", data["avatarImg"]);
  $(".character-select").find(".character-name").html(data["name"]);
  $(".character-select").find(".character-info").html(data["level"] + " " + data["job"]);
}

function setTodoList() {
  for (let i in arrList) {
    createTodo(arrList[i], arrNameList[i], i);
    setCnt(arrNameList[i]);
    setPrograss(arrNameList[i]);
  }
}

function setOptionList() {
  for (let i in arrList) {
    createOption(arrList[i], arrNameList[i]);
    setCnt(arrNameList[i]);
    setPrograss(arrNameList[i]);
  }
}

function createTodo(data, target, idx) {
  for (let i in data) {
    let startDate = arrList[idx][i].startDate,
      endDate = arrList[idx][i].endDate;

    if (endDate !== undefined) {
      endDate = getDatebyString(endDate);
      endDate = new Date(endDate.year, endDate.month-1, endDate.day, endDate.hour, endDate.min);
      if (isPast(endDate)) continue;
    }
    if (!getHiddenState(target, data[i].id)) {
      if (startDate !== undefined) {
        startDate = getDatebyString(startDate);
        if(isPast(new Date(startDate.year, startDate.month-1, startDate.day, startDate.hour, startDate.min)))
          $("#" + target + "-body").append(getTodoContent(data[i], getClearStatus(target, data[i].id), false));
        else
          $("#" + target + "-body").append(getTodoContent(data[i], getClearStatus(target, data[i].id), true));
      } else {
        $("#" + target + "-body").append(getTodoContent(data[i], getClearStatus(target, data[i].id), false));
      }
    }
  }
}

function createOption(data, target) {
  for (let i in data) {
    let endDate = data[i].endDate;

    if (endDate !== undefined) {
      endDate = getDatebyString(endDate);
      endDate = new Date(endDate.year, endDate.month-1, endDate.day, endDate.hour, endDate.min);
      if (isPast(endDate)) continue;
    }
    $("#" + target + "-body").append(
      getOptionContent(data[i], getHiddenState(target, data[i].id))
    );
  }
}

function removeTodo() {
  for (let i in arrNameList) {
    $("#" + arrNameList[i] + "-body").html(" ");
  }
}

function getTodoContent(data, isClear, isOpen) {
  if (isClear) {
    return `
      <div class="p-3 pt-0 col-12 col-lg-6 col-xxl-4">
        <div id="${data["id"]}" class="row bg-light text-center align-items-center content-body">
            <div class="col-2"><img src="${data["icon"]}"></div>
            <div class="col-8 clear"><div>${data["title"]}</div><div class="end-date">${getEndDate(data["endDate"])}</div></div>
            <div class="col-2"><div class="circle-green"></div>
            </div>
        </div>
      </div>
    `;
  } else {
    if (isOpen) {
      return `
        <div class="p-3 pt-0 col-12 col-lg-6 col-xxl-4 form-floating">
          <div class="coming-soon">COMING SOON</div>
          <div class="coming-soon-timer">00 00 00 00</div>
          <div id="${data["id"]}" class="row bg-light text-center align-items-center content-body coming-soon-blur">
              <div class="col-2"><img src="${data["icon"]}"></div>
              <div class="col-8"><div>${data["title"]}</div><div class="end-date">${getEndDate(data["endDate"])}</div></div>
              <div class="col-2"><div class="circle-red"></div>
              </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="p-3 pt-0 col-12 col-lg-6 col-xxl-4">
          <div id="${data["id"]}" class="row bg-light text-center align-items-center content-body">
              <div class="col-2"><img src="${data["icon"]}"></div>
              <div class="col-8"><div>${data["title"]}</div><div class="end-date">${getEndDate(data["endDate"])}</div></div>
              <div class="col-2"><div class="circle-red"></div>
              </div>
          </div>
        </div>
      `;
    }
  }
}

function getOptionContent(data, isHidden) {
  if (isHidden) {
    return `
      <div class="p-3 pt-0 col-12 col-lg-6 col-xxl-4">
        <div class="row bg-light text-center align-items-center content-body">
            <div class="col-2 col-lg-2 col-xxl-2"><img src="${data["icon"]}"></div>
            <div class="col-7 col-lg-8 col-xxl-7"><div>${data["title"]}</div><div class="end-date">${getEndDate(data["endDate"])}</div></div>
            <div class="col-3 col-lg-2 col-xxl-3">
              <label for="${data["id"]}" class="toggle-switchy" data-color="orange" data-style="rounded">
                <input type="checkbox" id="${data["id"]}">
                  <span class="toggle">
                    <span class="switch"></span>
                  </span>
              </label>
            </div>
            </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="p-3 pt-0 col-12 col-lg-6 col-xxl-4">
        <div class="row bg-light text-center align-items-center content-body">
            <div class="col-2 col-lg-2 col-xxl-2"><img src="${data["icon"]}"></div>
            <div class="col-7 col-lg-8 col-xxl-7"><div>${data["title"]}</div><div class="end-date">${getEndDate(data["endDate"])}</div></div>
            <div class="col-3 col-lg-2 col-xxl-3">
              <label for="${data["id"]}" class="toggle-switchy" data-color="orange" data-style="rounded">
                <input checked type="checkbox" id="${data["id"]}">
                  <span class="toggle">
                    <span class="switch"></span>
                  </span>
              </label>
            </div>
            </div>
        </div>
      </div>
    `;
  }
}

function getCharacterList(data) {
  return `
    <div class="p-lg-3 py-lg-1 p-1 col-12 col-lg-6">
      <div class="row align-items-center text-start py-1 character-list">
          <div class="text-end g-0 col-3 col-lg-3 form-floating">
              <img class="character-img" src="${data["avatarImg"]}" />
          </div>
          <div class="col-7 col-lg-9 g-0">
              <div class="dividingLine-left">
                  <div class="character-name">${data["name"]}</div>
                  <div class="character-info">${data["level"]} ${data["job"]}</div>
              </div>
          </div>
      </div>
    </div>
  `;
}

function getEndDate(data) {
  let date = data ? getDatebyString(data) : "";

  if (date)
    return (
      "~ " +
      date["year"] +
      "년 " +
      date["month"] +
      "월 " +
      date["day"] +
      "일 " +
      date["hour"] +
      "시 " +
      date["min"] +
      "분"
    );
  else return "";
}

function getCharacter(name) {
  let characterInfo;

  $.ajax({
    url: "https://meplication.koreacentral.cloudapp.azure.com/getCharacter",
    data: JSON.stringify({ name: name }),
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    async: false,
    timeout: 1000,
    success: function (data) {
      // console.log(data);
      characterInfo = data;
    },
    error: function (data) {
      // console.log(data);
      characterInfo = data;
    },
  });

  return characterInfo;
}

function getTodoInit() {
  let todoObj = {};

  for (let i in arrList) {
    let tmpObj = {};
    for (let j of arrList[i]) tmpObj[j.id] = { isClear: 0, isHidden: 0 };
    todoObj[arrNameList[i]] = _.cloneDeep(tmpObj);
  }

  return todoObj;
}

function getHiddenState(target, id) {
  if (localStorageObj["todoList"].length === 0) return false;
  else if (!Object.prototype.hasOwnProperty.call(localStorageObj["todoList"][localStorageObj.selected][target], id)) return false;
  else return localStorageObj["todoList"][localStorageObj.selected][target][id]["isHidden"] ? true : false;
}

function getClearStatus(target, id) {
  if (localStorageObj["todoList"].length === 0) return false;
  else if(!Object.prototype.hasOwnProperty.call(localStorageObj["todoList"][localStorageObj.selected][target], id)) return false;
  else return localStorageObj["todoList"][localStorageObj.selected][target][id]["isClear"] ? true : false;
}

function inputClearTodo(target, id, isClear) {
  if (!Object.prototype.hasOwnProperty.call(localStorageObj["todoList"][localStorageObj.selected][target], id))
    localStorageObj["todoList"][localStorageObj.selected][target][id] = _.cloneDeep({});
  localStorageObj["todoList"][localStorageObj.selected][target][id]["isClear"] = isClear;
}

function inputHiddenTodo(target, id, isHidden) {
  if (!Object.prototype.hasOwnProperty.call(localStorageObj["todoList"][localStorageObj.selected][target], id))
    localStorageObj["todoList"][localStorageObj.selected][target][id] = _.cloneDeep({});
  localStorageObj["todoList"][localStorageObj.selected][target][id]["isHidden"] = isHidden;
}

function isPast(date) {
  let now = new Date();

  return now.getTime() > date.getTime() ? true : false;
}

setInterval(function () {
  let $elements = $(".coming-soon-timer");
  let _second = 1000;
  let _minute = _second * 60;
  let _hour = _minute * 60;
  let _day = _hour * 24;
  let now = new Date();

  $elements.each(function () {
    let id = $(this).next().attr("id"),
      category = $(this).parents().eq(1).attr("id").split("-")[0],
      idx,
      startDate,
      distance;

    idx = arrNameList.findIndex((x) => x === category);
    startDate = arrList[idx].find((i) => i.id === id).startDate;
    startDate = getDatebyString(startDate);
    startDate = new Date(startDate.year, startDate.month-1, startDate.day, startDate.hour, startDate.min);
    distance = startDate.getTime() - now.getTime();
    let days = String(Math.floor(distance / _day)).padStart(2, "0");
    let hours = String(Math.floor((distance % _day) / _hour)).padStart(2, "0");
    let minutes = String(Math.floor((distance % _hour) / _minute)).padStart(2, "0");
    let seconds = String(Math.floor((distance % _minute) / _second)).padStart(2, "0");
    if (distance < 0) {
      removeTodo();
      setTodoList();
    }

    $(this).html(days + " " + hours + " " + minutes + " " + seconds);
  });

  if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() === 59) location.reload();
}, 1000);

function checkUpdate() {
  for (let i of localStorageObj["todoList"]) {
    // category
    if (!(JSON.stringify(Object.keys(i)) === JSON.stringify(arrNameList))) {
      let diffList = arrNameList.filter((x) => !Object.keys(i).includes(x));

      for (let j of diffList) {
        let idx = arrNameList.findIndex((x) => x === j);

        i[j] = _.cloneDeep({});
        for (let k of arrList[idx])
          i[j][k.id] = _.cloneDeep({ isClear: 0, isHidden: 0 });
      }
    }

    // todoList
    for (let j in arrNameList) {
      let arr1 = arrList[j].map((x) => x.id);
      let arr2 = Object.keys(i[arrNameList[j]]);
      let diffList = arr1.filter((x) => !arr2.includes(x));

      if (diffList.length) {
        for (let k of diffList) {
          i[arrNameList[j]][k] = _.cloneDeep({ isClear: 0, isHidden: 0 });
        }
      }
    }
  }
}

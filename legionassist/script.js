var union = {
    members: 0,
    cnt: 0,
    rank: "",
    level: "",
  },
  unionEffect = {
    STR: 0,
    DEX: 0,
    INT: 0,
    LUK: 0,
    critical: 0,
    coolDown: 0,
    bossDamage: 0,
    ignoreDefense: 0,
    boostDamage: 0,
    buffDuration: 0,
    criticalDamage: 0,
    ATT: 0, //메이플스토리M
    EXP: 0,
    mesosDrop: 0,
    finalHP: 0, //미하일, 소울마스터
    summon: 0,
    recoverHP: 0,
    recoverMP: 0,
    maxHP: 0, //다크나이트
    maxMP: 0,
    statusResistance: 0,
  },
  legionSolver = {
    i18n: "KMS",
    pieceAmounts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  localStorageObj,
  syncCharacters = [],
  syncInterval = 20;

$(function () {
  // 모바일접속 확인
  if (Mobile()) {
    $("#mobile-Modal").modal("show");
  }

  $("#union-cnt").html(`<b>${union["cnt"]} / ${union["members"]}</b>`);

  // stats 값 변경감지
  $(".stats").on("DOMSubtreeModified ", function () {
    if ($(this).html() == 0) {
      $(this).parent().addClass("union-disable");
    } else {
      $(this).parent().removeClass("union-disable");
    }
  });

  // textarea 변환
  $("#input").on("paste", function (e) {
    let pasteText = (event.clipboardData || window.clipboardData)
      .getData("text")
      .split("\n");
    let idx, world;

    // 붙여넣기 작업취소
    e.preventDefault();
    for (let i in pasteText) {
      let nameIdx = pasteText[i].indexOf(
        "대표캐릭터는 10레벨 이상이어야 지정할 수 있습니다"
      );
      let worldIdx = pasteText[i].indexOf("캐릭터 선택");
      if (nameIdx != -1) {
        // idx = i;
      }
      if (worldIdx != -1) {
        idx = Number(i);
        world = pasteText[i].substring(worldIdx + 6, pasteText[i].length);
        // \r개행 제거
        if (world.indexOf("\r") != -1) {
          world = world.substring(0, world.length - 1);
        }
      }
    }
    // 원하는 정보 아니면 빠져나가기
    if (idx === undefined) return;

    let name = pasteText[idx + 2].split(world);
    for (let i = 1; i < name.length; i++) {
      if (name[i].indexOf(name[i - 1]) != -1) {
        let prevName = name[i].substring(
          name[i].indexOf(name[i - 1]),
          name[i - 1].length
        );
        name[i] = name[i].replace(prevName, "");
      }
    }

    var nameList = "";
    for (let i = 0; i < name.length - 1; i++) {
      nameList += name[i];
      if (i != name.length - 2) {
        nameList += "\n";
      }
    }
    $(this).val(nameList);
  });

  init();
  setUnionInfo();
});

// 모바일확인
function Mobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// 가져오기 클릭
$(document).on("click", "#btn-load", function () {
  $("#step-1").hide();
  $("#step-2").show();
  ajaxChar($("#input").val().split("\n"));
});

// 메이플M 모달
$(document).on("click", "#btn-mapleM", function () {
  $("#mapleM-Modal").modal("show");
});

$(document).on("click", "#btn-modal-mapleM", function () {
  if ($(".div-character > .row").find(".mapleM").length) {
    alert("이미 추가되어있습니다.");
    $("#mapleM-level").val("");
    $("#mapleM-Modal").modal("hide");
    return;
  }
  let characterObj = {
    class: "mapleM",
    stat: "ATT",
    level: $("#mapleM-level").val(),
    value: 0,
    selected: 0,
  };
  let character = _.cloneDeep(localStorageObj["character"]);

  if (characterObj["level"] >= 120) {
    characterObj["rank"] = "SS";
    characterObj["value"] = 20;
  } else if (characterObj["level"] >= 70) {
    characterObj["rank"] = "S";
    characterObj["value"] = 15;
  } else if (characterObj["level"] >= 50) {
    characterObj["rank"] = "A";
    characterObj["value"] = 10;
  } else if (characterObj["level"] >= 30) {
    characterObj["rank"] = "B";
    characterObj["value"] = 5;
  } else {
    alert("레벨을 다시 입력해주세요.");
    $("#mapleM-level").focus();
    return;
  }
  characterObj["effect"] =
    "공격력/마력" + " " + characterObj["value"] + " " + "증가";

  character.push(characterObj);
  localStorageObj["character"] = _.cloneDeep(character);
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));

  $(".div-character > .row").append(createCard(characterObj, "mapleM"));
  $("#mapleM-level").val("");
  $("#mapleM-Modal").modal("hide");
});

// 캐릭터추가 모달
$(document).on("click", "#btn-add", function () {
  $("#other-char-Modal").modal("show");
});

$(document).on("click", "#btn-modal-other", function () {
  let name = [$("#other-char").val()];

  if (name[0] == "") {
    alert("닉네임을 입력해주세요.");
    $("#other-char").focus();
    return;
  }
  ajaxChar(name);
  $("#other-char").val("");
  $("#other-char-Modal").modal("hide");
});

// 프리셋 모달
$(document).on("click", "#btn-preset", function () {
  $("#preset-Modal").modal("show");
});

$(document).on("click", "#btn-modal-preset", function () {
  let idx = $("input[name=radio-preset]:checked").val();
  let tooltip = $("input[name=radio-preset]:checked")
    .parents("div .div-preset-select")
    .children("input")
    .val();

  if (!$("input[name=radio-preset]:checked").length) {
    alert("프리셋을 선택해주세요.");
    return;
  }
  $("#btn-preset-" + idx).removeAttr("disabled");
  $("#btn-preset-" + idx).attr("data-tooltip", tooltip);

  $("input[name=radio-preset]:checked").prop("checked", false);
  $("#preset-Modal").modal("hide");

  // localStorage
  let presetObj = {};

  if (!$.isEmptyObject(localStorageObj["preset"]))
    presetObj = _.cloneDeep(localStorageObj["preset"][idx]);
  presetObj = {
    tooltip: tooltip,
    character: _.cloneDeep(localStorageObj["character"]),
    stats: _.cloneDeep(unionEffect),
    union: _.cloneDeep(union),
    legionSolver: _.cloneDeep(legionSolver),
  };

  if (!localStorageObj["preset"]) localStorageObj["preset"] = [];
  localStorageObj["preset"][idx] = _.cloneDeep(presetObj);
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
});

// 모달 포커스
$(document).on(
  "shown.bs.modal",
  "#mapleM-Modal, #other-char-Modal",
  function (e) {
    let id = $(this).attr("id");

    if (id == "mapleM-Modal") {
      $("#mapleM-level").focus();
    } else if (id == "other-char-Modal") {
      $("#other-char").focus();
    }
  }
);

// 코드 생성
$(document).on("click", "#btn-script", function () {
  const t = document.createElement("textarea");

  document.body.appendChild(t);
  t.value = `localStorage.setItem("pieceAmounts", "[${legionSolver["pieceAmounts"]}]");\nlocalStorage.setItem("i18n", "KMS");\nwindow.location.reload();`;
  t.select();
  document.execCommand("copy");
  document.body.removeChild(t);
  alert("복사했습니다.");
  if(confirm("LegionSolver로 이동하시겠습니까?")) {
    window.open("https://xenogents.github.io/LegionSolver/");
  }
});

// FIXME: LegionSolver 정상적으로 안됌
// 프리셋 클릭
$(document).on("click", "[id*=btn-preset-]", function () {
  // 토글
  $("[id*=btn-preset-]").each(function () {
    if ($(this).hasClass("btn-primary")) {
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-outline-primary");
    }
  });
  $(this).removeClass("btn-outline-primary");
  $(this).addClass("btn-primary");

  $(".div-character > .row").html("");

  localStorageObj["currentPreset"] = Number($(this).html());
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
  setPreset($(this).html());
});

// 캐릭터 선택
$(document).on("click", ".char-card", function () {
  let name = $(this).data("name"),
    Class = $(this).data("class"),
    rank = $(this).data("rank"),
    stat = $(this).data("stat").split(","),
    value = Number($(this).data("value"));
  let character = _.cloneDeep(localStorageObj["character"]);

  $("[id*=btn-preset-]").each(function () {
    if ($(this).hasClass("btn-primary")) {
      $(this).removeClass("btn-primary");
      $(this).addClass("btn-outline-primary");
    }
  });
  if ($(this).hasClass("selected") || $(this).hasClass("selected-mapleM")) {
    for (let i of stat) {
      unionEffect[i] -= value;
    }
    inputPiece(Class, rank, "-");
  } else {
    if (union["cnt"] == union["members"] && Class != "mapleM") {
      alert("더이상 선택할 수 없습니다.");
      return;
    }
    for (let i of stat) {
      unionEffect[i] += value;
    }
    inputPiece(Class, rank, "+");
  }

  for (let i of stat) {
    $(`#${i}`).html(unionEffect[i]);
  }

  if ($(this).hasClass("mapleM")) $(this).toggleClass("selected-mapleM");
  else $(this).toggleClass("selected");
  $(this).toggleClass("draw-border");

  if($(this).hasClass("selected")) {
    for (let i of character) if(i["name"] === name) i["selected"] = 1;
  } else {
    for (let i of character) if(i["name"] === name) i["selected"] = 0;
  }
  if($(this).hasClass("selected-mapleM")) {
    for (let i of character) if(i["class"] == "mapleM") i["selected"] = 1;
  } else {
    for (let i of character) if(i["class"] == "mapleM") i["selected"] = 0;
  }

  union["cnt"] = $(".selected").length;
  $("#union-cnt").html(`<b>${union["cnt"]} / ${union["members"]}</b>`);

  console.log(legionSolver["pieceAmounts"]);

  localStorageObj["character"] = _.cloneDeep(character);
  localStorageObj["stats"] = _.cloneDeep(unionEffect);
  localStorageObj["union"] = _.cloneDeep(union);
  localStorageObj["legionSolver"] = _.cloneDeep(legionSolver);
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
});

$(document).on("click", "#btn-sync", function () {
  let nameList = [],
    diffList;

  for (let i of localStorageObj["character"]) nameList.push(i.name);
  diffList = nameList.filter((x) => !syncCharacters.includes(x));
  diffList = diffList.filter((x) => x !== undefined);
  setSync(diffList, $(".refresh").parent());
  setSyncDisable();
});

$(document).on("click", ".refresh", function (e) {
  let name = $(this).parents().eq(1).data("name");
  
  if (syncCharacters.find((x) => x === name) ? false : true) {
    setRefreshDisalbe($(this));
    setSync(name, $(this).parent());
  }
  e.stopPropagation();
});

$(document).on("click", ".delete", function (e) {
  let name = $(this).parents().eq(1).data("name");
  let $element = $(this).parents().eq(2);

  removeCard($element, name);
  e.stopPropagation();
});

$(document).on("click", "#btn-reset", function () {
  localStorageObj = {};
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
  location.reload();
  alert("초기화 되었습니다.")
})

// 초기설정
function init() {
  localStorageObj = JSON.parse(localStorage.getItem("legionAssist"));

  if ($.isEmptyObject(localStorageObj)) {
    localStorageObj = {};
    localStorageObj["currentPreset"] = -1;
    localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
    $("#step-2").hide();
  } else {
    let currentPreset = localStorageObj["currentPreset"],
      storageCharacter,
      storageUnion,
      storageStats,
      storageLegionSolver,
      storagePreset,
      $statsElement = $("#div-union-stats").children().children(),
      $presetBtnElement = $("[id*=btn-preset-]");

    if (currentPreset > 0) {
      storageCharacter = _.cloneDeep(localStorageObj["preset"][currentPreset]["character"]);
      storageUnion = _.cloneDeep(localStorageObj["preset"][currentPreset]["union"]);
      storageStats = _.cloneDeep(localStorageObj["preset"][currentPreset]["stats"]);
      storageLegionSolver = _.cloneDeep(localStorageObj["preset"][currentPreset]["legionSolver"]);
    } else {
      if (isKeyExist(localStorageObj, "character")) storageCharacter = _.cloneDeep(localStorageObj["character"]);
      if (isKeyExist(localStorageObj, "union")) storageUnion = _.cloneDeep(localStorageObj["union"]);
      if (isKeyExist(localStorageObj, "stats")) storageStats = _.cloneDeep(localStorageObj["stats"]);
      if (isKeyExist(localStorageObj, "legionSolver")) storageLegionSolver = _.cloneDeep(localStorageObj["legionSolver"]);
      
    }
    if (isKeyExist(localStorageObj, "preset")) storagePreset = _.cloneDeep(localStorageObj["preset"]);

    if(!storageCharacter) $("#step-2").hide();

    // currentPreset
    if (currentPreset !== -1) {
      $("#btn-preset-" + currentPreset).removeClass("btn-outline-primary");
      $("#btn-preset-" + currentPreset).addClass("btn-primary");
    }

    // stats
    if(storageStats) {
      unionEffect = _.cloneDeep(storageStats);
      $statsElement.each(function () {
        let $stat = $(this).children().eq(1);
  
        $stat.text(unionEffect[$stat.attr("id")]);
      });
    }

    // union
    if (storageUnion) union = storageUnion;

    // preset
    if (storagePreset) {
      $(".input-explain").each(function (idx) {
        if (storagePreset[idx + 1]) {
          $(this).val(storagePreset[idx + 1]["tooltip"]);
          $presetBtnElement.eq(idx).removeAttr("disabled");
          $presetBtnElement
            .eq(idx)
            .attr("data-tooltip", storagePreset[idx + 1]["tooltip"]);
        }
      });
    }

    // character
    if (storageCharacter) {
      $("#step-1").hide();
      for (let i of storageCharacter) {
        if (i["stat"] == "ATT") {
          if (i["selected"])
            $(".div-character > .row").append(createCard(i, "mapleM", 1));
          else $(".div-character > .row").append(createCard(i, "mapleM"));
        } else {
          if (i["selected"])
            $(".div-character > .row").append(createCard(i, "selected"));
          else $(".div-character > .row").append(createCard(i));
        }
      }
    }

    // new legionSolver
    if (storageLegionSolver) legionSolver = storageLegionSolver;
  }

  $("#union-cnt").html(`<b>${union["cnt"]} / ${union["members"]}</b>`);
}

function ajaxChar(arr) {
  $.ajax({
    url: "https://meplication.koreacentral.cloudapp.azure.com/getUnion",
    data: JSON.stringify({ characters: arr }),
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    async: true,
    success: function (data) {
      try {
        let characterList = [],
          charactersLength,
          unionLevel = 0;

        if (isKeyExist(localStorageObj, "character"))
          characterList = _.cloneDeep(localStorageObj["character"]);
        for (let i of data["charInfo"]) {
          let characterObj = {};

          if (!isValueExist(characterList, i["name"], "name")) {
            $(".div-character > .row").append(createCard(i));

            characterObj = _.cloneDeep(i);
            characterObj["selected"] = 0;
            characterList.push(characterObj);
          }
        }
        charactersLength = characterList.length > 42 ? 42 : characterList.length;
        for (let i = 0; i < charactersLength; i++) {
          unionLevel += Number(characterList[i].level);
        }
        
        inputUnionRank(unionLevel);
        setUnionInfo();

        // localStorage
        localStorageObj["character"] = _.cloneDeep(characterList);
        localStorageObj["union"] = _.cloneDeep(union);
        localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));

        $("#union-cnt").html(`<b>${union["cnt"]} / ${union["members"]}</b>`);
      } catch (e) {
        console.log("success");
        console.log(data);
        console.log(e);
        $(".loading").fadeOut();
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);

      $("#step-1").show();
      $("#step-2").hide();
    },
    beforeSend: function () {
      $(".loading").fadeIn();
    },
    complete: function () {
      $(".loading").fadeOut();
    },
  });
}

function createCard(res, arg1, arg2) {
  switch (arg1) {
    case "mapleM":
      let content = "";

      if (arg2)
        content += `
          <div class="col-md-2">
            <div class="char-card mapleM selected-mapleM" data-class="${res["class"]}"" data-rank="${res["rank"]}" data-stat="ATT" data-value="${res["value"]}">`;
      else
        content += `
          <div class="col-md-2">
            <div class="char-card mapleM draw-border" data-class="${res["class"]}"" data-rank="${res["rank"]}" data-stat="ATT" data-value="${res["value"]}">`;
      return (
        content +
        `
                <div class="row justify-content-end g-0">
                    <button class="col-2 refresh"><i class="fa-solid fa-rotate"></i></button>
                    <button class="col-2 delete"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="card-title">
                    <img src="./img/mapleM.png">
                    <h5><b>메이플스토리M</b></h5>
                </div>
                <div class="card-content">
                    <ul>
                        <li>${res["rank"]} / Lv. ${res["level"]}</li>
                        <li>메이플스토리M</li>
                        <li>${res["effect"]}</li>
                    </ul>
                </div>
            </div>
        </div>`
      );
    case "selected":
      return `
        <div class="col-md-2">
            <div class="char-card selected" data-name="${res["name"]}" data-class="${res["class"]}" data-rank="${res["rank"]}" data-stat="${res["stat"]}" data-value="${res["value"]}">
                <div class="row justify-content-end g-0">
                    <button class="col-2 refresh"><i class="fa-solid fa-rotate"></i></button>
                    <button class="col-2 delete"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="card-title">
                    <img src="${res["avatarImg"]}">
                    <h5><b>${res["name"]}</b></h5>
                </div>
                <div class="card-content">
                    <ul>
                        <li>${res["rank"]} / Lv. ${res["level"]}</li>
                        <li>${res["job"]}</li>
                        <li>${res["effect"]}</li>
                    </ul>
                </div>
            </div>
        </div>`;
    default:
      return `
        <div class="col-md-2">
            <div class="char-card draw-border" data-name="${res["name"]}" data-class="${res["class"]}" data-rank="${res["rank"]}" data-stat="${res["stat"]}" data-value="${res["value"]}">
                <div class="row justify-content-end g-0">
                    <button class="col-2 refresh"><i class="fa-solid fa-rotate"></i></button>
                    <button class="col-2 delete"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="card-title">
                    <img src="${res["avatarImg"]}">
                    <h5><b>${res["name"]}</b></h5>
                </div>
                <div class="card-content">
                    <ul>
                        <li>${res["rank"]} / Lv. ${res["level"]}</li>
                        <li>${res["job"]}</li>
                        <li>${res["effect"]}</li>
                    </ul>
                </div>
            </div>
        </div>`;
  }
}

function isKeyExist(data, key) {
  return Object.prototype.hasOwnProperty.call(data, key);
}

function isValueExist(data, value, target) {
  if ($.isEmptyObject(data)) return false;
  for (let i of data) {
    if (i[target] == value) return true;
  }
  return false;
}

// 0:  B, 메이플M(B)

// 1:  A, 메이플M(A)

// 2:  S 전사, 해적
// 3:  S 마법사, 도적, 궁수, 메이플M(S)

// 4:  SS 전사
// 5:  SS 궁수, 메이플M(SS)
// 6:  SS 도적, 제논
// 7:  SS 마법사
// 8:  SS 해적

// 9:  SSS 전사
// 10: SSS 궁수
// 11: SSS 도적
// 12: SSS 마법사
// 13: SSS 해적
// 14: SSS 제논

function inputPiece(Class, rank, operator) {
  let idx = 0;

  if (rank == "B") {
    idx = 0;
  } else if (rank == "A") {
    idx = 1;
  } else if (rank == "S") {
    if (Class == "Warrior" || Class == "Pirate") idx = 2;
    else if (
      Class == "Magician" ||
      Class == "Thief" ||
      Class == "Bowman" ||
      Class == "mapleM" ||
      Class == "Xenon"
    )
      idx = 3;
  } else if (rank == "SS") {
    if (Class == "Warrior") idx = 4;
    else if (Class == "Bowman" || Class == "mapleM") idx = 5;
    else if (Class == "Thief" || Class == "Xenon") idx = 6;
    else if (Class == "Magician") idx = 7;
    else if (Class == "Pirate") idx = 8;
  } else {
    if (Class == "Warrior") idx = 9;
    else if (Class == "Bowman") idx = 10;
    else if (Class == "Thief") idx = 11;
    else if (Class == "Magician") idx = 12;
    else if (Class == "Pirate") idx = 13;
    else if (Class == "Xenon") idx = 14;
  }

  if (operator == "+") legionSolver["pieceAmounts"][idx] += 1;
  else legionSolver["pieceAmounts"][idx] -= 1;
}

// 유니온 이미지 및 타이틀
function setUnionInfo() {
  let dir = "./img/symbol/";

  if (union["rank"].indexOf("슈프림") == 0) {
    dir += "supreme/";
  } else if (union["rank"].indexOf("그랜드") == 0) {
    dir += "grandMaster/";
  } else if (union["rank"].indexOf("마스터") == 0) {
    dir += "master/";
  } else if (union["rank"].indexOf("베테랑") == 0) {
    dir += "veteran/";
  } else if (union["rank"].indexOf("노비스") == 0) {
    dir += "novice/";
  }

  if (union["rank"].indexOf("V") > 0) {
    dir += "5.png";
  } else if (union["rank"].indexOf("IV") > 0) {
    dir += "4.png";
  } else if (union["rank"].indexOf("III") > 0) {
    dir += "3.png";
  } else if (union["rank"].indexOf("II") > 0) {
    dir += "2.png";
  } else if (union["rank"].indexOf("I") > 0) {
    dir += "1.png";
  } else {
    dir = "./img/symbol/no_img.png";
  }

  $("#union-symbol").attr("src", dir);
  $("#union-level").html("<b>" + union["level"] + "</b>");
  $("#union-rank").html("<b>" + union["rank"] + "</b>");
}

// 프리셋설정
function setPreset(data) {
  let preset = _.cloneDeep(localStorageObj["preset"]);

  unionEffect = _.cloneDeep(preset[data]["stats"]);
  legionSolver = _.cloneDeep(preset[data]["legionSolver"]);
  $($("#div-union-stats").children().children()).each(function () {
    let $stat = $(this).children().eq(1);
    $stat.text(unionEffect[$stat.attr("id")]);
  });

  // union
  union = preset[data]["union"];

  // character
  localStorageObj["character"] = _.cloneDeep(preset[data]["character"]);
  for (let i of preset[data]["character"]) {
    if (i["stat"] == "ATT") {
      if (i["selected"])
        $(".div-character > .row").append(createCard(i, "mapleM", 1));
      else $(".div-character > .row").append(createCard(i, "mapleM"));
    } else {
      if (i["selected"])
        $(".div-character > .row").append(createCard(i, "selected"));
      else $(".div-character > .row").append(createCard(i));
    }
  }

  $("#union-cnt").html(`<b>${union["cnt"]} / ${union["members"]}</b>`);
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
}

function setSync(nameList, $elements) {
  $elements.each(function () {
    $(this).children().first().addClass("fa-spin");
  });
  new Promise((succ, fail)=>{
    $.ajax({
      url: "https://meplication.koreacentral.cloudapp.azure.com/getCharacterSync",
      data: JSON.stringify({ name: nameList }),
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      success: function(result) {
        succ(result);
      },
      fail: function(result) {
          console.log(result.responseText);
          fail(error); 
      }
    });
  }).then((arg) =>{
    $.ajax({
      url: "https://meplication.koreacentral.cloudapp.azure.com/getUnion",
      data: JSON.stringify({ characters: arg["success"] }),
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      success: function(result2) {
        inputUpdateCharacter(arg["success"], result2);
        setSort();
        syncCharacters = syncCharacters.concat(arg["success"]);
        syncCharacters = Array.from(new Set(syncCharacters));
        $elements.each(function () {
          let $card = $(this).parent();
          let name = $card.data("name");

          $(this).children().first().removeClass("fa-spin");
          if (arg["success"].find((x) => x === name)) {
            let charInfo = _.cloneDeep(result2["charInfo"].find((x) => x.name === name));

            $card.data("class", charInfo.class); $card.data("rank", charInfo.rank); $card.data("stat", charInfo.stat); $card.data("value", charInfo.value);
            $card.find(".card-title > img").attr("src", charInfo.avatarImg);
            $card.find(".card-content > ul").children().eq(0).html(`${charInfo.rank} / Lv. ${charInfo.level}`);
            $card.find(".card-content > ul").children().eq(1).html(charInfo.job);
            $card.find(".card-content > ul").children().eq(2).html(charInfo.effect);

            $(this).children().first().css("color", "green");
          } else if (arg["fail"].find((x) => x === name)) $(this).children().first().css("color", "red");
        });
        localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
      }                                               
    });
  });
}

function createCardN() {
  if (localStorageObj.currentPreset === -1) {
    for (let i of localStorageObj["character"]) {
      if (i["stat"] == "ATT") {
        if (i["selected"])
          $(".div-character > .row").append(createCard(i, "mapleM", 1));
        else $(".div-character > .row").append(createCard(i, "mapleM"));
      } else {
        if (i["selected"])
          $(".div-character > .row").append(createCard(i, "selected"));
        else $(".div-character > .row").append(createCard(i));
      }
    }
  } else if (localStorageObj.currentPreset !== -1) {
    for (let i of localStorageObj["preset"][localStorageObj.currentPreset]["character"]) {
      if (i["stat"] == "ATT") {
        if (i["selected"])
          $(".div-character > .row").append(createCard(i, "mapleM", 1));
        else $(".div-character > .row").append(createCard(i, "mapleM"));
      } else {
        if (i["selected"])
          $(".div-character > .row").append(createCard(i, "selected"));
        else $(".div-character > .row").append(createCard(i));
      }
    }
  }
}

function inputUpdateCharacter (successList, data) {
  for (let i in successList) {
    let idx = localStorageObj["character"].findIndex((x) => x.name === successList[i]);
    let selected = localStorageObj["character"][idx]["selected"];

    localStorageObj["character"][idx] = _.cloneDeep(data["charInfo"][i]);
    localStorageObj["character"][idx]["selected"] = selected;
  }
  if (isKeyExist(localStorageObj, "preset")) {
    for (let i of localStorageObj["preset"]) {
      if(!i) continue;
      for (let j in successList) {
        let idx = i["character"].findIndex((x) => x.name === successList[j]);

        if (idx > 0 ? true : false) {
          let selected = i["character"][idx]["selected"];
          i["character"][idx] = _.cloneDeep(data["charInfo"][j]);
          i["character"][idx]["selected"] = selected;
        }
      }
    }
  }
}

function setSort(){
  let characters = _.cloneDeep(localStorageObj["character"]),
    sortedCharacters;

  sortedCharacters = characters.sort(function (a, b) {
    return b.level - a.level;
  })

  localStorageObj["character"] = _.cloneDeep(sortedCharacters);
}

function removeCard(target, name){
  let characters = _.cloneDeep(localStorageObj["character"]);
  let idx = characters.findIndex((x) => x.name === name);
  
  characters.splice(idx, 1);
  localStorageObj["character"] = _.cloneDeep(characters);
  console.log(characters); 
  localStorage.setItem("legionAssist", JSON.stringify(localStorageObj));
  target.remove();
}

function syncDisableFunc() {
  let $element = $("#btn-sync");

  if (syncInterval === 0) {
    $element.removeAttr("disabled");
    $element.html("갱신");
    syncInterval = 20;
    clearInterval(testInterval);
  } else {
    syncInterval -= 1;
    $element.html(`갱신..(${syncInterval})`);
  }
}

function setSyncDisable() {
  let $element = $("#btn-sync");

  $element.attr("disabled", true);
  $element.html(`갱신..(${syncInterval})`);
  testInterval = setInterval(syncDisableFunc, 1000);
}

function setRefreshDisalbe(target) {
  target.attr("disabled", true);

  setTimeout((target) => {
    target.removeAttr("disabled");
  }, 20000 ,target);
}

function getIndex(arr, data) {
  return arr.findIndex((x) => x[data] === data);
}

function inputUnionRank(unionLevel) {
  let unionRank = ['노비스', '베테랑', '마스터', '그랜드 마스터', '슈프림'],
    rankMembers = [9, 18, 27, 36, 41],
    unionTier = ['I', 'II', 'III', 'IV', 'V'],
    tierMembers = [0, 1, 2, 3, 4];

  if (unionLevel < 3000) {
      if (unionLevel <= 500) {
          union['rank'] = unionRank[0] + ' ' + unionTier[0];
          union['members'] = rankMembers[0] + tierMembers[0];
      } else {
          union['rank'] = unionRank[0] + ' ' + unionTier[parseInt(unionLevel / 500) - 1];
          union['members'] = rankMembers[0] + tierMembers[parseInt(unionLevel / 500) - 1];
      }
  } else if (unionLevel < 5500) {
      union['rank'] = unionRank[1] + ' ' + unionTier[parseInt((unionLevel - 3000) / 500)];
      union['members'] = rankMembers[1] + tierMembers[parseInt((unionLevel - 3000) / 500)];
  } else if (unionLevel < 8000) {
      union['rank'] = unionRank[2] + ' ' + unionTier[parseInt((unionLevel - 5500) / 500)];
      union['members'] = rankMembers[2] + tierMembers[parseInt((unionLevel - 5500) / 500)];
  } else if (unionLevel < 10500) {
      union['rank'] = unionRank[3] + ' ' + unionTier[parseInt((unionLevel - 8000) / 500)];
      union['members'] = rankMembers[3] + tierMembers[parseInt((unionLevel - 8000) / 500)];
  } else if (unionLevel >= 10500) {
      union['rank'] = unionRank[4] + ' ' + unionTier[parseInt((unionLevel - 10500) / 500)];
      union['members'] = rankMembers[4] + tierMembers[inparseIntt((unionLevel - 10500) / 500)];
  }
  
  union['level'] = unionLevel
}
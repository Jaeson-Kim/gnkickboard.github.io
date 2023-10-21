var posx = "${minwonVO.minwon_applied_pos_x}";
var posy = "${minwonVO.minwon_applied_pos_y}";

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  $("#minwon_applied_addr").val("위치정보를 확인 중입니다.");
  var crd = pos.coords;
  $("#minwon_applied_pos_x").val(crd.longitude);
  $("#minwon_applied_pos_y").val(crd.latitude);

  fetch("http://218.235.237.30/api/v1/getGeocoder/reverse.do", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://218.235.237.30",
    },
    body: JSON.stringify({
      "minwon_applied_pos_x": crd.longitude,
      "minwon_applied_pos_y": crd.latitude,
    }),
    mode: "cors",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    })
    .then((data) => {
      let jsondata = JSON.parse(data);
      $("#minwon_applied_addr").val(jsondata[0].text);
      posx = crd.longitude;
      posy = crd.latitude;
    })
    .catch((error) => {
      alert("위치정보 인식이 불가능합니다. 주소를 입력하시기 바랍니다");
    });
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

/**************************
 * 위반유형 생성
 *************************/
function makeAjaxRequest(url_param, method_param, callback) {
  $.ajax({
    url: url_param,
    method: method_param,
    dataType: "json",
  })
    .done(function (data) {
      callback(data); // 성공 시 콜백 함수 호출
    })
    .fail(function (xhr, status, error) {
      console.error(error);
      // 에러 처리 로직
    });
}

function fetchData(url, method, callback) {
  makeAjaxRequest(url, method, callback);
}

$(document).ready(function () {
  var step01Data = localStorage.getItem("step1");
  step01Data = JSON.parse(step01Data);

  $('#minwon_cmpy_id').val(step01Data.comCd);
  $('#minwon_kick_id').val(step01Data.kickboardId);
  $('#cmpyNm').text(step01Data.comNm);
  $('#kickId').text(step01Data.kickboardId);
  $('#uuid').val(step01Data.uuid);

  try {
    fetchData(
      "http://218.235.237.30/api/v1/getViolateCategory/violate.do",
      "GET",
      updateViewViolate
    );
  } catch (e) {
    alert(e.toString());
  }
  navigator.geolocation.getCurrentPosition(success, error, options);
});

function updateViewViolate(data) {
  if (data && Array.isArray(data)) {
    var $ul = $("#viol");
    $ul.empty(); // <ul> 내의 모든 자식 요소 제거

    // 데이터 배열을 반복하면서 <li> 요소를 동적으로 생성합니다.
    let isCheckedRadio = true;
    data.forEach(function (item, index) {
      var $li = $("<li>");
      var $input = $("<input>")
        .attr({
          type: "radio",
          name: "minwon_violate_tp",
          id: "viol-" + item.ctgry_ID, // item의 id 또는 고유한 값으로 설정
          value: item.ctgry_ID,
          checked: isCheckedRadio,
        })
        .addClass("form-check-input");
      isCheckedRadio = false;
      
      // <span> 요소 생성
      var $span = $("<span>").attr({
        class: "form-check-label",
        for: "viol-" + item.ctgry_ID,
      });
      $span.append("  " + item.ctgry_NM);
      $li.append($input, $span);
      $ul.append($li); // <ul>에 <li> 요소 추가
    });
  }
}

var sendFileList = [];  // 전송할 첨부파일 리스트
var fileList = document.querySelector('.up_list');  // 전송할 첨부파일 목록 시각화 위치

// // 촬영 클릭 시 함수
function takePhoto() {
  var camera = document.querySelector('#camera');
  camera.click();

  camera.onchange = function(data) {
    var files = data.target.files;
    makeSendFileList(files);
  }
}

// // 갤러리 클릭 시 함수
function intoGallery() {
  var gallery = document.querySelector('#gallery');
  gallery.click();

  gallery.onchange = function(data) {
    var files = data.target.files;
    makeSendFileList(files);
  }
}

// // 첨부파일 보여주는 리스트 만들기
function makeSendFileList(files) {
  if(files.length + sendFileList.length > 3) {
    alert('파일은 최대 3개까지만 등록가능합니다.');
  } else {
    $(fileList).empty();
    // 처음 첨부파일 업로드할 경우
    if(sendFileList.length == 0) {
      for(var i=0; i<3; i++) {
        var li = document.createElement('li');
        li.id = "data"+i;
        if(files.length > i) {
          li.innerText = files[i].name;
          sendFileList.push(files[i]);
          var a = document.createElement('a');
          a.innerHTML = '삭제';
          a.classList.add('del_btn');
          a.href="javascript:deleteSendFileList('"+i+"')";
          li.appendChild(a);
        }
        fileList.appendChild(li);
      }
    } else {  // 이미 들어가있는 첨부파일이 있을경우
      for(var i=0; i<sendFileList.length; i++) {
        var li = document.createElement('li');
        li.innerText = sendFileList[i].name;
        li.id = "data"+i;
        var a = document.createElement('a');
        a.innerHTML = '삭제';
        a.classList.add('del_btn');
        a.href="javascript:deleteSendFileList('"+i+"')";
        li.appendChild(a);
        fileList.appendChild(li);
      }
      var newFileCount = 0;
      for(var i=sendFileList.length; i<3; i++) {
        var li = document.createElement('li');
        li.id = "data"+i;
        // 새로 들어온 첨부파일 내용을 넣는 코드
        if(files.length > newFileCount) {
          li.innerText = files[newFileCount].name;
          sendFileList.push(files[newFileCount]);
          var a = document.createElement('a');
          a.innerHTML = '삭제';
          a.classList.add('del_btn');
          a.href="javascript:deleteSendFileList('"+i+"')";
          li.appendChild(a);
          newFileCount++;
        }
        fileList.appendChild(li);
      }
    }
  }
}

// // 삭제 버튼 구현
function deleteSendFileList(deleteCode) {
  // 삭제 버튼을 누른 위치의 파일을 제거
  sendFileList.splice(deleteCode, 1);

  $(fileList).empty();
  for(var i=0; i<3; i++) {
    var li = document.createElement('li');
    if(sendFileList.length > i) {
      li.innerText = sendFileList[i].name;
      li.id = "data"+i;
      var a = document.createElement('a');
      a.innerHTML = '삭제';
      a.classList.add('del_btn');
      a.href="javascript:deleteSendFileList('"+i+"')";
      li.appendChild(a);
    }
    fileList.appendChild(li);
  }
}

// function openMap() {
//   var map = document.querySelector('#openlayerPopup');
//   map.style.display = 'block';

//   $('#openlayerPopup').load('/map/index.html');
// }

// function closePopup() {
//   var map = document.querySelector('#openlayerPopup');
//   $(map).empty();
//   map.style.display = 'none';
// }

function onSubmitForm() {
  var formData = new FormData();

  // 모든 input, textarea 및 select 엘리먼트를 선택
  var inputElements = document.querySelectorAll('input, textarea, select');

  var radioButtons = document.getElementsByName('minwon_violate_tp');
  var selectedValue = "";

  for (var i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
          selectedValue = radioButtons[i].value;
          formData.append('minwon_violate_tp', selectedValue);
          alert("selectedValue:"+selectedValue);
          break;
      }
  }

  // 각 입력 엘리먼트의 값을 FormData에 추가
  for (var i = 0; i < inputElements.length; i++) {
      var element = inputElements[i];
      var name = element.name; // 입력 필드의 이름
      var value = element.value; // 입력 필드의 값

      // 파일 입력 필드 처리 (type="file")
      if (element.type === 'file') { 
      } else if (element.type !== 'radio') {
          formData.append(name, value);
      }
  }
  
  selectedFiles = [];
// // 여러 파일 입력 필드 선택
  var fileInputs = document.querySelectorAll('input[type="file"][multiple]');
  fileInputs.forEach(function (input) {
      var files = input.files;
      for (var i = 0; i < files.length; i++) {
          selectedFiles.push(files[i]);
      }
  }); 

  sendFileList.forEach(function(e) {
    formData.append('files', e);
  });
  
  $.ajax({
      url: "http://218.235.237.30/minwon/minwon_upload.do",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        window.location.href = "step03.html";
      },
      error: function (e) {
          alert("오류가 발생하였습니다. 문제가 지속될 경우 관리자에게 문의바랍니다");
      }
  });
}

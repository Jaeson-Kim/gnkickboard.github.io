function makeAjaxRequest(url_param, method_param , callback) {
  $.ajax({
      url: url_param,
      method: method_param,
      dataType: 'json'
  })
  .done(function (data) {
      callback(data); // 성공 시 콜백 함수 호출
  })
  .fail(function (xhr, status, error) {
      console.error(error);
      // 에러 처리 로직
  });
}

function updateViewCompany(data){  
  console.log(data)
  var $companyList = $("#companyList");
  $companyList.empty();
  $companyList.append($("<option></option>")
  .attr("value", "")
      .text("업체를 선택하세요."));
   
  if(data && data.length > 0){
    // JSON 데이터를 기반으로 새로운 옵션을 추가
    $.each(data, function (index, item) { 
      $companyList.append($("<option></option>")
            .attr("value", item.ctgry_ID)
            .attr("data-value", item.ctgry_URL)
            .text(item.ctgry_NM));
    });
  } else {
    // JSON 데이터가 없거나 빈 배열인 경우 "자료가 없습니다" 옵션을 추가
    $companyList.append($("<option></option>")
        .attr("value", "")
        .text("등록된 업체가 없습니다."));
  }
}

function fetchData(url, method, callback) {
  makeAjaxRequest(url, method, callback);
}

$( document ).ready(function() {
  try{
    fetchData("http://218.235.237.30/api/v1/getCompanyCategory/company.json", 
          "GET" , 
          updateViewCompany
         ); 
  }catch(e){
    alert(e.toString());
  }

  // UUID 생성
  let uuid = self.crypto.randomUUID();
  console.log(uuid);
  document.getElementById('uuid').value = uuid;

  // 현재 위치 좌표
  navigator.geolocation.getCurrentPosition(function (data) {
    var latitude = data.coords.latitude;
    var longitude = data.coords.longitude;
    console.log(latitude, longitude);
    document.getElementById('lon').value = longitude;
    document.getElementById('lat').value = latitude;
  });
  
	// QR코드 스캐너 활성화
	qrScannerOn();
	
});

function qrScannerOn() {
  var video = document.createElement("video");
  var canvasElement = document.getElementById("scanbox");
  var canvas = canvasElement.getContext("2d");
  var canBox = document.getElementById("can_box");

  function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }

  // Use facingMode: environment to attemt to get the front camera on phones
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });

  function tick() {
    // scanwrap.style.background = 'none';
    canBox.hidden = true;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canBox.hidden = true;
      canvasElement.hidden = false;

      canvasElement.height = video.videoHeight * 0.9;
      canvasElement.width = video.videoWidth * 0.9;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

        readQrCodeData(code.data);
      // 읽으면 종료
        return;
      } else {
      }
    }
    requestAnimationFrame(tick);
  }
}

// QR코드를 읽어 해당하는 회사 선택 및 ID입력
function readQrCodeData(data) {
  var kickboardCom = data.split('?')[0];
  var kickId = data.split('?')[1].split('name=')[1];
  
  var $companyList = $("#companyList");
  $companyList.find('option').each(function() {
    var option = $(this);
    if(option.attr('data-value') === kickboardCom) {
      option.prop('selected', true);
    }
  });
  $('#kickboardId').val(kickId);
}


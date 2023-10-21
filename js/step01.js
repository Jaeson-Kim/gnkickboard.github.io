$( document ).ready(function() {
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
  getCategoryInfo();
  
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

function getCategoryInfo() {
  $.ajax({
    type: 'get',
    url: '/company/list',
    dataType: 'json',
    async: false,
    success: function(result) {
      console.log(result);
      document.getElementById('kickboardCom').innerHTML = '<option>업체를 선택해주세요</option>';
      result.forEach(e => {
        console.log(e);
        var option = document.createElement('option');
        option.value = e.cateCd;
        option.innerText = e.cateNm;
        document.getElementById('kickboardCom').appendChild(option);
      });
    }, 
    error: function(req, status, err) {
      console.log(req, status, err);
    }
  })
}

function readQrCodeData(data) {
  var kickboardCom = data.split('?')[0];
  var kickId = data.split('?')[1].split('name=')[1];

  $.ajax({
    url: '/company/info?domain='+kickboardCom,
    type: 'get',
    dataType: 'json',
    async: false,
    success: function(data) {
      var select = document.querySelector('#kickboardCom');
      for(var i=0; i<select.options.length; i++) {
        if(select.options[i].value == data.cateCd) {
          select.options[i].selected = true;
        }
      }
    },
    error: function(req, status, err) {
      console.log(req, status, err);
    }
  });

  $('#kickboardId').val(kickId);
}


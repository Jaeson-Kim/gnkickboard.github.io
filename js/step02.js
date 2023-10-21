var sendFileList = [];
var fileList = document.querySelector('.up_list');

$(document).ready(function() {
  
  $.ajax('/violation/list')
  .then(function(data) {
    console.log(data);
    var ul = document.querySelector('#viol');
    Array.from(data).forEach(function(e) {
      var li = document.createElement('li');
      var input = document.createElement('input');
      var label = document.createElement('label');

      input.classList.add('form-check-input');
      input.type = 'radio';
      input.name = '001';
      input.value = e.cateCd;
      input.id = e.cateCd;
      label.className = 'form-check-label';
      label.innerHTML = e.cateNm;
      label.htmlFor = e.cateCd;

      li.appendChild(input);
      li.appendChild(label);
      ul.appendChild(li);
    });
  })
})

function takePhoto() {
  var camera = document.querySelector('#camera');
  camera.click();
  
  camera.onchange = function(data) {
    console.log(data.target.files);
    var files = data.target.files;
    if(files.length + fileList.childNodes.length > 4) {
      alert('파일은 최대 3개까지만 등록가능합니다.');
    } else {
      Array.from(files).forEach(function (e) {
        sendFileList.push(e);
        var li = document.createElement('li');
        li.innerText = e.name;
        var a = document.createElement('a');
        a.innerHTML = '삭제';
        a.classList.add('del_btn');
        a.href='#';
        li.appendChild(a);
        fileList.appendChild(li);
      });
      
    }
  }
}

function intoGallery() {
  var gallery = document.querySelector('#gallery');
  gallery.click();

  gallery.onchange = function(data) {
    console.log(data.target.files);
    var files = data.target.files;
    if(files.length + fileList.childNodes.length > 4) {
      alert('파일은 최대 3개까지만 등록가능합니다.');
    } else {
      Array.from(files).forEach(function (e) {
        sendFileList.push(e);
        var li = document.createElement('li');
        li.innerText = e.name;
        var a = document.createElement('a');
        a.innerHTML = '삭제';
        a.classList.add('del_btn');
        a.href='#';
        li.appendChild(a);
        fileList.appendChild(li);
      });
      
    }
  }
}

function submit() {
  var dataForm = $('#kickboardInfo');
  var formData = new FormData(dataForm[0]);
  sendFileList.forEach(function(e) {
    formData.append('files', e);
  })

  $.ajax({
    type: 'post',
    url: '/step03',
    data: formData,
    contentType: false,
    cache: false,
    processData: false,
    success: function(data) {
      console.log(data);
    }, 
    error: function(req, status, err) {
      console.log(req, status, err);
    }
  });
}
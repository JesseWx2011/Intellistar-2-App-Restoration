let savedTimeout;
let musicPlayer = new Audio();
let elMusic = document.getElementById('music');
let elBackground = document.getElementById('background');
let elBlur = document.getElementById("background_blur");
let elCustomBackground = document.getElementById("custom_background");
let elCustomBgContainer = document.querySelector(".setting-custom-background");

blurChange();
backgroundChange();

function previewMusic(event) {
  let el = event.target;

  if (musicPlayer.paused) {
    musicPlayer.src = "audio/Background/" + elMusic.value;
    musicPlayer.volume = 0.4;
    musicPlayer.play();
    el.innerHTML = "&#9724;";
  } else {
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    el.innerHTML = "&#9658;";
  }

}

function musicChange() {
  if (!musicPlayer.paused) {
    musicPlayer.pause();
    musicPlayer.src = "audio/Background/" + elMusic.value;
    musicPlayer.volume = 0.4;
    musicPlayer.currentTime = 0;
    musicPlayer.play();
  }
}

function blurChange() {
  setBackgroundBlur(elBlur.value === "1");
}

function backgroundChange(event) {
  if (elBackground.value === "0") {
    // Custom background
    elCustomBgContainer.style.display = "flex";

    let matches = /^https:\/\/imgur\.com\/?(.+)$/.exec(elCustomBackground.value);
    if (matches && matches[1]) {
      elCustomBackground.value = "https://i.imgur.com/" + matches[1] + ".png";
    }

    if (/^https:\/\/(?:.+)\.(?:png|jpg|gif|webp|jpeg)$/i.test(elCustomBackground.value)) {
      setBackgroundImage(elCustomBackground.value);
      elCustomBgContainer.classList.remove('input-error');
    } else {
      setBackgroundImage('');
      elCustomBgContainer.classList.add('input-error');
    }

    return;
  } else {
    elCustomBgContainer.style.display = "none";
  }
  setBackgroundImage('/images/backgrounds/' + elBackground.value);
}

function setBackgroundBlur(enabled) {
  let el = document.querySelector(".box-background .background-image");
  if (enabled) {
    el.classList.add("blur");
  } else {
    el.classList.remove("blur");
  }
}

function setBackgroundImage(image) {
  document.querySelectorAll(".background-image").forEach(el => {
    el.style.backgroundImage = `url('${image}')`;
  });
}

function save(event, run) {
  let request = new XMLHttpRequest();
  request.open('POST', '/settings/save', true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.onload = function () {
    document.getElementById('saved').innerText = 'Saved!';
    clearTimeout(savedTimeout);
    savedTimeout = setTimeout(() => {
      document.getElementById('saved').innerText = '';
    }, 1000);
  };
  request.send(JSON.stringify({
    location: document.getElementById('location').value,
    crawl: document.getElementById('crawl').value,
    music: document.getElementById('music').value,
    logo: document.getElementById('logo').value,
    narrator: document.getElementById('narrator').value,
    background: document.getElementById('background').value,
    background_blur: document.getElementById('background_blur').value,
    custom_background: document.getElementById('custom_background').value
  }));
  if (run)
    window.location = '/';
}

let currentResponse;
new autoComplete({
  selector: '#location',
  minChars: 2,
  source: function (term, response) {
    let request = new XMLHttpRequest();
    request.open('GET', 'https://api.weather.com/v3/location/search?apiKey=e1f10a1e78da46f5b10a1e78da96f525&language=en-US&query=' + term.toLowerCase() + '&locationType=city,airport,postCode,pws&format=json', true);
    request.onload = function () {
      let data = JSON.parse(this.response);
      console.log(data);
      currentResponse = data;
      let out = [];
      for (let i = 0; i < data.location.address.length; i++) {
        out.push(data.location.address[i]);
      }
      response(out);
    };
    request.send();
  },
  onSelect: function (e, term, item) {
    for (let i = 0; i < currentResponse.location.address.length; i++) {
      if (currentResponse.location.address[i] === term) {
        document.getElementById('location').value = currentResponse.location.latitude[i] + ',' + currentResponse.location.longitude[i];
        return;
      }
    }
    document.getElementById('location').value = '!!ERROR';
  }
});

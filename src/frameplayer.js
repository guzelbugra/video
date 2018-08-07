/*

    TODO:Ustune basınca pause yap
    TODO:Çubuk EKLE
    TODO:Cubuktan sonra go to framei kaldır
*/

var FramePlayer = function (el) {
    this.divCont = document.getElementById(el);
    this.elem = el;
    this.frameSource = 'http://storage.googleapis.com/alyo/assignments/images/0.jpg';
    this.rate = 10,
        this.paused = true,
        this.width = '700px',
        this.height = '500px';
    this.currentFrame = -1;
    this.startFrame = 1;


    this.divCont.style.width = this.width;
    this.divCont.style.height = this.height;

    this.createControlBar();

    this.initializeRequestAnimationFrame();

    this.img = document.createElement('img');
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.divCont.appendChild(this.canvas);
};



FramePlayer.prototype.render = function (player) {

    var now,
        then = Date.now(),
        interval = 2000 / player.rate,
        delta,
        videoFramesNum = player.videoSource.frames.length;

    var processFrame = function () {

        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);

            if (!player.paused) {

                player.currentFrame = player.currentFrame += 1;

                //video hic bitmez basa doner
                if (player.currentFrame >= videoFramesNum) player.currentFrame = 0;
                //videonun ilk başlangıcı için
                else if (player.currentFrame < 0) player.currentFrame = videoFramesNum - 1;

                player.drawFrame(player);
            }
        }

        window.requestAnimationFrame(processFrame);
    };


    window.requestAnimationFrame(processFrame);
};

FramePlayer.prototype.drawFrame = function (player) {
    if (player.currentFrame !== undefined ) {

        player.img.src = player.videoSource.frames[player.currentFrame];


        player.context.drawImage(player.img, 0, 0, player.canvas.width, player.canvas.height);
    }

};

FramePlayer.prototype.createControlBar = function () {
    var _self = this,
        controlBar = document.createElement('div');
    controlBar.setAttribute('class', 'fp-ctrl');
    controlBar.style.width = this.width;

    // Pause Button
    var btnPause = document.createElement('button');
    btnPause.setAttribute('id', 'pause-' + _self.elem);
    btnPause.setAttribute('class', 'fp-btn');
    btnPause.innerHTML = 'Pause';
    btnPause.addEventListener('click', function () {
            _self.pause();
            console.log("pause Basıldı")
        }, false
    );
    controlBar.appendChild(btnPause);

    // Play Button
    var btnPlay = document.createElement('button');
    btnPlay.setAttribute('id', 'play-' + _self.elem);
    btnPlay.setAttribute('class', 'fp-btn');
    btnPlay.innerHTML = 'Play';
    btnPlay.addEventListener('click', function () {
            _self.resume();
            console.log("Devam ediliyor Play basıldı")
        }, false
    );
    controlBar.appendChild(btnPlay);

    // play mi pause mi onun ayarı
    _self.paused ? btnPause.style.display = 'none' : btnPlay.style.display = 'none';


    var toFrameLabel = document.createElement('label'),
        toFrameInput = document.createElement('input'),
        toFrameSubmit = document.createElement('input');

    toFrameLabel.className = "to-frame";

    toFrameInput.type = 'text';
    toFrameInput.name = 'frame';
    toFrameInput.value = _self.startFrame;
    toFrameInput.className = "to-frame";
    _self.toFrameInput = toFrameInput;

    toFrameSubmit.type = 'submit';
    toFrameSubmit.value = 'go to';

    toFrameSubmit.onclick = function () {
        value = parseInt(toFrameInput.value, 10);
        _self.gotoFrame(value);

    };

    toFrameLabel.appendChild(toFrameInput);
    toFrameLabel.appendChild(toFrameSubmit);
    controlBar.appendChild(toFrameLabel);

    // Add control bar
    this.divCont.appendChild(controlBar);
};

FramePlayer.prototype.play = function () {

    this.getFile(this.frameSource, function (player) {
        if (player.paused) {
            player.render(player);
            player.drawFrame(player);
        } else {
            player.render(player);
            player.drawFrame(player);
        }
    });
};

FramePlayer.prototype.resume = function () {
    var btnPlay = document.getElementById('play-' + this.elem),
        btnPause = document.getElementById('pause-' + this.elem);

    btnPlay.style.display = 'none';
    btnPause.style.display = 'block';
    this.paused = false;
};

FramePlayer.prototype.pause = function () {
    var btnPlay = document.getElementById('play-' + this.elem),
        btnPause = document.getElementById('pause-' + this.elem);

    btnPlay.style.display = 'block';
    btnPause.style.display = 'none';
    this.paused = true;
};

FramePlayer.prototype.gotoFrame = function (value) {

    if (value !== parseInt(value, 10)) return;

    this.currentFrame = this.startFrame = this.toFrameInput.value = value;

    if (this.videoSource === undefined) {
        this.play();
    } else {
        this.drawFrame(this);
    }
};

FramePlayer.prototype.getFile = function (src, callback) {
    var _HTTP = new XMLHttpRequest(),
        _self = this,
        p = document.createElement('p'),
        images = [],
        allFrame = [];

    if (_HTTP) {
        _HTTP.open('GET', src, true);
        _HTTP.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        _HTTP.send(null);

        _HTTP.onprogress = function () {
            p.innerHTML = 'Loading...';
            p.setAttribute('class', 'fp-loading');
            _self.divCont.appendChild(p);
        };

        if (typeof(_HTTP.onload) !== undefined) {
            _HTTP.onload = function () {
                _self.divCont.removeChild(p);
                //buraya
                for (var i = 0; i < 7; i += 1) {
                    var image = new Image();
                    image.src = 'http://storage.googleapis.com/alyo/assignments/images/' + i + '.jpg';
                    image.setAttribute('crossOrigin', 'anonymous');
                    images.push(image);

                }
                setTimeout(function () {
                    for (var i = 0; i < 7; i += 1) {
                        split_25(allFrame, images[i])
                    }
                    var response = JSON.stringify({"frames": allFrame});
                   // console.log(allFrame);
                    //console.log("-----------");
                    _self.videoSource = JSON.parse(response);
                   // console.log(_self.videoSource);

                    //console.log(_self.videoSource.frames);

                    callback(_self);
                    _HTTP = null;
                }, 1000)

            };
        } else {
            _HTTP.onreadystatechange = function () {
                if (_HTTP.readyState === 4) {
                    _self.divCont.removeChild(p);
                    _self.videoSource = JSON.parse(this.responseText);

                    callback(_self);
                    _HTTP = null;
                }
            };
        }
    } else {
        throw('Error loading file.');
    }
};

function split_25(frames, image) {
    var w2 = image.width / 5;
    var h2 = image.height / 5;
    for (var i = 0; i < 5; ++i) {
        for (var j = 0; j < 5; ++j) {
            const canvas = document.createElement('canvas');
            canvas.width = w2;
            canvas.height = h2;
            const context = canvas.getContext('2d');
            context.drawImage(image, i * w2, j * h2, w2, h2, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL());
        }
    }

}

FramePlayer.prototype.initializeRequestAnimationFrame = function () {


    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
};

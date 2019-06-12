let state = {
    currentTool: 'none',
    currentColor: 'green',
    previousColor: 'grey',
    canvasRect: [],
    canvasArc: [],
  };
  
const mouse = {
    x: 0,
    y: 0,
};

const framesState = [];
  
let selected = false;
let selectedFrame = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const frames = document.getElementById('frames');
const prew = document.getElementById('prewimg');

// Fit canvas to parent container
canvas.style.width = '98%';
canvas.style.height = '98%';
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

ctx.strokeStyle = 'black';
ctx.lineWidth = 3;

// array images for preview
let img = [];

img.push(canvas.toDataURL("image/png"));
prew.src = img[0];

const addFrame = document.createElement('div');
addFrame.id = 'newFrame';
addFrame.classList.add('new-frame');
addFrame.innerHTML = `<div class="add-frame-icon">
</div><div class="add-frame-label">Add new frame</div>`;
frames.appendChild(addFrame);

let activeFrame = document.querySelectorAll('.frame')[selectedFrame];
activeFrame.classList.add('sel-frame');

let frms = document.querySelectorAll('.frame');

let fpsInput = document.getElementById('fps').value;
let fps = 1;
let fpslabel = document.getElementById("fps-label");
fpslabel.innerHTML = fpsInput+" FPS";

let stop = false;
let frameCount = img.length;
let fpsInterval, startTime, now, then, elapsed, i = 0;

function getFPS(value){
    fps = value;
    fpslabel.innerHTML = value+" FPS";

    startAnimating(fps);
}

startAnimating(fps);

function startAnimating(fp) {
    fpsInterval = 1000 / fp;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    // stop
    if (stop) {
        return;
    }

    // request another frame
    requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but...
        // Also, adjust for fpsInterval not being multiple of 16.67
        then = now - (elapsed % fpsInterval);
       
        // draw image from img array
        prew.src = img[i];
        i++;

        // if i = img.length - reset i to 0
        if (i == img.length) {
            i = 0;
        }
    }
}

let clickY = new Array();
let clickX = new Array();
let clickDrag = new Array();
let paint;

function addClick(x, y, dragging) {
  if (framesState[selectedFrame]){
    clickX = framesState[selectedFrame].clickX;
    clickY = framesState[selectedFrame].clickY;
    clickDrag = framesState[selectedFrame].clickDrag;
  }

  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);

  framesState[selectedFrame] = {clickX: clickX, clickY: clickY, clickDrag: clickDrag};
}

function redraw(){

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas

    ctx.strokeStyle = "black";
    ctx.lineJoin = "round";
    ctx.lineWidth = 15;
              
    for(var i=0; i < clickX.length; i++) {		
        ctx.beginPath();
        if(clickDrag[i] && i){
            ctx.moveTo(clickX[i-1], clickY[i-1]);
        }else{
            ctx.moveTo(clickX[i]-1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

function addNewFrame() {
    let zeroFrames = document.querySelectorAll('.frame');
    let newFrame = document.createElement('div');
    let newCan = document.createElement('canvas');
    newFrame.id = "frame-"+img.length;
    newFrame.classList.add('frame');

    // Fit canvas to parent container
    newCan.style.width = '98%';
    newCan.style.height = '98%';
    newCan.width = canvas.offsetWidth;
    newCan.height = canvas.offsetHeight;

    img.push(newCan.toDataURL("image/png"));

    let mov = document.createElement('div');
    mov.classList.add('mov');
    mov.classList.add('hov');
    let copy = document.createElement('div');
    copy.classList.add('copy');
    copy.classList.add('hov');
    let del = document.createElement('div');
    del.classList.add('del');
    del.classList.add('hov');
    let lab = document.createElement('div');
    lab.classList.add('lab');
    lab.innerText = img.length;

    newFrame.appendChild(newCan);
    newFrame.appendChild(mov);
    newFrame.appendChild(copy);
    newFrame.appendChild(del);
    newFrame.appendChild(lab);

    frames.innerHTML = '';
    for (let i=0;i<zeroFrames.length;i++){
        frames.appendChild(zeroFrames[i]);
    }
    frames.appendChild(newFrame);
    frames.appendChild(addFrame);

    updateFrameListener();
}

$('#canvas').mousedown(function(e){
    paint = true;
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    redraw();
});

$('#canvas').mousemove(function(e){
    if(paint){
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
      redraw();
    }
});

$('#canvas').mouseup(function(e){
    paint = false;

    let im = canvas.toDataURL("image/png");
    img.splice(selectedFrame, 1, im);
    //   del          i       c  el to add

    let fr = document.getElementById("frame-"+selectedFrame);
    fr.innerHTML = '';

    let mov = document.createElement('div');
    mov.classList.add('mov');
    mov.classList.add('hov');
    let copy = document.createElement('div');
    copy.classList.add('copy');
    copy.classList.add('hov');
    let del = document.createElement('div');
    del.classList.add('del');
    del.classList.add('hov');
    let lab = document.createElement('div');
    lab.classList.add('lab');
    lab.innerText = selectedFrame+1;

    let frm = cloneCanvas(canvas);
    fr.appendChild(frm);
    fr.appendChild(mov);
    fr.appendChild(copy);
    fr.appendChild(del);
    fr.appendChild(lab);

    updateFrameListener();
});

$('#canvas').mouseleave(function(e){
    paint = false;
});

$('#newFrame').click(function(e){
    addNewFrame();
});

$('#full-screen').click(function(e){
    document.getElementById('prew').requestFullscreen();
});

function selEvent(e) {
    let selI = Number(this.id.split('-')[1]);
    e.preventDefault();
    if(e.target.className == "del hov") {
        delEvent(e);
        selI = 0;
    }

    if (selectedFrame !== selI) {
        let oldSel = document.querySelectorAll(".frame");
        oldSel[selectedFrame].classList.remove('sel-frame');
        selectedFrame = selI;
        oldSel[selectedFrame].classList.add('sel-frame');
        let newCan = oldSel[selectedFrame].getElementsByTagName('canvas')[0];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newCan, 0, 0);
        clickX = [];
        clickY = [];
        clickDrag = [];
    }

    if (e.target.className == "copy hov") {
        copyEvent(e);
    }
}

function copyEvent(e) {
    e.preventDefault();
    let currId = Number(e.path[1].id.split('-')[1]);
    selectedFrame = currId;

    img.splice(currId, 0, img[currId]);
    framesState.splice(currId, 0, framesState[currId]);
    //   del     id    count to del

    let elem = document.querySelector('#frame-'+currId);
    
    let newElem = elem.cloneNode(true);
    newElem.id = '';
    
    frames.insertBefore(newElem, frames.children[currId]);
    frms = document.querySelectorAll(".frame");
    let lab = document.querySelectorAll('.lab');
    for(let i=0;i<frms.length;i++){
        frms[i].id = "frame-"+i;
        lab[i].innerText = i+1;
        if (i == selectedFrame) {
            frms[i].classList.add('sel-frame');
            let can = frms[i].getElementsByTagName("canvas")[0];
            let ctxCan = can.getContext('2d');
            ctxCan.drawImage(canvas, 0, 0);
        } else {
            frms[i].classList.remove('sel-frame');
        }
    }
    i = 0;
    updateFrameListener();
}

function delEvent(e) {
    e.preventDefault();
    let currId = Number(e.path[1].id.split('-')[1]);
    img.splice(currId, 1);
    framesState.splice(currId, 1);
    //   del     id    count to del
    let elem = document.querySelector('#frame-'+currId);
    elem.parentNode.removeChild(elem);
    selectedFrame = 0;
    frms = document.querySelectorAll(".frame");
    let lab = document.querySelectorAll('.lab');
    for(let i=0;i<frms.length;i++){
        frms[i].id = "frame-"+i;
        lab[i].innerText = i+1;
        if (i == selectedFrame) {
            frms[i].classList.add('sel-frame');
            let can = frms[i].getElementsByTagName("canvas")[0];
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clears the canvas
            ctx.drawImage(can, 0, 0);
        } else {
            frms[i].classList.remove('sel-frame');
        }
    }
    i = 0;
    updateFrameListener();
}

function updateFrameListener() {
    frms = document.querySelectorAll('.frame');
    for (let i=0;i<frms.length;i++) {
        frms[i].removeEventListener("click", selEvent, false);
        frms[i].addEventListener("click", selEvent, false);
    }
    let del = document.querySelectorAll('.del');
    for (let i=0;i<del.length;i++){
        if (del.length > 1){
            del[i].classList.add('hov');
        } else if (del.length <= 1) {
            del[i].classList.remove('hov');
        }
    }
}

updateFrameListener();

function cloneCanvas(oldCanvas) {

    //create a new canvas
    let newCanvas = document.createElement('canvas');
    let context = newCanvas.getContext('2d');

    // Fit canvas to parent container
    newCanvas.style.width = '98%';
    newCanvas.style.height = '98%';
    newCanvas.width = oldCanvas.offsetWidth;
    newCanvas.height = oldCanvas.offsetHeight;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}
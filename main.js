var startTime, endTime; //variables for calculating elapsed time for fetch, mirror, grayscale and normalize
var waitTime = 500; //waiting time for each operattion
var url = "https://picsum.photos/800"; //the api used

var img = new Image(); //declare a new image variable
img.crossOrigin = "Anonymous"; //CORS policy

function displayTime(elapsedTime, id) {
    document.getElementById(id).innerHTML = elapsedTime + "ms"; //function to display elapsed time in a certain paragraph/heading
                                                                    //based on given id
}

function getImg() {  //function that retrieves image from the api

    startTime = performance.now(); //save starting time

    async function fetchImage() {
        const response = await fetch(url); //async call to api
        return response;
    }
    fetchImage().then(function (data) {

        endTime = performance.now(); //save ending time
        img.src = data.url; //update image variable source
        setTimeout(displayImg, waitTime); //call function to draw image on canvas
        displayTime(Math.round(endTime - startTime), "fetchInfo"); //display time
    }).catch(function (error) {
        console.log("Error: " + error); //error handling
    })

}

async function saveBut() { //function to save your processed image
    var c = document.getElementById("canvAfter"); //get canvas variable
    var ctx = c.getContext("2d"); //get context
    var saveImg = c.toDataURL("image/png"); //convert the image to dataURL

    //the code below was taken from https://sapanbodiwala.com/blog/download-image 
    const image = await fetch(saveImg);
    const imageBlog = await image.blob(); //convert to blob
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL; //create new element and set its reference to the url created before
    link.download = 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); 
}

function mirrorBut() { //function called by the mirror button
    setTimeout(mirrorImg, waitTime);
}

function gsBut() { //function called by the grayscale buttton
    setTimeout(grayScale, waitTime);
}

function normBut() { //function called by the normalize button
    setTimeout(normColor, waitTime);
}

function revertBut() { //function called by the revert button
    setTimeout(displayImg, waitTime);
}

function mirrorImg() { //the mirror algorithm
    var c = document.getElementById("canvAfter");
    var ctx = c.getContext("2d");

    const scannedImage = ctx.getImageData(0, 0, c.width, c.height); //get the image data array

    const scannedData = scannedImage.data;
    const mirroredData = scannedImage.data;
    let aux;

    startTime = performance.now();

    for (let i = 0; i < 800; i++) { //the api is set to give me images that are 800px x 800px
        for (let j = 0; j < 400; j++) {     //if use the array as a matrix, then the height is 800  and the width is 800, but we use only 400 because we mirror half with half
            aux = mirroredData[i * 800 * 4 + j * 4];   //each array element has actually 4 values, r, g, b and alfa.
            mirroredData[i * 800 * 4 + j * 4] = scannedData[i * 800 * 4 + (800 * 4 - 4 * j)];   //there are 800x800x4 elements in the array but I 
            scannedData[i * 800 * 4 + (800 * 4 - 4 * j)] = aux;                                         //go through it by ignoring the x4 and then swapping
                                                                                                            //the 4 values all at once.
            aux = mirroredData[i * 800 * 4 + j * 4 + 1];
            mirroredData[i * 800 * 4 + j * 4 + 1] = scannedData[i * 800 * 4 + (800 * 4 - 4 * j) + 1];
            scannedData[i * 800 * 4 + (800 * 4 - 4 * j) + 1] = aux;

            aux = mirroredData[i * 800 * 4 + j * 4 + 2];
            mirroredData[i * 800 * 4 + j * 4 + 2] = scannedData[i * 800 * 4 + (800 * 4 - 4 * j) + 2];
            scannedData[i * 800 * 4 + (800 * 4 - 4 * j) + 2] = aux;

            aux = mirroredData[i * 800 * 4 + j * 4 + 3];
            mirroredData[i * 800 * 4 + j * 4 + 3] = scannedData[i * 800 * 4 + (800 * 4 - 4 * j) + 3];
            scannedData[i * 800 * 4 + (800 * 4 - 4 * j) + 3] = aux;
        }

    }

    endTime = performance.now();
    displayTime(Math.round(endTime - startTime), "mirrorInfo");

    scannedImage.data = mirroredData;
    ctx.putImageData(scannedImage, 0, 0); //draw the image on the canvas
}

function displayImg() {
    var c = document.getElementById("canvBefore");
    var ctx = c.getContext("2d");
    var cAfter = document.getElementById("canvAfter");
    var ctxAfter = cAfter.getContext("2d");

    c.height = img.naturalHeight; //set the widht and height of the canvases to the
    c.width = img.naturalWidth;             //width and height of the images to avoid
    cAfter.height = img.naturalHeight;          //ugly cropping/conversion
    cAfter.width = img.naturalWidth;

    ctx.drawImage(img, 0, 0);
    ctxAfter.drawImage(img, 0, 0);
}


function grayScale() {
    var c = document.getElementById("canvAfter");
    var ctx = c.getContext("2d");

    const scannedImage = ctx.getImageData(0, 0, c.width, c.height);
    const scannedData = scannedImage.data;

    startTime = performance.now();

    for (let i = 0; i < scannedData.length; i += 4) { //this loop is a bit easier to understand than the one from above
        const total = scannedData[i] + scannedData[i + 1] + scannedData[i + 2];   //we dont care about the position of the pixels
        const averageColorValue = total / 3;                                            //in the "matrix", we just want to set the rgb values
        scannedData[i] = averageColorValue;                                                    //to their average value
        scannedData[i + 1] = averageColorValue;
        scannedData[i + 2] = averageColorValue;
    }

    endTime = performance.now();
    displayTime(Math.round(endTime - startTime), "gsInfo");

    scannedImage.data = scannedData;
    ctx.putImageData(scannedImage, 0, 0);
}

function normColor() {
    var c = document.getElementById("canvAfter");
    var ctx = c.getContext("2d");

    const scannedImage = ctx.getImageData(0, 0, c.width, c.height);
    const scannedData = scannedImage.data;

    startTime = performance.now();

    let rMax = scannedData[0], rMin = scannedData[0], bMax = scannedData[1], bMin = scannedData[1], gMax = scannedData[2], gMin = scannedData[2];

    for (let i = 4; i < scannedData.length; i += 4) {               //this normalize algorithm searches the images for the max and min values
        if (scannedData[i] > rMax)                                      //of each rgb value and then normalizez every value;
            rMax = scannedData[i];                                  //first of all I was a bit confused as this algorithm was taken
        else if (scannedData[i] < rMin)                                 //from: https://www.roborealm.com/help/Normalize.php
            rMin = scannedData[i];                                  //and I thought it should just rise the contrastt of the image but
                                                                        //it acts as some sort of unfilter based on the range of values in 
        if (scannedData[i + 1] > bMax)                              //an image; as it says on teh website, in case we have an image with
            bMax = scannedData[i + 1];                                  //very bright spots and very dark sports, the dark spots will
        else if (scannedData[i + 1] < bMin)                         //be brighter
            bMin = scannedData[i + 1];

        if (scannedData[i + 2] > gMax)
            gMax = scannedData[i + 2];
        else if (scannedData[i + 2] < gMin)
            gMin = scannedData[i + 2];
    }

    for (let i = 0; i < scannedData.length; i += 4) {
        scannedData[i] = ((scannedData[i] - rMin) / (rMax - rMin) * 255.0);
        scannedData[i + 1] = ((scannedData[i + 1] - bMin) / (bMax - bMin) * 255.0);
        scannedData[i + 2] = ((scannedData[i + 2] - gMin) / (gMax - gMin) * 255.0);
    }
    console.log(scannedData[0]);


    endTime = performance.now();
    displayTime(Math.round(endTime - startTime), "normInfo");

    scannedImage.data = scannedData;
    ctx.putImageData(scannedImage, 0, 0);
}
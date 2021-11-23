"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const buildDir = `${basePath}/build`;
const imageDir = path.join(buildDir, "/images");
const { format, preview_gif, } = require(path.join(basePath, "/src/config.js"));
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");

const NeobitGiffer = require(path.join(
  basePath,
  "/modules/NeobitGiffer.js"
));
let neobitGiffer = null;

const loadImg = async (_img) => {
  return new Promise(async (resolve) => {
    const loadedImage = await loadImage(`${_img}`);
    resolve({ loadedImage: loadedImage });
  });
};

// read image paths
const imageList = [];
const rawdata = fs.readdirSync(imageDir).forEach(file => {
   imageList.push(loadImg(`${imageDir}/${file}`));
});

const saveProjectPreviewGIF = async (_data) => {
  // Extract from preview config
  const { numberOfImages, order, repeat, quality, delay, imageName } = preview_gif;
  // Extract from format config
  const { width, height } = format;
  // Prepare canvas
  const previewCanvasWidth = width;
  const previewCanvasHeight = height;

  if(_data.length<numberOfImages) {
    console.log(
      `You do not have enough images to create a gif with ${numberOfImages} images.`
    );
  }
  else {
    // Shout from the mountain tops
    console.log(
      `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${_data.length} images.`
    );
    const previewPath = `${buildDir}/${imageName}`;

    ctx.clearRect(0, 0, width, height);

    neobitGiffer = new NeobitGiffer(
      canvas,
      ctx,
      `${previewPath}`,
      repeat,
      quality,
      delay
    );
    neobitGiffer.start();

    await Promise.all(_data).then((renderObjectArray) => {
      // Determin the order of the Images before creating the gif
      if(order == 'ASC') {
        // Do nothing
      }
      else if(order == 'DESC') {
        renderObjectArray.reverse();
      }
      else if(order == 'MIXED') {
        renderObjectArray = renderObjectArray.sort(() => Math.random() - 0.5);
      }
      
      // Reduce the size of the array of Images to the desired amount
      if(parseInt(numberOfImages)>0) {
        renderObjectArray = renderObjectArray.slice(0, numberOfImages);
      }

      renderObjectArray.forEach((renderObject, index) => {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(renderObject.loadedImage, 0, 0, previewCanvasWidth, previewCanvasHeight);
        neobitGiffer.add();
      });
    });  
    neobitGiffer.stop();
  }
};

saveProjectPreviewGIF(imageList);

const tf = require('@tensorflow/tfjs-node');
const bodyPix = require('@tensorflow-models/body-pix');
const fs = require('fs');
const Jimp = require('jimp');

function RemoveBackground() {

    var bodymodel;

    // https://github.com/tensorflow/tfjs-wechat
    // use china cdn
    this.loadModel = async function loadModel() {
        if (!this.bodymodel) {
            // modelUrl: 'https://storage.googleapis.com/tfjs-models/savedmodel/bodypix/mobilenet/quant2/050/model-stride16.json' 
            // modelUrl: 'https://www.gstaticcnapps.cn/tfjs-models/savedmodel/bodypix/mobilenet/quant2/050/model-stride16.json' 
            // URL = 'https://www.gstaticcnapps.cn/tfjs-models/savedmodel/bodypix/mobilenet/quant2/050/model-stride16.json';

            URL = 'https://www.gstaticcnapps.cn/tfjs-models/savedmodel/bodypix/resnet50/float/model-stride16.json'
            // URL = 'https://www.gstaticcnapps.cn/tfjs-models/savedmodel/bodypix/resnet50/quant2/model-stride16.json'
            const resNet = {
                architecture: 'ResNet50', // very slow
                // architecture: 'MobileNetV1',
                outputStride: 16,
                // multiplier: 0.50,
                quantBytes: 4, // quant4 = float
                modelUrl: URL
            };
            this.bodymodel = await bodyPix.load(resNet);
            // this.bodymodel = await bodyPix.load();
            console.log(this.bodymodel);

        }
    }


    this.Prediction = async function Prediction(image) {
        return this.bodymodel.segmentPersonParts(image);
    }


    this.removeBG = async function removeBG(img, output) {
        const tfimg = tf.node.decodeImage(img);
        const bodySeg = await this.Prediction(tfimg);
        const jimp = await Jimp.read(img);
        let count = 0;
        for (let i = 0; i < bodySeg.height; i++) {
            for (let j = 0; j < bodySeg.width; j++) {
                if (bodySeg.data[count] === -1) {
                    jimp.setPixelColor(0x00000000, j, i);
                }
                count++;
            }
        }

        await jimp.writeAsync(output);
        return true;
    }


}


// Test functions in loop
; (async () => {

    // const img = fs.readFileSync('ty.jpg');
    // const img = fs.readFileSync('images/street.png');

    var convertBG = new RemoveBackground();
    await convertBG.loadModel();

    for (var i = 1; i <= 17; i++) {
        console.log("\nProcessing image index: " + i + " ...");
        var namein = 'images/people' + i + '.jpg'
        var nameout = 'images/people' + i + '_out.png'
        const img = fs.readFileSync(namein);

        let res = await convertBG.removeBG(img, nameout);

        console.log(res);
    }

})().catch(error => console.log(error.message));










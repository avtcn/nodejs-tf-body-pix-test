const tf = require('@tensorflow/tfjs-node');
const bodyPix = require('@tensorflow-models/body-pix');
const fs = require('fs');
const Jimp = require('jimp');

function RemoveBackground() {

    var bodymodel;

    this.loadModel = async function loadModel() {
        if (!this.bodymodel) {
            const resNet = {
                architecture: 'ResNet50', // very slow
                // architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 1,
                quantBytes: 2
            };
            this.bodymodel = await bodyPix.load(resNet);
            // this.bodymodel = await bodyPix.load();
        }
    }


    this.Prediction = async function Prediction(image) {
        await this.loadModel();
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
    }


}


; (async () => {

    // const img = fs.readFileSync('ty.jpg');
    const img = fs.readFileSync('images/street.png');
    var convertBG = new RemoveBackground();

    let res = await convertBG.removeBG(img, 'output.png');
    console.log(res);

})().catch(error => console.log(error.message));





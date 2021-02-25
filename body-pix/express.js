var express = require('express');
var app = express();

var images = require("images");

// ------------------- bodypix 2 begin -------------------------- //

const tf = require('@tensorflow/tfjs-node');
const bodyPix = require('@tensorflow-models/body-pix');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');


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

// 初始化BodyPix2
var convertBG = new RemoveBackground(); 
convertBG.loadModel();

// ------------------- bodypix 2 end   -------------------------- //
 
app.use('/public', express.static('public'));
 
app.get('/', function (req, res) {
   res.send('Hello World from NodeJS service!');
})

// http://127.0.0.1:8080/get?first=joe&last=ge
app.get('/get', function (req, res) {

	var response = {
		"first_name":req.query.first,
		"last_name":req.query.last
	};
	console.log(response);
	res.end(JSON.stringify(response));
})

// http://127.0.0.1:8080/bodypix?image=ty.jpg&imagenew=ty.out.png&x=120&y=80&w=500&h=400
// http://127.0.0.1:8080/bodypix?x=120&y=80&w=500&h=400
app.get('/bodypix', function (req, res) {
	console.log(req.query);

	// var namein = 'ty.jpg'
	// For absolute path, use the shared folder between Win Host OS and Docker Container
	// /root/windocuments/git-local/nodejs-tf-body-pix-test/body-pix
	// /root/windocuments/git-local/nodejs-tf-body-pix-test/body-pix
	// var namein = 'ty.jpg'
	var namein = '/root/windocuments/git-local/nodejs-tf-body-pix-test/body-pix/ty.jpg'
	var nameout = 'ty_express_out.png'
	var nameroi = 'ty_express_out_roi.jpg'
	var nameroiextra = 'ty_express_out_roi_extract.png'
	var namertranbg = 'ty_express_out_transparent_bg.png'

	const ar_demo_snap_folder_base = '/root/windocuments/git-local/ar_demo_avt_camera/proj.win32/'
	if (req.query.image) {
		namein = ar_demo_snap_folder_base + path.basename(req.query.image);
		nameout = ar_demo_snap_folder_base + path.basename(req.query.imagenew);
		nameroi = ar_demo_snap_folder_base + nameroi;
		nameroiextra = ar_demo_snap_folder_base + nameroiextra;
		namertranbg = ar_demo_snap_folder_base + namertranbg;
	}

	//
	// ROI到人物站立位置区域
	// 识别ROI当中的人物
	// 


    var origin;
    origin = images(namein)                     //Load image from file 
    console.log("Load origin: ", origin)

    console.log("start roi ...");
    // roi = images(origin, req.query.x, req.query.y, req.query.w, req.query.h);
    roi = images(origin, parseInt(req.query.x), parseInt(req.query.y), 
        parseInt(req.query.w), parseInt(req.query.h));
    console.log("end   roi ...");
    roi.save(nameroi); 
    console.log("save  roi ...");

    // tranparent blank image
    transparentbg = images(origin.width(), origin.height())
    transparentbg.save(namertranbg); 
    console.log("save  bg ...");


	const img = fs.readFileSync(nameroi); 

	; (async () => {

		var aires = await convertBG.removeBG(img, nameroiextra); 
		console.log(aires);

        roiextra = images(nameroiextra);
        transparentbg.draw(roiextra, parseInt(req.query.x), parseInt(req.query.y)).save(nameout);

		var response = {
			"ret": true,
			"output": nameout
		};
		console.log(response);
		res.end(JSON.stringify(response));

	})().catch(error => {
		// Error
		console.log(error.message)
		var response = {
			"ret": false,
			"output": error.message
		};
		console.log(response);
		res.end(JSON.stringify(response));
	}); 

})

 
var server = app.listen(80, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("------------------------------------------------------------------------") 
  console.log("BodyPix2 AI Figure Extracting 应用实例，访问地址为 http://%s:%s", host, port) 
})

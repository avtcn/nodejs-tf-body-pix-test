var images = require("images");
 
origin = images("images.input.jpg")                     //Load image from file 
roi = images(origin, 160, 80, 400, 300);
roi.save("images.output.roi.png");


// tranparent blank image
transparentbg = images(origin.width(), origin.height())
transparentbg.save("images.output.bg.png");

transparentbg.draw(roi, 160, 80).save("images.output.merge.png");


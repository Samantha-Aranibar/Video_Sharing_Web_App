var pathToFFMPEG = require("ffmpeg-static");
var promisify = require('util').promisify; // need to install with npm i ffmpeg-static
var exec = promisify(require("child_process").exec);

module.exports = {
  makeThumbnail: async function (req, res, next) {
    if (!req.file) {
        next(new Error("File upload failed"));
    } else {
        try {
            var destinationOfThumbnail = `public/images/uploads/thumbnail-${
                req.file.filename.split(".")[0]
            }.png`;
            var thumbnailCommand = `"${pathToFFMPEG}" -ss 00:00:01 -i ${req.file.path} -y -s 200x200 -vframes 1 -f image2 ${destinationOfThumbnail}`;
            var {stdout, stderr} = await exec(thumbnailCommand);
            console.log(stderr);
            console.log(stderr);
            req.file.thumbnail = destinationOfThumbnail;
            next();
        } catch (error) {
            next(error);
        }
    }
  },
}
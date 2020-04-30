import bodyParser from "body-parser";
import express, { response } from "express";
import multer from "multer";
import path from "path";
import {
  deleteLocalFiles,
  fileFilter,
  filterImageFromURL,
  getTempFiles,
  imageExists,
  isSupportedFileExt,
  storage,
} from "./util/util";

// Note: I'll ignore tslint rule warning of no import statement,
// as app-root-path package recommends use below.
// See https://www.npmjs.com/package/app-root-path +
// https://palantir.github.io/tslint/rules/no-var-requires/
const appRoot = require("app-root-path");

const upload = multer({ storage, fileFilter });

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  //
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  //
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  //
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // e.g. https://motorcycles.honda.com.au/img/2019-CRF250-RALLY-Red-Lifestyle-riding-1140x500.jpg
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  // e.g. https://expressjs.com/en/api.html#res.sendFile
  //
  // RUBIC
  //  Development Server
  //    The project demonstrates an understanding of RESTFUL design
  //      The stubbed @TODO1 endpoint in src/server.ts is completed and accepts valid requests including:
  //      http://localhost:{{PORT}}/filteredimage?image_url=
  //        https://timedotcom.files.wordpress.com/2019/03/kitten-report.jpg
  //
  //    The project demonstrates an understanding of HTTP status codes
  //      Successful responses have a 200 code, at least one error code for caught errors (i.e. 422)

  /**************************************************************************** */

  /* Get public image, filter, store locally */
  app.get("/filteredimage", async (req, res) => {
    let isImage;
    let filteredImagePath;
    try {
      isImage = await imageExists(req.query.image_url);

      if (isImage) {
        filteredImagePath = await filterImageFromURL(req.query.image_url);
        res.status(200).sendFile(filteredImagePath);
      } else {
        return res.status(415).send("Unsupported image type.");
      }
    } catch (e) {
      response.status(400).send(e);
    }
  });

  /* Upload filtered image file. */
  app.post("/filter-image", upload.single("file"), async (req, res) => {
    if (!req.file || !isSupportedFileExt(path.extname(req.file.originalname))) {
      return res
        .status(403)
        .contentType("text/plain")
        .end("This image is not supported.");
    }

    const filteredImagePath = await filterImageFromURL(
      // Note: I'll ignore tslint warning of no trailing comma,
      // as trailing comma here is removed by prettier formatter.
      // See https://prettier.io/docs/en/options.html
      path.join(appRoot.path, req.file.path)
    );
    res.status(200).sendFile(filteredImagePath);
  });

  /* Delete image files on server. */
  app.post("/delete-files", async (request, res) => {
    deleteLocalFiles(getTempFiles());
    res.status(200).send("All image files have been removed");
  });

  /* How to use end point. */
  app.get("/", async (req, res) => {
    res.send(
      // Note: I'll ignore tslint warning of no trailing comma,
      // as trailing comma here is removed by prettier formatter.
      // See https://prettier.io/docs/en/options.html
      "To filter a public image, add the following to your URL: /filteredimage?image_url={{}}"
    );
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`Server running http://localhost:${port}`);
    console.log(`Press CTRL+C to stop server`);
  });
})();

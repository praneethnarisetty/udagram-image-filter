import axios from "axios";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import Jimp from "jimp"; // https://www.npmjs.com/package/jimp
import multer from "multer"; // https://github.com/expressjs/multer
import path from "path";

// Note: I'll ignore tslint rule warning of no import statement,
// as app-root-path package recommends use below.
// See https://www.npmjs.com/package/app-root-path +
// https://palantir.github.io/tslint/rules/no-var-requires/
const appRoot = require("app-root-path");

/*
Define the disk storage engine.

Note: tmp/ is used instead of uploads for filtered image storage.
 */
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    let filetype = "";

    if (SUPPORTED_IMAGE_FORMATS.includes(file.mimetype)) {
      filetype = file.mimetype.split("/")[1];
    }

    cb(null, "image-" + Date.now() + "." + filetype);
  },
});

/**
 * Files filter
 * @param req
 * @param file
 * @param cb
 */
export function fileFilter(req: any, file: any, cb: any) {
  if (!file || !isSupportedFileExt(path.extname(file.originalname))) {
    cb(null, false);
  } else {
    cb(null, true);
  }
}

/* Map of image formats allowed. */
export const SUPPORTED_IMAGE_FORMATS = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/bmp",
];

/* Map of image file extensions allowed. */
export const SUPPORTED_FILE_EXTENSIONS = [
  ".gif",
  ".jpeg",
  ".png",
  ".tiff",
  ".bmp",
];

/**
 * Filters image from public url and saves locally
 * @param inputURL
 * @returns local image url (absolute path)
 */
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async (resolve) => {
    const photo = await Jimp.read(inputURL);
    const outpath =
      "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
    await photo
      .resize(256, 256)
      .quality(60)
      .greyscale()
      .write(__dirname + outpath, () => {
        resolve(__dirname + outpath);
      });
  });
}

/**
 * Deletes local files
 * @param files
 */
export async function deleteLocalFiles(files: string[]) {
  for (const file of files) {
    fs.unlinkSync(file);
  }
}

/**
 * Images exists?
 * @param imageUrl
 * @returns  true | false
 */
export async function imageExists(imageUrl: string) {
  let exists;

  try {
    const response = await axios.head(imageUrl);
    exists =
      response.status === 200 &&
      isSupportedImageFormat(response.headers["content-type"]);
  } catch (e) {
    exists = false;
  }

  return exists;
}

/**
 * Determines if a supported file ext.
 * @param fileExt
 * @returns  true | false
 */
export function isSupportedFileExt(fileExt: string) {
  return SUPPORTED_FILE_EXTENSIONS.includes(fileExt);
}

/**
 * Determines if a supported image format.
 * @param format
 * @returns  true | false
 */
function isSupportedImageFormat(format: string) {
  return SUPPORTED_IMAGE_FORMATS.includes(format);
}

/**
 * Gets temp files.
 * @returns  absolute file paths
 */
export function getTempFiles() {
  return getDirectoryContent(path.join(__dirname, "tmp")).map((file) => {
    return path.join(__dirname, "tmp", file);
  });
}

/**
 * Gets uploaded files.
 * @returns  absolute file paths
 */
// export function getUploadedFiles() {
//   return getDirectoryContent(path.join(appRoot.path, "uploads")).map((file) => {
//     return path.join(appRoot.path, "uploads", file);
//   });
// }

/**
 * Gets directory content
 * @param directoryPath
 * @returns  absolute file paths array
 */
function getDirectoryContent(directoryPath: string) {
  return fs.readdirSync(directoryPath);
}

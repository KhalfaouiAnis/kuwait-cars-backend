import fs from "fs";
import path from "path";
import util from "util";

export function deleteFile(url: string) {
  try {
    const normalizedPath = path.join(...url.split("/"));
    if (fs.existsSync(normalizedPath)) {
      fs.unlinkSync(normalizedPath);
    }
  } catch (unlinkError) {
    console.error(`Failed to delete ${url}:`, unlinkError);
  }
}

export function unlinkFiles(files: {
  [fieldname: string]: Express.Multer.File[];
}) {
  if (files.thumbnail) {
    deleteFile(files.thumbnail[0].path);
  }
  if (files.video) {
    deleteFile(files.video[0].path);
  }
  if (files.audio) {
    deleteFile(files.audio[0].path);
  }
  if (files.images) {
    files.images.forEach((file) => deleteFile(file.path));
  }
}

export const unlinkFile = util.promisify(fs.unlink);

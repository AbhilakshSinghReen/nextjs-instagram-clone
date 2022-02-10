import fs from "fs";
import path from "path";

const uploadFolder = "./public/storage";

export async function uploadToStorage(dirpath, file) {
  const dir = path.join(uploadFolder, dirpath);
  fs.mkdirSync(dir, { recursive: true });

  const data = fs.readFileSync(file.filepath);
  let newFilename = path.join(dir, file.newFilename);
  fs.writeFileSync(newFilename, data);
  fs.unlinkSync(file.filepath);

  newFilename = newFilename.replace("public", "");
  newFilename = newFilename.replace(/\\/g, "/");
  return newFilename;
}

export async function uploadMultipleToStorage(dirpath, files) {
  const dir = path.join(uploadFolder, dirpath);
  fs.mkdirSync(dir, { recursive: true });

  const uploadedFiles = [];

  files.forEach((file, index) => {
    const data = fs.readFileSync(file.filepath);
    let newFilename = path.join(dir, file.newFilename);

    fs.writeFileSync(newFilename, data);
    fs.unlinkSync(file.filepath);

    newFilename = newFilename.replace("public", "");
    newFilename = newFilename.replace(/\\/g, "/");
    uploadedFiles.push(newFilename);
  });

  return uploadedFiles;
}

export async function deleteFromStorage(filepath) {
  const fullPath = path.join(uploadFolder, filepath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath, { recursive: true });
  }
}

export async function deleteFolderFromStorage(folderPath) {
  const fullPath = path.join(uploadFolder, folderPath);

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true });
  }
}

export async function emptyStorageFolder(folderPath) {
  const fullFolderPath = path.join(uploadFolder, folderPath);

  if (fs.existsSync(fullFolderPath)) {
    const files = fs.readdirSync(fullFolderPath);

    files.forEach((file) => {
      const fullFilePath = path.join(fullFolderPath, file);
      fs.unlinkSync(fullFilePath);
    });
  }
}

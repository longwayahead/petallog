import fs from "fs";
import path from "path";
import { UPLOADS_DIR } from "../middleware/upload.js";
import sharp from "sharp";
import {
  insertPhoto,
  getPhotosByInteraction,
  getPhotosByPlant,
  getPhotoById,
  deletePhoto as deletePhotoDb,
} from "../models/photosModel.js";

export const uploadPhotos = async (req, res, next) => {
  const { id } = req.params; // interactionId
  try {
    const files = req.files || [];
    const saved = [];

    for (const f of files) {
      const url = `/uploads/${f.filename}`;

      //generate thumbnail filename
      const thumbName = `thumb_${f.filename}`;
      const thumbPath = path.join(UPLOADS_DIR, thumbName);
      const thumbnailUrl = `/uploads/${thumbName}`;

      //generate thumbnail
      await sharp(f.path)
        .resize(200, 200, {fit: "cover"})
        .jpeg({ quality: 80 })
        .toFile(thumbPath);


      const photo = await insertPhoto(id, url, thumbnailUrl);
      saved.push(photo);
    }

    res.json(saved);
  } catch (err) {
    next(err);
  }
};

export const listInteractionPhotos = async (req, res, next) => {
  try {
    const photos = await getPhotosByInteraction(req.params.id);
    res.json(photos);
  } catch (err) {
    next(err);
  }
};

export const listPlantPhotos = async (req, res, next) => {
  try {
    const photos = await getPhotosByPlant(req.params.plantId);
    res.json(photos);
  } catch (err) {
    next(err);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id);
    if (!photo) return res.status(404).send("Not found");

    const filePath = path.join(UPLOADS_DIR, path.basename(photo.url));
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn("File not found on disk:", filePath);
    }

    //delete thumbnail
    if (photo.thumbnail_url) {
      const thumbPath = path.join(UPLOADS_DIR, path.basename(photo.thumbnail_url));
      try {
        fs.unlinkSync(thumbPath);
      } catch (e) {
        console.warn("Thumbnail not found on disk:", thumbPath);
      }
    }

    await deletePhotoDb(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

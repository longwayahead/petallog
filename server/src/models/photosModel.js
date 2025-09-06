import pool from "../config/db.js";

export async function insertPhoto(interactionId, url, thumbnailUrl) {
  const query = `
    INSERT INTO photos (interaction_id, url, thumbnail_url)
    VALUES (?, ?, ?)
  `;
  const [result] = await pool.query(query, [interactionId, url, thumbnailUrl]);

  // result.insertId gives the new primary key
  const [rows] = await pool.query("SELECT * FROM photos WHERE id = ?", [result.insertId]);
  return rows[0];
}


export async function getPhotosByInteraction(interactionId) {
  const [rows] = await pool.query(
    "SELECT * FROM photos WHERE interaction_id = ? ORDER BY created_at DESC",
    [interactionId]
  );
  return rows;
}


export async function getPhotosByPlant(plantId) {
  const query = `
    SELECT photos.*
    FROM photos
    JOIN interactions ON interactions.id = photos.interaction_id
    WHERE interactions.plant_id = ?
    ORDER BY photos.created_at DESC
  `;
  const [rows] = await pool.query(query, [plantId]);
  return rows;
}


export async function getPhotoById(photoId) {
  const [rows] = await pool.query("SELECT * FROM photos WHERE id = ?", [photoId]);
  return rows[0] || null;
}


export async function deletePhoto(photoId) {
  const photo = await getPhotoById(photoId);
  if (!photo) return null;

  await pool.query("DELETE FROM photos WHERE id = ?", [photoId]);
  return photo;
}


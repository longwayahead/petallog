import pool from "../config/db.js";

export async function findQrByCode(code) {
  const [rows] = await pool.query(
    "SELECT * FROM qrcodes WHERE code = ? AND deleted = 0",
    [code]
  );
  return rows[0] || null;
}

export async function findPlantByPot(potId) {
  const [rows] = await pool.query(
    "SELECT * FROM plants_pots WHERE pots_id = ? AND ended_at IS NULL",
    [potId]
  );
 return rows[0];
}

export async function findPotByQr(code) {
  const [rows] = await pool.query(
    `SELECT * FROM qrcodes_pots qp
    LEFT JOIN qrcodes q on q.id = qp.qrcodes_id
    WHERE q.code = ? and qp.unlinked_at is null`,
    [code]
  );
  return rows[0] || null;
}

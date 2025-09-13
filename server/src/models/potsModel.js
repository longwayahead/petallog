import pool from "../config/db.js";
import * as QrModel from "./qrcodesModel.js";

function toMysqlDateTime(date) {
    return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}

export async function findPotById(id) {
    const [rows] = await pool.query(`SELECT
        p.id as potsId,
        p.location as potLocation,
        p.diameter_cm as potDiameter,
        p.height_cm as potHeight,
        p.friendly_name as potFriendlyName,
        p.acquired_at as potAcquiredAt,
        p.status as potStatus,
        ps.name as potStatusName,
        ps.description as potStatusDescription,
        p.created_at as potCreatedAt,
        p.updated_at as potUpdatedAt
        FROM pots p
        LEFT JOIN pots_statuses ps ON p.status = ps.id
        where p.id = ?
        `, [id]);
    return rows[0];
}

export async function findEmptyPots() {
    const [rows] = await pool.query(`SELECT
        p.id as potsId,
        p.location as potLocation,
        p.diameter_cm as potDiameter,
        p.height_cm as potHeight,
        p.friendly_name as potFriendlyName,
        p.acquired_at as potAcquiredAt,
        p.status as potStatus,
        ps.name as potStatusName,
        ps.description as potStatusDescription,
        p.created_at as potCreatedAt,
        p.updated_at as potUpdatedAt
        FROM pots p
        LEFT JOIN pots_statuses ps ON p.status = ps.id
        WHERE p.status = 1
        `);
    return rows;
}

export async function createPot(data) {
    const { location, diameter_cm, height_cm, friendly_name, acquired_at, acquired_from, qrCode } = data;
    const acquiredAt = acquired_at ? toMysqlDateTime(acquired_at) : null;
    const [result] = await pool.query(
        `INSERT INTO pots (location, diameter_cm, height_cm, friendly_name, acquired_at, acquired_from, status)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [location, diameter_cm, height_cm, friendly_name, acquiredAt, acquired_from]
    );
    const potId = result.insertId;

    const qr = await QrModel.findQrByCode(qrCode);
    if (!qr) throw new Error("Invalid QR code");

    await pool.query(`INSERT INTO qrcodes_pots (qrcodes_id, pots_id) VALUES (?, ?)`, [qr.id, potId]);

    return { potId };
}

export async function assignQRCodeToPot(qrCode, potId) {
    const code = await QrModel.findQrByCode(qrCode);
    if(!code) throw new Error("QR code not found");
    const assign = await pool.query(`INSERT INTO qrcodes_pots (qrcodes_id, pots_id) VALUES (?, ?)`, [code.id, potId]);
    return assign[0].affectedRows > 0;
}

//unlink QR code from pot

export async function freePot(potId) { //clear out the plant
    const end = await pool.query(`UPDATE plants_pots SET ended_at = NOW() WHERE pots_id = ? AND ended_at IS NULL`, [potId]);
    // console.log(end);
    if(end[0].affectedRows > 0) {
        const pot = await pool.query(`UPDATE pots SET status = 1 WHERE id = ?`, [potId]);
        return pot[0];
    }
    return null;
}
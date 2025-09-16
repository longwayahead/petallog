import pool from "../config/db.js";

export async function saveSubscription(userId, subscription) {
  const { endpoint, keys } = subscription;

  return pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       endpoint = VALUES(endpoint), 
       p256dh = VALUES(p256dh), 
       auth = VALUES(auth)`,
    [userId, endpoint, keys.p256dh, keys.auth]
  );
}

export async function getSubscriptionsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT id, endpoint, p256dh, auth 
     FROM push_subscriptions 
     WHERE user_id = ?`,
    [userId]
  );
  return rows;
}

export async function deleteSubscription(id) {
  return pool.query(`DELETE FROM push_subscriptions WHERE id = ?`, [id]);
}

// 🔹 New helper
export async function deleteByEndpoint(endpoint) {
  return pool.query(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [endpoint]);
}

export async function getAllSubscriptions() {
  const [rows] = await pool.query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions`
  );
  return rows;
}
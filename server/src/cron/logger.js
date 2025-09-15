import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "cron", "logs");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// helper: get today's log file path
function getLogFile() {
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return path.join(logDir, `${dateStr}.log`);
}

export function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(getLogFile(), line, "utf8");
}

export function logError(err) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ERROR: ${err.stack || err}\n`;
  fs.appendFileSync(getLogFile(), line, "utf8");
}

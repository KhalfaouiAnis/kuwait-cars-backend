/**
 * DigitalOcean Function: Soft Delete Trigger
 * Runtime: nodejs:22
 */

export async function main() {
  const URL = process.env.APP_CRON_URL || "app.ondigitalocean.app";
  const SECRET = process.env.CRON_SECRET;

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return {
      body: { success: true, message: "Cron triggered", details: data },
    };
  } catch (err: any) {
    console.error("Cron Trigger Failed:", err.message);
    return {
      body: { success: false, error: err.message },
      statusCode: 500,
    };
  }
}

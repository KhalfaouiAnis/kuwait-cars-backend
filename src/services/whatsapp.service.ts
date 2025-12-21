import { config } from "@config/environment.js";

export async function sendWhatsAppOtp(phoneNumber: string, otp: string) {
  const url = `graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phoneNumber,
    type: "template",
    template: {
      name: "otp_verification",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: otp }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: otp }],
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${config.whatsapp.token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json();

  return json?.messages?.[0]?.id;
}

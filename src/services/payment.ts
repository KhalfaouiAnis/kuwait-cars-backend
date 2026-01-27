import { config } from "@config/environment.js";
import { PaymentObjectInterface } from "types/ad.js";

const URL = "https://api-sandbox.ecom.io/eapi/v1/api/charges";

const options = {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "X-Ecom-Mid": config.payments.mid,
    "X-Ecom-Api-Token": config.payments.apiToken,
  },
};

export async function initiatePayment({
  description,
  customer,
  language,
  amount,
  order,
  urls,
}: PaymentObjectInterface) {
  // Backend Config: Set the gateway's success URL to a page on your own web server (e.g., https://api.yourdomain.com).
  // Redirect Logic: When the gateway hits that backend endpoint after a successful payment, your backend should respond with a 302 Redirect to your app's custom scheme.
  // Example Response: Location: myapp://new/success?orderId=123

  const body = JSON.stringify({
    urls,
    order,
    amount,
    customer,
    language,
    description,
    options: { mode: "INDIRECT", paymentMethod: "KNET" },
  });

  return fetch(URL, {
    ...options,
    body,
  })
    .then((res) => res.json())
    .then((json) => json.data)
    .catch(console.log);
}

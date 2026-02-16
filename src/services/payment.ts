import { config } from "@config/environment.js";
import { BadRequestError } from "@libs/error/BadRequestError.js";
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
  if (amount.value <= 0)
    throw new BadRequestError("Amount should be a positive number.");

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

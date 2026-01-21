import { expressApp, port } from "app.js";

// @ts-expect-error: Adding global serializer for BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const initServer = async () => {
  expressApp.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`),
  );
};

initServer();

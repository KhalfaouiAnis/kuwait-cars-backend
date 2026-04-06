import { expressApp, port } from "app.js";
import { startCronJobs } from "jobs/cron.jobs.js";

// @ts-expect-error: Adding global serializer for BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

startCronJobs();

const initServer = async () => {
  expressApp.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`),
  );
};

initServer();

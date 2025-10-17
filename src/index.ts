import { expressApp, port } from "app";

const initServer = async () => {
  expressApp.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`)
  );
};

initServer();
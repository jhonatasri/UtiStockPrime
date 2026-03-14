import { writeFile } from "fs/promises";
import { app } from "./app";
import { resolve } from "path";

app.listen({
  host: "0.0.0.0",
  port: 3333,
});

app.ready().then(() => {
  const spec = app.swagger();

  writeFile(
    resolve(__dirname, "..", "public", "swagger.json"),
    JSON.stringify(spec, null, 2)
  );
});

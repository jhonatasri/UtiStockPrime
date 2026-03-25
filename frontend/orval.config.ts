import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://82.197.67.88:3333/docs/swagger",
    output: {
      clean: true,
      mode: "tags-split",
      target: "./src/http/generated/api.ts",
      httpClient: "axios",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/lib/api.ts",
          name: "apiMutator",
        },
      },
    },
  },
});

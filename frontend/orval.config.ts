import { defineConfig } from "orval";
import * as dotenv from "dotenv";

dotenv.config();

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default defineConfig({
  api: {
    input: `${apiUrl}/docs/swagger`,
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

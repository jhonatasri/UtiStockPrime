import "dotenv/config";
import fastify, { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import fastifySocket from "fastify-socket.io";
import fastify_cors from "@fastify/cors";
import { fastifyJwt } from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import {
  validatorCompiler,
  jsonSchemaTransform,
  serializerCompiler,
} from "fastify-type-provider-zod";
import path from "path";
import { routes } from "./router";
import fastifyBcrypt from "fastify-bcrypt";
import { authController } from "./controllers/authController";

export const app = fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Registre o plugin fastify-static
app.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/public/",
});

app.register(fastifySocket, {
  cors: {
    origin: "*",
  },
});

app.register(fastify_cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  // allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(fastifyBcrypt, {
  saltWorkFactor: 12,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Api Stock Prime",
      version: "1.0.0",
      contact: {
        name: "Utivirtual",
        email: "contato@utivirtual.com.br",
      },
      description: "API para sistema de estoque UTI Stock Prime.",
      license: {
        name: "EULA",
        url: "https://www.utivirtual.com.br/licencas/",
      },
    },
    servers: [
      {
        url: "http://localhost:3333",
        description: "Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: String(process.env.SECRET),
});

app.get("/docs/swagger", (req, res) => {
  return res.sendFile("swagger.json");
});

app.register(authController);

app.register(routes);

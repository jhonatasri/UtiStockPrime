import { FastifyInstance } from "fastify";
import { usuariosController } from "./controllers/usuariosController";

export async function routes(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    // try {
    //   await req.jwtVerify();
    // } catch (err) {
    //   res.send(err);
    // }
  });
  app.register(usuariosController);
}

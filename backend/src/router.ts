import { FastifyInstance } from "fastify";
import { usuariosController } from "./controllers/usuariosController";
import { rotasController } from "./controllers/rotasController";
import { rotasUsuariosController } from "./controllers/rotasUsuariosController";
import { eventosController } from "./controllers/eventosController";
import { produtosController } from "./controllers/produtosController";

export async function routes(app: FastifyInstance) {
  app.addHook("onRequest", async (req, res) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      res.send(err);
    }
  });
  app.register(usuariosController);
  app.register(rotasController);
  app.register(rotasUsuariosController);
  app.register(eventosController);
  app.register(produtosController);
}

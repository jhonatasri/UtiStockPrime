import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

export const authController: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/login",
    {
      schema: {
        description: "Realiza o login no sistema.",
        tags: ["Login"],
        operationId: "Login",
        body: z.object({
          email: z.email(),
          senha: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, senha } = req.body;

      const usuario = await prisma.usuarios.findUnique({
        where: {
          email,
        },
      });

      if (!usuario) {
        return res.status(401).send({
          message: "Usuário não identificado.",
        });
      }

      const password = await app.bcrypt.compare(senha, usuario.senha);

      if (!password) {
        return res.status(401).send({
          message: "Senha inválida.",
        });
      }

      const token = app.jwt.sign({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          funcao: usuario.funcao.toUpperCase(),
        },
      });

      return res.send({ token });
    }
  );
};

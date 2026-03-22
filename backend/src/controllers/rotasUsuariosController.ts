import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

export const rotasUsuariosController: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/rotas-usuarios",
    {
      schema: {
        description: "Cadastra uma rota para um usuário",
        tags: ["Rotas Usuários"],
        operationId: "cadastrarRotaUsuario",
        security: [{ BearerAuth: [] }],
        body: z.object({
          rotasId: z.number(),
          usuariosId: z.number(),
        }),
        response: {
          201: z.object({
            id: z.number(),
            rotasId: z.number(),
            usuariosId: z.number(),
          }),
        },
      },
    },
    async (req, res) => {
      const { rotasId, usuariosId } = req.body;

      const rotaUsuario = await prisma.rotasUsuarios.create({
        data: { rotasId, usuariosId },
      });

      return res.status(201).send(rotaUsuario);
    }
  );

  app.delete(
    "/rotas-usuarios/:id",
    {
      schema: {
        description: "Remove a permissão de acesso de um usuário a uma rota",
        tags: ["Rotas Usuários"],
        operationId: "removeRotaUsuario",
        security: [{ BearerAuth: [] }],
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          204: z.object({}),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      await prisma.rotasUsuarios.delete({
        where: { id },
      });

      return res.status(204).send({});
    }
  );

  app.get(
    "/rotas-usuarios/:id",
    {
      schema: {
        description: "Busca todas as rotas que um usuário tem acesso pelo ID",
        tags: ["Rotas Usuários"],
        operationId: "listaRotasPorUsuario",
        security: [{ BearerAuth: [] }],
        params: z.object({
          id: z.coerce.number(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              rota: z.string(),
              titulo: z.string(),
              descricao: z.string().optional().nullable(),
              logo: z.string(),
              modulo: z.string().optional().nullable(),
            })
          ),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      const rotas = await prisma.rotas.findMany({
        where: {
          rotasUsuarios: {
            some: { usuariosId: id },
          },
        },
        orderBy: { id: "asc" },
      });

      return res.send(rotas);
    }
  );
};

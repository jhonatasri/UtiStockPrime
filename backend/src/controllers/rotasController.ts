import { number, z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

export const rotasController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/rotas",
    {
      schema: {
        description: "Busca todas as rotas cadastradas",
        tags: ["Rotas"],
        operationId: "listaRotas",
        security: [{ BearerAuth: [] }],
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
      const rotas = await prisma.rotas.findMany({
        orderBy: {
          id: "asc",
        },
      });

      return res.send(rotas);
    }
  );
};

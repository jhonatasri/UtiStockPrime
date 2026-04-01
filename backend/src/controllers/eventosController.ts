import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const categorias = ["SHOW", "FESTIVAL", "CORPORATIVO", "PRIVADO"] as const;

const eventoResponse = z.object({
  id: z.number(),
  nome: z.string(),
  descricao: z.string().optional().nullable(),
  data: z.string().datetime().optional().nullable(),
  local: z.string().optional().nullable(),
  ativo: z.boolean(),
  categoria: z.string(),
  responsavelNome: z.string().optional().nullable(),
  responsavelTelefone: z.string().optional().nullable(),
  responsavelEmail: z.string().optional().nullable(),
});

export const eventosController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/eventos",
    {
      schema: {
        description: "Busca todos os eventos do sistema",
        tags: ["Eventos"],
        operationId: "listaEventos",
        security: [{ BearerAuth: [] }],
        querystring: z.object({ usuarioId: z.coerce.number().optional() }),
        response: { 200: z.array(eventoResponse) },
      },
    },
    async (req, res) => {
      const { usuarioId } = req.query;
      const eventos = await prisma.eventos.findMany({
        where: usuarioId
          ? { ativo: true, usuarios: { some: { usuariosId: usuarioId } } }
          : undefined,
        orderBy: { id: "asc" },
      });
      return res.send(
        eventos.map((e) => ({ ...e, data: e.data?.toISOString() ?? null }))
      );
    }
  );

  app.post(
    "/eventos",
    {
      schema: {
        description: "Cria um evento no sistema",
        tags: ["Eventos"],
        operationId: "criaEvento",
        security: [{ BearerAuth: [] }],
        body: z.object({
          nome: z.string(),
          descricao: z.string().optional(),
          data: z.string().datetime().optional(),
          local: z.string().optional(),
          categoria: z.enum(categorias),
          ativo: z.boolean().optional().default(true),
          responsavelNome: z.string().optional(),
          responsavelTelefone: z.string().optional(),
          responsavelEmail: z.string().optional(),
          usuariosIds: z.array(z.number()).optional(),
        }),
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const {
        nome, descricao, data, local, categoria, ativo,
        responsavelNome, responsavelTelefone, responsavelEmail, usuariosIds,
      } = req.body;

      const evento = await prisma.eventos.create({
        data: {
          nome,
          descricao,
          data: data ? new Date(data) : null,
          local,
          categoria,
          ativo: ativo ?? true,
          responsavelNome,
          responsavelTelefone,
          responsavelEmail,
        },
      });

      if (usuariosIds && usuariosIds.length > 0) {
        await prisma.eventosUsuarios.createMany({
          data: usuariosIds.map((uid) => ({ eventoId: evento.id, usuariosId: uid })),
        });
      }

      return res.status(201).send({ id: evento.id });
    }
  );

  app.put(
    "/evento/:id",
    {
      schema: {
        description: "Altera os dados de um evento",
        tags: ["Eventos"],
        operationId: "alteraEvento",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        body: z.object({
          nome: z.string(),
          descricao: z.string().optional(),
          data: z.string().datetime().optional(),
          local: z.string().optional(),
          categoria: z.enum(categorias),
          ativo: z.boolean(),
          responsavelNome: z.string().optional(),
          responsavelTelefone: z.string().optional(),
          responsavelEmail: z.string().optional(),
          usuariosIds: z.array(z.number()).optional(),
        }),
        response: { 200: z.object({}) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const {
        nome, descricao, data, local, categoria, ativo,
        responsavelNome, responsavelTelefone, responsavelEmail, usuariosIds,
      } = req.body;

      await prisma.eventos.update({
        where: { id },
        data: {
          nome,
          descricao,
          data: data ? new Date(data) : null,
          local,
          categoria,
          ativo,
          responsavelNome,
          responsavelTelefone,
          responsavelEmail,
        },
      });

      if (usuariosIds !== undefined) {
        await prisma.eventosUsuarios.deleteMany({ where: { eventoId: id } });
        if (usuariosIds.length > 0) {
          await prisma.eventosUsuarios.createMany({
            data: usuariosIds.map((uid) => ({ eventoId: id, usuariosId: uid })),
          });
        }
      }

      return res.status(200).send({});
    }
  );

  app.get(
    "/evento/:id",
    {
      schema: {
        description: "Busca um evento no sistema",
        tags: ["Eventos"],
        operationId: "listaEvento",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: eventoResponse.extend({
            usuariosIds: z.array(z.number()),
          }),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      const evento = await prisma.eventos.findUniqueOrThrow({
        where: { id },
        include: { usuarios: true },
      });

      return res.send({
        ...evento,
        data: evento.data?.toISOString() ?? null,
        usuariosIds: evento.usuarios.map((u) => u.usuariosId),
      });
    }
  );
};

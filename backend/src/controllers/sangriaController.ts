import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const sangriaResponse = z.object({
  id: z.number(),
  barId: z.number(),
  barNome: z.string(),
  usuarioId: z.number().optional().nullable(),
  usuarioNome: z.string().optional().nullable(),
  responsavel: z.string(),
  dataHora: z.string(),
  status: z.string(),
  valorTotal: z.number(),
  eventoId: z.number().optional().nullable(),
});

const sangriaItemResponse = z.object({
  id: z.number(),
  produtoId: z.number(),
  produtoNome: z.string(),
  produtoUnidadeMedida: z.string(),
  quantidade: z.number(),
});

export const sangriaController: FastifyPluginAsyncZod = async (app) => {
  // ── Criar sangria ─────────────────────────────────────────────────────────
  app.post(
    "/sangrias",
    {
      schema: {
        description: "Abre uma sangria (recebimento de fichas)",
        tags: ["Sangrias"],
        operationId: "criaSangria",
        security: [{ BearerAuth: [] }],
        body: z.object({
          barId: z.number(),
          usuarioId: z.number(),
          responsavel: z.string(),
          dataHora: z.string().optional(),
          eventoId: z.number().optional(),
        }),
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const { barId, usuarioId, responsavel, dataHora, eventoId } = req.body;

      // Bloqueia se já houver sangria ABERTA para este evento + usuário
      const aberta = await prisma.sangrias.findFirst({
        where: {
          usuarioId,
          eventoId: eventoId ?? null,
          status: "ABERTA",
        },
      });
      if (aberta) {
        return res
          .status(409)
          .send({ message: "Já existe uma sangria aberta.", id: aberta.id } as any);
      }

      const sangria = await prisma.sangrias.create({
        data: {
          barId,
          usuarioId,
          responsavel,
          dataHora: dataHora ? new Date(dataHora) : new Date(),
          eventoId,
          status: "ABERTA",
        },
      });
      return res.status(201).send({ id: sangria.id });
    }
  );

  // ── Listar sangrias ───────────────────────────────────────────────────────
  app.get(
    "/sangrias",
    {
      schema: {
        description: "Lista sangrias filtradas por evento, usuário e/ou status",
        tags: ["Sangrias"],
        operationId: "listaSangrias",
        security: [{ BearerAuth: [] }],
        querystring: z.object({
          eventoId: z.coerce.number().optional(),
          usuarioId: z.coerce.number().optional(),
          barId: z.coerce.number().optional(),
          status: z.string().optional(),
        }),
        response: { 200: z.array(sangriaResponse) },
      },
    },
    async (req, res) => {
      const { eventoId, usuarioId, barId, status } = req.query;
      const sangrias = await prisma.sangrias.findMany({
        where: {
          ...(eventoId ? { eventoId } : {}),
          ...(usuarioId ? { usuarioId } : {}),
          ...(barId ? { barId } : {}),
          ...(status ? { status } : {}),
        },
        include: { bar: true, usuario: true },
        orderBy: { id: "desc" },
      });
      return res.send(
        sangrias.map((s) => ({
          id: s.id,
          barId: s.barId,
          barNome: s.bar.nome,
          usuarioId: s.usuarioId,
          usuarioNome: s.usuario?.nome ?? null,
          responsavel: s.responsavel,
          dataHora: s.dataHora.toISOString(),
          status: s.status,
          valorTotal: s.valorTotal,
          eventoId: s.eventoId,
        }))
      );
    }
  );

  // ── Buscar sangria por ID ─────────────────────────────────────────────────
  app.get(
    "/sangria/:id",
    {
      schema: {
        description: "Busca uma sangria pelo ID com seus itens",
        tags: ["Sangrias"],
        operationId: "listaSangria",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: sangriaResponse.extend({ itens: z.array(sangriaItemResponse) }),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const sangria = await prisma.sangrias.findUniqueOrThrow({
        where: { id },
        include: { bar: true, usuario: true, itens: { include: { produto: true } } },
      });
      return res.send({
        id: sangria.id,
        barId: sangria.barId,
        barNome: sangria.bar.nome,
        usuarioId: sangria.usuarioId ?? null,
        usuarioNome: sangria.usuario?.nome ?? null,
        responsavel: sangria.responsavel,
        dataHora: sangria.dataHora.toISOString(),
        status: sangria.status,
        valorTotal: sangria.valorTotal,
        eventoId: sangria.eventoId,
        itens: sangria.itens.map((item) => ({
          id: item.id,
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          produtoUnidadeMedida: item.produto.unidadeMedida,
          quantidade: item.quantidade,
        })),
      });
    }
  );

  // ── Registrar contagem e finalizar sangria ────────────────────────────────
  app.post(
    "/sangria/:id/contagem",
    {
      schema: {
        description: "Registra a contagem de fichas e finaliza a sangria",
        tags: ["Sangrias"],
        operationId: "registraContagem",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        body: z.object({
          itens: z.array(
            z.object({
              produtoId: z.number(),
              quantidade: z.number().int().min(0),
            })
          ),
        }),
        response: { 200: z.object({ totalQuantidade: z.number() }) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { itens } = req.body;

      const itensFiltrados = itens.filter((i) => i.quantidade > 0);
      const totalQuantidade = itensFiltrados.reduce((acc, i) => acc + i.quantidade, 0);

      await prisma.sangriaItens.deleteMany({ where: { sangriaId: id } });

      if (itensFiltrados.length > 0) {
        await prisma.sangriaItens.createMany({
          data: itensFiltrados.map((item) => ({
            sangriaId: id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
        });
      }

      await prisma.sangrias.update({
        where: { id },
        data: { status: "FINALIZADA", valorTotal: totalQuantidade },
      });

      return res.send({ totalQuantidade });
    }
  );
};

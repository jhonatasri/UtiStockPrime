import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const devolucaoResponse = z.object({
  id: z.number(),
  barId: z.number(),
  barNome: z.string(),
  usuarioId: z.number().optional().nullable(),
  usuarioNome: z.string().optional().nullable(),
  responsavel: z.string(),
  dataHora: z.string(),
  observacoes: z.string().optional().nullable(),
  totalItens: z.number(),
  eventoId: z.number().optional().nullable(),
});

const devolucaoItemResponse = z.object({
  id: z.number(),
  produtoId: z.number(),
  produtoNome: z.string(),
  produtoUnidadeMedida: z.string(),
  quantidade: z.number(),
});

export const devolucaoController: FastifyPluginAsyncZod = async (app) => {
  // ── Criar devolução ───────────────────────────────────────────────────────
  app.post(
    "/devolucoes",
    {
      schema: {
        description: "Registra uma devolução de produtos de um bar",
        tags: ["Devoluções"],
        operationId: "criaDevolucao",
        security: [{ BearerAuth: [] }],
        body: z.object({
          barId: z.number(),
          usuarioId: z.number().optional(),
          responsavel: z.string(),
          dataHora: z.string().optional(),
          observacoes: z.string().optional(),
          eventoId: z.number().optional(),
          itens: z.array(
            z.object({
              produtoId: z.number(),
              quantidade: z.number().int().min(1),
            })
          ),
        }),
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const { itens, ...data } = req.body;

      const devolucao = await prisma.devolucoes.create({
        data: {
          barId: data.barId,
          usuarioId: data.usuarioId,
          responsavel: data.responsavel,
          dataHora: data.dataHora ? new Date(data.dataHora) : new Date(),
          observacoes: data.observacoes,
          eventoId: data.eventoId,
          itens: {
            createMany: {
              data: itens.map((i) => ({
                produtoId: i.produtoId,
                quantidade: i.quantidade,
              })),
            },
          },
        },
      });

      return res.status(201).send({ id: devolucao.id });
    }
  );

  // ── Listar devoluções ─────────────────────────────────────────────────────
  app.get(
    "/devolucoes",
    {
      schema: {
        description: "Lista devoluções filtradas por evento, usuário e/ou bar",
        tags: ["Devoluções"],
        operationId: "listaDevolu​coes",
        security: [{ BearerAuth: [] }],
        querystring: z.object({
          eventoId: z.coerce.number().optional(),
          usuarioId: z.coerce.number().optional(),
          barId: z.coerce.number().optional(),
        }),
        response: { 200: z.array(devolucaoResponse) },
      },
    },
    async (req, res) => {
      const { eventoId, usuarioId, barId } = req.query;
      const devolucoes = await prisma.devolucoes.findMany({
        where: {
          ...(eventoId ? { eventoId } : {}),
          ...(usuarioId ? { usuarioId } : {}),
          ...(barId ? { barId } : {}),
        },
        include: {
          bar: true,
          usuario: true,
          _count: { select: { itens: true } },
        },
        orderBy: { id: "desc" },
      });

      return res.send(
        devolucoes.map(({ _count, bar, usuario, ...d }) => ({
          id: d.id,
          barId: d.barId,
          barNome: bar.nome,
          usuarioId: d.usuarioId,
          usuarioNome: usuario?.nome ?? null,
          responsavel: d.responsavel,
          dataHora: d.dataHora.toISOString(),
          observacoes: d.observacoes ?? null,
          totalItens: _count.itens,
          eventoId: d.eventoId,
        }))
      );
    }
  );

  // ── Buscar devolução por ID ───────────────────────────────────────────────
  app.get(
    "/devolucao/:id",
    {
      schema: {
        description: "Busca uma devolução pelo ID com seus itens",
        tags: ["Devoluções"],
        operationId: "listaDevolucao",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: devolucaoResponse.extend({ itens: z.array(devolucaoItemResponse) }),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const devolucao = await prisma.devolucoes.findUniqueOrThrow({
        where: { id },
        include: {
          bar: true,
          usuario: true,
          itens: { include: { produto: true } },
          _count: { select: { itens: true } },
        },
      });

      return res.send({
        id: devolucao.id,
        barId: devolucao.barId,
        barNome: devolucao.bar.nome,
        usuarioId: devolucao.usuarioId ?? null,
        usuarioNome: devolucao.usuario?.nome ?? null,
        responsavel: devolucao.responsavel,
        dataHora: devolucao.dataHora.toISOString(),
        observacoes: devolucao.observacoes ?? null,
        totalItens: devolucao._count.itens,
        eventoId: devolucao.eventoId,
        itens: devolucao.itens.map((item) => ({
          id: item.id,
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          produtoUnidadeMedida: item.produto.unidadeMedida,
          quantidade: item.quantidade,
        })),
      });
    }
  );
};

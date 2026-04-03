import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const saidaItemBody = z.object({
  produtoId: z.number(),
  barId: z.number(),
  quantidade: z.number().int().min(1),
  motivo: z.string().optional(),
  localizacao: z.string().optional(),
});

const saidaBody = z.object({
  dataHora: z.string().optional(),
  tipoSaida: z.string(),
  numeroDocumento: z.string().optional(),
  observacoes: z.string().optional(),
  eventoId: z.number().optional(),
  itens: z.array(saidaItemBody).min(1),
});

const saidaItemResponse = z.object({
  id: z.number(),
  produtoId: z.number(),
  produtoNome: z.string(),
  produtoCodigo: z.string(),
  produtoCategoria: z.string(),
  produtoUnidadeMedida: z.string(),
  barId: z.number(),
  barNome: z.string(),
  quantidade: z.number(),
  motivo: z.string().optional().nullable(),
  localizacao: z.string().optional().nullable(),
});

const saidaResponse = z.object({
  id: z.number(),
  dataHora: z.string(),
  tipoSaida: z.string(),
  numeroDocumento: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  eventoId: z.number().optional().nullable(),
  totalItens: z.number(),
  totalQuantidade: z.number(),
});

export const saidaController: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/saidas",
    {
      schema: {
        description: "Registra uma saída de produtos do estoque",
        tags: ["Saidas"],
        operationId: "criaSaida",
        security: [{ BearerAuth: [] }],
        body: saidaBody,
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const { itens, dataHora, ...dadosSaida } = req.body;

      const saida = await prisma.saidas.create({
        data: {
          ...dadosSaida,
          dataHora: dataHora ? new Date(dataHora) : new Date(),
          itens: {
            create: itens.map((item) => ({
              produtoId: item.produtoId,
              barId: item.barId,
              quantidade: item.quantidade,
              motivo: item.motivo,
              localizacao: item.localizacao,
            })),
          },
        },
      });

      return res.status(201).send({ id: saida.id });
    }
  );

  app.get(
    "/saidas",
    {
      schema: {
        description: "Lista todas as saídas",
        tags: ["Saidas"],
        operationId: "listaSaidas",
        security: [{ BearerAuth: [] }],
        querystring: z.object({ eventoId: z.coerce.number().optional() }),
        response: { 200: z.array(saidaResponse) },
      },
    },
    async (req, res) => {
      const { eventoId } = req.query;

      const saidas = await prisma.saidas.findMany({
        where: eventoId ? { eventoId } : undefined,
        include: { itens: true },
        orderBy: { id: "desc" },
      });

      return res.send(
        saidas.map((s) => ({
          id: s.id,
          dataHora: s.dataHora.toISOString(),
          tipoSaida: s.tipoSaida,
          numeroDocumento: s.numeroDocumento,
          observacoes: s.observacoes,
          eventoId: s.eventoId,
          totalItens: s.itens.length,
          totalQuantidade: s.itens.reduce((acc, i) => acc + i.quantidade, 0),
        }))
      );
    }
  );

  app.get(
    "/saida/:id",
    {
      schema: {
        description: "Busca uma saída pelo ID com todos os itens",
        tags: ["Saidas"],
        operationId: "listaSaida",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: saidaResponse.extend({ itens: z.array(saidaItemResponse) }),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      const saida = await prisma.saidas.findUniqueOrThrow({
        where: { id },
        include: {
          itens: { include: { produto: true, bar: true } },
        },
      });

      return res.send({
        id: saida.id,
        dataHora: saida.dataHora.toISOString(),
        tipoSaida: saida.tipoSaida,
        numeroDocumento: saida.numeroDocumento,
        observacoes: saida.observacoes,
        eventoId: saida.eventoId,
        totalItens: saida.itens.length,
        totalQuantidade: saida.itens.reduce((acc, i) => acc + i.quantidade, 0),
        itens: saida.itens.map((item) => ({
          id: item.id,
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          produtoCodigo: item.produto.codigo,
          produtoCategoria: item.produto.categoria,
          produtoUnidadeMedida: item.produto.unidadeMedida,
          barId: item.barId,
          barNome: item.bar.nome,
          quantidade: item.quantidade,
          motivo: item.motivo,
          localizacao: item.localizacao,
        })),
      });
    }
  );
};

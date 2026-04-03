import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";

const entradaItemBody = z.object({
  produtoId: z.number(),
  barId: z.number(),
  loteSerie: z.string().optional(),
  validade: z.string().optional(), // ISO date string
  quantidade: z.number().int().min(1),
  precoVenda: z.number().min(0),
  localizacao: z.string().optional(),
});

const entradaBody = z.object({
  dataHora: z.string().optional(), // ISO datetime string
  tipoEntrada: z.string(),
  numeroDocumento: z.string().optional(),
  fornecedor: z.string().optional(),
  observacoes: z.string().optional(),
  eventoId: z.number().optional(),
  itens: z.array(entradaItemBody).min(1),
});

const entradaItemResponse = z.object({
  id: z.number(),
  produtoId: z.number(),
  produtoNome: z.string(),
  produtoCodigo: z.string(),
  produtoCategoria: z.string(),
  produtoUnidadeMedida: z.string(),
  barId: z.number(),
  barNome: z.string(),
  loteSerie: z.string().optional().nullable(),
  validade: z.string().optional().nullable(),
  quantidade: z.number(),
  precoVenda: z.number(),
  localizacao: z.string().optional().nullable(),
});

const entradaResponse = z.object({
  id: z.number(),
  dataHora: z.string(),
  tipoEntrada: z.string(),
  numeroDocumento: z.string().optional().nullable(),
  fornecedor: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  eventoId: z.number().optional().nullable(),
  totalItens: z.number(),
  totalQuantidade: z.number(),
  valorTotal: z.number(),
});

export const entradaController: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/entradas",
    {
      schema: {
        description: "Registra uma entrada de produtos no estoque",
        tags: ["Entradas"],
        operationId: "criaEntrada",
        security: [{ BearerAuth: [] }],
        body: entradaBody,
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const { itens, dataHora, ...dadosEntrada } = req.body;

      const entrada = await prisma.entradas.create({
        data: {
          ...dadosEntrada,
          dataHora: dataHora ? new Date(dataHora) : new Date(),
          itens: {
            create: itens.map((item) => ({
              produtoId: item.produtoId,
              barId: item.barId,
              loteSerie: item.loteSerie,
              validade: item.validade ? new Date(item.validade) : null,
              quantidade: item.quantidade,
              precoVenda: item.precoVenda,
              localizacao: item.localizacao,
            })),
          },
        },
      });

      return res.status(201).send({ id: entrada.id });
    }
  );

  app.get(
    "/entradas",
    {
      schema: {
        description: "Lista todas as entradas",
        tags: ["Entradas"],
        operationId: "listaEntradas",
        security: [{ BearerAuth: [] }],
        querystring: z.object({ eventoId: z.coerce.number().optional() }),
        response: { 200: z.array(entradaResponse) },
      },
    },
    async (req, res) => {
      const { eventoId } = req.query;

      const entradas = await prisma.entradas.findMany({
        where: eventoId ? { eventoId } : undefined,
        include: {
          itens: true,
        },
        orderBy: { id: "desc" },
      });

      return res.send(
        entradas.map((e) => ({
          id: e.id,
          dataHora: e.dataHora.toISOString(),
          tipoEntrada: e.tipoEntrada,
          numeroDocumento: e.numeroDocumento,
          fornecedor: e.fornecedor,
          observacoes: e.observacoes,
          eventoId: e.eventoId,
          totalItens: e.itens.length,
          totalQuantidade: e.itens.reduce((acc, i) => acc + i.quantidade, 0),
          valorTotal: e.itens.reduce((acc, i) => acc + i.quantidade * i.precoVenda, 0),
        }))
      );
    }
  );

  app.get(
    "/entrada/:id",
    {
      schema: {
        description: "Busca uma entrada pelo ID com todos os itens",
        tags: ["Entradas"],
        operationId: "listaEntrada",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: {
          200: entradaResponse.extend({
            itens: z.array(entradaItemResponse),
          }),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      const entrada = await prisma.entradas.findUniqueOrThrow({
        where: { id },
        include: {
          itens: {
            include: {
              produto: true,
              bar: true,
            },
          },
        },
      });

      return res.send({
        id: entrada.id,
        dataHora: entrada.dataHora.toISOString(),
        tipoEntrada: entrada.tipoEntrada,
        numeroDocumento: entrada.numeroDocumento,
        fornecedor: entrada.fornecedor,
        observacoes: entrada.observacoes,
        eventoId: entrada.eventoId,
        totalItens: entrada.itens.length,
        totalQuantidade: entrada.itens.reduce((acc, i) => acc + i.quantidade, 0),
        valorTotal: entrada.itens.reduce((acc, i) => acc + i.quantidade * i.precoVenda, 0),
        itens: entrada.itens.map((item) => ({
          id: item.id,
          produtoId: item.produtoId,
          produtoNome: item.produto.nome,
          produtoCodigo: item.produto.codigo,
          produtoCategoria: item.produto.categoria,
          produtoUnidadeMedida: item.produto.unidadeMedida,
          barId: item.barId,
          barNome: item.bar.nome,
          loteSerie: item.loteSerie,
          validade: item.validade ? item.validade.toISOString() : null,
          quantidade: item.quantidade,
          precoVenda: item.precoVenda,
          localizacao: item.localizacao,
        })),
      });
    }
  );
};

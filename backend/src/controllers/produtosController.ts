import { z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";
import {
  TipoArmazenamento,
  TipoConsumo,
  TipoConsumoDetalhe,
} from "../generated/prisma/enums";

const produtoResponse = z.object({
  id: z.number(),
  codigo: z.string(),
  nome: z.string(),
  categoria: z.string(),
  marca: z.string(),
  modelo: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  unidadeMedida: z.string(),
  quantidadeMinima: z.number(),
  ativo: z.boolean(),
  tipoArmazenamento: z.enum(Object.values(TipoArmazenamento) as [string, ...string[]]),
  tipoConsumo: z.enum(Object.values(TipoConsumo) as [string, ...string[]]),
  tipoConsumoDetalhe: z.enum(Object.values(TipoConsumoDetalhe) as [string, ...string[]]),
  volumePorUnidade: z.number().optional().nullable(),
  mlPorDose: z.number().optional().nullable(),
  dosesPorUnidade: z.number().optional().nullable(),
  eventoId: z.number().optional().nullable(),
});

const produtoBody = z.object({
  codigo: z.string(),
  nome: z.string(),
  categoria: z.string(),
  marca: z.string(),
  modelo: z.string().optional(),
  descricao: z.string().optional(),
  unidadeMedida: z.string(),
  quantidadeMinima: z.number().int().min(0),
  ativo: z.boolean().optional().default(true),
  tipoArmazenamento: z.enum(Object.values(TipoArmazenamento) as [string, ...string[]]),
  tipoConsumo: z.enum(Object.values(TipoConsumo) as [string, ...string[]]),
  tipoConsumoDetalhe: z.enum(Object.values(TipoConsumoDetalhe) as [string, ...string[]]),
  volumePorUnidade: z.number().optional(),
  mlPorDose: z.number().optional(),
  dosesPorUnidade: z.number().optional(),
  eventoId: z.number().optional(),
});

export const produtosController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/produtos",
    {
      schema: {
        description: "Lista todos os produtos do sistema",
        tags: ["Produtos"],
        operationId: "listaProdutos",
        security: [{ BearerAuth: [] }],
        querystring: z.object({ eventoId: z.coerce.number().optional() }),
        response: { 200: z.array(produtoResponse) },
      },
    },
    async (req, res) => {
      const { eventoId } = req.query;
      const produtos = await prisma.produtos.findMany({
        where: eventoId ? { eventoId } : undefined,
        orderBy: { id: "asc" },
      });
      return res.send(produtos);
    }
  );

  app.post(
    "/produtos",
    {
      schema: {
        description: "Cadastra um produto no sistema",
        tags: ["Produtos"],
        operationId: "criaProduto",
        security: [{ BearerAuth: [] }],
        body: produtoBody,
        response: { 201: z.object({ id: z.number() }) },
      },
    },
    async (req, res) => {
      const produto = await prisma.produtos.create({ data: req.body as any });
      return res.status(201).send({ id: produto.id });
    }
  );

  app.get(
    "/produto/:id",
    {
      schema: {
        description: "Busca um produto pelo ID",
        tags: ["Produtos"],
        operationId: "listaProduto",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: { 200: produtoResponse },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const produto = await prisma.produtos.findUniqueOrThrow({ where: { id } });
      return res.send(produto);
    }
  );

  app.put(
    "/produto/:id",
    {
      schema: {
        description: "Atualiza os dados de um produto",
        tags: ["Produtos"],
        operationId: "alteraProduto",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        body: produtoBody,
        response: { 200: z.object({}) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      await prisma.produtos.update({ where: { id }, data: req.body as any });
      return res.status(200).send({});
    }
  );

  app.patch(
    "/produto/:id/status",
    {
      schema: {
        description: "Ativa ou inativa um produto",
        tags: ["Produtos"],
        operationId: "alteraStatusProduto",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        body: z.object({ ativo: z.boolean() }),
        response: { 200: z.object({}) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { ativo } = req.body;
      await prisma.produtos.update({ where: { id }, data: { ativo } });
      return res.status(200).send({});
    }
  );

  app.delete(
    "/produto/:id",
    {
      schema: {
        description: "Remove um produto do sistema",
        tags: ["Produtos"],
        operationId: "removeProduto",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.coerce.number() }),
        response: { 204: z.object({}) },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      await prisma.produtos.delete({ where: { id } });
      return res.status(204).send({});
    }
  );
};

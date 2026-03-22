import { number, z } from "zod";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { prisma } from "../connection/prisma";
import { FuncaoTypes } from "../generated/prisma/enums";

export const usuariosController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/usuarios",
    {
      schema: {
        description: "Busca todos os usuários do sistema",
        tags: ["Usuários"],
        operationId: "listaUsuarios",
        security: [{ BearerAuth: [] }],
        response: {
          200: z.array(
            z.object({
              id: z.number(),
              nome: z.string(),
              email: z.string(),
              ativo: z.boolean(),
              telefone: z.string(),
              funcao: z.any(),
              descricao: z.string().optional().nullable(),
            })
          ),
        },
      },
    },
    async (req, res) => {
      const usuarios = await prisma.usuarios.findMany({
        orderBy: {
          id: "asc",
        },
      });

      return res.send(usuarios);
    }
  );
  app.post(
    "/usuarios",
    {
      schema: {
        description: "Cria um usuário para o sistema",
        tags: ["Usuários"],
        operationId: "criaUsuario",
        security: [{ BearerAuth: [] }],
        body: z.object({
          nome: z.string(),
          email: z.email(),
          telefone: z.string(),
          senha: z.string(),
          funcao: z.enum(FuncaoTypes),
          descricao: z.string().optional(),
        }),
        response: {
          201: z.object({}),
        },
      },
    },
    async (req, res) => {
      const { descricao, email, funcao, nome, senha, telefone } = req.body;

      const password = await app.bcrypt.hash(senha);

      const data = {
        descricao,
        email,
        funcao,
        nome,
        senha: password,
        telefone,
      };

      await prisma.usuarios.create({
        data,
      });

      return res.status(201).send({});
    }
  );
  app.put(
    "/usuario/:id",
    {
      schema: {
        description: "Altera os dados de um usuário (exceto senha)",
        tags: ["Usuários"],
        operationId: "alteraUsuario",
        security: [{ BearerAuth: [] }],
        params: z.object({
          id: z.coerce.number(),
        }),
        body: z.object({
          nome: z.string(),
          email: z.email(),
          telefone: z.string(),
          funcao: z.enum(FuncaoTypes),
          ativo: z.boolean(),
          descricao: z.string().optional(),
        }),
        response: {
          200: z.object({}),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;
      const { nome, email, telefone, funcao, ativo, descricao } = req.body;

      await prisma.usuarios.update({
        where: { id },
        data: { nome, email, telefone, funcao, ativo, descricao },
      });

      return res.status(204).send({});
    }
  );

  app.get(
    "/usuario/:id",
    {
      schema: {
        description: "Busca um usuário no sistema",
        tags: ["Usuários"],
        operationId: "listaUsuario",
        security: [{ BearerAuth: [] }],
        params: z.object({
          id: z.coerce.number(),
        }),

        response: {
          200: z.object({
            id: z.number(),
            nome: z.string(),
            email: z.string(),
            ativo: z.boolean(),
            telefone: z.string(),
            funcao: z.any(),
            descricao: z.string().optional().nullable(),
          }),
        },
      },
    },
    async (req, res) => {
      const { id } = req.params;

      const usuario = await prisma.usuarios.findUniqueOrThrow({
        where: {
          id,
        },
      });

      return res.send(usuario);
    }
  );
};

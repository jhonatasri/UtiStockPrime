'use client'

import Image from "next/image";
import LoginImage from "@/public/LoginImage.jpg";
import LoginImageVertical from "@/public/LogoVertical.svg";
import LogoUtivirtual from "@/public/LogoUtivirtual.png";
import Logo from "@/public/logoLogin.svg";

import { FiBox, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

import { motion } from "framer-motion";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../providers/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const Router = useRouter()

  const { signIn, isAuthenticated } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      Router.replace('/dashboard')
    }
  }, [isAuthenticated])


  const formSchema = z.object({
    email: z.email("Endereço de e-mail inválido"),
    senha: z.string().min(6, "A senha deve conter no mínimo 6 caracteres."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await signIn(data)
  }

  return (
    <section className="
      min-h-screen w-screen text-gray relative bg-[#F5F7FA]
      overflow-hidden
      flex flex-col lg:flex-row
    ">

      {/* ================= LADO ESQUERDO (IGUAL AO ORIGINAL) ================= */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="
          flex min-h-screen w-full lg:w-1/2
          items-center justify-center
          px-4 lg:px-0
        "
      >
        <section className="
          w-full max-w-105 lg:w-104.75
          flex justify-center items-center gap-8 flex-col
          shadow-xl rounded-lg p-5 bg-white
        ">

          <header className="w-full flex justify-center items-center">
            <Image
              src={LoginImageVertical}
              alt="Login"
              width={200}
              height={200}
              priority
            />
          </header>

          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-semibold">Bem-vindo</h1>
            <span className="text-[14px]">
              Entre com suas credenciais para acessar o sistema
            </span>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <FieldGroup>

              {/* EMAIL */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field >
                    <FieldLabel>E-mail</FieldLabel>
                    <div className="flex items-center gap-3 w-full rounded-md border border-gray-300 px-4 py-1 bg-gray-50 focus-within:ring-0 focus-within:outline-none focus-within:shadow-none" >
                      <FiMail size={20} className="text-gray-400" />
                      <Input
                        {...field}
                        placeholder="seu@email.com"
                        className="border-0
      focus:border-0
      focus:outline-none
      focus:ring-0
      focus-visible:ring-0
      focus-visible:outline-none
      shadow-none
      bg-transparent
      px-0"
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* SENHA */}
              <Controller
                name="senha"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field >
                    <FieldLabel>Senha</FieldLabel>
                    <div className="flex items-center gap-3 w-full rounded-md border border-gray-300 px-5 py-1 bg-gray-50">
                      <FiLock size={20} className="text-gray-400" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Informe sua senha"
                        className="border-0
      focus:border-0
      focus:outline-none
      focus:ring-0
      focus-visible:ring-0
      focus-visible:outline-none
      shadow-none
      bg-transparent
      px-0"
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="text-[#737373] cursor-pointer">
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

            </FieldGroup>

            <footer className="mt-5 w-full flex items-end justify-end flex-col">
              <Link href="">Esqueci minha senha</Link>

              <br />

              <div className="w-full flex items-center justify-center">
                <Button className="min-w-89 h-10 bg-gray text-white cursor-pointer">
                  Entrar
                </Button>
              </div>
            </footer>
          </form>

          <footer className="w-full flex items-center justify-center py-6">
            <div className="
              w-full max-w-4xl
              flex flex-col sm:flex-row
              items-center justify-between
              px-4 gap-4
            ">
              <div className="flex flex-col gap-3 text-gray-600 items-center sm:items-start">
                <hr className="w-64 border-gray-200" />
                <div className="text-[12px] text-center sm:text-left flex flex-col justify-center items-center">
                  <span className="text-center">Sistema de Gestão de Estoque</span>
                  <span>Versão 1.0.0</span>


                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-linear-to-br from-gray/20 via-gray/10 p-4">
                  <Image
                    src={LogoUtivirtual}
                    alt="UTI Virtual"
                    width={90}
                    height={90}
                  />
                </div>
              </div>
            </div>
          </footer>

        </section>
      </motion.div>

      {/* ================= LADO DIREITO (INALTERADO / DESKTOP ONLY) ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="
          hidden lg:block
          fixed right-0 top-0
          h-screen w-1/2
          relative overflow-hidden
          rounded-tl-4xl rounded-bl-4xl
        "
      >
        <div className="absolute inset-0 bg-slate-900/70 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-slate-900/10 z-20" />

        <Image
          src={LoginImage}
          alt="Login"
          fill
          className="object-cover"
          priority
        />

        <div className="relative z-30 flex flex-col items-center justify-center h-full px-10 text-white">

          <div className="mb-12 flex items-center justify-center rounded-full bg-white p-8 shadow-xl">
            <Image src={Logo} alt="Login" width={200} height={200} />
          </div>

          <div className="w-full max-w-xl rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 space-y-6">
            {[
              "Controle Total",
              "Rastreabilidade Completa",
              "Inteligência de Dados",
            ].map((title) => (
              <div key={title}>
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-300">
                  <FiBox /> {title}
                </h3>
                <p className="text-sm text-white/80">
                  Gerencie produtos, entradas, saídas e análises em uma única plataforma
                </p>
              </div>
            ))}
          </div>

        </div>
      </motion.div>

    </section>
  );
}

import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { c as cn, B as Button } from "./button-CjC9Szlf.js";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent, e as CardFooter } from "./card-BL80elSP.js";
import { KeyRound, Github, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "clsx";
import "tailwind-merge";
function createClient() {
  return createBrowserClient(
    "https://txlbvdvadbakhprxxqqy.supabase.co",
    "sb_publishable_HeEw4V9bKrd6KwegxbwAMQ_AdhbIvGu"
  );
}
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;
function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const supabase = createClient();
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("¡Bienvenido de nuevo!");
      } else {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu email para confirmar.");
      }
      navigate({
        to: "/"
      });
    } catch (error) {
      toast.error(error.message || "Error en la autenticación");
    } finally {
      setIsLoading(false);
    }
  };
  const handleOAuth = async (provider) => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20", children: /* @__PURE__ */ jsx(KeyRound, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsx("h2", { className: "mt-6 font-heading text-3xl font-bold tracking-tight text-foreground", children: isLogin ? "Inicia sesión en mkt.notes" : "Crea tu cuenta gratuita" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        isLogin ? "¿Aún no tienes cuenta?" : "¿Ya eres miembro?",
        /* @__PURE__ */ jsx("button", { onClick: () => setIsLogin(!isLogin), className: "ml-1 font-semibold text-primary hover:underline transition-all", children: isLogin ? "Regístrate aquí" : "Inicia sesión" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-border/50 bg-card/50 backdrop-blur-xl shadow-xl", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl", children: "Acceso rápido" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Usa tu cuenta favorita para continuar" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "h-11", onClick: () => handleOAuth("github"), children: [
            /* @__PURE__ */ jsx(Github, { className: "mr-2 h-4 w-4" }),
            "GitHub"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "h-11", children: [
            /* @__PURE__ */ jsxs("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
              /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
              /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" }),
              /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" })
            ] }),
            "Google"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-border" }) }),
          /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "O continúa con email" }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleAuth, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "email", type: "email", placeholder: "nombre@ejemplo.com", className: "pl-10 h-11", value: email, onChange: (e) => setEmail(e.target.value), required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Contraseña" }),
              /* @__PURE__ */ jsx("button", { type: "button", className: "text-xs text-primary hover:underline", children: "¿Olvidaste tu contraseña?" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(KeyRound, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(Input, { id: "password", type: "password", className: "pl-10 h-11", value: password, onChange: (e) => setPassword(e.target.value), required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-11 font-bold shadow-lg shadow-primary/20", disabled: isLoading, children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            isLogin ? "Entrar" : "Crear cuenta",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs("p", { className: "text-center text-[10px] text-muted-foreground w-full px-4", children: [
        "Al continuar, aceptas nuestros ",
        /* @__PURE__ */ jsx(Link, { to: "/", className: "underline", children: "Términos de Servicio" }),
        " y ",
        /* @__PURE__ */ jsx(Link, { to: "/", className: "underline", children: "Política de Privacidad" }),
        "."
      ] }) })
    ] })
  ] }) });
}
export {
  LoginPage as component
};

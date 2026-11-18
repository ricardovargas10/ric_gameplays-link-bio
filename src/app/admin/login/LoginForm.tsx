"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";
import { SubmitButton } from "../ui";
import { Alert, inputClass as input } from "../fields";
import { btnPrimary } from "../styles";


export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-4" noValidate>
      {state.error ? <Alert kind="error">{state.error}</Alert> : null}
      <label className="block text-[14.5px] font-semibold">
        Usuário
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={100}
          className={input}
        />
      </label>
      <label className="block text-[14.5px] font-semibold">
        Senha
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={input}
        />
      </label>
      <SubmitButton
        pendingText="Entrando…"
        className={`${btnPrimary} mt-1 w-full`}
      >
        Entrar
      </SubmitButton>
    </form>
  );
}

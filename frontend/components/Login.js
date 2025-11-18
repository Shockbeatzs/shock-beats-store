import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${process.env.REACT_APP_API}/${isRegister ? "register" : "login"}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } else {
      alert(data.message || "Erro no login/registro");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>{isRegister ? "Registrar" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px", marginBottom: 8 }}>
          {isRegister ? "Registrar" : "Login"}
        </button>
      </form>
      <button
        onClick={() => setIsRegister(!isRegister)}
        style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
      >
        {isRegister ? "Já tem conta? Login" : "Não tem conta? Registrar"}
      </button>
    </div>
  );
}

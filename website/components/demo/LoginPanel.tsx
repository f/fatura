import type { EnvironmentKey } from "fatura";

interface LoginPanelProps {
  env: EnvironmentKey;
  userName: string;
  password: string;
  token: string | null;
  loading: boolean;
  onEnvChange: (env: EnvironmentKey) => void;
  onUserNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function LoginPanel({
  env,
  userName,
  password,
  token,
  loading,
  onEnvChange,
  onUserNameChange,
  onPasswordChange,
  onLogin,
  onLogout,
}: LoginPanelProps) {
  return (
    <section className="section-block" style={{ display: "grid", gap: "0.8rem" }}>
      <h2 className="section-title" style={{ fontSize: "1.35rem" }}>
        GİB girişi
      </h2>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className={env === "TEST" ? "btn-primary" : "btn-ghost"}
          onClick={() => onEnvChange("TEST")}
        >
          TEST ortamı
        </button>
        <button
          type="button"
          className={env === "PROD" ? "btn-primary" : "btn-ghost"}
          onClick={() => onEnvChange("PROD")}
        >
          PROD ortamı
        </button>
      </div>

      <label>
        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
          Kullanıcı kodu
        </div>
        <input
          className="field"
          value={userName}
          onChange={(event) => onUserNameChange(event.target.value)}
          placeholder="Örn. VKN/TCKN kullanıcı kodu"
        />
      </label>

      <label>
        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
          Parola
        </div>
        <input
          className="field"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="GİB portal parolası"
        />
      </label>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button className="btn-primary" type="button" onClick={onLogin} disabled={loading}>
          Giriş yap
        </button>
        <button className="btn-ghost" type="button" onClick={onLogout} disabled={loading || !token}>
          Çıkış yap
        </button>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "0.65rem 0.8rem",
          background: "rgba(16,20,18,0.85)",
        }}
      >
        <p className="text-muted">Token Durumu</p>
        <p style={{ marginTop: "0.3rem", fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}>
          {token ? token.slice(0, 14) + "..." : "Henüz token alınmadı"}
        </p>
      </div>
    </section>
  );
}

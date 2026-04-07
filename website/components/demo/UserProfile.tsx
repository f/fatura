import type { UserData } from "fatura";

interface UserProfileProps {
  token: string | null;
  loading: boolean;
  userData: UserData | null;
  onFetch: () => Promise<void>;
  onSave: () => Promise<void>;
  onChange: (next: UserData) => void;
}

export function UserProfile({
  token,
  loading,
  userData,
  onFetch,
  onSave,
  onChange,
}: UserProfileProps) {
  if (token === null) {
    return (
      <section className="section-block">
        <p className="text-muted">Profil işlemleri için önce giriş yapmalısınız.</p>
      </section>
    );
  }

  return (
    <section className="section-block" style={{ display: "grid", gap: "0.8rem" }}>
      <h2 className="section-title" style={{ fontSize: "1.3rem" }}>
        Profilim
      </h2>

      {userData === null ? (
        <button className="btn-primary" type="button" onClick={onFetch} disabled={loading}>
          Profil bilgilerimi getir
        </button>
      ) : (
        <>
          <div style={{ display: "grid", gap: "0.55rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <label>
              <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                VKN/TCKN
              </div>
              <input
                className="field"
                value={userData.taxIDOrTRID}
                onChange={(event) =>
                  onChange({ ...userData, taxIDOrTRID: event.target.value })
                }
              />
            </label>
            <label>
              <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                Ünvan
              </div>
              <input
                className="field"
                value={userData.title}
                onChange={(event) => onChange({ ...userData, title: event.target.value })}
              />
            </label>
            <label>
              <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                Ad
              </div>
              <input
                className="field"
                value={userData.name}
                onChange={(event) => onChange({ ...userData, name: event.target.value })}
              />
            </label>
            <label>
              <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                Soyad
              </div>
              <input
                className="field"
                value={userData.surname}
                onChange={(event) => onChange({ ...userData, surname: event.target.value })}
              />
            </label>
            <label>
              <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                E-Posta
              </div>
              <input
                className="field"
                value={userData.email ?? ""}
                onChange={(event) => onChange({ ...userData, email: event.target.value })}
              />
            </label>
            <label>
              <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                Telefon
              </div>
              <input
                className="field"
                value={userData.phoneNumber ?? ""}
                onChange={(event) => onChange({ ...userData, phoneNumber: event.target.value })}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn-ghost" type="button" onClick={onFetch} disabled={loading}>
              Yeniden yükle
            </button>
            <button className="btn-primary" type="button" onClick={onSave} disabled={loading}>
              Güncelle
            </button>
          </div>
        </>
      )}
    </section>
  );
}

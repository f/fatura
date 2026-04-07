export function SecurityWarning() {
  return (
    <section
      className="section-block"
      style={{ borderColor: "rgba(239,68,68,0.45)", background: "rgba(56, 12, 12, 0.75)" }}
    >
      <p style={{ color: "#fecaca", fontWeight: 700 }}>
        Bu demo gerçek kimlik bilgileriyle çalışabilir.
      </p>
      <p style={{ color: "#fca5a5", marginTop: "0.45rem" }}>
        Kimlik bilgileriniz GİB’e ulaşmak için sunucu üzerinden geçici bir vekil (proxy) ile iletilir.
        Bu veriler kaydedilmez, günlüklenmez ve kalıcı olarak saklanmaz.
      </p>
      <a
        href="https://github.com/f/fatura"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#fecaca", textDecoration: "underline", marginTop: "0.5rem", display: "inline-block" }}
      >
        Kaynak kodunu GitHub üzerinden inceleyin
      </a>
    </section>
  );
}

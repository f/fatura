import Link from "next/link";

export function HeroSection() {
    return (
        <section className="section-block page-enter" style={{ padding: "2.1rem" }}>
            <p className="text-muted" style={{ marginBottom: "0.8rem", letterSpacing: "0.08em" }}>
                GİB e-Arşiv otomasyonu
            </p>
            <h1 className="section-title" style={{ fontSize: "clamp(2rem, 6vw, 4rem)", maxWidth: 860 }}>
                fatura.js ile GİB e-Arşiv işlemlerini tek API katmanından yönetin.
            </h1>
            <p
                className="text-muted"
                style={{
                    marginTop: "1rem",
                    maxWidth: 780,
                    fontSize: "1.08rem",
                }}
            >
                Türkçe dokümantasyonla API’yi adım adım anlatıyoruz; canlı demoda ise aynı kütüphaneyi kullanarak GİB
                e-Arşiv’e gerçek istek atıp akışı deneyebilirsiniz.
            </p>

            <div
                style={{
                    display: "flex",
                    gap: "0.7rem",
                    marginTop: "1.4rem",
                    flexWrap: "wrap",
                }}
            >
                <Link className="btn-primary" href="/dokumantasyon">
                    Dokümantasyona git
                </Link>
                <Link className="btn-ghost" href="/demo">
                    Canlı demoyu aç
                </Link>
            </div>
        </section>
    );
}

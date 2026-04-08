import { FilePlus2, Signature, SearchCheck, Download, Braces, FlaskConical } from "lucide-react";

const features = [
    {
        icon: FilePlus2,
        title: "Fatura oluşturma",
        desc: "Taslak oluştur, bul, imzala veya iptal et. Tüm akışı tek istemciyle yönetin.",
    },
    {
        icon: Signature,
        title: "İmzalama",
        desc: "Taslakları GİB tarafında imzalayarak mali kayıt oluşturma adımlarını yürütün.",
    },
    {
        icon: SearchCheck,
        title: "Sorgulama",
        desc: "Seçtiğiniz tarih aralığında giden ve gelen faturaları ayrı ayrı listeleyin.",
    },
    {
        icon: Download,
        title: "İndirme ve HTML",
        desc: "İmzalı faturalar için ZIP indirme bağlantısı veya HTML çıktısı alın.",
    },
    {
        icon: Braces,
        title: "TypeScript tip güvenliği",
        desc: "InvoiceDetails, UserData gibi tiplerle düzenleyici desteği ve daha güvenli geliştirme.",
    },
    {
        icon: FlaskConical,
        title: "Test modu",
        desc: "PROD / TEST seçimiyle akışları önce test ortamında doğrulayın.",
    },
] as const;

export function FeaturesGrid() {
    return (
        <section style={{ marginTop: "1rem" }}>
            <div
                style={{
                    display: "grid",
                    gap: "0.8rem",
                    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                }}
            >
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <article
                            key={feature.title}
                            className="section-block page-enter"
                            style={{ animationDelay: `${120 + idx * 60}ms` }}
                        >
                            <Icon size={20} color="var(--accent-soft)" />
                            <h3 style={{ marginTop: "0.9rem", fontWeight: 700 }}>{feature.title}</h3>
                            <p className="text-muted" style={{ marginTop: "0.45rem" }}>
                                {feature.desc}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

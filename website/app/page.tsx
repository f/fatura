import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickStartSection } from "@/components/home/QuickStartSection";

const alternatives = [
    {
        language: "PHP",
        repo: "https://github.com/AdemAliDurmus/fatura",
        maintainer: "Adem Ali Durmus",
    },
    {
        language: "PHP",
        repo: "https://github.com/furkankadioglu/efatura",
        maintainer: "Furkan Kadioglu",
    },
    {
        language: "PHP",
        repo: "https://github.com/mlevent/fatura",
        maintainer: "Mert Levent",
    },
    {
        language: "C#",
        repo: "https://github.com/BFYDigital/e-arsiv-fatura-dotnet",
        maintainer: "BFY Digital",
    },
] as const;

export default async function HomePage() {
    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            <HeroSection />

            <section
                className="section-block"
                style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(48, 12, 12, 0.75)" }}
            >
                <p style={{ color: "#fecaca", fontWeight: 700 }}>Mali veri uyarısı</p>
                <p style={{ color: "#fca5a5", marginTop: "0.4rem" }}>
                    Bu kütüphane ile imzalanan faturalar resmî mali kayıt oluşturur. Canlı (üretim) hesabında işlem
                    yapmadan önce TEST ortamında akışı doğrulayın.
                </p>
            </section>

            <FeaturesGrid />
            <QuickStartSection />

            <section className="section-block" style={{ marginTop: "0.2rem" }}>
                <h2 className="section-title" style={{ fontSize: "1.4rem", marginBottom: "0.8rem" }}>
                    Alternatif açık kaynak çözümler
                </h2>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                                <th style={{ padding: "0.7rem", borderBottom: "1px solid var(--line)" }}>Dil</th>
                                <th style={{ padding: "0.7rem", borderBottom: "1px solid var(--line)" }}>Repo</th>
                                <th style={{ padding: "0.7rem", borderBottom: "1px solid var(--line)" }}>
                                    Geliştirici
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {alternatives.map((alt) => (
                                <tr key={`${alt.language}-${alt.repo}`}>
                                    <td style={{ padding: "0.7rem", borderBottom: "1px solid rgba(42,52,65,0.4)" }}>
                                        {alt.language}
                                    </td>
                                    <td style={{ padding: "0.7rem", borderBottom: "1px solid rgba(42,52,65,0.4)" }}>
                                        <a
                                            href={alt.repo}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: "var(--accent-soft)" }}
                                        >
                                            {alt.repo}
                                        </a>
                                    </td>
                                    <td style={{ padding: "0.7rem", borderBottom: "1px solid rgba(42,52,65,0.4)" }}>
                                        {alt.maintainer}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

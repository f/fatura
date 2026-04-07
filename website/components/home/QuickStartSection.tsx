import { CodeBlock } from "@/components/docs/CodeBlock";

const quickStart = `npm install fatura\n\nimport { createFaturaClient } from "fatura"\n\nconst client = createFaturaClient("TEST")\n\nconst token = await client.getToken("KULLANICI_KODU", "PAROLA")\n\nconst draft = await client.createDraftInvoice(token, {
  date: "07/04/2026",
  time: "10:00:00",
  taxIDOrTRID: "11111111111",
  title: "ÖRNEK TİCARET LTD",
  items: [{ name: "Danışmanlık", quantity: 1, unitPrice: 1000, price: 1000, VATRate: 20, VATAmount: 200 }],
  grandTotal: 1000,
  totalVAT: 200,
  grandTotalInclVAT: 1200,
  paymentTotal: 1200,
})`;

export async function QuickStartSection() {
  return (
    <section className="section-block" style={{ marginTop: "1rem" }}>
      <h2 className="section-title" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>
        Hızlı başlangıç
      </h2>
      <p className="text-muted" style={{ marginTop: "0.6rem", marginBottom: "1rem" }}>
        Üç adımda kurulumu bitirip ilk taslak faturayı oluşturabilirsiniz.
      </p>
      <ol className="text-muted" style={{ marginBottom: "1rem", paddingLeft: "1rem", display: "grid", gap: "0.4rem" }}>
        <li>Paketi kurun.</li>
        <li>İstemciyi TEST veya PROD ortamıyla oluşturun.</li>
        <li>Token alıp taslak faturayı oluşturun.</li>
      </ol>
      <CodeBlock code={quickStart} lang="ts" title="quick-start.ts" />
    </section>
  );
}

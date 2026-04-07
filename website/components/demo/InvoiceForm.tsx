import { useMemo, useState } from "react";
import type { InvoiceDetails } from "fatura";
import { formatDateTR, formatTimeTR } from "@/lib/utils";

interface InvoiceFormProps {
    loading: boolean;
    disabled: boolean;
    onCreate: (invoiceDetails: InvoiceDetails, sign: boolean) => Promise<void>;
}

export function InvoiceForm({ loading, disabled, onCreate }: InvoiceFormProps) {
    const [date, setDate] = useState(formatDateTR());
    const [time, setTime] = useState(formatTimeTR());
    const [taxIDOrTRID, setTaxIDOrTRID] = useState("11111111111");
    const [title, setTitle] = useState("ÖRNEK TİCARET LTD");
    const [itemName, setItemName] = useState("Danışmanlık");
    const [quantity, setQuantity] = useState("1");
    const [unitPrice, setUnitPrice] = useState("1000");
    const [vatRate, setVatRate] = useState("20");
    const [signAfterCreate, setSignAfterCreate] = useState(false);

    const totals = useMemo(() => {
        const quantityNumber = Number(quantity) || 1;
        const unitPriceNumber = Number(unitPrice) || 0;
        const vatRateNumber = Number(vatRate) || 0;
        const price = quantityNumber * unitPriceNumber;
        const vatAmount = (price * vatRateNumber) / 100;
        const grandTotalInclVAT = price + vatAmount;

        return {
            quantityNumber,
            unitPriceNumber,
            vatRateNumber,
            price,
            vatAmount,
            grandTotalInclVAT,
        };
    }, [quantity, unitPrice, vatRate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const invoiceDetails: InvoiceDetails = {
            date,
            time,
            taxIDOrTRID,
            title,
            items: [
                {
                    name: itemName,
                    quantity: totals.quantityNumber,
                    unitPrice: totals.unitPriceNumber,
                    price: totals.price,
                    VATRate: totals.vatRateNumber,
                    VATAmount: totals.vatAmount,
                },
            ],
            grandTotal: totals.price,
            totalVAT: totals.vatAmount,
            grandTotalInclVAT: totals.grandTotalInclVAT,
            paymentTotal: totals.grandTotalInclVAT,
        };

        await onCreate(invoiceDetails, signAfterCreate);
    };

    return (
        <section className="section-block">
            <h2 className="section-title" style={{ fontSize: "1.3rem" }}>
                Fatura oluştur
            </h2>

            <form onSubmit={handleSubmit} style={{ marginTop: "0.8rem", display: "grid", gap: "0.7rem" }}>
                <div
                    style={{
                        display: "grid",
                        gap: "0.5rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    }}
                >
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            Fatura Tarihi
                        </div>
                        <input className="field" value={date} onChange={(event) => setDate(event.target.value)} />
                    </label>
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            Saat
                        </div>
                        <input className="field" value={time} onChange={(event) => setTime(event.target.value)} />
                    </label>
                </div>

                <label>
                    <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                        Alıcı VKN/TCKN
                    </div>
                    <input
                        className="field"
                        value={taxIDOrTRID}
                        onChange={(event) => setTaxIDOrTRID(event.target.value)}
                    />
                </label>

                <label>
                    <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                        Alıcı ünvanı
                    </div>
                    <input className="field" value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>

                <div
                    style={{
                        display: "grid",
                        gap: "0.5rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    }}
                >
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            Mal/Hizmet
                        </div>
                        <input
                            className="field"
                            value={itemName}
                            onChange={(event) => setItemName(event.target.value)}
                        />
                    </label>
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            Miktar
                        </div>
                        <input
                            className="field"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                        />
                    </label>
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            Birim Fiyat
                        </div>
                        <input
                            className="field"
                            value={unitPrice}
                            onChange={(event) => setUnitPrice(event.target.value)}
                        />
                    </label>
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            KDV %
                        </div>
                        <input className="field" value={vatRate} onChange={(event) => setVatRate(event.target.value)} />
                    </label>
                </div>

                <div
                    style={{
                        border: "1px solid var(--line)",
                        borderRadius: "12px",
                        padding: "0.65rem 0.8rem",
                        fontFamily: "var(--font-mono)",
                        background: "rgba(16,20,18,0.75)",
                        fontSize: "0.82rem",
                    }}
                >
                    Ara Toplam: {totals.price.toFixed(2)} TRY | KDV: {totals.vatAmount.toFixed(2)} TRY | Genel Toplam:{" "}
                    {totals.grandTotalInclVAT.toFixed(2)} TRY
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <input
                        type="checkbox"
                        checked={signAfterCreate}
                        onChange={(event) => setSignAfterCreate(event.target.checked)}
                    />
                    <span className="text-muted">Oluşturduktan sonra imzala (mali kayıt oluşturabilir)</span>
                </label>

                <button className="btn-primary" type="submit" disabled={disabled || loading || taxIDOrTRID.length < 10}>
                    Taslak fatura oluştur
                </button>
            </form>
        </section>
    );
}

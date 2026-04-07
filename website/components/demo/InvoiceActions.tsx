import { useState } from "react";
import { RecipientLookup } from "@/components/demo/RecipientLookup";

interface InvoiceActionsProps {
    token: string | null;
    loading: boolean;
    onFind: (uuid: string, date: string) => Promise<void>;
    onSign: (uuid: string, date: string) => Promise<void>;
    onCancel: (uuid: string, date: string, reason: string) => Promise<void>;
    onGetHTML: (uuid: string, signed: boolean) => Promise<void>;
    onGetDownloadURL: (uuid: string, signed: boolean) => Promise<void>;
    onLookupRecipient: (taxIDOrTRID: string) => Promise<void>;
    onSendSMS: (phone: string) => Promise<void>;
    onVerifySMS: (smsCode: string, operationId: string) => Promise<void>;
}

export function InvoiceActions({
    token,
    loading,
    onFind,
    onSign,
    onCancel,
    onGetHTML,
    onGetDownloadURL,
    onLookupRecipient,
    onSendSMS,
    onVerifySMS,
}: InvoiceActionsProps) {
    const [uuid, setUUID] = useState("");
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("Yanlış taslak");
    const [signed, setSigned] = useState(true);
    const [phone, setPhone] = useState("");
    const [smsCode, setSMSCode] = useState("");
    const [operationId, setOperationId] = useState("");

    const disabled = token === null;

    return (
        <section className="section-block" style={{ display: "grid", gap: "0.8rem" }}>
            <h2 className="section-title" style={{ fontSize: "1.3rem" }}>
                Fatura işlemleri
            </h2>

            <div
                style={{ display: "grid", gap: "0.55rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
            >
                <label>
                    <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                        Fatura UUID
                    </div>
                    <input className="field" value={uuid} onChange={(event) => setUUID(event.target.value)} />
                </label>
                <label>
                    <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                        Fatura tarihi (GG/AA/YYYY)
                    </div>
                    <input className="field" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                    type="button"
                    className="btn-ghost"
                    disabled={disabled || loading || uuid.length < 6 || date.length < 8}
                    onClick={() => onFind(uuid, date)}
                >
                    Taslağı bul
                </button>
                <button
                    type="button"
                    className="btn-primary"
                    disabled={disabled || loading || uuid.length < 6 || date.length < 8}
                    onClick={() => onSign(uuid, date)}
                >
                    İmzala
                </button>
            </div>

            <label>
                <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                    İptal sebebi
                </div>
                <input className="field" value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>

            <button
                type="button"
                className="btn-ghost"
                disabled={disabled || loading || uuid.length < 6 || date.length < 8 || reason.length < 3}
                onClick={() => onCancel(uuid, date, reason)}
            >
                Taslağı iptal et
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <input type="checkbox" checked={signed} onChange={(event) => setSigned(event.target.checked)} />
                <span className="text-muted">İmzalı fatura için HTML ve indirme</span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                    type="button"
                    className="btn-ghost"
                    disabled={disabled || loading || uuid.length < 6}
                    onClick={() => onGetHTML(uuid, signed)}
                >
                    HTML al
                </button>
                <button
                    type="button"
                    className="btn-ghost"
                    disabled={disabled || loading || uuid.length < 6}
                    onClick={() => onGetDownloadURL(uuid, signed)}
                >
                    İndirme bağlantısı al
                </button>
            </div>

            <div
                style={{
                    borderTop: "1px solid var(--line)",
                    paddingTop: "0.75rem",
                    display: "grid",
                    gap: "0.55rem",
                }}
            >
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>SMS doğrulama</h3>
                <label>
                    <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                        Telefon (CEP)
                    </div>
                    <input className="field" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
                <button
                    type="button"
                    className="btn-ghost"
                    disabled={disabled || loading || phone.length < 10}
                    onClick={() => onSendSMS(phone)}
                >
                    SMS kodu gönder
                </button>

                <div style={{ display: "grid", gap: "0.45rem", gridTemplateColumns: "1fr 1fr" }}>
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            SMS Kodu
                        </div>
                        <input className="field" value={smsCode} onChange={(event) => setSMSCode(event.target.value)} />
                    </label>
                    <label>
                        <div className="text-muted" style={{ marginBottom: "0.3rem" }}>
                            Operation OID
                        </div>
                        <input
                            className="field"
                            value={operationId}
                            onChange={(event) => setOperationId(event.target.value)}
                        />
                    </label>
                </div>

                <button
                    type="button"
                    className="btn-ghost"
                    disabled={disabled || loading || smsCode.length < 3 || operationId.length < 3}
                    onClick={() => onVerifySMS(smsCode, operationId)}
                >
                    SMS kodunu doğrula
                </button>
            </div>

            <RecipientLookup loading={loading} disabled={disabled} onLookup={onLookupRecipient} />
        </section>
    );
}

"use client";

import { useMemo, useState } from "react";
import type { EnvironmentKey, InvoiceDetails, InvoiceListItem, UserData } from "fatura";
import { createBrowserFaturaClient } from "@/lib/fatura-browser";
import { formatDateTR } from "@/lib/utils";
import { SecurityWarning } from "@/components/demo/SecurityWarning";
import { LoginPanel } from "@/components/demo/LoginPanel";
import { UserProfile } from "@/components/demo/UserProfile";
import { InvoiceForm } from "@/components/demo/InvoiceForm";
import { InvoiceList } from "@/components/demo/InvoiceList";
import { InvoiceActions } from "@/components/demo/InvoiceActions";

const tabs = [
    { id: "login", label: "Giriş" },
    { id: "profile", label: "Profilim" },
    { id: "create", label: "Fatura oluştur" },
    { id: "outgoing", label: "Faturalarım" },
    { id: "incoming", label: "Gelen faturalar" },
    { id: "actions", label: "Fatura işlemleri" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function toPreview(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    return JSON.stringify(value, null, 2);
}

export function DemoPlayground() {
    const [activeTab, setActiveTab] = useState<TabId>("login");
    const [env, setEnv] = useState<EnvironmentKey>("TEST");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [activity, setActivity] = useState<string[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);

    const today = formatDateTR();
    const [outgoingRange, setOutgoingRange] = useState({ startDate: today, endDate: today });
    const [incomingRange, setIncomingRange] = useState({ startDate: today, endDate: today });
    const [outgoingInvoices, setOutgoingInvoices] = useState<InvoiceListItem[]>([]);
    const [incomingInvoices, setIncomingInvoices] = useState<InvoiceListItem[]>([]);

    const client = useMemo(() => createBrowserFaturaClient(env), [env]);

    const appendActivity = (message: string) => {
        const timestamp = new Date().toLocaleTimeString("tr-TR", { hour12: false });
        setActivity((prev) => [timestamp + " | " + message, ...prev].slice(0, 16));
    };

    const runAction = async (label: string, action: () => Promise<unknown>) => {
        setLoading(true);
        setError(null);

        try {
            const result = await action();
            if (typeof result !== "undefined") {
                setPreview(toPreview(result));
            }
            appendActivity(label + " başarılı.");
        } catch (cause) {
            const message = cause instanceof Error ? cause.message : "Bilinmeyen hata";
            setError(message);
            appendActivity(label + " hatası: " + message);
        } finally {
            setLoading(false);
        }
    };

    const requireToken = (): string => {
        if (token === null) {
            throw new Error("Bu işlem için önce giriş yapın.");
        }

        return token;
    };

    const handleLogin = async () => {
        await runAction("Giriş", async () => {
            const nextToken = await client.getToken(userName, password);
            setToken(nextToken);
            return { token: nextToken.slice(0, 16) + "...", env };
        });
    };

    const handleLogout = async () => {
        await runAction("Çıkış", async () => {
            const activeToken = requireToken();
            const result = await client.logout(activeToken);
            setToken(null);
            setUserData(null);
            return result;
        });
    };

    const handleFetchUser = async () => {
        await runAction("Profil bilgilerini getir", async () => {
            const activeToken = requireToken();
            const profile = await client.getUserData(activeToken);
            setUserData(profile);
            return profile;
        });
    };

    const handleUpdateUser = async () => {
        await runAction("Profil güncelle", async () => {
            const activeToken = requireToken();
            if (userData === null) {
                throw new Error("Güncelleme için önce profili getirmeniz gerekir.");
            }

            const result = await client.updateUserData(activeToken, userData);
            return result;
        });
    };

    const handleCreateInvoice = async (invoiceDetails: InvoiceDetails, sign: boolean) => {
        await runAction("Taslak oluştur", async () => {
            const activeToken = requireToken();
            const draft = await client.createDraftInvoice(activeToken, invoiceDetails);

            let signed = false;
            if (sign) {
                const found = await client.findInvoice(activeToken, draft);
                if (typeof found === "undefined") {
                    throw new Error("Taslak bulundu ancak imza adımında tekrar bulunamadı.");
                }
                await client.signDraftInvoice(activeToken, found);
                signed = true;
            }

            const downloadURL = client.getDownloadURL(activeToken, draft.uuid, { signed });
            return { draft, signed, downloadURL };
        });
    };

    const handleLoadOutgoing = async () => {
        await runAction("Giden faturalar", async () => {
            const activeToken = requireToken();
            const invoices = await client.getAllInvoicesByDateRange(activeToken, outgoingRange);
            setOutgoingInvoices(invoices);
            return invoices;
        });
    };

    const handleLoadIncoming = async () => {
        await runAction("Gelen faturalar", async () => {
            const activeToken = requireToken();
            const invoices = await client.getAllInvoicesIssuedToMeByDateRange(activeToken, incomingRange);
            setIncomingInvoices(invoices);
            return invoices;
        });
    };

    const handleFindInvoice = async (uuid: string, date: string) => {
        await runAction("Taslak bul", async () => {
            const activeToken = requireToken();
            const result = await client.findInvoice(activeToken, { uuid, date });
            if (typeof result === "undefined") {
                throw new Error("Belirtilen tarih ve UUID ile taslak bulunamadı.");
            }
            return result;
        });
    };

    const handleSignInvoice = async (uuid: string, date: string) => {
        await runAction("Taslak imzala", async () => {
            const activeToken = requireToken();
            const found = await client.findInvoice(activeToken, { uuid, date });
            if (typeof found === "undefined") {
                throw new Error("İmzalama için taslak bulunamadı.");
            }
            return client.signDraftInvoice(activeToken, found);
        });
    };

    const handleCancelInvoice = async (uuid: string, date: string, reason: string) => {
        await runAction("Taslak iptal", async () => {
            const activeToken = requireToken();
            const found = await client.findInvoice(activeToken, { uuid, date });
            if (typeof found === "undefined") {
                throw new Error("İptal için taslak bulunamadı.");
            }
            return client.cancelDraftInvoice(activeToken, reason, found);
        });
    };

    const handleGetHTML = async (uuid: string, signed: boolean) => {
        await runAction("HTML al", async () => {
            const activeToken = requireToken();
            const html = await client.getInvoiceHTML(activeToken, uuid, { signed });
            if (html.length > 1800) {
                return html.slice(0, 1800) + "\n... (çıktı kısaltıldı)";
            }
            return html;
        });
    };

    const handleGetDownloadURL = async (uuid: string, signed: boolean) => {
        await runAction("İndirme bağlantısı", async () => {
            const activeToken = requireToken();
            return client.getDownloadURL(activeToken, uuid, { signed });
        });
    };

    const handleLookupRecipient = async (taxIDOrTRID: string) => {
        await runAction("Alıcı sorgula", async () => {
            const activeToken = requireToken();
            return client.getRecipientDataByTaxIDOrTRID(activeToken, taxIDOrTRID);
        });
    };

    const handleSendSMS = async (phone: string) => {
        await runAction("SMS kodu gonder", async () => {
            const activeToken = requireToken();
            return client.sendSignSMSCode(activeToken, phone);
        });
    };

    const handleVerifySMS = async (smsCode: string, operationId: string) => {
        await runAction("SMS kodunu doğrula", async () => {
            const activeToken = requireToken();
            return client.verifySignSMSCode(activeToken, smsCode, operationId);
        });
    };

    return (
        <div style={{ display: "grid", gap: "0.9rem" }}>
            <SecurityWarning />

            <section className="section-block">
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                    {tabs.map((tab) => {
                        const active = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className={active ? "btn-primary" : "btn-ghost"}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {activeTab === "login" ? (
                <LoginPanel
                    env={env}
                    userName={userName}
                    password={password}
                    token={token}
                    loading={loading}
                    onEnvChange={setEnv}
                    onUserNameChange={setUserName}
                    onPasswordChange={setPassword}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                />
            ) : null}

            {activeTab === "profile" ? (
                <UserProfile
                    token={token}
                    loading={loading}
                    userData={userData}
                    onFetch={handleFetchUser}
                    onSave={handleUpdateUser}
                    onChange={setUserData}
                />
            ) : null}

            {activeTab === "create" ? (
                <InvoiceForm loading={loading} disabled={token === null} onCreate={handleCreateInvoice} />
            ) : null}

            {activeTab === "outgoing" ? (
                <InvoiceList
                    title="Kesilen faturalar"
                    invoices={outgoingInvoices}
                    range={outgoingRange}
                    loading={loading}
                    disabled={token === null}
                    emptyMessage="Seçilen tarih aralığında kayıt bulunamadı."
                    onRangeChange={setOutgoingRange}
                    onLoad={handleLoadOutgoing}
                />
            ) : null}

            {activeTab === "incoming" ? (
                <InvoiceList
                    title="Adınıza düzenlenen faturalar"
                    invoices={incomingInvoices}
                    range={incomingRange}
                    loading={loading}
                    disabled={token === null}
                    emptyMessage="Seçilen tarih aralığında gelen fatura bulunamadı."
                    onRangeChange={setIncomingRange}
                    onLoad={handleLoadIncoming}
                />
            ) : null}

            {activeTab === "actions" ? (
                <InvoiceActions
                    token={token}
                    loading={loading}
                    onFind={handleFindInvoice}
                    onSign={handleSignInvoice}
                    onCancel={handleCancelInvoice}
                    onGetHTML={handleGetHTML}
                    onGetDownloadURL={handleGetDownloadURL}
                    onLookupRecipient={handleLookupRecipient}
                    onSendSMS={handleSendSMS}
                    onVerifySMS={handleVerifySMS}
                />
            ) : null}

            {error !== null ? (
                <section
                    className="section-block"
                    style={{ borderColor: "rgba(239,68,68,0.5)", color: "#fecaca", background: "rgba(46,11,11,0.78)" }}
                >
                    {error}
                </section>
            ) : null}

            <section className="section-block" style={{ display: "grid", gap: "0.65rem" }}>
                <h3 style={{ fontSize: "1.08rem", fontWeight: 700 }}>Çıktı / yanıt</h3>
                <pre
                    style={{
                        margin: 0,
                        border: "1px solid var(--line)",
                        borderRadius: "12px",
                        padding: "0.8rem",
                        overflowX: "auto",
                        background: "rgba(9, 13, 11, 0.85)",
                        color: "#bae6fd",
                        fontSize: "0.81rem",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {preview || "Henüz bir yanıt yok."}
                </pre>
            </section>

            <section className="section-block" style={{ display: "grid", gap: "0.6rem" }}>
                <h3 style={{ fontSize: "1.08rem", fontWeight: 700 }}>İşlem günlüğü</h3>
                <ul style={{ margin: 0, paddingLeft: "1rem", display: "grid", gap: "0.35rem" }}>
                    {activity.map((item, index) => (
                        <li
                            key={item + String(index)}
                            className="text-muted"
                            style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
                        >
                            {item}
                        </li>
                    ))}
                    {activity.length === 0 ? <li className="text-muted">Henüz işlem yapılmadı.</li> : null}
                </ul>
            </section>
        </div>
    );
}

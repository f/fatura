import { useState } from "react";

interface RecipientLookupProps {
  loading: boolean;
  disabled: boolean;
  onLookup: (taxIDOrTRID: string) => Promise<void>;
}

export function RecipientLookup({ loading, disabled, onLookup }: RecipientLookupProps) {
  const [taxIDOrTRID, setTaxIDOrTRID] = useState("");

  return (
    <div className="section-block" style={{ marginTop: "0.9rem" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Alıcı sorgulama</h3>
      <label style={{ display: "grid", gap: "0.4rem", marginTop: "0.6rem" }}>
        <span className="text-muted">VKN veya TCKN</span>
        <input
          className="field"
          value={taxIDOrTRID}
          onChange={(event) => setTaxIDOrTRID(event.target.value)}
          placeholder="11111111111"
        />
      </label>
      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: "0.7rem" }}
        disabled={disabled || loading || taxIDOrTRID.length < 10}
        onClick={() => onLookup(taxIDOrTRID)}
      >
        Alıcı bilgisini getir
      </button>
    </div>
  );
}

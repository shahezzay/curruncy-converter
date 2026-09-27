import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CurrencySelect from './CurrencySelect';

const API_BASE = 'https://api.frankfurter.dev/v1';
const QUICK_AMOUNTS = ['100', '500', '1000', '5000'];

export default function App() {
  const [currencies, setCurrencies] = useState(null);
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listError, setListError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/currencies`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      })
      .then((data) => setCurrencies(data))
      .catch(() =>
        setListError("Couldn't load the currency list. Check your connection and reload.")
      );
  }, []);

  const convert = useCallback((amt, f, t) => {
    const numeric = parseFloat(amt);

    if (!numeric || numeric <= 0) {
      setResult(null);
      setRate(null);
      return;
    }

    if (f === t) {
      setResult(numeric);
      setRate(1);
      setDate(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/latest?amount=${numeric}&from=${f}&to=${t}`)
      .then((r) => {
        if (!r.ok) throw new Error('bad response');
        return r.json();
      })
      .then((data) => {
        const converted = data.rates[t];
        setResult(converted);
        setRate(converted / numeric);
        setDate(data.date);
      })
      .catch(() =>
        setError('Conversion failed. The rate service may be unavailable — try again shortly.')
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!currencies) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => convert(amount, from, to), 350);
    return () => clearTimeout(debounceRef.current);
  }, [amount, from, to, currencies, convert]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const fmt = (n, ccy) => {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: ccy,
        maximumFractionDigits: n >= 1000 ? 2 : 4,
      }).format(n);
    } catch {
      return n.toFixed(4);
    }
  };

  const updatedLabel = useMemo(() => {
    if (!date) return null;
    const d = new Date(`${date}T00:00:00`);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [date]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] text-white/40">
              EXCHANGE RATES · LIVE
            </p>
            <h1 className="mt-1 font-display text-3xl text-white sm:text-4xl">Rateboard</h1>
          </div>
          <p className="hidden max-w-55 text-right text-xs leading-relaxed text-white/35 sm:block">
            Rates sourced from the European Central Bank via Frankfurter
          </p>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:grid-cols-5">
          <div
            className="ledger-bg flex flex-col justify-between p-7 sm:col-span-2 sm:p-8"
            style={{ background: 'linear-gradient(160deg, #16233D, #0E1626)' }}
          >
            <div>
              <p className="text-[11px] tracking-wide text-white/40">CONVERTED AMOUNT</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
                {loading ? (
                  <span className="font-display text-4xl text-white/30 sm:text-5xl">···</span>
                ) : (
                  <span
                    key={result}
                    className="fade-up break-all font-display text-4xl text-white sm:text-5xl"
                  >
                    {result !== null ? fmt(result, to) : '—'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-white/45">
                {to} · {currencies ? currencies[to] : ''}
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="text-xs text-white/55">
                {rate !== null
                  ? `1 ${from} = ${rate.toFixed(4)} ${to}`
                  : 'Enter an amount to see the rate'}
              </p>
              <p className="mt-1 text-[11px] text-white/30">
                {updatedLabel ? `Updated ${updatedLabel}` : 'Rates update on business days'}
              </p>
            </div>
          </div>

          <div className="bg-paper p-7 sm:col-span-3 sm:p-8">
            {listError ? (
              <div className="rounded-lg border border-[#8a3b2b]/20 bg-[#8a3b2b]/10 px-4 py-3 text-sm text-[#8a3b2b]">
                {listError}
              </div>
            ) : !currencies ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink/50">
                <svg className="spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Loading currencies…
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="text-[11px] tracking-wide text-ink/45">AMOUNT</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink/12 bg-white px-3 py-2.5 transition focus-within:border-teal">
                    <span className="font-display text-lg text-ink/40">{from}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent font-display text-2xl text-ink outline-none placeholder:text-ink/25"
                    />
                  </div>
                </label>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  <CurrencySelect value={from} onChange={setFrom} currencies={currencies} label="FROM" />

                  <button
                    onClick={swap}
                    aria-label="Swap currencies"
                    title="Swap currencies"
                    className="mb-0.75 flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-teal transition hover:border-teal hover:bg-teal hover:text-white active:scale-95"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M7 10L3 6M3 6L7 2M3 6H16C18.2091 6 20 7.79086 20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17 14L21 18M21 18L17 22M21 18H8C5.79086 18 4 16.2091 4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <CurrencySelect value={to} onChange={setTo} currencies={currencies} label="TO" />
                </div>

                {error && (
                  <p className="mt-4 rounded-lg border border-[#8a3b2b]/20 bg-[#8a3b2b]/10 px-4 py-2.5 text-sm text-[#8a3b2b]">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/10 pt-5">
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(v)}
                      className="rounded-full border border-ink/12 px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-brass hover:text-brass"
                    >
                      {Number(v).toLocaleString()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/25">
          Data via the Frankfurter API (European Central Bank reference rates) · Not for trading decisions
        </p>
      </div>
    </div>
  );
}
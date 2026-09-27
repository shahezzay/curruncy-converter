import { flagEmoji } from './flags';

export default function CurrencySelect({ value, onChange, currencies, label }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-wide text-ink/45">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-ink/12 bg-white px-3 py-2.5 transition focus-within:border-teal">
        <span className="text-lg leading-none">{flagEmoji(value)}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer bg-transparent text-sm font-semibold text-ink outline-none"
        >
          {Object.keys(currencies)
            .sort()
            .map((code) => (
              <option key={code} value={code} className="text-ink">
                {code} — {currencies[code]}
              </option>
            ))}
        </select>
      </div>
    </label>
  );
}
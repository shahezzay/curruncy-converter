const CCY_TO_COUNTRY = {
  USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP', AUD: 'AU', CAD: 'CA', CHF: 'CH',
  CNY: 'CN', HKD: 'HK', NZD: 'NZ', SEK: 'SE', KRW: 'KR', SGD: 'SG', NOK: 'NO',
  MXN: 'MX', INR: 'IN', RUB: 'RU', ZAR: 'ZA', TRY: 'TR', BRL: 'BR', TWD: 'TW',
  DKK: 'DK', PLN: 'PL', THB: 'TH', IDR: 'ID', HUF: 'HU', CZK: 'CZ', ILS: 'IL',
  CLP: 'CL', PHP: 'PH', AED: 'AE', COP: 'CO', SAR: 'SA', MYR: 'MY', RON: 'RO',
  BGN: 'BG', ISK: 'IS', PKR: 'PK',
};

export function flagEmoji(ccy) {
  const cc = CCY_TO_COUNTRY[ccy];
  if (!cc) return '🏳️';
  if (cc === 'EU') return '🇪🇺';
  const codePoints = [...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
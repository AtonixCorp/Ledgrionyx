import { countries as detailedCountries } from './countries';
import taxCountries from '../data/tax/countries.json';
import { normalizeTaxDirectory } from './taxDirectory';

const detailedCountriesByCode = new Map(
  detailedCountries.map((country) => [country.code, country]),
);

const fallbackDialCodesByCode = {
  EC: '+593', BO: '+591', PY: '+595', UY: '+598', CR: '+506', PA: '+507', GT: '+502', HN: '+504', SV: '+503', NI: '+505', BZ: '+501',
  JM: '+1', TT: '+1', DO: '+1', CU: '+53', BB: '+1', BS: '+1', AG: '+1', LC: '+1', VC: '+1', GD: '+1', KN: '+1', DM: '+1', GY: '+592', SR: '+597', HT: '+509', PR: '+1',
  LU: '+352', MT: '+356', CY: '+357', RS: '+381', BA: '+387', ME: '+382', MK: '+389', AL: '+355', BY: '+375', MD: '+373', IS: '+354', AD: '+376', LI: '+423', MC: '+377', SM: '+378',
  KP: '+850', BT: '+975', KZ: '+7', UZ: '+998', TJ: '+992', KG: '+996', TM: '+993', MN: '+976', MM: '+95', KH: '+855', LA: '+856', TW: '+886', HK: '+852', MO: '+853', TL: '+670', BN: '+673',
  YE: '+967', SY: '+963', IQ: '+964', IR: '+98', AF: '+93', AZ: '+994', AM: '+374', GE: '+995', MV: '+960', PS: '+970',
  FJ: '+679', PG: '+675', SB: '+677', VU: '+678', TO: '+676', WS: '+685', KI: '+686', MH: '+692', FM: '+691', PW: '+680', NR: '+674', TV: '+688',
};

const regionLabels = {
  Africa: 'Africa',
  Americas: 'Americas',
  Asia: 'Asia',
  Europe: 'Europe',
  Oceania: 'Oceania',
};

export const countryDropdownOptions = normalizeTaxDirectory(taxCountries)
  .filter((country) => country.region !== 'Territories')
  .slice(0, 192)
  .map((country) => {
    const detailedCountry = detailedCountriesByCode.get(country.code);

    return {
      code: country.code,
      name: country.name,
      region: regionLabels[country.region] || country.region || 'Other',
      dialCode: detailedCountry?.dialCode || fallbackDialCodesByCode[country.code] || '',
      flag: detailedCountry?.flag || '',
      currency: detailedCountry?.currency || null,
      banks: detailedCountry?.banks || [],
    };
  });

export const countryDropdownOptionsByCode = new Map(
  countryDropdownOptions.map((country) => [country.code, country]),
);

export const countryDropdownOptionsByName = new Map(
  countryDropdownOptions.map((country) => [country.name, country]),
);
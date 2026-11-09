// Include competing umlaut forms so spelling alone cannot identify the plural.
export function pluralOptions(noun, plural) {
  const umlauts = { a: 'ä', o: 'ö', u: 'ü', A: 'Ä', O: 'Ö', U: 'Ü', au: 'äu', Au: 'Äu' };
  if (/[äöüÄÖÜ]/.test(plural) && !/[äöüÄÖÜ]/.test(noun)) {
    const stem = noun.replace(/au|Au|[aouAOU]/, vowel => umlauts[vowel]);
    return [noun, `${noun}e`, `${stem}e`, `${stem}en`, `${stem}er`];
  }
  return [noun, `${noun}e`, `${noun}en`, `${noun}s`, `${noun}er`];
}

export function separatedOptions(form, prefix) {
  return [`${prefix} … ${form}`, `${prefix}${form} … ${prefix}`, `${prefix}${form} … —`];
}

const fs = require('fs');
const path = require('path');

function getKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res.concat(prefix + el);
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return res.concat(getKeys(obj[el], prefix + el + '.'));
    }
    return res.concat(prefix + el);
  }, []);
}

const root = path.join(__dirname, '..');
const es = JSON.parse(fs.readFileSync(path.join(root, 'i18n/locales/es.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'i18n/locales/en.json'), 'utf8'));

const esKeys = getKeys(es.translation || es);
const enKeys = getKeys(en.translation || en);

const missingInEn = esKeys.filter(k => !enKeys.includes(k));
const missingInEs = enKeys.filter(k => !esKeys.includes(k));

console.log('--- Missing in EN ---');
console.log(missingInEn.length ? missingInEn.join('\n') : 'None');

console.log('\n--- Missing in ES ---');
console.log(missingInEs.length ? missingInEs.join('\n') : 'None');

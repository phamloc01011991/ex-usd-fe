import vn from './vn';
import en from './en';

let languagePack = {};

export const getLanguagePack = async () => {
    let locations = JSON.parse(localStorage.getItem('locations')) || { language: 'EN' };

    if (locations.language === 'EN') {
      languagePack = en;
    }

  return languagePack;
};

export const setLanguage = (language) => {
  const locations = JSON.parse(localStorage.getItem('locations')) || { language: 'EN' };

  locations.language = language;
  localStorage.setItem('locations', JSON.stringify(locations));
  if (language === 'EN') languagePack = en;
  else languagePack = en;
  window.location.reload();
};

export { languagePack};


getLanguagePack();

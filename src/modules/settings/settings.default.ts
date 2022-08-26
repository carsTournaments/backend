import { SettingsI } from '@settings';
export const settingsDefault: SettingsI = {
  title: 'Tournament',
  description: 'Tournament description',
  logo: '',
  android: {
    version: {
      latestVersion: '0.0.4',
      minVersion: '0.0.3',
    },
    urlMarket: '',
  },
  ios: {
    version: {
      latestVersion: '0.0.4',
      minVersion: '0.0.3',
    },
    urlMarket: '',
  },
};

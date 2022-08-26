export interface SettingsI {
  _id?: string;
  title?: string;
  description?: string;
  logo?: string;
  android?: SettingsAndroidI;
  ios?: SettingsIosI;
  created?: string;
  updated?: string;
}

export interface SettingsAndroidI {
  version: SettingsVersionI;
  urlMarket: string;
}

export interface SettingsIosI {
  version: SettingsVersionI;
  urlMarket: string;
}

export interface SettingsVersionI {
  latestVersion: string;
  minVersion: string;
}

export interface SettingsVersionCodeI {
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
}

export interface SettingsAppI {
  title: string;
  description: string;
  isNeedUpdate: SettingsIsNeedUpdateI;
}

export interface SettingsIsNeedUpdateI {
  update: boolean;
  mandatory: boolean;
}

export interface SettingsCheckUpdateI {
  update: boolean;
  mandatory: boolean;
  urlMarket?: string;
}

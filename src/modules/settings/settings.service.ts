import { CacheService } from '@cache';
import {
  Settings,
  SettingsI,
  SettingsCheckUpdateI,
  SettingsVersionCodeI,
  SettingsAppI,
  settingsDefault,
  SettingsCheckUpdateDto,
  SettingsAppDto,
} from '@settings';

export class SettingsService {
  private cacheService = new CacheService();
  async getAll(): Promise<SettingsI> {
    try {
      const settings = await this.getOrSetDefaultSettings();
      return settings;
    } catch (error) {
      return error;
    }
  }

  private async getOrSetDefaultSettings(): Promise<SettingsI> {
    try {
      const settings = await Settings.findOne({}).exec();
      if (!settings) {
        const newSettings = new Settings(settingsDefault);
        const item = await newSettings.save();
        return item;
      } else {
        return settings;
      }
    } catch (error) {
      return error;
    }
  }

  async checkUpdate(
    data: SettingsCheckUpdateDto
  ): Promise<SettingsCheckUpdateI> {
    const settings = await this.getOrSetDefaultSettings();
    const versionPlatformDB =
      data.platform === 'android' ? settings.android : settings.ios;
    const versionApp = this.generateVersionObject(data.version);
    const versionLatestDB = this.generateVersionObject(
      versionPlatformDB.version.latestVersion
    );
    const versionMinDB = this.generateVersionObject(
      versionPlatformDB.version.minVersion
    );
    const result = this.isNeedUpdate(versionApp, versionLatestDB, versionMinDB);
    const item: SettingsCheckUpdateI = {
      update: result.update,
      mandatory: result.mandatory,
    };
    if (item.update) {
      item.urlMarket = versionPlatformDB.urlMarket;
    }
    return item;
  }

  private generateVersionObject(version: string): SettingsVersionCodeI {
    const versionArr = version.split('.').map((item) => Number(item));
    return {
      versionMajor: versionArr[0],
      versionMinor: versionArr[1],
      versionPatch: versionArr[2],
    };
  }

  private isNeedUpdate(
    versionApp: SettingsVersionCodeI,
    versionLatestDB: SettingsVersionCodeI,
    versionMinDB: SettingsVersionCodeI
  ): { update: boolean; mandatory: boolean } {
    let update = false;
    let mandatory = false;
    update = this.checkUpdate(versionApp, versionLatestDB, update);
    mandatory = this.checkMandatory(versionApp, versionMinDB, mandatory);
    return {
      update,
      mandatory,
    };
  }

  private checkMandatory(
    versionApp: SettingsVersionCodeI,
    versionMinDB: SettingsVersionCodeI,
    mandatory: boolean
  ) {
    if (versionApp.versionMajor < versionMinDB.versionMajor) {
      mandatory = true;
    } else if (versionApp.versionMajor === versionMinDB.versionMajor) {
      if (versionApp.versionMinor < versionMinDB.versionMinor) {
        mandatory = true;
      } else if (versionApp.versionMinor === versionMinDB.versionMinor) {
        if (versionApp.versionPatch < versionMinDB.versionPatch) {
          mandatory = true;
        }
      }
    }
    return mandatory;
  }

  private checkUpdate(
    versionApp: SettingsVersionCodeI,
    versionLatestDB: SettingsVersionCodeI,
    update: boolean
  ) {
    if (versionApp.versionMajor < versionLatestDB.versionMajor) {
      update = true;
    } else if (versionApp.versionMajor === versionLatestDB.versionMajor) {
      if (versionApp.versionMinor < versionLatestDB.versionMinor) {
        update = true;
      } else if (versionApp.versionMinor === versionLatestDB.versionMinor) {
        if (versionApp.versionPatch < versionLatestDB.versionPatch) {
          update = true;
        }
      }
    }
    return update;
  }

  async getSettingsApp(data: SettingsAppDto): Promise<SettingsAppI> {
    try {
      const settings = await this.getOrSetDefaultSettings();
      const items: SettingsAppI = {
        title: settings.title,
        description: settings.description,
        isNeedUpdate:
          data.platform && data.version
            ? await this.checkUpdate(data)
            : undefined,
      };
      return items;
    } catch (error) {
      return error;
    }
  }

  async update(body: SettingsI): Promise<SettingsI> {
    try {
      this.cacheService.deleteByCategory('settings');
      const settings = await this.getOrSetDefaultSettings();
      return Settings.findByIdAndUpdate(settings._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }
}

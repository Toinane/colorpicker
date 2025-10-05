import fs from 'fs';
import path from 'path';
import { app, dialog, shell } from 'electron';

function deepMergeObject(...objects: Array<Record<string, unknown>>) {
  const isObject = (obj: unknown) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key] as Array<Record<string, unknown>> | Record<string, unknown> | string;
      const oVal = obj[key] as Array<Record<string, unknown>> | Record<string, unknown> | string;

      // eslint-disable-next-line no-param-reassign
      if (Array.isArray(pVal) && Array.isArray(oVal)) prev[key] = pVal.concat(...oVal);
      else if (isObject(pVal) && isObject(oVal)) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = deepMergeObject(
          pVal as Record<string, unknown>,
          oVal as Record<string, unknown>,
        );
        // eslint-disable-next-line no-param-reassign
      } else prev[key] = oVal;
    });

    return prev;
  }, {});
}

class Storage<T> {
  filename: string;

  storagePath: string;

  defaultParams: Partial<T>;

  storage: Partial<T>;

  constructor(filename: string, defaultParams: Partial<T>) {
    if (!fs.existsSync(app.getPath('userData'))) fs.mkdirSync(app.getPath('userData'));

    this.filename = filename;
    this.storagePath = path.resolve(app.getPath('userData'), `${filename}.json`);
    this.defaultParams = defaultParams;
    this.storage = defaultParams;

    if (!fs.existsSync(this.storagePath)) this.saveFile(this.defaultParams);
    else {
      try {
        this.storage = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      } catch (error) {
        console.error(error);

        const response = dialog.showMessageBoxSync({
          title: 'Settings file is corrupted',
          message: `Colorpicker cannot read the ${this.filename} file. Do you want to reset it?`,
          type: 'error',
          buttons: ['No', `Show ${this.filename} file`, 'Yes'],
        });

        if (response === 2) this.reset();
        else {
          if (response === 1) shell.showItemInFolder(this.storagePath);
          app.quit();
        }
      }
    }
  }

  saveFile(storage: Partial<T>): boolean {
    try {
      fs.writeFileSync(this.storagePath, JSON.stringify(storage), 'utf8');
      return true;
    } catch (error) {
      console.log(error);

      dialog.showErrorBox(`Failed at save ${this.filename} file.`, error as string);

      return false;
    }
  }

  set(changes: Partial<T>): Partial<T> {
    this.storage = deepMergeObject(this.storage, changes) as Partial<T>;
    this.saveFile(this.storage);

    return this.storage;
  }

  get(key?: string): Partial<T> {
    if (key && key in this.storage) {
      // return this.storage[key];
    }

    return this.storage;
  }

  reset(): boolean {
    const response = dialog.showMessageBoxSync({
      message: 'Are you sure to reset your preferences? You will lost all your preferences',
      type: 'warning',
      buttons: ['No', 'Yes'],
    });

    if (response === 1) {
      if (fs.existsSync(this.storagePath)) fs.unlinkSync(this.storagePath);
      this.storage = this.defaultParams;

      return true;
    }

    return false;
  }
}

export default Storage;

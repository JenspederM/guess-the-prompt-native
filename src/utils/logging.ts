import {Platform} from 'react-native';

export class Logger {
  private name: string;
  private _method: string;

  // Aliases
  m = this.method;

  constructor(name: string) {
    this.name = name;
    this._method = '';
  }

  getChildLogger(name: string): Logger {
    return new Logger(`${this.name}.${name}`);
  }

  method(name: string): Logger {
    this._method = name;
    return this;
  }

  info(...args: any[]) {
    return this._log('info', args);
  }

  error(...args: any[]) {
    return this._log('error', args);
  }

  warn(...args: any[]) {
    return this._log('warn', args);
  }

  debug(...args: any[]) {
    return this._log('debug', args);
  }

  private _log(level: string, ...args: any[]) {
    const signature = this.getSignature();

    let logger;

    switch (level) {
      case 'info':
        logger = console.info;
        break;
      case 'error':
        logger = console.error;
        break;
      case 'warn':
        logger = console.warn;
        break;
      case 'debug':
        logger = console.debug;
        break;
      default:
        logger = console.log;
    }

    if (args[0]?.length > 0 && args[0][0] !== undefined) {
      logger(signature, ...args[0]);
    } else {
      logger(signature);
    }

    this._method = '';

    return this;
  }

  private getSignature(): string {
    let logSignature = `${Platform.OS}.${this.name}`;
    if (this._method !== '') {
      logSignature += `.${this._method}()`;
    }
    return `${new Date().toISOString()}: [${logSignature}]`;
  }
}

const ROOT_LOGGER = new Logger('GuessThePrompt');

export const getLogger = (name: string): Logger => {
  return ROOT_LOGGER.getChildLogger(name);
};

export default ROOT_LOGGER;

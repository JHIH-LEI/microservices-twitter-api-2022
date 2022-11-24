export enum NODEENV {
  Development = "dev",
  Test = "test",
  Production = "production",
}

/**
 *
 * valid process.env.NODE_ENV value can see enum NODEENV
 *
 */
export function getDBUrlBaseNodeEnv(): string | undefined {
  if (process.env.NODE_ENV === NODEENV.Test) {
    return process.env.TEST_DB_URL;
  }

  if (process.env.NODE_ENV === NODEENV.Development) {
    return process.env.DEV_DB_URL;
  }

  if (process.env.NODE_ENV === NODEENV.Production) {
    return process.env.PROD_DB_URL;
  }
}

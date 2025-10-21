// Environment variable types

export interface EnvConfig {
  environment: 'development' | 'production';
  apiUrl: string;
}

declare module '../config/env' {
  const env: EnvConfig;
  export default env;
}


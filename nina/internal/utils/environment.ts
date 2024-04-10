interface EnvironmentVariables {
  HOST: string;
  DATABASE: string;
  NINA_USER: string;
  NINA_PASSWORD: string;
}

function getEnvironmentVariables(): EnvironmentVariables {
  return {
    HOST: process.env.HOST || "",
    DATABASE: process.env.DATABASE || "",
    NINA_USER: process.env.NINA_USER || "",
    NINA_PASSWORD: process.env.NINA_PASSWORD || "",
  };
}

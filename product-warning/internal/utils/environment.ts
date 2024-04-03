interface EnvironmentVariables {
  HOST: string;
  DATABASE: string;
  PRODUCTWARNING_USER: string;
  PRODUCTWARNING_PASSWORD: string;
}

function getEnvironmentVariables(): EnvironmentVariables {
  return {
    HOST: process.env.HOST || "",
    DATABASE: process.env.DATABASE || "",
    PRODUCTWARNING_USER: process.env.PRODUCTWARNING_USER || "",
    PRODUCTWARNING_PASSWORD: process.env.PRODUCTWARNING_PASSWORD || "",
  };
}

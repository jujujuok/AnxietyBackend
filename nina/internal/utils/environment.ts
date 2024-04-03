interface EnvironmentVariables {
  HOST: string;
  DATABASE: string;
  TEMPLATE_USER: string;
  TEMPLATE_PASSWORD: string;
}

function getEnvironmentVariables(): EnvironmentVariables {
  return {
    HOST: process.env.HOST || "",
    DATABASE: process.env.DATABASE || "",
    TEMPLATE_USER: process.env.TEMPLATE_USER || "",
    TEMPLATE_PASSWORD: process.env.TEMPLATE_PASSWORD || "",
  };
}

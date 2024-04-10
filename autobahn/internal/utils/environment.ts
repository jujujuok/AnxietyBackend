interface EnvironmentVariables {
  HOST: string;
  DATABASE: string;
  AUTOBAHN_USER: string;
  AUTOBAHN_PASSWORD: string;
}

function getEnvironmentVariables(): EnvironmentVariables {
  return {
    HOST: process.env.HOST || "",
    DATABASE: process.env.DATABASE || "",
    AUTOBAHN_USER: process.env.AUTOBAHN_USER || "",
    AUTOBAHN_PASSWORD: process.env.AUTOBAHN_PASSWORD || "",
  };
}

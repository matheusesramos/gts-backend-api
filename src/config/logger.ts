import winston from "winston";

const simpleFormat = winston.format.printf(
  (info) => `${info.level}: ${info.message}`
);

export const logger = winston.createLogger({
  level: "info", // ✅ Sempre info, até em produção
  format: simpleFormat,
  transports: [
    new winston.transports.Console(), // ✅ Só console
  ],
});

export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

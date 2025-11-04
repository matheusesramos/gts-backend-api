// src/config/logger.ts
import winston from "winston";
import { env } from "./env";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(logColors);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Formato para arquivo (produção)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuração de transports baseada no ambiente
const transports: winston.transport[] = [
  // Console sempre ativo
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Em produção, adiciona logs em arquivos
if (env.NODE_ENV === "production") {
  transports.push(
    // Erros em arquivo separado
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Todos os logs combinados
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  levels: logLevels,
  transports,
  // Não sair em exceções
  exitOnError: false,
});

// Stream para Morgan (HTTP logs)
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

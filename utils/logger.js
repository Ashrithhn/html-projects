const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, errors, json, colorize } = winston.format;

// Format for console transport
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger instance
const logger = winston.createLogger({
    level: 'debug', // Default level
    format: combine(
        errors({ stack: true }), // Capture stack traces for errors
        timestamp(),
        json() // Output in JSON format
    ),
    transports: [
        // File transport for all errors
        new winston.transports.File({ 
            filename: path.join(__dirname, '../error.log'), 
            level: 'error' 
        }),
        // File transport for all logs
        new winston.transports.File({ 
            filename: path.join(__dirname, '../combined.log') 
        }),
    ],
});

// Add Console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            consoleFormat
        )
    }));
}

module.exports = logger;

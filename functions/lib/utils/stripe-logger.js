"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWebhookValidationError = exports.logStripeError = exports.logStripeEvent = void 0;
const functions = __importStar(require("firebase-functions"));
const logStripeEvent = (event, context) => {
    const eventData = {
        type: event.type,
        id: event.id,
        object: event.object,
        apiVersion: event.api_version,
        created: new Date(event.created * 1000).toISOString(),
        context,
        timestamp: new Date().toISOString()
    };
    functions.logger.info('Evento do Stripe recebido:', eventData);
    return eventData;
};
exports.logStripeEvent = logStripeEvent;
const logStripeError = (error, context) => {
    const errorData = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type,
        context,
        timestamp: new Date().toISOString()
    };
    functions.logger.error('Erro no processamento do Stripe:', errorData);
    return errorData;
};
exports.logStripeError = logStripeError;
const logWebhookValidationError = (error) => {
    const errorData = {
        message: error.message,
        type: 'webhook_validation_error',
        timestamp: new Date().toISOString()
    };
    functions.logger.error('Erro na validação do webhook:', errorData);
    return errorData;
};
exports.logWebhookValidationError = logWebhookValidationError;
//# sourceMappingURL=stripe-logger.js.map
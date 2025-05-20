import * as functions from 'firebase-functions';

export const logStripeEvent = (event: any, context: string) => {
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

export const logStripeError = (error: any, context: string) => {
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

export const logWebhookValidationError = (error: any) => {
  const errorData = {
    message: error.message,
    type: 'webhook_validation_error',
    timestamp: new Date().toISOString()
  };

  functions.logger.error('Erro na validação do webhook:', errorData);
  return errorData;
}; 
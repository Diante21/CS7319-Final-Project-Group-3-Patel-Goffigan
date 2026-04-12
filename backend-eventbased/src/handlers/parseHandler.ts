import EventBus, { EVENTS } from '../events/EventBus';
import { SubmittedPayload, ParsedPayload, ErrorPayload } from '../models/types';

export function registerParseHandler(): void {
  EventBus.on(EVENTS.RESUME_SUBMITTED, (payload: SubmittedPayload) => {
    try {
      const { correlationId, input } = payload;

      if (!input.text || input.text.trim().length === 0) {
        const errPayload: ErrorPayload = {
          correlationId,
          message: 'No resume text provided. Send JSON { text } or upload a file.',
        };
        EventBus.emit(EVENTS.RESUME_ERROR, errPayload);
        EventBus.emit(`${EVENTS.RESUME_ERROR}:${correlationId}`, errPayload);
        return;
      }

      const parsed: ParsedPayload = {
        correlationId,
        text: input.text.trim(),
        ...(input.filename ? { filename: input.filename } : {}),
      };

      EventBus.emit(EVENTS.RESUME_PARSED, parsed);
    } catch (err) {
      const errPayload: ErrorPayload = {
        correlationId: payload.correlationId,
        message: err instanceof Error ? err.message : 'Parse error',
      };
      EventBus.emit(EVENTS.RESUME_ERROR, errPayload);
      EventBus.emit(`${EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
    }
  });
}

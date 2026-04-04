import { EventEmitter } from 'events';

export const EVENTS = {
  RESUME_SUBMITTED: 'resume:submitted',
  RESUME_PARSED: 'resume:parsed',
  RESUME_ANALYZED: 'resume:analyzed',
  RESUME_SCORED: 'resume:scored',
  RESUME_FEEDBACK_GENERATED: 'resume:feedback:generated',
  RESUME_STORED: 'resume:stored',
  RESUME_ERROR: 'resume:error',
} as const;

class EventBusClass extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}

const EventBus = new EventBusClass();

export default EventBus;

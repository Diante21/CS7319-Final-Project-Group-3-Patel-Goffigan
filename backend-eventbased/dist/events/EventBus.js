"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = void 0;
const events_1 = require("events");
exports.EVENTS = {
    RESUME_SUBMITTED: 'resume:submitted',
    RESUME_PARSED: 'resume:parsed',
    RESUME_ANALYZED: 'resume:analyzed',
    RESUME_SCORED: 'resume:scored',
    RESUME_FEEDBACK_GENERATED: 'resume:feedback:generated',
    RESUME_STORED: 'resume:stored',
    RESUME_ERROR: 'resume:error',
};
class EventBusClass extends events_1.EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }
}
const EventBus = new EventBusClass();
exports.default = EventBus;

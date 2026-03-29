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
exports.registerParseHandler = registerParseHandler;
const EventBus_1 = __importStar(require("../events/EventBus"));
function registerParseHandler() {
    EventBus_1.default.on(EventBus_1.EVENTS.RESUME_SUBMITTED, (payload) => {
        try {
            const { correlationId, input } = payload;
            if (!input.text || input.text.trim().length === 0) {
                const errPayload = {
                    correlationId,
                    message: 'No resume text provided. Send JSON { text } or upload a file.',
                };
                EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ERROR, errPayload);
                EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_ERROR}:${correlationId}`, errPayload);
                return;
            }
            const parsed = {
                correlationId,
                text: input.text.trim(),
                ...(input.filename ? { filename: input.filename } : {}),
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_PARSED, parsed);
        }
        catch (err) {
            const errPayload = {
                correlationId: payload.correlationId,
                message: err instanceof Error ? err.message : 'Parse error',
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ERROR, errPayload);
            EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
        }
    });
}

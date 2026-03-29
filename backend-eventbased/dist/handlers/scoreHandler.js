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
exports.registerScoreHandler = registerScoreHandler;
const EventBus_1 = __importStar(require("../events/EventBus"));
// ── Helpers ───────────────────────────────────────────────────────────────────
function computeContentScore(text) {
    let score = 0;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 200) {
        score += 5;
    }
    else if (wordCount >= 100) {
        score += 3;
    }
    const quantMatches = text.match(/\d+%|\$\d+|\d+\+|\d+ (users|clients|team|projects|years)/gi);
    const quantCount = quantMatches ? quantMatches.length : 0;
    score += Math.min(8, quantCount * 2);
    const pronounMatches = text.match(/\b(I|me|my)\b/g);
    if (!pronounMatches || pronounMatches.length === 0) {
        score += 4;
    }
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
        score += 3;
    }
    if (/(\+?\d[\d\s\-().]{7,}\d)/.test(text)) {
        score += 2;
    }
    return score;
}
function getGrade(score) {
    if (score >= 90)
        return 'A+';
    if (score >= 80)
        return 'A';
    if (score >= 70)
        return 'B';
    if (score >= 60)
        return 'C';
    if (score >= 50)
        return 'D';
    return 'F';
}
// ── Handler registration ──────────────────────────────────────────────────────
function registerScoreHandler() {
    EventBus_1.default.on(EventBus_1.EVENTS.RESUME_ANALYZED, (payload) => {
        try {
            const { correlationId, sections, keywords, rawTextLength, filename } = payload;
            const text = payload._text ?? '';
            const sectionScore = sections.reduce((sum, s) => sum + s.score, 0);
            const techScore = Math.min(25, keywords.technical.found.length * 2.5);
            const softScore = Math.min(10, keywords.softSkills.found.length * 1.5);
            const verbScore = Math.min(15, keywords.actionVerbs.found.length * 1.5);
            const contentScore = computeContentScore(text);
            const overallScore = Math.round(Math.min(100, sectionScore + techScore + softScore + verbScore + contentScore));
            const scored = {
                correlationId,
                overallScore,
                grade: getGrade(overallScore),
                sections,
                keywords,
                rawTextLength,
                _text: text,
                ...(filename ? { filename } : {}),
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_SCORED, scored);
        }
        catch (err) {
            const errPayload = {
                correlationId: payload.correlationId,
                message: err instanceof Error ? err.message : 'Score error',
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ERROR, errPayload);
            EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
        }
    });
}

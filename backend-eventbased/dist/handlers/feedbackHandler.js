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
exports.registerFeedbackHandler = registerFeedbackHandler;
const EventBus_1 = __importStar(require("../events/EventBus"));
// ── Feedback generation (same logic as layered feedbackService) ───────────────
function generateFeedback(sections, keywords, overallScore) {
    const critical = [];
    const improvements = [];
    const strengths = [];
    const sectionMap = {};
    for (const s of sections) {
        sectionMap[s.name] = s;
    }
    // Critical issues
    if ((sectionMap['Experience']?.score ?? 0) === 0) {
        critical.push('Missing work experience section — this is essential for most roles.');
    }
    if ((sectionMap['Education']?.score ?? 0) === 0) {
        critical.push('Missing education section — include your degree(s) and institution(s).');
    }
    if ((sectionMap['Skills']?.score ?? 0) === 0) {
        critical.push('Missing skills section — list your technical and relevant skills.');
    }
    if (keywords.technical.found.length < 3) {
        critical.push(`Very few technical keywords detected (${keywords.technical.found.length}). Include relevant technologies for the role.`);
    }
    if (keywords.actionVerbs.found.length < 3) {
        critical.push(`Too few action verbs (${keywords.actionVerbs.found.length}). Start bullet points with strong action verbs like "developed", "led", or "optimized".`);
    }
    // Improvements
    if (keywords.technical.found.length >= 3 && keywords.technical.found.length < 8) {
        improvements.push(`Expand technical keywords: currently ${keywords.technical.found.length} found. Aim for 8+ relevant technologies.`);
    }
    if (keywords.softSkills.found.length < 3) {
        improvements.push('Include soft-skill keywords (e.g., leadership, collaboration, analytical) to strengthen your profile.');
    }
    if (keywords.actionVerbs.found.length >= 3 && keywords.actionVerbs.found.length < 7) {
        improvements.push(`Use more action verbs: ${keywords.actionVerbs.found.length} found. Aim for 7+ to demonstrate impact.`);
    }
    if ((sectionMap['Contact Information']?.score ?? 0) === 0) {
        improvements.push('Add your contact details (email, phone, LinkedIn).');
    }
    if ((sectionMap['Summary / Objective']?.score ?? 0) === 0) {
        improvements.push('Add a brief professional summary (3–5 sentences) at the top of your resume.');
    }
    if (overallScore < 10) {
        improvements.push('Improve content quality: add quantified achievements (e.g., "reduced costs by 15%") and ensure your resume is at least 200 words.');
    }
    // Strengths
    if (keywords.technical.found.length >= 8) {
        strengths.push(`Strong technical keyword coverage: ${keywords.technical.found.length} technologies listed (${keywords.technical.found.slice(0, 5).join(', ')}${keywords.technical.found.length > 5 ? ', …' : ''}).`);
    }
    if (keywords.actionVerbs.found.length >= 7) {
        strengths.push(`Excellent use of action verbs (${keywords.actionVerbs.found.length} found) — communicates impact effectively.`);
    }
    if ((sectionMap['Experience']?.score ?? 0) > 0) {
        strengths.push('Work experience section is present.');
    }
    if ((sectionMap['Education']?.score ?? 0) > 0) {
        strengths.push('Education section is present.');
    }
    if ((sectionMap['Contact Information']?.score ?? 0) > 0) {
        strengths.push('Contact information is included.');
    }
    if (keywords.softSkills.found.length >= 3) {
        strengths.push(`Good soft-skill coverage: ${keywords.softSkills.found.length} traits identified.`);
    }
    return { critical, improvements, strengths };
}
// ── Handler registration ──────────────────────────────────────────────────────
function registerFeedbackHandler() {
    EventBus_1.default.on(EventBus_1.EVENTS.RESUME_SCORED, (payload) => {
        try {
            const { correlationId, overallScore, grade, sections, keywords, rawTextLength, filename } = payload;
            const feedback = generateFeedback(sections, keywords, overallScore);
            const feedbackPayload = {
                correlationId,
                result: {
                    overallScore,
                    grade,
                    sections,
                    keywords,
                    feedback,
                    rawTextLength,
                    ...(filename ? { filename } : {}),
                },
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_FEEDBACK_GENERATED, feedbackPayload);
        }
        catch (err) {
            const errPayload = {
                correlationId: payload.correlationId,
                message: err instanceof Error ? err.message : 'Feedback error',
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ERROR, errPayload);
            EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
        }
    });
}

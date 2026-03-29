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
exports.registerAnalyzeHandler = registerAnalyzeHandler;
const EventBus_1 = __importStar(require("../events/EventBus"));
// ── Keyword lists ─────────────────────────────────────────────────────────────
const TECHNICAL_KEYWORDS = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'SQL',
    'AWS', 'Docker', 'Git', 'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL',
    'Kubernetes', 'CI/CD', 'Agile', 'Machine Learning', 'HTML', 'CSS', 'Vue',
    'Angular', 'Linux', 'Azure', 'GCP', 'Microservices', 'Redux', 'Express',
    'Django', 'Spring',
];
const SOFT_SKILL_KEYWORDS = [
    'leadership', 'communication', 'collaboration', 'problem-solving', 'teamwork',
    'analytical', 'innovative', 'adaptable', 'detail-oriented', 'self-motivated',
    'creative', 'strategic', 'organized', 'mentoring', 'cross-functional',
];
const ACTION_VERBS = [
    'developed', 'implemented', 'designed', 'built', 'created', 'managed', 'led',
    'optimized', 'improved', 'increased', 'reduced', 'architected', 'deployed',
    'automated', 'collaborated', 'delivered', 'launched', 'spearheaded',
    'streamlined', 'coordinated',
];
// ── Helpers ───────────────────────────────────────────────────────────────────
function matchKeywords(text, keywords) {
    const lower = text.toLowerCase();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const found = [];
    const missing = [];
    for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) {
            found.push(kw);
        }
        else {
            missing.push(kw);
        }
    }
    const density = wordCount > 0 ? (found.length / wordCount) * 100 : 0;
    return { found, missing, density: parseFloat(density.toFixed(2)) };
}
function detectSections(text) {
    const lower = text.toLowerCase();
    const hasContact = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text) ||
        /(\+?\d[\d\s\-().]{7,}\d)/.test(text) ||
        lower.includes('linkedin');
    const hasSummary = /summary|objective|profile|about/.test(lower);
    const hasExperience = /experience|work history|employment/.test(lower);
    const hasEducation = /education|degree|university|college|bachelor|master|phd/.test(lower);
    const hasSkills = /skills|technologies|competencies|proficiencies/.test(lower);
    const hasProjects = /projects|portfolio/.test(lower);
    const hasCertifications = /certification|certificate|certified|license/.test(lower);
    return [
        {
            name: 'Contact Information',
            score: hasContact ? 4 : 0,
            maxScore: 4,
            feedback: hasContact
                ? ['Contact information is present.']
                : ['Add contact information (email, phone, or LinkedIn).'],
        },
        {
            name: 'Summary / Objective',
            score: hasSummary ? 4 : 0,
            maxScore: 4,
            feedback: hasSummary
                ? ['Professional summary or objective found.']
                : ['Add a professional summary or objective statement.'],
        },
        {
            name: 'Experience',
            score: hasExperience ? 8 : 0,
            maxScore: 8,
            feedback: hasExperience
                ? ['Work experience section detected.']
                : ['Add a work experience section.'],
        },
        {
            name: 'Education',
            score: hasEducation ? 6 : 0,
            maxScore: 6,
            feedback: hasEducation
                ? ['Education section detected.']
                : ['Add an education section with your degree(s).'],
        },
        {
            name: 'Skills',
            score: hasSkills ? 6 : 0,
            maxScore: 6,
            feedback: hasSkills
                ? ['Skills section detected.']
                : ['Add a dedicated skills section.'],
        },
        {
            name: 'Projects',
            score: 0,
            maxScore: 0,
            feedback: hasProjects
                ? ['Projects / portfolio section found.']
                : ['Consider adding a projects or portfolio section.'],
        },
        {
            name: 'Certifications',
            score: 0,
            maxScore: 0,
            feedback: hasCertifications
                ? ['Certifications section found.']
                : ['Consider listing relevant certifications.'],
        },
    ];
}
// ── Handler registration ──────────────────────────────────────────────────────
function registerAnalyzeHandler() {
    EventBus_1.default.on(EventBus_1.EVENTS.RESUME_PARSED, (payload) => {
        try {
            const { correlationId, text, filename } = payload;
            const sections = detectSections(text);
            const technical = matchKeywords(text, TECHNICAL_KEYWORDS);
            const softSkills = matchKeywords(text, SOFT_SKILL_KEYWORDS);
            const actionVerbs = matchKeywords(text, ACTION_VERBS);
            // _text is an internal field passed through the event chain so that
            // scoreHandler can compute content-quality metrics without shared state.
            const analyzed = {
                correlationId,
                sections,
                keywords: { technical, softSkills, actionVerbs },
                rawTextLength: text.length,
                _text: text,
                ...(filename ? { filename } : {}),
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ANALYZED, analyzed);
        }
        catch (err) {
            const errPayload = {
                correlationId: payload.correlationId,
                message: err instanceof Error ? err.message : 'Analyze error',
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ERROR, errPayload);
            EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
        }
    });
}

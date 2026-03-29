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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const EventBus_1 = __importStar(require("../events/EventBus"));
const storageHandler_1 = require("../handlers/storageHandler");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const ANALYSIS_TIMEOUT_MS = 30000;
// POST /analyze ────────────────────────────────────────────────────────────────
router.post('/analyze', upload.single('resume'), (req, res) => {
    let text = '';
    let filename;
    if (req.file) {
        text = req.file.buffer.toString('utf-8');
        filename = req.file.originalname;
    }
    else if (req.body && typeof req.body.text === 'string') {
        text = req.body.text;
    }
    if (!text || text.trim().length === 0) {
        res.status(400).json({
            error: 'No resume text provided. Send JSON { text } or upload a file.',
        });
        return;
    }
    const correlationId = (0, uuid_1.v4)();
    const resultPromise = new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            EventBus_1.default.removeListener(`${EventBus_1.EVENTS.RESUME_STORED}:${correlationId}`, onStored);
            EventBus_1.default.removeListener(`${EventBus_1.EVENTS.RESUME_ERROR}:${correlationId}`, onError);
            reject(new Error('Analysis timed out after 30 seconds.'));
        }, ANALYSIS_TIMEOUT_MS);
        function onStored(payload) {
            clearTimeout(timer);
            EventBus_1.default.removeListener(`${EventBus_1.EVENTS.RESUME_ERROR}:${correlationId}`, onError);
            resolve(payload);
        }
        function onError(payload) {
            clearTimeout(timer);
            EventBus_1.default.removeListener(`${EventBus_1.EVENTS.RESUME_STORED}:${correlationId}`, onStored);
            reject(new Error(payload.message));
        }
        EventBus_1.default.once(`${EventBus_1.EVENTS.RESUME_STORED}:${correlationId}`, onStored);
        EventBus_1.default.once(`${EventBus_1.EVENTS.RESUME_ERROR}:${correlationId}`, onError);
    });
    const submitted = {
        correlationId,
        input: { text, ...(filename ? { filename } : {}) },
    };
    EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_SUBMITTED, submitted);
    resultPromise
        .then((stored) => res.status(200).json(stored.result))
        .catch((err) => {
        const message = err instanceof Error ? err.message : 'Analysis failed.';
        res.status(500).json({ error: message });
    });
});
// GET /results ─────────────────────────────────────────────────────────────────
router.get('/results', (_req, res) => {
    res.status(200).json((0, storageHandler_1.getAllResults)());
});
// GET /results/:id ─────────────────────────────────────────────────────────────
router.get('/results/:id', (req, res) => {
    const result = (0, storageHandler_1.getResultById)(req.params.id);
    if (!result) {
        res.status(404).json({ error: `Result with id "${req.params.id}" not found.` });
        return;
    }
    res.status(200).json(result);
});
exports.default = router;

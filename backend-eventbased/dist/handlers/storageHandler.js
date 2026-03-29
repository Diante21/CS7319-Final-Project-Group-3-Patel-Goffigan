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
exports.getAllResults = getAllResults;
exports.getResultById = getResultById;
exports.registerStorageHandler = registerStorageHandler;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const EventBus_1 = __importStar(require("../events/EventBus"));
const DATA_FILE = path.join(__dirname, '../../data/results.json');
function readAll() {
    try {
        if (!fs.existsSync(DATA_FILE))
            return [];
        const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
function writeAll(results) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2), 'utf-8');
}
function getAllResults() {
    return readAll();
}
function getResultById(id) {
    return readAll().find((r) => r.id === id);
}
// ── Handler registration ──────────────────────────────────────────────────────
function registerStorageHandler() {
    EventBus_1.default.on(EventBus_1.EVENTS.RESUME_FEEDBACK_GENERATED, (payload) => {
        try {
            const { correlationId, result } = payload;
            const stored = {
                ...result,
                id: (0, uuid_1.v4)(),
                timestamp: new Date().toISOString(),
            };
            const all = readAll();
            all.push(stored);
            writeAll(all);
            const storedPayload = { correlationId, result: stored };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_STORED, storedPayload);
            EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_STORED}:${correlationId}`, storedPayload);
        }
        catch (err) {
            const errPayload = {
                correlationId: payload.correlationId,
                message: err instanceof Error ? err.message : 'Storage error',
            };
            EventBus_1.default.emit(EventBus_1.EVENTS.RESUME_ERROR, errPayload);
            EventBus_1.default.emit(`${EventBus_1.EVENTS.RESUME_ERROR}:${payload.correlationId}`, errPayload);
        }
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Register all event handlers (subscriptions) at startup
const parseHandler_1 = require("./handlers/parseHandler");
const analyzeHandler_1 = require("./handlers/analyzeHandler");
const scoreHandler_1 = require("./handlers/scoreHandler");
const feedbackHandler_1 = require("./handlers/feedbackHandler");
const storageHandler_1 = require("./handlers/storageHandler");
const analyzeRoutes_1 = __importDefault(require("./routes/analyzeRoutes"));
(0, parseHandler_1.registerParseHandler)();
(0, analyzeHandler_1.registerAnalyzeHandler)();
(0, scoreHandler_1.registerScoreHandler)();
(0, feedbackHandler_1.registerFeedbackHandler)();
(0, storageHandler_1.registerStorageHandler)();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.json({ status: 'ok', architecture: 'event-based' });
});
app.use('/api', analyzeRoutes_1.default);
app.listen(PORT, () => {
    console.log(`[event-based] Server running on http://localhost:${PORT}`);
});
exports.default = app;

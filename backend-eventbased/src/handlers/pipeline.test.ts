import EventBus, { EVENTS } from '../events/EventBus';
import { registerParseHandler } from '../handlers/parseHandler';
import { registerAnalyzeHandler } from '../handlers/analyzeHandler';
import { registerScoreHandler } from '../handlers/scoreHandler';
import { registerFeedbackHandler } from '../handlers/feedbackHandler';
import { StoredPayload, ErrorPayload } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Register all handlers once for the test suite
registerParseHandler();
registerAnalyzeHandler();
registerScoreHandler();
registerFeedbackHandler();

// Lightweight in-memory storage handler for tests (avoids file I/O)
EventBus.on(EVENTS.RESUME_FEEDBACK_GENERATED, (payload: any) => {
  const stored: StoredPayload = {
    correlationId: payload.correlationId,
    result: {
      ...payload.result,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    },
  };
  EventBus.emit(EVENTS.RESUME_STORED, stored);
  EventBus.emit(`${EVENTS.RESUME_STORED}:${payload.correlationId}`, stored);
});

const SAMPLE_RESUME = `
Jane Smith
jane.smith@example.com
555-987-6543

SUMMARY
Experienced software engineer with 6 years building scalable web applications.

EXPERIENCE
Senior Software Engineer — Acme Corp (2020–2023)
  Developed and implemented React and TypeScript applications serving 10000+ users.
  Reduced page load time by 40% through optimization.
  Led a team of 5 engineers to deliver 3 major features.

EDUCATION
Bachelor of Science in Computer Science — State University (2018)

SKILLS
JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker, Git,
leadership, communication, problem-solving, teamwork
`;

function analyzeViaEvents(text: string, filename?: string): Promise<StoredPayload> {
  return new Promise((resolve, reject) => {
    const correlationId = uuidv4();

    const timeout = setTimeout(() => {
      reject(new Error('Timeout: analysis did not complete'));
    }, 5000);

    EventBus.once(`${EVENTS.RESUME_STORED}:${correlationId}`, (payload: StoredPayload) => {
      clearTimeout(timeout);
      resolve(payload);
    });

    EventBus.once(`${EVENTS.RESUME_ERROR}:${correlationId}`, (payload: ErrorPayload) => {
      clearTimeout(timeout);
      reject(new Error(payload.message));
    });

    EventBus.emit(EVENTS.RESUME_SUBMITTED, {
      correlationId,
      input: { text, filename },
    });
  });
}

describe('event-based pipeline', () => {
  test('completes the full event chain and returns a result', async () => {
    const payload = await analyzeViaEvents(SAMPLE_RESUME);
    expect(payload.result).toBeDefined();
    expect(payload.correlationId).toBeDefined();
  });

  test('result has an id and timestamp', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(result.id).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
  });

  test('overall score is between 0 and 100', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  test('grade is a valid letter grade', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(result.grade).toMatch(/^(A\+|A|B|C|D|F)$/);
  });

  test('detects experience and education sections', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    const sectionNames = result.sections.map((s) => s.name);
    expect(sectionNames).toContain('Experience');
    expect(sectionNames).toContain('Education');
  });

  test('detects React and TypeScript in technical keywords', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(result.keywords.technical.found).toContain('React');
    expect(result.keywords.technical.found).toContain('TypeScript');
  });

  test('detects action verbs', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(result.keywords.actionVerbs.found.length).toBeGreaterThan(0);
  });

  test('high-quality resume scores at least 60', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(result.overallScore).toBeGreaterThanOrEqual(60);
  });

  test('emits error for empty resume text', async () => {
    await expect(analyzeViaEvents('   ')).rejects.toThrow(
      'No resume text provided',
    );
  });

  test('preserves filename in result when provided', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME, 'resume.txt');
    expect(result.filename).toBe('resume.txt');
  });

  test('feedback object has critical, improvements, and strengths arrays', async () => {
    const { result } = await analyzeViaEvents(SAMPLE_RESUME);
    expect(Array.isArray(result.feedback.critical)).toBe(true);
    expect(Array.isArray(result.feedback.improvements)).toBe(true);
    expect(Array.isArray(result.feedback.strengths)).toBe(true);
  });
});

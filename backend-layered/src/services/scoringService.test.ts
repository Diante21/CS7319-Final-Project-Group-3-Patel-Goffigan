import { scoreResume } from './scoringService';

const SAMPLE_RESUME = `
Jane Smith
jane.smith@example.com
555-987-6543

SUMMARY
Experienced software engineer with 6 years building scalable web applications.

EXPERIENCE
Senior Software Engineer — Acme Corp (2020–2023)
  Developed and implemented React and TypeScript applications serving 10000+ users.
  Reduced page load time by 40% through optimization of API calls.
  Led a team of 5 engineers to deliver 3 major features.
  Architected a CI/CD pipeline using Docker and Kubernetes.

Software Engineer — StartupXYZ (2018–2020)
  Built REST API endpoints with Node.js and PostgreSQL.
  Deployed microservices on AWS using Docker containers.
  Collaborated with product team to streamline delivery process.

EDUCATION
Bachelor of Science in Computer Science — State University (2018)

SKILLS
JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker, Git, GraphQL,
MongoDB, PostgreSQL, Kubernetes, CI/CD, Agile, Machine Learning, HTML, CSS
leadership, communication, problem-solving, teamwork, analytical

PROJECTS
  Built an open-source GraphQL client library (200+ GitHub stars).
  Developed a machine learning pipeline using Python.

CERTIFICATIONS
  AWS Certified Solutions Architect (2022)
`;

describe('scoringService', () => {
  let result: ReturnType<typeof scoreResume>;

  beforeAll(() => {
    result = scoreResume(SAMPLE_RESUME);
  });

  test('returns a score between 0 and 100', () => {
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  test('assigns a non-empty grade', () => {
    expect(result.grade).toMatch(/^(A\+|A|B|C|D|F)$/);
  });

  test('detects all major sections', () => {
    const sectionNames = result.sections.map((s) => s.name);
    expect(sectionNames).toContain('Contact Information');
    expect(sectionNames).toContain('Experience');
    expect(sectionNames).toContain('Education');
    expect(sectionNames).toContain('Skills');
  });

  test('contact section scores full 4 pts when email and phone present', () => {
    const contact = result.sections.find((s) => s.name === 'Contact Information');
    expect(contact).toBeDefined();
    expect(contact!.score).toBe(4);
  });

  test('experience section scores full 8 pts when detected', () => {
    const exp = result.sections.find((s) => s.name === 'Experience');
    expect(exp).toBeDefined();
    expect(exp!.score).toBe(8);
  });

  test('education section scores full 6 pts when detected', () => {
    const edu = result.sections.find((s) => s.name === 'Education');
    expect(edu).toBeDefined();
    expect(edu!.score).toBe(6);
  });

  test('detects technical keywords', () => {
    expect(result.keywords.technical.found.length).toBeGreaterThan(5);
    expect(result.keywords.technical.found).toContain('React');
    expect(result.keywords.technical.found).toContain('TypeScript');
    expect(result.keywords.technical.found).toContain('Docker');
  });

  test('detects soft-skill keywords', () => {
    expect(result.keywords.softSkills.found).toContain('leadership');
    expect(result.keywords.softSkills.found).toContain('communication');
  });

  test('detects action verbs', () => {
    expect(result.keywords.actionVerbs.found).toContain('developed');
    expect(result.keywords.actionVerbs.found).toContain('led');
  });

  test('returns rawTextLength equal to input length', () => {
    expect(result.rawTextLength).toBe(SAMPLE_RESUME.length);
  });

  test('high-quality resume scores at least 70', () => {
    expect(result.overallScore).toBeGreaterThanOrEqual(70);
  });

  test('empty resume scores low', () => {
    const empty = scoreResume('no relevant content here at all');
    expect(empty.overallScore).toBeLessThan(30);
  });

  test('section feedback arrays are non-empty', () => {
    for (const section of result.sections) {
      expect(section.feedback.length).toBeGreaterThan(0);
    }
  });
});

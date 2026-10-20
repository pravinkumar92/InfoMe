-- Seed data for InfoMe

-- Insert sample sources
INSERT INTO sources (id, name, url, type, category, logo, is_active, notice_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'AKTU Lucknow', 'https://aktu.ac.in', 'university', 'exams', '🎓', TRUE, 142),
  ('550e8400-e29b-41d4-a716-446655440002', 'National Scholarship Portal', 'https://scholarships.gov.in', 'government', 'scholarships', '🏛️', TRUE, 87),
  ('550e8400-e29b-41d4-a716-446655440003', 'UPPSC', 'https://uppsc.up.nic.in', 'government', 'jobs', '🏢', TRUE, 65),
  ('550e8400-e29b-41d4-a716-446655440004', 'Bundelkhand University', 'https://bujhansi.ac.in', 'university', 'results', '📚', TRUE, 53),
  ('550e8400-e29b-41d4-a716-446655440005', 'LMC Smart City', 'https://lmc.up.nic.in', 'civic', 'tenders', '🏙️', TRUE, 31),
  ('550e8400-e29b-41d4-a716-446655440006', 'IIT Kanpur', 'https://iitk.ac.in', 'university', 'admissions', '🔬', TRUE, 78),
  ('550e8400-e29b-41d4-a716-446655440007', 'UP Disaster Management', 'https://upsdma.up.gov.in', 'government', 'civic', '🚨', TRUE, 19),
  ('550e8400-e29b-41d4-a716-446655440008', 'SSC India', 'https://ssc.nic.in', 'government', 'jobs', '📋', TRUE, 112);

-- Insert sample notices
INSERT INTO notices (id, title, description, summary, category, department, last_date, amount, urgency, source_id, pdf_url, hash, views) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'AKTU B.Tech Exam Schedule 2026 – Even Semester',
    'Dr. A.P.J. Abdul Kalam Technical University has released the even semester examination schedule for B.Tech 2nd, 4th, 6th and 8th semester students. All students must download their admit cards before the exam.',
    'AKTU Even Semester 2026 exams scheduled. Download admit cards from official portal. Exams begin April 20.',
    'Exams',
    'AKTU Lucknow',
    '2026-04-20 23:59:59',
    NULL,
    'high',
    '550e8400-e29b-41d4-a716-446655440001',
    'https://aktu.ac.in/pdf/exam-schedule-2026.pdf',
    'aktu-exam-2026-even-sem',
    4520
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'PM Scholarship Scheme 2026 – Applications Open',
    'Prime Minister Scholarship Scheme for Central Armed Force Ex-Servicemen is accepting applications. Eligible candidates must apply before the deadline. Scholarship amount is ₹36,000 per year for boys and ₹30,000 for girls.',
    'PM Scholarship 2026 open. Boys get ₹36k/yr, Girls ₹30k/yr. Apply before April 30 via NSP portal.',
    'Scholarships',
    'Ministry of Home Affairs',
    '2026-04-30 23:59:59',
    '₹36,000/year',
    'high',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://scholarships.gov.in/pdf/pm-scholarship-2026.pdf',
    'pm-scholarship-2026',
    8700
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'UP Government Sarkari Naukri – 5000 Posts (Group C)',
    'Uttar Pradesh Public Service Commission has announced 5000 Group C vacancies across various departments. Eligible candidates with graduation degree can apply online through official UPPSC portal.',
    'UPPSC invites applications for 5000 Group-C posts. Graduation required. Last date May 10, 2026.',
    'Jobs',
    'UPPSC',
    '2026-05-10 23:59:59',
    NULL,
    'medium',
    '550e8400-e29b-41d4-a716-446655440003',
    'https://uppsc.up.nic.in/pdf/group-c-2026.pdf',
    'uppsc-group-c-5000-2026',
    15300
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    'BU Jhansi B.Sc Result 2026 Declared',
    'Bundelkhand University Jhansi has declared B.Sc Part-I, Part-II, and Part-III results for 2026. Students can check their results on the official university website.',
    'BU Jhansi B.Sc 1st, 2nd, 3rd year results 2026 out. Check on official portal with roll number.',
    'Results',
    'Bundelkhand University',
    NULL,
    NULL,
    'medium',
    '550e8400-e29b-41d4-a716-446655440004',
    'https://bujhansi.ac.in/pdf/bsc-result-2026.pdf',
    'bu-jhansi-bsc-result-2026',
    9200
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    'Lucknow Smart City Tender – Road Construction Phase III',
    'Lucknow Municipal Corporation invites sealed tenders for Smart City Phase III road construction project worth ₹45 crore. Eligible civil contractors may submit bids.',
    'LMC invites tenders for Smart City Phase-III roads worth ₹45Cr. Last date April 15.',
    'Tenders',
    'LMC / Smart City',
    '2026-04-15 23:59:59',
    '₹45 Crore',
    'low',
    '550e8400-e29b-41d4-a716-446655440005',
    'https://lmc.up.nic.in/pdf/tender-phase3-2026.pdf',
    'lmc-smart-city-phase3-2026',
    3100
  ),
  (
    '650e8400-e29b-41d4-a716-446655440006',
    'IITK M.Tech Admissions 2026-27 – GATE Score Based',
    'IIT Kanpur is accepting applications for M.Tech programs for session 2026-27. Admission based on valid GATE score. Applicants must have B.Tech/B.E. with 60% marks.',
    'IITK M.Tech 2026-27 applications via GATE score. Min 60% in B.Tech. Apply before April 25.',
    'Admissions',
    'IIT Kanpur',
    '2026-04-25 23:59:59',
    NULL,
    'high',
    '550e8400-e29b-41d4-a716-446655440006',
    'https://iitk.ac.in/pdf/mtech-admissions-2026.pdf',
    'iitk-mtech-2026-27',
    6800
  ),
  (
    '650e8400-e29b-41d4-a716-446655440007',
    'URGENT: Flood Alert – Districts of Eastern UP',
    'IMD has issued red alert for heavy rainfall in Gorakhpur, Basti, Deoria and adjoining districts. NDRF teams deployed. Citizens advised to avoid low-lying areas.',
    'Red alert: Heavy rain & flood risk in Eastern UP – Gorakhpur, Basti, Deoria. Avoid waterlogged zones.',
    'Civic Alerts',
    'UP Disaster Management',
    NULL,
    NULL,
    'critical',
    '550e8400-e29b-41d4-a716-446655440007',
    NULL,
    'flood-alert-eastern-up-2026',
    21000
  ),
  (
    '650e8400-e29b-41d4-a716-446655440008',
    'Central Sector Scholarship – Science Students 2026',
    'Ministry of Education announces Central Sector Scheme of Scholarship for College and University students studying Science stream. Annual scholarship of ₹12,000 for degree students.',
    'Scholarship ₹12k/yr for Science students in college. Apply via NSP before May 31.',
    'Scholarships',
    'Ministry of Education',
    '2026-05-31 23:59:59',
    '₹12,000/year',
    'medium',
    '550e8400-e29b-41d4-a716-446655440002',
    'https://scholarships.gov.in/pdf/central-sector-science-2026.pdf',
    'central-sector-science-2026',
    5600
  );

-- Insert deadlines for notices with last_date
INSERT INTO deadlines (notice_id, deadline, urgency_score) 
SELECT id, last_date, 
  CASE 
    WHEN last_date - NOW() < INTERVAL '7 days' THEN 90
    WHEN last_date - NOW() < INTERVAL '14 days' THEN 70
    WHEN last_date - NOW() < INTERVAL '30 days' THEN 50
    ELSE 30
  END
FROM notices 
WHERE last_date IS NOT NULL;

-- Insert sample scraper logs
INSERT INTO scraper_logs (source_id, status, message, notices_found, notices_new, duration_ms) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'success', 'Successfully scraped AKTU portal', 12, 3, 4500),
  ('550e8400-e29b-41d4-a716-446655440002', 'success', 'Successfully scraped NSP', 8, 2, 3200),
  ('550e8400-e29b-41d4-a716-446655440003', 'success', 'Successfully scraped UPPSC', 15, 5, 6800),
  ('550e8400-e29b-41d4-a716-446655440007', 'success', 'Successfully scraped disaster management portal', 2, 1, 2100);

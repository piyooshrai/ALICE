-- ALICE Database Schema for Vercel Postgres
-- Copy and paste this entire script into Vercel Postgres SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_key_hash VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Developers table
CREATE TABLE IF NOT EXISTS developers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    current_grade VARCHAR(10),
    current_score INTEGER,
    role_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES developers(id) ON DELETE SET NULL,
    quality_score INTEGER NOT NULL,
    grade VARCHAR(10) NOT NULL,
    role_level VARCHAR(50),
    total_files INTEGER DEFAULT 0,
    critical_bugs INTEGER DEFAULT 0,
    high_bugs INTEGER DEFAULT 0,
    medium_bugs INTEGER DEFAULT 0,
    low_bugs INTEGER DEFAULT 0,
    test_failure_rate DECIMAL(5,2) DEFAULT 0,
    deployment_status VARCHAR(50),
    strengths TEXT[],
    weaknesses TEXT[],
    raw_data JSONB,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    html_content TEXT,
    sent_to VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bug details table
CREATE TABLE IF NOT EXISTS bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    line_number INTEGER,
    description TEXT NOT NULL,
    impact TEXT,
    fix_suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analyses_project ON analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_analyses_developer ON analyses(developer_id);
CREATE INDEX IF NOT EXISTS idx_analyses_date ON analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_grade ON analyses(grade);
CREATE INDEX IF NOT EXISTS idx_bugs_analysis ON bugs(analysis_id);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_reports_analysis ON reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_developers_email ON developers(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_developers_updated_at ON developers;
CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

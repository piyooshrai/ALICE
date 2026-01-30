"""
ALICE Database Models
SQLAlchemy ORM models for PostgreSQL
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, String, Integer, DateTime, DECIMAL, ARRAY, Text,
    ForeignKey, create_engine, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import uuid

Base = declarative_base()


class Project(Base):
    __tablename__ = 'projects'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, nullable=False)
    api_key_hash = Column(String(64), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analyses = relationship('Analysis', back_populates='project', cascade='all, delete-orphan')


class Developer(Base):
    __tablename__ = 'developers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    current_grade = Column(String(10))
    current_score = Column(Integer)
    role_level = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analyses = relationship('Analysis', back_populates='developer')


class Analysis(Base):
    __tablename__ = 'analyses'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id', ondelete='CASCADE'))
    developer_id = Column(UUID(as_uuid=True), ForeignKey('developers.id', ondelete='SET NULL'))
    quality_score = Column(Integer, nullable=False)
    grade = Column(String(10), nullable=False)
    role_level = Column(String(50))
    total_files = Column(Integer, default=0)
    critical_bugs = Column(Integer, default=0)
    high_bugs = Column(Integer, default=0)
    medium_bugs = Column(Integer, default=0)
    low_bugs = Column(Integer, default=0)
    test_failure_rate = Column(DECIMAL(5, 2), default=0)
    deployment_status = Column(String(50))
    strengths = Column(ARRAY(Text))
    weaknesses = Column(ARRAY(Text))
    raw_data = Column(JSONB)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship('Project', back_populates='analyses')
    developer = relationship('Developer', back_populates='analyses')
    reports = relationship('Report', back_populates='analysis', cascade='all, delete-orphan')
    bugs = relationship('Bug', back_populates='analysis', cascade='all, delete-orphan')


class Report(Base):
    __tablename__ = 'reports'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analyses.id', ondelete='CASCADE'))
    report_type = Column(String(50), nullable=False)  # 'technical' or 'management'
    html_content = Column(Text)
    sent_to = Column(String(255))
    sent_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship('Analysis', back_populates='reports')


class Bug(Base):
    __tablename__ = 'bugs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analyses.id', ondelete='CASCADE'))
    severity = Column(String(20), nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    category = Column(String(50), nullable=False)
    file_path = Column(String(500))
    line_number = Column(Integer)
    description = Column(Text, nullable=False)
    impact = Column(Text)
    fix_suggestion = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analysis = relationship('Analysis', back_populates='bugs')


class DatabaseManager:
    """Database connection and session management"""

    def __init__(self, database_url: str):
        self.engine = create_engine(database_url, pool_pre_ping=True)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def create_tables(self):
        """Create all tables"""
        Base.metadata.create_all(bind=self.engine)

    def get_session(self):
        """Get a new database session"""
        return self.SessionLocal()

    def close(self):
        """Close database connection"""
        self.engine.dispose()

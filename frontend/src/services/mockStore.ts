// Mock in-memory & localStorage store for instant cloud operation when backend is offline
import type { Credential, User } from '../types';

export const DEMO_USERS: Record<string, { user: User; pass: string; token: string }> = {
  'alex@student.edu': {
    pass: 'alex123',
    token: 'mock-jwt-alex-student-token',
    user: {
      id: 1,
      name: 'Alex Rivera',
      email: 'alex@student.edu',
      role: 'STUDENT',
      profile: {
        student_id: 1,
        student_identifier: 'STU-2026-001',
        college: 'Apex Institute of Technology',
        course: 'B.Tech Artificial Intelligence & Data Science',
        graduation_year: 2026,
      },
    },
  },
  'apex@skillchain.edu': {
    pass: 'apex123',
    token: 'mock-jwt-apex-institution-token',
    user: {
      id: 2,
      name: 'Apex Institute of Technology',
      email: 'apex@skillchain.edu',
      role: 'INSTITUTION',
      profile: {
        institution_id: 1,
        institution_name: 'Apex Institute of Technology',
        registration_number: 'APEX-UNIV-9920',
        verification_status: 'APPROVED',
      },
    },
  },
  'admin@skillchain.edu': {
    pass: 'admin123',
    token: 'mock-jwt-admin-token',
    user: {
      id: 3,
      name: 'Platform Administrator',
      email: 'admin@skillchain.edu',
      role: 'ADMIN',
    },
  },
};

export const INITIAL_CREDENTIALS: Credential[] = [
  {
    id: 1,
    credential_id: 'SKILL-2026-ML01',
    title: 'Machine Learning Specialization & Neural Networks',
    description: 'Demonstrated practical mastery of Python, Scikit-learn, Pandas, and TensorFlow architectures over 12 intensive weeks.',
    credential_type: 'Internship',
    issue_date: '2026-08-08T10:00:00Z',
    student_name: 'Alex Rivera',
    student_identifier: 'STU-2026-001',
    institution_name: 'Apex Institute of Technology',
    certificate_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    blockchain_transaction_hash: '0x7b584920fc4c919736c9d09f7a14e92a83bd78184c8a24ad865764fa1e129',
    blockchain_network: 'Hardhat Localhost (ChainID: 31337)',
    contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    status: 'ISSUED',
    created_at: '2026-08-08T10:00:00Z',
  },
  {
    id: 2,
    credential_id: 'SKILL-2026-AI02',
    title: 'National AI Hackathon - First Place Winner',
    description: 'Built an autonomous multi-modal agent for medical diagnostic assistance using Python, PyTorch and FastAPI.',
    credential_type: 'Hackathon',
    issue_date: '2026-09-07T12:00:00Z',
    student_name: 'Alex Rivera',
    student_identifier: 'STU-2026-001',
    institution_name: 'Apex Institute of Technology',
    certificate_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    blockchain_transaction_hash: '0x3a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    blockchain_network: 'Hardhat Localhost (ChainID: 31337)',
    contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    status: 'ISSUED',
    created_at: '2026-09-07T12:00:00Z',
  },
  {
    id: 3,
    credential_id: 'SKILL-2026-WEB03',
    title: 'Full Stack React & Modern Cloud Architecture',
    description: 'Completed advanced enterprise web development with React, TypeScript, Tailwind CSS, and REST API microservices.',
    credential_type: 'Certificate',
    issue_date: '2026-08-23T09:30:00Z',
    student_name: 'Sarah Chen',
    student_identifier: 'STU-2026-002',
    institution_name: 'Apex Institute of Technology',
    certificate_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    blockchain_transaction_hash: '0x99a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8',
    blockchain_network: 'Hardhat Localhost (ChainID: 31337)',
    contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    status: 'ISSUED',
    created_at: '2026-08-23T09:30:00Z',
  },
  {
    id: 4,
    credential_id: 'SKILL-2026-REV05',
    title: 'Introductory Data Analytics BootCamp',
    description: 'Revoked due to course cancellation and curriculum restructuring.',
    credential_type: 'Course',
    issue_date: '2026-07-09T08:00:00Z',
    student_name: 'Alex Rivera',
    student_identifier: 'STU-2026-001',
    institution_name: 'Apex Institute of Technology',
    certificate_hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    blockchain_transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockchain_network: 'Hardhat Localhost (ChainID: 31337)',
    contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    status: 'REVOKED',
    created_at: '2026-07-09T08:00:00Z',
    revoked_at: '2026-10-02T14:20:00Z',
    revocation_reason: 'Curriculum superseded by 2026 AI Specialization accreditation',
  },
];

export const getStoredCredentials = (): Credential[] => {
  const data = localStorage.getItem('skillchain_credentials');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('skillchain_credentials', JSON.stringify(INITIAL_CREDENTIALS));
  return INITIAL_CREDENTIALS;
};

export const saveStoredCredentials = (creds: Credential[]) => {
  localStorage.setItem('skillchain_credentials', JSON.stringify(creds));
};

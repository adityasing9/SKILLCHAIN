export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTITUTION' | 'VERIFIER' | 'ADMIN';
  profile?: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Credential {
  id: number;
  credential_id: string;
  title: string;
  description?: string;
  credential_type: string;
  issue_date: string;
  student_name: string;
  student_identifier: string;
  institution_name: string;
  certificate_file_reference?: string;
  certificate_hash: string;
  blockchain_transaction_hash?: string;
  blockchain_network: string;
  contract_address?: string;
  status: 'ISSUED' | 'VERIFIED' | 'REVOKED';
  created_at: string;
  revoked_at?: string;
  revocation_reason?: string;
}

export interface VerificationResult {
  status: 'AUTHENTIC' | 'REVOKED' | 'HASH_MISMATCH' | 'NOT_FOUND';
  is_valid: boolean;
  is_revoked: boolean;
  hash_matched: boolean;
  credential_id: string;
  title?: string;
  student_name?: string;
  institution_name?: string;
  issue_date?: string;
  certificate_hash?: string;
  submitted_file_hash?: string;
  blockchain_status: string;
  blockchain_tx?: string;
  contract_address?: string;
  revocation_reason?: string;
  revoked_at?: string;
  message: string;
}

export interface SkillItem {
  id: number;
  skill_name: string;
  category: string;
  confidence_score: number;
  confidence_percentage: number;
  source: string;
}

export interface SkillRecommendation {
  id: number;
  skill_name: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  related_existing_skill?: string;
  created_at: string;
}

export interface ResumeAnalysisResult {
  summary: string;
  detected_skills: any[];
  experience: any[];
  projects: any[];
  skill_gaps: any[];
  recommendations: any[];
}

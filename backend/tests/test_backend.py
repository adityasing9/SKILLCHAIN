import unittest
from fastapi.testclient import TestClient
from app.main import app

class SkillChainBackendTestCase(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")

    def test_student_and_institution_login(self):
        # Test Institution Login
        resp_inst = self.client.post("/api/auth/login", json={
            "email": "apex@skillchain.edu",
            "password": "apex123"
        })
        self.assertEqual(resp_inst.status_code, 200)
        data_inst = resp_inst.json()
        self.assertIn("access_token", data_inst)
        self.assertEqual(data_inst["user"]["role"], "INSTITUTION")

        # Test Student Login
        resp_stu = self.client.post("/api/auth/login", json={
            "email": "alex@student.edu",
            "password": "alex123"
        })
        self.assertEqual(resp_stu.status_code, 200)
        data_stu = resp_stu.json()
        self.assertEqual(data_stu["user"]["role"], "STUDENT")

    def test_public_verification_authentic_credential(self):
        # Query seeded authentic credential
        response = self.client.get("/api/verify/SKILL-2026-ML01")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "AUTHENTIC")
        self.assertTrue(data["is_valid"])
        self.assertFalse(data["is_revoked"])
        self.assertEqual(data["credential_id"], "SKILL-2026-ML01")

    def test_public_verification_revoked_credential(self):
        # Query seeded revoked credential
        response = self.client.get("/api/verify/SKILL-2026-REV05")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "REVOKED")
        self.assertFalse(data["is_valid"])
        self.assertTrue(data["is_revoked"])

    def test_public_verification_nonexistent_credential(self):
        response = self.client.get("/api/verify/SKILL-NOT-EXIST")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "NOT_FOUND")
        self.assertFalse(data["is_valid"])

    def test_tamper_detection_mismatch(self):
        # Upload tampered mock bytes against authentic credential
        tampered_content = b"TAMPERED CERTIFICATE CONTENT MODIFIED BY MALICIOUS ACTOR"
        response = self.client.post(
            "/api/verify/compare-hash",
            data={"credential_id": "SKILL-2026-ML01"},
            files={"file": ("fake.pdf", tampered_content, "application/pdf")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "HASH_MISMATCH")
        self.assertFalse(data["is_valid"])
        self.assertFalse(data["hash_matched"])

    def test_ai_skill_extraction_engine(self):
        from app.ai.ai_service import ai_engine
        text = "Experienced in Machine Learning and Python with Scikit-learn and Pandas dataframes."
        skills = ai_engine.extract_skills_from_text(text)
        skill_names = [s["skill_name"] for s in skills]
        self.assertIn("Python", skill_names)
        self.assertIn("Machine Learning", skill_names)

if __name__ == "__main__":
    unittest.main()

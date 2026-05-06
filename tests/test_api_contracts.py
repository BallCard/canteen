import unittest

from fastapi.testclient import TestClient

from backend.main import app


class ApiContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_suggestions_filter_by_keyword(self):
        response = self.client.get("/api/dishes/suggestions?keyword=牛肉")

        self.assertEqual(response.status_code, 200)
        names = [item["name"] for item in response.json()]
        self.assertTrue(names)
        self.assertTrue(all("牛肉" in name for name in names))

    def test_reviews_include_frontend_display_fields(self):
        response = self.client.get("/api/reviews?dish_id=1")

        self.assertEqual(response.status_code, 200)
        review = response.json()[0]
        self.assertTrue(review["avatar"])
        self.assertEqual(review["date"], review["created_at"])

    def test_meal_logs_include_frontend_time_field(self):
        response = self.client.get("/api/meal-logs/today")

        self.assertEqual(response.status_code, 200)
        log = response.json()[0]
        self.assertEqual(log["time"], "12:00")

    def test_confirm_dish_returns_updated_dish_shape(self):
        create_response = self.client.post(
            "/api/dishes",
            json={"name": "测试青菜", "price": 6, "canteen_id": 1},
        )
        self.assertEqual(create_response.status_code, 200)
        dish = create_response.json()

        confirm_response = self.client.post(f"/api/dishes/{dish['id']}/confirm")

        self.assertEqual(confirm_response.status_code, 200)
        confirmed = confirm_response.json()
        self.assertEqual(confirmed["id"], dish["id"])
        self.assertEqual(confirmed["confirmations"], 2)


if __name__ == "__main__":
    unittest.main()

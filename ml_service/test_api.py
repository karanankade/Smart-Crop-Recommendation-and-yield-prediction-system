import unittest
import json
from app import app

class TestMLService(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_recommend_crop(self):
        payload = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 20.8797,
            "humidity": 82.0027,
            "ph": 6.5029,
            "rainfall": 202.9355
        }
        response = self.app.post('/recommend-crop', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("recommended", data)
        self.assertTrue(len(data["recommended"]) > 0)
        
        # Verify recommendation structure
        rec = data["recommended"][0]
        self.assertIn("name", rec)
        self.assertIn("confidence", rec)
        self.assertIn("growingTime", rec)
        self.assertIn("waterReq", rec)
        self.assertIn("expectedProfit", rec)
        print("\nRecommend Crop Test passed. Result sample:")
        print(str(rec).encode('ascii', errors='replace').decode('ascii'))

    def test_predict_yield(self):
        payload = {
            "crop": "Wheat",
            "area": 5.0,
            "temperature": 24.5,
            "rainfall": 950.0
        }
        response = self.app.post('/predict-yield', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("predictedYield", data)
        self.assertIn("yieldPerHa", data)
        self.assertIn("estimatedProfit", data)
        
        print("\nPredict Yield Test passed. Result sample:")
        print(data)

    def test_analyze_soil(self):
        payload = {
            "N": 35,
            "P": 20,
            "K": 50,
            "humidity": 65,
            "temperature": 25,
            "moisture": 40,
            "soilType": "Loamy",
            "crop": "Wheat"
        }
        response = self.app.post('/analyze-soil', 
                                 data=json.dumps(payload),
                                 content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("soilTest", data)
        self.assertIn("fertilizerSuggestions", data)
        self.assertIn("diseaseRisk", data)
        
        print("\nAnalyze Soil Test passed. Result sample:")
        print(data)

if __name__ == '__main__':
    unittest.main()

from locust import HttpUser, task, between

class RejectionIQUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(3)
    def test_root(self):
        self.client.get("/")

    @task(3)
    def test_health(self):
        self.client.get("/api/health")

    @task(2)
    def test_analytics(self):
        self.client.get("/api/analysis/overview")

    @task(2)
    def test_rejections(self):
        self.client.get("/api/rejections")

    @task(1)
    def test_recovery(self):
        self.client.get("/api/recovery/sprint")

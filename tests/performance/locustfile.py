from locust import HttpUser, task, between
from random import choice
import json
import uuid

class PlanningPokerUser(HttpUser):
    wait_time = between(1, 3)  # Wait between 1-3 seconds between tasks
    
    def on_start(self):
        """Initialize user state on start"""
        self.game_id = None
        self.player_id = str(uuid.uuid4())
        self.player_name = f"Perf-{self.player_id[:8]}"
        self.avatar_url = "https://api.dicebear.com/7.x/personas/svg?seed=exec1"
        self.ws = None

    @task(1)
    def create_game(self):
        """Create a new game"""
        if not self.game_id:
            response = self.client.post("/api/games", json={
                "maxPlayers": 5,
                "timerDuration": 300
            })
            if response.status_code == 200:
                self.game_id = response.json()["id"]
                self.join_game()

    @task(3)
    def join_game(self):
        """Join an existing game"""
        if self.game_id:
            response = self.client.post(f"/api/games/{self.game_id}/join", json={
                "name": self.player_name,
                "avatarUrl": self.avatar_url
            })
            if response.status_code == 200:
                self.connect_websocket()

    @task(5)
    def submit_vote(self):
        """Submit a vote"""
        if self.game_id:
            vote_values = [1, 2, 3, 5, 8, 13]
            confidence_levels = [60, 70, 80, 90, 100]
            
            response = self.client.post(f"/api/games/{self.game_id}/vote", json={
                "playerId": self.player_id,
                "value": choice(vote_values),
                "confidence": choice(confidence_levels)
            })
            
            if response.status_code != 200:
                self.game_id = None  # Reset game if vote fails

    @task(2)
    def get_game_state(self):
        """Get current game state"""
        if self.game_id:
            self.client.get(f"/api/games/{self.game_id}")

    def connect_websocket(self):
        """Connect to WebSocket"""
        if self.game_id and not self.ws:
            ws_url = f"ws://{self.host}/api/websocket"
            try:
                self.ws = self.client.connect_ws(ws_url)
                self.ws.send(json.dumps({
                    "type": "join",
                    "gameId": self.game_id
                }))
            except Exception as e:
                print(f"WebSocket connection failed: {e}")
                self.ws = None

    def on_stop(self):
        """Cleanup on stop"""
        if self.ws:
            self.ws.close()
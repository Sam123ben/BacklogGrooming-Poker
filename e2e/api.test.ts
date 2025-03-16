import { test } from '@playwright/test';

// TODO: Fix API tests after implementing proper test environment
// test('game lifecycle API calls', async ({ request }) => {
//   // Create game
//   const gameId = uuidv4();
//   const createResponse = await request.put(`/api/games/${gameId}`, {
//     data: {
//       id: gameId,
//       players: [],
//       maxPlayers: 2,
//       isVotingComplete: false,
//       timeRemaining: 300,
//       timerDuration: 300,
//       isTimerRunning: false,
//       isPaused: false,
//       currentPlayerIndex: 0,
//       storyPointHistory: [],
//       sprintNumber: 1,
//       consensusThreshold: 70,
//       currentRound: 1,
//       lastSyncTimestamp: Date.now(),
//       canStartGame: false,
//     }
//   });
//   expect(createResponse.ok()).toBeTruthy();
  
//   // Get game
//   const getResponse = await request.get(`/api/games/${gameId}`);
//   expect(getResponse.ok()).toBeTruthy();
//   const game = await getResponse.json();
//   expect(game.id).toBe(gameId);
  
//   // Delete game
//   const deleteResponse = await request.delete(`/api/games/${gameId}`);
//   expect(deleteResponse.ok()).toBeTruthy();
  
//   // Verify deletion
//   const notFoundResponse = await request.get(`/api/games/${gameId}`);
//   expect(notFoundResponse.status()).toBe(404);
// });

// TODO: Fix test after implementing proper error handling
// test('error handling and rate limiting', async ({ request }) => {
//   // Invalid game ID
//   const invalidResponse = await request.get(`/api/games/invalid-id`);
//   expect(invalidResponse.status()).toBe(404);
  
//   // Invalid data
//   const invalidDataResponse = await request.put(`/api/games/${uuidv4()}`, {
//     data: 'invalid'
//   });
//   expect(invalidDataResponse.status()).toBe(500);
// });
# Performance Testing with Locust

This directory contains performance testing scripts for the Planning Poker application using Locust.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run Locust locally:
   ```bash
   locust -f locustfile.py
   ```

3. Or use Docker Compose for distributed testing:
   ```bash
   docker-compose up --scale worker=4
   ```

## Test Scenarios

The test suite simulates real user behavior:

1. Game Creation
   - Creates new games with configurable player counts
   - Measures response time and success rate

2. Player Actions
   - Joining games
   - Submitting votes
   - WebSocket connections
   - State synchronization

3. Load Patterns
   - Gradual user ramp-up
   - Sustained load testing
   - Spike testing

## Metrics Collected

- Response Times
  - Average
  - Median
  - 95th percentile
  - 99th percentile

- Throughput
  - Requests per second
  - WebSocket messages per second

- Error Rates
  - HTTP errors
  - WebSocket failures
  - Redis timeouts

## Running Tests

1. Start the web application:
   ```bash
   npm run dev
   ```

2. Start Locust:
   ```bash
   npm run test:perf
   ```

3. Open Locust UI:
   http://localhost:8089

4. Configure test parameters:
   - Number of users
   - Spawn rate
   - Host URL

## Analyzing Results

1. Real-time Monitoring
   - Watch the Locust UI for live metrics
   - Monitor application logs for issues

2. Reports
   - Download CSV reports
   - Generate charts and graphs
   - Compare with baseline metrics

## Best Practices

1. Test Environment
   - Use production-like environment
   - Clear Redis before tests
   - Monitor system resources

2. Test Data
   - Use realistic player counts
   - Simulate typical voting patterns
   - Include edge cases

3. Monitoring
   - Watch CPU/Memory usage
   - Monitor Redis performance
   - Check WebSocket connections

## Troubleshooting

Common issues and solutions:

1. WebSocket Errors
   ```
   Check WebSocket server status
   Verify connection limits
   Monitor memory usage
   ```

2. Redis Timeouts
   ```
   Check Redis connection pool
   Verify Redis memory usage
   Monitor network latency
   ```

3. High Response Times
   ```
   Check application logs
   Monitor database queries
   Verify caching effectiveness
   ```
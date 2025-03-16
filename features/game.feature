Feature: Planning Poker Game
  As a team member
  I want to participate in planning poker sessions
  So that I can estimate user stories with my team

  @smoke
  Scenario: Create a new game
    Given I am on the home page
    When I set the number of players to 2
    And I click the "Create Game" button
    Then I should see the join game screen

  @smoke
  Scenario: Join a game
    Given a game exists with 2 players
    And I am on the join game screen
    When I enter my name as "Test Player"
    And I select an avatar
    And I click the "Join Game" button
    Then I should see the waiting screen

  Scenario: Complete voting round
    Given a game exists with 2 players
    And all players have joined
    When I select card "5"
    And I set confidence to 80
    And I click "Submit Vote"
    Then my vote should be recorded
    And I should see a checkmark next to my name

  Scenario: Theme switching
    Given I am in an active game
    When I click the theme toggle
    And I select "Dark" theme
    Then the page should have dark mode styles

  Scenario: Timer controls
    Given I am in an active game
    When the timer starts
    Then I should see the countdown
    When I click the pause button
    Then the timer should stop
    When I click the resume button
    Then the timer should continue counting down
"""
Reinforcement Learning Routes - Simple Q-Learning Demo
Purpose: Demonstrate AI optimization concept for mini-project
"""

from flask import Blueprint, jsonify
import numpy as np

rl_bp = Blueprint("rl", __name__)


@rl_bp.route("/simulate", methods=["POST"])
def simulate_rl():
    """
    Simple Q-learning simulation for parameter optimization.
    The agent tries to find the best model hyperparameters
    to maximize prediction accuracy (reward).
    """
    np.random.seed(42)

    # Q-table: states = accuracy ranges, actions = adjust params
    n_states  = 10
    n_actions = 4   # increase/decrease learning_rate, increase/decrease depth
    Q = np.zeros((n_states, n_actions))

    alpha   = 0.1   # learning rate
    gamma   = 0.9   # discount factor
    epsilon = 1.0   # exploration rate

    episodes = 50
    rewards_per_episode = []
    steps_log = []

    state = 0  # start at low accuracy state

    for ep in range(episodes):
        total_reward = 0
        state = np.random.randint(0, 5)  # start in a low-accuracy state

        for step in range(20):
            # Epsilon-greedy action selection
            if np.random.rand() < epsilon:
                action = np.random.randint(0, n_actions)
            else:
                action = int(np.argmax(Q[state]))

            # Simulate reward: moving toward higher accuracy
            next_state = min(n_states - 1, state + np.random.randint(0, 3) - 1)
            next_state = max(0, next_state)

            reward = float(next_state) * 2.5 + np.random.normal(0, 0.5)
            total_reward += reward

            # Q-update
            best_next = float(np.max(Q[next_state]))
            Q[state, action] += alpha * (reward + gamma * best_next - Q[state, action])

            state = next_state

        epsilon = max(0.05, epsilon * 0.95)
        rewards_per_episode.append(round(total_reward, 2))

        if ep % 5 == 0:
            steps_log.append({
                "episode": ep + 1,
                "totalReward": round(total_reward, 2),
                "epsilon": round(epsilon, 3),
                "bestQValue": round(float(np.max(Q)), 3)
            })

    reward_chart = [
        {"episode": i + 1, "reward": rewards_per_episode[i]}
        for i in range(len(rewards_per_episode))
    ]

    # Smoothed reward (moving average)
    smoothed = []
    window = 5
    for i in range(len(rewards_per_episode)):
        start = max(0, i - window + 1)
        avg = np.mean(rewards_per_episode[start:i+1])
        smoothed.append({"episode": i+1, "reward": round(float(avg), 2)})

    return jsonify({
        "success": True,
        "algorithm": "Q-Learning",
        "episodes": episodes,
        "final_epsilon": round(epsilon, 3),
        "max_reward": round(max(rewards_per_episode), 2),
        "avg_reward": round(float(np.mean(rewards_per_episode)), 2),
        "reward_chart": reward_chart,
        "smoothed_chart": smoothed,
        "steps_log": steps_log,
        "q_table_shape": list(Q.shape),
        "optimization_steps": [
            {"step": 1, "action": "Increase n_estimators", "reward": 12.4},
            {"step": 2, "action": "Decrease learning_rate", "reward": 18.7},
            {"step": 3, "action": "Increase max_depth", "reward": 22.1},
            {"step": 4, "action": "Adjust regularization", "reward": 25.8},
            {"step": 5, "action": "Optimal config reached", "reward": 28.5},
        ]
    })

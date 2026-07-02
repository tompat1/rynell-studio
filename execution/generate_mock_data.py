import json
import random
import os
from datetime import datetime

def generate_metrics():
    # Schema matches the dashboard mockup structure:
    # timestamp: YYYY-MM-DD HH:MM:SS
    # cpu: float
    # memory: float
    # node: str
    # status: str
    
    nodes = ["node-01", "node-02", "node-03"]
    metrics = []
    
    # Generate 10 entries (spaced out by 5 seconds each)
    base_time = int(datetime.now().timestamp())
    for i in range(10):
        timestamp = datetime.fromtimestamp(base_time - (9 - i) * 5).strftime('%Y-%m-%d %H:%M:%S')
        cpu = round(random.uniform(20.0, 92.0), 1)
        memory = round(random.uniform(30.0, 90.0), 1)
        node = nodes[i % len(nodes)]
        status = "WARN" if (cpu > 80.0 or memory > 85.0) else "OK"
        
        metrics.append({
            "timestamp": timestamp,
            "cpu": cpu,
            "memory": memory,
            "node": node,
            "status": status
        })
        
    output_file = ".tmp/current_metrics.json"
    
    # Ensure directory exists (Self-Annealing fix)
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    print(f"Attempting to write metrics to {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(metrics, f, indent=2)
    print("Metrics written successfully!")

if __name__ == "__main__":
    generate_metrics()

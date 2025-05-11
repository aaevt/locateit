import { PathNode, Graph } from '../types/graph';

export abstract class PathfindingAlgorithm {
  protected graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  abstract findPath(startNodeId: string, endNodeId: string): {
    path: PathNode[];
    visitedNodes: PathNode[];
  };
}

export class Dijkstra extends PathfindingAlgorithm {
  findPath(startNodeId: string, endNodeId: string) {
    const visited = new Set<string>();
    const distance: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visitedNodes: PathNode[] = [];
    
    const queue: { nodeId: string; distance: number }[] = [];
    
    Object.keys(this.graph.nodes).forEach(nodeId => {
      distance[nodeId] = Infinity;
      previous[nodeId] = null;
    });
    
    distance[startNodeId] = 0;
    queue.push({ nodeId: startNodeId, distance: 0 });
    
    while (queue.length > 0) {
      queue.sort((a, b) => a.distance - b.distance);
      const { nodeId } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const currentNode = this.graph.nodes[nodeId];
      visitedNodes.push(currentNode);
      
      if (nodeId === endNodeId) {
        break;
      }
      
      // Check all adjacent nodes
      for (const neighborId of this.graph.adjacencyList[nodeId] || []) {
        if (visited.has(neighborId)) continue;
        
        const edgeWeight = this.graph.getEdgeWeight(nodeId, neighborId);
        const newDistance = distance[nodeId] + edgeWeight;
        
        if (newDistance < distance[neighborId]) {
          distance[neighborId] = newDistance;
          previous[neighborId] = nodeId;
          queue.push({ nodeId: neighborId, distance: newDistance });
        }
      }
    }
    
    // Reconstruct path
    const path: PathNode[] = [];
    let currentId: string | null = endNodeId;
    
    while (currentId !== null) {
      path.unshift(this.graph.nodes[currentId]);
      currentId = previous[currentId];
    }
    
    return { path, visitedNodes };
  }
}

export class AStar extends PathfindingAlgorithm {
  findPath(startNodeId: string, endNodeId: string) {
    const visited = new Set<string>();
    const gScore: Record<string, number> = {};
    const fScore: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const visitedNodes: PathNode[] = [];
    
    const openSet: { nodeId: string; fScore: number }[] = [];
    
    Object.keys(this.graph.nodes).forEach(nodeId => {
      gScore[nodeId] = Infinity;
      fScore[nodeId] = Infinity;
      previous[nodeId] = null;
    });
    
    gScore[startNodeId] = 0;
    fScore[startNodeId] = this.heuristic(this.graph.nodes[startNodeId], this.graph.nodes[endNodeId]);
    openSet.push({ nodeId: startNodeId, fScore: fScore[startNodeId] });
    
    while (openSet.length > 0) {
      openSet.sort((a, b) => a.fScore - b.fScore);
      const { nodeId } = openSet.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      const currentNode = this.graph.nodes[nodeId];
      visitedNodes.push(currentNode);
      
      if (nodeId === endNodeId) {
        break;
      }
      
      // Check all adjacent nodes
      for (const neighborId of this.graph.adjacencyList[nodeId] || []) {
        if (visited.has(neighborId)) continue;
        
        const tentativeGScore = gScore[nodeId] + this.graph.getEdgeWeight(nodeId, neighborId);
        
        if (tentativeGScore < gScore[neighborId]) {
          previous[neighborId] = nodeId;
          gScore[neighborId] = tentativeGScore;
          fScore[neighborId] = gScore[neighborId] + this.heuristic(
            this.graph.nodes[neighborId],
            this.graph.nodes[endNodeId]
          );
          
          // Add to open set if not already there
          if (!openSet.some(item => item.nodeId === neighborId)) {
            openSet.push({ nodeId: neighborId, fScore: fScore[neighborId] });
          }
        }
      }
    }
    
    const path: PathNode[] = [];
    let currentId: string | null = endNodeId;
    
    while (currentId !== null) {
      path.unshift(this.graph.nodes[currentId]);
      currentId = previous[currentId];
    }
    
    return { path, visitedNodes };
  }
  
  private heuristic(a: PathNode, b: PathNode) {
    const floorDifference = Math.abs((a.floor || 0) - (b.floor || 0));
    const floorPenalty = floorDifference * 100; // Penalty for changing floors
    
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance + floorPenalty;
  }
}

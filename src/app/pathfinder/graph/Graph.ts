export interface PathNode {
  id: string;
  x: number;
  y: number;
  floor?: number;
  label?: string;
  type: 'room' | 'stairs' | 'door' | 'waypoint';
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
}

export class Graph {
  nodes: Record<string, PathNode> = {};
  adjacencyList: Record<string, string[]> = {};
  edges: Edge[] = [];

  addNode(node: PathNode): void {
    this.nodes[node.id] = node;
    if (!this.adjacencyList[node.id]) {
      this.adjacencyList[node.id] = [];
    }
  }

  addEdge(fromId: string, toId: string, weight: number = 1): void {
    if (!this.nodes[fromId] || !this.nodes[toId]) {
      throw new Error(`Cannot add edge between non-existent nodes: ${fromId} and ${toId}`);
    }

    if (!this.adjacencyList[fromId].includes(toId)) {
      this.adjacencyList[fromId].push(toId);
    }

    if (!this.adjacencyList[toId].includes(fromId)) {
      this.adjacencyList[toId].push(fromId);
    }

    this.edges.push({ from: fromId, to: toId, weight });
  }

  getEdgeWeight(fromId: string, toId: string): number {
    const edge = this.edges.find(e => 
      (e.from === fromId && e.to === toId) || 
      (e.from === toId && e.to === fromId)
    );
    return edge ? edge.weight : Infinity;
  }

  getNodesOnFloor(floorNumber: number): PathNode[] {
    return Object.values(this.nodes).filter(node => node.floor === floorNumber);
  }
}

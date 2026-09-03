import type { RbtNode } from "./types";

/**
 * A Red-Black tree that maintains the RB invariants through insertion and
 * deletion (recoloring + rotations). It exposes a snapshot callback so a
 * visualization generator can capture each change.
 */
export class Rbt {
  nodes: Record<string, RbtNode> = {};
  rootId: string | null = null;
  private parent: Record<string, string | null> = {};

  private newNode(key: number, value: number | undefined): string {
    const id = `n${key}`;
    this.nodes[id] = { id, key, value, red: true, left: null, right: null };
    this.parent[id] = null;
    return id;
  }

  /** Returns the node id containing `key`, or null. */
  find(key: number): string | null {
    let cur = this.rootId;
    while (cur) {
      const n = this.nodes[cur];
      if (key === n.key) return cur;
      cur = key < n.key ? n.left : n.right;
    }
    return null;
  }

  findByVal(key: number): string | null | "none" {
    const id = this.find(key);
    return id === null ? null : id;
  }

  private grandparent(id: string): string | null {
    const p = this.parent[id];
    if (!p) return null;
    return this.parent[p];
  }

  private uncle(id: string): string | null {
    const g = this.grandparent(id);
    if (!g) return null;
    const p = this.parent[id];
    if (!p) return null;
    const gNode = this.nodes[g];
    if (gNode.left === p) return gNode.right;
    return gNode.left;
  }

  private rotateRight(aId: string) {
    const a = this.nodes[aId];
    const bId = a.left!;
    const b = this.nodes[bId];
    const p = this.parent[aId];

    a.left = b.right;
    if (b.right) this.parent[b.right] = aId;
    b.right = aId;
    this.parent[aId] = bId;
    this.parent[bId] = p;

    if (!p) this.rootId = bId;
    else if (this.nodes[p].left === aId) this.nodes[p].left = bId;
    else this.nodes[p].right = bId;
  }

  private rotateLeft(aId: string) {
    const a = this.nodes[aId];
    const bId = a.right!;
    const b = this.nodes[bId];
    const p = this.parent[aId];

    a.right = b.left;
    if (b.left) this.parent[b.left] = aId;
    b.left = aId;
    this.parent[aId] = bId;
    this.parent[bId] = p;

    if (!p) this.rootId = bId;
    else if (this.nodes[p].left === aId) this.nodes[p].left = bId;
    else this.nodes[p].right = bId;
  }

  insert(key: number, value: number | undefined, snap: () => void) {
    if (this.find(key)) return; // no duplicate keys
    let cur = this.rootId;
    let parentId: string | null = null;
    let isLeft = true;
    while (cur) {
      parentId = cur;
      if (key < this.nodes[cur].key) {
        cur = this.nodes[cur].left;
        isLeft = true;
      } else {
        cur = this.nodes[cur].right;
        isLeft = false;
      }
    }
    const id = this.newNode(key, value);
    if (!parentId) {
      this.rootId = id;
    } else {
      this.parent[id] = parentId;
      if (isLeft) this.nodes[parentId].left = id;
      else this.nodes[parentId].right = id;
    }
    snap();
    this.insertFixup(id, snap);
  }

  private insertFixup(zId: string, snap: () => void) {
    while (this.parent[zId] && this.nodes[this.parent[zId]!].red) {
      const g = this.grandparent(zId)!;
      const p = this.parent[zId]!;
      const gNode = this.nodes[g];
      if (gNode.left === p) {
        const y = gNode.right;
        if (y && this.nodes[y].red) {
          this.nodes[p].red = false;
          this.nodes[y].red = false;
          this.nodes[g].red = true;
          zId = g;
          snap();
        } else {
          if (this.nodes[p].right === zId) {
            this.rotateLeft(p);
            zId = p;
            snap();
          }
          const p2 = this.parent[zId]!;
          this.nodes[p2].red = false;
          this.nodes[this.grandparent(zId)!].red = true;
          this.rotateRight(this.grandparent(zId)!);
          snap();
        }
      } else {
        const y = gNode.left;
        if (y && this.nodes[y].red) {
          this.nodes[p].red = false;
          this.nodes[y].red = false;
          this.nodes[g].red = true;
          zId = g;
          snap();
        } else {
          if (this.nodes[p].left === zId) {
            this.rotateRight(p);
            zId = p;
            snap();
          }
          const p2 = this.parent[zId]!;
          this.nodes[p2].red = false;
          this.nodes[this.grandparent(zId)!].red = true;
          this.rotateLeft(this.grandparent(zId)!);
          snap();
        }
      }
    }
    if (this.rootId) this.nodes[this.rootId].red = false;
    snap();
  }

  private minimum(id: string): string {
    while (this.nodes[id]?.left) id = this.nodes[id].left!;
    return id;
  }

  remove(key: number, snap: () => void) {
    const zId = this.find(key);
    if (!zId) return;

    let yId: string = zId;
    let yColor: "red" | "black";
    let x: string | null;
    let xParent: string | null;

    const z = this.nodes[zId];
    if (!z.left || !z.right) {
      yColor = z.red ? "red" : "black";
      x = z.left || z.right;
      xParent = this.parent[zId];
      this.transplant(zId, x);
    } else {
      yId = this.minimum(z.right!);
      yColor = this.nodes[yId].red ? "red" : "black";
      x = this.nodes[yId].right;
      if (this.parent[yId] === zId) {
        if (x) this.parent[x] = yId;
        xParent = yId;
      } else {
        this.transplant(yId, x);
        this.nodes[yId].right = z.right;
        if (z.right) this.parent[z.right!] = yId;
        xParent = this.parent[yId];
      }
      this.transplant(zId, yId);
      this.nodes[yId].left = z.left;
      if (z.left) this.parent[z.left!] = yId;
      this.nodes[yId].red = z.red;
    }

    delete this.nodes[zId];
    delete this.parent[zId];
    snap();

    if (yColor === "black") {
      this.fixAfterDelete(x, xParent, snap);
    } else {
      snap();
    }
  }

  private transplant(uId: string, vId: string | null) {
    const p = this.parent[uId];
    if (!p) {
      this.rootId = vId;
    } else if (this.nodes[p].left === uId) {
      this.nodes[p].left = vId;
    } else {
      this.nodes[p].right = vId;
    }
    if (vId) this.parent[vId] = p;
  }

  private isRed(id: string | null): boolean {
    return !!id && !!this.nodes[id] && this.nodes[id].red;
  }

  private setColor(id: string | null, red: boolean) {
    if (id) this.nodes[id].red = red;
  }

  private fixAfterDelete(x: string | null, p: string | null, snap: () => void) {
    while (x !== this.rootId && !this.isRed(x)) {
      if (!p) break;
      const pNode = this.nodes[p];
      if (pNode.left === x) {
        let w = pNode.right;
        if (this.isRed(w)) {
          this.setColor(w, false);
          this.setColor(p, true);
          this.rotateLeft(p);
          snap();
          w = this.nodes[p].right;
        }
        if (!this.isRed(w ? this.nodes[w].left : null) && !this.isRed(w ? this.nodes[w].right : null)) {
          if (w) this.setColor(w, true);
          x = p;
          p = this.parent[x];
          snap();
        } else {
          if (w && !this.isRed(this.nodes[w].right)) {
            this.setColor(this.nodes[w].left, false);
            this.setColor(w, true);
            this.rotateRight(w);
            snap();
            w = this.nodes[p].right;
          }
          if (w) {
            this.setColor(w, this.isRed(p));
            this.setColor(p, false);
            this.setColor(this.nodes[w].right, false);
            this.rotateLeft(p);
            snap();
          }
          x = this.rootId;
          break;
        }
      } else {
        let w = pNode.left;
        if (this.isRed(w)) {
          this.setColor(w, false);
          this.setColor(p, true);
          this.rotateRight(p);
          snap();
          w = this.nodes[p].left;
        }
        if (!this.isRed(w ? this.nodes[w].left : null) && !this.isRed(w ? this.nodes[w].right : null)) {
          if (w) this.setColor(w, true);
          x = p;
          p = this.parent[x];
          snap();
        } else {
          if (w && !this.isRed(this.nodes[w].left)) {
            this.setColor(this.nodes[w].right, false);
            this.setColor(w, true);
            this.rotateLeft(w);
            snap();
            w = this.nodes[p].left;
          }
          if (w) {
            this.setColor(w, this.isRed(p));
            this.setColor(p, false);
            this.setColor(this.nodes[w].left, false);
            this.rotateRight(p);
            snap();
          }
          x = this.rootId;
          break;
        }
      }
      snap();
    }
    this.setColor(x, false);
  }
}

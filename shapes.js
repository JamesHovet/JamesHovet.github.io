const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

class MyTriangle {
    constructor(_1, _2, _3) {
        this._1 = _1; // vec3
        this._2 = _2; // vec3
        this._3 = _3; // vec3

        let edge1 = vec3.subtract(vec3.create(), this._2, this._1);
        let edge2 = vec3.subtract(vec3.create(), this._3, this._1);
        this.normal = vec3.cross(vec3.create(), edge1, edge2);
        vec3.normalize(this.normal, this.normal); // Normalize the normal vector

        let center = vec3.add(vec3.create(), this._1, this._2);
        center = vec3.add(center, center, this._3);
        vec3.scale(center, center, 1 / 3); // Average of the three vertices
        this.center = center; // vec3
    }

    map(callback) {
        return [
            callback(this._1),
            callback(this._2),
            callback(this._3)
        ];
    }
}

const cube = [
    // Front face
    new MyTriangle(
        vec3.fromValues(-1, -1, 1), // Vertex 1
        vec3.fromValues(1, -1, 1), // Vertex 2
        vec3.fromValues(1, 1, 1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(-1, -1, 1), // Vertex 1
        vec3.fromValues(1, 1, 1), // Vertex 2
        vec3.fromValues(-1, 1, 1) // Vertex 3
    ),
    // Back face
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(-1, 1, -1), // Vertex 2
        vec3.fromValues(1, 1, -1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(1, 1, -1), // Vertex 2
        vec3.fromValues(1, -1, -1) // Vertex 3
    ),
    // Left face
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(-1, -1, 1), // Vertex 2
        vec3.fromValues(-1, 1, 1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(-1, 1, 1), // Vertex 2
        vec3.fromValues(-1, 1, -1) // Vertex 3
    ),
    // Right face
    new MyTriangle(
        vec3.fromValues(1, -1, -1), // Vertex 1
        vec3.fromValues(1, 1, -1), // Vertex 2
        vec3.fromValues(1, 1, 1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(1, -1, -1), // Vertex 1
        vec3.fromValues(1, 1, 1), // Vertex 2
        vec3.fromValues(1, -1, 1) // Vertex 3
    ),
    // Top face
    new MyTriangle(
        vec3.fromValues(-1, 1, -1), // Vertex 1
        vec3.fromValues(-1, 1, 1), // Vertex 2
        vec3.fromValues(1, 1, 1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(-1, 1, -1), // Vertex 1
        vec3.fromValues(1, 1, 1), // Vertex 2
        vec3.fromValues(1, 1, -1) // Vertex 3
    ),
    // Bottom face
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(1, -1, -1), // Vertex 2
        vec3.fromValues(1, -1, 1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(1, -1, 1), // Vertex 2
        vec3.fromValues(-1, -1, 1) // Vertex 3
    )
];

const pyramid = [
    // Base
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(1, -1, -1), // Vertex 2
        vec3.fromValues(1, -1, 1) // Vertex 3
    ),
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Vertex 1
        vec3.fromValues(1, -1, 1), // Vertex 2
        vec3.fromValues(-1, -1, 1) // Vertex 3
    ),
    // Side faces
    new MyTriangle(
        vec3.fromValues(-1, -1, -1), // Base vertex
        vec3.fromValues(0, 1, 0), // Apex vertex
        vec3.fromValues(1, -1, -1) // Base vertex
    ),
    new MyTriangle(
        vec3.fromValues(1, -1, -1), // Base vertex
        vec3.fromValues(0, 1, 0), // Apex vertex
        vec3.fromValues(1, -1, 1) // Base vertex
    ),
    new MyTriangle(
        vec3.fromValues(1, -1, 1), // Base vertex
        vec3.fromValues(0, 1, 0), // Apex vertex
        vec3.fromValues(-1, -1, 1) // Base vertex
    ),
    new MyTriangle(
        vec3.fromValues(-1, -1, 1), // Base vertex
        vec3.fromValues(0, 1, 0), // Apex vertex
        vec3.fromValues(-1, -1, -1) // Base vertex
    )
];

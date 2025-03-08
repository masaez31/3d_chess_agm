import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss']
})
export class ChessBoardComponent implements OnInit, OnDestroy {

  @ViewChild('chessCanvas', { static: true }) canvasRef!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private boardSize = 8; // 8x8 tablero de ajedrez
  private selectedPiece: THREE.Group | null = null;  // Para saber qué pieza está seleccionada
  private selectedPosition: { x: number, y: number } | null = null;  // Para almacenar la posición de la pieza seleccionada

  // Listas para almacenar las piezas
  private pawns: THREE.Group[] = [];  // Lista de peones
  private rooks: THREE.Group[] = [];  // Lista de torres
  private bishops: THREE.Group[] = []; // Lista de alfiles

  // Matriz para rastrear las posiciones de las piezas en el tablero
  private board: (THREE.Group | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
   directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  ngOnInit(): void {
    this.init3DScene();
    this.createChessBoard();
    
    // Crear peones para las filas 1 y 6
    for (let i = 0; i < this.boardSize; i++) {
        // Fila 1 (peones blancos)
        this.createPawn(i, 1, 'white');
        // Fila 6 (peones negros)
        this.createPawn(i, 6, 'black');
    }

    // Crear torres en las esquinas
    this.createRook(0, 0, 'white'); // Torre blanca esquina inferior izquierda
    this.createRook(7, 0, 'white'); // Torre blanca esquina inferior derecha
    this.createRook(0, 7, 'black'); // Torre negra esquina superior izquierda
    this.createRook(7, 7, 'black'); // Torre negra esquina superior derecha

    // Crear alfiles en sus posiciones iniciales
    this.createBishop(2, 0, 'white'); // Alfil blanco c1
    this.createBishop(5, 0, 'white'); // Alfil blanco f1
    this.createBishop(2, 7, 'black'); // Alfil negro c8
    this.createBishop(5, 7, 'black'); // Alfil negro f8

    this.createKnight(1, 0, 'white'); // Caballo blanco b1
this.createKnight(6, 0, 'white'); // Caballo blanco g1
this.createKnight(1, 7, 'black'); // Caballo negro b8
this.createKnight(6, 7, 'black'); // Caballo negro g8

// Crear reinas en sus posiciones iniciales
this.createQueen(3, 0, 'white'); // Reina blanca d1
this.createQueen(3, 7, 'black'); // Reina negra d8

// Crear reyes en sus posiciones iniciales
this.createKing(4, 0, 'white'); // Rey blanco e1
this.createKing(4, 7, 'black'); // Rey negro e8

    this.animate();
  }

  ngOnDestroy(): void {
    // Limpiar recursos cuando el componente se destruye
    this.renderer.dispose();
  }

  private init3DScene(): void {
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Coloca la cámara en una posición elevada
    this.camera.position.set(0, -8, 8); // Cámara ligeramente elevada
    this.camera.lookAt(0, 0, 0); // Apunta al centro del tablero

    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true; // Habilitar sombras
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves

    // Agregar controles para manipular la cámara
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;

    // Deshabilitar la rotación, zoom y panning
    this.controls.enableRotate = true; // Desactiva la rotación
    this.controls.enableZoom = false; // Desactiva el zoom
    this.controls.enablePan = false; // Desactiva el desplazamiento

    // Agregar evento de clic en el canvas para detectar el clic en el tablero
    canvas.addEventListener('click', (event: MouseEvent) => this.onMouseClick(event));

    // Añadir una luz direccional que proyecte sombras
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(20, -30, -10); // Ajusta la posición para que la luz sea más frontal
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    // Configurar el mapa de sombras
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.shadow.bias = -0.001; // Ajusta el sesgo de las sombras para evitar artefactos
    this.directionalLight.shadow.radius = 2; // Ajusta el radio de las sombras para suavizarlas
}
private createChessBoard(): void {
  const squareSize = 1; // Tamaño de cada casilla
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.5 });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5, metalness: 0.5 });

  for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
          const geometry = new THREE.BoxGeometry(squareSize, squareSize, 0.1); // Casillas del tablero
          const material = (i + j) % 2 === 0 ? whiteMaterial : blackMaterial;
          const square = new THREE.Mesh(geometry, material);

          // Coloca el tablero en el plano XY
          square.position.set(i - (this.boardSize / 2), j - (this.boardSize / 2), 0);
          square.receiveShadow = true; // Recibir sombras
          this.scene.add(square);
      }
  }
}

private createPiece(piece: THREE.Group): void {
  piece.castShadow = true; // Proyectar sombras
  piece.traverse((child) => {
      if (child instanceof THREE.Mesh) {
          child.castShadow = true; // Proyectar sombras
          child.receiveShadow = true; // Recibir sombras
      }
  });
  this.scene.add(piece);
}
  private createPawn(x: number, y: number, color: 'white' | 'black'): void {
    // Define el color del material basado en el color del peón
    const pawnColor = color === 'white' ? 0xeeeeee : 0x555555;
    
    // Crea la base del peón (cilindro)
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);  // Base ancha y delgada
    const baseMaterial = new THREE.MeshBasicMaterial({ color: pawnColor });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);

    // Crea la parte central del peón (cilindro más estrecho)
    const neckGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);  // Parte central más estrecha
    const neckMaterial = new THREE.MeshBasicMaterial({ color: pawnColor });

    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 0.5;  // Coloca la parte central sobre la base

    // Crea la parte superior del peón (esfera)
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);  // Cabeza redonda
    const headMaterial = new THREE.MeshBasicMaterial({ color: pawnColor });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1;  // Coloca la cabeza en la parte superior de la pieza

    // Agrupamos todas las partes del peón en un objeto
    const pawn = new THREE.Group();
    pawn.add(base);
    pawn.add(neck);
    pawn.add(head);

    // Rotamos el peón para que esté de pie (rotación alrededor del eje X)
    pawn.rotation.x = Math.PI / 2; // Gira 90 grados alrededor del eje X

    // Posicionamos la pieza en el tablero
    pawn.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);  // Ajusta la altura de la pieza

    // Guardar el peón y agregarlo a la escena
    pawn.userData = { 
      isSelected: false,
      color: color,  // Guardar el color del peón
      type: 'pawn',  // Tipo de pieza
      boardX: x,     // Posición en el tablero
      boardY: y
    };
    
    this.scene.add(pawn);
    this.createPiece(pawn);
    // Guardar el peón para utilizarlo más tarde
    this.pawns.push(pawn);
    
    // Registrar la pieza en la matriz del tablero
    this.board[x][y] = pawn;
  }

  private createRook(x: number, y: number, color: 'white' | 'black'): void {
    // Define el color del material basado en el color de la torre
    const rookColor = color === 'white' ? 0xeeeeee : 0x555555;
    
    // Crea la base de la torre (cilindro)
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: rookColor });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);

    // Crea el cuerpo de la torre (cilindro)
    const bodyGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 32);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: rookColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;

    // Crea la parte superior de la torre (almenas)
    const topGroup = new THREE.Group();
    
    // Crear las almenas
    const almenaGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.3);
    const almenaMaterial = new THREE.MeshBasicMaterial({ color: rookColor });
    
    // Añadir 4 almenas en los bordes
    for (let i = 0; i < 4; i++) {
      const almena = new THREE.Mesh(almenaGeometry, almenaMaterial);
      almena.position.set(
        (i < 2 ? 0.25 : -0.25), // x: alternar entre positivo y negativo
        1.1, // y: arriba
        (i % 2 === 0 ? 0.25 : -0.25) // z: alternar entre positivo y negativo
      );
      topGroup.add(almena);
    }

    // Agrupamos todas las partes de la torre en un objeto
    const rook = new THREE.Group();
    rook.add(base);
    rook.add(body);
    rook.add(topGroup);

    // Rotamos la torre para que esté de pie (rotación alrededor del eje X)
    rook.rotation.x = Math.PI / 2; // Gira 90 grados alrededor del eje X

    // Posicionamos la pieza en el tablero
    rook.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);

    // Guardar la torre y agregarla a la escena
    rook.userData = { 
      isSelected: false,
      color: color,  // Guardar el color de la torre
      type: 'rook',  // Tipo de pieza
      boardX: x,     // Posición en el tablero
      boardY: y
    };
    
    this.scene.add(rook);
    
    // Guardar la torre para utilizarla más tarde
    this.rooks.push(rook);
    
    // Registrar la pieza en la matriz del tablero
    this.board[x][y] = rook;
  }

  private createBishop(x: number, y: number, color: 'white' | 'black'): void {
    // Define el color del material basado en el color del alfil
    const bishopColor = color === 'white' ? 0xeeeeee : 0x555555;
    
    // Crea la base del alfil (cilindro)
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: bishopColor });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);

    // Crea el cuerpo del alfil (cono invertido)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.45, 0.7, 32);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: bishopColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;

    // Crea la parte central del alfil (esfera)
    const middleGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const middleMaterial = new THREE.MeshBasicMaterial({ color: bishopColor });
    const middle = new THREE.Mesh(middleGeometry, middleMaterial);
    middle.position.y = 1.0;

    // Crea la parte superior del alfil (forma redondeada con una hendidura)
    const topGeometry = new THREE.ConeGeometry(0.2, 0.4, 32);
    const topMaterial = new THREE.MeshBasicMaterial({ color: bishopColor });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.4;

    // Agrupamos todas las partes del alfil en un objeto
    const bishop = new THREE.Group();
    bishop.add(base);
    bishop.add(body);
    bishop.add(middle);
    bishop.add(top);

    // Rotamos el alfil para que esté de pie (rotación alrededor del eje X)
    bishop.rotation.x = Math.PI / 2; // Gira 90 grados alrededor del eje X

    // Posicionamos la pieza en el tablero
    bishop.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);

    // Guardar el alfil y agregarlo a la escena
    bishop.userData = { 
      isSelected: false,
      color: color,  // Guardar el color del alfil
      type: 'bishop',  // Tipo de pieza
      boardX: x,     // Posición en el tablero
      boardY: y
    };
    
    this.scene.add(bishop);
    
    // Guardar el alfil para utilizarlo más tarde
    this.bishops.push(bishop);
    
    // Registrar la pieza en la matriz del tablero
    this.board[x][y] = bishop;
  }

  private createKnight(x: number, y: number, color: 'white' | 'black'): void {
    // Define el color del material basado en el color del caballo
    const knightColor = color === 'white' ? 0xeeeeee : 0x555555;

    // Crea la base del caballo (cilindro)
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: knightColor });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);

    // Crea el cuerpo del caballo (cilindro)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: knightColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;

    // Crea la cabeza del caballo (forma personalizada)
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.6);
    const headMaterial = new THREE.MeshBasicMaterial({ color: knightColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.8, 0.3);

    // Crea las orejas del caballo (formas personalizadas)
    const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
    const earMaterial = new THREE.MeshBasicMaterial({ color: knightColor });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.15, 1.1, 0.3);
    rightEar.position.set(0.15, 1.1, 0.3);

    // Agrupamos todas las partes del caballo en un objeto
    const knight = new THREE.Group();
    knight.add(base);
    knight.add(body);
    knight.add(head);
    knight.add(leftEar);
    knight.add(rightEar);

    // Rotamos el caballo para que esté de pie (rotación alrededor del eje X)
    knight.rotation.x = Math.PI / 2; // Gira 90 grados alrededor del eje X

    // Posicionamos la pieza en el tablero
    knight.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);

    // Guardar el caballo y agregarlo a la escena
    knight.userData = { 
        isSelected: false,
        color: color, // Guardar el color del caballo
        type: 'knight', // Tipo de pieza
        boardX: x, // Posición en el tablero
        boardY: y
    };

    this.scene.add(knight);

    // Registrar la pieza en la matriz del tablero
    this.board[x][y] = knight;
}

private createQueen(x: number, y: number, color: 'white' | 'black'): void {
  // Define el color del material basado en el color de la reina
  const queenColor = color === 'white' ? 0xeeeeee : 0x555555;

  // Crea la base de la reina (cilindro)
  const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
  const baseMaterial = new THREE.MeshBasicMaterial({ color: queenColor });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);

  // Crea el cuerpo de la reina (cilindro)
  const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 32);
  const bodyMaterial = new THREE.MeshBasicMaterial({ color: queenColor });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.6;

  // Crea la corona de la reina (cono)
  const crownGeometry = new THREE.ConeGeometry(0.3, 0.5, 32);
  const crownMaterial = new THREE.MeshBasicMaterial({ color: queenColor });
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = 1.3;

  // Agrupamos todas las partes de la reina en un objeto
  const queen = new THREE.Group();
  queen.add(base);
  queen.add(body);
  queen.add(crown);

  // Rotamos la reina para que esté de pie (rotación alrededor del eje X)
  queen.rotation.x = Math.PI / 2; // Gira 90 grados alrededor del eje X

  // Posicionamos la pieza en el tablero
  queen.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);

  // Guardar la reina y agregarla a la escena
  queen.userData = { 
      isSelected: false,
      color: color, // Guardar el color de la reina
      type: 'queen', // Tipo de pieza
      boardX: x, // Posición en el tablero
      boardY: y
  };

  this.scene.add(queen);

  // Registrar la pieza en la matriz del tablero
  this.board[x][y] = queen;
}

private createKing(x: number, y: number, color: 'white' | 'black'): void {
  // Define el color del material basado en el color del rey
  const kingColor = color === 'white' ? 0xeeeeee : 0x555555;

  // Crea la base del rey (cilindro)
  const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
  const baseMaterial = new THREE.MeshBasicMaterial({ color: kingColor });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);

  // Crea el cuerpo del rey (cilindro)
  const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.0, 32);
  const bodyMaterial = new THREE.MeshBasicMaterial({ color: kingColor });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.6;

  // Crea la corona del rey (cono)
  const crownGeometry = new THREE.ConeGeometry(0.3, 0.5, 32);
  const crownMaterial = new THREE.MeshBasicMaterial({ color: kingColor });
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = 1.3;

  // Agrupamos todas las partes del rey en un objeto
  const king = new THREE.Group();
  king.add(base);
  king.add(body);
  king.add(crown);

  // Rotamos el rey para que esté de pie (rotación alrededor del eje X)
  king.rotation.x = Math.PI / 2; // Gira 90 grados alrededor del eje X

  // Posicionamos la pieza en el tablero
  king.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);

  // Guardar el rey y agregarlo a la escena
  king.userData = { 
      isSelected: false,
      color: color, // Guardar el color del rey
      type: 'king', // Tipo de pieza
      boardX: x, // Posición en el tablero
      boardY: y
  };

  this.scene.add(king);

  // Registrar la pieza en la matriz del tablero
  this.board[x][y] = king;
}

  private onMouseClick(event: MouseEvent): void {
    console.log("Click detectado en el canvas");

    // Convertir las coordenadas del mouse a normalizadas
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Crear un raycaster para detectar el objeto debajo del clic
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Detectamos si el raycaster intersecta con objetos de la escena
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      console.log("Objeto clicado:", intersection.object);

      // Convertir el punto de intersección en coordenadas del tablero
      const gridX = Math.round(intersection.point.x + (this.boardSize / 2));
      const gridY = Math.round(intersection.point.y + (this.boardSize / 2));
      
      console.log("Coordenadas del tablero:", gridX, gridY);

      // Comprobar si las coordenadas están dentro del tablero
      if (gridX >= 0 && gridX < 8 && gridY >= 0 && gridY < 8) {
        // Comprobar si hay una pieza en esa posición
        const pieceAtPosition = this.board[gridX][gridY];

        if (pieceAtPosition && !this.selectedPiece) {
          // Seleccionar la pieza
          this.selectPiece(pieceAtPosition);
        } else if (pieceAtPosition === this.selectedPiece) {
          // Deseleccionar la pieza
          this.deselectPiece();
        } else if (this.selectedPiece) {
          // Intentar mover la pieza seleccionada
          this.movePiece(gridX, gridY);
        }
      }
    }
  }

  private selectPiece(piece: THREE.Group): void {
    console.log("Pieza seleccionada:", piece.userData);
    this.selectedPiece = piece;
    piece.userData['isSelected'] = true;

    // Cambiar color de la pieza a rojo
    this.changePieceColor(piece, 0xff0000);  // Color rojo
  }

  private deselectPiece(): void {
    if (this.selectedPiece) {
      console.log("Deseleccionando pieza");
      
      // Restaurar el color original de la pieza
      const originalColor = this.selectedPiece.userData['color'] === 'white' ? 0xeeeeee : 0x555555;
      this.changePieceColor(this.selectedPiece, originalColor);
      
      this.selectedPiece.userData['isSelected'] = false;
      this.selectedPiece = null;
    }
  }

  private changePieceColor(piece: THREE.Group, color: number): void {
    piece.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.color.setHex(color);  // Cambia el color del material de la pieza
      }
    });
  }

  private movePiece(targetX: number, targetY: number): void {
    if (!this.selectedPiece) return;
    const piece = this.selectedPiece;
    const pieceType = piece.userData['type'];
    const pieceColor = piece.userData['color'];
    const currentX = piece.userData['boardX'];
    const currentY = piece.userData['boardY'];
    let isValidMove = false;

    // Verificar si el movimiento es válido según el tipo de pieza
    if (pieceType === 'pawn') {
        isValidMove = this.isValidPawnMove(currentX, currentY, targetX, targetY, pieceColor);
    } else if (pieceType === 'rook') {
        isValidMove = this.isValidRookMove(currentX, currentY, targetX, targetY);
    } else if (pieceType === 'bishop') {
        isValidMove = this.isValidBishopMove(currentX, currentY, targetX, targetY);
    } else if (pieceType === 'knight') {
        isValidMove = this.isValidKnightMove(currentX, currentY, targetX, targetY);
    } else if (pieceType === 'queen') {
        isValidMove = this.isValidQueenMove(currentX, currentY, targetX, targetY);
    } else if (pieceType === 'king') {
        isValidMove = this.isValidKingMove(currentX, currentY, targetX, targetY);
    }

    if (isValidMove) {
        // Verificar si hay una pieza en la posición destino para capturarla
        if (this.board[targetX][targetY] !== null) {
            this.removePiece(targetX, targetY);
        }

        // Actualizar la matriz del tablero
        this.board[currentX][currentY] = null;
        this.board[targetX][targetY] = piece;

        // Actualizar la posición en userData
        piece.userData['boardX'] = targetX;
        piece.userData['boardY'] = targetY;

        // Mover la pieza visualmente
        piece.position.set(targetX - (this.boardSize / 2), targetY - (this.boardSize / 2), 0.05);
        console.log(`${pieceType} ${pieceColor} movido a la casilla:`, targetX, targetY);

        // Deseleccionar la pieza
        this.deselectPiece();
    } else {
        console.log("Movimiento inválido");
    }
}

private isValidPawnMove(fromX: number, fromY: number, toX: number, toY: number, color: 'white' | 'black'): boolean {
  // La dirección de movimiento depende del color del peón
  const moveDirection = color === 'white' ? 1 : -1;

  // Verificar que el movimiento es en la misma columna (movimiento normal)
  if (fromX === toX) {
      // Verificar que el movimiento es de una casilla adelante
      if (fromY + moveDirection === toY) {
          // Verificar que no hay piezas en la posición destino
          if (this.board[toX][toY] !== null) return false;
          return true;
      }

      // Verificar que el movimiento es de dos casillas adelante en el primer movimiento
      if ((color === 'white' && fromY === 1 && fromY + 2 * moveDirection === toY) ||
          (color === 'black' && fromY === 6 && fromY + 2 * moveDirection === toY)) {
          // Verificar que no hay piezas en la posición destino ni en la casilla intermedia
          if (this.board[toX][toY] !== null || this.board[toX][fromY + moveDirection] !== null) return false;
          return true;
      }
  }

  // Verificar que el movimiento es diagonal (captura)
  if (Math.abs(fromX - toX) === 1 && fromY + moveDirection === toY) {
      // Verificar que hay una pieza enemiga en la posición destino
      const targetPiece = this.board[toX][toY];
      if (targetPiece !== null && targetPiece.userData['color'] !== color) {
          return true;
      }
  }

  return false;
}

  private isValidRookMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // La torre se mueve en línea recta horizontal o vertical
    if (fromX !== toX && fromY !== toY) return false;
    
    // Verificar que no hay piezas en el camino
    if (fromX === toX) {
      // Movimiento vertical
      const start = Math.min(fromY, toY) + 1;
      const end = Math.max(fromY, toY);
      
      for (let y = start; y < end; y++) {
        if (this.board[fromX][y] !== null) return false;
      }
    } else {
      // Movimiento horizontal
      const start = Math.min(fromX, toX) + 1;
      const end = Math.max(fromX, toX);
      
      for (let x = start; x < end; x++) {
        if (this.board[x][fromY] !== null) return false;
      }
    }
    
    // Verificar si hay una pieza en la posición destino
    if (this.board[toX][toY] !== null) {
      // Si hay una pieza, verificar que sea de color diferente (captura)
      const targetPiece = this.board[toX][toY];
      if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
        return false; // No se puede capturar una pieza del mismo color
      }
    }
    
    return true;
  }

  private isValidBishopMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // El alfil se mueve en diagonal
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);
    
    // Verificar que el movimiento es diagonal (mismo número de casillas en x e y)
    if (dx !== dy) return false;
    
    // Determinar la dirección del movimiento
    const dirX = toX > fromX ? 1 : -1;
    const dirY = toY > fromY ? 1 : -1;
    
    // Verificar que no hay piezas en el camino
    let x = fromX + dirX;
    let y = fromY + dirY;
    
    while (x !== toX && y !== toY) {
      if (this.board[x][y] !== null) return false;
      x += dirX;
      y += dirY;
    }
    
    // Verificar si hay una pieza en la posición destino
    if (this.board[toX][toY] !== null) {
      // Si hay una pieza, verificar que sea de color diferente (captura)
      const targetPiece = this.board[toX][toY];
      if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
        return false; // No se puede capturar una pieza del mismo color
      }
    }
    
    return true;
  }

  private isValidKnightMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Los caballos se mueven en forma de "L": dos casillas en una dirección y una en la otra
    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);

    // Verificar que el movimiento es en forma de "L"
    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
        // Verificar si hay una pieza en la posición destino
        if (this.board[toX][toY] !== null) {
            // Si hay una pieza, verificar que sea de color diferente (captura)
            const targetPiece = this.board[toX][toY];
            if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
                return false; // No se puede capturar una pieza del mismo color
            }
        }
        return true;
    }
    return false;
}

private isValidQueenMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
  // La reina se mueve como una torre o un alfil
  return this.isValidRookMove(fromX, fromY, toX, toY) || this.isValidBishopMove(fromX, fromY, toX, toY);
}
private isValidKingMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
  // El rey se mueve una casilla en cualquier dirección
  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);

  // Verificar que el movimiento es de una casilla en cualquier dirección
  if (dx <= 1 && dy <= 1) {
      // Verificar si hay una pieza en la posición destino
      if (this.board[toX][toY] !== null) {
          // Si hay una pieza, verificar que sea de color diferente (captura)
          const targetPiece = this.board[toX][toY];
          if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
              return false; // No se puede capturar una pieza del mismo color
          }
      }
      return true;
  }
  return false;
}
  private removePiece(x: number, y: number): void {
    const pieceToRemove = this.board[x][y];
    if (pieceToRemove) {
      // Eliminar la pieza de la escena
      this.scene.remove(pieceToRemove);
      
      // Eliminar de las listas correspondientes
      if (pieceToRemove.userData['type'] === 'pawn') {
        this.pawns = this.pawns.filter(p => p !== pieceToRemove);
      } else if (pieceToRemove.userData['type'] === 'rook') {
        this.rooks = this.rooks.filter(r => r !== pieceToRemove);
      } else if (pieceToRemove.userData['type'] === 'bishop') {
        this.bishops = this.bishops.filter(b => b !== pieceToRemove);
      }
      
      // Eliminar la referencia en la matriz del tablero
      this.board[x][y] = null;
    }
  }
  private animate(): void {
    requestAnimationFrame(() => this.animate());

    // Actualizar la posición de la luz direccional para que siga la cámara
    const lightPosition = new THREE.Vector3();
    this.camera.getWorldPosition(lightPosition);
    this.directionalLight.position.copy(lightPosition);
    this.directionalLight.position.y += 10; // Ajustar la altura de la luz

    // Actualizar controles de cámara
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
}
}
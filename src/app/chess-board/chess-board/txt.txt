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
  private boardSize = 8;
  private selectedPiece: THREE.Group | null = null;
  private selectedPosition: { x: number, y: number } | null = null;


  private pawns: THREE.Group[] = [];
  private rooks: THREE.Group[] = [];
  private bishops: THREE.Group[] = [];

  private board: (THREE.Group | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  ngOnInit(): void {
    this.init3DScene();
    this.createChessBoard();
    window.addEventListener('resize', () => this.onWindowResize());


    for (let i = 0; i < this.boardSize; i++) {

      this.createPawn(i, 1, 'white');

      this.createPawn(i, 6, 'black');
    }


    this.createRook(0, 0, 'white');
    this.createRook(7, 0, 'white');
    this.createRook(0, 7, 'black');
    this.createRook(7, 7, 'black');


    this.createBishop(2, 0, 'white');
    this.createBishop(5, 0, 'white');
    this.createBishop(2, 7, 'black');
    this.createBishop(5, 7, 'black');

    this.createKnight(1, 0, 'white');
    this.createKnight(6, 0, 'white');
    this.createKnight(1, 7, 'black');
    this.createKnight(6, 7, 'black');


    this.createQueen(3, 0, 'white');
    this.createQueen(3, 7, 'black');


    this.createKing(4, 0, 'white');
    this.createKing(4, 7, 'black');

    this.animate();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.onWindowResize());
    this.renderer.dispose();
  }

  private init3DScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();


    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('assets/images/background.jpg');
    this.scene.background = backgroundTexture;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, -8, 8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;


    canvas.addEventListener('click', (event: MouseEvent) => this.onMouseClick(event));


    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(20, -30, -10);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);


    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.directionalLight.shadow.bias = -0.001;
    this.directionalLight.shadow.radius = 2;
  }
  private createChessBoard(): void {
    const squareSize = 1;
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.5 });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5, metalness: 0.5 });

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const geometry = new THREE.BoxGeometry(squareSize, squareSize, 0.1);
        const material = (i + j) % 2 === 0 ? whiteMaterial : blackMaterial;
        const square = new THREE.Mesh(geometry, material);


        square.position.set(i - (this.boardSize / 2), j - (this.boardSize / 2), 0);
        square.receiveShadow = true;
        this.scene.add(square);
      }
    }
  }

  private createPiece(piece: THREE.Group): void {
    piece.castShadow = true;
    piece.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.scene.add(piece);
  }
  private createPawn(x: number, y: number, color: 'white' | 'black'): void {

    const pawnColor = color === 'white' ? 0xFFFFFF : 0x333333;




    const baseRoughness = color === 'white' ? 0.2 : 0.5;
    const baseMetalness = color === 'white' ? 0.0 : 0.5;
    const headRoughness = color === 'white' ? 0.1 : 0.3;
    const headMetalness = color === 'white' ? 0.0 : 0.7;


    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: pawnColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);


    const neckGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);
    const neckMaterial = new THREE.MeshStandardMaterial({
      color: pawnColor,
      roughness: baseRoughness - 0.05,
      metalness: baseMetalness
    });
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 0.5;


    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: pawnColor,
      roughness: headRoughness,
      metalness: headMetalness,
      envMapIntensity: color === 'white' ? 1.5 : 1.0
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1;


    const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: pawnColor,
      roughness: color === 'white' ? 0.05 : 0.1,
      metalness: color === 'white' ? 0.1 : 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.95;
    ring.rotation.x = Math.PI / 2;


    const pawn = new THREE.Group();
    pawn.add(base);
    pawn.add(neck);
    pawn.add(ring);
    pawn.add(head);


    pawn.rotation.x = Math.PI / 2;


    pawn.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);


    pawn.userData = {
      isSelected: false,
      color: color,
      type: 'pawn',
      boardX: x,
      boardY: y
    };

    this.scene.add(pawn);
    this.createPiece(pawn);
    this.pawns.push(pawn);
    this.board[x][y] = pawn;
  }
  private createRook(x: number, y: number, color: 'white' | 'black'): void {

    const rookColor = color === 'white' ? 0xFFFFFF : 0x333333;
    const baseRoughness = color === 'white' ? 0.2 : 0.5;
    const baseMetalness = color === 'white' ? 0.0 : 0.5;


    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: rookColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);


    const bodyGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: rookColor,
      roughness: baseRoughness - 0.05,
      metalness: baseMetalness
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;


    const topGroup = new THREE.Group();
    const almenaGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.3);
    const almenaMaterial = new THREE.MeshStandardMaterial({
      color: rookColor,
      roughness: baseRoughness - 0.1,
      metalness: baseMetalness + 0.1
    });


    for (let i = 0; i < 4; i++) {
      const almena = new THREE.Mesh(almenaGeometry, almenaMaterial);
      almena.position.set(
        (i < 2 ? 0.25 : -0.25),
        1.1,
        (i % 2 === 0 ? 0.25 : -0.25)
      );
      topGroup.add(almena);
    }


    const rook = new THREE.Group();
    rook.add(base);
    rook.add(body);
    rook.add(topGroup);
    this.createPiece(rook);


    rook.rotation.x = Math.PI / 2;


    rook.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);


    rook.userData = {
      isSelected: false,
      color: color,
      type: 'rook',
      boardX: x,
      boardY: y
    };

    this.scene.add(rook);


    this.board[x][y] = rook;
  }

  private createBishop(x: number, y: number, color: 'white' | 'black'): void {

    const bishopColor = color === 'white' ? 0xFFFFFF : 0x333333;
    const baseRoughness = color === 'white' ? 0.2 : 0.5;
    const baseMetalness = color === 'white' ? 0.0 : 0.5;


    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: bishopColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);


    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.45, 0.7, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: bishopColor,
      roughness: baseRoughness - 0.05,
      metalness: baseMetalness
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;


    const middleGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const middleMaterial = new THREE.MeshStandardMaterial({
      color: bishopColor,
      roughness: baseRoughness - 0.1,
      metalness: baseMetalness + 0.1
    });
    const middle = new THREE.Mesh(middleGeometry, middleMaterial);
    middle.position.y = 1.0;


    const topGeometry = new THREE.ConeGeometry(0.2, 0.4, 32);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: bishopColor,
      roughness: baseRoughness - 0.15,
      metalness: baseMetalness + 0.2
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.4;


    const bishop = new THREE.Group();
    bishop.add(base);
    bishop.add(body);
    bishop.add(middle);
    bishop.add(top);


    bishop.rotation.x = Math.PI / 2;


    bishop.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);


    bishop.userData = {
      isSelected: false,
      color: color,
      type: 'bishop',
      boardX: x,
      boardY: y
    };

    this.scene.add(bishop);
    this.createPiece(bishop);


    this.board[x][y] = bishop;
  }


  private createKnight(x: number, y: number, color: 'white' | 'black'): void {

    const knightColor = color === 'white' ? 0xFFFFFF : 0x333333;
    const baseRoughness = color === 'white' ? 0.2 : 0.5;
    const baseMetalness = color === 'white' ? 0.0 : 0.5;
    const headRoughness = color === 'white' ? 0.1 : 0.3;
    const headMetalness = color === 'white' ? 0.0 : 0.7;


    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: knightColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);


    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: knightColor,
      roughness: baseRoughness - 0.05,
      metalness: baseMetalness
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;


    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: knightColor,
      roughness: headRoughness,
      metalness: headMetalness,
      envMapIntensity: color === 'white' ? 1.5 : 1.0
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.8, 0.3);


    const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
    const earMaterial = new THREE.MeshStandardMaterial({
      color: knightColor,
      roughness: headRoughness - 0.05,
      metalness: headMetalness + 0.1
    });
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.15, 1.1, 0.3);
    rightEar.position.set(0.15, 1.1, 0.3);


    const knight = new THREE.Group();
    knight.add(base);
    knight.add(body);
    knight.add(head);
    knight.add(leftEar);
    knight.add(rightEar);
    this.createPiece(knight);


    knight.rotation.x = Math.PI / 2;
    if (color === 'white') knight.rotation.y = Math.PI;

    knight.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);


    knight.userData = {
      isSelected: false,
      color: color,
      type: 'knight',
      boardX: x,
      boardY: y
    };

    this.scene.add(knight);


    this.board[x][y] = knight;
  }

  private createQueen(x: number, y: number, color: 'white' | 'black'): void {

    const queenColor = color === 'white' ? 0xFFFFFF : 0x333333;




    const baseRoughness = color === 'white' ? 0.2 : 0.5;
    const baseMetalness = color === 'white' ? 0.0 : 0.5;
    const topRoughness = color === 'white' ? 0.1 : 0.3;
    const topMetalness = color === 'white' ? 0.0 : 0.7;


    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: queenColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);


    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.8, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: queenColor,
      roughness: baseRoughness - 0.05,
      metalness: baseMetalness
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;


    const middleGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const middleMaterial = new THREE.MeshStandardMaterial({
      color: queenColor,
      roughness: topRoughness + 0.05,
      metalness: topMetalness - 0.1
    });
    const middle = new THREE.Mesh(middleGeometry, middleMaterial);
    middle.position.y = 1.0;


    const crownBaseGeometry = new THREE.CylinderGeometry(0.25, 0.35, 0.2, 32);
    const crownBaseMaterial = new THREE.MeshStandardMaterial({
      color: queenColor,
      roughness: topRoughness,
      metalness: topMetalness,
      envMapIntensity: color === 'white' ? 1.5 : 1.0
    });
    const crownBase = new THREE.Mesh(crownBaseGeometry, crownBaseMaterial);
    crownBase.position.y = 1.2;


    const tipGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const tipMaterial = new THREE.MeshStandardMaterial({
      color: queenColor,
      roughness: topRoughness - 0.05,
      metalness: topMetalness + 0.1,
      envMapIntensity: color === 'white' ? 1.8 : 1.2
    });

    const crownTips = new THREE.Group();

    for (let i = 0; i < 5; i++) {
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      const angle = (i / 5) * Math.PI * 2;
      tip.position.set(
        0.2 * Math.cos(angle),
        1.45,
        0.2 * Math.sin(angle)
      );
      crownTips.add(tip);
    }


    const centerTipGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const centerTip = new THREE.Mesh(centerTipGeometry, tipMaterial);
    centerTip.position.y = 1.5;
    crownTips.add(centerTip);


    const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: queenColor,
      roughness: color === 'white' ? 0.05 : 0.1,
      metalness: color === 'white' ? 0.1 : 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.95;
    ring.rotation.x = Math.PI / 2;


    const queen = new THREE.Group();
    queen.add(base);
    queen.add(body);
    queen.add(middle);
    queen.add(crownBase);
    queen.add(crownTips);
    queen.add(ring);


    queen.rotation.x = Math.PI / 2;


    queen.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);


    queen.userData = {
      isSelected: false,
      color: color,
      type: 'queen',
      boardX: x,
      boardY: y
    };

    this.scene.add(queen);
    this.createPiece(queen);


    this.board[x][y] = queen;
  }

  private createKing(x: number, y: number, color: 'white' | 'black'): void {

    const kingColor = color === 'white' ? 0xFFFFFF : 0x333333;




    const baseRoughness = color === 'white' ? 0.2 : 0.5;
    const baseMetalness = color === 'white' ? 0.0 : 0.5;
    const topRoughness = color === 'white' ? 0.1 : 0.3;
    const topMetalness = color === 'white' ? 0.0 : 0.7;


    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: kingColor,
      roughness: baseRoughness,
      metalness: baseMetalness
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);


    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.8, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: kingColor,
      roughness: baseRoughness - 0.05,
      metalness: baseMetalness
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;


    const middleGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const middleMaterial = new THREE.MeshStandardMaterial({
      color: kingColor,
      roughness: topRoughness + 0.05,
      metalness: topMetalness - 0.1
    });
    const middle = new THREE.Mesh(middleGeometry, middleMaterial);
    middle.position.y = 1.0;


    const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: kingColor,
      roughness: color === 'white' ? 0.05 : 0.1,
      metalness: color === 'white' ? 0.1 : 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.95;
    ring.rotation.x = Math.PI / 2;


    const crownBaseGeometry = new THREE.CylinderGeometry(0.25, 0.35, 0.2, 32);
    const crownBaseMaterial = new THREE.MeshStandardMaterial({
      color: kingColor,
      roughness: topRoughness,
      metalness: topMetalness,
      envMapIntensity: color === 'white' ? 1.5 : 1.0
    });
    const crownBase = new THREE.Mesh(crownBaseGeometry, crownBaseMaterial);
    crownBase.position.y = 1.2;


    const crossVerticalGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const crossHorizontalGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const crossMaterial = new THREE.MeshStandardMaterial({
      color: kingColor,
      roughness: topRoughness - 0.05,
      metalness: topMetalness + 0.1,
      envMapIntensity: color === 'white' ? 1.8 : 1.2
    });

    const crossVertical = new THREE.Mesh(crossVerticalGeometry, crossMaterial);
    crossVertical.position.y = 1.5;

    const crossHorizontal = new THREE.Mesh(crossHorizontalGeometry, crossMaterial);
    crossHorizontal.position.y = 1.45;


    const king = new THREE.Group();
    king.add(base);
    king.add(body);
    king.add(middle);
    king.add(ring);
    king.add(crownBase);
    king.add(crossVertical);
    king.add(crossHorizontal);


    king.rotation.x = Math.PI / 2;


    king.position.set(x - (this.boardSize / 2), y - (this.boardSize / 2), 0.05);


    king.userData = {
      isSelected: false,
      color: color,
      type: 'king',
      boardX: x,
      boardY: y
    };

    this.scene.add(king);
    this.createPiece(king);


    this.board[x][y] = king;
  }

  private onMouseClick(event: MouseEvent): void {
    // Normalizar coordenadas del mouse al rango -1 a 1
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Configurar el raycaster con las coordenadas del mouse
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    // Detectar intersecciones con objetos en la escena
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      // Encontrar el objeto raíz (pieza o casilla del tablero)
      let targetObject = intersects[0].object;
      let rootObject = this.findRootObject(targetObject);
      
      // Si no hay objeto raíz, usar el punto de intersección para calcular la casilla
      if (!rootObject || !rootObject.userData || !rootObject.userData['type']) {
        const point = intersects[0].point;
        const gridX = Math.floor(point.x + (this.boardSize / 2) + 0.5);
        const gridY = Math.floor(point.y + (this.boardSize / 2) + 0.5);
        
        console.log("Coordenadas del tablero:", gridX, gridY);
        
        if (gridX >= 0 && gridX < 8 && gridY >= 0 && gridY < 8) {
          const pieceAtPosition = this.board[gridX][gridY];
          
          if (this.selectedPiece && (!pieceAtPosition || pieceAtPosition !== this.selectedPiece)) {
            // Mover a una casilla vacía o capturar una pieza
            this.movePiece(gridX, gridY);
          } else if (pieceAtPosition && !this.selectedPiece) {
            // Seleccionar pieza
            this.selectPiece(pieceAtPosition);
          } else if (pieceAtPosition === this.selectedPiece) {
            // Deseleccionar pieza
            this.deselectPiece();
          }
        }
      } else {
        // El clic fue directamente en una pieza
        const piece = rootObject;
        const x = piece.userData['boardX'];
        const y = piece.userData['boardY'];
        
        if (this.selectedPiece && piece !== this.selectedPiece) {
          // Si ya hay una pieza seleccionada y se hace clic en otra, intentar capturar
          this.movePiece(x, y);
        } else if (!this.selectedPiece) {
          // Seleccionar la pieza
          this.selectPiece(piece);
        } else {
          // Deseleccionar la pieza
          this.deselectPiece();
        }
      }
    }
  }
  private selectPiece(piece: THREE.Group): void {
    console.log("Pieza seleccionada:", piece.userData);
    this.selectedPiece = piece;
    piece.userData['isSelected'] = true;


    this.changePieceColor(piece, 0xff0000);
  }

  private deselectPiece(): void {
    if (this.selectedPiece) {
      console.log("Deseleccionando pieza");


      const originalColor = this.selectedPiece.userData['color'] === 'white' ? 0xeeeeee : 0x555555;
      this.changePieceColor(this.selectedPiece, originalColor);

      this.selectedPiece.userData['isSelected'] = false;
      this.selectedPiece = null;
    }
  }

  private changePieceColor(piece: THREE.Group, color: number): void {
    piece.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.color.setHex(color);
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

      if (this.board[targetX][targetY] !== null) {
        this.removePiece(targetX, targetY);
      }


      this.board[currentX][currentY] = null;
      this.board[targetX][targetY] = piece;


      piece.userData['boardX'] = targetX;
      piece.userData['boardY'] = targetY;


      piece.position.set(targetX - (this.boardSize / 2), targetY - (this.boardSize / 2), 0.05);
      console.log(`${pieceType} ${pieceColor} movido a la casilla:`, targetX, targetY);


      this.deselectPiece();
    } else {
      console.log("Movimiento inválido");
    }
  }

  private isValidPawnMove(fromX: number, fromY: number, toX: number, toY: number, color: 'white' | 'black'): boolean {

    const moveDirection = color === 'white' ? 1 : -1;


    if (fromX === toX) {

      if (fromY + moveDirection === toY) {

        if (this.board[toX][toY] !== null) return false;
        return true;
      }


      if ((color === 'white' && fromY === 1 && fromY + 2 * moveDirection === toY) ||
        (color === 'black' && fromY === 6 && fromY + 2 * moveDirection === toY)) {

        if (this.board[toX][toY] !== null || this.board[toX][fromY + moveDirection] !== null) return false;
        return true;
      }
    }


    if (Math.abs(fromX - toX) === 1 && fromY + moveDirection === toY) {

      const targetPiece = this.board[toX][toY];
      if (targetPiece !== null && targetPiece.userData['color'] !== color) {
        return true;
      }
    }

    return false;
  }

  private isValidRookMove(fromX: number, fromY: number, toX: number, toY: number): boolean {

    if (fromX !== toX && fromY !== toY) return false;


    if (fromX === toX) {

      const start = Math.min(fromY, toY) + 1;
      const end = Math.max(fromY, toY);

      for (let y = start; y < end; y++) {
        if (this.board[fromX][y] !== null) return false;
      }
    } else {

      const start = Math.min(fromX, toX) + 1;
      const end = Math.max(fromX, toX);

      for (let x = start; x < end; x++) {
        if (this.board[x][fromY] !== null) return false;
      }
    }


    if (this.board[toX][toY] !== null) {

      const targetPiece = this.board[toX][toY];
      if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
        return false;
      }
    }

    return true;
  }

  private isValidBishopMove(fromX: number, fromY: number, toX: number, toY: number): boolean {

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);


    if (dx !== dy) return false;


    const dirX = toX > fromX ? 1 : -1;
    const dirY = toY > fromY ? 1 : -1;


    let x = fromX + dirX;
    let y = fromY + dirY;

    while (x !== toX && y !== toY) {
      if (this.board[x][y] !== null) return false;
      x += dirX;
      y += dirY;
    }


    if (this.board[toX][toY] !== null) {

      const targetPiece = this.board[toX][toY];
      if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
        return false;
      }
    }

    return true;
  }

  private isValidKnightMove(fromX: number, fromY: number, toX: number, toY: number): boolean {

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);


    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {

      if (this.board[toX][toY] !== null) {

        const targetPiece = this.board[toX][toY];
        if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private isValidQueenMove(fromX: number, fromY: number, toX: number, toY: number): boolean {

    return this.isValidRookMove(fromX, fromY, toX, toY) || this.isValidBishopMove(fromX, fromY, toX, toY);
  }
  private isValidKingMove(fromX: number, fromY: number, toX: number, toY: number): boolean {

    const dx = Math.abs(toX - fromX);
    const dy = Math.abs(toY - fromY);


    if (dx <= 1 && dy <= 1) {

      if (this.board[toX][toY] !== null) {

        const targetPiece = this.board[toX][toY];
        if (targetPiece?.userData['color'] === this.selectedPiece?.userData['color']) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  private removePiece(x: number, y: number): void {
    const pieceToRemove = this.board[x][y];
    if (pieceToRemove) {

      this.scene.remove(pieceToRemove);


      if (pieceToRemove.userData['type'] === 'pawn') {
        this.pawns = this.pawns.filter(p => p !== pieceToRemove);
      } else if (pieceToRemove.userData['type'] === 'rook') {
        this.rooks = this.rooks.filter(r => r !== pieceToRemove);
      } else if (pieceToRemove.userData['type'] === 'bishop') {
        this.bishops = this.bishops.filter(b => b !== pieceToRemove);
      }


      this.board[x][y] = null;
    }
  }
  private findRootObject(object: THREE.Object3D): THREE.Group | null {
    if (object.parent instanceof THREE.Group && object.parent.userData && object.parent.userData['type']) {
      return object.parent;
    } else if (object.parent && object.parent !== this.scene) {
      return this.findRootObject(object.parent);
    }
    return null;
  }
  
  // Añade también esta función para actualizar el tamaño del renderer cuando la ventana cambia de tamaño
  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  private animate(): void {
    requestAnimationFrame(() => this.animate());


    const lightPosition = new THREE.Vector3();
    this.camera.getWorldPosition(lightPosition);
    this.directionalLight.position.copy(lightPosition);
    this.directionalLight.position.y += 10;


    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
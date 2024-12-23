class Controls {
    constructor(joystickElement, stickElement, player) {
        this.joystickElement = joystickElement;
        this.stickElement = stickElement;
        this.player = player;
        this.joystickActive = false;
        this.joystickData = {
            startX: 0,
            startY: 0,
            moveX: 0,
            moveY: 0
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.joystickElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.joystickElement.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.joystickElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.joystickElement.getBoundingClientRect();
        this.joystickActive = true;
        this.joystickData.startX = touch.clientX - rect.left;
        this.joystickData.startY = touch.clientY - rect.top;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.joystickActive) return;
        
        const touch = e.touches[0];
        const rect = this.joystickElement.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Calculate distance from start
        const dx = x - this.joystickData.startX;
        const dy = y - this.joystickData.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize to joystick radius
        const maxDistance = 25;
        const normalizedDistance = Math.min(distance, maxDistance);
        const angle = Math.atan2(dy, dx);
        
        this.joystickData.moveX = Math.cos(angle) * normalizedDistance;
        this.joystickData.moveY = Math.sin(angle) * normalizedDistance;
        
        // Update stick position
        this.stickElement.style.transform = `translate(${this.joystickData.moveX}px, ${this.joystickData.moveY}px)`;
        
        // Update player velocity
        this.player.dx = (this.joystickData.moveX / maxDistance) * this.player.speed;
        this.player.dy = (this.joystickData.moveY / maxDistance) * this.player.speed;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.joystickActive = false;
        this.joystickData.moveX = 0;
        this.joystickData.moveY = 0;
        this.player.dx = 0;
        this.player.dy = 0;
        this.stickElement.style.transform = 'translate(0px, 0px)';
    }

    reset() {
        this.joystickActive = false;
        this.joystickData = {
            startX: 0,
            startY: 0,
            moveX: 0,
            moveY: 0
        };
        this.stickElement.style.transform = 'translate(0px, 0px)';
    }
}

export default Controls;

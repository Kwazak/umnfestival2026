import React, { useEffect, useRef } from "react";

export default function BackgroundSection() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        class FireAnimation {
            constructor() {
                this.particles = [];
                this.paletteBase = [
                    { r: 245, g: 167, b: 66 },
                    { r: 232, g: 90, b: 25 },
                    { r: 255, g: 62, b: 0 },
                    { r: 191, g: 34, b: 34 },
                    { r: 80, g: 20, b: 70 },
                ];
                this.palette = [...this.paletteBase];
                this.time = 0;
                this.lastUpdateTime = 0;
                this.createParticles();
                this.animate();
            }

            createParticles() {
                const count = Math.floor((canvas.width * canvas.height) / 4000);
                for (let i = 0; i < count; i++) {
                    this.particles.push(this.generateParticle());
                }
            }

            generateParticle() {
                return {
                    x: Math.random() * canvas.width,
                    y: canvas.height + Math.random() * 50,
                    size: 5 + Math.random() * 20,
                    opacity: 0.1 + Math.random() * 0.5,
                    speedX: (Math.random() - 0.5) * 1.5,
                    speedY: -1.5 - Math.random() * 3,
                    colorIndex: Math.floor(Math.random() * this.palette.length),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02,
                    sway: 0.3 + Math.random() * 0.5,
                    swaySpeed: 0.005 + Math.random() * 0.01,
                    swayOffset: Math.random() * Math.PI * 2,
                    lifespan: 100 + Math.random() * 200,
                };
            }

            animate = (currentTime = 0) => {
                const deltaTime = currentTime - this.lastUpdateTime;
                this.lastUpdateTime = currentTime;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.time += 0.01;
                this.updatePalette();
                this.updateParticles(deltaTime);
                requestAnimationFrame(this.animate);
            };

            updatePalette() {
                this.palette = this.paletteBase.map((color, i) => {
                    const t = this.time + i * 0.5;
                    const v = 20;
                    return {
                        r: Math.min(
                            255,
                            Math.max(0, color.r + Math.sin(t) * v)
                        ),
                        g: Math.min(
                            255,
                            Math.max(0, color.g + Math.sin(t + 1) * v)
                        ),
                        b: Math.min(
                            255,
                            Math.max(0, color.b + Math.sin(t + 2) * v)
                        ),
                    };
                });
            }

            updateParticles(deltaTime) {
                for (let i = 0; i < this.particles.length; i++) {
                    const p = this.particles[i];
                    p.x +=
                        p.speedX +
                        Math.sin(this.time * p.swaySpeed + p.swayOffset) *
                            p.sway;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed;
                    p.lifespan -= 1;

                    const lifeFactor = p.lifespan / 300;
                    const size = p.size * lifeFactor;
                    const opacity = p.opacity * lifeFactor;

                    if (p.lifespan > 0 && p.y > -100) {
                        this.drawBrushstroke(
                            p.x,
                            p.y,
                            size,
                            p.rotation,
                            this.palette[p.colorIndex],
                            opacity
                        );
                    } else {
                        this.particles[i] = this.generateParticle();
                    }
                }
            }

            drawBrushstroke(x, y, size, rotation, color, opacity) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);

                const gradient = ctx.createLinearGradient(0, -size, 0, size);
                gradient.addColorStop(
                    0,
                    `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
                );
                gradient.addColorStop(
                    0.5,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
                );
                gradient.addColorStop(
                    1,
                    `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
                );
                ctx.fillStyle = gradient;

                ctx.beginPath();
                ctx.moveTo(-size / 3, -size);
                ctx.quadraticCurveTo(size / 2, 0, -size / 3, size);
                ctx.quadraticCurveTo(size / 2, 0, size / 3, -size / 2);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${
                    opacity * 0.7
                })`;
                ctx.beginPath();
                ctx.ellipse(size / 6, 0, size / 4, size / 2, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        new FireAnimation();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <>
            <style>
                {`
                @keyframes gradientAnimation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                `}
            </style>

            <div
                className="fixed inset-0 w-full h-full -z-20"
                style={{
                    background:
                        "linear-gradient(270deg, #FFC22F, #F2762E, #FFC22F)",
                    backgroundSize: "500% 500%",
                    animation: "gradientAnimation 20s ease infinite",
                }}
            />

            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
            />
        </>
    );
}

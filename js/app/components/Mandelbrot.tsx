"use client"
import React, { useRef, useEffect, useState } from "react";

type ColorScheme = 'default' | 'fire' | 'ocean' | 'forest';

export default function Mandelbrot() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [magnificationFactor, setMagnificationFactor] = useState(200);
  const [panX, setPanX] = useState(2);
  const [panY, setPanY] = useState(1);
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [power, setPower] = useState(2); // Power for Multibrot
  const [rotation, setRotation] = useState(0); // Rotation in degrees
  const [moveSpeed, setMoveSpeed] = useState(0.1); // Movement speed
  
  function isMultibrotSet(
    cReal: number, cImaginary: number,
    realPart: number = 0, imaginaryPart: number = 0,
    iteration: number = 0, maxIterations: number = 100
  ): number {
    if (iteration >= maxIterations ||
      realPart * realPart + imaginaryPart * imaginaryPart > 4) {
      return iteration;
    }

    const angle = rotation * Math.PI / 180; // Convert degrees to radians
    const x = realPart * Math.cos(angle) - imaginaryPart * Math.sin(angle);
    const y = realPart * Math.sin(angle) + imaginaryPart * Math.cos(angle);

    const newReal = Math.pow(x * x + y * y, power / 2) * Math.cos(power * Math.atan2(y, x)) + cReal;
    const newImaginary = Math.pow(x * x + y * y, power / 2) * Math.sin(power * Math.atan2(y, x)) + cImaginary;

    return isMultibrotSet(cReal, cImaginary, newReal, newImaginary, iteration + 1, maxIterations);
  }

  function getColor(iteration: number, maxIterations: number): string {
    if (iteration === maxIterations) return '#000';

    const ratio = iteration / maxIterations;

    switch(colorScheme) {
      case 'fire':
        return `hsl(${60 + ratio * 60}, 100%, ${50 + ratio * 50}%)`;
      case 'ocean':
        return `hsl(${180 + ratio * 60}, 100%, ${50 + ratio * 50}%)`;
      case 'forest':
        return `hsl(${120 + ratio * 60}, 100%, ${30 + ratio * 40}%)`;
      default:
        return `hsl(${ratio * 360}, 100%, 50%)`;
    }
  }

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const newPanX = (event.clientX - rect.left) * scaleX / magnificationFactor - panX;
    const newPanY = (event.clientY - rect.top) * scaleY / magnificationFactor - panY;
    setPanX(newPanX);
    setPanY(newPanY);
    setMagnificationFactor(prev => prev * 1.6); // Adjust zoom sensitivity
  }

  function handleZoomIn() {
    setMagnificationFactor(prev => prev * 1.6); // Adjust zoom sensitivity
  }

  function handleZoomOut() {
    setMagnificationFactor(prev => prev / 1.6); // Adjust zoom sensitivity
  }

  function handlePan(dx: number, dy: number) {
    setPanX(prev => prev - dx / magnificationFactor);
    setPanY(prev => prev - dy / magnificationFactor);
  }

  function handleReset() {
    setMagnificationFactor(200);
    setPanX(2);
    setPanY(1);
  }

  function handleTransform() {
    setPower(prev => prev + 1); // Increment power
    setRotation(prev => prev + 15); // Increment rotation
  }

  function handleWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    const zoomSpeed = 1.6;
    if (event.deltaY < 0) {
      setMagnificationFactor(prev => prev * zoomSpeed);
    } else {
      setMagnificationFactor(prev => prev / zoomSpeed);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    for (let x = 0; x < innerWidth; x++) {
      for (let y = 0; y < innerHeight; y++) {
        const iteration = isMultibrotSet(
          x / magnificationFactor - panX,
          y / magnificationFactor - panY
        );
        ctx.fillStyle = getColor(iteration, 100);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [panX, panY, magnificationFactor, colorScheme, power, rotation]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'w':
          setPanY(prev => prev - moveSpeed / magnificationFactor);
          break;
        case 'a':
          setPanX(prev => prev + moveSpeed / magnificationFactor);
          break;
        case 's':
          setPanY(prev => prev + moveSpeed / magnificationFactor);
          break;
        case 'd':
          setPanX(prev => prev - moveSpeed / magnificationFactor);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [magnificationFactor, moveSpeed]);

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 right-4 space-y-2 bg-gray-800 bg-opacity-75 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => handlePan(-50, 0)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            ←
          </button>
          <button onClick={() => handlePan(0, -50)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            ↑
          </button>
          <button onClick={() => handlePan(50, 0)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            →
          </button>
          <button onClick={handleZoomIn} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            +
          </button>
          <button onClick={() => handlePan(0, 50)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            ↓
          </button>
          <button onClick={handleZoomOut} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            -
          </button>
        </div>
        <select 
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
          className="w-full bg-gray-700 text-white py-2 px-4 rounded"
        >
          <option value="default">Default</option>
          <option value="fire">Fire</option>
          <option value="ocean">Ocean</option>
          <option value="forest">Forest</option>
        </select>
        <p> </p>
        <button onClick={handleReset} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Reiniciar
        </button>
        <p> </p>
        <button onClick={handleTransform} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded mt-4">
          Multiplicar
        </button>
      </div>
    </div>
  );
}

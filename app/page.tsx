"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Html } from "@react-three/drei"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, SunIcon, MoonIcon } from "lucide-react"
import * as THREE from "three"

// Planet data with realistic properties (scaled for visibility)
const PLANETS = [
  { name: "Mercury", color: "#B7B8B9", size: 0.2, distance: 2.5, speed: 4.74, info: "Closest to Sun" },
  { name: "Venus", color: "#FFD700", size: 0.3, distance: 3.5, speed: 3.5, info: "Hottest planet" },
  { name: "Earth", color: "#4A90E2", size: 0.35, distance: 4.5, speed: 2.98, info: "Our home planet" },
  { name: "Mars", color: "#FF4500", size: 0.25, distance: 5.5, speed: 2.41, info: "The red planet" },
  { name: "Jupiter", color: "#FFA500", size: 0.9, distance: 7.5, speed: 1.31, info: "Largest planet" },
  { name: "Saturn", color: "#FFFF99", size: 0.8, distance: 9.5, speed: 0.97, info: "Has beautiful rings" },
  { name: "Uranus", color: "#00FFFF", size: 0.5, distance: 11.5, speed: 0.68, info: "Tilted on its side" },
  { name: "Neptune", color: "#0066FF", size: 0.5, distance: 13.5, speed: 0.54, info: "Windiest planet" },
]

interface PlanetProps {
  planet: (typeof PLANETS)[0]
  speed: number
  isPaused: boolean
  onHover: (planet: (typeof PLANETS)[0] | null) => void
}

function Planet({ planet, speed, isPaused, onHover }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += planet.speed * speed * 0.01
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* More visible orbit path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.distance - 0.05, planet.distance + 0.05, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>

      <mesh
        ref={meshRef}
        position={[planet.distance, 0, 0]}
        onPointerOver={() => {
          setHovered(true)
          onHover(planet)
        }}
        onPointerOut={() => {
          setHovered(false)
          onHover(null)
        }}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          roughness={0.6}
          metalness={0.1}
          emissive={planet.color}
          emissiveIntensity={0.1}
        />
        {hovered && (
          <Html distanceFactor={10}>
            <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/20">
              <div className="font-bold text-base">{planet.name}</div>
              <div className="text-xs opacity-80">{planet.info}</div>
            </div>
          </Html>
        )}
      </mesh>

      {/* Enhanced Saturn's rings */}
      {planet.name === "Saturn" && (
        <mesh position={[planet.distance, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.size + 0.15, planet.size + 0.4, 64]} />
          <meshBasicMaterial color="#FFD700" opacity={0.8} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

function SunComponent() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshBasicMaterial color="#FFD700" />
      <pointLight intensity={3} distance={60} color="#FFD700" />
      <pointLight intensity={1.5} distance={30} color="#FFA500" />
    </mesh>
  )
}

function SolarSystem({
  planetSpeeds,
  isPaused,
  onPlanetHover,
}: {
  planetSpeeds: number[]
  isPaused: boolean
  onPlanetHover: (planet: (typeof PLANETS)[0] | null) => void
}) {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
      <SunComponent />
      {PLANETS.map((planet, index) => (
        <Planet
          key={planet.name}
          planet={planet}
          speed={planetSpeeds[index]}
          isPaused={isPaused}
          onHover={onPlanetHover}
        />
      ))}
    </>
  )
}

function ControlPanel({
  planetSpeeds,
  setPlanetSpeeds,
  isPaused,
  setIsPaused,
  resetSpeeds,
  isDarkMode,
  setIsDarkMode,
}: {
  planetSpeeds: number[]
  setPlanetSpeeds: (speeds: number[]) => void
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  resetSpeeds: () => void
  isDarkMode: boolean
  setIsDarkMode: (dark: boolean) => void
}) {
  const updateSpeed = (index: number, value: number[]) => {
    const newSpeeds = [...planetSpeeds]
    newSpeeds[index] = value[0]
    setPlanetSpeeds(newSpeeds)
  }

  return (
    <Card
      className={`absolute top-4 left-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-10 ${isDarkMode ? "bg-gray-900/90 text-white" : "bg-white/90"}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <SunIcon className="w-5 h-5" />
            Solar System Controls
          </span>
          <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant={isPaused ? "default" : "secondary"}
            size="sm"
            className="flex-1"
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button onClick={resetSpeeds} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {PLANETS.map((planet, index) => (
            <div key={planet.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planet.color }} />
                  <span className="text-sm font-medium">{planet.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {planetSpeeds[index].toFixed(1)}x
                </Badge>
              </div>
              <Slider
                value={[planetSpeeds[index]]}
                onValueChange={(value) => updateSpeed(index, value)}
                max={5}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/50 rounded">
          <p>
            <strong>Controls:</strong>
          </p>
          <p>• Drag to rotate view</p>
          <p>• Scroll to zoom</p>
          <p>• Hover planets for info</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Component() {
  const [planetSpeeds, setPlanetSpeeds] = useState(PLANETS.map(() => 1))
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredPlanet, setHoveredPlanet] = useState<(typeof PLANETS)[0] | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const resetSpeeds = () => {
    setPlanetSpeeds(PLANETS.map(() => 1))
  }

  return (
    <div className={`w-full h-screen relative ${isDarkMode ? "bg-black" : "bg-blue-50"}`}>
      <Canvas camera={{ position: [0, 10, 15], fov: 60 }} gl={{ antialias: true }}>
        <SolarSystem planetSpeeds={planetSpeeds} isPaused={isPaused} onPlanetHover={setHoveredPlanet} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={50} />
      </Canvas>

      <ControlPanel
        planetSpeeds={planetSpeeds}
        setPlanetSpeeds={setPlanetSpeeds}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        resetSpeeds={resetSpeeds}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {hoveredPlanet && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg">
          <div className="text-center">
            <div className="font-bold text-lg">{hoveredPlanet.name}</div>
            <div className="text-sm opacity-80">{hoveredPlanet.info}</div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded">
        3D Solar System Simulation
      </div>
    </div>
  )
}

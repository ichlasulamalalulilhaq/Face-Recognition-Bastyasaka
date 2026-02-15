import { useState, useRef, useCallback, useEffect } from 'react'
import * as faceapi from 'face-api.js'
import { useApp } from '../context/AppContext'

export function useFaceDetection() {
  const { getAllPeople, setModelsLoaded, modelsLoaded } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isCameraActive, setIsCameraActive] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const faceMatcherRef = useRef(null)
  const isLoopRunning = useRef(false)

  // Load face-api models
  const loadModels = useCallback(async () => {
    if (modelsLoaded) return true
    
    setIsLoading(true)
    const MODEL_URLS = [
      'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
      'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/models'
    ]

    for (const MODEL_URL of MODEL_URLS) {
      try {
        setLoadingProgress(10)
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        setLoadingProgress(40)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        setLoadingProgress(70)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        setLoadingProgress(100)
        setModelsLoaded(true)
        setIsLoading(false)
        return true
      } catch (error) {
        console.warn(`Failed to load from ${MODEL_URL}:`, error)
        continue
      }
    }
    
    setIsLoading(false)
    return false
  }, [modelsLoaded, setModelsLoaded])

  // Detect face
  const detectFace = useCallback(async () => {
    if (!modelsLoaded || !videoRef.current) return null

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor()
      return detection || null
    } catch {
      return null
    }
  }, [modelsLoaded])

  // Draw detection on canvas
  const drawDetection = useCallback((detection) => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const displayWidth = video.offsetWidth
    const displayHeight = video.offsetHeight

    if (canvas.width !== displayWidth) canvas.width = displayWidth
    if (canvas.height !== displayHeight) canvas.height = displayHeight

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (detection && video.videoWidth > 0) {
      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      const resized = faceapi.resizeResults(detection, displaySize)
      const box = resized.detection.box

      const scaleX = displayWidth / video.videoWidth
      const scaleY = displayHeight / video.videoHeight

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 3
      ctx.strokeRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY)
    }
  }, [])

  // Smart Loop for Continuous Detection
  const startContinuousDetection = useCallback(() => {
    if (isLoopRunning.current) return

    isLoopRunning.current = true
    
    const loop = async () => {
      if (!isLoopRunning.current || !videoRef.current) return
      
      try {
        const detection = await detectFace()
        drawDetection(detection)
      } catch (err) {
        console.warn('Detection loop error:', err)
      }
      
      // Schedule next frame only after current one finishes to prevent CPU choke
      if (isLoopRunning.current) {
        requestAnimationFrame(loop)
      }
    }

    loop()
  }, [detectFace, drawDetection])

  const stopContinuousDetection = useCallback(() => {
    isLoopRunning.current = false
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        track.enabled = false
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Stop loop
    stopContinuousDetection()
    
    setIsCameraActive(false)
  }, [stopContinuousDetection])

  // Start camera
  const startCamera = useCallback(async () => {
    // Ensure cleanup first
    stopCamera()
    
    // Check if models loaded
    if (!modelsLoaded) {
      await loadModels()
    }
    
    if (!videoRef.current) return false

    const constraints = [
      { video: { facingMode: 'user', frameRate: { ideal: 30 } }, audio: false },
      { video: true, audio: false }
    ]

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint)
        
        if (!videoRef.current) {
            // Component unmounted during await
            stream.getTracks().forEach(t => t.stop())
            return false
        }

        videoRef.current.srcObject = stream
        streamRef.current = stream

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.warn('Play error:', e))
            resolve()
          }
          // Fallback if metadata event doesn't fire
          setTimeout(resolve, 1000)
        })

        setIsCameraActive(true)
        
        // Start continuous detection
        if (canvasRef.current) {
          startContinuousDetection()
        }
        
        return true
      } catch (error) {
        console.warn('Camera constraint failed:', error)
        continue
      }
    }

    console.error('Failed to access camera')
    return false
  }, [loadModels, stopCamera, startContinuousDetection, modelsLoaded])

  // Capture face descriptor
  const captureDescriptor = useCallback(async () => {
    // Pause loop momentarily to get clean capture? 
    // No, detectFace is safe to call in parallel but might be slow.
    const detection = await detectFace()
    if (!detection) throw new Error('Tidak ada wajah terdeteksi. Pastikan wajah terlihat jelas.')
    return detection.descriptor
  }, [detectFace])

    // Build face matcher from all people (students + employees)
    const buildFaceMatcher = useCallback(() => {
        const people = getAllPeople()
        // console.log('Building face matcher with people:', people.length)
        
        const descriptors = people
            .filter(p => {
                const hasDescriptor = p.faceDescriptor && Array.isArray(p.faceDescriptor) && p.faceDescriptor.length > 0
                if (!hasDescriptor && p.dbId) {
                     // console.warn(`Person ${p.name} (${p.type}) has no valid face descriptor`)
                }
                return hasDescriptor
            })
            .map(p => {
                // Use dbId (database UUID) as primary identifier for reliable matching
                return new faceapi.LabeledFaceDescriptors(
                    `${p.dbId}|${p.id}|${p.name}|${p.type}`,
                    [new Float32Array(p.faceDescriptor)]
                )
            })

        if (descriptors.length === 0) {
            console.warn('No valid face descriptors found for matching')
            faceMatcherRef.current = null
            return null
        }

        console.log(`Face matcher built with ${descriptors.length} people`)
        faceMatcherRef.current = new faceapi.FaceMatcher(descriptors, 0.5) // Slightly stricter threshold (0.6 -> 0.5)
        return faceMatcherRef.current
    }, [getAllPeople])

  // Recognize face - returns person info including type (student/employee)
  const recognizeFace = useCallback(async () => {
    if (!modelsLoaded) throw new Error('Model face recognition belum dimuat')

    buildFaceMatcher()
    if (!faceMatcherRef.current) throw new Error('Tidak ada siswa atau guru terdaftar')

    const detection = await detectFace()
    if (!detection) throw new Error('Tidak ada wajah terdeteksi')

    const match = faceMatcherRef.current.findBestMatch(detection.descriptor)
    if (match.label === 'unknown') throw new Error('Wajah tidak dikenali')

    // Parse label: dbId|id(NIS/NIP)|name|type
    const [dbId, id, name, type] = match.label.split('|')
    return { 
      dbId,
      id, // NIS or NIP
      name, 
      type, // 'student' or 'employee'
      confidence: Math.round((1 - match.distance) * 100) 
    }
  }, [modelsLoaded, detectFace, buildFaceMatcher])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    canvasRef,
    isLoading,
    loadingProgress,
    modelsLoaded,
    isCameraActive,
    startCamera,
    stopCamera,
    detectFace,
    drawDetection,
    startContinuousDetection,
    stopContinuousDetection,
    buildFaceMatcher,
    captureDescriptor,
    recognizeFace
  }
}

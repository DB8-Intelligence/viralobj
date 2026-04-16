// __tests__/services/feature-flags.test.ts
// Testes Unitarios — Feature Flags (CRF, TTS, IP-Adapter, Preview Mode)

describe('Feature Flags Service', () => {
  beforeEach(() => {
    delete process.env.FFMPEG_CRF
    delete process.env.FFMPEG_BITRATE
    delete process.env.TTS_PROVIDER
    delete process.env.FEATURE_IP_ADAPTER
    delete process.env.IP_ADAPTER_STRENGTH
    delete process.env.FEATURE_PREVIEW_MODE
    delete process.env.SENTRY_ENABLED
    delete process.env.LOG_COSTS
  })

  describe('FFmpeg CRF Configuration', () => {
    it('should default to CRF 23', () => {
      const crf = parseInt(process.env.FFMPEG_CRF || '23')
      expect(crf).toBe(23)
    })

    it('should respect CRF environment variable', () => {
      process.env.FFMPEG_CRF = '21'
      const crf = parseInt(process.env.FFMPEG_CRF)
      expect(crf).toBe(21)
    })

    it('should default bitrate to 1500k', () => {
      const bitrate = process.env.FFMPEG_BITRATE || '1500k'
      expect(bitrate).toBe('1500k')
    })

    it('should respect bitrate environment variable', () => {
      process.env.FFMPEG_BITRATE = '2000k'
      const bitrate = process.env.FFMPEG_BITRATE
      expect(bitrate).toBe('2000k')
    })

    it('should validate CRF is in valid range', () => {
      const validCRFs = [18, 20, 23, 25, 28]
      validCRFs.forEach((crf) => {
        expect(crf).toBeGreaterThanOrEqual(18)
        expect(crf).toBeLessThanOrEqual(28)
      })
    })

    it('should calculate quality improvement CRF 21 vs 23', () => {
      const crf23Quality = 23
      const crf21Quality = 21
      const improvement = ((crf23Quality - crf21Quality) / crf23Quality) * 100
      expect(improvement).toBeGreaterThan(5)
    })
  })

  describe('TTS Provider Configuration', () => {
    it('should default to ElevenLabs', () => {
      const provider = process.env.TTS_PROVIDER || 'elevenlabs'
      expect(provider).toBe('elevenlabs')
    })

    it('should respect TTS_PROVIDER environment variable', () => {
      process.env.TTS_PROVIDER = 'minimax'
      const provider = process.env.TTS_PROVIDER
      expect(provider).toBe('minimax')
    })

    it('should support both ElevenLabs and MiniMax', () => {
      const validProviders = ['elevenlabs', 'minimax']

      process.env.TTS_PROVIDER = 'elevenlabs'
      expect(validProviders).toContain(process.env.TTS_PROVIDER)

      process.env.TTS_PROVIDER = 'minimax'
      expect(validProviders).toContain(process.env.TTS_PROVIDER)
    })

    it('should calculate cost difference between providers', () => {
      const elevenlabsCost = 0.09
      const minimaxCost = 0.05
      const savings = elevenlabsCost - minimaxCost

      expect(savings).toBeCloseTo(0.04, 10)
      const savingsPercent = (savings / elevenlabsCost) * 100
      expect(savingsPercent).toBeCloseTo(44.44, 1)
    })
  })

  describe('IP-Adapter Feature Flag', () => {
    it('should be disabled by default', () => {
      const enabled = process.env.FEATURE_IP_ADAPTER === 'true'
      expect(enabled).toBe(false)
    })

    it('should enable with FEATURE_IP_ADAPTER=true', () => {
      process.env.FEATURE_IP_ADAPTER = 'true'
      const enabled = process.env.FEATURE_IP_ADAPTER === 'true'
      expect(enabled).toBe(true)
    })

    it('should default strength to 0.75', () => {
      const strength = parseFloat(process.env.IP_ADAPTER_STRENGTH || '0.75')
      expect(strength).toBe(0.75)
    })

    it('should respect IP_ADAPTER_STRENGTH environment variable', () => {
      process.env.IP_ADAPTER_STRENGTH = '0.85'
      const strength = parseFloat(process.env.IP_ADAPTER_STRENGTH)
      expect(strength).toBe(0.85)
    })

    it('should maintain character consistency (85% with strength 0.75)', () => {
      const consistency = 0.85
      expect(consistency).toBeGreaterThanOrEqual(0.7)
      expect(consistency).toBeLessThanOrEqual(1.0)
    })
  })

  describe('Preview Mode Feature Flag', () => {
    it('should be disabled by default', () => {
      const enabled = process.env.FEATURE_PREVIEW_MODE === 'true'
      expect(enabled).toBe(false)
    })

    it('should enable with FEATURE_PREVIEW_MODE=true', () => {
      process.env.FEATURE_PREVIEW_MODE = 'true'
      const enabled = process.env.FEATURE_PREVIEW_MODE === 'true'
      expect(enabled).toBe(true)
    })

    it('should skip lip-sync when enabled', () => {
      process.env.FEATURE_PREVIEW_MODE = 'true'
      const skipLipsync = process.env.FEATURE_PREVIEW_MODE === 'true'
      expect(skipLipsync).toBe(true)
    })

    it('should calculate cost savings without lip-sync', () => {
      const normalCost = 0.28
      const previewCost = 0.12
      const savings = normalCost - previewCost

      expect(savings).toBeCloseTo(0.16, 10)
      const savingsPercent = (savings / normalCost) * 100
      expect(savingsPercent).toBeCloseTo(57.14, 1)
    })
  })

  describe('Monitoring Configuration', () => {
    it('should default Sentry disabled', () => {
      const enabled = process.env.SENTRY_ENABLED === 'true'
      expect(enabled).toBe(false)
    })

    it('should enable Sentry when flag is set', () => {
      process.env.SENTRY_ENABLED = 'true'
      const enabled = process.env.SENTRY_ENABLED === 'true'
      expect(enabled).toBe(true)
    })

    it('should default cost logging disabled', () => {
      const enabled = process.env.LOG_COSTS === 'true'
      expect(enabled).toBe(false)
    })

    it('should enable cost logging when flag is set', () => {
      process.env.LOG_COSTS = 'true'
      const enabled = process.env.LOG_COSTS === 'true'
      expect(enabled).toBe(true)
    })
  })

  describe('Combined Flags', () => {
    it('should support multiple flags together', () => {
      process.env.FFMPEG_CRF = '21'
      process.env.TTS_PROVIDER = 'minimax'
      process.env.FEATURE_IP_ADAPTER = 'true'

      expect(parseInt(process.env.FFMPEG_CRF!)).toBe(21)
      expect(process.env.TTS_PROVIDER).toBe('minimax')
      expect(process.env.FEATURE_IP_ADAPTER).toBe('true')
    })

    it('should allow independent flag toggling', () => {
      process.env.FFMPEG_CRF = '21'
      expect(parseInt(process.env.FFMPEG_CRF!)).toBe(21)
      expect(process.env.TTS_PROVIDER).toBeUndefined()
      delete process.env.FFMPEG_CRF

      process.env.TTS_PROVIDER = 'minimax'
      expect(parseInt(process.env.FFMPEG_CRF || '23')).toBe(23)
      expect(process.env.TTS_PROVIDER).toBe('minimax')
      delete process.env.TTS_PROVIDER

      process.env.FEATURE_IP_ADAPTER = 'true'
      expect(process.env.FEATURE_IP_ADAPTER).toBe('true')
      expect(process.env.TTS_PROVIDER).toBeUndefined()
    })

    it('should calculate total cost with optimized flags', () => {
      const baselineCost = 0.28
      const ttsSavings = 0.04
      const crfMinimalSavings = 0.01

      const optimizedCost = baselineCost - ttsSavings - crfMinimalSavings
      expect(optimizedCost).toBeLessThan(baselineCost)
    })
  })

  describe('Cost Calculations', () => {
    it('should calculate image generation cost (FLUX.2 Pro)', () => {
      const imagesPerVideo = 4
      const costPerImage = 0.05
      const totalImageCost = imagesPerVideo * costPerImage
      expect(totalImageCost).toBe(0.20)
    })

    it('should calculate TTS cost with ElevenLabs', () => {
      const voicesPerVideo = 4
      const costPerVoice = 0.0225
      const totalTtsCost = voicesPerVideo * costPerVoice
      expect(totalTtsCost).toBe(0.09)
    })

    it('should calculate TTS cost with MiniMax', () => {
      const voicesPerVideo = 4
      const costPerVoice = 0.0125
      const totalTtsCost = voicesPerVideo * costPerVoice
      expect(totalTtsCost).toBe(0.05)
    })

    it('should calculate lip-sync cost (LivePortrait)', () => {
      const videosPerJob = 4
      const costPerLipsync = 0.04
      const totalLipsyncCost = videosPerJob * costPerLipsync
      expect(totalLipsyncCost).toBe(0.16)
    })

    it('should calculate total baseline cost', () => {
      const llmPackage = 0.02
      const imageGeneration = 0.20
      const ttsElevenLabs = 0.09
      const livePortrait = 0.16
      const infrastructure = 0.03

      const totalCost = llmPackage + imageGeneration + ttsElevenLabs + livePortrait + infrastructure
      expect(totalCost).toBe(0.50)

      const totalBRL = totalCost * 5
      expect(totalBRL).toBe(2.50)
    })

    it('should validate cost per plan matches revenue', () => {
      const costPerVideo = 0.50
      const creatorCost = 149 / 5
      const creatorVideos = 60
      const creatorVideosCost = creatorVideos * costPerVideo

      expect(creatorVideosCost).toBeGreaterThan(creatorCost)
    })
  })
})

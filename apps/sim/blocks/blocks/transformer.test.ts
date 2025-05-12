import { describe, it, expect, vi } from 'vitest'
import { TransformerBlock } from './transformer'

describe('TransformerBlock', () => {
  it('devrait avoir la configuration de base correcte', () => {
    expect(TransformerBlock.type).toBe('transformer')
    expect(TransformerBlock.name).toBe('Transformer')
    expect(TransformerBlock.category).toBe('tools')
    expect(TransformerBlock.bgColor).toBe('#6366F1')
    expect(TransformerBlock.subBlocks.length).toBeGreaterThan(0)
  })

  it('devrait avoir les sous-blocs requis', () => {
    const subBlockIds = TransformerBlock.subBlocks.map(sb => sb.id)
    expect(subBlockIds).toContain('mode')
    expect(subBlockIds).toContain('code')
    expect(subBlockIds).toContain('transformations')
    expect(subBlockIds).toContain('advanced')
    expect(subBlockIds).toContain('errorHandling')
  })

  it('devrait configurer correctement l\'outil function_execute en mode custom', () => {
    const params = {
      mode: 'custom',
      input: { test: 'data' },
      code: 'return { transformed: true, ...input };',
      errorHandling: 'stop'
    }

    const toolConfig = TransformerBlock.tools.config
    expect(toolConfig).toBeDefined()
    
    if (toolConfig) {
      const toolId = toolConfig.tool(params)
      expect(toolId).toBe('function_execute')
      
      const toolParams = toolConfig.params(params)
      expect(toolParams).toHaveProperty('code')
      expect(toolParams.code).toContain('const input =')
      expect(toolParams.code).toContain('return { transformed: true, ...input }')
      expect(toolParams).toHaveProperty('timeout', 5000)
    }
  })

  it('devrait configurer correctement l\'outil function_execute en mode prédéfini', () => {
    const params = {
      mode: 'predefined',
      input: { firstName: 'John', lastName: 'Doe' },
      transformations: [
        { source: 'firstName', operation: 'uppercase', destination: 'first_name' },
        { source: 'lastName', operation: 'copy', destination: 'last_name' }
      ],
      errorHandling: 'continue'
    }

    const toolConfig = TransformerBlock.tools.config
    expect(toolConfig).toBeDefined()
    
    if (toolConfig) {
      const toolId = toolConfig.tool(params)
      expect(toolId).toBe('function_execute')
      
      const toolParams = toolConfig.params(params)
      expect(toolParams).toHaveProperty('code')
      expect(toolParams.code).toContain('const input =')
      expect(toolParams.code).toContain('toUpperCase()')
      expect(toolParams.code).toContain('return input')
      expect(toolParams).toHaveProperty('timeout', 5000)
    }
  })

  it('devrait gérer les erreurs selon la configuration', () => {
    const configs = [
      { errorHandling: 'stop', shouldContain: 'throw error' },
      { errorHandling: 'continue', shouldContain: 'return input' },
      { errorHandling: 'default', defaultValue: '{"fallback":true}', shouldContain: 'return {"fallback":true}' }
    ]

    const toolConfig = TransformerBlock.tools.config
    expect(toolConfig).toBeDefined()
    
    if (toolConfig) {
      configs.forEach(config => {
        const params = {
          mode: 'custom',
          input: { test: 'data' },
          code: 'return input;',
          ...config
        }
        
        const toolParams = toolConfig.params(params)
        expect(toolParams.code).toContain(config.shouldContain)
      })
    }
  })
})

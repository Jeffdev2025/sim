import { FilterBlock } from './filter'

describe('FilterBlock', () => {
  it('devrait être correctement configuré', () => {
    expect(FilterBlock).toBeDefined()
    expect(FilterBlock.type).toBe('filter')
    expect(FilterBlock.name).toBe('Filter')
    expect(FilterBlock.category).toBe('blocks')
  })

  it('devrait avoir les sous-blocs requis', () => {
    expect(FilterBlock.subBlocks).toBeDefined()
    
    // Vérifier les sous-blocs essentiels
    const subBlockIds = FilterBlock.subBlocks?.map(sb => sb.id) || []
    expect(subBlockIds).toContain('mode')
    expect(subBlockIds).toContain('conditions')
    expect(subBlockIds).toContain('logicOperator')
    expect(subBlockIds).toContain('code')
    expect(subBlockIds).toContain('emptyResult')
  })

  it('devrait avoir accès à l\'outil function_execute', () => {
    expect(FilterBlock.tools).toBeDefined()
    expect(FilterBlock.tools?.access).toContain('function_execute')
  })

  it('devrait avoir les entrées et sorties correctement définies', () => {
    // Vérifier les entrées
    expect(FilterBlock.inputs).toBeDefined()
    expect(FilterBlock.inputs?.input).toBeDefined()
    expect(FilterBlock.inputs?.input.type).toBe('json')
    expect(FilterBlock.inputs?.input.required).toBe(true)
    
    // Vérifier les sorties
    expect(FilterBlock.outputs).toBeDefined()
    expect(FilterBlock.outputs?.response).toBeDefined()
    expect(FilterBlock.outputs?.response.type).toHaveProperty('json')
  })

  it('devrait générer la configuration correcte pour l\'outil function_execute', () => {
    expect(FilterBlock.tools?.config).toBeDefined()
    if (FilterBlock.tools?.config && typeof FilterBlock.tools.config.tool === 'function' && typeof FilterBlock.tools.config.params === 'function') {
      expect(FilterBlock.tools.config.tool('input')).toBe('function_execute')
      
      // Test pour le mode personnalisé
      const customParams = FilterBlock.tools.config.params({
      mode: 'custom',
      code: 'return item.value > 10;',
      input: [{ value: 5 }, { value: 15 }],
      emptyResult: 'empty'
    })
    
      expect(customParams).toBeDefined()
      expect(customParams.code).toContain('return item.value > 10;')
      expect(customParams.timeout).toBe(5000)
      
      // Test pour le mode simple
      const simpleParams = FilterBlock.tools.config.params({
      mode: 'simple',
      conditions: [{ Champ: 'status', Opérateur: 'equals', Valeur: 'active' }],
      logicOperator: 'and',
      input: [{ status: 'active' }, { status: 'inactive' }],
      caseSensitive: 'true',
      emptyResult: 'null'
    })
    
      expect(simpleParams).toBeDefined()
      expect(simpleParams.code).toContain('evaluateCondition')
      expect(simpleParams.code).toContain('return null;')
      expect(simpleParams.timeout).toBe(5000)
    }
  })
})

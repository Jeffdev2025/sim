import { describe, it, expect } from 'vitest'
import { MapperBlock } from './mapper'

describe('MapperBlock', () => {
  it('devrait avoir la configuration de base correcte', () => {
    expect(MapperBlock.type).toBe('mapper')
    expect(MapperBlock.name).toBe('Mapper')
    expect(MapperBlock.description).toContain('champs entre différentes structures')
    expect(MapperBlock.category).toBe('blocks')
    
    // Vérifier les entrées
    expect(MapperBlock.inputs).toBeDefined()
    expect(MapperBlock.inputs?.input).toBeDefined()
    expect(MapperBlock.inputs?.input.type).toBe('json')
    expect(MapperBlock.inputs?.targetSchema).toBeDefined()
    expect(MapperBlock.inputs?.targetSchema.required).toBe(false)
    
    // Vérifier les sorties
    expect(MapperBlock.outputs).toBeDefined()
    expect(MapperBlock.outputs?.response).toBeDefined()
    expect(MapperBlock.outputs?.response.type).toHaveProperty('json')
  })

  it('devrait avoir les sous-blocs de configuration correctement définis', () => {
    const subBlocks = MapperBlock.subBlocks
    expect(subBlocks).toBeDefined()
    expect(subBlocks.length).toBeGreaterThanOrEqual(2)
    
    // Vérifier le bloc de mapping
    const mappingBlock = subBlocks.find((block) => block.id === 'mapping')
    expect(mappingBlock).toBeDefined()
    expect(mappingBlock?.type).toBe('table')
    expect(mappingBlock?.columns).toBeDefined()
    expect(mappingBlock?.columns?.length).toBeGreaterThanOrEqual(3)
    
    // Vérifier le bloc d'options
    const optionsBlock = subBlocks.find((block) => block.id === 'options')
    expect(optionsBlock).toBeDefined()
    expect(optionsBlock?.type).toBe('switch')
    expect(optionsBlock?.options).toBeDefined()
    expect(optionsBlock?.options?.length).toBeGreaterThanOrEqual(2)
  })

  it('devrait générer la configuration correcte pour l\'outil function_execute', () => {
    expect(MapperBlock.tools?.config).toBeDefined()
    
    if (MapperBlock.tools?.config && typeof MapperBlock.tools.config.tool === 'function' && typeof MapperBlock.tools.config.params === 'function') {
      // Vérifier l'outil utilisé
      expect(MapperBlock.tools.config.tool({} as Record<string, any>)).toBe('function_execute')
      
      // Test avec un mapping simple
      const params = MapperBlock.tools.config.params(
        { 
          input: { name: 'John Doe', age: 30 },
          blocks: { 
            mapping: { 
              value: [
                { sourceField: 'name', targetField: 'fullName', transformation: 'direct' },
                { sourceField: 'age', targetField: 'years', transformation: 'toString' }
              ] 
            },
            options: { value: { preserveUnmapped: false, ignoreErrors: false } }
          }
        }
      )
      
      expect(params).toBeDefined()
      expect(params.code).toContain('executeMapping')
      expect(params.code).toContain('name -> fullName')
      expect(params.code).toContain('age -> years')
      expect(params.timeout).toBe(5000)
    }
  })

  it('devrait gérer les transformations personnalisées', () => {
    if (MapperBlock.tools?.config && typeof MapperBlock.tools.config.params === 'function') {
      const params = MapperBlock.tools.config.params(
        { 
          input: { firstName: 'John', lastName: 'Doe' },
          blocks: { 
            mapping: { 
              value: [
                { 
                  sourceField: 'firstName', 
                  targetField: 'name', 
                  transformation: 'custom',
                  customExpression: 'value => value + " " + source.lastName'
                }
              ] 
            },
            options: { value: { preserveUnmapped: false, ignoreErrors: true } }
          }
        }
      )
      
      expect(params).toBeDefined()
      // Vérifier que le code contient l'expression personnalisée
      expect(params.code).toContain('value => value + " " + source.lastName')
      expect(params.code).toContain('firstName -> name')
    }
  })

  it('devrait gérer le code personnalisé complet', () => {
    if (MapperBlock.tools?.config && typeof MapperBlock.tools.config.params === 'function') {
      const customCode = `
        function mapData(source) {
          return {
            fullName: source.firstName + ' ' + source.lastName,
            isAdult: source.age >= 18
          };
        }
      `;
      
      const params = MapperBlock.tools.config.params(
        { 
          input: { firstName: 'John', lastName: 'Doe', age: 30 },
          blocks: { 
            options: { value: { useCustomCode: true } },
            customCode: { value: customCode }
          }
        }
      )
      
      expect(params).toBeDefined()
      expect(params.code).toContain('mapData(source)')
      expect(params.code).toContain('fullName: source.firstName + ')
    }
  })
})

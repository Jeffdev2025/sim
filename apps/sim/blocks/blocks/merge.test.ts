import { describe, it, expect, vi } from 'vitest'
import { MergeBlock } from './merge'
import { executeMerge, MergeExecutionConfig } from './merge_execution'

// Mock de la fonction console.log pour les tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Bloc Merge', () => {
  it('devrait être correctement configuré', () => {
    expect(MergeBlock).toBeDefined()
    expect(MergeBlock.type).toBe('merge')
    expect(MergeBlock.name).toBe('Merge')
    expect(MergeBlock.category).toBe('blocks')
    expect(MergeBlock.subBlocks.length).toBeGreaterThan(0)
    expect(MergeBlock.tools.access).toContain('function_execute')
    expect(MergeBlock.inputs.input1).toBeDefined()
    expect(MergeBlock.outputs.response).toBeDefined()
  })

  it('devrait générer correctement les paramètres pour l\'outil function_execute', () => {
    const inputs = {
      input1: [1, 2, 3],
      input2: [4, 5, 6],
      mode: 'concat',
      arrayOptions: ['sort'],
      sortDirection: 'desc',
      advanced: ['enableLogging']
    }

    // Vérifier que la configuration de l'outil est définie
    expect(MergeBlock.tools.config).toBeDefined()
    if (MergeBlock.tools.config && MergeBlock.tools.config.params) {
      const params = MergeBlock.tools.config.params(inputs)
      
      expect(params).toBeDefined()
      expect(params.code).toContain('executeMerge')
      expect(params.input).toEqual({ input1: [1, 2, 3], input2: [4, 5, 6] })
      expect(params.timeout).toBe(10000)
    }
  })
})

describe('Exécution du Merge', () => {
  it('devrait concaténer des tableaux en mode concat', () => {
    const inputs = {
      input1: [1, 2, 3],
      input2: [4, 5, 6]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([1, 2, 3, 4, 5, 6])
  })
  
  it('devrait fusionner des objets en mode merge', () => {
    const inputs = {
      input1: { a: 1, b: 2 },
      input2: { b: 3, c: 4 }
    }
    
    const config: MergeExecutionConfig = {
      mode: 'merge',
      objectStrategy: 'replace',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual({ a: 1, b: 3, c: 4 })
  })
  
  it('devrait conserver les propriétés originales en mode keep', () => {
    const inputs = {
      input1: { a: 1, b: 2 },
      input2: { b: 3, c: 4 }
    }
    
    const config: MergeExecutionConfig = {
      mode: 'merge',
      objectStrategy: 'keep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual({ a: 1, b: 2, c: 4 })
  })
  
  it('devrait fusionner profondément des objets imbriqués', () => {
    const inputs = {
      input1: { a: 1, nested: { x: 1, y: 2 } },
      input2: { b: 2, nested: { y: 3, z: 4 } }
    }
    
    const config: MergeExecutionConfig = {
      mode: 'merge',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual({ 
      a: 1, 
      b: 2, 
      nested: { x: 1, y: 3, z: 4 } 
    })
  })
  
  it('devrait créer l\'union de tableaux en mode union', () => {
    const inputs = {
      input1: [1, 2, 3, 4],
      input2: [3, 4, 5, 6]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'union',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([1, 2, 3, 4, 5, 6])
  })
  
  it('devrait créer l\'intersection de tableaux en mode intersection', () => {
    const inputs = {
      input1: [1, 2, 3, 4],
      input2: [3, 4, 5, 6]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'intersection',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([3, 4])
  })
  
  it('devrait trier les éléments si l\'option est activée', () => {
    const inputs = {
      input1: [3, 1, 4],
      input2: [5, 2]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {
        sort: true,
        sortDirection: 'asc'
      },
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([1, 2, 3, 4, 5])
  })
  
  it('devrait trier par champ spécifique si spécifié', () => {
    const inputs = {
      input1: [{ id: 3, name: 'C' }, { id: 1, name: 'A' }],
      input2: [{ id: 2, name: 'B' }]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {
        sort: true,
        sortField: 'id',
        sortDirection: 'asc'
      },
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' }
    ])
  })
  
  it('devrait supprimer les doublons si l\'option est activée', () => {
    const inputs = {
      input1: [1, 2, 3],
      input2: [2, 3, 4]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {
        removeDuplicates: true
      },
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([1, 2, 3, 4])
  })
  
  it('devrait supprimer les doublons basés sur un champ d\'identification', () => {
    const inputs = {
      input1: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
      input2: [{ id: 2, name: 'C' }, { id: 3, name: 'D' }]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {
        removeDuplicates: true,
        identifierField: 'id'
      },
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    // L'ordre peut varier, donc on vérifie juste que les IDs sont uniques
    expect(result.data.length).toBe(3)
    expect(result.data.map((item: {id: number}) => item.id).sort()).toEqual([1, 2, 3])
  })
  
  it('devrait aplatir les tableaux imbriqués si l\'option est activée', () => {
    const inputs = {
      input1: [1, [2, 3]],
      input2: [[4, 5], 6]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {
        flatten: true
      },
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toEqual([1, 2, 3, 4, 5, 6])
  })
  
  it('devrait appliquer des préfixes aux clés si activé', () => {
    const inputs = {
      input1: { a: 1, b: 2 },
      input2: { c: 3, d: 4 }
    }
    
    const config: MergeExecutionConfig = {
      mode: 'merge',
      objectStrategy: 'replace',
      arrayOptions: {},
      keyPrefix: { 
        enabled: true, 
        prefixes: { 
          input1: 'src1',
          input2: 'src2'
        }, 
        separator: '_' 
      },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    // Les clés devraient être préfixées selon la configuration
    expect(result.data).toHaveProperty('src1_a', 1)
    expect(result.data).toHaveProperty('src1_b', 2)
    expect(result.data).toHaveProperty('src2_c', 3)
    expect(result.data).toHaveProperty('src2_d', 4)
  })
  
  it('devrait collecter des statistiques si l\'option est activée', () => {
    const inputs = {
      input1: [1, 2, 3],
      input2: [4, 5, 6]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: true,
      simulationMode: false,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.stats).toBeDefined()
    if (result.stats) {
      expect(result.stats.inputCount).toEqual({ input1: 3, input2: 3 })
      expect(result.stats.outputCount).toBe(6)
      expect(result.stats.processingTime).toBeGreaterThanOrEqual(0)
    }
  })
  
  it('devrait exécuter en mode simulation si activé', () => {
    const inputs = {
      input1: [1, 2, 3],
      input2: [4, 5, 6]
    }
    
    const config: MergeExecutionConfig = {
      mode: 'concat',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default',
      batchProcessing: false,
      collectStats: false,
      simulationMode: true,
      enableLogging: false
    }
    
    const result = executeMerge(inputs, config)
    
    expect(result.data).toHaveProperty('simulation', true)
    expect(result.data).toHaveProperty('inputs')
    expect(result.data).toHaveProperty('config')
  })
  
  it('devrait gérer les erreurs selon la stratégie spécifiée', () => {
    const inputs = {
      input1: [1, 2, 3]
    }
    
    // Créer une configuration avec un code personnalisé qui génère une erreur
    const config: MergeExecutionConfig = {
      mode: 'custom',
      objectStrategy: 'deep',
      arrayOptions: {},
      keyPrefix: { enabled: false, prefixes: {}, separator: '_' },
      errorHandling: 'default', // Utiliser une valeur par défaut en cas d'erreur
      batchProcessing: false,
      collectStats: true,
      simulationMode: false,
      enableLogging: false,
      customCode: 'throw new Error("Erreur de test");'
    }
    
    const result = executeMerge(inputs, config)
    
    // Devrait retourner un objet vide comme valeur par défaut
    expect(result.data).toEqual({})
    expect(result.stats).toBeDefined()
    if (result.stats && result.stats.errors) {
      expect(result.stats.errors.length).toBeGreaterThan(0)
      expect(result.stats.errors[0].message).toContain('Erreur de test')
    }
  })
})

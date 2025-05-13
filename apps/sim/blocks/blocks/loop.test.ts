import { executeLoop, LoopExecutionConfig } from './loop_execution'

describe('Bloc Loop', () => {
  describe('executeLoop', () => {
    // Configuration de base pour les tests
    const baseConfig: LoopExecutionConfig = {
      collectionType: 'array' as 'array',
      mode: 'sequential' as 'sequential',
      exitStrategy: 'all' as 'all',
      limit: 0,
      errorHandling: 'ignore' as 'ignore',
      accumulateResults: true,
      includeMetadata: true,
      simulationMode: false,
      enableLogging: false
    }

    test('devrait itérer sur un tableau en mode séquentiel', () => {
      const collection = [1, 2, 3, 4, 5]
      const config = { ...baseConfig }
      
      // Première itération
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.currentIndex).toBe(0)
      expect(result1.currentItem).toBe(1)
      expect(result1.data).toEqual([1])
      expect(result1.isComplete).toBe(false)
      
      // Deuxième itération
      const result2 = executeLoop(collection, config, 1, result1.data)
      expect(result2.currentIndex).toBe(1)
      expect(result2.currentItem).toBe(2)
      expect(result2.data).toEqual([1, 2])
      expect(result2.isComplete).toBe(false)
      
      // Dernière itération
      const result5 = executeLoop(collection, config, 4, [1, 2, 3, 4])
      expect(result5.currentIndex).toBe(4)
      expect(result5.currentItem).toBe(5)
      expect(result5.data).toEqual([1, 2, 3, 4, 5])
      expect(result5.isComplete).toBe(true)
      expect(result5.isLastIteration).toBe(true)
    })

    test('devrait respecter la limite d\'itérations', () => {
      const collection = [1, 2, 3, 4, 5]
      const config = { ...baseConfig, limit: 3 }
      
      // Première itération
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.isComplete).toBe(false)
      
      // Deuxième itération
      const result2 = executeLoop(collection, config, 1, result1.data)
      expect(result2.isComplete).toBe(false)
      
      // Troisième et dernière itération (à cause de la limite)
      const result3 = executeLoop(collection, config, 2, [1, 2])
      expect(result3.currentIndex).toBe(2)
      expect(result3.currentItem).toBe(3)
      expect(result3.data).toEqual([1, 2, 3])
      expect(result3.isComplete).toBe(true)
      expect(result3.isLastIteration).toBe(true)
    })

    test('devrait itérer sur un objet', () => {
      const collection = { a: 1, b: 2, c: 3 }
      const config = { ...baseConfig, collectionType: 'object' as 'object' }
      
      // Première itération
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.currentItem).toEqual({ key: 'a', value: 1 })
      expect(result1.data).toEqual([{ key: 'a', value: 1 }])
      
      // Deuxième itération
      const result2 = executeLoop(collection, config, 1, result1.data)
      expect(result2.currentItem).toEqual({ key: 'b', value: 2 })
      expect(result2.data).toEqual([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 }
      ])
    })

    test('devrait itérer sur une plage de valeurs', () => {
      const collection = { start: 5, end: 8 }
      const config = { ...baseConfig, collectionType: 'range' as 'range' }
      
      // Première itération
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.currentItem).toBe(5)
      expect(result1.data).toEqual([5])
      
      // Deuxième itération
      const result2 = executeLoop(collection, config, 1, result1.data)
      expect(result2.currentItem).toBe(6)
      expect(result2.data).toEqual([5, 6])
      
      // Dernière itération
      const result4 = executeLoop(collection, config, 3, [5, 6, 7])
      expect(result4.currentItem).toBe(8)
      expect(result4.data).toEqual([5, 6, 7, 8])
      expect(result4.isComplete).toBe(true)
    })

    test('devrait fonctionner en mode parallèle', () => {
      const collection = [1, 2, 3, 4, 5]
      const config = { ...baseConfig, mode: 'parallel' as 'parallel' }
      
      const result = executeLoop(collection, config, 0, [])
      expect(result.data).toEqual([1, 2, 3, 4, 5])
      expect(result.isComplete).toBe(true)
      expect(result.stats?.processedItems).toBe(5)
    })

    test('devrait fonctionner en mode batch', () => {
      const collection = [1, 2, 3, 4, 5, 6, 7, 8]
      const config = { 
        ...baseConfig, 
        mode: 'batch' as 'batch',
        batchOptions: { size: 3, overlap: 0 }
      }
      
      // Premier lot (indices 0-2)
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.data).toEqual([1, 2, 3])
      expect(result1.currentIndex).toBe(2)
      expect(result1.isComplete).toBe(false)
      
      // Deuxième lot (indices 3-5)
      const result2 = executeLoop(collection, config, 3, [])
      expect(result2.data).toEqual([4, 5, 6])
      expect(result2.currentIndex).toBe(5)
      expect(result2.isComplete).toBe(false)
      
      // Dernier lot (indices 6-7)
      const result3 = executeLoop(collection, config, 6, [])
      expect(result3.data).toEqual([7, 8])
      expect(result3.currentIndex).toBe(7)
      expect(result3.isComplete).toBe(true)
    })

    test('devrait appliquer la transformation d\'éléments', () => {
      const collection = [1, 2, 3]
      const config = { 
        ...baseConfig,
        itemTransform: 'return item * 2;'
      }
      
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.currentItem).toBe(2) // 1 * 2
      expect(result1.data).toEqual([2])
      
      const result2 = executeLoop(collection, config, 1, result1.data)
      expect(result2.currentItem).toBe(4) // 2 * 2
      expect(result2.data).toEqual([2, 4])
    })

    test('devrait appliquer la transformation de résultat', () => {
      const collection = [1, 2, 3]
      const config = { 
        ...baseConfig,
        resultTransform: 'return { sum: result.reduce((a, b) => a + b, 0), items: result };'
      }
      
      // Exécuter toutes les itérations
      let result = executeLoop(collection, config, 0, [])
      result = executeLoop(collection, config, 1, result.data)
      result = executeLoop(collection, config, 2, result.data)
      
      expect(result.data).toEqual({ sum: 6, items: [1, 2, 3] })
    })

    test('devrait respecter la condition de sortie personnalisée', () => {
      const collection = [1, 2, 3, 4, 5]
      const config = { 
        ...baseConfig,
        exitStrategy: 'custom' as 'custom',
        exitCondition: 'return item > 3;' // Sortir quand l'élément > 3
      }
      
      // Première itération
      const result1 = executeLoop(collection, config, 0, [])
      expect(result1.isComplete).toBe(false)
      
      // Deuxième itération
      const result2 = executeLoop(collection, config, 1, result1.data)
      expect(result2.isComplete).toBe(false)
      
      // Troisième itération
      const result3 = executeLoop(collection, config, 2, result2.data)
      expect(result3.isComplete).toBe(false)
      
      // Quatrième itération - devrait sortir car 4 > 3
      const result4 = executeLoop(collection, config, 3, result3.data)
      expect(result4.currentItem).toBe(4)
      expect(result4.isComplete).toBe(true)
    })

    test('devrait gérer les erreurs selon la stratégie spécifiée', () => {
      const collection = [1, 2, 'error', 4, 5]
      
      // Stratégie: ignore
      const configIgnore = { 
        ...baseConfig,
        itemTransform: 'if (item === "error") throw new Error("Test error"); return item;',
        errorHandling: 'ignore' as 'ignore'
      }
      
      const resultIgnore = executeLoop(collection, configIgnore, 2, [1, 2])
      expect(resultIgnore.data).toEqual([1, 2, undefined]) // undefined car l'erreur est ignorée
      expect(resultIgnore.stats?.errorCount).toBe(1)
      
      // Stratégie: break
      const configBreak = { 
        ...baseConfig,
        itemTransform: 'if (item === "error") throw new Error("Test error"); return item;',
        errorHandling: 'break' as 'break'
      }
      
      const resultBreak = executeLoop(collection, configBreak, 2, [1, 2])
      expect(resultBreak.isComplete).toBe(true) // L'itération s'arrête
      
      // Stratégie: continue
      const configContinue = { 
        ...baseConfig,
        itemTransform: 'if (item === "error") throw new Error("Test error"); return item;',
        errorHandling: 'continue' as 'continue'
      }
      
      const resultContinue = executeLoop(collection, configContinue, 2, [1, 2])
      // Vérifie que l'élément problématique a été sauté
      expect(resultContinue.currentIndex).not.toBe(2)
    })

    test('devrait gérer les collections vides ou invalides', () => {
      // Collection vide
      const resultEmpty = executeLoop([], baseConfig, 0, [])
      expect(resultEmpty.isComplete).toBe(true)
      expect(resultEmpty.data).toEqual([])
      
      // Collection null
      const resultNull = executeLoop(null, baseConfig, 0, [])
      expect(resultNull.isComplete).toBe(true)
      
      // Collection undefined
      const resultUndefined = executeLoop(undefined, baseConfig, 0, [])
      expect(resultUndefined.isComplete).toBe(true)
    })
  })
})

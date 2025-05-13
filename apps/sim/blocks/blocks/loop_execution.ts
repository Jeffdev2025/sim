/**
 * Logique d'exécution du bloc Loop
 * Implémente les différentes stratégies d'itération pour traiter des collections de données
 */

/**
 * Types d'itération supportés
 */
export type LoopMode = 'sequential' | 'parallel' | 'batch';

/**
 * Stratégies de sortie de boucle
 */
export type LoopExitStrategy = 'all' | 'first' | 'last' | 'custom';

/**
 * Options pour le traitement par lots
 */
export interface BatchOptions {
  size: number;
  overlap?: number;
  preserveEmptyBatches?: boolean;
}

/**
 * Options pour la gestion des erreurs
 */
export type ErrorHandlingStrategy = 'ignore' | 'break' | 'continue' | 'default';

/**
 * Configuration complète pour l'exécution du bloc Loop
 */
export interface LoopExecutionConfig {
  // Type de collection à itérer
  collectionType: 'array' | 'object' | 'range' | 'custom';
  
  // Mode d'itération
  mode: LoopMode;
  
  // Stratégie de sortie
  exitStrategy: LoopExitStrategy;
  
  // Limite d'itérations (0 = pas de limite)
  limit: number;
  
  // Options pour le traitement par lots
  batchOptions?: BatchOptions;
  
  // Condition de sortie personnalisée
  exitCondition?: string;
  
  // Transformations
  itemTransform?: string;
  resultTransform?: string;
  
  // Gestion des erreurs
  errorHandling: ErrorHandlingStrategy;
  
  // Options avancées
  accumulateResults: boolean;
  includeMetadata: boolean;
  simulationMode: boolean;
  
  // Journalisation
  enableLogging: boolean;
}

/**
 * Statistiques d'exécution de boucle
 */
export interface LoopStats {
  totalItems: number;
  processedItems: number;
  skippedItems: number;
  errorCount: number;
  iterationCount: number;
  processingTime: number;
  errors?: Array<{ message: string; item?: any; index?: number }>;
}

/**
 * Résultat de l'exécution de boucle
 */
export interface LoopResult {
  data: any;
  currentItem?: any;
  currentIndex?: number;
  isLastIteration?: boolean;
  isComplete?: boolean;
  stats?: LoopStats;
}

/**
 * Fonction principale pour exécuter une itération de boucle
 */
export function executeLoop(
  collection: any,
  config: LoopExecutionConfig,
  currentIndex: number = 0,
  accumulator: any[] = []
): LoopResult {
  const startTime = Date.now();
  const stats: LoopStats = {
    totalItems: 0,
    processedItems: 0,
    skippedItems: 0,
    errorCount: 0,
    iterationCount: currentIndex,
    processingTime: 0
  };
  
  try {
    // Déterminer le nombre total d'éléments
    stats.totalItems = getCollectionSize(collection, config.collectionType);
    
    if (config.enableLogging) {
      console.log(`Loop: Démarrage de l'itération ${currentIndex} sur ${stats.totalItems} éléments`);
    }
    
    // Vérifier si nous avons atteint la limite d'itérations
    if (config.limit > 0 && currentIndex >= config.limit) {
      if (config.enableLogging) {
        console.log(`Loop: Limite d'itérations atteinte (${config.limit})`);
      }
      
      return {
        data: config.accumulateResults ? accumulator : null,
        isComplete: true,
        stats: {
          ...stats,
          processingTime: Date.now() - startTime
        }
      };
    }
    
    // Vérifier si nous avons traité tous les éléments
    if (currentIndex >= stats.totalItems) {
      if (config.enableLogging) {
        console.log('Loop: Tous les éléments ont été traités');
      }
      
      return {
        data: config.accumulateResults ? accumulator : null,
        isComplete: true,
        stats: {
          ...stats,
          processingTime: Date.now() - startTime
        }
      };
    }
    
    // Récupérer l'élément courant
    const currentItem = getItemAtIndex(collection, currentIndex, config.collectionType);
    
    // Déterminer si c'est la dernière itération
    const isLastIteration = (currentIndex === stats.totalItems - 1) || 
                           (config.limit > 0 && currentIndex === config.limit - 1);
    
    // Appliquer la transformation d'élément si définie
    let processedItem = currentItem;
    if (config.itemTransform) {
      try {
        const transformFn = new Function('item', 'index', 'collection', config.itemTransform);
        processedItem = transformFn(currentItem, currentIndex, collection);
        
        if (config.enableLogging) {
          console.log(`Loop: Transformation appliquée à l'élément ${currentIndex}`, processedItem);
        }
      } catch (error) {
        if (config.enableLogging) {
          console.error(`Loop: Erreur lors de la transformation de l'élément ${currentIndex}`, error);
        }
        
        stats.errorCount++;
        if (stats.errors) {
          stats.errors.push({
            message: `Erreur de transformation: ${error instanceof Error ? error.message : String(error)}`,
            item: currentItem,
            index: currentIndex
          });
        }
        
        // Gérer l'erreur selon la stratégie définie
        if (config.errorHandling === 'break') {
          return {
            data: config.accumulateResults ? accumulator : null,
            currentItem,
            currentIndex,
            isLastIteration,
            isComplete: true,
            stats: {
              ...stats,
              processingTime: Date.now() - startTime
            }
          };
        } else if (config.errorHandling === 'continue') {
          // Passer à l'élément suivant
          return executeLoop(collection, config, currentIndex + 1, accumulator);
        } else if (config.errorHandling === 'default') {
          // Utiliser l'élément non transformé
          processedItem = currentItem;
        }
        // Pour 'ignore', on continue avec l'élément transformé (même s'il est undefined)
      }
    }
    
    // Ajouter l'élément au résultat accumulé si nécessaire
    if (config.accumulateResults) {
      accumulator.push(processedItem);
    }
    
    stats.processedItems++;
    
    // Vérifier la condition de sortie personnalisée si définie
    if (config.exitCondition) {
      try {
        const exitFn = new Function('item', 'index', 'collection', 'accumulator', config.exitCondition);
        const shouldExit = exitFn(processedItem, currentIndex, collection, accumulator);
        
        if (shouldExit) {
          if (config.enableLogging) {
            console.log(`Loop: Condition de sortie satisfaite à l'itération ${currentIndex}`);
          }
          
          return {
            data: config.accumulateResults ? accumulator : processedItem,
            currentItem: processedItem,
            currentIndex,
            isLastIteration: true,
            isComplete: true,
            stats: {
              ...stats,
              processingTime: Date.now() - startTime
            }
          };
        }
      } catch (error) {
        if (config.enableLogging) {
          console.error('Loop: Erreur lors de l\'évaluation de la condition de sortie', error);
        }
        
        stats.errorCount++;
        if (stats.errors) {
          stats.errors.push({
            message: `Erreur de condition de sortie: ${error instanceof Error ? error.message : String(error)}`,
            index: currentIndex
          });
        }
        
        // Pour la condition de sortie, on continue en cas d'erreur
      }
    }
    
    // Déterminer le résultat en fonction de la stratégie de sortie
    let result: LoopResult;
    
    if (config.mode === 'sequential') {
      // En mode séquentiel, on retourne l'élément courant et on continue
      result = {
        data: config.accumulateResults ? accumulator : processedItem,
        currentItem: processedItem,
        currentIndex,
        isLastIteration,
        isComplete: isLastIteration,
        stats: {
          ...stats,
          processingTime: Date.now() - startTime
        }
      };
    } else if (config.mode === 'parallel') {
      // En mode parallèle, on traite tous les éléments en une seule fois
      // Cette logique serait implémentée côté serveur
      result = {
        data: config.accumulateResults ? processAllItems(collection, config) : processedItem,
        currentItem: processedItem,
        currentIndex,
        isLastIteration: true,
        isComplete: true,
        stats: {
          ...stats,
          processedItems: stats.totalItems,
          processingTime: Date.now() - startTime
        }
      };
    } else if (config.mode === 'batch') {
      // En mode batch, on traite un lot d'éléments
      const batchSize = config.batchOptions?.size || 10;
      const batchStart = currentIndex;
      const batchEnd = Math.min(batchStart + batchSize, stats.totalItems);
      
      const batch = [];
      for (let i = batchStart; i < batchEnd; i++) {
        const item = getItemAtIndex(collection, i, config.collectionType);
        batch.push(item);
      }
      
      result = {
        data: batch,
        currentItem: processedItem,
        currentIndex: batchEnd - 1,
        isLastIteration: batchEnd >= stats.totalItems || (config.limit > 0 && batchEnd >= config.limit),
        isComplete: batchEnd >= stats.totalItems || (config.limit > 0 && batchEnd >= config.limit),
        stats: {
          ...stats,
          processedItems: batchEnd - batchStart,
          processingTime: Date.now() - startTime
        }
      };
    } else {
      // Par défaut, mode séquentiel
      result = {
        data: config.accumulateResults ? accumulator : processedItem,
        currentItem: processedItem,
        currentIndex,
        isLastIteration,
        isComplete: isLastIteration,
        stats: {
          ...stats,
          processingTime: Date.now() - startTime
        }
      };
    }
    
    // Appliquer la transformation de résultat si définie et si c'est la dernière itération
    if (config.resultTransform && (isLastIteration || config.mode === 'parallel' || config.mode === 'batch')) {
      try {
        const transformFn = new Function('result', 'collection', 'stats', config.resultTransform);
        result.data = transformFn(result.data, collection, stats);
        
        if (config.enableLogging) {
          console.log('Loop: Transformation du résultat appliquée', result.data);
        }
      } catch (error) {
        if (config.enableLogging) {
          console.error('Loop: Erreur lors de la transformation du résultat', error);
        }
        
        stats.errorCount++;
        if (stats.errors) {
          stats.errors.push({
            message: `Erreur de transformation du résultat: ${error instanceof Error ? error.message : String(error)}`
          });
        }
        
        // Gérer l'erreur selon la stratégie définie
        if (config.errorHandling === 'default') {
          // Utiliser le résultat non transformé
          // (déjà en place)
        }
        // Pour les autres stratégies, on continue avec le résultat transformé (même s'il est undefined)
      }
    }
    
    return result;
    
  } catch (error) {
    if (config.enableLogging) {
      console.error('Loop: Erreur globale lors de l\'exécution', error);
    }
    
    return {
      data: config.accumulateResults ? accumulator : null,
      isComplete: true,
      stats: {
        ...stats,
        errorCount: stats.errorCount + 1,
        errors: [...(stats.errors || []), { message: `Erreur globale: ${error instanceof Error ? error.message : String(error)}` }],
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Détermine la taille d'une collection
 */
function getCollectionSize(collection: any, collectionType: string): number {
  if (collection === null || collection === undefined) {
    return 0;
  }
  
  switch (collectionType) {
    case 'array':
      return Array.isArray(collection) ? collection.length : 0;
    case 'object':
      return typeof collection === 'object' ? Object.keys(collection).length : 0;
    case 'range':
      if (typeof collection === 'object' && 'start' in collection && 'end' in collection) {
        return Math.max(0, collection.end - collection.start + 1);
      }
      return 0;
    case 'custom':
      // Pour le type personnalisé, on essaie de déterminer la taille
      if (Array.isArray(collection)) {
        return collection.length;
      } else if (typeof collection === 'object' && collection !== null) {
        return Object.keys(collection).length;
      } else if (typeof collection === 'number') {
        return collection > 0 ? collection : 0;
      }
      return 0;
    default:
      return 0;
  }
}

/**
 * Récupère un élément à un index donné dans une collection
 */
function getItemAtIndex(collection: any, index: number, collectionType: string): any {
  if (collection === null || collection === undefined) {
    return undefined;
  }
  
  switch (collectionType) {
    case 'array':
      return Array.isArray(collection) ? collection[index] : undefined;
    case 'object':
      if (typeof collection === 'object') {
        const keys = Object.keys(collection);
        if (index < keys.length) {
          const key = keys[index];
          return { key, value: collection[key] };
        }
      }
      return undefined;
    case 'range':
      if (typeof collection === 'object' && 'start' in collection && 'end' in collection) {
        const start = collection.start || 0;
        return start + index;
      }
      return undefined;
    case 'custom':
      // Pour le type personnalisé, on essaie de récupérer l'élément
      if (Array.isArray(collection)) {
        return collection[index];
      } else if (typeof collection === 'object' && collection !== null) {
        const keys = Object.keys(collection);
        if (index < keys.length) {
          const key = keys[index];
          return { key, value: collection[key] };
        }
      } else if (typeof collection === 'number') {
        return index;
      }
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Traite tous les éléments d'une collection en une seule fois (mode parallèle)
 */
function processAllItems(collection: any, config: LoopExecutionConfig): any[] {
  const result = [];
  const size = getCollectionSize(collection, config.collectionType);
  
  for (let i = 0; i < size; i++) {
    if (config.limit > 0 && i >= config.limit) {
      break;
    }
    
    const item = getItemAtIndex(collection, i, config.collectionType);
    
    // Appliquer la transformation d'élément si définie
    let processedItem = item;
    if (config.itemTransform) {
      try {
        const transformFn = new Function('item', 'index', 'collection', config.itemTransform);
        processedItem = transformFn(item, i, collection);
      } catch (error: unknown) {
        throw new Error(`Erreur dans le code personnalisé: ${error instanceof Error ? error.message : String(error)}`);
        // Pour 'ignore', on continue avec l'élément transformé (même s'il est undefined)
      }
    }
    
    result.push(processedItem);
  }
  
  return result;
}

/**
 * Logique d'exécution du bloc Merge
 * Implémente les différentes stratégies de fusion pour combiner plusieurs flux de données
 */

/**
 * Options pour la fusion d'objets
 */
export type ObjectMergeStrategy = 'replace' | 'keep' | 'deep' | 'custom';

/**
 * Options pour la fusion de tableaux
 */
export interface ArrayMergeOptions {
  sort?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  removeDuplicates?: boolean;
  identifierField?: string;
  flatten?: boolean;
  flattenDepth?: number;
}

/**
 * Options pour le préfixage des clés
 */
export interface KeyPrefixOptions {
  enabled: boolean;
  prefixes: Record<string, string>;
  separator: string;
}

/**
 * Options pour la gestion des erreurs
 */
export type ErrorHandlingStrategy = 'ignore' | 'default' | 'stop';

/**
 * Configuration complète pour l'exécution du bloc Merge
 */
export interface MergeExecutionConfig {
  // Mode de fusion principal
  mode: 'concat' | 'merge' | 'auto' | 'union' | 'intersection' | 'custom';
  
  // Stratégie de fusion d'objets (pour le mode 'merge')
  objectStrategy: ObjectMergeStrategy;
  
  // Options pour la fusion de tableaux
  arrayOptions: ArrayMergeOptions;
  
  // Options pour le préfixage des clés
  keyPrefix: KeyPrefixOptions;
  
  // Transformations
  preTransform?: string;
  postTransform?: string;
  
  // Gestion des erreurs
  errorHandling: ErrorHandlingStrategy;
  
  // Options avancées
  batchProcessing: boolean;
  collectStats: boolean;
  simulationMode: boolean;
  
  // Code personnalisé pour le mode 'custom'
  customCode?: string;
  
  // Journalisation
  enableLogging: boolean;
}

/**
 * Statistiques de fusion
 */
export interface MergeStats {
  inputCount: Record<string, number>;
  outputCount: number;
  conflicts: number;
  duplicatesRemoved?: number;
  processingTime: number;
  errors?: Array<{ message: string; source?: string }>;
}

/**
 * Résultat de la fusion
 */
export interface MergeResult {
  data: any;
  stats?: MergeStats;
}

/**
 * Fonction principale pour exécuter la fusion
 */
export function executeMerge(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): MergeResult {
  const startTime = Date.now();
  const stats: MergeStats = {
    inputCount: {},
    outputCount: 0,
    conflicts: 0,
    processingTime: 0,
    errors: []
  };
  
  try {
    // Collecter les statistiques d'entrée si nécessaire
    if (config.collectStats) {
      Object.keys(inputs).forEach(key => {
        if (inputs[key] === undefined || inputs[key] === null) {
          stats.inputCount[key] = 0;
        } else if (Array.isArray(inputs[key])) {
          stats.inputCount[key] = inputs[key].length;
        } else {
          stats.inputCount[key] = 1;
        }
      });
    }
    
    // Appliquer la transformation préliminaire si définie
    let processedInputs = { ...inputs };
    if (config.preTransform) {
      try {
        const preTransformFn = new Function('inputs', config.preTransform);
        processedInputs = preTransformFn(inputs);
        
        if (config.enableLogging) {
          console.log('Merge: Transformation préliminaire appliquée', processedInputs);
        }
      } catch (error) {
        if (config.enableLogging) {
          console.error('Merge: Erreur lors de la transformation préliminaire', error);
        }
        
        if (config.errorHandling === 'stop') {
          throw new Error(`Erreur de pré-transformation: ${error.message}`);
        }
        
        stats.errors.push({
          message: `Erreur de pré-transformation: ${error.message}`,
          source: 'preTransform'
        });
      }
    }
    
    // Exécuter la fusion en mode simulation si activé
    if (config.simulationMode) {
      if (config.enableLogging) {
        console.log('Merge: Mode simulation activé, aucune fusion réelle effectuée');
      }
      
      return {
        data: { simulation: true, inputs: processedInputs, config },
        stats
      };
    }
    
    // Exécuter la fusion selon le mode sélectionné
    let result;
    
    switch (config.mode) {
      case 'concat':
        result = concatArrays(processedInputs, config);
        break;
      
      case 'merge':
        result = mergeObjects(processedInputs, config);
        break;
      
      case 'auto':
        result = autoMerge(processedInputs, config);
        break;
      
      case 'union':
        result = unionArrays(processedInputs, config);
        break;
      
      case 'intersection':
        result = intersectionArrays(processedInputs, config);
        break;
      
      case 'custom':
        result = customMerge(processedInputs, config);
        break;
      
      default:
        throw new Error(`Mode de fusion non reconnu: ${config.mode}`);
    }
    
    // Appliquer la transformation post-fusion si définie
    if (config.postTransform) {
      try {
        const postTransformFn = new Function('result', config.postTransform);
        result = postTransformFn(result);
        
        if (config.enableLogging) {
          console.log('Merge: Transformation post-fusion appliquée', result);
        }
      } catch (error) {
        if (config.enableLogging) {
          console.error('Merge: Erreur lors de la transformation post-fusion', error);
        }
        
        if (config.errorHandling === 'stop') {
          throw new Error(`Erreur de post-transformation: ${error.message}`);
        }
        
        stats.errors.push({
          message: `Erreur de post-transformation: ${error.message}`,
          source: 'postTransform'
        });
      }
    }
    
    // Collecter les statistiques de sortie si nécessaire
    if (config.collectStats) {
      if (Array.isArray(result)) {
        stats.outputCount = result.length;
      } else if (typeof result === 'object' && result !== null) {
        stats.outputCount = Object.keys(result).length;
      } else {
        stats.outputCount = 1;
      }
    }
    
    // Calculer le temps de traitement
    stats.processingTime = Date.now() - startTime;
    
    return {
      data: result,
      stats: config.collectStats ? stats : undefined
    };
  } catch (error) {
    if (config.enableLogging) {
      console.error('Merge: Erreur lors de la fusion', error);
    }
    
    stats.processingTime = Date.now() - startTime;
    
    if (config.errorHandling === 'stop') {
      throw error;
    }
    
    stats.errors.push({
      message: error.message,
      source: 'execution'
    });
    
    // Retourner une valeur par défaut en cas d'erreur
    return {
      data: config.errorHandling === 'default' ? {} : null,
      stats: config.collectStats ? stats : undefined
    };
  }
}

/**
 * Concatène plusieurs tableaux en un seul
 */
function concatArrays(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): any[] {
  if (config.enableLogging) {
    console.log('Merge: Exécution de la concaténation de tableaux');
  }
  
  // Convertir toutes les entrées en tableaux
  const arrays = Object.keys(inputs).map(key => {
    const input = inputs[key];
    if (input === undefined || input === null) {
      return [];
    }
    return Array.isArray(input) ? input : [input];
  });
  
  // Concaténer tous les tableaux
  let result = arrays.reduce((acc, arr) => acc.concat(arr), []);
  
  // Appliquer les options de fusion de tableaux
  if (config.arrayOptions) {
    // Supprimer les doublons si nécessaire
    if (config.arrayOptions.removeDuplicates) {
      if (config.arrayOptions.identifierField) {
        // Dédoublonnage basé sur un champ d'identification
        const field = config.arrayOptions.identifierField;
        const seen = new Set();
        result = result.filter(item => {
          if (typeof item !== 'object' || item === null || !(field in item)) {
            return true; // Conserver les éléments sans le champ d'identification
          }
          
          const value = item[field];
          if (seen.has(value)) {
            if (config.collectStats) {
              stats.duplicatesRemoved = (stats.duplicatesRemoved || 0) + 1;
            }
            return false;
          }
          
          seen.add(value);
          return true;
        });
      } else {
        // Dédoublonnage simple basé sur la représentation JSON
        const seen = new Set();
        const originalLength = result.length;
        result = result.filter(item => {
          const key = JSON.stringify(item);
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        
        if (config.collectStats) {
          stats.duplicatesRemoved = originalLength - result.length;
        }
      }
    }
    
    // Trier le tableau si nécessaire
    if (config.arrayOptions.sort) {
      if (config.arrayOptions.sortField) {
        // Tri basé sur un champ spécifique
        const field = config.arrayOptions.sortField;
        const direction = config.arrayOptions.sortDirection || 'asc';
        
        result.sort((a, b) => {
          if (typeof a !== 'object' || a === null || !(field in a) ||
              typeof b !== 'object' || b === null || !(field in b)) {
            return 0;
          }
          
          const valueA = a[field];
          const valueB = b[field];
          
          if (valueA < valueB) {
            return direction === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      } else {
        // Tri simple
        result.sort((a, b) => {
          const direction = config.arrayOptions.sortDirection || 'asc';
          if (a < b) {
            return direction === 'asc' ? -1 : 1;
          }
          if (a > b) {
            return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
    }
    
    // Aplatir le tableau si nécessaire
    if (config.arrayOptions.flatten) {
      const depth = config.arrayOptions.flattenDepth || Infinity;
      result = flattenArray(result, depth);
    }
  }
  
  return result;
}

/**
 * Aplatit un tableau à la profondeur spécifiée
 */
function flattenArray(arr: any[], depth: number): any[] {
  if (depth < 1) {
    return arr.slice();
  }
  
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(depth > 1 ? flattenArray(val, depth - 1) : val);
    }
    return acc.concat(val);
  }, []);
}

/**
 * Fusionne plusieurs objets en un seul
 */
function mergeObjects(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): Record<string, any> {
  if (config.enableLogging) {
    console.log('Merge: Exécution de la fusion d\'objets');
  }
  
  // Convertir toutes les entrées en objets
  const objects = Object.keys(inputs).map(key => {
    const input = inputs[key];
    if (input === undefined || input === null) {
      return {};
    }
    return Array.isArray(input) || typeof input !== 'object' ? { value: input } : input;
  });
  
  // Appliquer la stratégie de fusion d'objets
  let result = {};
  
  switch (config.objectStrategy) {
    case 'replace':
      // Les propriétés des objets suivants remplacent celles des objets précédents
      result = objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
      break;
    
    case 'keep':
      // Les propriétés des premiers objets sont conservées
      result = objects.reduce((acc, obj) => {
        const newObj = { ...obj };
        for (const key in acc) {
          if (key in newObj) {
            if (config.collectStats) {
              stats.conflicts++;
            }
            delete newObj[key]; // Supprimer les clés déjà présentes
          }
        }
        return { ...acc, ...newObj };
      }, {});
      break;
    
    case 'deep':
      // Fusion récursive des objets imbriqués
      result = objects.reduce((acc, obj) => deepMerge(acc, obj, config), {});
      break;
    
    case 'custom':
      // Utiliser le code personnalisé pour la fusion d'objets
      if (!config.customCode) {
        throw new Error('Code personnalisé requis pour la stratégie de fusion personnalisée');
      }
      
      try {
        const customMergeFn = new Function('objects', config.customCode);
        result = customMergeFn(objects);
      } catch (error) {
        throw new Error(`Erreur dans le code personnalisé: ${error.message}`);
      }
      break;
    
    default:
      throw new Error(`Stratégie de fusion d'objets non reconnue: ${config.objectStrategy}`);
  }
  
  // Appliquer le préfixage des clés si nécessaire
  if (config.keyPrefix && config.keyPrefix.enabled) {
    result = applyKeyPrefixes(result, config.keyPrefix);
  }
  
  return result;
}

/**
 * Fusion profonde (récursive) de deux objets
 */
function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
  config: MergeExecutionConfig
): Record<string, any> {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (
        key in result &&
        typeof result[key] === 'object' && result[key] !== null &&
        typeof source[key] === 'object' && source[key] !== null &&
        !Array.isArray(result[key]) && !Array.isArray(source[key])
      ) {
        // Fusion récursive des objets imbriqués
        result[key] = deepMerge(result[key], source[key], config);
      } else if (key in result) {
        // Conflit détecté
        if (config.collectStats) {
          stats.conflicts++;
        }
        
        // Appliquer la stratégie de remplacement pour les conflits
        result[key] = source[key];
      } else {
        // Nouvelle propriété
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Applique des préfixes aux clés d'un objet
 */
function applyKeyPrefixes(
  obj: Record<string, any>,
  prefixConfig: KeyPrefixOptions
): Record<string, any> {
  const result = {};
  const { prefixes, separator } = prefixConfig;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let newKey = key;
      
      // Appliquer le préfixe spécifique si défini, sinon conserver la clé originale
      for (const sourceKey in prefixes) {
        if (key.startsWith(sourceKey)) {
          newKey = `${prefixes[sourceKey]}${separator}${key}`;
          break;
        }
      }
      
      result[newKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Détecte automatiquement le type de données et applique la stratégie appropriée
 */
function autoMerge(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): any {
  if (config.enableLogging) {
    console.log('Merge: Exécution de la fusion automatique');
  }
  
  // Détecter si toutes les entrées sont des tableaux
  const allArrays = Object.values(inputs).every(input => 
    Array.isArray(input) || input === null || input === undefined
  );
  
  // Détecter si toutes les entrées sont des objets
  const allObjects = Object.values(inputs).every(input => 
    (typeof input === 'object' && input !== null && !Array.isArray(input)) || 
    input === null || input === undefined
  );
  
  if (allArrays) {
    return concatArrays(inputs, config);
  } else if (allObjects) {
    return mergeObjects(inputs, config);
  } else {
    // Mélange de types, convertir en tableau par défaut
    if (config.enableLogging) {
      console.log('Merge: Types mixtes détectés, utilisation de la concaténation');
    }
    return concatArrays(inputs, config);
  }
}

/**
 * Crée l'union de plusieurs tableaux (éléments uniques de tous les tableaux)
 */
function unionArrays(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): any[] {
  if (config.enableLogging) {
    console.log('Merge: Exécution de l\'union de tableaux');
  }
  
  // Convertir toutes les entrées en tableaux
  const arrays = Object.keys(inputs).map(key => {
    const input = inputs[key];
    if (input === undefined || input === null) {
      return [];
    }
    return Array.isArray(input) ? input : [input];
  });
  
  // Créer l'union des tableaux
  let result = [];
  const seen = new Set();
  
  arrays.forEach(arr => {
    arr.forEach(item => {
      const key = JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      } else if (config.collectStats) {
        stats.duplicatesRemoved = (stats.duplicatesRemoved || 0) + 1;
      }
    });
  });
  
  // Appliquer les options de tri si nécessaire
  if (config.arrayOptions && config.arrayOptions.sort) {
    if (config.arrayOptions.sortField) {
      // Tri basé sur un champ spécifique
      const field = config.arrayOptions.sortField;
      const direction = config.arrayOptions.sortDirection || 'asc';
      
      result.sort((a, b) => {
        if (typeof a !== 'object' || a === null || !(field in a) ||
            typeof b !== 'object' || b === null || !(field in b)) {
          return 0;
        }
        
        const valueA = a[field];
        const valueB = b[field];
        
        if (valueA < valueB) {
          return direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Tri simple
      result.sort((a, b) => {
        const direction = config.arrayOptions.sortDirection || 'asc';
        if (a < b) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a > b) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  }
  
  return result;
}

/**
 * Crée l'intersection de plusieurs tableaux (éléments présents dans tous les tableaux)
 */
function intersectionArrays(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): any[] {
  if (config.enableLogging) {
    console.log('Merge: Exécution de l\'intersection de tableaux');
  }
  
  // Convertir toutes les entrées en tableaux
  const arrays = Object.keys(inputs).map(key => {
    const input = inputs[key];
    if (input === undefined || input === null) {
      return [];
    }
    return Array.isArray(input) ? input : [input];
  }).filter(arr => arr.length > 0);
  
  // Si aucun tableau n'est fourni, retourner un tableau vide
  if (arrays.length === 0) {
    return [];
  }
  
  // Si un seul tableau est fourni, retourner ce tableau
  if (arrays.length === 1) {
    return arrays[0];
  }
  
  // Créer l'intersection des tableaux
  const itemCounts = new Map();
  const stringifiedItems = new Map();
  
  arrays.forEach(arr => {
    // Dédupliquer chaque tableau d'entrée
    const uniqueItems = new Set();
    
    arr.forEach(item => {
      const key = JSON.stringify(item);
      uniqueItems.add(key);
      stringifiedItems.set(key, item);
    });
    
    // Incrémenter le compteur pour chaque élément unique
    uniqueItems.forEach(key => {
      itemCounts.set(key, (itemCounts.get(key) || 0) + 1);
    });
  });
  
  // Sélectionner les éléments présents dans tous les tableaux
  const result = [];
  itemCounts.forEach((count, key) => {
    if (count === arrays.length) {
      result.push(stringifiedItems.get(key));
    }
  });
  
  // Appliquer les options de tri si nécessaire
  if (config.arrayOptions && config.arrayOptions.sort) {
    if (config.arrayOptions.sortField) {
      // Tri basé sur un champ spécifique
      const field = config.arrayOptions.sortField;
      const direction = config.arrayOptions.sortDirection || 'asc';
      
      result.sort((a, b) => {
        if (typeof a !== 'object' || a === null || !(field in a) ||
            typeof b !== 'object' || b === null || !(field in b)) {
          return 0;
        }
        
        const valueA = a[field];
        const valueB = b[field];
        
        if (valueA < valueB) {
          return direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Tri simple
      result.sort((a, b) => {
        const direction = config.arrayOptions.sortDirection || 'asc';
        if (a < b) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a > b) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
  }
  
  return result;
}

/**
 * Utilise un code personnalisé pour la fusion
 */
function customMerge(
  inputs: Record<string, any>,
  config: MergeExecutionConfig
): any {
  if (config.enableLogging) {
    console.log('Merge: Exécution de la fusion personnalisée');
  }
  
  if (!config.customCode) {
    throw new Error('Code personnalisé requis pour le mode de fusion personnalisé');
  }
  
  try {
    const customMergeFn = new Function('inputs', 'config', config.customCode);
    return customMergeFn(inputs, config);
  } catch (error) {
    throw new Error(`Erreur dans le code personnalisé: ${error.message}`);
  }
}

// Variable globale pour les statistiques (utilisée par plusieurs fonctions)
let stats: MergeStats = {
  inputCount: {},
  outputCount: 0,
  conflicts: 0,
  processingTime: 0
};

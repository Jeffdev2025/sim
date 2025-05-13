import { BlockConfig } from '../types'
import { LoopIcon } from '@/components/loop-icon'
import { 
  LoopExecutionConfig, 
  LoopMode, 
  LoopExitStrategy, 
  ErrorHandlingStrategy 
} from './loop_execution'

export const LoopBlock: BlockConfig = {
  type: 'loop',
  name: 'Loop',
  description: 'Itère sur une collection de données',
  longDescription: 'Permet d\'exécuter des opérations répétitives sur une collection de données (tableau, objet, plage). Supporte différents modes d\'itération (séquentiel, parallèle, par lots) et offre des options avancées comme l\'accumulation de résultats, la transformation d\'éléments et la gestion des erreurs.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/loop',
  bgColor: '#8B5CF6', // Violet
  icon: LoopIcon,
  
  subBlocks: [
    {
      id: 'collectionType',
      title: 'Type de collection',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Tableau', id: 'array' },
        { label: 'Objet', id: 'object' },
        { label: 'Plage de valeurs', id: 'range' },
        { label: 'Personnalisé', id: 'custom' }
      ],
      value: () => 'array',
    },
    {
      id: 'mode',
      title: 'Mode d\'itération',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Séquentiel', id: 'sequential' },
        { label: 'Parallèle', id: 'parallel' },
        { label: 'Par lots', id: 'batch' }
      ],
      value: () => 'sequential',
    },
    {
      id: 'batchSize',
      title: 'Taille des lots',
      type: 'short-input',
      layout: 'half',
      placeholder: '10',
      condition: {
        field: 'mode',
        value: 'batch'
      }
    },
    {
      id: 'batchOverlap',
      title: 'Chevauchement des lots',
      type: 'short-input',
      layout: 'half',
      placeholder: '0',
      condition: {
        field: 'mode',
        value: 'batch'
      }
    },
    {
      id: 'rangeStart',
      title: 'Début de la plage',
      type: 'short-input',
      layout: 'half',
      placeholder: '0',
      condition: {
        field: 'collectionType',
        value: 'range'
      }
    },
    {
      id: 'rangeEnd',
      title: 'Fin de la plage',
      type: 'short-input',
      layout: 'half',
      placeholder: '10',
      condition: {
        field: 'collectionType',
        value: 'range'
      }
    },
    {
      id: 'exitStrategy',
      title: 'Stratégie de sortie',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Traiter tous les éléments', id: 'all' },
        { label: 'Retourner le premier résultat', id: 'first' },
        { label: 'Retourner le dernier résultat', id: 'last' },
        { label: 'Condition personnalisée', id: 'custom' }
      ],
      value: () => 'all',
    },
    {
      id: 'limit',
      title: 'Limite d\'itérations',
      type: 'short-input',
      layout: 'half',
      placeholder: '0 (pas de limite)',
    },
    {
      id: 'exitCondition',
      title: 'Condition de sortie',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de condition de sortie
// Retourne true pour arrêter la boucle, false pour continuer
// Reçoit: l'élément courant, l'index, la collection complète et les résultats accumulés

function shouldExit(item, index, collection, accumulator) {
  // Exemple: sortir si l'élément contient une certaine valeur
  if (item && item.status === 'error') {
    return true;
  }
  
  // Exemple: sortir après avoir trouvé 5 éléments valides
  if (accumulator && accumulator.filter(i => i !== null).length >= 5) {
    return true;
  }
  
  // Continuer l'itération
  return false;
}

return shouldExit(item, index, collection, accumulator);`,
      condition: {
        field: 'exitStrategy',
        value: 'custom'
      }
    },
    {
      id: 'advanced',
      title: 'Options avancées',
      type: 'checkbox-list',
      layout: 'full',
      options: [
        { label: 'Accumuler les résultats', id: 'accumulateResults' },
        { label: 'Inclure les métadonnées', id: 'includeMetadata' },
        { label: 'Transformation d\'éléments', id: 'itemTransform' },
        { label: 'Transformation du résultat final', id: 'resultTransform' },
        { label: 'Mode simulation', id: 'simulationMode' },
        { label: 'Activer la journalisation', id: 'enableLogging' }
      ]
    },
    {
      id: 'itemTransform',
      title: 'Transformation d\'éléments',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de transformation d'élément
// Reçoit: l'élément courant, l'index et la collection complète
// Retourne: l'élément transformé

function transformItem(item, index, collection) {
  // Exemple: enrichir l'élément avec son index
  if (typeof item === 'object' && item !== null) {
    return {
      ...item,
      index: index,
      isEven: index % 2 === 0
    };
  }
  
  // Pour les valeurs primitives
  return item;
}

return transformItem(item, index, collection);`,
      condition: {
        field: 'advanced',
        value: 'itemTransform'
      }
    },
    {
      id: 'resultTransform',
      title: 'Transformation du résultat',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de transformation du résultat final
// Reçoit: le résultat accumulé, la collection originale et les statistiques
// Retourne: le résultat final transformé

function transformResult(result, collection, stats) {
  // Exemple: calculer des agrégats sur le résultat
  if (Array.isArray(result)) {
    const sum = result.reduce((acc, val) => acc + (val.value || 0), 0);
    const avg = sum / result.length;
    
    return {
      items: result,
      count: result.length,
      sum: sum,
      average: avg,
      stats: stats
    };
  }
  
  return result;
}

return transformResult(result, collection, stats);`,
      condition: {
        field: 'advanced',
        value: 'resultTransform'
      }
    },
    {
      id: 'errorHandling',
      title: 'Gestion des erreurs',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Ignorer et continuer', id: 'ignore' },
        { label: 'Arrêter l\'itération', id: 'break' },
        { label: 'Passer à l\'élément suivant', id: 'continue' },
        { label: 'Utiliser valeur par défaut', id: 'default' }
      ],
      value: () => 'ignore',
    },
    {
      id: 'preview',
      title: 'Prévisualisation',
      type: 'code',
      layout: 'full',
      language: 'json',
      placeholder: '// La prévisualisation apparaîtra ici après configuration',
      condition: {
        field: 'advanced',
        value: 'simulationMode'
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (inputs: Record<string, any>) => {
        // Récupérer les paramètres de configuration
        const collectionType = inputs.collectionType || 'array';
        const mode = inputs.mode || 'sequential';
        const exitStrategy = inputs.exitStrategy || 'all';
        const limit = parseInt(inputs.limit || '0', 10);
        const errorHandling = inputs.errorHandling || 'ignore';
        
        // Options avancées
        const advanced = inputs.advanced || [];
        const accumulateResults = advanced.includes('accumulateResults');
        const includeMetadata = advanced.includes('includeMetadata');
        const simulationMode = advanced.includes('simulationMode');
        const enableLogging = advanced.includes('enableLogging');
        
        // Options de traitement par lots
        const batchOptions = mode === 'batch' ? {
          size: parseInt(inputs.batchSize || '10', 10),
          overlap: parseInt(inputs.batchOverlap || '0', 10),
          preserveEmptyBatches: false
        } : undefined;
        
        // Configuration de la plage pour le type 'range'
        const rangeConfig = collectionType === 'range' ? {
          start: parseInt(inputs.rangeStart || '0', 10),
          end: parseInt(inputs.rangeEnd || '10', 10)
        } : undefined;
        
        // Créer la configuration d'exécution
        const config: LoopExecutionConfig = {
          collectionType,
          mode: mode as LoopMode,
          exitStrategy: exitStrategy as LoopExitStrategy,
          limit,
          batchOptions,
          errorHandling: errorHandling as ErrorHandlingStrategy,
          accumulateResults,
          includeMetadata,
          simulationMode,
          enableLogging
        };
        
        // Ajouter les transformations si définies
        if (advanced.includes('itemTransform') && inputs.itemTransform) {
          config.itemTransform = inputs.itemTransform;
        }
        
        if (advanced.includes('resultTransform') && inputs.resultTransform) {
          config.resultTransform = inputs.resultTransform;
        }
        
        // Ajouter la condition de sortie si définie
        if (exitStrategy === 'custom' && inputs.exitCondition) {
          config.exitCondition = inputs.exitCondition;
        }
        
        // Générer le code d'exécution
        const code = `
          const { executeLoop } = require('./blocks/blocks/loop_execution');
          
          // Récupérer la collection à itérer
          let collection = input.collection;
          
          // Gérer le cas où la collection est undefined ou null
          if (collection === undefined || collection === null) {
            ${enableLogging ? 'console.log("Loop: Collection vide ou non définie");' : ''}
            return { error: "Collection vide ou non définie" };
          }
          
          ${collectionType === 'range' ? `
            // Créer une plage de valeurs
            collection = {
              start: ${rangeConfig?.start || 0},
              end: ${rangeConfig?.end || 10}
            };
          ` : ''}
          
          ${enableLogging ? 'console.log("Loop: Collection à itérer", collection);' : ''}
          ${enableLogging ? 'console.log("Loop: Configuration", ' + JSON.stringify(config, null, 2) + ');' : ''}
          
          // Récupérer l'index courant et l'accumulateur
          const currentIndex = input.currentIndex !== undefined ? input.currentIndex : 0;
          const accumulator = input.accumulator || [];
          
          ${enableLogging ? 'console.log(`Loop: Exécution de l\\\'itération ${currentIndex}`);' : ''}
          
          // Exécuter l'itération
          const result = executeLoop(collection, ${JSON.stringify(config)}, currentIndex, accumulator);
          
          ${enableLogging ? 'console.log("Loop: Résultat de l\\\'itération", result);' : ''}
          
          // Préparer la sortie
          const output = {
            data: result.data,
            isComplete: result.isComplete
          };
          
          // Ajouter les métadonnées si demandé
          ${includeMetadata ? `
            output.metadata = {
              currentIndex: result.currentIndex,
              currentItem: result.currentItem,
              isLastIteration: result.isLastIteration,
              stats: result.stats
            };
          ` : ''}
          
          // Si l'itération n'est pas terminée et qu'on est en mode séquentiel, 
          // préparer les données pour la prochaine itération
          if (!result.isComplete && ${mode === 'sequential'}) {
            output.nextIteration = {
              currentIndex: (result.currentIndex || 0) + 1,
              accumulator: result.data
            };
          }
          
          return output;
        `;
        
        return {
          code,
          input: {
            collection: inputs.collection,
            currentIndex: inputs.currentIndex,
            accumulator: inputs.accumulator
          },
          timeout: 30000
        };
      }
    }
  },
  
  inputs: {
    collection: { type: 'json', required: true, description: 'Collection à itérer (tableau, objet, etc.)' },
    collectionType: { type: 'string', required: false, description: 'Type de collection (array, object, range, custom)' },
    mode: { type: 'string', required: false, description: 'Mode d\'itération (sequential, parallel, batch)' },
    batchSize: { type: 'string', required: false, description: 'Taille des lots pour le mode batch' },
    batchOverlap: { type: 'string', required: false, description: 'Chevauchement des lots pour le mode batch' },
    rangeStart: { type: 'string', required: false, description: 'Début de la plage pour le type range' },
    rangeEnd: { type: 'string', required: false, description: 'Fin de la plage pour le type range' },
    exitStrategy: { type: 'string', required: false, description: 'Stratégie de sortie de boucle' },
    limit: { type: 'string', required: false, description: 'Limite d\'itérations (0 = pas de limite)' },
    exitCondition: { type: 'string', required: false, description: 'Condition de sortie personnalisée' },
    advanced: { type: 'json', required: false, description: 'Options avancées' },
    itemTransform: { type: 'string', required: false, description: 'Code de transformation d\'élément' },
    resultTransform: { type: 'string', required: false, description: 'Code de transformation du résultat final' },
    errorHandling: { type: 'string', required: false, description: 'Stratégie de gestion des erreurs' },
    currentIndex: { type: 'number', required: false, description: 'Index courant pour les itérations séquentielles' },
    accumulator: { type: 'json', required: false, description: 'Accumulateur pour les résultats' }
  },
  
  outputs: {
    response: { 
      type: { json: 'json' } 
    }
  }
};

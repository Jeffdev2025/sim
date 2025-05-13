import { BlockConfig } from '../types'
import { MergeIcon } from '@/components/merge-icon'
import { 
  MergeExecutionConfig, 
  ObjectMergeStrategy, 
  ArrayMergeOptions, 
  KeyPrefixOptions, 
  ErrorHandlingStrategy 
} from './merge_execution'

export const MergeBlock: BlockConfig = {
  type: 'merge',
  name: 'Merge',
  description: 'Fusionne plusieurs flux de données en un seul',
  longDescription: 'Combine plusieurs flux de données selon différentes stratégies de fusion. Permet de fusionner des tableaux, des objets ou des structures mixtes avec des options avancées pour la gestion des conflits, le tri, la dédoublonnage et les transformations personnalisées.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/merge',
  bgColor: '#10B981', // Vert émeraude
  icon: MergeIcon,
  
  subBlocks: [
    {
      id: 'mode',
      title: 'Mode de fusion',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Concaténation simple', id: 'concat' },
        { label: 'Fusion d\'objets', id: 'merge' },
        { label: 'Fusion intelligente', id: 'auto' },
        { label: 'Union', id: 'union' },
        { label: 'Intersection', id: 'intersection' },
        { label: 'Personnalisé', id: 'custom' }
      ],
      value: () => 'auto',
    },
    {
      id: 'objectStrategy',
      title: 'Stratégie de fusion d\'objets',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Remplacer', id: 'replace' },
        { label: 'Conserver', id: 'keep' },
        { label: 'Fusion profonde', id: 'deep' },
        { label: 'Personnalisé', id: 'custom' }
      ],
      value: () => 'deep',
      condition: {
        field: 'mode',
        value: ['merge', 'auto']
      }
    },
    {
      id: 'arrayOptions',
      title: 'Options de tableau',
      type: 'checkbox-list',
      layout: 'full',
      options: [
        { label: 'Trier les éléments', id: 'sort' },
        { label: 'Supprimer les doublons', id: 'removeDuplicates' },
        { label: 'Aplatir les tableaux imbriqués', id: 'flatten' }
      ],
      condition: {
        field: 'mode',
        value: ['concat', 'auto', 'union', 'intersection']
      }
    },
    {
      id: 'sortField',
      title: 'Champ de tri',
      type: 'short-input',
      layout: 'half',
      placeholder: 'ex: id, name, date',
      condition: {
        field: 'arrayOptions',
        value: 'sort'
      }
    },
    {
      id: 'sortDirection',
      title: 'Direction du tri',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Ascendant', id: 'asc' },
        { label: 'Descendant', id: 'desc' }
      ],
      value: () => 'asc',
      condition: {
        field: 'arrayOptions',
        value: 'sort'
      }
    },
    {
      id: 'identifierField',
      title: 'Champ d\'identification',
      type: 'short-input',
      layout: 'half',
      placeholder: 'ex: id, uuid',
      condition: {
        field: 'arrayOptions',
        value: 'removeDuplicates'
      }
    },
    {
      id: 'flattenDepth',
      title: 'Profondeur d\'aplatissement',
      type: 'short-input',
      layout: 'half',
      placeholder: 'Infinity',
      condition: {
        field: 'arrayOptions',
        value: 'flatten'
      }
    },
    {
      id: 'enableKeyPrefix',
      title: 'Préfixer les clés',
      type: 'switch',
      layout: 'half',
      condition: {
        field: 'mode',
        value: ['merge', 'auto']
      }
    },
    {
      id: 'keyPrefixes',
      title: 'Configuration des préfixes',
      type: 'table',
      layout: 'full',
      columns: ['Source', 'Préfixe'],
      condition: {
        field: 'enableKeyPrefix',
        value: true
      }
    },
    {
      id: 'keySeparator',
      title: 'Séparateur de clé',
      type: 'short-input',
      layout: 'half',
      placeholder: '_',
      condition: {
        field: 'enableKeyPrefix',
        value: true
      }
    },
    {
      id: 'advanced',
      title: 'Options avancées',
      type: 'checkbox-list',
      layout: 'full',
      options: [
        { label: 'Pré-transformation', id: 'preTransform' },
        { label: 'Post-transformation', id: 'postTransform' },
        { label: 'Traitement par lot', id: 'batchProcessing' },
        { label: 'Collecter des statistiques', id: 'collectStats' },
        { label: 'Mode simulation', id: 'simulationMode' },
        { label: 'Activer la journalisation', id: 'enableLogging' }
      ]
    },
    {
      id: 'preTransform',
      title: 'Pré-transformation',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de pré-transformation
// Reçoit les entrées brutes et retourne les entrées transformées
function transformInputs(inputs) {
  // Exemple: normaliser les structures d'entrée
  const result = {};
  
  for (const key in inputs) {
    if (inputs[key] === null || inputs[key] === undefined) {
      continue;
    }
    
    // Convertir les entrées non-objet en objets
    if (typeof inputs[key] !== 'object' || Array.isArray(inputs[key])) {
      result[key] = inputs[key];
    } else {
      // Normaliser les objets
      result[key] = {
        ...inputs[key],
        _normalized: true
      };
    }
  }
  
  return result;
}

return transformInputs(inputs);`,
      condition: {
        field: 'advanced',
        value: 'preTransform'
      }
    },
    {
      id: 'postTransform',
      title: 'Post-transformation',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de post-transformation
// Reçoit le résultat de la fusion et retourne le résultat final
function transformResult(result) {
  // Exemple: ajouter des métadonnées ou filtrer le résultat
  if (Array.isArray(result)) {
    return result.map(item => ({
      ...item,
      _processed: true,
      _timestamp: new Date().toISOString()
    }));
  } else if (typeof result === 'object' && result !== null) {
    return {
      ...result,
      _processed: true,
      _timestamp: new Date().toISOString()
    };
  }
  
  return result;
}

return transformResult(result);`,
      condition: {
        field: 'advanced',
        value: 'postTransform'
      }
    },
    {
      id: 'customCode',
      title: 'Code personnalisé',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de fusion personnalisée
// Reçoit les entrées et la configuration, retourne le résultat fusionné
function customMerge(inputs, config) {
  // Exemple: fusion personnalisée avec priorité
  const result = {};
  const priorities = {
    input1: 3,
    input2: 2,
    input3: 1
  };
  
  // Collecter toutes les clés de tous les objets
  const allKeys = new Set();
  for (const key in inputs) {
    if (typeof inputs[key] === 'object' && inputs[key] !== null && !Array.isArray(inputs[key])) {
      Object.keys(inputs[key]).forEach(k => allKeys.add(k));
    }
  }
  
  // Pour chaque clé, prendre la valeur de l'entrée avec la priorité la plus élevée
  allKeys.forEach(key => {
    let highestPriority = -1;
    let value = undefined;
    
    for (const inputKey in inputs) {
      const priority = priorities[inputKey] || 0;
      const input = inputs[inputKey];
      
      if (
        typeof input === 'object' && 
        input !== null && 
        !Array.isArray(input) &&
        key in input && 
        priority > highestPriority
      ) {
        highestPriority = priority;
        value = input[key];
      }
    }
    
    if (value !== undefined) {
      result[key] = value;
    }
  });
  
  return result;
}

return customMerge(inputs, config);`,
      condition: {
        field: 'mode',
        value: 'custom'
      }
    },
    {
      id: 'errorHandling',
      title: 'Gestion des erreurs',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Ignorer et continuer', id: 'ignore' },
        { label: 'Utiliser une valeur par défaut', id: 'default' },
        { label: 'Arrêter l\'exécution', id: 'stop' }
      ],
      value: () => 'default',
    },
    {
      id: 'enablePreview',
      title: 'Prévisualiser le résultat',
      type: 'switch',
      layout: 'half',
      condition: {
        field: 'advanced',
        value: 'collectStats'
      }
    },
    {
      id: 'preview',
      title: 'Prévisualisation',
      type: 'code',
      layout: 'full',
      language: 'json',
      placeholder: '// La prévisualisation du résultat apparaîtra ici après configuration',
      condition: {
        field: 'enablePreview',
        value: true
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (inputs: Record<string, any>) => {
        const mode = inputs.mode || 'auto';
        const objectStrategy = inputs.objectStrategy || 'deep';
        const errorHandling = inputs.errorHandling || 'default';
        const enableLogging = inputs.advanced?.includes('enableLogging') || false;
        const collectStats = inputs.advanced?.includes('collectStats') || false;
        const simulationMode = inputs.advanced?.includes('simulationMode') || false;
        const batchProcessing = inputs.advanced?.includes('batchProcessing') || false;
        
        // Construire les options de tableau
        const arrayOptions: ArrayMergeOptions = {};
        
        if (inputs.arrayOptions?.includes('sort')) {
          arrayOptions.sort = true;
          arrayOptions.sortField = inputs.sortField;
          arrayOptions.sortDirection = inputs.sortDirection || 'asc';
        }
        
        if (inputs.arrayOptions?.includes('removeDuplicates')) {
          arrayOptions.removeDuplicates = true;
          arrayOptions.identifierField = inputs.identifierField;
        }
        
        if (inputs.arrayOptions?.includes('flatten')) {
          arrayOptions.flatten = true;
          arrayOptions.flattenDepth = inputs.flattenDepth ? parseInt(inputs.flattenDepth, 10) : Infinity;
        }
        
        // Construire les options de préfixage des clés
        const keyPrefix: KeyPrefixOptions = {
          enabled: inputs.enableKeyPrefix || false,
          prefixes: {},
          separator: inputs.keySeparator || '_'
        };
        
        if (inputs.keyPrefixes && Array.isArray(inputs.keyPrefixes)) {
          inputs.keyPrefixes.forEach((item: any) => {
            if (item.Source && item.Préfixe) {
              keyPrefix.prefixes[item.Source] = item.Préfixe;
            }
          });
        }
        
        // Construire la configuration complète
        const config: MergeExecutionConfig = {
          mode,
          objectStrategy: objectStrategy as ObjectMergeStrategy,
          arrayOptions,
          keyPrefix,
          errorHandling: errorHandling as ErrorHandlingStrategy,
          batchProcessing,
          collectStats,
          simulationMode,
          enableLogging
        };
        
        // Ajouter les transformations si définies
        if (inputs.advanced?.includes('preTransform') && inputs.preTransform) {
          config.preTransform = inputs.preTransform;
        }
        
        if (inputs.advanced?.includes('postTransform') && inputs.postTransform) {
          config.postTransform = inputs.postTransform;
        }
        
        // Ajouter le code personnalisé si défini
        if (mode === 'custom' && inputs.customCode) {
          config.customCode = inputs.customCode;
        }
        
        // Générer le code d'exécution
        const code = `
          const { executeMerge } = require('./blocks/blocks/merge_execution');
          
          // Récupérer les entrées
          const inputs = {};
          
          // Collecter toutes les entrées disponibles
          for (const key in input) {
            if (key.startsWith('input') && input[key] !== undefined) {
              inputs[key] = input[key];
            }
          }
          
          ${enableLogging ? 'console.log("Merge: Entrées collectées", inputs);' : ''}
          ${enableLogging ? 'console.log("Merge: Configuration", ' + JSON.stringify(config, null, 2) + ');' : ''}
          
          // Exécuter la fusion avec la configuration spécifiée
          const result = executeMerge(inputs, ${JSON.stringify(config)});
          
          ${enableLogging ? 'console.log("Merge: Résultat", result);' : ''}
          
          // Retourner le résultat
          return result.data;
        `;
        
        // Collecter toutes les entrées disponibles
        const inputData: Record<string, any> = {};
        for (const key in inputs) {
          if (key.startsWith('input') && inputs[key] !== undefined) {
            inputData[key] = inputs[key];
          }
        }
        
        return {
          code,
          input: inputData,
          timeout: 10000
        };
      }
    }
  },
  
  inputs: {
    input1: { type: 'json', required: true, description: 'Première entrée à fusionner' },
    input2: { type: 'json', required: false, description: 'Deuxième entrée à fusionner' },
    input3: { type: 'json', required: false, description: 'Troisième entrée à fusionner' },
    input4: { type: 'json', required: false, description: 'Quatrième entrée à fusionner' },
    input5: { type: 'json', required: false, description: 'Cinquième entrée à fusionner' },
    mode: { type: 'string', required: false, description: 'Mode de fusion' },
    objectStrategy: { type: 'string', required: false, description: 'Stratégie de fusion d\'objets' },
    arrayOptions: { type: 'json', required: false, description: 'Options de fusion de tableaux' },
    sortField: { type: 'string', required: false, description: 'Champ utilisé pour le tri' },
    sortDirection: { type: 'string', required: false, description: 'Direction du tri' },
    identifierField: { type: 'string', required: false, description: 'Champ d\'identification pour la déduplication' },
    flattenDepth: { type: 'string', required: false, description: 'Profondeur d\'aplatissement' },
    enableKeyPrefix: { type: 'boolean', required: false, description: 'Activer le préfixage des clés' },
    keyPrefixes: { type: 'json', required: false, description: 'Configuration des préfixes de clés' },
    keySeparator: { type: 'string', required: false, description: 'Séparateur pour les préfixes de clés' },
    advanced: { type: 'json', required: false, description: 'Options avancées' },
    preTransform: { type: 'string', required: false, description: 'Code de pré-transformation' },
    postTransform: { type: 'string', required: false, description: 'Code de post-transformation' },
    customCode: { type: 'string', required: false, description: 'Code personnalisé pour la fusion' },
    errorHandling: { type: 'string', required: false, description: 'Stratégie de gestion des erreurs' }
  },
  
  outputs: {
    response: { 
      type: { json: 'json' } 
    }
  }
};

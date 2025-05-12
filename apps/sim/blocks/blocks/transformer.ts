import { CodeIcon } from '@/components/icons'
import { BlockConfig } from '../types'

export const TransformerBlock: BlockConfig = {
  type: 'transformer',
  name: 'Transformer',
  description: 'Modifie la structure des données',
  longDescription: 'Transforme les données entrantes en utilisant du code JavaScript personnalisé ou des transformations prédéfinies. Permet de restructurer, filtrer, enrichir ou convertir des données selon vos besoins spécifiques.',
  category: 'tools',
  docsLink: 'https://docs.simstudio.ai/tools/transformer',
  bgColor: '#6366F1', // Indigo
  icon: CodeIcon,
  
  subBlocks: [
    {
      id: 'mode',
      title: 'Mode de transformation',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Script personnalisé', id: 'custom' },
        { label: 'Transformations prédéfinies', id: 'predefined' }
      ],
      value: () => 'custom',
    },
    {
      id: 'code',
      title: 'Code de transformation',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      generationType: 'javascript-function-body',
      placeholder: `// Exemple: Transformer un tableau d'objets
// La variable 'input' contient les données d'entrée
// Retournez le résultat transformé

// Exemple 1: Ajouter un champ à chaque objet
if (Array.isArray(input)) {
  return input.map(item => ({
    ...item,
    transformed: true,
    timestamp: new Date().toISOString()
  }));
}

// Exemple 2: Filtrer des éléments
if (Array.isArray(input)) {
  return input.filter(item => item.value > 10);
}

// Exemple 3: Restructurer complètement
return {
  count: Array.isArray(input) ? input.length : 1,
  data: input,
  metadata: {
    processedAt: new Date().toISOString()
  }
};`,
      condition: {
        field: 'mode',
        value: 'custom'
      }
    },
    {
      id: 'transformations',
      title: 'Configuration des transformations',
      type: 'table',
      layout: 'full',
      columns: ['Champ source', 'Opération', 'Champ destination'],
      condition: {
        field: 'mode',
        value: 'predefined'
      }
    },
    {
      id: 'advanced',
      title: 'Options avancées',
      type: 'switch',
      layout: 'full',
      value: () => false,
    },
    {
      id: 'errorHandling',
      title: 'Gestion des erreurs',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Arrêter l\'exécution', id: 'stop' },
        { label: 'Continuer avec les données originales', id: 'continue' },
        { label: 'Retourner une valeur par défaut', id: 'default' }
      ],
      value: () => 'stop',
      condition: {
        field: 'advanced',
        value: true
      }
    },
    {
      id: 'defaultValue',
      title: 'Valeur par défaut (JSON)',
      type: 'code',
      layout: 'half',
      language: 'json',
      placeholder: '{}',
      condition: {
        field: 'errorHandling',
        value: 'default'
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (params) => {
        if (params.mode === 'custom') {
          return {
            code: `
              try {
                const input = ${JSON.stringify(params.input || {})};
                ${params.code || 'return input;'}
              } catch (error) {
                ${params.errorHandling === 'stop' 
                  ? 'throw error;' 
                  : params.errorHandling === 'continue' 
                    ? 'return input;' 
                    : `return ${params.defaultValue || '{}'};`}
              }
            `,
            timeout: 5000
          }
        } else {
          // Logique pour les transformations prédéfinies
          const transformations = params.transformations || []
          return {
            code: `
              try {
                const input = ${JSON.stringify(params.input || {})};
                const result = {...input};
                
                ${transformations.map(t => {
                  const { source, operation, destination } = t
                  switch(operation) {
                    case 'copy': return `result["${destination}"] = input["${source}"];`
                    case 'rename': return `result["${destination}"] = input["${source}"]; delete result["${source}"];`
                    case 'delete': return `delete result["${source}"];`
                    case 'uppercase': return `result["${destination}"] = String(input["${source}"]).toUpperCase();`
                    case 'lowercase': return `result["${destination}"] = String(input["${source}"]).toLowerCase();`
                    default: return `result["${destination}"] = input["${source}"];`
                  }
                }).join('\n                ')}
                
                return result;
              } catch (error) {
                ${params.errorHandling === 'stop' 
                  ? 'throw error;' 
                  : params.errorHandling === 'continue' 
                    ? 'return input;' 
                    : `return ${params.defaultValue || '{}'};`}
              }
            `,
            timeout: 5000
          }
        }
      }
    }
  },
  
  inputs: {
    input: { type: 'json', required: true, description: 'Données à transformer' },
    mode: { type: 'string', required: false, description: 'Mode de transformation' },
    code: { type: 'string', required: false, description: 'Code JavaScript personnalisé' },
    transformations: { type: 'json', required: false, description: 'Configuration des transformations prédéfinies' },
    advanced: { type: 'boolean', required: false, description: 'Activer les options avancées' },
    errorHandling: { type: 'string', required: false, description: 'Comportement en cas d\'erreur' },
    defaultValue: { type: 'json', required: false, description: 'Valeur par défaut en cas d\'erreur' }
  },
  
  outputs: {
    response: {
      type: {
        result: 'json',
        stdout: 'string'
      }
    }
  }
}

import { CodeIcon } from '@/components/icons'
import { BlockConfig } from '../types'

export const TransformerBlock: BlockConfig = {
  type: 'transformer',
  name: 'Transformer',
  description: 'Modifie la structure des données',
  longDescription: 'Transforme les données entrantes en utilisant du code JavaScript personnalisé ou des transformations prédéfinies. Permet de restructurer, filtrer, enrichir ou convertir des données selon vos besoins spécifiques.',
  category: 'blocks',
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
        { label: 'Transformations prédéfinies', id: 'predefined' },
        { label: 'Templates', id: 'template' }
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
      placeholder: `// Exemples simples:

// Ajouter un champ
return input.map(i => ({
  ...i, 
  modifié: true
}));

// OU: Filtrer
return input.filter(i => i.valeur > 10);

// OU: Restructurer
return { total: input.length, données: input };`,
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
      value: () => 'false',
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
    },
    {
      id: 'template',
      title: 'Template de transformation',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Grouper par propriété', id: 'groupBy' },
        { label: 'Extraire des propriétés', id: 'pick' },
        { label: 'Omettre des propriétés', id: 'omit' },
        { label: 'Transformer en tableau', id: 'toArray' },
        { label: 'Inverser clés/valeurs', id: 'invert' },
        { label: 'Fusionner des objets', id: 'merge' },
        { label: 'Aplatir un tableau', id: 'flatten' },
        { label: 'Regrouper par valeur', id: 'countBy' }
      ],
      condition: {
        field: 'mode',
        value: 'template'
      }
    },
    {
      id: 'templateConfig',
      title: 'Configuration du template',
      type: 'code',
      layout: 'full',
      language: 'json',
      placeholder: '{"property": "category"}',
      condition: {
        field: 'mode',
        value: 'template'
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (params) => {
        // Valeur par défaut si aucun mode n'est spécifié
        if (!params.mode || params.mode === 'custom') {
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
        } else if (params.mode === 'predefined') {
          // Logique pour les transformations prédéfinies
          const transformations = params.transformations || []
          return {
            code: `
              try {
                const input = ${JSON.stringify(params.input || {})};
                const result = {...input};
                
                ${transformations.map((t: Record<string, string>) => {
                  const { source, operation, destination } = t
                  switch(operation) {
                    case 'copy': return `result["${destination}"] = input["${source}"];`
                    case 'rename': return `result["${destination}"] = input["${source}"]; delete result["${source}"];`
                    case 'delete': return `delete result["${source}"];`
                    case 'uppercase': return `result["${destination}"] = String(input["${source}"]).toUpperCase();`
                    case 'lowercase': return `result["${destination}"] = String(input["${source}"]).toLowerCase();`
                    case 'extract': return `result["${destination}"] = input["${source}"] ? input["${source}"].substring(0, 10) : "";`
                    case 'formatDate': return `result["${destination}"] = input["${source}"] ? new Date(input["${source}"]).toLocaleDateString() : "";`
                    case 'toNumber': return `result["${destination}"] = Number(input["${source}"] || 0);`
                    case 'toString': return `result["${destination}"] = String(input["${source}"] || "");`
                    case 'round': return `result["${destination}"] = Math.round(Number(input["${source}"] || 0));`
                    case 'calculate': return `result["${destination}"] = eval("${source}".replace(/\{([^}]+)\}/g, (_, p) => input[p]));`
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
        } else if (params.mode === 'template') {
          // Logique pour les templates
          const templateType = params.template || 'groupBy'
          const config = params.templateConfig ? JSON.parse(params.templateConfig) : { property: 'id' }
          
          return {
            code: `
              try {
                const input = ${JSON.stringify(params.input || {})};
                const config = ${JSON.stringify(config)};
                
                // Fonctions utilitaires inspirées de lodash
                const utils = {
                  groupBy: (array, key) => {
                    return array.reduce((result, item) => {
                      const groupKey = item[key] || 'undefined';
                      result[groupKey] = result[groupKey] || [];
                      result[groupKey].push(item);
                      return result;
                    }, {});
                  },
                  pick: (object, keys) => {
                    return keys.reduce((result, key) => {
                      if (object.hasOwnProperty(key)) result[key] = object[key];
                      return result;
                    }, {});
                  },
                  omit: (object, keys) => {
                    return Object.keys(object).reduce((result, key) => {
                      if (!keys.includes(key)) result[key] = object[key];
                      return result;
                    }, {});
                  },
                  toArray: (value) => {
                    if (Array.isArray(value)) return value;
                    if (typeof value === 'string') return value.split('');
                    if (typeof value === 'object' && value !== null) return Object.values(value);
                    return [];
                  },
                  invert: (object) => {
                    return Object.keys(object).reduce((result, key) => {
                      result[object[key]] = key;
                      return result;
                    }, {});
                  },
                  merge: (target, ...sources) => {
                    sources.forEach(source => {
                      Object.keys(source).forEach(key => {
                        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                          target[key] = utils.merge(target[key] || {}, source[key]);
                        } else {
                          target[key] = source[key];
                        }
                      });
                    });
                    return target;
                  },
                  flatten: (array) => {
                    return array.reduce((result, item) => {
                      return result.concat(Array.isArray(item) ? utils.flatten(item) : item);
                    }, []);
                  },
                  countBy: (array, key) => {
                    return array.reduce((result, item) => {
                      const value = item[key] || 'undefined';
                      result[value] = (result[value] || 0) + 1;
                      return result;
                    }, {});
                  }
                };
                
                // Appliquer le template sélectionné
                switch('${templateType}') {
                  case 'groupBy':
                    return utils.groupBy(Array.isArray(input) ? input : [input], config.property);
                  case 'pick':
                    return utils.pick(input, config.properties || []);
                  case 'omit':
                    return utils.omit(input, config.properties || []);
                  case 'toArray':
                    return utils.toArray(input);
                  case 'invert':
                    return utils.invert(input);
                  case 'merge':
                    return utils.merge({}, input, config.secondObject || {});
                  case 'flatten':
                    return utils.flatten(Array.isArray(input) ? input : [input]);
                  case 'countBy':
                    return utils.countBy(Array.isArray(input) ? input : [input], config.property);
                  default:
                    return input;
                }
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
        
        // Cas par défaut pour garantir qu'on retourne toujours un objet
        return {
          code: `
            try {
              const input = ${JSON.stringify(params.input || {})};
              return input;
            } catch (error) {
              return {};
            }
          `,
          timeout: 5000
        };
      }
    }
  },
  
  inputs: {
    input: { type: 'json', required: true, description: 'Données à transformer' },
    mode: { type: 'string', required: false, description: 'Mode de transformation' },
    code: { type: 'string', required: false, description: 'Code JavaScript personnalisé' },
    transformations: { type: 'json', required: false, description: 'Configuration des transformations prédéfinies' },
    template: { type: 'string', required: false, description: 'Type de template à utiliser' },
    templateConfig: { type: 'json', required: false, description: 'Configuration du template sélectionné' },
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

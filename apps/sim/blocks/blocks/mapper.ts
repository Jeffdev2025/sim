import { BlockConfig } from '../types'
import { MapIcon } from '@/components/map-icon'

export const MapperBlock: BlockConfig = {
  type: 'mapper',
  name: 'Mapper',
  description: 'Fait correspondre des champs entre différentes structures',
  longDescription: 'Transforme les données entrantes en mappant des champs source vers des champs cible, avec possibilité d\'appliquer des transformations. Permet de restructurer les données selon un schéma précis.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/mapper',
  bgColor: '#3B82F6', // Bleu
  icon: MapIcon,
  
  subBlocks: [
    {
      id: 'mapping',
      title: 'Configuration du mapping',
      type: 'table',
      layout: 'full',
      columns: ['Champ source', 'Champ cible', 'Transformation']
    },
    {
      id: 'transformationType',
      title: 'Type de transformation',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Copie directe', id: 'direct' },
        { label: 'Texte en majuscules', id: 'uppercase' },
        { label: 'Texte en minuscules', id: 'lowercase' },
        { label: 'Convertir en nombre', id: 'toNumber' },
        { label: 'Convertir en texte', id: 'toString' },
        { label: 'Formater date', id: 'formatDate' },
        { label: 'Expression personnalisée', id: 'custom' }
      ],
      value: () => 'direct'
    },
    {
      id: 'customExpression',
      title: 'Expression personnalisée',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: 'value => value.trim()',
      condition: {
        field: 'transformationType',
        value: 'custom'
      }
    },
    {
      id: 'dateFormat',
      title: 'Format de date',
      type: 'short-input',
      layout: 'half',
      placeholder: 'DD/MM/YYYY',
      condition: {
        field: 'transformationType',
        value: 'formatDate'
      }
    },
    {
      id: 'options',
      title: 'Options avancées',
      type: 'switch',
      layout: 'full',
      options: [
        { label: 'Préserver les champs non mappés', id: 'preserveUnmapped' },
        { label: 'Ignorer les erreurs de transformation', id: 'ignoreErrors' },
        { label: 'Utiliser un code personnalisé', id: 'useCustomCode' }
      ]
    },
    {
      id: 'customCode',
      title: 'Code personnalisé',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de mapping avancée
// Reçoit l'objet source complet et doit retourner l'objet cible
function mapData(source) {
  const target = {};
  
  // Exemple de mapping personnalisé
  if (source.name) {
    const parts = source.name.split(' ');
    target.firstName = parts[0];
    target.lastName = parts.slice(1).join(' ');
  }
  
  return target;
}`,
      condition: {
        field: 'useCustomCode',
        value: true
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (inputs: Record<string, any>) => {
        const blocks = inputs.blocks || {};
        const mappingTable = blocks?.mapping?.value || [];
        const options = blocks?.options?.value || {};
        const customCode = blocks?.customCode?.value || '';
        const useCustomCode = options.useCustomCode || false;
        
        // Construire le code de transformation
        let code = `
          function executeMapping(input) {
            try {
              const source = input;
              let target = {};
              
              ${useCustomCode ? `
                // Utiliser le code personnalisé
                ${customCode}
                return mapData(source);
              ` : `
                // Utiliser le mapping configuré
                ${mappingTable.map((mapping: Record<string, any>) => {
                  const { sourceField, targetField, transformation, customExpression, dateFormat } = mapping;
                  
                  if (!sourceField || !targetField) return '';
                  
                  let transformCode = '';
                  switch (transformation) {
                    case 'uppercase':
                      transformCode = `typeof source.${sourceField} === 'string' ? source.${sourceField}.toUpperCase() : source.${sourceField}`;
                      break;
                    case 'lowercase':
                      transformCode = `typeof source.${sourceField} === 'string' ? source.${sourceField}.toLowerCase() : source.${sourceField}`;
                      break;
                    case 'toNumber':
                      transformCode = `Number(source.${sourceField})`;
                      break;
                    case 'toString':
                      transformCode = `String(source.${sourceField})`;
                      break;
                    case 'formatDate':
                      transformCode = `
                        (() => {
                          const date = new Date(source.${sourceField});
                          if (isNaN(date.getTime())) return source.${sourceField};
                          
                          const format = "${dateFormat || 'DD/MM/YYYY'}";
                          return format
                            .replace('YYYY', date.getFullYear())
                            .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
                            .replace('DD', String(date.getDate()).padStart(2, '0'))
                            .replace('HH', String(date.getHours()).padStart(2, '0'))
                            .replace('mm', String(date.getMinutes()).padStart(2, '0'))
                            .replace('ss', String(date.getSeconds()).padStart(2, '0'));
                        })()
                      `;
                      break;
                    case 'custom':
                      // Utiliser l'expression personnalisée (customExpression)
                      transformCode = `(${customExpression || 'value => value'})(source.${sourceField})`;
                      break;
                    case 'direct':
                    default:
                      transformCode = `source.${sourceField}`;
                  }
                  
                  return `
                    // Mapping: ${sourceField} -> ${targetField}
                    try {
                      target.${targetField} = ${transformCode};
                    } catch (err) {
                      ${options.ignoreErrors ? 
                        `console.error(\`Erreur lors du mapping de ${sourceField} vers ${targetField}: \${err.message}\`);` : 
                        `throw new Error(\`Erreur lors du mapping de ${sourceField} vers ${targetField}: \${err.message}\`);`
                      }
                    }
                  `;
                }).join('\n')}
                
                ${options.preserveUnmapped ? `
                  // Préserver les champs non mappés
                  for (const key in source) {
                    if (!target.hasOwnProperty(key)) {
                      target[key] = source[key];
                    }
                  }
                ` : ''}
                
                return target;
              `}
            } catch (error) {
              console.error("Erreur dans le mapper:", error);
              throw error;
            }
          }
          
          return executeMapping(input);
        `;
        
        return {
          code,
          input: inputs.input,
          timeout: 5000
        };
      }
    }
  },
  
  inputs: {
    input: { type: 'json', required: true, description: 'Données source à mapper' },
    targetSchema: { type: 'json', required: false, description: 'Schéma cible (optionnel)' },
    mapping: { type: 'json', required: false, description: 'Configuration du mapping' },
    options: { type: 'json', required: false, description: 'Options avancées' },
    customCode: { type: 'string', required: false, description: 'Code personnalisé pour le mapping' }
  },
  
  outputs: {
    response: { type: { json: 'json' } }
  }
};

import { FilterIcon } from '@/components/filter-icon'
import { BlockConfig } from '../types'

export const FilterBlock: BlockConfig = {
  type: 'filter',
  name: 'Filter',
  description: 'Filtre les données selon des critères',
  longDescription: 'Filtre les données entrantes en fonction de conditions définies, ne laissant passer que les éléments qui correspondent aux critères spécifiés. Permet de créer des filtres simples ou complexes avec des opérateurs logiques.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/filter',
  bgColor: '#10B981', // Vert émeraude
  icon: FilterIcon,
  
  subBlocks: [
    {
      id: 'mode',
      title: 'Mode de filtrage',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Conditions simples', id: 'simple' },
        { label: 'Expression personnalisée', id: 'custom' }
      ],
      value: () => 'simple',
    },
    {
      id: 'conditions',
      title: 'Conditions de filtrage',
      type: 'table',
      layout: 'full',
      columns: ['Champ', 'Opérateur', 'Valeur'],
      condition: {
        field: 'mode',
        value: 'simple'
      }
    },
    {
      id: 'logicOperator',
      title: 'Opérateur logique',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'ET (toutes les conditions)', id: 'and' },
        { label: 'OU (au moins une condition)', id: 'or' }
      ],
      value: () => 'and',
      condition: {
        field: 'mode',
        value: 'simple'
      }
    },
    {
      id: 'code',
      title: 'Expression de filtrage',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      generationType: 'javascript-function-body',
      placeholder: `// Retourne true pour garder l'élément, false pour le filtrer
// 'item' contient l'élément à évaluer

// Exemple: Filtrer les éléments avec une valeur > 10
return item.valeur > 10;

// Exemple: Filtrer par propriété
return item.statut === 'actif';

// Exemple: Combinaison de conditions
return item.prix > 100 && item.quantite > 0;`,
      condition: {
        field: 'mode',
        value: 'custom'
      }
    },
    {
      id: 'caseSensitive',
      title: 'Sensible à la casse',
      type: 'switch',
      layout: 'half',
      value: () => 'true',
      condition: {
        field: 'mode',
        value: 'simple'
      }
    },
    {
      id: 'emptyResult',
      title: 'Comportement si résultat vide',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Retourner tableau vide', id: 'empty' },
        { label: 'Retourner null', id: 'null' },
        { label: 'Déclencher une erreur', id: 'error' }
      ],
      value: () => 'empty'
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
                const input = ${JSON.stringify(params.input || [])};
                
                // Si l'entrée n'est pas un tableau, la convertir en tableau
                const items = Array.isArray(input) ? input : [input];
                
                // Filtrer les éléments avec le code personnalisé
                const result = items.filter(item => {
                  ${params.code || 'return true;'}
                });
                
                // Gérer le cas où le résultat est vide
                if (result.length === 0) {
                  ${params.emptyResult === 'null' 
                    ? 'return null;' 
                    : params.emptyResult === 'error' 
                      ? 'throw new Error("Le filtre n\'a retourné aucun résultat");' 
                      : 'return [];'}
                }
                
                return result;
              } catch (error) {
                throw error;
              }
            `,
            timeout: 5000
          }
        } else if (params.mode === 'simple') {
          // Logique pour les conditions simples
          const conditions = params.conditions || []
          const logicOperator = params.logicOperator || 'and'
          const caseSensitive = params.caseSensitive === 'true'
          
          return {
            code: `
              try {
                const input = ${JSON.stringify(params.input || [])};
                
                // Si l'entrée n'est pas un tableau, la convertir en tableau
                const items = Array.isArray(input) ? input : [input];
                
                // Fonction pour évaluer une condition
                const evaluateCondition = (item, field, operator, value) => {
                  // Obtenir la valeur du champ
                  const itemValue = item[field];
                  
                  // Traitement des chaînes de caractères pour la sensibilité à la casse
                  let compareValue = itemValue;
                  let compareTarget = value;
                  
                  if (typeof itemValue === 'string' && typeof value === 'string' && !${caseSensitive}) {
                    compareValue = itemValue.toLowerCase();
                    compareTarget = value.toLowerCase();
                  }
                  
                  // Évaluer selon l'opérateur
                  switch(operator) {
                    case 'equals': return compareValue === compareTarget;
                    case 'notEquals': return compareValue !== compareTarget;
                    case 'contains': 
                      return typeof compareValue === 'string' && compareValue.includes(compareTarget);
                    case 'notContains': 
                      return typeof compareValue === 'string' && !compareValue.includes(compareTarget);
                    case 'startsWith': 
                      return typeof compareValue === 'string' && compareValue.startsWith(compareTarget);
                    case 'endsWith': 
                      return typeof compareValue === 'string' && compareValue.endsWith(compareTarget);
                    case 'greaterThan': return compareValue > compareTarget;
                    case 'lessThan': return compareValue < compareTarget;
                    case 'greaterThanOrEqual': return compareValue >= compareTarget;
                    case 'lessThanOrEqual': return compareValue <= compareTarget;
                    case 'empty': 
                      return compareValue === undefined || compareValue === null || compareValue === '';
                    case 'notEmpty': 
                      return compareValue !== undefined && compareValue !== null && compareValue !== '';
                    case 'in': 
                      return Array.isArray(compareTarget) && compareTarget.includes(compareValue);
                    case 'notIn': 
                      return Array.isArray(compareTarget) && !compareTarget.includes(compareValue);
                    default: return false;
                  }
                };
                
                // Filtrer les éléments selon les conditions
                const result = items.filter(item => {
                  // Évaluer toutes les conditions
                  const conditionResults = ${JSON.stringify(conditions)}.map(condition => {
                    return evaluateCondition(
                      item, 
                      condition.Champ, 
                      condition.Opérateur, 
                      condition.Valeur
                    );
                  });
                  
                  // Appliquer l'opérateur logique
                  if ('${logicOperator}' === 'and') {
                    return conditionResults.every(result => result);
                  } else {
                    return conditionResults.some(result => result);
                  }
                });
                
                // Gérer le cas où le résultat est vide
                if (result.length === 0) {
                  ${params.emptyResult === 'null' 
                    ? 'return null;' 
                    : params.emptyResult === 'error' 
                      ? 'throw new Error("Le filtre n\'a retourné aucun résultat");' 
                      : 'return [];'}
                }
                
                return result;
              } catch (error) {
                throw error;
              }
            `,
            timeout: 5000
          }
        }
        
        // Cas par défaut pour garantir qu'on retourne toujours un objet
        return {
          code: `
            try {
              const input = ${JSON.stringify(params.input || [])};
              return Array.isArray(input) ? input : [input];
            } catch (error) {
              return [];
            }
          `,
          timeout: 5000
        };
      }
    }
  },
  
  inputs: {
    input: { type: 'json', required: true, description: 'Données à filtrer' },
    mode: { type: 'string', required: false, description: 'Mode de filtrage' },
    conditions: { type: 'json', required: false, description: 'Conditions de filtrage pour le mode simple' },
    logicOperator: { type: 'string', required: false, description: 'Opérateur logique pour combiner les conditions' },
    code: { type: 'string', required: false, description: 'Expression JavaScript pour le mode personnalisé' },
    caseSensitive: { type: 'boolean', required: false, description: 'Sensibilité à la casse pour les comparaisons de texte' },
    emptyResult: { type: 'string', required: false, description: 'Comportement si le résultat du filtrage est vide' }
  },
  
  outputs: {
    response: { type: { json: 'json' } }
  }
}

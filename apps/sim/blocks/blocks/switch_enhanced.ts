import { BlockConfig } from '../types'
import { SwitchEnhancedIcon } from '@/components/switch-enhanced-icon'

export const SwitchEnhancedBlock: BlockConfig = {
  type: 'switch_enhanced',
  name: 'Switch Avancé',
  description: 'Dirige le flux selon plusieurs conditions avec des fonctionnalités avancées',
  longDescription: 'Version améliorée du bloc Switch avec des fonctionnalités avancées comme les expressions régulières, les comparaisons floues, le routage multiple, les statistiques et l\'enrichissement de données.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/switch_enhanced',
  bgColor: '#8B5CF6', // Violet
  icon: SwitchEnhancedIcon,
  
  subBlocks: [
    {
      id: 'mode',
      title: 'Mode d\'évaluation',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Valeur unique', id: 'value' },
        { label: 'Conditions multiples', id: 'conditions' },
        { label: 'Expression personnalisée', id: 'expression' },
        { label: 'Expressions régulières', id: 'regex' },
        { label: 'Plages de valeurs', id: 'range' }
      ],
      value: () => 'value',
    },
    {
      id: 'valueField',
      title: 'Champ à évaluer',
      type: 'short-input',
      layout: 'full',
      placeholder: 'ex: status, type, category',
      description: 'Champ à évaluer (obligatoire)',
      condition: {
        field: 'mode',
        value: ['value', 'regex', 'range']
      }
    },
    {
      id: 'caseSensitive',
      title: 'Sensible à la casse',
      type: 'switch',
      layout: 'half',
      value: () => 'false',
      condition: {
        field: 'mode',
        value: ['value', 'regex']
      }
    },
    {
      id: 'comparisonType',
      title: 'Type de comparaison',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Exacte', id: 'exact' },
        { label: 'Contient', id: 'contains' },
        { label: 'Commence par', id: 'startsWith' },
        { label: 'Termine par', id: 'endsWith' },
        { label: 'Approximative (fuzzy)', id: 'fuzzy' }
      ],
      value: () => 'exact',
      condition: {
        field: 'mode',
        value: ['value']
      }
    },
    {
      id: 'fuzzyThreshold',
      title: 'Seuil de similarité (%)',
      type: 'short-input',
      layout: 'half',
      placeholder: '80',
      value: () => '80',
      condition: {
        field: 'comparisonType',
        value: ['fuzzy']
      }
    },
    {
      id: 'cases',
      title: 'Cas à évaluer',
      type: 'table',
      layout: 'full',
      columns: ['Valeur', 'Branche de sortie', 'Priorité'],
      value: () => '[]',
      condition: {
        field: 'mode',
        value: ['value']
      }
    },
    {
      id: 'regexPatterns',
      title: 'Motifs d\'expressions régulières',
      type: 'table',
      layout: 'full',
      columns: ['Expression', 'Branche de sortie', 'Priorité'],
      value: () => '[]',
      condition: {
        field: 'mode',
        value: ['regex']
      }
    },
    {
      id: 'ranges',
      title: 'Plages de valeurs',
      type: 'table',
      layout: 'full',
      columns: ['Min', 'Max', 'Branche de sortie', 'Priorité'],
      value: () => '[]',
      condition: {
        field: 'mode',
        value: ['range']
      }
    },
    {
      id: 'conditions',
      title: 'Conditions',
      type: 'table',
      layout: 'full',
      columns: ['Condition', 'Branche de sortie', 'Priorité'],
      value: () => '[]',
      condition: {
        field: 'mode',
        value: ['conditions']
      }
    },
    {
      id: 'expression',
      title: 'Expression d\'évaluation',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction d'évaluation personnalisée
// Reçoit l'objet d'entrée et doit retourner le nom de la branche
function evaluateSwitch(item) {
  // Exemple: évaluation basée sur plusieurs critères
  if (item.value > 10) {
    return "branch1";
  } else {
    return "branch2";
  }
}`,
      condition: {
        field: 'mode',
        value: ['expression']
      }
    },
    {
      id: 'routingMode',
      title: 'Mode de routage',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Première correspondance', id: 'first' },
        { label: 'Toutes les correspondances', id: 'all' },
        { label: 'Pondéré', id: 'weighted' }
      ],
      value: () => 'first',
      description: 'Détermine comment les éléments sont routés: vers la première branche correspondante, vers toutes les branches correspondantes, ou selon une distribution pondérée'
    },
    {
      id: 'weights',
      title: 'Poids des branches',
      type: 'table',
      layout: 'full',
      columns: ['Branche', 'Poids (%)'],
      value: () => '[]',
      condition: {
        field: 'routingMode',
        value: ['weighted']
      }
    },
    {
      id: 'defaultBranch',
      title: 'Branche par défaut',
      type: 'short-input',
      layout: 'half',
      placeholder: 'default',
      value: () => 'default',
      description: 'Branche par défaut (obligatoire) - Utilisée si aucune condition n\'est satisfaite'
    },
    {
      id: 'advanced',
      title: 'Options avancées',
      type: 'checkbox-list',
      layout: 'full',
      options: [
        { label: 'Traitement par lot', id: 'batchEvaluation' },
        { label: 'Journalisation', id: 'enableLogging' },
        { label: 'Ajouter des métadonnées', id: 'addMetadata' },
        { label: 'Collecter des statistiques', id: 'collectStats' },
        { label: 'Mode simulation', id: 'simulationMode' },
        { label: 'Transformer à la volée', id: 'transformOnRoute' }
      ],
      value: () => '[]'
    },
    {
      id: 'batchMode',
      title: 'Mode de traitement par lot',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Préserver la structure', id: 'preserve' },
        { label: 'Grouper par branche', id: 'group' }
      ],
      value: () => 'preserve',
      condition: {
        field: 'advanced',
        value: ['batchEvaluation']
      }
    },
    {
      id: 'transformations',
      title: 'Transformations par branche',
      type: 'table',
      layout: 'full',
      columns: ['Branche', 'Transformation'],
      value: () => '[]',
      condition: {
        field: 'advanced',
        value: ['transformOnRoute']
      }
    },
    {
      id: 'errorHandling',
      title: 'Gestion des erreurs',
      type: 'dropdown',
      options: [
        { label: 'Utiliser la branche par défaut', id: 'default' },
        { label: 'Utiliser la branche "error"', id: 'error' },
        { label: 'Arrêter l\'exécution', id: 'stop' }
      ],
      value: () => 'default'
    },
    {
      id: 'enablePreview',
      title: 'Prévisualiser les résultats',
      type: 'switch',
      layout: 'half',
      condition: {
        field: 'advanced',
        value: 'previewResults'
      }
    },
    {
      id: 'preview',
      title: 'Prévisualisation des résultats',
      type: 'code',
      layout: 'full',
      language: 'json',
      placeholder: '// La prévisualisation des résultats apparaîtra ici après configuration',
      condition: {
        field: 'enablePreview',
        value: true
      }
    }
  ],
  
  inputs: {
    input: { type: 'json', required: true, description: 'Données à évaluer' },
    mode: { type: 'string', required: false, description: 'Mode d\'évaluation' },
    valueField: { type: 'string', required: false, description: 'Champ à évaluer en mode valeur' },
    caseSensitive: { type: 'boolean', required: false, description: 'Si la comparaison est sensible à la casse' },
    comparisonType: { type: 'string', required: false, description: 'Type de comparaison pour le mode valeur' },
    fuzzyThreshold: { type: 'string', required: false, description: 'Seuil de similarité pour les comparaisons floues' },
    cases: { type: 'json', required: false, description: 'Cas à évaluer en mode valeur' },
    regexPatterns: { type: 'json', required: false, description: 'Motifs d\'expressions régulières' },
    ranges: { type: 'json', required: false, description: 'Plages de valeurs pour le mode range' },
    conditions: { type: 'json', required: false, description: 'Conditions à évaluer en mode conditions' },
    routingMode: { type: 'string', required: false, description: 'Mode de routage (première correspondance, toutes, pondéré)' },
    weights: { type: 'json', required: false, description: 'Poids des branches pour le routage pondéré' },
    expression: { type: 'string', required: false, description: 'Expression personnalisée pour l\'évaluation' },
    defaultBranch: { type: 'string', required: false, description: 'Nom de la branche par défaut' },
    advanced: { type: 'json', required: false, description: 'Options avancées' },
    batchMode: { type: 'string', required: false, description: 'Mode d\'évaluation par lot' },
    errorHandling: { type: 'string', required: false, description: 'Comportement en cas d\'erreur' },
    transformations: { type: 'json', required: false, description: 'Transformations à appliquer par branche' }
  },
  
  outputs: {
    response: { 
      type: { string: 'string', json: 'json' } 
    }
  },
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (inputs: Record<string, any>) => {
        const blocks = inputs.blocks || {};
        const mode = blocks?.mode?.value || 'value';
        const valueField = blocks?.valueField?.value || '';
        const caseSensitive = blocks?.caseSensitive?.value || false;
        const comparisonType = blocks?.comparisonType?.value || 'exact';
        const fuzzyThreshold = parseInt(blocks?.fuzzyThreshold?.value || '80', 10) / 100;
        const cases = blocks?.cases?.value || [];
        const regexPatterns = blocks?.regexPatterns?.value || [];
        const ranges = blocks?.ranges?.value || [];
        const conditions = blocks?.conditions?.value || [];
        const routingMode = blocks?.routingMode?.value || 'first';
        const weights = blocks?.weights?.value || [];
        const expressionCode = blocks?.expression?.value || '';
        const defaultBranch = blocks?.defaultBranch?.value || 'default';
        
        // Options avancées
        const advancedOptions = blocks?.advanced?.value || [];
        const batchEvaluation = advancedOptions.includes('batchEvaluation');
        const batchMode = blocks?.batchMode?.value || 'preserve';
        const enableLogging = advancedOptions.includes('enableLogging');
        const addMetadata = advancedOptions.includes('addMetadata');
        const collectStats = advancedOptions.includes('collectStats');
        const simulationMode = advancedOptions.includes('simulationMode');
        const transformOnRoute = advancedOptions.includes('transformOnRoute');
        const transformations = blocks?.transformations?.value || [];
        const errorHandling = blocks?.errorHandling?.value || 'default';

        // Construire les paramètres
        const params = {
          mode,
          valueField,
          caseSensitive,
          comparisonType,
          fuzzyThreshold,
          cases,
          regexPatterns,
          ranges,
          conditions,
          routingMode,
          weights,
          expressionCode,
          defaultBranch,
          advancedOptions,
          batchEvaluation,
          batchMode,
          enableLogging,
          addMetadata,
          collectStats,
          simulationMode,
          transformOnRoute,
          transformations,
          errorHandling,
          blockId: inputs.id || 'unknown'
        };
        
        // Générer le code d'exécution
        const { generateSwitchCode } = require('./switch_enhanced_execution');
        const generatedCode = generateSwitchCode(params);
        
        return {
          code: generatedCode,
          input: inputs.input,
          timeout: 5000
        };
      }
    }
  }
};

import { BlockConfig } from '../types'
import { StopErrorIcon } from '@/components/stop-error-icon'
import { 
  StopErrorExecutionConfig, 
  ErrorSeverity, 
  StopStrategy 
} from './stop_error_execution'

export const StopErrorBlock: BlockConfig = {
  type: 'stop_error',
  name: 'Stop and Error',
  description: 'Déclenche une erreur et arrête le workflow',
  longDescription: 'Permet de déclencher des erreurs personnalisées et d\'arrêter l\'exécution du workflow selon différentes stratégies. Utile pour la gestion des erreurs et la validation des données.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/stop-error',
  bgColor: '#EF4444', // Rouge
  icon: StopErrorIcon,
  
  subBlocks: [
    {
      id: 'errorMessage',
      title: 'Message d\'erreur',
      type: 'long-input',
      layout: 'full',
      placeholder: 'Entrez le message d\'erreur à afficher',
      value: () => 'Une erreur s\'est produite dans le workflow'
    },
    {
      id: 'severity',
      title: 'Niveau de sévérité',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Avertissement', id: 'warning' },
        { label: 'Erreur', id: 'error' },
        { label: 'Fatale', id: 'fatal' }
      ],
      value: () => 'error'
    },
    {
      id: 'stopStrategy',
      title: 'Stratégie d\'arrêt',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Arrêter ce bloc uniquement', id: 'block' },
        { label: 'Arrêter cette branche', id: 'branch' },
        { label: 'Arrêter tout le workflow', id: 'workflow' }
      ],
      value: () => 'branch'
    },
    {
      id: 'errorCode',
      title: 'Code d\'erreur (optionnel)',
      type: 'short-input',
      layout: 'half',
      placeholder: 'ERR_001'
    },
    {
      id: 'conditional',
      title: 'Erreur conditionnelle',
      type: 'checkbox-list',
      layout: 'half',
      options: [
        { label: 'Activer la condition', id: 'enableCondition' }
      ]
    },
    {
      id: 'condition',
      title: 'Condition pour déclencher l\'erreur',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de condition pour déclencher l'erreur
// Retourne true pour déclencher l'erreur, false pour continuer normalement
// Reçoit: l'entrée complète du bloc

function shouldTriggerError(input) {
  // Exemple: déclencher l'erreur si une propriété spécifique est manquante
  if (!input || !input.requiredProperty) {
    return true;
  }
  
  // Exemple: déclencher l'erreur si une valeur est hors limites
  if (input.value && (input.value < 0 || input.value > 100)) {
    return true;
  }
  
  // Continuer normalement (pas d'erreur)
  return false;
}

return shouldTriggerError(input);`,
      condition: {
        field: 'conditional',
        value: 'enableCondition'
      }
    },
    {
      id: 'advanced',
      title: 'Options avancées',
      type: 'checkbox-list',
      layout: 'full',
      options: [
        { label: 'Activer la journalisation', id: 'enableLogging' },
        { label: 'Inclure l\'horodatage', id: 'includeTimestamp' },
        { label: 'Inclure la trace d\'appel', id: 'includeStackTrace' },
        { label: 'Mode simulation', id: 'simulationMode' }
      ],
      value: () => 'enableLogging'
    },
    {
      id: 'logDestination',
      title: 'Destination des logs',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Console', id: 'console' },
        { label: 'Fichier', id: 'file' },
        { label: 'Les deux', id: 'both' }
      ],
      value: () => 'console',
      condition: {
        field: 'advanced',
        value: 'enableLogging'
      }
    },
    {
      id: 'logFilePath',
      title: 'Chemin du fichier de log',
      type: 'short-input',
      layout: 'half',
      placeholder: 'logs/errors.log',
      condition: {
        field: 'logDestination',
        value: ['file', 'both']
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (inputs: Record<string, any>) => {
        // Récupérer les paramètres de configuration
        const errorMessage = inputs.errorMessage || 'Une erreur s\'est produite dans le workflow';
        const severity = inputs.severity || 'error';
        const stopStrategy = inputs.stopStrategy || 'branch';
        const errorCode = inputs.errorCode || '';
        
        // Options conditionnelles
        const conditional = inputs.conditional || [];
        const enableCondition = conditional.includes('enableCondition');
        const condition = enableCondition ? inputs.condition : '';
        
        // Options avancées
        const advanced = inputs.advanced || [];
        const enableLogging = advanced.includes('enableLogging');
        const includeTimestamp = advanced.includes('includeTimestamp');
        const includeStackTrace = advanced.includes('includeStackTrace');
        const simulationMode = advanced.includes('simulationMode');
        
        // Options de journalisation
        const logDestination = inputs.logDestination || 'console';
        const logFilePath = inputs.logFilePath || 'logs/errors.log';
        
        // Créer la configuration complète
        const config: StopErrorExecutionConfig = {
          errorMessage,
          severity: severity as ErrorSeverity,
          stopStrategy: stopStrategy as StopStrategy,
          errorCode,
          errorData: inputs.data,
          condition: enableCondition ? condition : undefined,
          loggingOptions: {
            enableLogging,
            logDestination: logDestination as 'console' | 'file' | 'both',
            logFilePath,
            includeTimestamp,
            includeStackTrace
          },
          simulationMode
        };
        
        // Générer le code d'exécution
        const code = `
          const { executeStopError } = require('./blocks/blocks/stop_error_execution');
          
          // Récupérer l'entrée
          const inputData = input.data || input;
          
          ${enableLogging ? 'console.log("Stop and Error: Entrée", inputData);' : ''}
          ${enableLogging ? 'console.log("Stop and Error: Configuration", ' + JSON.stringify(config, null, 2) + ');' : ''}
          
          // Exécuter le bloc Stop and Error
          const result = executeStopError(inputData, ${JSON.stringify(config)});
          
          ${enableLogging ? 'console.log("Stop and Error: Résultat", result);' : ''}
          
          // Si l'erreur a été déclenchée et que la stratégie est d'arrêter le workflow
          if (result.errorThrown && result.stopStrategy === 'workflow') {
            throw new Error(result.errorMessage || 'Workflow arrêté par le bloc Stop and Error');
          }
          
          // Si l'erreur a été déclenchée et que la stratégie est d'arrêter la branche
          if (result.errorThrown && result.stopStrategy === 'branch') {
            // Dans un environnement réel, on utiliserait un mécanisme pour arrêter la branche
            // Pour les besoins de l'exemple, on retourne un objet avec des informations sur l'erreur
            return {
              __stopError: true,
              message: result.errorMessage,
              code: result.errorCode,
              severity: result.severity,
              timestamp: result.stats?.timestamp,
              data: result.errorData
            };
          }
          
          // Si l'erreur a été déclenchée et que la stratégie est d'arrêter le bloc
          if (result.errorThrown && result.stopStrategy === 'block') {
            // Retourner l'entrée inchangée avec des informations sur l'erreur
            return {
              ...inputData,
              __error: {
                message: result.errorMessage,
                code: result.errorCode,
                severity: result.severity,
                timestamp: result.stats?.timestamp
              }
            };
          }
          
          // Si aucune erreur n'a été déclenchée, retourner l'entrée inchangée
          return inputData;
        `;
        
        return {
          code,
          input: inputs.data || {},
          timeout: 30000 // Timeout standard
        };
      }
    }
  },
  
  inputs: {
    data: { type: 'json', required: false, description: 'Données à vérifier et à transmettre si aucune erreur n\'est déclenchée' },
    errorMessage: { type: 'string', required: false, description: 'Message d\'erreur à afficher' },
    severity: { type: 'string', required: false, description: 'Niveau de sévérité (warning, error, fatal)' },
    stopStrategy: { type: 'string', required: false, description: 'Stratégie d\'arrêt (block, branch, workflow)' },
    errorCode: { type: 'string', required: false, description: 'Code d\'erreur personnalisé' },
    conditional: { type: 'json', required: false, description: 'Options pour l\'erreur conditionnelle' },
    condition: { type: 'string', required: false, description: 'Condition pour déclencher l\'erreur' },
    advanced: { type: 'json', required: false, description: 'Options avancées' },
    logDestination: { type: 'string', required: false, description: 'Destination des logs (console, file, both)' },
    logFilePath: { type: 'string', required: false, description: 'Chemin du fichier de log' }
  },
  
  outputs: {
    response: { 
      type: { json: 'json' } 
    }
  }
};

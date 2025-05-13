import { BlockConfig } from '../types'
import { WaitIcon } from '@/components/wait-icon'
import { 
  WaitExecutionConfig, 
  WaitMode, 
  TimeUnit, 
  InterruptStrategy 
} from './wait_execution'

export const WaitBlock: BlockConfig = {
  type: 'wait',
  name: 'Wait',
  description: 'Ajoute un délai avant de poursuivre l\'exécution',
  longDescription: 'Permet d\'introduire des délais dans le workflow, soit fixes, soit jusqu\'à une date/heure spécifique, soit jusqu\'à ce qu\'une condition soit remplie. Offre des options pour l\'interruption et la gestion des timeouts.',
  category: 'blocks',
  docsLink: 'https://docs.simstudio.ai/blocks/wait',
  bgColor: '#EC4899', // Rose
  icon: WaitIcon,
  
  subBlocks: [
    {
      id: 'mode',
      title: 'Mode d\'attente',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Délai fixe', id: 'fixed' },
        { label: 'Jusqu\'à une date/heure', id: 'until' },
        { label: 'Jusqu\'à ce qu\'une condition soit remplie', id: 'condition' }
      ],
      value: () => 'fixed',
    },
    {
      id: 'delay',
      title: 'Délai',
      type: 'short-input',
      layout: 'half',
      placeholder: '1000',
      condition: {
        field: 'mode',
        value: 'fixed'
      }
    },
    {
      id: 'timeUnit',
      title: 'Unité de temps',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Millisecondes', id: 'ms' },
        { label: 'Secondes', id: 'seconds' },
        { label: 'Minutes', id: 'minutes' },
        { label: 'Heures', id: 'hours' }
      ],
      value: () => 'ms',
      condition: {
        field: 'mode',
        value: 'fixed'
      }
    },
    {
      id: 'targetDate',
      title: 'Date et heure cible',
      type: 'date-input',
      layout: 'full',
      condition: {
        field: 'mode',
        value: 'until'
      }
    },
    {
      id: 'condition',
      title: 'Condition d\'attente',
      type: 'code',
      layout: 'full',
      language: 'javascript',
      placeholder: `// Fonction de condition d'attente
// Retourne true pour arrêter l'attente, false pour continuer
// Reçoit: l'entrée complète du bloc

function shouldStopWaiting(input) {
  // Exemple: arrêter l'attente si une propriété spécifique existe
  if (input && input.stopWaiting === true) {
    return true;
  }
  
  // Exemple: arrêter l'attente si un certain seuil est atteint
  if (input && input.counter && input.counter > 10) {
    return true;
  }
  
  // Continuer l'attente
  return false;
}

return shouldStopWaiting(input);`,
      condition: {
        field: 'mode',
        value: 'condition'
      }
    },
    {
      id: 'checkInterval',
      title: 'Intervalle de vérification (ms)',
      type: 'short-input',
      layout: 'half',
      placeholder: '1000',
      condition: {
        field: 'mode',
        value: 'condition'
      }
    },
    {
      id: 'timeout',
      title: 'Timeout (ms, 0 = pas de limite)',
      type: 'short-input',
      layout: 'half',
      placeholder: '0',
      condition: {
        field: 'mode',
        value: 'condition'
      }
    },
    {
      id: 'retryCount',
      title: 'Nombre de tentatives (0 = illimité)',
      type: 'short-input',
      layout: 'half',
      placeholder: '0',
      condition: {
        field: 'mode',
        value: 'condition'
      }
    },
    {
      id: 'advanced',
      title: 'Options avancées',
      type: 'checkbox-list',
      layout: 'full',
      options: [
        { label: 'Permettre l\'interruption', id: 'allowInterrupt' },
        { label: 'Mode simulation', id: 'simulationMode' },
        { label: 'Activer la journalisation', id: 'enableLogging' }
      ]
    },
    {
      id: 'interruptStrategy',
      title: 'Stratégie d\'interruption',
      type: 'dropdown',
      layout: 'half',
      options: [
        { label: 'Aucune', id: 'none' },
        { label: 'Par signal', id: 'signal' },
        { label: 'Par timeout', id: 'timeout' }
      ],
      value: () => 'none',
      condition: {
        field: 'advanced',
        value: 'allowInterrupt'
      }
    },
    {
      id: 'interruptSignal',
      title: 'Signal d\'interruption',
      type: 'short-input',
      layout: 'half',
      placeholder: 'stopWaiting',
      condition: {
        field: 'interruptStrategy',
        value: 'signal'
      }
    },
    {
      id: 'interruptTimeout',
      title: 'Timeout d\'interruption (ms)',
      type: 'short-input',
      layout: 'half',
      placeholder: '30000',
      condition: {
        field: 'interruptStrategy',
        value: 'timeout'
      }
    }
  ],
  
  tools: {
    access: ['function_execute'],
    config: {
      tool: () => 'function_execute',
      params: (inputs: Record<string, any>) => {
        // Récupérer les paramètres de configuration
        const mode = inputs.mode || 'fixed';
        
        // Options avancées
        const advanced = inputs.advanced || [];
        const allowInterrupt = advanced.includes('allowInterrupt');
        const simulationMode = advanced.includes('simulationMode');
        const enableLogging = advanced.includes('enableLogging');
        
        // Configuration spécifique au mode
        let modeConfig: Record<string, any> = {};
        
        switch (mode) {
          case 'fixed':
            modeConfig = {
              delay: parseInt(inputs.delay || '1000', 10),
              timeUnit: inputs.timeUnit || 'ms'
            };
            break;
            
          case 'until':
            modeConfig = {
              targetDate: inputs.targetDate || new Date(Date.now() + 60000) // Par défaut: maintenant + 1 minute
            };
            break;
            
          case 'condition':
            modeConfig = {
              condition: inputs.condition,
              conditionOptions: {
                checkInterval: parseInt(inputs.checkInterval || '1000', 10),
                timeout: parseInt(inputs.timeout || '0', 10),
                retryCount: parseInt(inputs.retryCount || '0', 10)
              }
            };
            break;
        }
        
        // Configuration d'interruption
        const interruptConfig: Record<string, any> = {};
        
        if (allowInterrupt) {
          interruptConfig.interruptStrategy = inputs.interruptStrategy || 'none';
          
          if (inputs.interruptStrategy === 'signal') {
            interruptConfig.interruptSignal = inputs.interruptSignal || 'stopWaiting';
          } else if (inputs.interruptStrategy === 'timeout') {
            interruptConfig.interruptTimeout = parseInt(inputs.interruptTimeout || '30000', 10);
          }
        } else {
          interruptConfig.interruptStrategy = 'none';
        }
        
        // Créer la configuration complète
        const config: WaitExecutionConfig = {
          mode: mode as WaitMode,
          ...modeConfig,
          ...interruptConfig,
          simulationMode,
          enableLogging,
          interruptStrategy: interruptConfig.interruptStrategy as InterruptStrategy || 'none'
        };
        
        // Générer le code d'exécution
        const code = `
          const { executeWait } = require('./blocks/blocks/wait_execution');
          
          // Récupérer l'entrée
          const inputData = input.data || input;
          
          ${enableLogging ? 'console.log("Wait: Entrée", inputData);' : ''}
          ${enableLogging ? 'console.log("Wait: Configuration", ' + JSON.stringify(config, null, 2) + ');' : ''}
          
          // Exécuter l'attente
          const waitConfig = ${JSON.stringify(config)};
          // S'assurer que toutes les propriétés requises sont présentes
          if (!waitConfig.interruptStrategy) {
            waitConfig.interruptStrategy = 'none';
          }
          
          const result = executeWait(inputData, waitConfig);
          
          ${enableLogging ? 'console.log("Wait: Résultat", result);' : ''}
          
          // Si l'attente est terminée avec succès, retourner l'entrée inchangée
          if (result.completed) {
            return inputData;
          }
          
          // Sinon, retourner le résultat avec des informations sur l'interruption ou l'erreur
          return {
            ...inputData,
            waitResult: result
          };
        `;
        
        return {
          code,
          input: inputs.data || {},
          timeout: 60000 // Timeout plus long pour les attentes
        };
      }
    }
  },
  
  inputs: {
    data: { type: 'json', required: false, description: 'Données à transmettre après l\'attente' },
    mode: { type: 'string', required: false, description: 'Mode d\'attente (fixed, until, condition)' },
    delay: { type: 'string', required: false, description: 'Délai pour le mode fixed' },
    timeUnit: { type: 'string', required: false, description: 'Unité de temps pour le délai (ms, seconds, minutes, hours)' },
    targetDate: { type: 'string', required: false, description: 'Date et heure cible pour le mode until' },
    condition: { type: 'string', required: false, description: 'Condition d\'attente pour le mode condition' },
    checkInterval: { type: 'string', required: false, description: 'Intervalle de vérification de la condition (ms)' },
    timeout: { type: 'string', required: false, description: 'Timeout pour le mode condition (ms, 0 = pas de limite)' },
    retryCount: { type: 'string', required: false, description: 'Nombre de tentatives pour le mode condition (0 = illimité)' },
    advanced: { type: 'json', required: false, description: 'Options avancées' },
    interruptStrategy: { type: 'string', required: false, description: 'Stratégie d\'interruption (none, signal, timeout)' },
    interruptSignal: { type: 'string', required: false, description: 'Signal d\'interruption pour la stratégie signal' },
    interruptTimeout: { type: 'string', required: false, description: 'Timeout d\'interruption pour la stratégie timeout (ms)' }
  },
  
  outputs: {
    response: { 
      type: { json: 'json' } 
    }
  }
};

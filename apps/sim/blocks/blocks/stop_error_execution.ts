/**
 * Logique d'exécution du bloc Stop and Error
 * Permet de déclencher des erreurs et d'arrêter l'exécution du workflow
 */

/**
 * Niveaux de sévérité des erreurs
 */
export type ErrorSeverity = 'warning' | 'error' | 'fatal';

/**
 * Stratégies d'arrêt du workflow
 */
export type StopStrategy = 'block' | 'branch' | 'workflow';

/**
 * Options de journalisation
 */
export interface LoggingOptions {
  enableLogging: boolean;
  logDestination?: 'console' | 'file' | 'both';
  logFilePath?: string;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
}

/**
 * Configuration complète pour l'exécution du bloc Stop and Error
 */
export interface StopErrorExecutionConfig {
  // Message d'erreur
  errorMessage: string;
  
  // Niveau de sévérité
  severity: ErrorSeverity;
  
  // Stratégie d'arrêt
  stopStrategy: StopStrategy;
  
  // Code d'erreur personnalisé
  errorCode?: string;
  
  // Données supplémentaires à inclure dans l'erreur
  errorData?: any;
  
  // Options de journalisation
  loggingOptions: LoggingOptions;
  
  // Mode simulation
  simulationMode: boolean;
  
  // Condition pour déclencher l'erreur (si vide, l'erreur est toujours déclenchée)
  condition?: string;
}

/**
 * Statistiques d'exécution
 */
export interface StopErrorStats {
  timestamp: number;
  severity: ErrorSeverity;
  stopStrategy: StopStrategy;
  conditionEvaluated?: boolean;
  conditionResult?: boolean;
  errorLogged: boolean;
  errorThrown: boolean;
}

/**
 * Résultat de l'exécution
 */
export interface StopErrorResult {
  stopped: boolean;
  errorThrown: boolean;
  errorMessage?: string;
  errorCode?: string;
  severity?: ErrorSeverity;
  stopStrategy?: StopStrategy;
  errorData?: any;
  stats?: StopErrorStats;
}

/**
 * Fonction principale pour exécuter le bloc Stop and Error
 */
export function executeStopError(
  input: any,
  config: StopErrorExecutionConfig
): StopErrorResult {
  const timestamp = Date.now();
  
  // Initialiser les statistiques
  const stats: StopErrorStats = {
    timestamp,
    severity: config.severity,
    stopStrategy: config.stopStrategy,
    errorLogged: false,
    errorThrown: false
  };
  
  try {
    // Mode simulation - ne pas déclencher d'erreur réelle
    if (config.simulationMode) {
      if (config.loggingOptions.enableLogging) {
        console.log('Stop and Error: Mode simulation activé, aucune erreur réelle déclenchée');
        console.log(`Message d'erreur simulé: ${config.errorMessage}`);
        console.log(`Sévérité: ${config.severity}`);
        console.log(`Stratégie d'arrêt: ${config.stopStrategy}`);
        
        stats.errorLogged = true;
      }
      
      return {
        stopped: false,
        errorThrown: false,
        errorMessage: config.errorMessage,
        errorCode: config.errorCode,
        severity: config.severity,
        stopStrategy: config.stopStrategy,
        errorData: config.errorData,
        stats
      };
    }
    
    // Vérifier si une condition est spécifiée
    if (config.condition) {
      stats.conditionEvaluated = true;
      
      // Évaluer la condition
      const conditionFn = new Function('input', config.condition);
      const conditionResult = conditionFn(input);
      
      stats.conditionResult = conditionResult;
      
      // Si la condition n'est pas satisfaite, ne pas déclencher d'erreur
      if (!conditionResult) {
        if (config.loggingOptions.enableLogging) {
          console.log('Stop and Error: Condition non satisfaite, aucune erreur déclenchée');
        }
        
        return {
          stopped: false,
          errorThrown: false,
          stats
        };
      }
    }
    
    // Journaliser l'erreur si demandé
    if (config.loggingOptions.enableLogging) {
      let logMessage = '';
      
      if (config.loggingOptions.includeTimestamp) {
        logMessage += `[${new Date(timestamp).toISOString()}] `;
      }
      
      logMessage += `${config.severity.toUpperCase()}: ${config.errorMessage}`;
      
      if (config.errorCode) {
        logMessage += ` (Code: ${config.errorCode})`;
      }
      
      if (config.loggingOptions.logDestination === 'console' || config.loggingOptions.logDestination === 'both' || !config.loggingOptions.logDestination) {
        console.error(logMessage);
        
        if (config.errorData) {
          console.error('Données supplémentaires:', config.errorData);
        }
        
        if (config.loggingOptions.includeStackTrace) {
          console.error(new Error().stack);
        }
      }
      
      if (config.loggingOptions.logDestination === 'file' || config.loggingOptions.logDestination === 'both') {
        // Dans un environnement réel, on écrirait dans un fichier
        // Pour les besoins de l'exemple, on simule l'écriture
        if (config.loggingOptions.enableLogging) {
          console.log(`Stop and Error: Écriture du message d'erreur dans le fichier ${config.loggingOptions.logFilePath || 'logs/errors.log'}`);
        }
      }
      
      stats.errorLogged = true;
    }
    
    // Préparer le résultat
    const result: StopErrorResult = {
      stopped: true,
      errorThrown: true,
      errorMessage: config.errorMessage,
      errorCode: config.errorCode,
      severity: config.severity,
      stopStrategy: config.stopStrategy,
      errorData: config.errorData,
      stats: {
        ...stats,
        errorThrown: true
      }
    };
    
    // Déclencher l'erreur
    // Dans un environnement réel, on utiliserait un mécanisme pour arrêter l'exécution
    // selon la stratégie d'arrêt spécifiée
    
    return result;
    
  } catch (error) {
    if (config.loggingOptions.enableLogging) {
      console.error('Stop and Error: Erreur lors de l\'exécution', error);
    }
    
    return {
      stopped: false,
      errorThrown: false,
      errorMessage: error instanceof Error ? error.message : String(error),
      stats: {
        ...stats,
        errorLogged: config.loggingOptions.enableLogging
      }
    };
  }
}

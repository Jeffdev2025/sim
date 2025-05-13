/**
 * Logique d'exécution du bloc Wait
 * Implémente différentes stratégies d'attente pour les workflows
 */

/**
 * Types d'attente supportés
 */
export type WaitMode = 'fixed' | 'until' | 'condition';

/**
 * Unités de temps pour le délai fixe
 */
export type TimeUnit = 'ms' | 'seconds' | 'minutes' | 'hours';

/**
 * Options pour l'attente conditionnelle
 */
export interface ConditionOptions {
  checkInterval: number; // Intervalle de vérification en ms
  timeout?: number; // Délai maximum d'attente en ms (0 = pas de limite)
  retryCount?: number; // Nombre de tentatives (0 = illimité)
}

/**
 * Options pour l'interruption
 */
export type InterruptStrategy = 'none' | 'signal' | 'timeout';

/**
 * Configuration complète pour l'exécution du bloc Wait
 */
export interface WaitExecutionConfig {
  // Mode d'attente
  mode: WaitMode;
  
  // Délai fixe (pour le mode 'fixed')
  delay?: number;
  timeUnit?: TimeUnit;
  
  // Date/heure cible (pour le mode 'until')
  targetDate?: string | Date;
  
  // Condition personnalisée (pour le mode 'condition')
  condition?: string;
  conditionOptions?: ConditionOptions;
  
  // Options d'interruption
  interruptStrategy: InterruptStrategy;
  interruptSignal?: string;
  interruptTimeout?: number;
  
  // Options avancées
  simulationMode: boolean;
  enableLogging: boolean;
}

/**
 * Statistiques d'exécution de l'attente
 */
export interface WaitStats {
  startTime: number;
  endTime?: number;
  duration?: number;
  mode: WaitMode;
  conditionChecks?: number;
  interrupted?: boolean;
  interruptReason?: string;
  errors?: Array<{ message: string }>;
}

/**
 * Résultat de l'exécution de l'attente
 */
export interface WaitResult {
  completed: boolean;
  interrupted?: boolean;
  interruptReason?: string;
  stats?: WaitStats;
  error?: string;
}

/**
 * Fonction principale pour exécuter une attente
 */
export function executeWait(
  input: any,
  config: WaitExecutionConfig
): WaitResult {
  const startTime = Date.now();
  const stats: WaitStats = {
    startTime,
    mode: config.mode
  };
  
  try {
    // Mode simulation - ne pas attendre réellement
    if (config.simulationMode) {
      if (config.enableLogging) {
        console.log('Wait: Mode simulation activé, aucune attente réelle effectuée');
      }
      
      return {
        completed: true,
        stats: {
          ...stats,
          endTime: startTime,
          duration: 0
        }
      };
    }
    
    // Déterminer le délai d'attente en fonction du mode
    let waitTimeMs: number = 0;
    
    switch (config.mode) {
      case 'fixed':
        waitTimeMs = calculateFixedDelay(config.delay || 0, config.timeUnit || 'ms');
        break;
        
      case 'until':
        if (!config.targetDate) {
          throw new Error('Date/heure cible requise pour le mode "until"');
        }
        
        const targetDate = typeof config.targetDate === 'string' 
          ? new Date(config.targetDate)
          : config.targetDate;
          
        waitTimeMs = targetDate.getTime() - startTime;
        
        // Si la date cible est dans le passé
        if (waitTimeMs <= 0) {
          if (config.enableLogging) {
            console.log('Wait: La date cible est déjà passée, aucune attente nécessaire');
          }
          
          return {
            completed: true,
            stats: {
              ...stats,
              endTime: startTime,
              duration: 0
            }
          };
        }
        break;
        
      case 'condition':
        if (!config.condition) {
          throw new Error('Condition requise pour le mode "condition"');
        }
        
        // Pour le mode condition, on ne peut pas déterminer le temps d'attente à l'avance
        // On utilisera un mécanisme de polling
        return executeConditionalWait(input, config, stats);
        
      default:
        throw new Error(`Mode d'attente non reconnu: ${config.mode}`);
    }
    
    // Vérifier si le délai est négatif ou nul
    if (waitTimeMs <= 0) {
      if (config.enableLogging) {
        console.log('Wait: Délai nul ou négatif, aucune attente nécessaire');
      }
      
      return {
        completed: true,
        stats: {
          ...stats,
          endTime: startTime,
          duration: 0
        }
      };
    }
    
    if (config.enableLogging) {
      console.log(`Wait: Attente de ${waitTimeMs}ms (${waitTimeMs / 1000} secondes)`);
    }
    
    // Exécuter l'attente (simulée pour le moment, car l'attente réelle nécessiterait une implémentation asynchrone)
    // Dans un environnement réel, on utiliserait setTimeout ou une autre méthode asynchrone
    
    // Simuler l'attente pour les besoins de l'exemple
    const endTime = startTime + waitTimeMs;
    
    return {
      completed: true,
      stats: {
        ...stats,
        endTime,
        duration: waitTimeMs
      }
    };
    
  } catch (error) {
    if (config.enableLogging) {
      console.error('Wait: Erreur lors de l\'exécution', error);
    }
    
    return {
      completed: false,
      error: error instanceof Error ? error.message : String(error),
      stats: {
        ...stats,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        errors: [{ message: error instanceof Error ? error.message : String(error) }]
      }
    };
  }
}

/**
 * Calcule le délai en millisecondes à partir d'une valeur et d'une unité
 */
function calculateFixedDelay(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'ms':
      return value;
    case 'seconds':
      return value * 1000;
    case 'minutes':
      return value * 60 * 1000;
    case 'hours':
      return value * 60 * 60 * 1000;
    default:
      return value;
  }
}

/**
 * Exécute une attente conditionnelle
 */
function executeConditionalWait(
  input: any,
  config: WaitExecutionConfig,
  stats: WaitStats
): WaitResult {
  const startTime = stats.startTime;
  const options = config.conditionOptions || {
    checkInterval: 1000,
    timeout: 0,
    retryCount: 0
  };
  
  // Nombre de vérifications effectuées
  let checks = 0;
  
  // Vérifier si la condition est satisfaite
  try {
    if (!config.condition) {
      throw new Error('Condition requise pour le mode "condition"');
    }
    
    const conditionFn = new Function('input', config.condition);
    const conditionResult = conditionFn(input);
    
    checks++;
    
    // Si la condition est déjà satisfaite, pas besoin d'attendre
    if (conditionResult) {
      if (config.enableLogging) {
        console.log('Wait: Condition déjà satisfaite, aucune attente nécessaire');
      }
      
      return {
        completed: true,
        stats: {
          ...stats,
          endTime: Date.now(),
          duration: Date.now() - startTime,
          conditionChecks: checks
        }
      };
    }
    
    // Dans un environnement réel, on utiliserait un mécanisme de polling
    // Pour les besoins de l'exemple, on simule une attente jusqu'au timeout
    
    const timeout = options.timeout || 0;
    
    if (timeout > 0) {
      if (config.enableLogging) {
        console.log(`Wait: Condition non satisfaite, timeout après ${timeout}ms`);
      }
      
      return {
        completed: false,
        interrupted: true,
        interruptReason: 'timeout',
        stats: {
          ...stats,
          endTime: startTime + timeout,
          duration: timeout,
          conditionChecks: checks,
          interrupted: true,
          interruptReason: 'timeout'
        }
      };
    }
    
    // Sans timeout, on considère que la condition ne sera jamais satisfaite
    // Dans un environnement réel, on continuerait à vérifier périodiquement
    
    if (config.enableLogging) {
      console.log('Wait: Condition non satisfaite, attente indéfinie');
    }
    
    return {
      completed: false,
      stats: {
        ...stats,
        conditionChecks: checks
      }
    };
    
  } catch (error) {
    if (config.enableLogging) {
      console.error('Wait: Erreur lors de l\'évaluation de la condition', error);
    }
    
    return {
      completed: false,
      error: error instanceof Error ? error.message : String(error),
      stats: {
        ...stats,
        endTime: Date.now(),
        duration: Date.now() - startTime,
        conditionChecks: checks,
        errors: [{ message: error instanceof Error ? error.message : String(error) }]
      }
    };
  }
}

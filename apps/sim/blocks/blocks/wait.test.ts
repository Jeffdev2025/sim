import { executeWait, WaitExecutionConfig } from './wait_execution';

describe('Bloc Wait', () => {
  // Tests pour le mode délai fixe
  describe('Mode délai fixe', () => {
    test('Devrait retourner completed=true avec un délai valide', () => {
      const config: WaitExecutionConfig = {
        mode: 'fixed',
        delay: 1000,
        timeUnit: 'ms',
        interruptStrategy: 'none',
        simulationMode: true,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats?.mode).toBe('fixed');
    });
    
    test('Devrait convertir correctement les unités de temps', () => {
      const config: WaitExecutionConfig = {
        mode: 'fixed',
        delay: 1,
        timeUnit: 'seconds',
        interruptStrategy: 'none',
        simulationMode: true,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
      // En mode simulation, la durée est 0
      expect(result.stats?.duration).toBe(0);
    });
    
    test('Devrait gérer un délai de 0', () => {
      const config: WaitExecutionConfig = {
        mode: 'fixed',
        delay: 0,
        timeUnit: 'ms',
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
      expect(result.stats?.duration).toBe(0);
    });
  });
  
  // Tests pour le mode jusqu'à une date/heure
  describe('Mode jusqu\'à une date/heure', () => {
    test('Devrait retourner completed=true si la date est dans le futur', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 heure dans le futur
      
      const config: WaitExecutionConfig = {
        mode: 'until',
        targetDate: futureDate,
        interruptStrategy: 'none',
        simulationMode: true,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
    });
    
    test('Devrait retourner completed=true immédiatement si la date est dans le passé', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 heure dans le passé
      
      const config: WaitExecutionConfig = {
        mode: 'until',
        targetDate: pastDate,
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
      expect(result.stats?.duration).toBe(0);
    });
    
    test('Devrait lever une erreur si targetDate est manquant', () => {
      const config: WaitExecutionConfig = {
        mode: 'until',
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Date/heure cible requise');
    });
  });
  
  // Tests pour le mode conditionnel
  describe('Mode conditionnel', () => {
    test('Devrait retourner completed=true si la condition est déjà satisfaite', () => {
      const config: WaitExecutionConfig = {
        mode: 'condition',
        condition: 'return true;',
        conditionOptions: {
          checkInterval: 1000,
          timeout: 0,
          retryCount: 0
        },
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
      expect(result.stats?.conditionChecks).toBe(1);
    });
    
    test('Devrait retourner completed=false si la condition n\'est pas satisfaite et qu\'il n\'y a pas de timeout', () => {
      const config: WaitExecutionConfig = {
        mode: 'condition',
        condition: 'return false;',
        conditionOptions: {
          checkInterval: 1000,
          timeout: 0,
          retryCount: 0
        },
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(false);
      expect(result.stats?.conditionChecks).toBe(1);
    });
    
    test('Devrait retourner interrupted=true si la condition n\'est pas satisfaite et qu\'il y a un timeout', () => {
      const config: WaitExecutionConfig = {
        mode: 'condition',
        condition: 'return false;',
        conditionOptions: {
          checkInterval: 1000,
          timeout: 5000,
          retryCount: 0
        },
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(false);
      expect(result.interrupted).toBe(true);
      expect(result.interruptReason).toBe('timeout');
    });
    
    test('Devrait lever une erreur si la condition est invalide', () => {
      const config: WaitExecutionConfig = {
        mode: 'condition',
        condition: 'this is not valid javascript;',
        conditionOptions: {
          checkInterval: 1000,
          timeout: 0,
          retryCount: 0
        },
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    test('Devrait lever une erreur si la condition est manquante', () => {
      const config: WaitExecutionConfig = {
        mode: 'condition',
        conditionOptions: {
          checkInterval: 1000,
          timeout: 0,
          retryCount: 0
        },
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Condition requise');
    });
  });
  
  // Tests pour le mode simulation
  describe('Mode simulation', () => {
    test('Devrait retourner immédiatement en mode simulation', () => {
      const config: WaitExecutionConfig = {
        mode: 'fixed',
        delay: 60000, // 1 minute
        timeUnit: 'ms',
        interruptStrategy: 'none',
        simulationMode: true,
        enableLogging: false
      };
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(true);
      expect(result.stats?.duration).toBe(0);
    });
  });
  
  // Tests pour les erreurs
  describe('Gestion des erreurs', () => {
    test('Devrait gérer un mode d\'attente non reconnu', () => {
      // Utiliser unknown comme type intermédiaire pour la conversion
      const config = {
        mode: 'invalid_mode' as unknown as 'fixed',
        interruptStrategy: 'none',
        simulationMode: false,
        enableLogging: false
      } as WaitExecutionConfig;
      
      const result = executeWait({}, config);
      
      expect(result.completed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Mode d\'attente non reconnu');
    });
  });
});

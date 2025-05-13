import { executeStopError, StopErrorExecutionConfig } from './stop_error_execution';

describe('Bloc Stop and Error', () => {
  // Tests pour les messages d'erreur
  describe('Messages d\'erreur', () => {
    test('Devrait utiliser le message d\'erreur spécifié', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Message d\'erreur personnalisé',
        severity: 'error',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.errorMessage).toBe('Message d\'erreur personnalisé');
    });
    
    test('Devrait inclure le code d\'erreur spécifié', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur avec code',
        errorCode: 'ERR_001',
        severity: 'error',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.errorCode).toBe('ERR_001');
    });
  });
  
  // Tests pour les niveaux de sévérité
  describe('Niveaux de sévérité', () => {
    test('Devrait utiliser le niveau de sévérité warning', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Avertissement',
        severity: 'warning',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.severity).toBe('warning');
    });
    
    test('Devrait utiliser le niveau de sévérité error', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur standard',
        severity: 'error',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.severity).toBe('error');
    });
    
    test('Devrait utiliser le niveau de sévérité fatal', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur fatale',
        severity: 'fatal',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.severity).toBe('fatal');
    });
  });
  
  // Tests pour les stratégies d'arrêt
  describe('Stratégies d\'arrêt', () => {
    test('Devrait utiliser la stratégie d\'arrêt block', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Arrêt du bloc',
        severity: 'error',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.stopStrategy).toBe('block');
    });
    
    test('Devrait utiliser la stratégie d\'arrêt branch', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Arrêt de la branche',
        severity: 'error',
        stopStrategy: 'branch',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.stopStrategy).toBe('branch');
    });
    
    test('Devrait utiliser la stratégie d\'arrêt workflow', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Arrêt du workflow',
        severity: 'error',
        stopStrategy: 'workflow',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.stopStrategy).toBe('workflow');
    });
  });
  
  // Tests pour les conditions
  describe('Conditions', () => {
    test('Devrait déclencher l\'erreur si la condition est satisfaite', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur conditionnelle',
        severity: 'error',
        stopStrategy: 'block',
        condition: 'return true;',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.stats?.conditionEvaluated).toBe(true);
      expect(result.stats?.conditionResult).toBe(true);
    });
    
    test('Ne devrait pas déclencher l\'erreur si la condition n\'est pas satisfaite', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur conditionnelle',
        severity: 'error',
        stopStrategy: 'block',
        condition: 'return false;',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(false);
      expect(result.stats?.conditionEvaluated).toBe(true);
      expect(result.stats?.conditionResult).toBe(false);
    });
    
    test('Devrait évaluer la condition avec les données d\'entrée', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur conditionnelle',
        severity: 'error',
        stopStrategy: 'block',
        condition: 'return input && input.value > 10;',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const resultTrue = executeStopError({ value: 15 }, config);
      expect(resultTrue.errorThrown).toBe(true);
      
      const resultFalse = executeStopError({ value: 5 }, config);
      expect(resultFalse.errorThrown).toBe(false);
    });
  });
  
  // Tests pour le mode simulation
  describe('Mode simulation', () => {
    test('Ne devrait pas déclencher d\'erreur réelle en mode simulation', () => {
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur simulée',
        severity: 'error',
        stopStrategy: 'workflow',
        loggingOptions: {
          enableLogging: false,
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: true
      };
      
      const result = executeStopError({}, config);
      
      expect(result.stopped).toBe(false);
      expect(result.errorThrown).toBe(false);
      expect(result.errorMessage).toBe('Erreur simulée');
    });
  });
  
  // Tests pour les options de journalisation
  describe('Options de journalisation', () => {
    test('Devrait activer la journalisation si demandé', () => {
      // Utiliser vi de Vitest au lieu de jest
      const originalConsoleError = console.error;
      let errorCalled = false;
      
      // Remplacer console.error par une fonction mock
      console.error = () => {
        errorCalled = true;
      };
      
      const config: StopErrorExecutionConfig = {
        errorMessage: 'Erreur journalisée',
        severity: 'error',
        stopStrategy: 'block',
        loggingOptions: {
          enableLogging: true,
          logDestination: 'console',
          includeTimestamp: false,
          includeStackTrace: false
        },
        simulationMode: false
      };
      
      const result = executeStopError({}, config);
      
      expect(result.errorThrown).toBe(true);
      expect(result.stats?.errorLogged).toBe(true);
      expect(errorCalled).toBe(true);
      
      // Restaurer la fonction originale
      console.error = originalConsoleError;
    });
  });
});

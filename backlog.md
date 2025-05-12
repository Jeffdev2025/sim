# Backlog des Blocs à Développer pour Sim Studio

## Priorités

- **P0** : MVP - Fonctionnalités essentielles
- **P1** : Important - Fonctionnalités à implémenter rapidement après le MVP
- **P2** : Souhaitable - Fonctionnalités qui apportent une valeur significative
- **P3** : Optionnel - Fonctionnalités qui peuvent être implémentées plus tard

## Complexité

- **C1** : Simple (1-2 jours)
- **C2** : Modéré (3-5 jours)
- **C3** : Complexe (1-2 semaines)
- **C4** : Très complexe (2+ semaines)
- **C5** : Projet majeur (1+ mois)

## Blocs de Traitement de Données

| ID    | Nom                  | Description                                                      | Priorité | Complexité | Dépendances | État |
|-------|----------------------|------------------------------------------------------------------|----------|------------|-------------|-------|
| F001  | Transformer          | Modifie la structure des données avec des opérations personnalisées | P0 | C3 | - | ✅ Terminé |
| F002  | Filter               | Filtre les données selon des critères définis                    | P0 | C2 | - | ✅ Terminé |
| F003  | Aggregator           | Regroupe des données provenant de plusieurs sources              | P1 | C3 | - |
| F004  | Splitter             | Divise un flux de données en plusieurs branches                  | P1 | C2 | - | ✅ Terminé |
| F005  | Mapper               | Fait correspondre des champs entre différentes structures        | P0 | C3 | - | ✅ Terminé |
| F006  | Sort                 | Trie les données selon des critères spécifiés                    | P1 | C2 | - | - |
| F007  | Rename Keys          | Met à jour les noms de champs d'un objet                         | P1 | C1 | - | - |
| F008  | Date & Time          | Manipule des valeurs de date et d'heure                          | P1 | C2 | - | - |
| F009  | Remove Duplicates    | Supprime les éléments avec des valeurs en double                 | P2 | C2 | - | - |
| F010  | Summarize            | Calcule des statistiques sur des collections de données          | P2 | C3 | - | - |

## Blocs de Contrôle de Flux

| ID    | Nom                  | Description                                                      | Priorité | Complexité | Dépendances | État |
|-------|----------------------|------------------------------------------------------------------|----------|------------|-------------|-------|
| F011  | Switch               | Dirige le flux selon plusieurs conditions                        | P0 | C2 | - | ✅ Terminé |
| F012  | Merge                | Fusionne plusieurs flux en un seul                               | P0 | C3 | - | 🔔 À faire |
| F013  | Switch Enhanced      | Version améliorée du bloc Switch avec fonctionnalités avancées      | P0 | C3 | - | ✅ Terminé |
| F014  | Parallel             | Exécute plusieurs actions en parallèle                           | P1 | C4 | - | 🔔 À faire |
| F015  | Webhook              | Reçoit des données via un point d'entrée HTTP                    | P1 | C3 | - | 🔔 À faire |
| F016  | Scheduler            | Planifie des tâches récurrentes                                  | P1 | C3 | - | 🔔 À faire |
| F017  | If                   | Dirige les éléments vers différentes branches (vrai/faux)        | P0 | C2 | - | 🔔 À faire |
| F018  | Loop                 | Exécute une séquence d'actions sur chaque élément d'une liste    | P0 | C3 | - | 🔔 À faire |
| F019  | Wait                 | Ajoute un délai avant de passer à l'étape suivante               | P1 | C1 | - | 🔔 À faire |
| F020  | Stop and Error       | Déclenche une erreur et arrête le workflow                       | P1 | C1 | - | 🔔 À faire |
| F021  | Execute Sub-workflow | Exécute un sous-workflow comme composant réutilisable            | P2 | C4 | - | 🔔 À faire |

## Blocs d'Intelligence Artificielle

| ID    | Nom                  | Description                                                      | Priorité | Complexité | Dépendances | État |
|-------|----------------------|------------------------------------------------------------------|----------|------------|-------------|-------|
| F021  | AI Agent             | Génère un plan d'action et l'exécute avec des outils             | P1 | C5 | - | - |
| F022  | Text Generator       | Génère du texte avec des LLMs                                    | P0 | C3 | - | - |
| F023  | Image Generator      | Crée des images avec l'IA                                        | P1 | C3 | - | - |
| F024  | Sentiment Analysis   | Analyse le sentiment d'un texte                                  | P2 | C2 | - | - |
| F025  | Entity Extraction    | Extrait des entités nommées d'un texte                           | P2 | C3 | - | - |
| F026  | Document Parser      | Extrait des données structurées de documents                     | P1 | C4 | - | - |
| F027  | Summarizer           | Résume automatiquement des textes                                | P1 | C3 | - | - |
| F028  | Text Classifier      | Classifie un texte selon des catégories distinctes               | P2 | C3 | - | - |
| F029  | Text Splitter        | Décompose un texte en parties plus petites                       | P1 | C2 | - | - |
| F030  | Embeddings           | Transforme du texte en représentations vectorielles              | P0 | C3 | - | - |
| F031  | Vector Store         | Gère le stockage et la récupération de vecteurs                  | P1 | C4 | F030 | - |
| F032  | RAG Chain            | Implémente un système de génération augmentée par récupération   | P1 | C4 | F030, F031 | - |

## Blocs d'Interaction Utilisateur

| ID    | Nom                  | Description                                                      | Priorité | Complexité | Dépendances | État |
|-------|----------------------|------------------------------------------------------------------|----------|------------|-------------|-------|
| F033  | Form                 | Collecte des données via un formulaire                           | P1 | C3 | - | - |
| F034  | Notification         | Envoie des alertes aux utilisateurs                              | P1 | C2 | - | - |
| F035  | Chat Interface       | Interface de conversation pour les interactions                  | P1 | C4 | - | - |
| F036  | Modal                | Fenêtre contextuelle pour les interactions                       | P2 | C2 | - | - |
| F037  | Email Sender         | Envoie des emails et attend les réponses                         | P1 | C3 | - | - |
| F038  | Slack Integration    | Interaction avec Slack pour les workflows                        | P2 | C3 | - | - |
| F039  | Discord Integration  | Interaction avec Discord pour les workflows                      | P2 | C3 | - | - |
| F040  | Telegram Integration | Interaction avec Telegram pour les workflows                     | P2 | C3 | - | - |

## Blocs de Conversion de Données

| ID    | Nom                  | Description                                                      | Priorité | Complexité | Dépendances |
|-------|----------------------|------------------------------------------------------------------|----------|------------|-------------|
| F041  | HTML                 | Travaille avec le contenu HTML                                   | P1 | C3 | - |
| F042  | Markdown             | Convertit des données entre Markdown et HTML                     | P1 | C2 | - |
| F043  | XML                  | Convertit des données depuis et vers XML                         | P2 | C3 | - |
| F044  | JSON                 | Manipule et transforme des données JSON                          | P0 | C2 | - |
| F045  | CSV                  | Manipule et transforme des données CSV                           | P1 | C2 | - |
| F046  | Extract from File    | Convertit des données binaires en JSON                           | P1 | C3 | - |
| F047  | Convert to File      | Convertit des données JSON en données binaires                   | P1 | C3 | - |
| F048  | Edit Image           | Modifie une image (flou, redimensionnement, etc.)                | P2 | C3 | - |
| F049  | Crypto               | Fournit des utilitaires cryptographiques                         | P2 | C3 | - |
| F050  | Compression          | Compresse et décompresse des fichiers                            | P2 | C2 | - |

## Plan d'Implémentation

### Phase 1 - MVP (P0)
- Blocs de traitement de données essentiels (Transformer, Filter, Mapper)
- Blocs de contrôle de flux de base (Switch, Merge, If, Loop)
- Blocs d'IA fondamentaux (Text Generator, Embeddings)
- Manipulation JSON

### Phase 2 - Extension (P1)
- Blocs de traitement avancés (Aggregator, Splitter, Sort, Date & Time)
- Contrôle de flux supplémentaire (Parallel, Webhook, Scheduler, Wait)
- Blocs d'IA avancés (Image Generator, Document Parser, Summarizer, Vector Store, RAG Chain)
- Interaction utilisateur (Form, Notification, Chat Interface, Email Sender)
- Conversion de données (HTML, Markdown, CSV, Extract/Convert File)

### Phase 3 - Enrichissement (P2+)
- Fonctionnalités spécialisées (Remove Duplicates, Summarize)
- Intégrations tierces (Slack, Discord, Telegram)
- Blocs d'IA spécialisés (Sentiment Analysis, Entity Extraction, Text Classifier)
- Conversion avancée (XML, Edit Image, Crypto, Compression)
- Fonctionnalités avancées (Execute Sub-workflow)

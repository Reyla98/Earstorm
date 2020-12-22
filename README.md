# Lancement du serveur

Dans l'invite de commande accéder au répertoire du projet.
Pour lancer le serveur avec une base de données contenant des exemples, entrez la commande:

    node server.js

Pour lancer le serveur avec une base de données vide, ajoutez l'argument 'empty':

    node server.js empty
		

# Réaliser les tests

Dans une première fenêtre d'invite de commande, lancez le serveur.
Attention, les tests requièrent d'utiliser le protocole http.
Pour cela ajoutez l'argument 'http' à la ligne de commande.

    node server.js http empty

NB:Les tests peuvent être réalisés sur la base de données vide comme celle contenant des exemples. L'argument empty est donc facultatif.


# Supprimer les utilisateurs et les playlists de test

Les tests créent des utilisateurs et des playlists qui peuvent encombrer notre base de données.
Pour supprimer ces données indésirables, il faut sortir des commentaires les lignes 39 et 40 du fichier server.js et lancer le serveur avec la base de données désirée.


# Remarques diverses

- Nous avons remarqué que la base de données MongoDB Atlas n'est pas accessible depuis le réseau UCLouvain
- Sur l'un de nos ordinateurs, le bouton "play" et le défilement automatique des chansons ne fonctionnaient pas sur firefox.
  Cela fonctionnait chez les autres personnes de notre groupe, cela doit donc être un bug indépendant de notre site.

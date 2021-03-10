# BackEnd-EmporioLambda-PoC

## Requisiti

Serve l'ultima versione di Node.js, che vi installerà il comando `npm` e JRE 8+

## Installazione

Installazione del Serverless framework:

```
npm install -g serverless
```

Verranno chieste le credenziali (Access Key Id e Secret Access Key) per AWS, sono su discord nel canale #resources. In caso non vengano chieste, usare il comando:

```
serverless config credentials -o --provider aws --key key --secret secret
```

Cloning della repo:

```
git clone https://github.com/OmicronSwe/EmporioLambda-BE.git
```

e spostarsi dentro la cartella.

Installazione dipendenze:

```
npm install
sls dynamodb install
```

## Sviluppo

Per creare una nuova funzione, con relativo file per test di unita', usare:

```
sls create function -f nomeFunzione --handler functions/nomeFunzione/handler.nomeFunzione
```

Verrà creata una cartella all'interno della cartella `functions` con il nome della funzione, e al suo interno il file `handler.js` con il codice della funzione.
Non vogliamo usare JavaScript, quindi dovete cambiare l'estensione in `.ts`.

Verrà inoltre creato nella cartella `test` un file `nomeFunzione.js` per eseguire i test di unità per quella specifica funzione.
Anche qui, cambiare estensione in `.ts`. Bisogna inoltre spostare il seguente blocco di codice dentro la funzione `describe`:

```
const mochaPlugin = require('serverless-mocha-plugin');
const expect = mochaPlugin.chai.expect;
const wrapped = mochaPlugin.getWrapper('nomeFunzione', '/functions/nomeFunzione/handler.ts', 'nomeFunzione');
```

Anche in questo blocco di codice, cambiare il path da `.js` a `.ts`.

Tutto ciò non basta, perchè in `serverless.yml` (il file che serve per fare i deploy) viene creata automaticamente la riga per la funzione AWS Lambda, ma non per l'API Gateway. Aggiungere:

```
events:
   - http:
       path: nomeFunzione
       method: GET #(oppure POST)
```

come negli altri esempi proposti.

Oppure è possibile creare tutto manualmente, anche senza i test di unità.

## Analisi statica

Viene fornita l'analisi statica di Prettier e ESLint

Prettier:

```
npm run prettier-check      #controlla lo stile del codice
npm run prettify            #aggiusta automaticamente lo stile del codice
```

Nella Github Action viene usato `prettier-check`, quindi se non controllate (o non mettete a posto automaticamente con `prettify`), ve lo rifiuta.

ESLint:

```
npm run lint
```

## Test

E' possibile creare il file di test automaticamente insieme alla funzione (come spiegato prima).

Con `sls create test -f nomeFunzione` si crea (nello stesso modo) un test per una funzione già creata (manualmente).

Con `npm runt test` è possibile runnare i test. Con il parametro `-f nomeFunzione` è possibile runnare tutti i test specifici di una funzione.

Con `npm runt coverage` è possibile runnare i test e visualizzazare il coverage report.

## Deploy

Useremo 3 enviroment per lo sviluppo:

- `staging` : Tutto ciò che viene pushato in `master`, prodotto finito.
- `test` : Tutto ciò che viene pushato in `develop`, prodotto che può essere testato liberamente dagli sviluppatori.
- `local` : Tutto ciò che viene pushato in branch diversi da develop e master, ma anche in locale dagli sviluppatori, per lo sviluppo effettivo del prodotto dalle macchine proprie.

Quindi, mentre i deploy di staging e test sono automatici, per sviluppare useremo l'enviroment local.

Per deployare nell'enviroment local, usare:

```
sls deploy -s local                       #(tutte le funzioni)
sls deploy -s local -f nomeFunzione       #(unica funzione)
```

# 🧠 Rede Neural JavaScript

Esta é uma conversão direta da implementação de rede neural em C++ para JavaScript, mantendo exatamente a mesma lógica e funcionalidades.

## 📁 Arquivos

- **`RedeNeural.js`** - Classe principal da rede neural com backpropagation
- **`AlgoritmoGenetico.js`** - Algoritmo genético para evolução de redes neurais
- **`FuncoesAuxiliares.js`** - Funções utilitárias
- **`exemplo_uso.html`** - Página de exemplo com testes interativos
- **`README.md`** - Este arquivo

## 🚀 Como Usar

### Em uma página HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Minha Rede Neural</title>
</head>
<body>
    <!-- Incluir os arquivos -->
    <script src="FuncoesAuxiliares.js"></script>
    <script src="RedeNeural.js"></script>
    <script src="AlgoritmoGenetico.js"></script>
    
    <script>
        // Criar uma rede neural: 2 entradas, 1 camada escondida com 4 neurônios, 1 saída
        const rede = new RedeNeural(1, 2, 4, 1);
        
        // Usar a rede
        rede.copiarParaEntrada([0.5, -0.3]);
        rede.calcularSaida();
        const resultado = rede.copiarDaSaida();
        
        console.log("Resultado:", resultado);
    </script>
</body>
</html>
```

### Em Node.js:

```javascript
const { RedeNeural } = require('./RedeNeural.js');
const { AlgoritmoGenetico } = require('./AlgoritmoGenetico.js');

// Criar rede neural
const rede = new RedeNeural(1, 2, 4, 1);

// Usar a rede...
```

## 🎮 Usando em Jogos

### Exemplo para um jogo simples:

```javascript
class JogadorIA {
    constructor() {
        // Rede neural: 4 entradas (posição x,y do jogador e inimigo), 2 saídas (mover x,y)
        this.cerebro = new RedeNeural(2, 4, 8, 2);
    }
    
    decidirAcao(jogadorX, jogadorY, inimigoX, inimigoY) {
        // Normalizar entradas para [-1, 1]
        const entradas = [
            jogadorX / 800 * 2 - 1,  // Normalizar para tela 800px
            jogadorY / 600 * 2 - 1,  // Normalizar para tela 600px
            inimigoX / 800 * 2 - 1,
            inimigoY / 600 * 2 - 1
        ];
        
        this.cerebro.copiarParaEntrada(entradas);
        this.cerebro.calcularSaida();
        const saidas = this.cerebro.copiarDaSaida();
        
        return {
            moverX: saidas[0], // -1 a 1 (esquerda para direita)
            moverY: saidas[1]  // -1 a 1 (cima para baixo)
        };
    }
    
    // Para treinar com algoritmo genético
    exportarCerebro() {
        return this.cerebro.copiarCamadasParaVetor();
    }
    
    importarCerebro(pesos) {
        this.cerebro.copiarVetorParaCamadas(pesos);
    }
}

// Uso no loop do jogo
const jogador = new JogadorIA();

function loopJogo() {
    const acao = jogador.decidirAcao(player.x, player.y, enemy.x, enemy.y);
    
    // Aplicar a ação
    player.x += acao.moverX * velocidade;
    player.y += acao.moverY * velocidade;
}
```

## 🧬 Evolução com Algoritmo Genético

```javascript
// Criar população de jogadores
const populacao = new AlgoritmoGenetico(50, 2, 4, 8, 2); // 50 indivíduos
populacao.inicializarPopulacao();

// Função de avaliação (fitness)
function avaliarJogador(rede) {
    const jogador = new JogadorIA();
    jogador.importarCerebro(rede.copiarCamadasParaVetor());
    
    // Simular jogo e retornar pontuação
    return simularJogo(jogador);
}

// Evoluir por 100 gerações
for (let geracao = 0; geracao < 100; geracao++) {
    populacao.avaliarPopulacao(avaliarJogador);
    console.log(`Geração ${geracao}: Melhor fitness = ${populacao.getMelhorFitness()}`);
    populacao.evoluir();
}
```

## 🔧 API Principal

### RedeNeural

- **`new RedeNeural(camadasEscondidas, entradas, neuroniosEscondidos, saidas)`** - Construtor
- **`copiarParaEntrada(array)`** - Define as entradas
- **`calcularSaida()`** - Calcula a propagação
- **`copiarDaSaida()`** - Retorna as saídas
- **`treinar(entradas, saidasEsperadas)`** - Treina com backpropagation
- **`salvarRede(nome)`** - Salva no localStorage ou retorna dados
- **`RedeNeural.carregarRede(dados)`** - Carrega rede salva

### AlgoritmoGenetico

- **`new AlgoritmoGenetico(populacao, camadasEsc, entradas, neuroniosEsc, saidas)`** - Construtor
- **`inicializarPopulacao()`** - Cria população inicial
- **`avaliarPopulacao(funcaoFitness)`** - Avalia todos os indivíduos
- **`evoluir()`** - Executa uma geração evolutiva
- **`getMelhorFitness()`** - Retorna o melhor fitness atual

## ✨ Características Mantidas do C++

- ✅ Inicialização Xavier dos pesos
- ✅ Backpropagation completo
- ✅ Funções de ativação (tanh, sigmoid)
- ✅ Algoritmo genético com elitismo
- ✅ Mutação adaptativa
- ✅ Cálculo de novidade para diversidade
- ✅ Salvamento/carregamento de redes
- ✅ Validações de erro
- ✅ Mesma estrutura de classes

## 🎯 Exemplo Completo

Abra o arquivo `exemplo_uso.html` no seu navegador para ver exemplos funcionando:
- Teste básico da rede neural
- Treinamento XOR com backpropagation  
- Evolução com algoritmo genético

Agora você pode usar a mesma rede neural em seus jogos JavaScript! 🎮
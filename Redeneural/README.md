# Biblioteca RedeNeural

Uma biblioteca C++ para redes neurais evolutivas com algoritmo genético, otimizada para aprendizado por reforço.

## Características

### Rede Neural
- Arquitetura feedforward totalmente conectada
- Múltiplas camadas escondidas
- Função de ativação configurável
- Bias em todas as camadas
- Normalização de entradas e saídas

### Algoritmo Genético
- Elitismo adaptativo com preservação dos melhores indivíduos
- Mutação suave para preservar boas soluções
- Medida de novidade para manter diversidade
- Crossover uniforme entre indivíduos
- População adaptativa com parâmetros auto-ajustáveis
- Taxa de mutação dinâmica baseada no progresso

## Como Usar

1. **Instalação**
   ```bash
   # Copie a pasta RedeNeural para seu projeto
   cp -r RedeNeural/ seu_projeto/lib/
   ```

2. **Configuração do Projeto**
   - Adicione os arquivos .cpp ao seu projeto
   - Configure o include path para a pasta lib

3. **Includes Necessários**
   ```cpp
   #include "lib/RedeNeural/RedeNeural.hpp"
   #include "lib/RedeNeural/AlgoritmoGenetico.hpp"
   ```

4. **Exemplo de Uso**
   ```cpp
   // Criar uma rede neural
   RedeNeural rede(2,     // número de camadas escondidas
                   6,     // número de entradas
                   8,     // neurônios por camada escondida
                   4);    // número de saídas

   // Criar algoritmo genético
   AlgoritmoGenetico ag(200,  // tamanho da população
                        2,     // número de camadas escondidas
                        6,     // número de entradas
                        8,     // neurônios por camada escondida
                        4);    // número de saídas

   // Inicializar população
   ag.inicializarPopulacao();

   // Loop de evolução
   for(int geracao = 0; geracao < NUM_GERACOES; geracao++) {
       // Avaliar cada indivíduo
       ag.avaliarPopulacao([](RedeNeural& rede) {
           // Sua função de avaliação aqui
           return fitness;
       });

       // Evoluir para próxima geração
       ag.evoluir();
   }
   ```

## Estrutura de Arquivos

### Headers (.hpp)
- **RedeNeural.hpp**: Interface da rede neural
- **AlgoritmoGenetico.hpp**: Interface do algoritmo genético
- **FuncoesAuxiliares.hpp**: Funções utilitárias
- **utils.hpp**: Funções de visualização e debug

### Implementação (.cpp)
- **RedeNeural.cpp**: Implementação da rede neural
- **AlgoritmoGenetico.cpp**: Implementação do algoritmo genético
- **Neuronio.cpp**: Implementação dos neurônios
- **utils.cpp**: Implementação das funções de visualização

## Parâmetros Configuráveis

### Rede Neural
- Número de camadas escondidas
- Neurônios por camada
- Função de ativação

### Algoritmo Genético
- `NUM_ELITISMO`: Número de indivíduos elite (default: 50)
- `TAXA_NOVOS_INDIVIDUOS`: Taxa de indivíduos novos por geração (default: 0.1)
- `TAXA_MUTACAO`: Taxa de mutação base (default: 0.3)
- `INTENSIDADE_MUTACAO`: Intensidade da mutação base (default: 0.3)
- `TAXA_MUTACAO_SUAVE`: Taxa para mutação suave (default: 0.1)
- `INTENSIDADE_MUTACAO_SUAVE`: Intensidade da mutação suave (default: 0.1)

## Dependências

- C++11 ou superior
- STL (Standard Template Library)
- Para visualização (utils.cpp):
  - raylib

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes. 
/**
 * @file AlgoritmoGenetico.hpp
 * @brief Implementação de um algoritmo genético para evolução de redes neurais
 * 
 * Este arquivo contém a implementação de um algoritmo genético especializado
 * para evoluir redes neurais feedforward. Inclui características como:
 * - Elitismo adaptativo
 * - Mutação suave para preservar boas soluções
 * - Medida de novidade para manter diversidade
 * - Crossover entre indivíduos
 * - Parâmetros adaptativos baseados no progresso da evolução
 */

#pragma once
#include "RedeNeural.hpp"
#include "FuncoesAuxiliares.hpp"
#include <vector>
#include <algorithm>
#include <random>
#include <functional>

class AlgoritmoGenetico {
public:
    /**
     * @brief Estrutura que representa um indivíduo na população
     */
    struct Individuo {
        RedeNeural rede;      ///< Rede neural do indivíduo
        double fitness;       ///< Valor de aptidão do indivíduo
        double novidade;      ///< Medida de quão diferente este indivíduo é dos outros
        
        Individuo(int numCamadasEscondidas, int numEntradas, 
                 int numNeuroniosEscondidos, int numSaidas) 
            : rede(numCamadasEscondidas, numEntradas, 
                  numNeuroniosEscondidos, numSaidas), 
              fitness(0.0),
              novidade(0.0) {}
    };

    // Constantes do algoritmo genético
    static constexpr double TAXA_MUTACAO_PADRAO = 0.3;
    static constexpr double INTENSIDADE_MUTACAO_PADRAO = 0.3;
    static constexpr double TAXA_CROSSOVER_PADRAO = 0.7;
    static constexpr int NUM_ELITISMO = 50;
    static constexpr double TAXA_NOVOS_INDIVIDUOS = 0.1;
    static constexpr double TAXA_MUTACAO_SUAVE = 0.1;
    static constexpr double INTENSIDADE_MUTACAO_SUAVE = 0.1;

    /**
     * @brief Construtor do algoritmo genético
     */
    AlgoritmoGenetico(int tamPopulacao, 
                     int numCamadasEscondidas,
                     int numEntradas,
                     int numNeuroniosEscondidos,
                     int numSaidas)
        : populacao(),
          tamanhoPopulacao(tamPopulacao),
          numCamadasEscondidas(numCamadasEscondidas),
          numEntradas(numEntradas),
          numNeuroniosEscondidos(numNeuroniosEscondidos),
          numSaidas(numSaidas),
          geracoesSemMelhoria(0),
          melhorFitnessAnterior(0.0),
          TAXA_MUTACAO(TAXA_MUTACAO_PADRAO),
          INTENSIDADE_MUTACAO(INTENSIDADE_MUTACAO_PADRAO),
          TAXA_CROSSOVER(TAXA_CROSSOVER_PADRAO) {}

    // Métodos públicos principais
    void inicializarPopulacao();
    void avaliarPopulacao(const std::function<double(RedeNeural&)>& funcaoAvaliacao);
    void evoluir();

    // Getters e setters
    Individuo& getIndividuo(size_t index) { return populacao[index]; }
    void setIndividuoFitness(size_t index, double fitness) { populacao[index].fitness = fitness; }
    size_t getTamanhoPopulacao() const { return populacao.size(); }
    double getMelhorFitness() const;
    double getMediaFitness() const;

private:
    // Atributos da população
    std::vector<Individuo> populacao;
    int tamanhoPopulacao;
    int numCamadasEscondidas;
    int numEntradas;
    int numNeuroniosEscondidos;
    int numSaidas;

    // Controle de evolução
    int geracoesSemMelhoria;
    double melhorFitnessAnterior;
    
    // Parâmetros adaptativos
    double TAXA_MUTACAO;
    double INTENSIDADE_MUTACAO;
    double TAXA_CROSSOVER;

    // Métodos privados de evolução
    void ajustarParametros();
    void calcularNovidade();
    std::vector<Individuo> selecionarElite();
    Individuo& selecaoTorneio();
    void mutacao(std::vector<double>& pesos);
    void mutacaoSuave(std::vector<double>& pesos);
    void crossover(const std::vector<double>& pesos1, 
                  const std::vector<double>& pesos2,
                  std::vector<double>& filho1,
                  std::vector<double>& filho2);
}; 
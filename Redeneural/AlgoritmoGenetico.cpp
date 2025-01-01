/**
 * @file AlgoritmoGenetico.cpp
 * @brief Implementação dos métodos da classe AlgoritmoGenetico
 */

#include "AlgoritmoGenetico.hpp"

void AlgoritmoGenetico::inicializarPopulacao() {
    populacao.clear();
    for(int i = 0; i < tamanhoPopulacao; i++) {
        populacao.emplace_back(numCamadasEscondidas, numEntradas, 
                             numNeuroniosEscondidos, numSaidas);
    }
}

void AlgoritmoGenetico::avaliarPopulacao(const std::function<double(RedeNeural&)>& funcaoAvaliacao) {
    for(auto& individuo : populacao) {
        individuo.fitness = funcaoAvaliacao(individuo.rede);
    }
    calcularNovidade();
}

void AlgoritmoGenetico::evoluir() {
    // Verifica se houve melhoria
    double melhorFitnessAtual = getMelhorFitness();
    if(melhorFitnessAtual <= melhorFitnessAnterior) {
        geracoesSemMelhoria++;
    } else {
        geracoesSemMelhoria = 0;
        melhorFitnessAnterior = melhorFitnessAtual;
    }

    // Ajusta parâmetros baseado no progresso
    ajustarParametros();

    std::vector<Individuo> novaPopulacao;
    
    // Elitismo - mantém os melhores indivíduos e cria cópias mutadas deles
    std::vector<Individuo> elite = selecionarElite();
    
    // Adiciona os elitistas originais
    novaPopulacao.insert(novaPopulacao.end(), elite.begin(), elite.end());
    
    // Cria cópias mutadas dos elitistas
    for(const auto& elitista : elite) {
        std::vector<double> genes;
        elitista.rede.copiarCamadasParaVetor(genes);
        
        // Aplica uma mutação mais suave nas cópias dos elitistas
        mutacaoSuave(genes);
        
        Individuo copiaElitista(numCamadasEscondidas, numEntradas, 
                              numNeuroniosEscondidos, numSaidas);
        copiaElitista.rede.copiarVetorParaCamadas(genes);
        novaPopulacao.push_back(copiaElitista);
    }
    
    // Adiciona alguns indivíduos completamente novos para manter diversidade
    int numNovos = tamanhoPopulacao * TAXA_NOVOS_INDIVIDUOS;
    for(int i = 0; i < numNovos; i++) {
        novaPopulacao.emplace_back(numCamadasEscondidas, numEntradas, 
                                 numNeuroniosEscondidos, numSaidas);
    }
    
    // Preenche o resto da população com crossover e mutação
    while(novaPopulacao.size() < tamanhoPopulacao) {
        Individuo pai1 = selecaoTorneio();
        Individuo pai2 = selecaoTorneio();
        
        std::vector<double> genes1, genes2;
        pai1.rede.copiarCamadasParaVetor(genes1);
        pai2.rede.copiarCamadasParaVetor(genes2);
        
        std::vector<double> filho1 = genes1;
        std::vector<double> filho2 = genes2;
        
        // Crossover
        if(std::rand() / (float)RAND_MAX < TAXA_CROSSOVER) {
            crossover(genes1, genes2, filho1, filho2);
        }
        
        // Mutação adaptativa
        mutacao(filho1);
        mutacao(filho2);
        
        // Cria novos indivíduos
        Individuo novoInd1(numCamadasEscondidas, numEntradas, 
                         numNeuroniosEscondidos, numSaidas);
        Individuo novoInd2(numCamadasEscondidas, numEntradas, 
                         numNeuroniosEscondidos, numSaidas);
        
        novoInd1.rede.copiarVetorParaCamadas(filho1);
        novoInd2.rede.copiarVetorParaCamadas(filho2);
        
        novaPopulacao.push_back(novoInd1);
        if(novaPopulacao.size() < tamanhoPopulacao) {
            novaPopulacao.push_back(novoInd2);
        }
    }
    
    populacao = std::move(novaPopulacao);
}

double AlgoritmoGenetico::getMelhorFitness() const {
    double melhor = -1e9;
    for(const auto& ind : populacao) {
        melhor = std::max(melhor, ind.fitness);
    }
    return melhor;
}

double AlgoritmoGenetico::getMediaFitness() const {
    double soma = 0;
    for(const auto& ind : populacao) {
        soma += ind.fitness;
    }
    return soma / populacao.size();
}

void AlgoritmoGenetico::ajustarParametros() {
    // Aumenta a taxa e intensidade de mutação se ficar estagnado
    if(geracoesSemMelhoria > 5) {
        TAXA_MUTACAO = std::min(0.8, TAXA_MUTACAO * 1.5);
        INTENSIDADE_MUTACAO = std::min(0.8, INTENSIDADE_MUTACAO * 1.5);
    } else {
        TAXA_MUTACAO = TAXA_MUTACAO_PADRAO;
        INTENSIDADE_MUTACAO = INTENSIDADE_MUTACAO_PADRAO;
    }
}

void AlgoritmoGenetico::calcularNovidade() {
    for(auto& ind1 : populacao) {
        double somaDistancias = 0;
        std::vector<double> genes1;
        ind1.rede.copiarCamadasParaVetor(genes1);
        
        for(const auto& ind2 : populacao) {
            if(&ind1 != &ind2) {
                std::vector<double> genes2;
                ind2.rede.copiarCamadasParaVetor(genes2);
                
                // Calcula distância euclidiana entre os genes
                double distancia = 0;
                for(size_t i = 0; i < genes1.size(); i++) {
                    double diff = genes1[i] - genes2[i];
                    distancia += diff * diff;
                }
                somaDistancias += std::sqrt(distancia);
            }
        }
        ind1.novidade = somaDistancias / (populacao.size() - 1);
    }
}

std::vector<AlgoritmoGenetico::Individuo> AlgoritmoGenetico::selecionarElite() {
    std::vector<Individuo> elite;
    std::vector<Individuo*> candidatos;
    
    // Cria ponteiros para todos os indivíduos
    for(auto& ind : populacao) {
        candidatos.push_back(&ind);
    }
    
    // Ordena por fitness e novidade
    std::sort(candidatos.begin(), candidatos.end(),
             [](const Individuo* a, const Individuo* b) {
                 return (a->fitness * 0.7 + a->novidade * 0.3) >
                        (b->fitness * 0.7 + b->novidade * 0.3);
             });
    
    // Seleciona os melhores
    for(int i = 0; i < NUM_ELITISMO && i < candidatos.size(); i++) {
        elite.push_back(*candidatos[i]);
    }
    
    return elite;
}

AlgoritmoGenetico::Individuo& AlgoritmoGenetico::selecaoTorneio() {
    const int TAMANHO_TORNEIO = 5;
    std::vector<Individuo*> torneio;
    
    // Seleciona indivíduos aleatórios para o torneio
    for(int i = 0; i < TAMANHO_TORNEIO; i++) {
        int idx = std::rand() % populacao.size();
        torneio.push_back(&populacao[idx]);
    }
    
    // Encontra o melhor do torneio considerando fitness e novidade
    auto melhor = std::max_element(torneio.begin(), torneio.end(),
        [](const Individuo* a, const Individuo* b) {
            return (a->fitness * 0.7 + a->novidade * 0.3) <
                   (b->fitness * 0.7 + b->novidade * 0.3);
        });
    
    return **melhor;
}

void AlgoritmoGenetico::mutacao(std::vector<double>& pesos) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<> d(0, INTENSIDADE_MUTACAO);
    
    for(double& peso : pesos) {
        if(std::rand() / (float)RAND_MAX < TAXA_MUTACAO) {
            peso += d(gen);
        }
    }
}

void AlgoritmoGenetico::mutacaoSuave(std::vector<double>& pesos) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<> d(0, INTENSIDADE_MUTACAO_SUAVE);
    
    for(double& peso : pesos) {
        if(std::rand() / (float)RAND_MAX < TAXA_MUTACAO_SUAVE) {
            peso += d(gen);
        }
    }
}

void AlgoritmoGenetico::crossover(const std::vector<double>& pesos1, 
                                const std::vector<double>& pesos2,
                                std::vector<double>& filho1,
                                std::vector<double>& filho2) {
    for(size_t i = 0; i < pesos1.size(); i++) {
        if(std::rand() / (float)RAND_MAX < 0.5) {
            filho1[i] = pesos2[i];
            filho2[i] = pesos1[i];
        }
    }
} 
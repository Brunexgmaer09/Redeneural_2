#include "RedeNeural.hpp"
#include <random>

Neuronio::Neuronio(int quantidadeLigacoes) : erro(0), saida(0) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dis(-1.0, 1.0);  // Mudando para distribuição uniforme com range maior
    
    pesos.resize(quantidadeLigacoes);
    for(auto& peso : pesos) {
        peso = dis(gen) * std::sqrt(2.0 / quantidadeLigacoes); // Inicialização Xavier
    }
}

Camada::Camada(int quantidadeNeuronios, int quantidadeLigacoes) {
    neuronios.reserve(quantidadeNeuronios);
    for(int i = 0; i < quantidadeNeuronios; i++) {
        neuronios.emplace_back(quantidadeLigacoes);
    }
} 
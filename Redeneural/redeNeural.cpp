#include "RedeNeural.hpp"
#include <cmath>
#include <fstream>

RedeNeural::RedeNeural(int quantidadeEscondidas, 
                       int qtdNeuroniosEntrada, 
                       int qtdNeuroniosEscondida, 
                       int qtdNeuroniosSaida)
    : camadaEntrada(qtdNeuroniosEntrada, 0),
      camadaSaida(qtdNeuroniosSaida, qtdNeuroniosEscondida)
{
    // Inicializa camadas escondidas
    for(int i = 0; i < quantidadeEscondidas; i++) {
        int entradasCamada = (i == 0) ? qtdNeuroniosEntrada : qtdNeuroniosEscondida;
        camadasEscondidas.emplace_back(qtdNeuroniosEscondida, entradasCamada);
    }
}

void RedeNeural::calcularSaida() {
    // Propaga valores da entrada para primeira camada escondida
    for(int i = 0; i < camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
        double soma = 0;
        for(int j = 0; j < camadaEntrada.getQuantidadeNeuronios(); j++) {
            soma += camadaEntrada.getNeuronio(j).getSaida() * 
                    camadasEscondidas[0].getNeuronio(i).getPeso(j);
        }
        camadasEscondidas[0].getNeuronio(i).setSaida(tanh(soma));
    }
    
    // Propaga entre camadas escondidas
    for(size_t c = 1; c < camadasEscondidas.size(); c++) {
        for(int i = 0; i < camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
            double soma = 0;
            for(int j = 0; j < camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                soma += camadasEscondidas[c-1].getNeuronio(j).getSaida() * 
                        camadasEscondidas[c].getNeuronio(i).getPeso(j);
            }
            camadasEscondidas[c].getNeuronio(i).setSaida(tanh(soma));
        }
    }
    
    // Propaga para camada de saída
    for(int i = 0; i < camadaSaida.getQuantidadeNeuronios(); i++) {
        double soma = 0;
        for(int j = 0; j < camadasEscondidas.back().getQuantidadeNeuronios(); j++) {
            soma += camadasEscondidas.back().getNeuronio(j).getSaida() * 
                    camadaSaida.getNeuronio(i).getPeso(j);
        }
        camadaSaida.getNeuronio(i).setSaida(sigmoid(soma));
    }
}

void RedeNeural::copiarParaEntrada(const std::vector<double>& vetorEntrada) {
    for(size_t i = 0; i < vetorEntrada.size() && i < (size_t)camadaEntrada.getQuantidadeNeuronios(); i++) {
        camadaEntrada.getNeuronio(i).setSaida(vetorEntrada[i]);
    }
}

void RedeNeural::copiarDaSaida(std::vector<double>& vetorSaida) {
    vetorSaida.clear();
    for(int i = 0; i < camadaSaida.getQuantidadeNeuronios(); i++) {
        vetorSaida.push_back(camadaSaida.getNeuronio(i).getSaida());
    }
}

double RedeNeural::sigmoid(double x) {
    return 1.0 / (1.0 + std::exp(-x));
}

double RedeNeural::relu(double x) {
    return x > 0 ? x : x * 0.01; // Leaky ReLU (não usado mais)
}

int RedeNeural::getQuantidadePesos() const {
    int total = 0;
    
    // Pesos da primeira camada escondida
    total += camadasEscondidas[0].getQuantidadeNeuronios() * 
             camadaEntrada.getQuantidadeNeuronios();
    
    // Pesos entre camadas escondidas
    for(size_t i = 1; i < camadasEscondidas.size(); i++) {
        total += camadasEscondidas[i].getQuantidadeNeuronios() * 
                 camadasEscondidas[i-1].getQuantidadeNeuronios();
    }
    
    // Pesos da camada de saída
    total += camadaSaida.getQuantidadeNeuronios() * 
             camadasEscondidas.back().getQuantidadeNeuronios();
    
    return total;
}

void RedeNeural::copiarVetorParaCamadas(const std::vector<double>& vetor) {
    size_t pos = 0;
    
    // Copia para primeira camada escondida
    for(int i = 0; i < camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
        for(int j = 0; j < camadaEntrada.getQuantidadeNeuronios(); j++) {
            if(pos < vetor.size()) {
                camadasEscondidas[0].getNeuronio(i).setPeso(j, vetor[pos++]);
            }
        }
    }
    
    // Copia entre camadas escondidas
    for(size_t c = 1; c < camadasEscondidas.size(); c++) {
        for(int i = 0; i < camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
            for(int j = 0; j < camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                if(pos < vetor.size()) {
                    camadasEscondidas[c].getNeuronio(i).setPeso(j, vetor[pos++]);
                }
            }
        }
    }
    
    // Copia para camada de saída
    for(int i = 0; i < camadaSaida.getQuantidadeNeuronios(); i++) {
        for(int j = 0; j < camadasEscondidas.back().getQuantidadeNeuronios(); j++) {
            if(pos < vetor.size()) {
                camadaSaida.getNeuronio(i).setPeso(j, vetor[pos++]);
            }
        }
    }
}

void RedeNeural::copiarCamadasParaVetor(std::vector<double>& vetor) const {
    vetor.clear();
    
    // Copia da primeira camada escondida
    for(int i = 0; i < camadasEscondidas[0].getQuantidadeNeuronios(); i++) {
        for(int j = 0; j < camadaEntrada.getQuantidadeNeuronios(); j++) {
            vetor.push_back(camadasEscondidas[0].getNeuronio(i).getPeso(j));
        }
    }
    
    // Copia entre camadas escondidas
    for(size_t c = 1; c < camadasEscondidas.size(); c++) {
        for(int i = 0; i < camadasEscondidas[c].getQuantidadeNeuronios(); i++) {
            for(int j = 0; j < camadasEscondidas[c-1].getQuantidadeNeuronios(); j++) {
                vetor.push_back(camadasEscondidas[c].getNeuronio(i).getPeso(j));
            }
        }
    }
    
    // Copia da camada de saída
    for(int i = 0; i < camadaSaida.getQuantidadeNeuronios(); i++) {
        for(int j = 0; j < camadasEscondidas.back().getQuantidadeNeuronios(); j++) {
            vetor.push_back(camadaSaida.getNeuronio(i).getPeso(j));
        }
    }
}

RedeNeural RedeNeural::carregarRede(const std::string& nomeArquivo) {
    std::ifstream arquivo(nomeArquivo, std::ios::binary);
    if(!arquivo) {
        throw std::runtime_error("Erro ao abrir arquivo para leitura");
    }
    
    int quantidadeEscondidas, qtdNeuroniosEntrada, qtdNeuroniosEscondida, qtdNeuroniosSaida;
    arquivo.read(reinterpret_cast<char*>(&quantidadeEscondidas), sizeof(int));
    arquivo.read(reinterpret_cast<char*>(&qtdNeuroniosEntrada), sizeof(int));
    arquivo.read(reinterpret_cast<char*>(&qtdNeuroniosEscondida), sizeof(int));
    arquivo.read(reinterpret_cast<char*>(&qtdNeuroniosSaida), sizeof(int));
    
    RedeNeural rede(quantidadeEscondidas, qtdNeuroniosEntrada, 
                    qtdNeuroniosEscondida, qtdNeuroniosSaida);
    
    std::vector<double> pesos;
    double peso;
    while(arquivo.read(reinterpret_cast<char*>(&peso), sizeof(double))) {
        pesos.push_back(peso);
    }
    
    rede.copiarVetorParaCamadas(pesos);
    return rede;
}

void RedeNeural::salvarRede(const std::string& nomeArquivo) const {
    std::ofstream arquivo(nomeArquivo, std::ios::binary);
    if(!arquivo) {
        throw std::runtime_error("Erro ao abrir arquivo para escrita");
    }
    
    int quantidadeEscondidas = camadasEscondidas.size();
    int qtdNeuroniosEntrada = camadaEntrada.getQuantidadeNeuronios();
    int qtdNeuroniosEscondida = camadasEscondidas[0].getQuantidadeNeuronios();
    int qtdNeuroniosSaida = camadaSaida.getQuantidadeNeuronios();
    
    arquivo.write(reinterpret_cast<const char*>(&quantidadeEscondidas), sizeof(int));
    arquivo.write(reinterpret_cast<const char*>(&qtdNeuroniosEntrada), sizeof(int));
    arquivo.write(reinterpret_cast<const char*>(&qtdNeuroniosEscondida), sizeof(int));
    arquivo.write(reinterpret_cast<const char*>(&qtdNeuroniosSaida), sizeof(int));
    
    std::vector<double> pesos;
    copiarCamadasParaVetor(pesos);
    
    for(double peso : pesos) {
        arquivo.write(reinterpret_cast<const char*>(&peso), sizeof(double));
    }
}
